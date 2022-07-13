let truck;

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZmZjMzQzNi01MGI3LTRiY2ItODE3ZC00OGM3ZjBkZjQxNzUiLCJpZCI6MTAwNDY2LCJpYXQiOjE2NTcyNDAzODl9.ij6tW00jwNgBeDuzMgzMRzS82kQLKucEyLgPhQQs3a4';

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: Cesium.createWorldTerrain({
    // requestWaterMask: true,
    requestVertexNormals: true,
  }),
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  animation: false,
  timeline: false,
  fullscreenButton: false,
});

viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
viewer.scene.globe.enableLighting = true;
viewer.shadows = true;
viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.moon = new Cesium.Moon();
// viewer.scene.highDynamicRange = true;

// viewer.scene.globe._surface._tileProvider._debug.wireframe = true;

// scene.light = moonLight;
// const moonLight = new Cesium.DirectionalLight({
//   direction: getMoonDirection(), // Updated every frame
//   color: new Cesium.Color(0.9, 0.925, 1.0),
//   intensity: 0.5,
// });
// const scratchMoonPosition = new Cesium.Cartesian3();

// Add Cesium OSM Buildings, a global 3D buildings layer.
const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

// Fly the camera to Mt Washington at the given longitude, latitude, and height.
viewer.camera.flyTo({
  destination : Cesium.Cartesian3.fromDegrees(-71.30325 + 0.003, 44.2705, 1916.7 + 35),
  orientation : {
    heading : Cesium.Math.toRadians(270),
    pitch : Cesium.Math.toRadians(-15),
  }
});

function createModel(url, height) {
  viewer.entities.removeAll();

  const position = Cesium.Cartesian3.fromDegrees(
    -71.30325,
    44.2705,
    height
  );
  const heading = Cesium.Math.toRadians(270);
  const pitch = 0;
  const roll = 0;
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );

  const entity = viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    model: {
      uri: url,
      minimumPixelSize: 0,
      maximumScale: 20000,
    },
  });
  viewer.trackedEntity = entity;

  return entity;
}

export function init( newTruck ) {
  truck = newTruck;

  truck.entity = createModel(
    "1984_Ford_F350.glb",
    1916.7 - 29
  );

  truck.now = function() { return viewer.clock.currentTime; }

  console.log( viewer.scene.globe.terrainProvider.ready ); // .TilingScheme

}

export function update() {
}
