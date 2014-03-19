cwt.Input.create("mouse", function () {

  // not supported ?
  if (!cwt.ClientFeatures.mouse) {
    return;
  }

  // register move listener
  document.addEventListener("mousemove", function (ev) {
    var id = ev.target.id;

    var x, y;

    // extract real x,y position on the canvas
    ev = ev || window.event;
    if (typeof ev.offsetX === 'number') {
      x = ev.offsetX;
      y = ev.offsetY;
    }
    else {
      x = ev.layerX;
      y = ev.layerY;
    }

    // convert to a tile position
    x = cwt.Screen.offsetX + parseInt(x / cwt.Screen.TILE_BASE, 10);
    y = cwt.Screen.offsetY + parseInt(y / cwt.Screen.TILE_BASE, 10);

    if (x !== cwt.Cursor.x || y !== cwt.Cursor.y) {
      cwt.Input.push(cwt.Input.TYPE_HOVER, x, y);
    }
  });

  // register click listener
  document.addEventListener("onmouseup", function (ev) {
    var key = cwt.INACTIVE;

    // click on canvas while menu is open -> cancel always
    if (controller.menuVisible) {
      key = cwt.Input.TYPE_CANCEL;
      return;

    } else {

      ev = ev || window.event;
      switch (ev.which) {

        // LEFT
        case 1:
          key = cwt.Input.TYPE_ACTION;
          break;

        // MIDDLE
        case 2:
          break;

        // RIGHT
        case 3:
          key = cwt.Input.TYPE_CANCEL;
          break;
      }
    }

    // push command into the stack
    if (key !== cwt.INACTIVE) {
      cwt.Input.push(key, cwt.INACTIVE, cwt.INACTIVE);
    }
  });

});