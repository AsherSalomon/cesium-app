import * as controls from './controls.js';

export function init() {
}
export function update() {
  let leftRight = controls.left - controls.right;
  let upDown = controls.up - controls.down;
  let forwardBackward = controls.forward - controls.backward;
  console.log(leftRight, upDown, forwardBackward);
}
