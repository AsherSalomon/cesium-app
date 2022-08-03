
let truckEntities, viewer;
let position, quaternion;

export function init(newTruck, newViewer) {
  truckEntities = newTruck;
  viewer = newViewer;

  // position = truckEntities[0].position.getValue(truckEntities.now());
  // quaternion = truckEntities[0].orientation.getValue(truckEntities.now());

}

export function update(delta) {

  // for (let i = 0; i < 4; i++) {
  //   truckEntities[i + 1].position = position;
  //   truckEntities[i + 1].orientation = quaternion;
  // }
  // truckEntities[0].position = position;
  // truckEntities[0].orientation = quaternion;

}

class PhysicalObject {
  constructor(entity, mass) {
    this.entity = entity;
    // this.position = new Cesium.Cartesian3();
    // this.orientation = new Cesium.Quaternion(0, 0, 0, 1);

    this.position = entity.position.getValue(viewer.clock.currentTime);
    this.velocity = new Cesium.Cartesian3();
    this.forceSum = new Cesium.Cartesian3();
    this.mass = mass;

    this.orientation = entity.orientation.getValue(viewer.clock.currentTime);
    this.angularVelocity = new Cesium.Cartesian3();
    this.torqueSum = new Cesium.Cartesian3();
    this.momentOfInertia = new Cesium.Matrix3();
  }

  update() {
    Cesium.Cartesian3.add(this.position, this.velocity, this.position);
    Cesium.Cartesian3.divideByScalar(this.forceSum, this.mass, this.forceSum);
    Cesium.Cartesian3.add(this.velocity, this.forceSum, this.velocity);
    this.entity.position = this.position;

    const rotationAngle = this.angularVelocity.magnitude();
    const rotationAxis = this.angularVelocity.clone();
    Cesium.Cartesian3.normalize(rotationAxis, rotationAxis);
    const rotation = new Cesium.Quaternion.fromAxisAngle(axis, angle, result)
    Cesium.Quaternion.add(this.orientation, this.angularVelocity, this.orientation);
    this.entity.orientation = this.quaternion;
  }

}
