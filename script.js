"use strict";

class squaredImage {
	constructor(x, y, width, height, imgIndex = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.imgIndex = imgIndex;
	}
	render(base, tremble) {
		this.updateXY(base, tremble);
		ctx.drawImage(faces[this.imgIndex], this.x - base / 2, this.y - tremble / 2, base, tremble);

	}
	updateXY(base, tremble) {
		this.x += Math.floor(Math.random() * (+1 - +-2)) + +-1;
		this.y += Math.floor(Math.random() * (+1 - +-2)) + +-1;
	}
}

var antSize = .2;
var antMove = .02;
class Ant {
	constructor(x, y, width, height, size = 0.5) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	render(base, tremble, rgbString) {
		this.updateXY(base, tremble);
		ctx.fillStyle = rgbString;
		ctx.fillRect(this.x - tremble * antSize / 2, this.y - tremble * antSize / 2, tremble * antSize, tremble * antSize);
		ctx.fillStyle = "black";
		ctx.fillRect(1 + this.x - tremble * antSize / 2, 1 + this.y - tremble * antSize / 2, +tremble * antSize - 2, +tremble * antSize - 2);
	}
	updateXY(base, tremble) {
		var min = -base * antMove;
		var max = base * antMove;
		//console.log(Math.floor(Math.random() * (+max - +min)) + +min); 
		this.x += Math.round(Math.random() * (+max - +min) + +min);
		this.y += Math.round(Math.random() * (+max - +min) + +min);
		this.handleOutOfBounds();
	}

	handleOutOfBounds() {
		if (this.x < -20) {
			this.x = CE.width;
		}
		if (this.y < -20) {
			this.y = CE.height;
		}
		if (this.x > CE.width + 20) {
			this.x = 0;
		}
		if (this.y > CE.height + 20) {
			this.y = 0;
		}
	}
}

class Spectrogram {
	constructor(canvasEl, canvasContext) {
		this.ctx = canvasContext;
		this.eachcell = canvasEl.width / dataArray.length;
		this.cellY = canvasEl.height / 2;
		//console.log(this.ctx);
	}
	render(color = "#ffffff") {
		//console.log(this.ctx);
		this.ctx.fillStyle = color;
		//console.log(this.eachcell);
		for (var i = 0; i < dataArray.length; i++) {
			this.ctx.fillRect(this.eachcell * i, this.cellY - dataArray[i] * 2, this.eachcell + 1, dataArray[i] * 4);
		}
	}
}

class Timeinfo {
	constructor() {
		this.ocr = 0;
		this.oneSec = performance.now();
		this.timestampString = "";
		this.msElapsedLastTs = "";

	}
	render(color = "#ffffff") {
		++this.ocr;
		this.msElapsedLastTs = Math.round(performance.now() - this.oneSec);
		if (this.msElapsedLastTs >= 250) {
			this.timestampString = "FPS: " + ((this.ocr / this.msElapsedLastTs) * 1000).toPrecision(4);
			//console.log(this.timestampString);
			this.ocr = 0;
			this.oneSec = performance.now();
		}
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, 100, 35)
		ctx.fillStyle = color;
		ctx.font = "12px Arial";
		ctx.fillText(this.timestampString, 10, 20);

	}
}

class OverlayCanvas {
	constructor(w, h) {
		this.ilCE = document.querySelector("#inlineSpectro");
		this.ilCTX = this.ilCE.getContext("2d");
		this.ilCE.width = w;
		this.ilCE.height = h;
		this.specc = new Spectrogram(this.ilCE, this.ilCTX);
	}
	render(color = "#ffffff") {
		this.ilCTX.clearRect(0, 0, this.ilCE.width, this.ilCE.height)
		this.ilCTX.fillStyle = color;
		this.specc.render();
	}
}

//GLOBAL VARIABLES
var audioCTX;
var audioSRC;
var analyser;
var dataArray;
var loudness;

var CE = document.querySelector("#canvasElement");
//https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
var ctx = CE.getContext("2d", { alpha: false });
var faces;

window.addEventListener("resize", setCanvasSize);

window.addEventListener("load", function () {
	console.log("Window loaded");
	faces = document.querySelectorAll(".face");
	this.document.querySelector("#getUserGesture").addEventListener("click", function handler(e) {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
			document.querySelector("#onLoadOverlay").style.display = "none";
			e.target.removeEventListener("click", handler);
			createAudioListener(stream);
		})
			.catch(function (err) {
				console.log("ERROR:" + err);
				//createAudioListener(document.querySelector("#audioPlayer"));
			});
	});
	document.addEventListener("keyup", function (e) {
		//E.keycode is depricated – to be replaced with: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
		console.log(e.keyCode);
		if (e.keyCode == 32 || e.keyCode == 27 || e.keyCode == 17) {
			//Shows customisation overlay
			toggleOverlay();
		}
	});
	var allSliders = document.querySelectorAll(".slider");
	for (var i = 0; i < allSliders.length; i++) {
		allSliders[i].addEventListener("input", handleSliderInput);
	}
	var allCheckboxes = document.querySelectorAll(".checkbox");
	for (var i = 0; i < allCheckboxes.length; i++) {
		allCheckboxes[i].addEventListener("change", handleCheckboxInput);
	}
});

function createAudioListener(streamOrRef) {
	audioCTX = new (window.AudioContext || window.webkitAudioContext)();
	audioSRC = audioCTX.createMediaStreamSource(streamOrRef);
	analyser = audioCTX.createAnalyser();
	analyser.minDecibels = -80;
	analyser.maxDecibels = 0;
	analyser.smoothingTimeConstant = .5;
	audioSRC.connect(analyser);
	analyser.fftSize = 2048;
	//analyser.frequencyBinCount;

	dataArray = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(dataArray);
	//setInterval(logAudioLevels, 500);
	setCanvasSize();
	window.requestAnimationFrame(renderCanvas);
}

