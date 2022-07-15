let contorls;
export function init( newControls ) {
  controls = newControls;
}
export function update() {
  let leftRight = controls.left - controls.right;
  let upDown = controls.up - controls.down;
  let forwardBackward = controls.forward - controls.backward;
  console.log(leftRight, upDown, forwardBackward);
}
