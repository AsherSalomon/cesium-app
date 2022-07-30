
// https://github.com/kripken/ammo.js/blob/main/examples/webgl_demo_vehicle/index.html

// import * as controls from './controls.js';
let viewer;

let truckEntities;
const terrainBodies = {};
let originOffset;

// - Global variables -
const DISABLE_DEACTIVATION = 4;

let gravityOn = false;
const gravity = 9.82;

let speedometer;

// Physics variables
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let physicsWorld;

const syncList = [];

// Keybord actions
const actions = {};
const keysActions = {
	"KeyW":'acceleration',
	"KeyS":'braking',
	"KeyA":'left',
	"KeyD":'right',
	"KeyR":'reset'
};
let parkingBrake = false;

export function init(newTruck, newViewer) {
  truckEntities = newTruck;
  viewer = newViewer;

	speedometer = document.getElementById( 'speedometer' );

	// Physics configuration
	collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );

  createObjects();

	window.addEventListener( 'keydown', keydown);
	window.addEventListener( 'keyup', keyup);

}

let frameCount = 0;
export function update(delta) {
  if (gravityOn) {
    const position = truckEntities[0].position.getValue(truckEntities.now());
    const normal = new Ammo.btVector3(position.x, position.y, position.z);
    normal.normalize();
    normal.op_mul(-gravity);
    physicsWorld.setGravity( normal );
  } else {
  	physicsWorld.setGravity( new Ammo.btVector3(0, 0, 0) );
  }

  frameCount++;
  if (frameCount % 1 == 0) {
  	for (let i = 0; i < syncList.length; i++) { syncList[i](delta); }
  	physicsWorld.stepSimulation(delta, 10);
  }

}

