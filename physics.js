import * as controls from './controls.js';

let truckEntity;

// Physics variables
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let physicsWorld;

const terrainBodies = {};

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
  let leftRight = controls.right - controls.left;
  let upDown = controls.down - controls.up;
  let forwardBackward = controls.forward - controls.backward;

  let position = truckEntity.position.getValue(truckEntity.now());
  position.x += leftRight;
  position.y += upDown;
  position.z += forwardBackward;
  truckEntity.position = new Cesium.ConstantPositionProperty(position);

	// physicsWorld.setGravity( new Ammo.btVector3( 0, -9.82, 0 ) );

	physicsWorld.stepSimulation( elapsed, 10 );

}

function createObjects() {

}

export function createTerrain(positions, indices, tileName) {
  // const mesh = new Ammo.btTriangleMesh(true, true);
  // const vertices = new Array(positions.length);
  // for (let i = 0; i < positions.length; i++) {
  //   vertices[i] = new Ammo.btVector3(, , );
  // }
  // for (let i = 0; i * 3 < indices.length; i++) {
  //     mesh.addTriangle(
  //         new Ammo.btVector3(vertices[indices[i * 3] * 3], vertices[indices[i * 3] * 3 + 1], vertices[indices[i * 3] * 3 + 2]),
  //         new Ammo.btVector3(vertices[indices[i * 3 + 1] * 3], vertices[indices[i * 3 + 1] * 3 + 1], vertices[indices[i * 3 + 1] * 3 + 2]),
  //         new Ammo.btVector3(vertices[indices[i * 3 + 2] * 3], vertices[indices[i * 3 + 2] * 3 + 1], vertices[indices[i * 3 + 2] * 3 + 2]),
  //         false
  //     );
  // }

  // terrainBodies[tileName] = ;

}
export function removeTerrain(tileName) {
  // physicsWorld.removeRigidBody(terrainBodies[tileName]);

}

// https://github.com/kripken/ammo.js/blob/main/examples/webgl_demo_vehicle/index.html
// https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere
