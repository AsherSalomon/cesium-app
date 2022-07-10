import * as cesiumStuff from './cesium-stuff.js';
import * as controls from './controls.js';

Ammo().then( function ( AmmoLib ) {
	Ammo = AmmoLib;
	init();
} );

function init() {
  window.requestAnimationFrame( step );
}

// let start, previousTimeStamp;
function step( timestamp ) {
  // if ( start === undefined ) { start = timestamp; }
  // const elapsed = timestamp - start;
  controls.update();
  // previousTimeStamp = timestamp;
  window.requestAnimationFrame( step );
}
