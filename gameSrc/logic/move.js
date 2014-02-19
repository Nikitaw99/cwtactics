/**
 *
 * @namespace
 */
cwt.Move = {

  /**
   * @constant
   */
  MOVE_CODES_UP: 0,

  /**
   * @constant
   */
  MOVE_CODES_RIGHT: 1,

  /**
   * @constant
   */
  MOVE_CODES_DOWN: 2,

  /**
   * @constant
   */
  MOVE_CODES_LEFT: 3,

  /**
   *
   */
  movePathCache: cwt.list(MAX_SELECTION_RANGE, INACTIVE_ID),

  /**
   * Extracts the move code between two positions.
   */
  codeFromAtoB: function (sx, sy, tx, ty) {
    assert(model.map_isValidPosition(sx, sy));
    assert(model.map_isValidPosition(tx, ty));

    assert(model.map_getDistance(sx, sy, tx, ty) === 1);

    if (sx < tx) return model.move_MOVE_CODES.RIGHT;
    if (sx > tx) return model.move_MOVE_CODES.LEFT;
    if (sy < ty) return model.move_MOVE_CODES.DOWN;
    if (sy > ty) return model.move_MOVE_CODES.UP;

    return null;
  },

  /**
   * Generates a path from a start position { `stx` , `sty` } to { `tx` , `ty` } with a
   * given selection ( `util.selectionMap` ) map. The result will be stored in the `movePath`.
   */
  generateMovePath: function (stx, sty, tx, ty, selection, movePath) {
    assert(model.map_isValidPosition(stx, sty));
    assert(model.map_isValidPosition(tx, ty));

    var graph = new Graph(selection.data);

    var dsx = stx - selection.centerX;
    var dsy = sty - selection.centerY;
    var start = graph.nodes[dsx][dsy];
    var dtx = tx - selection.centerX;
    var dty = ty - selection.centerY;
    var end = graph.nodes[dtx][dty];
    var path = astar.search(graph.nodes, start, end);
    var cx = stx;
    var cy = sty;
    var cNode;

    movePath.resetValues();
    var movePathIndex = 0;
    for (var i = 0, e = path.length; i < e; i++) {
      cNode = path[i];

      var dir;
      if (cNode.x > cx) dir = model.move_MOVE_CODES.RIGHT;
      else if (cNode.x < cx) dir = model.move_MOVE_CODES.LEFT;
      else if (cNode.y > cy) dir = model.move_MOVE_CODES.DOWN;
      else if (cNode.y < cy) dir = model.move_MOVE_CODES.UP;
      else util.expect(util.expect.isTrue, false);

      // add code to move path
      movePath[movePathIndex] = dir;
      movePathIndex++;

      cx = cNode.x;
      cy = cNode.y;
    }
  },

  /**
   * Appends a move `code` to a given `movePath` and returns `true` if the
   * insertion was possible else `false`. If the new code is a backwards move
   * to the previous tile in the path then the actual last tile will be
   * dropped. In this function returns also `true` in this case.
   */
  addCodeToMovePath: function (code, movePath) {
    assert(util.intRange(code, model.move_MOVE_CODES.UP, model.move_MOVE_CODES.LEFT));

    // is the move a go back to the last tile ?
    var lastCode = movePath.getLastCode();
    var goBackCode;
    switch (code) {

      case model.move_MOVE_CODES.UP:
        goBackCode = model.move_MOVE_CODES.DOWN;
        break;

      case model.move_MOVE_CODES.DOWN:
        goBackCode = model.move_MOVE_CODES.UP;
        break;

      case model.move_MOVE_CODES.LEFT:
        goBackCode = model.move_MOVE_CODES.RIGHT;
        break;

      case model.move_MOVE_CODES.RIGHT:
        goBackCode = model.move_MOVE_CODES.LEFT;
        break;
    }

    // if move is a go back then pop the lest code
    if (lastCode === goBackCode) {
      movePath[movePath.getSize() - 1] = INACTIVE_ID;
      return true;
    }

    var source = controller.stateMachine.data.source;
    var unit = source.unit;
    var fuelLeft = unit.fuel;
    var fuelUsed = 0;
    var points = unit.type.range;
    if (fuelLeft < points) points = fuelLeft;

    // add command to the move path list
    movePath[movePath.getSize()] = code;

    // calculate fuel consumption for the current move path
    var cx = source.x;
    var cy = source.y;
    for (var i = 0, e = movePath.getSize(); i < e; i++) {
      switch (movePath[i]) {

        case model.move_MOVE_CODES.UP:
          cy--;
          break;

        case model.move_MOVE_CODES.DOWN:
          cy++;
          break;

        case model.move_MOVE_CODES.LEFT:
          cx--;
          break;

        case model.move_MOVE_CODES.RIGHT:
          cx++;
          break;
      }

      // acc. fuel consumption
      fuelUsed += controller.stateMachine.data.selection.getValueAt(cx, cy);
    }

    // if to much fuel would be needed then decline
    if (fuelUsed > points) {
      movePath[movePath.getSize() - 1] = INACTIVE_ID; // remove the code that you placed before
      return false;
    } else return true;
  },

  /**
   * Little helper array object for `model.move_fillMoveMap`. This will be used
   * only by one process. If the helper is not available then a temp object will
   * be created in `model.move_fillMoveMap`. If the engine is used without client
   * hacking then this situation never happen and the `model.move_fillMoveMap`
   * will use this helper to prevent unnecessary array creation.
   */
  fillMoveMapHelper_: [],

  /**
   * Fills a move map for possible move able tiles in a selection map.
   */
  fillMoveMap: function (source, selection, x, y, unit) {
    var cost;

    // grab object aw2 from `source` position if no explicit aw2 is given
    if (typeof x !== "number") x = source.x;
    if (typeof y !== "number") y = source.y;
    if (!unit) unit = source.unit;

    assert(model.map_isValidPosition(x, y));

    var toBeChecked;
    var releaseHelper = false;
    if (model.move_move_fillMoveMapHelper_ !== null) {
      toBeChecked = model.move_move_fillMoveMapHelper_;
      model.move_move_fillMoveMapHelper_ = null;
      releaseHelper = true;
    } else toBeChecked = [];


    var mType = model.data_movetypeSheets[unit.type.movetype];
    var player = model.player_data[unit.owner];

    controller.prepareTags(x, y, model.unit_extractId(unit));
    var range = controller.scriptedValue(unit.owner, "moverange", unit.type.range);

    // decrease range if not enough fuel is available
    if (unit.fuel < range) range = unit.fuel;

    // add start tile to the map
    selection.setCenter(x, y, INACTIVE_ID);
    selection.setValueAt(x, y, range);

    // fill map ( one struct is X;Y;LEFT_POINTS )
    toBeChecked[0] = x;
    toBeChecked[1] = y;
    toBeChecked[2] = range;

    var checker = [
      -1, -1, -1, -1, -1, -1, -1, -1];

    while (true) {
      var cHigh = -1;
      var cHighIndex = -1;

      for (var i = 0, e = toBeChecked.length; i < e; i += 3) {
        var leftPoints = toBeChecked[i + 2];

        if (leftPoints !== undefined && leftPoints !== null) {
          if (cHigh === -1 || leftPoints > cHigh) {
            cHigh = leftPoints;
            cHighIndex = i;
          }
        }
      }
      if (cHighIndex === -1) break;

      var cx = toBeChecked[cHighIndex];
      var cy = toBeChecked[cHighIndex + 1];
      var cp = toBeChecked[cHighIndex + 2];

      // clear
      toBeChecked[cHighIndex] = null;
      toBeChecked[cHighIndex + 1] = null;
      toBeChecked[cHighIndex + 2] = null;

      // set neighbors for check
      if (cx > 0) {
        checker[0] = cx - 1;
        checker[1] = cy;
      } else {
        checker[0] = -1;
        checker[1] = -1;
      }
      if (cx < model.map_width - 1) {
        checker[2] = cx + 1;
        checker[3] = cy;
      } else {
        checker[2] = -1;
        checker[3] = -1;
      }
      if (cy > 0) {
        checker[4] = cx;
        checker[5] = cy - 1;
      } else {
        checker[4] = -1;
        checker[5] = -1;
      }
      if (cy < model.map_height - 1) {
        checker[6] = cx;
        checker[7] = cy + 1;
      } else {
        checker[6] = -1;
        checker[7] = -1;
      }

      // check the given neighbors for move
      for (var n = 0; n < 8; n += 2) {
        if (checker[n] === -1) continue;

        var tx = checker[n];
        var ty = checker[n + 1];

        cost = model.move_getMoveCosts(mType, tx, ty);
        if (cost !== -1) {

          var cunit = model.unit_posData[tx][ty];
          if (cunit !== null && model.fog_turnOwnerData[tx][ty] > 0 && !cunit.hidden && model.player_data[cunit.owner].team !== player.team) {
            continue;
          }

          // scripted movecosts
          cost = controller.scriptedValue(unit.owner, "movecost", cost);

          var rest = cp - cost;
          if (rest >= 0 && rest > selection.getValueAt(tx, ty)) {

            // add possible move to the `selection` map
            selection.setValueAt(tx, ty, rest);

            // add this tile to the checker
            for (var i = 0, e = toBeChecked.length; i <= e; i += 3) {
              if (toBeChecked[i] === null || i === e) {
                toBeChecked[i] = tx;
                toBeChecked[i + 1] = ty;
                toBeChecked[i + 2] = rest;
                break;
              }
            }
          }
        }
      }
    }

    // release helper if you grabbed it
    if (releaseHelper) {
      for (var hi = 0, he = toBeChecked.length; hi < he; hi++) toBeChecked[hi] = null;
      model.move_move_fillMoveMapHelper_ = toBeChecked;
    }

    // convert left points back to absolute costs
    for (x = 0, xe = model.map_width; x < xe; x++) {
      for (y = 0, ye = model.map_height; y < ye; y++) {
        if (selection.getValueAt(x, y) !== INACTIVE_ID) {
          cost = model.move_getMoveCosts(mType, x, y);
          selection.setValueAt(x, y, cost);
        }
      }
    }
  },

  /**
   *
   */
  trapCheck: function (way, source, target) {
    var cBx;
    var cBy;
    var cx = source.x;
    var cy = source.y;
    var sourceTeamId = model.player_data[source.unit.owner].team;
    for (var i = 0, e = way.length; i < e; i++) {

      // end of way
      if (way[i] === -1) break;

      switch (way[i]) {

        case model.move_MOVE_CODES.DOWN:
          cy++;
          break;

        case model.move_MOVE_CODES.UP:
          cy--;
          break;

        case model.move_MOVE_CODES.LEFT:
          cx--;
          break;

        case model.move_MOVE_CODES.RIGHT:
          cx++;
          break;
      }

      var unit = model.unit_posData[cx][cy];

      // position is valid when no unit is there
      if (!unit) {
        cBx = cx;
        cBy = cy;

      } else if (sourceTeamId !== model.player_data[unit.owner].team) {

        target.set(cBx, cBy);
        way[i] = INACTIVE_ID;
        return true;
      }
    }

    return false;
  },

  /**
   * Returns the movecosts to move with a given move type on a
   * given tile type.
   */
  getMoveCosts: function (movetype, x, y) {
    assert(model.map_isValidPosition(x, y));

    var v;
    var tmp;

    // grab costs from property or  if not given from tile
    tmp = model.property_posMap[x][y];
    if (tmp) {

      // nobody can move onto an invisible property
      if (tmp.type.blocker) v = -1;
      else v = movetype.costs[tmp.type.ID];
    } else v = movetype.costs[model.map_data[x][y].ID];
    if (typeof v === "number") return v;

    // check wildcard
    v = movetype.costs["*"];
    if (typeof v === "number") return v;

    // no match then return `-1`as not move able
    return -1;
  },

  /**
   * Returns true if a movetype can move to position {x,y} else false.
   */
  canTypeMoveTo: function (movetype, x, y) {
    if (model.map_isValidPosition(x, y)) {

      if (model.move_getMoveCosts(movetype, x, y) === -1) return false;
      if (model.fog_turnOwnerData[x][y] === 0) return true;
      if (model.unit_posData[x][y] !== null) return false;

      return true;
    }
  },

  move: function (uid, x, y, noFuelConsumption) {
    var way = model.move_pathCache;
    var cX = x;
    var cY = y;
    var unit = model.unit_data[ uid ];
    var uType = unit.type;
    var mType = model.data_movetypeSheets[ uType.movetype ];
    var wayIsIllegal = false;
    var lastIndex = way.length - 1;
    var fuelUsed = 0;

    // check move way by iterate through all move codes and build the path
    //
    // 1. check the correctness of the given move code
    // 2. check all tiles to recognize trapped moves
    // 3. accumulate fuel consumption ( except `noFuelConsumption` is `true` )
    //
    for (var i = 0, e = way.length; i < e; i++) {
      if (way[i] === INACTIVE_ID) break;

      // set current position by current move code
      switch (way[i]) {

        case model.move_MOVE_CODES.UP:
          if (cY === 0) wayIsIllegal = true;
          cY--;
          break;

        case model.move_MOVE_CODES.RIGHT:
          if (cX === model.map_width - 1) wayIsIllegal = true;
          cX++;
          break;

        case model.move_MOVE_CODES.DOWN:
          if (cY === model.map_height - 1) wayIsIllegal = true;
          cY++;
          break;

        case model.move_MOVE_CODES.LEFT:
          if (cX === 0) wayIsIllegal = true;
          cX--;
          break;
      }

      // when the way contains an illegal value that isn't part of
      // `model.move_MOVE_CODES` then break the move process.
      assert(!wayIsIllegal);

      // is way blocked ? (niy!)
      if (false /* && model.isWayBlocked( cX, cY, unit.owner, (i === e - 1) )  */) {
        lastIndex = i - 1;

        // go back until you find a valid tile
        switch (way[i]) {
          case model.move_MOVE_CODES.UP:
            cY++;
            break;
          case model.move_MOVE_CODES.RIGHT:
            cX--;
            break;
          case model.move_MOVE_CODES.DOWN:
            cY--;
            break;
          case model.move_MOVE_CODES.LEFT:
            cX++;
            break;
        }

        // this is normally not possible, except other modules makes a fault in this case
        // the moving system could not recognize a enemy in front of the mover that causes a `trap`
        assert(lastIndex !== -1);

        break;
      }

      // calculate the used fuel to move onto the current tile
      // if `noFuelConsumption` is not `true` some actions like unloading does not consume fuel
      if (noFuelConsumption !== true) fuelUsed += model.move_getMoveCosts(mType, cX, cY);
    }

    // consume fuel ( if `noFuelConsumption` is `true` then the costs will be `0` )
    unit.fuel -= fuelUsed;
    assert(unit.fuel >= 0);

    // DO NOT ERASE POSITION IF UNIT WAS LOADED OR HIDDEN (NOT INGAME HIDDEN) SOMEWHERE
    if (unit.x >= 0 && unit.y >= 0) {

      model.events.clearUnitPosition(uid);
    }

    // do not set the new position if the position is already occupied
    // the action logic must take care of this situation
    if (model.unit_posData[cX][cY] === null) model.events.setUnitPosition(uid, cX, cY);
  }
};


