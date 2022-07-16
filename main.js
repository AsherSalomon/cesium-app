import * as cesium from './cesium.js';
import * as physics from './physics.js';

let waitingForPhysicsInit = true;

Ammo().then(function (AmmoLib) {
	Ammo = AmmoLib;
	init();
  animate();
});

function init() {
  cesium.init();
	console.log('waiting...');
	setTimeout(function() {
		console.log('physics.init');
	  physics.init(cesium.truckEntity);
		cesium.getPhysicsFunctions(physics.createTerrain, physics.removeTerrain);
		waitingForPhysicsInit = false;
	}, 1 * 1000);
}

let start, previousTimeStamp;
function animate(timestamp) {
  if (start === undefined) {start = timestamp;}
  const elapsed = timestamp - start;

  cesium.update();
	if (waitingForPhysicsInit == false) {
  	physics.update(elapsed);
	}

  previousTimeStamp = timestamp;
  window.requestAnimationFrame(animate);
}