function keyup(e) {
	if(keysActions[e.code]) {
		actions[keysActions[e.code]] = false;
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
}

function keydown(e) {
	if(keysActions[e.code]) {
		actions[keysActions[e.code]] = true;
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
}

function createObjects() {
  const position = truckEntities[0].position.getValue(truckEntities.now());
  const quaternion = truckEntities[0].orientation.getValue(truckEntities.now());
	createVehicle(position, quaternion);

}

function createVehicle(pos, quat) {

	// Vehicle contants

	const chassisWidth = 2.032;
	const chassisHeight = .8;
	const chassisLength = 6.761 * 0.8;
	const massVehicle = 3787.5; // 800;

	const wheelAxisPositionBack = -2.07;
	const wheelRadiusBack = 0.35;
	const wheelWidthBack = 0.245;
	const wheelHalfTrackBack = 0.8;
	const wheelAxisHeightBack = 0.3;

	const wheelAxisFrontPosition = 1.46;
	const wheelHalfTrackFront = 0.8;
	const wheelAxisHeightFront = 0.3;
	const wheelRadiusFront = 0.35;
	const wheelWidthFront = 0.245;

	const friction = 1000;
	const suspensionStiffness = 20; // 94.7; // 20.0;
	const suspensionDamping = 2.3; // 10.9; // 2.3;
	const suspensionCompression = 4.4; // 20.8; // 4.4;
	const suspensionRestLength = 0.8;
	const rollInfluence = 0.2;

	const steeringIncrement = .2;
	const steeringClamp = .5;
	const maxEngineForce = 9468; // 2000;
	const maxBreakingForce = 236; // 50;

	// Chassis
	const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
  // const geometry = new Ammo.btSphereShape(chassisHeight);
  // const geometry = new Ammo.btCapsuleShapeZ(chassisHeight * .5, chassisLength);
  // const ch5 = chassisHeight * .5;
  // const geometry = new Ammo.btMultiSphereShape(
  //   [new Ammo.btVector3(chassisWidth * .5 - ch5, 0, chassisLength * .5 - ch5),
  //   new Ammo.btVector3(chassisWidth * .5 - ch5, 0, -(chassisLength * .5 - ch5)),
  //   new Ammo.btVector3(-(chassisWidth * .5) - ch5, 0, chassisLength * .5 - ch5),
  //   new Ammo.btVector3(-(chassisWidth * .5) - ch5, 0, -(chassisLength * .5 - ch5))],
  //   [chassisHeight * .5, chassisHeight * .5, chassisHeight * .5, chassisHeight * .5],
  //   4
  // );

	const localInertia = new Ammo.btVector3(0, 0, 0);
	geometry.calculateLocalInertia(massVehicle, localInertia);

  // const compoundShape = new Ammo.btCompoundShape();
	// const transform2 = new Ammo.btTransform();
	// transform2.setIdentity();
  // compoundShape.addChildShape(transform2, geometry);
  //
  // let transform3 = new Ammo.btTransform();
  // function addSphere(x, y, z) {
  //   const sphereShape = new Ammo.btSphereShape(chassisHeight * .5);
  // 	sphereShape.calculateLocalInertia(massVehicle / 4, localInertia);
  //   transform3 = new Ammo.btTransform();
  // 	transform3.setIdentity();
  // 	transform3.setOrigin(new Ammo.btVector3(x, y, z));
  //   compoundShape.addChildShape(transform3, sphereShape);
  // }
  // const ch5 = chassisHeight * .5;
  // addSphere(chassisWidth * .5 - ch5, 0, chassisLength * .5 - ch5);
  // addSphere(chassisWidth * .5 - ch5, 0, -(chassisLength * .5 - ch5));
  // addSphere(-(chassisWidth * .5) - ch5, 0, chassisLength * .5 - ch5);
  // addSphere(-(chassisWidth * .5) - ch5, 0, -(chassisLength * .5 - ch5));
	// const transform4 = new Ammo.btTransform();
	// transform4.setIdentity();

	const transform = new Ammo.btTransform();
	transform.setIdentity();
	// transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setOrigin(new Ammo.btVector3(0, 0, 0));
  originOffset = new Cesium.Cartesian3(pos.x, pos.y, pos.z);

  const quatB = new Cesium.Quaternion(0, 0, 0, 1);
  Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, Math.PI / 2, quatB);
  Cesium.Quaternion.multiply(quat, quatB, quat);
  Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Y, Math.PI, quatB);
  Cesium.Quaternion.multiply(quat, quatB, quat);
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	const motionState = new Ammo.btDefaultMotionState(transform);

	const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
	// const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, compoundShape, localInertia));
	body.setActivationState(DISABLE_DEACTIVATION);
	physicsWorld.addRigidBody(body);
	// var chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

	// Raycast Vehicle
	let engineForce = 0;
	let vehicleSteering = 0;
	let breakingForce = 0;
	const tuning = new Ammo.btVehicleTuning();
	const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
	const vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
	vehicle.setCoordinateSystem(0, 1, 2);
	physicsWorld.addAction(vehicle);

	// Wheels
	const FRONT_LEFT = 0;
	const FRONT_RIGHT = 1;
	const BACK_LEFT = 2;
	const BACK_RIGHT = 3;
	const wheelMeshes = [];
	const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
	const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

	function addWheel(isFront, pos, radius, width, index) {

		const wheelInfo = vehicle.addWheel(
				pos,
				wheelDirectionCS0,
				wheelAxleCS,
				suspensionRestLength,
				radius,
				tuning,
				isFront);

		wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
		wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
		wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
		wheelInfo.set_m_frictionSlip(friction);
		wheelInfo.set_m_rollInfluence(rollInfluence);

    wheelInfo.set_m_maxSuspensionForce(1000000); // improves underworld problem
    // if (index == 0) {
    //   console.log(wheelInfo.m_suspensionRestLength);
    //   console.log(wheelInfo.m_maxSuspensionTravelCm);
    //   console.log(wheelInfo.m_wheelRadius);
    //   console.log(wheelInfo.m_suspensionStiffness);
    //   console.log(wheelInfo.m_wheelsDampingCompression);
    //   console.log(wheelInfo.m_wheelsDampingRelaxation);
    //   console.log(wheelInfo.m_frictionSlip);
    //   console.log(wheelInfo.m_maxSuspensionForce);
    // }

		// wheelMeshes[index] = createWheelMesh(radius, width);
	}

	addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
	addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
	addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
	addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

	// Sync keybord actions and physics and graphics
	function sync(dt) {

		const speed = vehicle.getCurrentSpeedKmHour();

    speedometer.innerHTML = Math.abs(speed * 0.621371).toFixed(0) + ' mph';

    // const bodyV = body.getLinearVelocity();
    // console.log(bodyV.x(), bodyV.y(), bodyV.z());

		breakingForce = 0;
		engineForce = 0;

		if (actions.acceleration) {
      parkingBrake = false;
			if (speed < -1)
				breakingForce = maxBreakingForce;
			else engineForce = maxEngineForce;
		} else if (actions.braking) {
      parkingBrake = false;
			if (speed > 1)
				breakingForce = maxBreakingForce;
			else engineForce = -maxEngineForce; //  / 2
		} else if (Math.abs(speed) < 1 || parkingBrake) {
      breakingForce = maxBreakingForce;
      parkingBrake = true;
    }
    const steeringSpeed = steeringIncrement * dt / 0.0167 / Math.max(Math.abs(speed), 10);
		if (actions.left) {
			if (vehicleSteering < steeringClamp)
				vehicleSteering += steeringSpeed;
		}
		else {
			if (actions.right) {
				if (vehicleSteering > -steeringClamp)
					vehicleSteering -= steeringSpeed;
			}
			else {
				if (vehicleSteering < -steeringSpeed)
					vehicleSteering += steeringSpeed;
				else {
					if (vehicleSteering > steeringSpeed)
						vehicleSteering -= steeringSpeed;
					else {
						vehicleSteering = 0;
					}
				}
			}
		}

		vehicle.applyEngineForce(engineForce, BACK_LEFT);
		vehicle.applyEngineForce(engineForce, BACK_RIGHT);

		vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
		vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
		vehicle.setBrake(breakingForce, BACK_LEFT);
		vehicle.setBrake(breakingForce, BACK_RIGHT);

		vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
		vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

		let tm, p, q, v, i;
		const n = vehicle.getNumWheels();
		for (i = 0; i < n; i++) {
			vehicle.updateWheelTransform(i, true);
			tm = vehicle.getWheelTransformWS(i);
			p = tm.getOrigin();
			q = tm.getRotation();

      const position = new Cesium.Cartesian3(p.x(), p.y(), p.z());
      Cesium.Cartesian3.add(position, originOffset, position);
      truckEntities[i + 1].position = position;

      const quaternion = new Cesium.Quaternion(q.x(), q.y(), q.z(), q.w());
      if (i == 0 || i == 3) {
        const quaternionB = new Cesium.Quaternion(0, 0, 0, 1);
        Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Y, Math.PI, quaternionB);
        Cesium.Quaternion.multiply(quaternion, quaternionB, quaternion);
      }
      truckEntities[i + 1].orientation = quaternion;
		}

		tm = vehicle.getChassisWorldTransform();
		p = tm.getOrigin();
		q = tm.getRotation();
    v = body.getLinearVelocity();

    let position = new Cesium.Cartesian3(p.x(), p.y(), p.z());
    const velocity = new Cesium.Cartesian3(v.x(), v.y(), v.z());
    Cesium.Cartesian3.multiplyByScalar(velocity, 0.013, velocity);
    Cesium.Cartesian3.subtract(position, velocity, position);
    Cesium.Cartesian3.add(position, originOffset, position);
    truckEntities[0].position = position;
    truckEntities[5].position = position;

    let quaternion = new Cesium.Quaternion(q.x(), q.y(), q.z(), q.w());
    const quaternionB = new Cesium.Quaternion(0, 0, 0, 1);
    Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, -Math.PI / 2, quaternionB);
    Cesium.Quaternion.multiply(quaternion, quaternionB, quaternion);
    Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, Math.PI, quaternionB);
    Cesium.Quaternion.multiply(quaternion, quaternionB, quaternion);
    truckEntities[0].orientation = quaternion;
    truckEntities[5].orientation = position;

    if (actions.reset && gravityOn) {
      let aboveVehicle = new Cesium.Cartesian3(0, 1, 0);
      position = new Cesium.Cartesian3(p.x(), p.y(), p.z());
      quaternion = new Cesium.Quaternion(q.x(), q.y(), q.z(), q.w());
      const matrix3 = new Cesium.Matrix3();
      Cesium.Matrix3.fromQuaternion(quaternion, matrix3);
      Cesium.Matrix3.multiplyByVector(matrix3, aboveVehicle, aboveVehicle);
      aboveVehicle = new Ammo.btVector3(aboveVehicle.x, aboveVehicle.y, aboveVehicle.z);
      Cesium.Cartesian3.add(position, originOffset, position);
      Cesium.Cartesian3.normalize(position, position);
      const resetForce = massVehicle * gravity;
      Cesium.Cartesian3.multiplyByScalar(position, resetForce, position);
      position = new Ammo.btVector3(position.x, position.y, position.z);
      body.applyForce(position, aboveVehicle);
      Ammo.destroy(aboveVehicle);
      Ammo.destroy(position);
    }

    position = new Cesium.Cartesian3(p.x(), p.y(), p.z());
    Cesium.Cartesian3.add(position, originOffset, position);
    const terrainProvider = viewer.scene.globe.terrainProvider;
    const ellipsoid = terrainProvider.tilingScheme.projection.ellipsoid;
    const positions = [Cesium.Cartographic.fromCartesian(position, ellipsoid)];
    const promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
    Promise.resolve(promise).then(function(updatedPositions) {
      const terrainHeight = positions[0].height;
      position = new Cesium.Cartesian3(p.x(), p.y(), p.z());
      Cesium.Cartesian3.add(position, originOffset, position);
      const cartographic = Cesium.Cartographic.fromCartesian(position, ellipsoid);
      const bodyHeight = cartographic.height;
      if (bodyHeight < terrainHeight) {
        const terrainSpringRate = massVehicle * gravity * 10;
        const terrainForce = (terrainHeight - bodyHeight) * terrainSpringRate;
        Cesium.Cartesian3.normalize(position, position);
        Cesium.Cartesian3.multiplyByScalar(position, terrainForce, position);
        position = new Ammo.btVector3(position.x, position.y, position.z);
        const bodyCenter = new Cesium.Cartesian3(0, 0, 0);
        body.clearForces();
        body.applyForce(position, bodyCenter);

        // const restore = (terrainHeight - bodyHeight) * 10;
        // Cesium.Cartesian3.normalize(position, position);
        // Cesium.Cartesian3.multiplyByScalar(position, restore, position);
        // Cesium.Cartesian3.add(position, new Cesium.Cartesian3(p.x(), p.y(), p.z()), position);
        // position = new Ammo.btVector3(position.x, position.y, position.z);
        // tm.setOrigin(position);
      }
    });

  }

	syncList.push(sync);

}

