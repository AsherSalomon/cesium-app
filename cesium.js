
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

function addPoint( cartesian3 ) {
  viewer.entities.add({
    position: cartesian3,
    point: {
      pixelSize: 1,
      color: Cesium.Color.WHITE,
    },
  });
}

function addPolygon( v0, v1, v2 ) {
  viewer.entities.add({
    // name: "Cyan vertical polygon with per-position heights and outline",
    polygon: {
      hierarchy: [v0, v1, v2],
      // perPositionHeight: true,
      material: Cesium.Color.CYAN.withAlpha(0.5),
      // outline: true,
      // outlineColor: Cesium.Color.BLACK,
    },
  });
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

export function init( newTruck ) {
  truck = newTruck;

  truck.entity = createModel(
    "1984_Ford_F350.glb",
    1916.7 - 29
  );

  truck.now = function() { return viewer.clock.currentTime; }

  let quadtreePrimitive = viewer.scene.globe._surface;
  viewer.scene.globe.tileLoadProgressEvent.addEventListener(function() {
    quadtreePrimitive.forEachLoadedTile(function(quadtreeTile) {
      let provider = viewer.scene.globe.terrainProvider;
      if (provider.ready) {
        let projection = provider.tilingScheme.projection;

        var conditionX = quadtreeTile._x == cartesian2.x;
        var conditionY = quadtreeTile._y == cartesian2.y;
        var conditionL = quadtreeTile._level == maximumLevel;
        if (conditionX && conditionY && conditionL) {
          let globeSurfaceTile = quadtreeTile.data;
          if (onlyOnce && quadtreeTile.renderable) {
            onlyOnce = false;
            // console.log(globeSurfaceTile);
            // let terrainMesh = globeSurfaceTile.mesh;
            // console.log(terrainMesh);
            // let quantizedMeshTerrainData = globeSurfaceTile.terrainData;
            // console.log(quantizedMeshTerrainData);
            let mesh = globeSurfaceTile.renderedMesh;
            console.log(mesh);
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
      }

      // QuadtreePrimitive
      // GlobeSurfaceTileProvider
      // const tileProvider = quadtreePrimitive._tileProvider
      // const quadtree = tileProvider._quadtree;
      // const levelZeroTiles = quadtree._levelZeroTiles;
      // const tileToWest = quadtreeTile.findTileToWest(levelZeroTiles);
      // const tileToSouth = quadtreeTile.findTileToSouth(levelZeroTiles);
      // const tileToEast = quadtreeTile.findTileToEast(levelZeroTiles);
      // const tileToNorth = quadtreeTile.findTileToNorth(levelZeroTiles);
    });
  });

}

let onlyOnce = true;
let cartesian2 = {x: 0, y: 0};
let maximumLevel = 0;

export function update() {
  let provider = viewer.scene.globe.terrainProvider;
  if (provider.ready) {
    let cartographic = new Cesium.Cartographic.fromDegrees(-71.30325, 44.2705, 1916.7);
    let newMaximumLevel = provider.availability.computeMaximumLevelAtPosition(cartographic);
    let newCartesian2 = provider.tilingScheme.positionToTileXY(cartographic, maximumLevel);
    var conditionX = newCartesian2.x != cartesian2.x;
    var conditionY = newCartesian2.y != cartesian2.y;
    var conditionL = newMaximumLevel != maximumLevel;
    if (conditionX || conditionY || conditionL) {
      let onlyOnce = true;
      maximumLevel = newMaximumLevel;
      cartesian2 = newCartesian2;
    }
  }
}
