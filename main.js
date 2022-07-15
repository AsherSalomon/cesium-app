import * as cesium from './cesium.js';
// import * as controls from './controls.js';
import * as physics from './physics.js';

Ammo().then( function ( AmmoLib ) {
	Ammo = AmmoLib;
	init();
  animate();
} );

function init() {
  let truck = new Object();
  cesium.init( truck );
  physics.init( truck );
}

// let start, previousTimeStamp;
function animate( timestamp ) {
  // if ( start === undefined ) { start = timestamp; }
  // const elapsed = timestamp - start;

  // controls.update();
  cesium.update();
  physics.update();

  // previousTimeStamp = timestamp;
  window.requestAnimationFrame( animate );
}
