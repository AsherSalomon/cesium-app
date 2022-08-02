
let truckEntities, viewer;
let position, quaternion;

export function init(newTruck, newViewer) {
  truckEntities = newTruck;
  viewer = newViewer;

  position = truckEntities[0].position.getValue(truckEntities.now());
  quaternion = truckEntities[0].orientation.getValue(truckEntities.now());

}

export function update(delta) {

  for (let i = 0; i < 4; i++) {
    truckEntities[i + 1].position = position;
    truckEntities[i + 1].orientation = quaternion;
  }
  truckEntities[0].position = position;
  truckEntities[0].orientation = quaternion;

}
