var TILE_LENGTH = 16;

/**
 *
 */
controller.baseSize = 16;

/**
 *
 */
view.preventRenderUnit = null;

/**
 *
 */
view.canvasCtx = controller.screenElement.getContext("2d");

/**
 *
 */
view.selectionRange = 2;

/**
 *
 */
view.colorArray = [
  view.COLOR_RED,
  view.COLOR_BLUE,
  view.COLOR_GREEN,
  view.COLOR_YELLOW
];

view.offsetCanvas = document.createElement("canvas");
view.offsetCanvasCtx = controller.screenElement.getContext("2d");

view.renderMap = function(scale) {
  view.redraw_dataChanges = 0;
  view.canvasCtx.drawImage(view.offsetCanvas, 0, 0);
  
  for (var x = 0, xe = model.map_width; x < xe; x++) {
    for (var y = 0, ye = model.map_height; y < ye; y++) {
      view.redraw_data[x][y] = false;
    }
  }
};
