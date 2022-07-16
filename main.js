import * as cesium from './cesium.js';
import * as physics from './physics.js';

Ammo().then(function (AmmoLib) {
	Ammo = AmmoLib;
	init();
  animate();
});

function init() {
  cesium.init();
	setTimeout(function() {
	  physics.init(cesium.truckEntity);
		cesium.getPhysicsFunctions(physics.createTerrain, physics.removeTerrain);
	}, 10 * 1000);
}

let start, previousTimeStamp;
function animate(timestamp) {
  if (start === undefined) {start = timestamp;}
  const elapsed = timestamp - start;

  cesium.update();
  physics.update(elapsed);

  previousTimeStamp = timestamp;
  window.requestAnimationFrame(animate);
}
