import * as cesiumStuff from './cesium-stuff.js';
import * as controls from './controls.js';
import * as physics from './physics.js';

Ammo().then( function ( AmmoLib ) {
	Ammo = AmmoLib;
	init();
  animate();
} );

function init() {
  physics.init();
}

// let start, previousTimeStamp;
function animate( timestamp ) {
  // if ( start === undefined ) { start = timestamp; }
  // const elapsed = timestamp - start;

  controls.update();
  physics.update();

  // previousTimeStamp = timestamp;
  window.requestAnimationFrame( animate );
}
