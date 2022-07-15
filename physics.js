import * as controls from './controls.js';

let truckEntity;

export function init(newTruck) {
  truckEntity = newTruck;
}

export function update() {
  let leftRight = controls.right - controls.left;
  let upDown = controls.down - controls.up;
  let forwardBackward = controls.forward - controls.backward;

  let position = truckEntity.position.getValue(truckEntity.now());
  position.x += leftRight;
  position.y += upDown;
  position.z += forwardBackward;
  truckEntity.position = new Cesium.ConstantPositionProperty(position);
}
