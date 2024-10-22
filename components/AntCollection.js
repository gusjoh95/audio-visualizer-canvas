"use strict";
import globals from "../globals.js";
import { dataArray } from "../audioHandler.js";
class Ant {
  constructor(x, y, width, height, size = .5) {
    this.x = globals.getRandomXCord();
    this.y = globals.getRandomYCord();
    this.baseSize = size;
    this.width = width;
    this.height = height;
  }
  render(base = 2, tremble = 2, rgbString) {
    this.updateXY(base, tremble);
    globals.ctx.fillStyle = globals.getRGBstringCycle();
    globals.ctx.fillRect(
      this.x - (tremble * this.baseSize) / 2,
      this.y - (tremble * this.baseSize) / 2,
      tremble * this.baseSize,
      tremble * this.baseSize
    );
    globals.ctx.fillStyle = "black";
    globals.ctx.fillRect(
      1 + this.x - (tremble * this.baseSize) / 2,
      1 + this.y - (tremble * this.baseSize) / 2,
      +tremble * this.baseSize - 2,
      +tremble * this.baseSize - 2
    );
  }

  updateXY(base, tremble) {
    const antMove = .02;
    var min = -base * antMove;
    var max = base * antMove;
    //console.log(Math.floor(Math.random() * (+max - +min)) + +min);
    this.x += Math.round(Math.random() * (+max - +min) + +min);
    this.y += Math.round(Math.random() * (+max - +min) + +min);
    this.handleOutOfBounds();
  }

  handleOutOfBounds() {
    if (this.x < -20) {
      this.x = globals.CE.width;
    }
    if (this.y < -20) {
      this.y = globals.CE.height;
    }
    if (this.x > globals.CE.width + 20) {
      this.x = 0;
    }
    if (this.y > globals.CE.height + 20) {
      this.y = 0;
    }
  }
}

export default class AntCollection {
  constructor(amount = 10){
    this.ants = [];
    for (let i = 0; i < amount; i++) {
      this.ants[i] = new Ant(50, 50, 10, 10);
    }
  }
  render(){
    this.ants.forEach(ant => {
      ant.render((dataArray[0] + dataArray[5]) / 2, (dataArray[15] + dataArray[25]) / 2);
    });
  }
};
