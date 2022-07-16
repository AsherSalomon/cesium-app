
// https://github.com/kripken/ammo.js/blob/main/examples/webgl_demo_vehicle/index.html

import * as controls from './controls.js';

let truckEntity;
const terrainBodies = {};

// Physics variables
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let physicsWorld;

export function init(newTruck) {
  truckEntity = newTruck;

	// Physics configuration
	collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );

  createObjects();

}

export function update(elapsed) {
  const leftRight = controls.right - controls.left;
  const upDown = controls.down - controls.up;
  const forwardBackward = controls.forward - controls.backward;

  const position = truckEntity.position.getValue(truckEntity.now());
  position.x += leftRight;
  position.y += upDown;
  position.z += forwardBackward;
  truckEntity.position = new Cesium.ConstantPositionProperty(position);

  const orientation = truckEntity.orientation.getValue(truckEntity.now());

	// physicsWorld.setGravity( new Ammo.btVector3( 0, -9.82, 0 ) );

	physicsWorld.stepSimulation( elapsed, 10 );

}

function createObjects() {
  const position = truckEntity.position.getValue(truckEntity.now());
  const orientation = truckEntity.orientation.getValue(truckEntity.now());
  console.log(orientation);
	// createVehicle(position, ZERO_QUATERNION);

}

function createVehicle(pos, quat) {

	// Vehicle contants

	const chassisWidth = 1.8;
	const chassisHeight = .6;
	const chassisLength = 4;
	const massVehicle = 800;

	const wheelAxisPositionBack = -1;
	const wheelRadiusBack = .4;
	const wheelWidthBack = .3;
	const wheelHalfTrackBack = 1;
	const wheelAxisHeightBack = .3;

	const wheelAxisFrontPosition = 1.7;
	const wheelHalfTrackFront = 1;
	const wheelAxisHeightFront = .3;
	const wheelRadiusFront = .35;
	const wheelWidthFront = .2;

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
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

	// Raycast Vehicle
	let engineForce = 0;
	let vehicleSteering = 0;
	let breakingForce = 0;
	const tuning = new Ammo.btVehicleTuning();
	const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
	const vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
	physicsWorld.addAction(vehicle);

}

export function createTerrain(positions, indices, tileName) {
  // https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere
  const mesh = new Ammo.btTriangleMesh();
  const vertices = new Array(positions.length);
  for (let i = 0; i < positions.length; i++) {
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
	transform.setOrigin(new Ammo.btVector3());
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
