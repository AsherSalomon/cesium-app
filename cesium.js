
export let viewer;
export const truckEntities = [];

let selectedTile = {cartesian2: {x: 0, y: 0}, level: 0}
const tileList = [];

const initPosition = [-71.303343, 44.269824, 1916.7 - 33.9];

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

  // viewer.scene.globe._surface._tileProvider._debug.wireframe = true;

  viewer.scene.primitives.add(Cesium.createOsmBuildings());

  viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(
      initPosition[0] + 0.0003,
      initPosition[1],
      initPosition[2] + 6.6
    ),
    orientation : {
      heading : Cesium.Math.toRadians(270),
      pitch : Cesium.Math.toRadians(-15),
    }
  });

  truckEntities[0] = createModel('1984_Ford_F350.glb');
  for (let i = 1; i <= 4; i++) {
    truckEntities[i] = viewer.entities.add({model: {uri: '1984_Ford_F350_wheel.glb'}});
  }
  // truckEntities.now = function() { return viewer.clock.currentTime; }

  // // https://sandcastle.cesium.com/?src=Parallels%20and%20Meridians.html&label=All
  // // Click to shift the cross-hairs
  // viewer.screenSpaceEventHandler.setInputAction(function (mouse) {
  //   viewer.scene.pick(mouse.position);
  //   // console.log(mouse.position);
  //   const centerScreen = new Cesium.Cartesian2(viewer.canvas.width / 2, viewer.canvas.height / 2);
  //   // const ray = viewer.camera.getPickRay(mouse.position);
  //   // console.log(centerScreen);
  //   const ray = viewer.camera.getPickRay(centerScreen);
  //   const globe = viewer.scene.globe;
  //   const cartesian = globe.pick(ray, viewer.scene);
  //
  //   if (!Cesium.defined(cartesian)) {
  //     return;
  //   }
  //
  //   const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  //   console.log(cartographic);
  // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

}

let createTerrain;
let removeTerrain;
export function getPhysicsFunctions(getCreateTerrain, getRemoveTerrain) {
  createTerrain = getCreateTerrain;
  removeTerrain = getRemoveTerrain;

}

function positionToTileXYFraction(tilingScheme, position, level) {
  const rectangle = tilingScheme._rectangle;
  const xTiles = tilingScheme.getNumberOfXTilesAtLevel(level);
  const yTiles = tilingScheme.getNumberOfYTilesAtLevel(level);
  const xTileWidth = rectangle.width / xTiles;
  const yTileHeight = rectangle.height / yTiles;
  let longitude = position.longitude;
  if (rectangle.east < rectangle.west) { longitude += 2 * Math.PI; }
  let xTileCoordinate = ((longitude - rectangle.west) / xTileWidth);
  if (xTileCoordinate >= xTiles) { xTileCoordinate = xTiles - 1; }
  let yTileCoordinate = ((rectangle.north - position.latitude) / yTileHeight);
  if (yTileCoordinate >= yTiles) { yTileCoordinate = yTiles - 1; }
  return new Cesium.Cartesian2(xTileCoordinate, yTileCoordinate);
};

