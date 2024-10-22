const CE = document.querySelector("#canvasElement");
const ilCE = document.querySelector("#inlineSpectro");
const colorBoxCycle = document.querySelector("#colorBox");

export default {
  CE,
  ctx: CE.getContext("2d", { alpha: false }),
  ilCE,
  ilCTX: ilCE.getContext("2d"),
  getRGBstringCycle (){
    return window.getComputedStyle(colorBoxCycle).getPropertyValue('background-color');
  },
  getRandomXCord (){
    return Math.round(Math.random() * CE.width);
  },
  getRandomYCord (){
    return Math.round(Math.random() * CE.height);
  }
}
