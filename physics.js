let truck;

// // Heightfield parameters
// const terrainWidthExtents = 100;
// const terrainDepthExtents = 100;
// const terrainWidth = 128;
// const terrainDepth = 128;
// const terrainHalfWidth = terrainWidth / 2;
// const terrainHalfDepth = terrainDepth / 2;
// const terrainMaxHeight = 8;
// const terrainMinHeight = - 2;
//
// // Graphics variables
// let container, stats;
// let camera, scene, renderer;
// let terrainMesh;
// const clock = new THREE.Clock();
//
// // Physics variables
// let collisionConfiguration;
// let dispatcher;
// let broadphase;
// let solver;
// let physicsWorld;
// const dynamicObjects = [];
// let transformAux1;
//
// let heightData = null;
// let ammoHeightData = null;
//
// let time = 0;
// const objectTimePeriod = 3;
// let timeNextSpawn = time + objectTimePeriod;
// const maxNumObjects = 30;

export function init( newTruck ) {
  truck = newTruck;

  // heightData = generateHeight( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight );

	// // Physics configuration
  //
	// collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	// dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	// broadphase = new Ammo.btDbvtBroadphase();
	// solver = new Ammo.btSequentialImpulseConstraintSolver();
	// physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
	// physicsWorld.setGravity( new Ammo.btVector3( 0, - 6, 0 ) );
  //
	// // Create the terrain body
  //
	// const groundShape = createTerrainShape();
	// const groundTransform = new Ammo.btTransform();
	// groundTransform.setIdentity();
	// // Shifts the terrain, since bullet re-centers it on its bounding box.
	// groundTransform.setOrigin( new Ammo.btVector3( 0, ( terrainMaxHeight + terrainMinHeight ) / 2, 0 ) );
	// const groundMass = 0;
	// const groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
	// const groundMotionState = new Ammo.btDefaultMotionState( groundTransform );
	// const groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );
	// physicsWorld.addRigidBody( groundBody );
  //
	// transformAux1 = new Ammo.btTransform();

}

export function update() {

  // console.log( truck.entity.position.getValue( truck.now() ) );
  // console.log( truck.entity.orientation.getValue( truck.now() ) );

  let position = truck.entity.position.getValue( truck.now() );
  position.x += 0.001;
  truck.entity.position = new Cesium.ConstantPositionProperty( position );

  // let orientation = truck.entity.orientation.getValue( truck.now() );
  // orientation.x += 0.001;
  // truck.setOrientation( orientation );



	// physicsWorld.stepSimulation( deltaTime, 10 );
  //
	// // Update objects
	// for ( let i = 0, il = dynamicObjects.length; i < il; i ++ ) {
  //
	// 	const objThree = dynamicObjects[ i ];
	// 	const objPhys = objThree.userData.physicsBody;
	// 	const ms = objPhys.getMotionState();
	// 	if ( ms ) {
  //
	// 		ms.getWorldTransform( transformAux1 );
	// 		const p = transformAux1.getOrigin();
	// 		const q = transformAux1.getRotation();
	// 		objThree.position.set( p.x(), p.y(), p.z() );
	// 		objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
  //
	// 	}
  //
	// }

}

// function createTerrainShape() {
//
// 	// This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
// 	const heightScale = 1;
//
// 	// Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
// 	const upAxis = 1;
//
// 	// hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
// 	const hdt = 'PHY_FLOAT';
//
// 	// Set this to your needs (inverts the triangles)
// 	const flipQuadEdges = false;
//
// 	// Creates height data buffer in Ammo heap
// 	ammoHeightData = Ammo._malloc( 4 * terrainWidth * terrainDepth );
//
// 	// Copy the javascript height data array to the Ammo one.
// 	let p = 0;
// 	let p2 = 0;
//
// 	for ( let j = 0; j < terrainDepth; j ++ ) {
//
// 		for ( let i = 0; i < terrainWidth; i ++ ) {
//
// 			// write 32-bit float data to memory
// 			Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[ p ];
//
// 			p ++;
//
// 			// 4 bytes/float
// 			p2 += 4;
//
// 		}
//
// 	}
//
// 	// Creates the heightfield physics shape
// 	const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
// 		terrainWidth,
// 		terrainDepth,
// 		ammoHeightData,
// 		heightScale,
// 		terrainMinHeight,
// 		terrainMaxHeight,
// 		upAxis,
// 		hdt,
// 		flipQuadEdges
// 	);
//
// 	// Set horizontal scale
// 	const scaleX = terrainWidthExtents / ( terrainWidth - 1 );
// 	const scaleZ = terrainDepthExtents / ( terrainDepth - 1 );
// 	heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );
//
// 	heightFieldShape.setMargin( 0.05 );
//
// 	return heightFieldShape;
//
// }

// function generateObject() {
//
// 	const numTypes = 4;
// 	const objectType = Math.ceil( Math.random() * numTypes );
//
// 	let threeObject = null;
// 	let shape = null;
//
// 	const objectSize = 3;
// 	const margin = 0.05;
//
// 	let radius, height;
//
// 	switch ( objectType ) {
//
// 		case 1:
// 			// Sphere
// 			radius = 1 + Math.random() * objectSize;
// 			threeObject = new THREE.Mesh( new THREE.SphereGeometry( radius, 20, 20 ), createObjectMaterial() );
// 			shape = new Ammo.btSphereShape( radius );
// 			shape.setMargin( margin );
// 			break;
// 		case 2:
// 			// Box
// 			const sx = 1 + Math.random() * objectSize;
// 			const sy = 1 + Math.random() * objectSize;
// 			const sz = 1 + Math.random() * objectSize;
// 			threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), createObjectMaterial() );
// 			shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
// 			shape.setMargin( margin );
// 			break;
// 		case 3:
// 			// Cylinder
// 			radius = 1 + Math.random() * objectSize;
// 			height = 1 + Math.random() * objectSize;
// 			threeObject = new THREE.Mesh( new THREE.CylinderGeometry( radius, radius, height, 20, 1 ), createObjectMaterial() );
// 			shape = new Ammo.btCylinderShape( new Ammo.btVector3( radius, height * 0.5, radius ) );
// 			shape.setMargin( margin );
// 			break;
// 		default:
// 			// Cone
// 			radius = 1 + Math.random() * objectSize;
// 			height = 2 + Math.random() * objectSize;
// 			threeObject = new THREE.Mesh( new THREE.ConeGeometry( radius, height, 20, 2 ), createObjectMaterial() );
// 			shape = new Ammo.btConeShape( radius, height );
// 			break;
//
// 	}
//
// 	threeObject.position.set( ( Math.random() - 0.5 ) * terrainWidth * 0.6, terrainMaxHeight + objectSize + 2, ( Math.random() - 0.5 ) * terrainDepth * 0.6 );
//
// 	const mass = objectSize * 5;
// 	const localInertia = new Ammo.btVector3( 0, 0, 0 );
// 	shape.calculateLocalInertia( mass, localInertia );
// 	const transform = new Ammo.btTransform();
// 	transform.setIdentity();
// 	const pos = threeObject.position;
// 	transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
// 	const motionState = new Ammo.btDefaultMotionState( transform );
// 	const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
// 	const body = new Ammo.btRigidBody( rbInfo );
//
// 	threeObject.userData.physicsBody = body;
//
// 	threeObject.receiveShadow = true;
// 	threeObject.castShadow = true;
//
// 	scene.add( threeObject );
// 	dynamicObjects.push( threeObject );
//
// 	physicsWorld.addRigidBody( body );
//
// }