/*
 (function(){

 function setPos(uid,x,y){
 var unit = model.unit_data[uid];

 unit.x = x;
 unit.y = y;
 model.unit_posData[x][y] = unit;

 model.events.modifyVisionAt( x, y, unit.owner, unit.type.vision, 1 );
 }

 // Set position
 //
 model.event_on("setUnitPosition",setPos);
 model.event_on("createUnit",function( slot, pid, x,y, type ){
 setPos(slot,x,y);
 });
 })();

 // Clear position.
 //
 model.event_on("clearUnitPosition",function(uid){
 var unit = model.unit_data[uid];
 var x    = unit.x;
 var y    = unit.y;

 model.events.modifyVisionAt( x, y, unit.owner, unit.type.vision, -1 );

 model.unit_posData[x][y] = null;
 unit.x = -unit.x;
 unit.y = -unit.y;
 });


 model.event_on("move_flushMoveData",function( move, source ){
 controller.commandStack_sharedInvokement(
 "move_clearWayCache"
 );

 for (var i = 0, e = move.length; i < e; i += 6) {
 if (move[i] === INACTIVE_ID) break;
 controller.commandStack_sharedInvokement(
 "move_appendToWayCache",
 move[i],
 move[i + 1],
 move[i + 2],
 move[i + 3],
 move[i + 4],
 move[i + 5]
 );
 }

 controller.commandStack_sharedInvokement(
 "move_moveByCache",
 source.unitId,
 source.x,
 source.y,
 0
 );
 });

 model.event_on("move_clearWayCache",function(){
 model.move_pathCache.resetValues();
 });

 model.event_on("move_appendToWayCache",function(){
 var i = 0;

 // search first free slot in the cache list
 while( model.move_pathCache[i] !== INACTIVE_ID ){
 i++;
 if( i >= MAX_SELECTION_RANGE ) assert(false);
 }

 // add tiles to cache path
 var argI = 0;
 while( argI < arguments.length ){
 model.move_pathCache[i] = arguments[argI];
 argI++;
 i++;

 if( i >= MAX_SELECTION_RANGE ) assert(false);
 }
 });
 */