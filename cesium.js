
let viewer;
export let truckEntity;

export function init() {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZmZjMzQzNi01MGI3LTRiY2ItODE3ZC00OGM3ZjBkZjQxNzUiLCJpZCI6MTAwNDY2LCJpYXQiOjE2NTcyNDAzODl9.ij6tW00jwNgBeDuzMgzMRzS82kQLKucEyLgPhQQs3a4';

  viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain({
      requestWaterMask: true,
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

  viewer.scene.primitives.add(Cesium.createOsmBuildings());

  viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(-71.30325 + 0.003, 44.2705, 1916.7 + 35),
    orientation : {
      heading : Cesium.Math.toRadians(270),
      pitch : Cesium.Math.toRadians(-15),
    }
  });

  truckEntity = createModel(
    "1984_Ford_F350.glb",
    1916.7 - 29
  );
  truckEntity.now = function() { return viewer.clock.currentTime; }

}

let selectedTile = {cartesian2: {x: 0, y: 0}, level: 0}
export function update() {
  let provider = viewer.scene.globe.terrainProvider;
  if (provider.ready) {
    let position = truckEntity.position.getValue(truckEntity.now());
    let ellipsoid = provider.tilingScheme.projection.ellipsoid;
    let positionCartographic = ellipsoid.cartesianToCartographic(position);
    console.log(positionCartographic);
  }
}

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