class DestroyableTerrainA {
  constructor(positions, indices, skirtHeight) {
    // https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere
    this.mesh = new Ammo.btTriangleMesh(false, false);
    this.vertices = new Array(positions.length);
    for (let i = 0; i < positions.length; i++) {
      Cesium.Cartesian3.subtract(positions[i], originOffset, positions[i]);
      this.vertices[i] = new Ammo.btVector3(positions[i].x, positions[i].y, positions[i].z);
    }
    const indicesLength = indices.length;
    for (let i = 0; i < indicesLength; i += 3) {
      this.mesh.addTriangle(
        this.vertices[indices[i]],
        this.vertices[indices[i + 1]],
        this.vertices[indices[i + 2]]
      );
    }

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 0, 0));
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    this.motionState = new Ammo.btDefaultMotionState(transform);
    Ammo.destroy(transform);

    this.shape = new Ammo.btBvhTriangleMeshShape(this.mesh, true);
    this.localInertia = new Ammo.btVector3(0, 0, 0);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, this.motionState, this.shape, this.localInertia);
    this.terrainBody = new Ammo.btRigidBody(rbInfo);
    Ammo.destroy(rbInfo);

    physicsWorld.addRigidBody(this.terrainBody);

  }

  destroy() {
    physicsWorld.removeRigidBody(this.terrainBody);
    // https://github.com/kripken/ammo.js/issues/355
    Ammo.destroy(this.mesh);
    delete this.vertices;
    Ammo.destroy(this.motionState);
    Ammo.destroy(this.shape);
    Ammo.destroy(this.localInertia);
    Ammo.destroy(this.terrainBody);
  }

}