function handleSliderInput(e) {
	switch (e.currentTarget.id) {
		case "amount":
			objectAmount = e.currentTarget.value;
			instantiateObjects();
			break;
		case "antSize":
			antSize = e.currentTarget.value;
			break;
		case "smoothingTime":
			analyser.smoothingTimeConstant = e.currentTarget.value;
			break;
		case "colorIntensity":
			rgbMultiplier = e.currentTarget.value;
			break;
		case "analyserArrayMaxLength":
			var temp = Math.ceil(analyser.frequencyBinCount - analyser.frequencyBinCount / 101 * e.currentTarget.value);
			//Does not average the input values, only changes length; i.e. frequencies to the right of the waveforms are more (or less) visible
			console.log("Setting audio array max-length to: " + temp);
			dataArray = new Uint8Array(temp);
			instantiateObjects();
			break;
		case "analyserFrequencies":
			//https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
			//"A higher value will result in more details in the frequency domain but fewer details in the time domain."
			//Must be: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384 or 32768. Defaults to 2048.
			analyser.fftSize = Math.pow(2, e.currentTarget.value);
			dataArray = new Uint8Array(analyser.frequencyBinCount);
			console.log("Frequency sample size: " + analyser.fftSize);
			instantiateObjects();
			break;
		case "minDecibelThreshold":
			analyser.minDecibels = e.currentTarget.value - 100;
			console.log("Decibel threshold to analyse: " + (analyser.minDecibels + 100));
			break;
	}
}
function handleCheckboxInput(e) {


	switch (e.currentTarget.name) {
		case "ro1":
			RO1 = e.currentTarget.checked;
			break;
		case "ro2":
			RO2 = e.currentTarget.checked;
			break;
		case "ro3":
			RO3 = e.currentTarget.checked;
			break;
		case "ro4":
			RO4 = e.currentTarget.checked;
			break;
	}
}

var rgbMultiplier = .0;
var onceFlag = true;


var RO1 = false;
var RO2 = false;
//Background
var RO3 = true;
//Spectro
var RO4 = true;
var RO5 = false;

function renderCanvas() {

	analyser.getByteFrequencyData(dataArray);
	var rgbString = getRGBstringAudio();
	var rgbStringCycle = getRGBstringCycle();
	if (onceFlag) {
		renderBackground(rgbString);
		onceFlag = false;
	}

	if (RO3) {
		renderBackground(rgbString);
	}
	if (RO1) {
		squaredImages.forEach(function (o) {
			o.render((dataArray[0] + dataArray[5]), (dataArray[15] + dataArray[25]));
		});
	}
	if (RO2) {
		ants.forEach(function (a) {
			a.render((dataArray[0] + dataArray[5]) / 2, (dataArray[15] + dataArray[25]) / 2, rgbStringCycle);
		});
	}
	if (RO4) {
		spectro.render();
	}
	if (RO5) {
		overlaycanvas.render();
	}
	window.requestAnimationFrame(renderCanvas);
	timeinfo.render();
}


function renderBackground(rgbString) {
	//console.log(r + " " + g + " " +b);
	ctx.fillStyle = rgbString;
	ctx.fillRect(0, 0, CE.width, CE.height);
}



function logAudioLevels() {
	analyser.getByteFrequencyData(dataArray);
	console.log("AudioLevels: " + dataArray[0] + " " + dataArray[5] + " " + dataArray[15] + " " + dataArray[25]);
	console.log(getRGBstringAudio());
	getRGBstringCycle();
}



function setCanvasSize() {
	CE.width = window.innerWidth;
	CE.height = window.innerHeight;
	instantiateObjects();
}

function toggleOverlay() {
	if (document.querySelector("#optionOverlay").style.zIndex > 0) {
		document.querySelector("#optionOverlay").style.zIndex = "-10";
		document.querySelector("#inlineSpectro").style.zIndex = "-10";
		RO5 = false;

	} else {
		document.querySelector("#optionOverlay").style.zIndex = "10";
		document.querySelector("#inlineSpectro").style.zIndex = "10";
		RO5 = true;
	}
}


function getRGBstringAudio() {
	var dataArrayLength = dataArray.length;
	var low = Math.floor(dataArrayLength / 5);
	var med = Math.floor(dataArrayLength / 3)
	var high = Math.floor(dataArrayLength / 2)
	var r = dataArray[low];
	var g = dataArray[med];
	var b = dataArray[high];
	//console.log("rgb("+r*rgbMultiplier+","+g*rgbMultiplier+","+b*rgbMultiplier +")");
	return "rgb(" + r * rgbMultiplier + "," + g * rgbMultiplier + "," + b * rgbMultiplier + ")";
}

const colorBoxCycle = document.querySelector("#colorBox");
function getRGBstringCycle() {
	return window.getComputedStyle(colorBoxCycle).getPropertyValue('background-color');

}

var objectAmount = 10;
var squaredImages = new Array();
var ants = new Array();
var spectro;
var timeinfo;
var overlaycanvas;

function instantiateObjects() {
	squaredImages.length = 0;
	ants.length = 0;
	for (var i = 0; i < objectAmount; i++) {
		squaredImages[i] = new squaredImage(Math.random() * CE.width, Math.random() * CE.height, 1, 1, i % faces.length);
		ants[i] = new Ant(Math.random() * CE.width, Math.random() * CE.height, 1, 1);
	}
	spectro = new Spectrogram(CE, ctx);
	timeinfo = new Timeinfo();
	onceFlag = true;
	overlaycanvas = new OverlayCanvas(1500, 250);
}
