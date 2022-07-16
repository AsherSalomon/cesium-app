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

// https://github.com/kripken/ammo.js/blob/main/examples/webgl_demo_vehicle/index.html
// https://stackoverflow.com/questions/59665854/ammo-js-custom-mesh-collision-with-sphere
