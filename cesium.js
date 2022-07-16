
let viewer;
export let truckEntity;

let selectedTile = {cartesian2: {x: 0, y: 0}, level: 0}
const tileList = [];

let initPosition = [-71.303343, 44.269824, 1916.7 - 34.9]

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
    destination : Cesium.Cartesian3.fromDegrees(
      initPosition[0] + 0.001,
      initPosition[1],
      initPosition[2] + 22
    ),
    orientation : {
      heading : Cesium.Math.toRadians(270),
      pitch : Cesium.Math.toRadians(-15),
    }
  });

  truckEntity = createModel('1984_Ford_F350.glb');
  truckEntity.now = function() { return viewer.clock.currentTime; }

}

let createTerrain;
let removeTerrain;
export function getPhysicsFunctions(getCreateTerrain, getRemoveTerrain) {
  createTerrain = getCreateTerrain;
  removeTerrain = getRemoveTerrain;

}

export function update() {
  const provider = viewer.scene.globe.terrainProvider;
  if (provider.ready) {
    const position = truckEntity.position.getValue(truckEntity.now());
    const ellipsoid = provider.tilingScheme.projection.ellipsoid;
    const cartographic = ellipsoid.cartesianToCartographic(position);
    const level = provider.availability.computeMaximumLevelAtPosition(cartographic);
    const cartesian2 = provider.tilingScheme.positionToTileXY(cartographic, level);
    selectedTile.cartesian2 = cartesian2;
    selectedTile.level = level;
  }

  let newTileList = [];
  viewer.scene.globe._surface.forEachLoadedTile(function(quadtreeTile) {
    const conditionX = Math.abs(quadtreeTile._x - selectedTile.cartesian2.x) <= 1;
    const conditionY = Math.abs(quadtreeTile._y - selectedTile.cartesian2.y) <= 1;
    const conditionL = quadtreeTile._level == selectedTile.level;
    if (conditionX && conditionY && conditionL) {
      newTileList.push(quadtreeTile);
    }
  });
  updateTileList(newTileList);
  tryToAddTiles();

}

function createModel(url) {
  viewer.entities.removeAll();

  const position = Cesium.Cartesian3.fromDegrees(
    initPosition[0],
    initPosition[1],
    initPosition[2]
  );
  const heading = Cesium.Math.toRadians(55);
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
      removeTile(tileList[i]);
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

      // addTile(newTileList[i]);
      tileList.push(newTileList[i]);
    }
  }

}

function tryToAddTiles() {
  for (let i = 0; i < tileList.length; i++) {
    if (tileList[i].entities == undefined && tileList[i].renderable) {
      addTile(tileList[i]);
    }
  }

}

function addTile(quadtreeTile){
  const provider = viewer.scene.globe.terrainProvider;
  if (provider.ready) { // && quadtreeTile.renderable) {
    const projection = provider.tilingScheme.projection;
    const globeSurfaceTile = quadtreeTile.data;
    const mesh = globeSurfaceTile.renderedMesh;
    if (mesh !== undefined) {
      quadtreeTile.entities = [];
      const vertices = mesh.vertices;
      const indices = mesh.indices;
      const encoding = mesh.encoding;
      // const indicesLength = indices.length;
      // for (let i = 0; i < indicesLength; i += 3) {
      //   const i0 = indices[i];
      //   const i1 = indices[i + 1];
      //   const i2 = indices[i + 2];
      //
      //   const v0 = getPosition(encoding, 3, projection, vertices, i0);
      //   const v1 = getPosition(encoding, 3, projection, vertices, i1);
      //   const v2 = getPosition(encoding, 3, projection, vertices, i2);
      //
      //   // quadtreeTile.entities.push(addPoint(v0));
      //   // quadtreeTile.entities.push(addPoint(v1));
      //   // quadtreeTile.entities.push(addPoint(v2));
      //   // quadtreeTile.entities.push(addPolygon(v0, v1, v2));
      // }

      const verticesLength = vertices.length;
      const positions = new Array(verticesLength);
      for (let i = 0; i < verticesLength; i ++) {
        positions[i] = getPosition(encoding, 3, projection, vertices, i);
      }
      const tileName = quadtreeTile._x +'_'+ quadtreeTile._y +'_'+ quadtreeTile._level;
      createTerrain(positions, indices, tileName);
    }
  }

}

function removeTile(quadtreeTile){
  if (quadtreeTile.entities != undefined) {
    for (let i = 0; i < quadtreeTile.entities.length; i++) {
      viewer.entities.remove(quadtreeTile.entities[i]);
    }
    // console.log('remove polygons');
    quadtreeTile.entities = undefined;
    const tileName = quadtreeTile._x +'_'+ quadtreeTile._y +'_'+ quadtreeTile._level;
    removeTerrain(tileName);
  }

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

function addPoint(cartesian3) {
  return viewer.entities.add({
    position: cartesian3,
    point: {
      pixelSize: 1,
      color: Cesium.Color.WHITE,
    },
  });

}

function addPolygon( v0, v1, v2 ) {
  return viewer.entities.add({
    // name: "Cyan vertical polygon with per-position heights and outline",
    polygon: {
      hierarchy: [v0, v1, v2],
      // perPositionHeight: true,
      material: Cesium.Color.GREEN.withAlpha(0.5),
      // outline: true,
      // outlineColor: Cesium.Color.BLACK,
    },
  });

}
