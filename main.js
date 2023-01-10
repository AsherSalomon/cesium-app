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
  // console.log('waiting...');
  setTimeout(function() {
    // console.log('physics.init');
    physics.init(cesium.truckEntities, cesium.viewer);
    cesium.getPhysicsFunctions(physics.createTerrain, physics.removeTerrain);
    waitingForPhysicsInit = false;
  }, 1 * 1000);
}

let start, previousTimeStamp;
function animate(timestamp) {
  if (start === undefined) {start = timestamp;}
  const delta = (timestamp - previousTimeStamp) / 1000;
  previousTimeStamp = timestamp;

  cesium.update();
  if (waitingForPhysicsInit == false) {
    physics.update(delta);
  }

  window.requestAnimationFrame(animate);
}
