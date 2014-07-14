cwt.Input.registerInputHandler("touch", function () {

  // not supported ?
  if (!cwt.ClientFeatures.touch) {
    return;
  }

  var input = this;

  function inSelection() {
    var state = cwt.Gameflow.activeStateId;
    return (
      state === "INGAME_MOVEPATH"
        || state === "INGAME_SELECT_TILE_TYPE_A"
        || state === "INGAME_SELECT_TILE_TYPE_B" );
    // || controller.attackRangeVisible );
  }

  function inMenu() {
    var state = cwt.Gameflow.activeStateId;
    return (
      state === "INGAME_MENU"
        || state === "INGAME_SUBMENU" );
  }

  // ----------------------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------------

  // Called when an one finger tap occur
  //
  function oneFingerTap(event, x, y) {
    if (input.disabled) return;

    x = cwt.Screen.offsetX + parseInt(x / cwt.Screen.TILE_BASE, 10);
    y = cwt.Screen.offsetY + parseInt(y / cwt.Screen.TILE_BASE, 10);


    if (!inMenu()) {
      if (inSelection()) {
        if (cwt.Gameflow.globalData.selection.getValue(x, y) > 0) {
          cwt.Input.pushAction(cwt.Input.TYPE_ACTION, x, y);
        } else {
          cwt.Input.pushAction(cwt.Input.TYPE_CANCEL, x, y);
        }
      } else {
        cwt.Input.pushAction(cwt.Input.TYPE_ACTION, x, y);
      }

    } else {


      if (event.target.id === "cwt_menu") {
        cwt.Input.pushAction(cwt.Input.TYPE_ACTION, cwt.INACTIVE, cwt.INACTIVE);
      } else {
        cwt.Input.pushAction(cwt.Input.TYPE_CANCEL, cwt.INACTIVE, cwt.INACTIVE);
      }
    }
  }

  // Called when a two finger tap occur
  //
  function twoFingerTap(event, x, y) {
    cwt.Input.pushAction(cwt.Input.TYPE_CANCEL, cwt.INACTIVE, cwt.INACTIVE);
  }

  // Called when a swipe occur
  //
  // if dx is not 0 then dy is 0
  // if dy is not 0 then dx is 0
  //
  function swipe(event, dx, dy) {
    var key = null;

    if (dx === 1) key = cwt.Input.TYPE_RIGHT;
    if (dy === 1) key = cwt.Input.TYPE_DOWN;
    if (dx === -1) key = cwt.Input.TYPE_LEFT;
    if (dy === -1) key = cwt.Input.TYPE_UP;

    cwt.Input.pushAction(key, ( cwt.Gameflow.state === "GAME_ROUND" ) ? 10 : 1, cwt.INACTIVE);
  }

  // Called when a drag occur. A drag happens when a one finger tap occurs
  // and won't be released for a longer time. The drag happens when the
  // finger moves into one direction during the hold.
  //
  // if dx is not 0 then dy is 0
  // if dy is not 0 then dx is 0
  //
  function oneFingerDrag(event, dx, dy) {
    if (input.disabled) return;

    var key = null;

    if (dx === 1) key = cwt.Input.TYPE_RIGHT;
    if (dy === 1) key = cwt.Input.TYPE_DOWN;
    if (dx === -1) key = cwt.Input.TYPE_LEFT;
    if (dy === -1) key = cwt.Input.TYPE_UP;

    cwt.Input.pushAction(key, 1, cwt.INACTIVE);

    if (!inMenu()) {
      //ON THE

    } else {
      if (event.target.id === "cwt_menu") {
        //INSIDE THE MENU
        //MOVE SELECTION IN DIRECTION OF DRAG

      } else {
        //OUTSIDE THE MENU
        cwt.Input.pushAction(cwt.Input.TYPE_CANCEL, cwt.INACTIVE, cwt.INACTIVE);
      }
    }

  }

  // Called when a one finger tap is invoked and released after
  // a longer time ( >= 500ms )
  // the position of the finger is fixed in a hold ( at least the finger
  // does not really moved )
  //
  function holdOneFingerTap(event, x, y) {
    //OKAY FOR HOLD, this is tricky
    //Again separated for map and menu

    if (!inMenu()) {

      // IF ATTACK RANGE VISIBLE IN RANGE
      cwt.Input.pushAction(cwt.Input.TYPE_ACTION, x, y);

      //  OUTSIDE RANGE
      cwt.Input.pushAction(cwt.Input.TYPE_CANCEL, x, y);

      // IF ATTACK RANGE IS NOT  VISIBLE
      cwt.Input.pushAction(cwt.Input.TYPE_ACTION, x, y);

    } else {
      if (event.target.id === "cwt_menu") {
        // WHEN HOLD HAPPENS IN THE MENU THEN
        // SLOWLY MOVE DOWN OR UP THROUGH
        // OPTIONS IN DIRECTION OF DRAG...
      } else {
        // WHEN TAP HAPPENS OUTSIDE THE MENU
      }
    }
  }

  // Called when the user pinches
  // delta is not 0 and
  //   delta < 0 means pinch in
  //   delta > 0 means pinch out
  function pinch(event, delta) {
    //if (delta < 0) controller.setScreenScale(controller.screenScale - 1);
    //else           controller.setScreenScale(controller.screenScale + 1);
  }

  // ----------------------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------------------

  // positions
  //  - first finger
  var sx, sy;
  var ex, ey;
  //  - second finger
  var s2x, s2y;
  var e2x, e2y;

  // timestamp
  var st;

  // PINCH VARS
  var pinDis, pinDis2;

  // DRAG VARS
  var dragDiff = 0;
  var isDrag = false;

  // TOUCH STARTS
  document.addEventListener('touchstart', function (event) {
    event.preventDefault();

    // SAVE POSITION AND CLEAR OLD DATA
    sx = event.touches[0].clientX;
    sy = event.touches[0].clientY;
    ex = sx;
    ey = sy;
    isDrag = false;

    // IF A SECOND FINGER IS ON THE SCREEN THEN REMEMBER ITS POSITION
    if (event.touches.length === 2) {

      // SAVE POSITION AND CLEAR OLD DATA
      s2x = event.touches[1].clientX;
      s2y = event.touches[1].clientY;
      e2x = s2x;
      e2y = s2y;

      // REMEMBER DISTANCE BETWEEN FIRST AND SECOND FINGER
      var dx = Math.abs(sx - s2x);
      var dy = Math.abs(sy - s2y);
      pinDis = Math.sqrt(dx * dx + dy * dy)

    } else s2x = -1;

    // REMEMBER TIME STAMP
    st = event.timeStamp;
  }, false);

  // TOUCH MOVES
  document.addEventListener('touchmove', function (event) {
    event.preventDefault();

    var dx, dy;
    ex = event.touches[0].clientX;
    ey = event.touches[0].clientY;

    // IF A SECOND FINGER IS ON THE SCREEN THEN REMEMBER ITS POSITION
    if (event.touches.length === 2) {

      // SAVE POSITION
      e2x = event.touches[1].clientX;
      e2y = event.touches[1].clientY;

      // REMEMBER NEW DISTANCE BETWEEN FIRST AND SECOND FINGER
      // TO BE ABLE TO CALCULATION A PINCH MOVE IF TOUCH END EVENT
      // WILL BE TRIGGERED
      dx = Math.abs(ex - e2x);
      dy = Math.abs(ey - e2y);
      pinDis2 = Math.sqrt(dx * dx + dy * dy)
    } else s2x = -1;

    dx = Math.abs(sx - ex);
    dy = Math.abs(sy - ey);
    var d = Math.sqrt(dx * dx + dy * dy);
    var timeDiff = event.timeStamp - st;

    if (d > 16) {

      if (timeDiff > 300) {

        isDrag = true;
        if (dragDiff > 75) {
          if (dx > dy) oneFingerDrag(event, (sx > ex) ? -1 : +1, 0);
          else         oneFingerDrag(event, 0, (sy > ey) ? -1 : +1);
          dragDiff = 0;
          sx = ex;
          sy = ey;
        } else {
          dragDiff += timeDiff;
        }
      }
    }
  }, false);

  // TOUCH END
  document.addEventListener('touchend', function (event) {
    event.preventDefault();

    // CALCULATE DISTANCE AND TIME GAP BETWEEN START AND END EVENT
    var dx = Math.abs(sx - ex);
    var dy = Math.abs(sy - ey);
    var d = Math.sqrt(dx * dx + dy * dy);
    var timeDiff = event.timeStamp - st;

    // IS IT A TWO PINCH GESTURE?
    if (s2x !== -1) {
      if (Math.abs(pinDis2 - pinDis) <= 32) {
        twoFingerTap(event, ex, ey);
      } else pinch(event, (pinDis2 < pinDis) ? 1 : -1);
      // controller.inputCoolDown = 500;
    } else {
      if (d <= 16) {
        if (timeDiff <= 500) oneFingerTap(event, ex, ey);
      } else if (timeDiff <= 300) {
        if (dx > dy) swipe(event, (sx > ex) ? -1 : +1, 0);
        else         swipe(event, 0, (sy > ey) ? -1 : +1);
      }
    }

  }, false);

});
