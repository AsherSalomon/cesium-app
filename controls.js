export default class Controls {
  constructor() {
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;

    function onKeyDown( event ) {
      switch ( event.keyCode ) {
        case 87: this.forward = true; break; // w
        case 65: this.left = true; break; // a
        case 83: this.backward = true; break; // s
        case 68: this.right = true; break; // d
        case 32: this.up = true; break; // space
        case 16: this.down = true; break; // shift
      }
    };

    function onKeyUp( event ) {
      switch ( event.keyCode ) {
        case 87: this.forward = false; break; // w
        case 65: this.left = false; break; // a
        case 83: this.backward = false; break; // s
        case 68: this.right = false; break; // d
        case 32: this.up = false; break; // space
        case 16: this.down = false; break; // shift
      }
    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
  }
}
