import * as controls from './controls.js';

export function init() {
}
export function update() {
  let rightLeft = controls.right - controls.left;
  let upDown = controls.up - controls.down;
  let forwardBackward = controls.forward - controls.backward;
  console.log(rightLeft, forwardBackward, upDown);
}
