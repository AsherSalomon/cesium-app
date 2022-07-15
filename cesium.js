const viewer;
export function init() {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZmZjMzQzNi01MGI3LTRiY2ItODE3ZC00OGM3ZjBkZjQxNzUiLCJpZCI6MTAwNDY2LCJpYXQiOjE2NTcyNDAzODl9.ij6tW00jwNgBeDuzMgzMRzS82kQLKucEyLgPhQQs3a4';
  viewer = new Cesium.Viewer('cesiumContainer', {
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
}
export function update() {
}
