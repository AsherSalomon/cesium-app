import * as controls from './controls.js';

let truckEntity;

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
	// physicsWorld.setGravity( new Ammo.btVector3( 0, -9.82, 0 ) );
  createObjects();

}

export function update(elapsed) {
  let leftRight = controls.right - controls.left;
  let upDown = controls.down - controls.up;
  let forwardBackward = controls.forward - controls.backward;

  let position = truckEntity.position.getValue(truckEntity.now());
  position.x += leftRight;
  position.y += upDown;
  position.z += forwardBackward;
  truckEntity.position = new Cesium.ConstantPositionProperty(position);

	physicsWorld.stepSimulation( elapsed, 10 );
}

// https://github.com/kripken/ammo.js/blob/main/examples/webgl_demo_vehicle/index.html
// https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere

function createObjects() {

}
