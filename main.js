import * as cesiumStuff from './cesium-stuff.js';
import * as controls from './controls.js';

loop();

function loop() {
  console.log('hello');
  window.requestAnimationFrame(loop);
}