class DestroyableTerrain {
  constructor(positions, indices, skirtHeight) {
    this.shapes = new Array(indices.length / 3);
    this.vertices = new Array(positions.length);
    this.skirtices = new Array(positions.length);
    for (let i = 0; i < positions.length; i++) {
      Cesium.Cartesian3.subtract(positions[i], originOffset, positions[i]);
      this.vertices[i] = new Ammo.btVector3(positions[i].x, positions[i].y, positions[i].z);
    }
    const normal = originOffset.clone();
    Cesium.Cartesian3.normalize(normal, normal);
    Cesium.Cartesian3.multiplyByScalar(normal, skirtHeight, normal);
    for (let i = 0; i < positions.length; i++) {
      Cesium.Cartesian3.subtract(positions[i], normal, positions[i]);
      this.skirtices[i] = new Ammo.btVector3(positions[i].x, positions[i].y, positions[i].z);
    }
    for (let i = 0; i < indices.length; i += 3) {
      this.shapes[i / 3] = new Ammo.btConvexHullShape();
      for (let j = 0; j < 3; j++) {
        this.shapes[i / 3].addPoint(this.vertices[indices[i + j]]);
        this.shapes[i / 3].addPoint(this.skirtices[indices[i + j]]);
      }
    }
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 0, 0));
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    this.motionState = new Ammo.btDefaultMotionState(transform);
    Ammo.destroy(transform);
    this.localInertia = new Ammo.btVector3(0, 0, 0);

    this.terrainBodies = new Array(this.shapes.length);
    for (let i = 0; i < this.shapes.length; i++) {
      const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, this.motionState, this.shapes[i], this.localInertia);
      this.terrainBodies[i] = new Ammo.btRigidBody(rbInfo);
      Ammo.destroy(rbInfo);

      physicsWorld.addRigidBody(this.terrainBodies[i]);
    }

  }

  destroy() {
    for (let i = 0; i < this.terrainBodies.length; i++) {
      physicsWorld.removeRigidBody(this.terrainBodies[i]);
    }

    delete this.shapes;
    for (let i = 0; i < this.vertices.length; i++) {
      Ammo.destroy(this.vertices[i]);
      Ammo.destroy(this.skirtices[i]);
    }
    delete this.vertices;
    delete this.skirtices;
    for (let i = 0; i < this.shapes.length; i++) {
      Ammo.destroy(this.shapes[i]);
    }
    delete this.shapes;
    Ammo.destroy(this.motionState);
    Ammo.destroy(this.localInertia);
    delete this.motionState;
    delete this.localInertia;
    for (let i = 0; i < this.terrainBodies.length; i++) {
      Ammo.destroy(this.terrainBodies[i]);
    }
    delete this.terrainBodies;
  }

}

export function createTerrain(positions, indices, skirtHeight, tileName) {
  gravityOn = true;

  terrainBodies[tileName] = new DestroyableTerrain(positions, indices, skirtHeight);
  // console.log(Object.keys(terrainBodies).length, 'terrainBodies');

}

export function removeTerrain(tileName) {
  terrainBodies[tileName].destroy();
  delete terrainBodies[tileName];
  // console.log(Object.keys(terrainBodies).length, 'terrainBodies');

}

// use btConvexHullShape.addPoint

// the car shape could be a btBulletWorldImporter from .bullet in blender
// https://gamedev.stackexchange.com/questions/146527/build-a-convex-hull-from-a-given-mesh-in-bullet
// https://xissburg.com/post/export-bullet-from-blender/
