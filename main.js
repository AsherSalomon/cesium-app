import * as cesium from './cesium.js';
import * as physics from './physics.js';

Ammo().then( function ( AmmoLib ) {
	Ammo = AmmoLib;
	init();
  animate();
} );

function init() {
  // cesium.init();
  physics.init();
}

// let start, previousTimeStamp;
function animate( timestamp ) {
  // if ( start === undefined ) { start = timestamp; }
  // const elapsed = timestamp - start;

  // cesium.update();
  physics.update();

  // previousTimeStamp = timestamp;
  window.requestAnimationFrame( animate );
}
