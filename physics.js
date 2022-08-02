
let truckEntities, viewer;

export function init(newTruck, newViewer) {
  truckEntities = newTruck;
  viewer = newViewer;

  const position = truckEntities[0].position.getValue(truckEntities.now());
  const quaternion = truckEntities[0].orientation.getValue(truckEntities.now());

}

export function update(delta) {

  for (let i = 0; i < 4; i++) {
    truckEntities[i + 1].position = position;
    truckEntities[i + 1].orientation = quaternion;
  }
  truckEntities[0].position = position;
  truckEntities[0].orientation = quaternion;

}
