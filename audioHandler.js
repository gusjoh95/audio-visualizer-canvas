let analyser;
let dataArray;

let audioStreamOrReference;

export function createAudioListener(streamOrRef = audioStreamOrReference) {
  audioStreamOrReference = streamOrRef;
  const audioCTX = new (window.AudioContext || window.webkitAudioContext)();
  const audioSRC = audioCTX.createMediaStreamSource(audioStreamOrReference);
  analyser = audioCTX.createAnalyser();
  analyser.minDecibels = -80;
  analyser.maxDecibels = 0;
  analyser.smoothingTimeConstant = 0.5;
  audioSRC.connect(analyser);
  analyser.fftSize = 2048;
  //analyser.frequencyBinCount;

  dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  //setInterval(logAudioLevels, 500);
  console.log(dataArray);
}

function logAudioLevels() {
  analyser.getByteFrequencyData(dataArray);
  console.log(
    "AudioLevels: " +
      dataArray[0] +
      " " +
      dataArray[5] +
      " " +
      dataArray[15] +
      " " +
      dataArray[25]
  );
}

export function resetDataArray() {
  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

export function setDataArrayLength(length) {
  try {
    dataArray = new Uint8Array(length);
  } catch (e) {
    console.error(e);
  }
}

export function setAnalyserMinDecibels(val) {
  try {
    analyser.minDecibels = val;
  } catch (error) {
    console.error(e);
  }
}

export function setAnalyserFftSize(num) {
  try {
    analyser.fftSize = num;
  } catch (e) {
    console.error(e);
  }
}

export { analyser };
export { dataArray };
