
// https://github.com/kripken/ammo.js/blob/main/examples/webgl_demo_vehicle/index.html

// import * as controls from './controls.js';

let truckEntities;
const terrainBodies = {};
let originOffset;

// - Global variables -
const DISABLE_DEACTIVATION = 4;

let gravityOn = false;

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
	"KeyD":'right'
};

export function init(newTruck) {
  truckEntities = newTruck;

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

export function update(delta) {
  // const leftRight = controls.right - controls.left;
  // const upDown = controls.down - controls.up;
  // const forwardBackward = controls.forward - controls.backward;

  // const position = truckEntities[0].position.getValue(truckEntities.now());
  // // position.x += leftRight;
  // // position.y += upDown;
  // // position.z += forwardBackward;
  // // position.x = ;
  // // position.y = ;
  // // position.z = ;
  // truckEntities[0].position = new Cesium.ConstantPositionProperty(position);
  //
  // const quaternion = truckEntities[0].orientation.getValue(truckEntities.now());
  // // quaternion.x = ;
  // // quaternion.y = ;
  // // quaternion.z = ;
  // // quaternion.w = ;
  // truckEntities[0].orientation = new Cesium.ConstantPositionProperty(quaternion);

	// physicsWorld.setGravity( new Ammo.btVector3( 0, -9.82, 0 ) );

  if (gravityOn) {
    const position = truckEntities[0].position.getValue(truckEntities.now());
    const normal = new Ammo.btVector3(position.x, position.y, position.z);
    normal.normalize();
    normal.op_mul(-9.82);
    physicsWorld.setGravity( normal );
  } else {
  	physicsWorld.setGravity( new Ammo.btVector3(0, 0, 0) );
  }

	for (let i = 0; i < syncList.length; i++) { syncList[i](delta); }
	physicsWorld.stepSimulation( delta, 10 );

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
  if (e.code == 'KeyE') {
    getIdentityQuaternionAtLatLon();
  }
}

function getIdentityQuaternionAtLatLon() {
  let initPosition = [-71.303343, 44.269824, 1916.7 - 34.9];
  const position = Cesium.Cartesian3.fromDegrees(
    initPosition[0],
    initPosition[1],
    initPosition[2]
  );
  const heading = Cesium.Math.toRadians(54);
  const pitch = 0;
  const roll = 0;
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );
  console.log(orientation);
  // return ;
}

function createObjects() {
  const position = truckEntities[0].position.getValue(truckEntities.now());
  const quaternion = truckEntities[0].orientation.getValue(truckEntities.now());
	createVehicle(position, quaternion);

}

function createVehicle(pos, quat) {

	// Vehicle contants

	const chassisWidth = 2.032;
	const chassisHeight = .6;
	const chassisLength = 6.761;
	const massVehicle = 3787.5;

	const wheelAxisPositionBack = -2.07;
	const wheelRadiusBack = 0.432;
	const wheelWidthBack = 0.245;
	const wheelHalfTrackBack = 0.8;
	const wheelAxisHeightBack = 0.5;

	const wheelAxisFrontPosition = 1.46;
	const wheelHalfTrackFront = 0.8;
	const wheelAxisHeightFront = 0.5;
	const wheelRadiusFront = 0.432;
	const wheelWidthFront = 0.245;

	const friction = 1000;
	const suspensionStiffness = 20.0;
	const suspensionDamping = 2.3;
	const suspensionCompression = 4.4;
	const suspensionRestLength = 0.6;
	const rollInfluence = 0.2;

	const steeringIncrement = .04;
	const steeringClamp = .5;
	const maxEngineForce = 2000;
	const maxBreakingForce = 100;

	// Chassis
	const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));

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
	// transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

	const motionState = new Ammo.btDefaultMotionState(transform);
	const localInertia = new Ammo.btVector3(0, 0, 0);
	geometry.calculateLocalInertia(massVehicle, localInertia);
	const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
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

		// wheelMeshes[index] = createWheelMesh(radius, width);
	}

	addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
	addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
	addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
	addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

	// Sync keybord actions and physics and graphics
	function sync(dt) {

		const speed = vehicle.getCurrentSpeedKmHour();

    // const bodyV = body.getLinearVelocity();
    // console.log(bodyV.x(), bodyV.y(), bodyV.z());

		breakingForce = 0;
		engineForce = 0;

		if (actions.acceleration) {
			if (speed < -1)
				breakingForce = maxBreakingForce;
			else engineForce = maxEngineForce;
		}
		if (actions.braking) {
			if (speed > 1)
				breakingForce = maxBreakingForce;
			else engineForce = -maxEngineForce / 2;
		}
		if (actions.left) {
			if (vehicleSteering < steeringClamp)
				vehicleSteering += steeringIncrement;
		}
		else {
			if (actions.right) {
				if (vehicleSteering > -steeringClamp)
					vehicleSteering -= steeringIncrement;
			}
			else {
				if (vehicleSteering < -steeringIncrement)
					vehicleSteering += steeringIncrement;
				else {
					if (vehicleSteering > steeringIncrement)
						vehicleSteering -= steeringIncrement;
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

		let tm, p, q, i;
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

    const position = new Cesium.Cartesian3(p.x(), p.y(), p.z());
    Cesium.Cartesian3.add(position, originOffset, position);
    truckEntities[0].position = position;

    const quaternion = new Cesium.Quaternion(q.x(), q.y(), q.z(), q.w());
    const quaternionB = new Cesium.Quaternion(0, 0, 0, 1);
    Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, -Math.PI / 2, quaternionB);
    Cesium.Quaternion.multiply(quaternion, quaternionB, quaternion);
    Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, Math.PI, quaternionB);
    Cesium.Quaternion.multiply(quaternion, quaternionB, quaternion);
    truckEntities[0].orientation = quaternion;

  }

	syncList.push(sync);

}

export function createTerrain(positions, indices, tileName) {
  // gravityOn = true;

  // https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere
  const mesh = new Ammo.btTriangleMesh();
  const vertices = new Array(positions.length);
  for (let i = 0; i < positions.length; i++) {
    Cesium.Cartesian3.subtract(positions[i], originOffset, positions[i]);
    vertices[i] = new Ammo.btVector3(positions[i].x, positions[i].y, positions[i].z);
  }
  const indicesLength = indices.length;
  for (let i = 0; i < indicesLength; i += 3) {
    mesh.addTriangle(
      vertices[indices[i]],
      vertices[indices[i + 1]],
      vertices[indices[i + 2]]
    );
  }
  // high poly count causes
  // "Uncaught RuntimeError: abort(OOM). Build with -s ASSERTIONS=1 for more info."
  // "at FB.addTriangle"
  // https://forum.playcanvas.com/t/solved-ammo-script-error-abort-oom/13465
  // try to lower polly count.

	const transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(0, 0, 0));
	transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
	const motionState = new Ammo.btDefaultMotionState(transform);

  const shape = new Ammo.btBvhTriangleMeshShape(mesh, true);
  const localInertia = new Ammo.btVector3(0, 0, 0);
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
  const terrainBody = new Ammo.btRigidBody(rbInfo);

  terrainBodies[tileName] = terrainBody;
  physicsWorld.addRigidBody(terrainBody);

}

export function removeTerrain(tileName) {
  physicsWorld.removeRigidBody(terrainBodies[tileName]);
  delete terrainBodies[tileName];

}
