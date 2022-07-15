
export var forward = false;
export var backward = false;
export var left = false;
export var right = false;
export var up = false;
export var down = false;

function onKeyDown( event ) {
  switch ( event.keyCode ) {
    case 87: forward = true; break; // w
    case 65: left = true; break; // a
    case 83: backward = true; break; // s
    case 68: right = true; break; // d
    case 32: up = true; break; // space
    case 16: down = true; break; // shift
  }
};

function onKeyUp( event ) {
  switch ( event.keyCode ) {
    case 87: forward = false; break; // w
    case 65: left = false; break; // a
    case 83: backward = false; break; // s
    case 68: right = false; break; // d
    case 32: up = false; break; // space
    case 16: down = false; break; // shift
  }
};

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

// export function update() {
//   if ( moveForward ) { console.log('moveForward'); }
//   if ( moveBackward ) { console.log('moveBackward'); }
//   if ( moveLeft ) { console.log('moveLeft'); }
//   if ( moveRight ) { console.log('moveRight'); }
//   if ( moveUp ) { console.log('moveUp'); }
//   if ( moveDown ) { console.log('moveDown'); }
// }