export function update() {
  const provider = viewer.scene.globe.terrainProvider;
  if (provider.ready) {
    const position = truckEntities[0].position.getValue(viewer.clock.currentTime);
    const ellipsoid = provider.tilingScheme.projection.ellipsoid;
    const cartographic = ellipsoid.cartesianToCartographic(position);
    const level = provider.availability.computeMaximumLevelAtPosition(cartographic);
    // const cartesian2 = provider.tilingScheme.positionToTileXY(cartographic, level);
    const cartesian2 = positionToTileXYFraction(provider.tilingScheme, cartographic, level);
    // makes it load max 4 instead of max 9 tiles, trying to prevent OOM
    selectedTile.cartesian2 = cartesian2;
    selectedTile.level = level;
  }

  let newTileList = [];
  viewer.scene.globe._surface.forEachLoadedTile(function(quadtreeTile) {
    // const conditionX = Math.abs(quadtreeTile._x - selectedTile.cartesian2.x) <= 0;
    // const conditionY = Math.abs(quadtreeTile._y - selectedTile.cartesian2.y) <= 0;
    const conditionX = Math.abs(quadtreeTile._x - selectedTile.cartesian2.x) <= 1;
    const conditionY = Math.abs(quadtreeTile._y - selectedTile.cartesian2.y) <= 1;
    const conditionL = quadtreeTile._level == selectedTile.level;
    if (conditionX && conditionY && conditionL) {
      newTileList.push(quadtreeTile);
    }
  });
  updateTileList(newTileList);
  tryToAddTiles();

  if (viewer.trackedEntity == truckEntities[0] && followTruck) {
    const vehicleDirection = new Cesium.Cartesian3(0, 1, 0);
    const quaternion = truckEntities[0].orientation.getValue(viewer.clock.currentTime);
    const matrix3 = new Cesium.Matrix3();
    Cesium.Matrix3.fromQuaternion(quaternion, matrix3);
    Cesium.Matrix3.multiplyByVector(matrix3, vehicleDirection, vehicleDirection);
    const crossProduct = new Cesium.Cartesian3();
    Cesium.Cartesian3.cross(viewer.camera.directionWC, vehicleDirection, crossProduct);
    const dotProduct = Cesium.Cartesian3.dot(viewer.camera.upWC, crossProduct);
    viewer.camera.rotateRight(dotProduct * Math.PI / 256);

  }

  adjustHeightForTerrain(viewer.scene.screenSpaceCameraController);

  if (viewer.trackedEntity != truckEntities[0]) {
    // https://sandcastle.cesium.com/?src=Parallels%20and%20Meridians.html&label=All
    const centerScreen = new Cesium.Cartesian2(viewer.canvas.width / 2, viewer.canvas.height / 2);
    const ray = viewer.camera.getPickRay(centerScreen);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (Cesium.defined(cartesian)) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      cartographic.height += 1;
      Cesium.Cartographic.toCartesian(
        cartographic, viewer.camera.ellipsoid, truckEntities[0].position._value);
      const headingPitchRoll = new Cesium.HeadingPitchRoll(
        viewer.camera.heading + Math.PI / 2, 0, 0);
      const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
        "north", "west");
      Cesium.Transforms.headingPitchRollQuaternion(
        truckEntities[0].position._value,
        headingPitchRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransform,
        truckEntities[0].orientation._value
      );
    }
  }
  // truckEntities[0].position._value.x += 0.1;
  // console.log(truckEntities[0].position._value);


}

let followTruck = false;
document.addEventListener('mousemove', function(e) {
  followTruck = false;
});
window.addEventListener('keydown', function(e) {
  followTruck = true;
  if (e.keyCode == 69) {
    if (viewer.trackedEntity == truckEntities[0]) {
      viewer.trackedEntity = null;
    } else if (viewer.trackedEntity != truckEntities[0]) {
      // const position = new Cesium.Cartesian3();
      // Cesium.Cartesian3.subtract(viewer.camera.position, truckEntities[0].position._value, position);
      // const matrix3 = new Cesium.Matrix3();
      // Cesium.Matrix3.fromQuaternion(truckEntities[0].orientation._value, matrix3);
      // Cesium.Matrix3.inverse(matrix3, matrix3);
      // const cartesian3 = new Cesium.Cartesian3();
      // Cesium.Matrix3.multiplyByVector(matrix3, position, cartesian3);
      // truckEntities[0].viewFrom = cartesian3;

      const matrix4 = new Cesium.Matrix4();
      Cesium.Transforms.eastNorthUpToFixedFrame(truckEntities[0].position._value, Cesium.Ellipsoid.WGS84, position);
      const position = new Cesium.Cartesian3();
      Cesium.Matrix4.multiplyByPoint(matrix4, truckEntities[0].position._value, position);
      truckEntities[0].viewFrom = position;

      viewer.trackedEntity = truckEntities[0];
    }
  }
});

    // // Mouse over the globe to see the cartographic position
    // handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    // handler.setInputAction(function (movement) {
    //   const cartesian = viewer.camera.pickEllipsoid(
    //     movement.endPosition,
    //     scene.globe.ellipsoid
    //   );
    //   if (cartesian) {
    //     const cartographic = Cesium.Cartographic.fromCartesian(
    //       cartesian
    //     );
    //     const longitudeString = Cesium.Math.toDegrees(
    //       cartographic.longitude
    //     ).toFixed(2);
    //     const latitudeString = Cesium.Math.toDegrees(
    //       cartographic.latitude
    //     ).toFixed(2);
    //
    //     entity.position = cartesian;
    //     entity.label.show = true;
    //     entity.label.text =
    //       `Lon: ${`   ${longitudeString}`.slice(-7)}\u00B0` +
    //       `\nLat: ${`   ${latitudeString}`.slice(-7)}\u00B0`;
    //   } else {
    //     entity.label.show = false;
    //   }
    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

