
let viewer;
export let truckEntity;

let selectedTile = {cartesian2: {x: 0, y: 0}, level: 0}
let tileList = [];

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

export function update() {
  let provider = viewer.scene.globe.terrainProvider;
  if (provider.ready) {
    let position = truckEntity.position.getValue(truckEntity.now());
    let ellipsoid = provider.tilingScheme.projection.ellipsoid;
    let cartographic = ellipsoid.cartesianToCartographic(position);
    let level = provider.availability.computeMaximumLevelAtPosition(cartographic);
    let cartesian2 = provider.tilingScheme.positionToTileXY(cartographic, level);
    selectedTile.cartesian2 = cartesian2;
    selectedTile.level = level;
  }

  let newTileList = [];
  viewer.scene.globe._surface.forEachLoadedTile(function(quadtreeTile) {
    let conditionX = Math.abs(quadtreeTile._x - selectedTile.cartesian2.x) <= 1;
    let conditionY = Math.abs(quadtreeTile._y - selectedTile.cartesian2.y) <= 1;
    let conditionL = quadtreeTile._level == selectedTile.level;
    if (conditionX && conditionY && conditionL) {
      newTileList.push(quadtreeTile);
    }
  });
  updateTileList(newTileList);

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


function updateTileList(newTileList) {
  for (let i = tileList.length - 1; i >= 0; i--) {
    let oldTileInNewList = false;
    for (let j = 0; j < newTileList.length; j++) {
      if (tileList[i] == newTileList[j]) {
        oldTileInNewList = true;
        break;
      }
    }
    if (oldTileInNewList == false) {
      // viewer.entities.remove(tileList[i].entity);
      tileList.splice(i, 1);
    }
  }
  let tileListLength = tileList.length;
  for (let i = 0; i < newTileList.length; i++) {
    let newTileInOldList = false;
    for (let j = 0; j < tileListLength; j++) {
      if (newTileList[i] == tileList[j]) {
        newTileInOldList = true;
        break;
      }
    }
    if (newTileInOldList == false) {
      // newTileList[i].entity = viewer.entities.add({
      //   rectangle: {
      //     coordinates: newTileList[i]._rectangle,
      //   },
      //   material: Cesium.Color.GREEN.withAlpha(0.5),
      // });
      tileList.push(newTileList[i]);
    }
  }

}

function addTile(quadtreeTile){
  let provider = viewer.scene.globe.terrainProvider;
  if (provider.ready && quadtreeTile.renderable) {
    let projection = provider.tilingScheme.projection;
    let globeSurfaceTile = quadtreeTile.data;
    let mesh = globeSurfaceTile.renderedMesh;
    if (mesh !== undefined) {
      const vertices = mesh.vertices;
      const indices = mesh.indices;
      const encoding = mesh.encoding;
      const indicesLength = indices.length;
      for (let i = 0; i < indicesLength; i += 3) {
        const i0 = indices[i];
        const i1 = indices[i + 1];
        const i2 = indices[i + 2];

        const v0 = getPosition(encoding, 3, projection, vertices, i0);
        const v1 = getPosition(encoding, 3, projection, vertices, i1);
        const v2 = getPosition(encoding, 3, projection, vertices, i2);
        addPoint(v0);
        addPoint(v1);
        addPoint(v2);
        // addPolygon(v0, v1, v2);
      }
    }
  }

}

function removeTile(quadtreeTile){

}

function getPosition(encoding, mode, projection, vertices, index, result) {
  let position = encoding.getExaggeratedPosition(vertices, index, result);

  // if (defined(mode) && mode !== SceneMode.SCENE3D) {
  //   const ellipsoid = projection.ellipsoid;
  //   const positionCartographic = ellipsoid.cartesianToCartographic(
  //     position,
  //     scratchCartographic
  //   );
  //   position = projection.project(positionCartographic, result);
  //   position = Cartesian3.fromElements(
  //     position.z,
  //     position.x,
  //     position.y,
  //     result
  //   );
  // }

  return position;
}

function addPoint( cartesian3 ) {
  viewer.entities.add({
    position: cartesian3,
    point: {
      pixelSize: 1,
      color: Cesium.Color.WHITE,
    },
  });
}
