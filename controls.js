
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var moveUp = false;
var moveDown = false;

function onKeyDown( event ) {
  switch ( event.keyCode ) {
    case 87: moveForward = true; break; // w
    case 65: moveLeft = true; break; // a
    case 83: moveBackward = true; break; // s
    case 68: moveRight = true; break; // d
    case 32: moveUp = true; break; // space
    case 16: moveDown = true; break; // shift
  }
};

function onKeyUp( event ) {
  switch ( event.keyCode ) {
    case 87: moveForward = false; break; // w
    case 65: moveLeft = false; break; // a
    case 83: moveBackward = false; break; // s
    case 68: moveRight = false; break; // d
    case 32: moveUp = false; break; // space
    case 16: moveDown = false; break; // shift
  }
};

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

export function update() {
  // if ( moveForward ) { console.log('moveForward'); }
  // if ( moveBackward ) { console.log('moveBackward'); }
  // if ( moveLeft ) { console.log('moveLeft'); }
  // if ( moveRight ) { console.log('moveRight'); }
  // if ( moveUp ) { console.log('moveUp'); }
  // if ( moveDown ) { console.log('moveDown'); }
}