function adjustHeightForTerrain(controller) {
  controller._adjustedHeightForTerrain = true;

  const scene = controller._scene;
  const mode = scene.mode;
  const globe = scene.globe;

  if (
    !Cesium.defined(globe) ||
    mode === Cesium.SceneMode.SCENE2D ||
    mode === Cesium.SceneMode.MORPHING
  ) {
    return;
  }

  const camera = scene.camera;
  const ellipsoid = globe.ellipsoid;
  const projection = scene.mapProjection;

  let transform;
  let mag;
  if (!Cesium.Matrix4.equals(camera.transform, Cesium.Matrix4.IDENTITY)) {
    transform = Cesium.Matrix4.clone(camera.transform, new Cesium.Matrix4());
    mag = Cesium.Cartesian3.magnitude(camera.position);
    camera._setTransform(Cesium.Matrix4.IDENTITY);
  }

  const cartographic = new Cesium.Cartographic();
  if (mode === Cesium.SceneMode.SCENE3D) {
    ellipsoid.cartesianToCartographic(camera.position, cartographic);
  } else {
    projection.unproject(camera.position, cartographic);
  }

  let heightUpdated = false;
  if (cartographic.height < controller._minimumCollisionTerrainHeight) {
    const globeHeight = controller._scene.globeHeight;
    if (Cesium.defined(globeHeight)) {
      const height = globeHeight + controller.minimumZoomDistance;
      if (cartographic.height < height) {
        cartographic.height = height;
        if (mode === Cesium.SceneMode.SCENE3D) {
          ellipsoid.cartographicToCartesian(cartographic, camera.position);
        } else {
          projection.project(cartographic, camera.position);
        }
        heightUpdated = true;
      }
    }
  }

  if (Cesium.defined(transform)) {
    camera._setTransform(transform);
    if (heightUpdated) {
      Cesium.Cartesian3.normalize(camera.position, camera.position);
      Cesium.Cartesian3.negate(camera.position, camera.direction);
      Cesium.Cartesian3.multiplyByScalar(
        camera.position,
        Math.max(mag, controller.minimumZoomDistance),
        camera.position
      );
      Cesium.Cartesian3.normalize(camera.direction, camera.direction);
      Cesium.Cartesian3.cross(camera.direction, camera.up, camera.right);
      Cesium.Cartesian3.cross(camera.right, camera.direction, camera.up);
    }
  }
}

function createModel(url) {
  viewer.entities.removeAll();

  const position = Cesium.Cartesian3.fromDegrees(
    initPosition[0],
    initPosition[1],
    initPosition[2]
  );
  const heading = Cesium.Math.toRadians(54);
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
      uri: url, // Cesium.ModelGraphics
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
      // viewer.entities.remove(tileList[i].entity); // rectangle

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
      // newTileList[i].entity = viewer.entities.add({ // rectangle
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
    if (
      tileList[i].entities == undefined &&
      tileList[i].renderable &&
      tileList[i].needsLoading == false
    ) {
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

      const verticesLength = vertices.length;
      const positions = new Array(verticesLength);
      for (let i = 0; i < verticesLength; i ++) {
        positions[i] = getPosition(encoding, 3, projection, vertices, i);
      }
      const skirtHeight = provider.getLevelMaximumGeometricError(quadtreeTile._level) * 5.0;
      const tileName = quadtreeTile._x +'_'+ quadtreeTile._y +'_'+ quadtreeTile._level;
      // createTerrain(positions, indices, skirtHeight, tileName); // to do

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
    // removeTerrain(tileName); // to do
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
