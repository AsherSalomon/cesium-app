import * as cesium from './cesium.js';
import * as physics from './physics.js';

let start, previousTimeStamp;

init();
animate();

function init() {
  cesium.init();
	physics.init(cesium.truckEntities, cesium.viewer);
}

function animate(timestamp) {
  if (start === undefined) {start = timestamp;}
	const delta = (timestamp - previousTimeStamp) / 1000;
  previousTimeStamp = timestamp;

  cesium.update();
	physics.update(delta);

  window.requestAnimationFrame(animate);
}
