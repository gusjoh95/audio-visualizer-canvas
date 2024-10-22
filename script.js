"use strict";
import {createAudioListener, setAnalyserFftSize,,setDataArrayLength, resetDataArray, analyser, dataArray} from "./audioHandler.js";
import AntCollection from "./components/AntCollection.js";
import globals from "./globals.js";
//GLOBALS

var faces;
var ants;


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
		globals.ctx.drawImage(faces[this.imgIndex], this.x - base / 2, this.y - tremble / 2, base, tremble);

	}
	updateXY(base, tremble) {
		this.x += Math.floor(Math.random() * (+1 - +-2)) + +-1;
		this.y += Math.floor(Math.random() * (+1 - +-2)) + +-1;
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
		globals.ctx.fillStyle = "black";
		globals.ctx.fillRect(0, 0, 100, 35)
		globals.ctx.fillStyle = color;
		globals.ctx.font = "12px Arial";
		globals.ctx.fillText(this.timestampString, 10, 20);

	}
}

class OverlayCanvas {
	constructor(w, h) {
		this.ilCE = globals.ilCE;
		this.ilCTX = globals.ilCTX;
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


window.addEventListener("load", function () {
	console.log("Window loaded");
	faces = document.querySelectorAll(".face");
	this.document.querySelector("#getUserGesture").addEventListener("click", function handler(e) {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
			document.querySelector("#onLoadOverlay").style.display = "none";
			e.target.removeEventListener("click", handler);
			createAudioListener(stream);
      console.log(analyser);
      window.addEventListener("resize", setCanvasSize);
      setCanvasSize();
      window.requestAnimationFrame(renderCanvas);
		})
			.catch(function (err) {
				console.trace("ERROR:" + err);
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

function handleSliderInput(e) {
	switch (e.currentTarget.id) {
		case "amount":
			objectAmount = e.currentTarget.value;
			instantiateObjects();
			break;
		case "antSize":
      //TODO, not working
			antSize = e.currentTarget.value;
			break;
		case "smoothingTime":
			analyser.smoothingTimeConstant = e.currentTarget.value;
			break;
		case "colorIntensity":
			rgbMultiplier = e.currentTarget.value;
			break;
		case "analyserArrayMaxLength":
			let length = Math.ceil(analyser.frequencyBinCount - analyser.frequencyBinCount / 101 * e.currentTarget.value);
			//Does not average the input values, only changes length; i.e. frequencies to the right of the waveforms are more (or less) visible
			console.log("Setting audio array max-length to: " + length);
			setDataArrayLength(length);
			instantiateObjects();
			break;
		case "analyserFrequencies":
			//https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
			//"A higher value will result in more details in the frequency domain but fewer details in the time domain."
			//Must be: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384 or 32768. Defaults to 2048.
			setAnalyserFftSize(Math.pow(2, e.currentTarget.value));
      resetDataArray();
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
    ants.render();
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
	globals.ctx.fillStyle = rgbString;
	globals.ctx.fillRect(0, 0, globals.CE.width, globals.CE.height);
}

function setCanvasSize() {
	globals.CE.width = window.innerWidth;
	globals.CE.height = window.innerHeight;
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
var squaredImages = [];
var spectro;
var timeinfo;
var overlaycanvas;

function instantiateObjects() {
	squaredImages.length = 0;
	for (var i = 0; i < objectAmount; i++) {
		squaredImages[i] = new squaredImage(Math.random() * globals.CE.width, Math.random() * globals.CE.height, 1, 1, i % faces.length);
	}
  ants = new AntCollection(objectAmount);
	spectro = new Spectrogram(globals.CE, globals.ctx);
	timeinfo = new Timeinfo();
	onceFlag = true;
	overlaycanvas = new OverlayCanvas(1500, 250);
}
