
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

class PhysicalEntity {
  constructor(entity, mass) {
    this.entity = entity;
    // this.position = new Cesium.Cartesian3();
    // this.orientation = new Cesium.Quaternion(0, 0, 0, 1);

    this.mass = mass;
    this.forceSum = new Cesium.Cartesian3();
    this.velocity = new Cesium.Cartesian3();
    this.position = entity.position.getValue(viewer.clock.currentTime);

    this.momentOfInertia = new Cesium.Matrix3();
    this.inverseMomentOfInertia = new Cesium.Matrix3();
    Cesium.Matrix3.inverse(this.momentOfInertia, this.inverseMomentOfInertia);
    this.torqueSum = new Cesium.Cartesian3();
    this.angularVelocity = new Cesium.Cartesian3();
    this.orientation = entity.orientation.getValue(viewer.clock.currentTime);
    this.orientationMatrix = new Cesium.Matrix3();
    this.inverseOrientationMatrix = new Cesium.Matrix3();
  }

  update(delta) {
    const forceSum = this.forceSum.clone();
    Cesium.Cartesian3.multiplyByScalar(forceSum, delta / this.mass, forceSum);
    Cesium.Cartesian3.add(this.velocity, forceSum, this.velocity);

    const velocity = this.velocity.clone();
    Cesium.Cartesian3.multiplyByScalar(velocity, delta, velocity);
    Cesium.Cartesian3.add(this.position, velocity, this.position);

    this.entity.position = this.position;


    Cesium.Matrix3.fromQuaternion(this.orientation, this.orientationMatrix);
    Cesium.Matrix3.inverse(this.orientationMatrix, this.inverseOrientationMatrix);

    const torqueSum = this.torqueSum.clone();
    Cesium.Cartesian3.multiplyByScalar(torqueSum, delta, torqueSum);
    Cesium.Matrix3.multiplyByVector(this.inverseOrientationMatrix, torqueSum, torqueSum);
    Cesium.Matrix3.multiplyByVector(this.inverseMomentOfInertia, torqueSum, torqueSum);
    Cesium.Matrix3.multiplyByVector(this.orientationMatrix, torqueSum, torqueSum);
    Cesium.Cartesian3.add(this.angularVelocity, torqueSum, this.angularVelocity);

    const rotationAngle = this.angularVelocity.magnitude() * delta;
    const rotationAxis = this.angularVelocity.clone();
    Cesium.Cartesian3.normalize(rotationAxis, rotationAxis);
    const rotation = new Cesium.Quaternion.fromAxisAngle(axis, angle, result);
    Cesium.Quaternion.add(this.orientation, rotation, this.orientation);

    this.entity.orientation = this.quaternion;
  }

  set momentOfInertiaCuboid(w, h, d) {
    this.momentOfInertia = new Cesium.Matrix3(
      column0Row0, column1Row0, column2Row0,
      column0Row1, column1Row1, column2Row1,
      column0Row2, column1Row2, column2Row2
    );
    Cesium.Matrix3.inverse(this.momentOfInertia, this.inverseMomentOfInertia);
  }

  set momentOfInertiaCylinder(r, h) {
    this.momentOfInertia = new Cesium.Matrix3(
      column0Row0, column1Row0, column2Row0,
      column0Row1, column1Row1, column2Row1,
      column0Row2, column1Row2, column2Row2
    );
    Cesium.Matrix3.inverse(this.momentOfInertia, this.inverseMomentOfInertia);
  }

}

// https://gamedev.stackexchange.com/questions/140860/transform-inertia-tensor-using-quaternion
// https://gamedev.stackexchange.com/questions/121021/is-adding-quaternions-a-useful-operation
// https://www.euclideanspace.com/physics/dynamics/collision/threed/index.htm
