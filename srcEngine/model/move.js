// Possible move codes.
//
model.moveCodes = {
  UP:0,
  RIGHT:1,
  DOWN:2,
  LEFT:3
};

// Moves an unit from one position to another position.
// 
// @param {Array} way move way
// @param {Number} uid id of the moving unit
// @param {Number} x x coordinate of the source
// @param {Number} y y coordinate of the source
// @param {Boolean} noFuelConsumption if true then fuel won't be decreases
//
model.moveUnit = function( way, uid, x,y, noFuelConsumption ){
  var cX = x;
  var cY = y;
  var unit = model.units[ uid ];
  var uType = unit.type;
  var mType = model.moveTypes[ uType.movetype ];
  
  // check move way
  var lastIndex = way.length-1;
  var fuelUsed = 0;
  for( var i=0,e=way.length; i<e; i++ ){
    
    // GET NEW CURRENT POSITION
    switch( way[i] ){
        
      case model.MOVE_CODE_UP:
        if( cY === 0 ) util.logError(
          "cannot do move command UP because",
          "current position is at the border"
        );
        cY--;
        break;
        
      case model.MOVE_CODE_RIGHT:
        if( cX === model.mapWidth-1 ) util.logError(
          "cannot do move command RIGHT because",
          "current position is at the border"
        );
        cX++;
        break;
        
      case model.MOVE_CODE_DOWN:
        if( cY === model.mapHeight-1 )util.logError(
          "cannot do move command DOWN because",
          "current position is at the border"
        );
        cY++;
        break;
        
      case model.MOVE_CODE_LEFT:
        if( cX === 0 ) util.logError(
          "cannot do move command LEFT because",
          "current position is at the border"
        );
        cX--;
        break;
        
      default: model.criticalError(
        constants.error.ILLEGAL_PARAMETERS,
        constants.error.UNKNOWN_MOVE_CODE
      );
    }
    
    // IS WAY BLOCKED ? TODO
    if( false && model.isWayBlocked( cX, cY, unit.owner, i == e-1 ) ){
      
      lastIndex = i-1;
      
      // GP BACK
      switch( way[i] ){
          
        case model.MOVE_CODE_UP:
          cY++;
          break;
          
        case model.MOVE_CODE_RIGHT:
          cX--;
          break;
          
        case model.MOVE_CODE_DOWN:
          cY--;
          break;
          
        case model.MOVE_CODE_LEFT:
          cX++;
          break;
      }
      
      // THAT IS A FAULT
      if( lastIndex === -1 ){  
        util.raiseError(
          "unit is blocked by an enemy, but the enemy stands beside the start tile, that is a logic fault!" 
        );
      }
      
      break;
    }
    
    // INCREASE FUEL USAGE
    fuelUsed += model.moveCosts( mType, cX, cY );
  }
  
  // consume fuel if `noFuelConsumption` is not true
  // some actions like unloading does not consume fuel
  if( noFuelConsumption !== true ){
    unit.fuel -= fuelUsed;
    if( unit.fuel < 0 ) util.raiseError("illegal game state");
  }
  
  // DO NOT ERASE POSITION IF UNIT WAS LOADED OR HIDDEN (NOT INGAME HIDDEN) SOMEWHERE
  if( unit.x >= 0 && unit.y >= 0 ){
    
    // RESET CAPTURE POINTS
    var prop = model.propertyPosMap[unit.x][unit.y];
    if( prop ) model.resetCapturePoints( model.extractPropertyId(prop) );
    
    model.clearUnitPosition(uid);
  }
  
  // DO NOT SET NEW POSITION IF THE POSITION IS OCCUPIED THE SET POSITION LOGIC MUST BE DONE BY THE ACTION
  if( model.unitPosMap[cX][cY] === null ) model.setUnitPosition( uid,cX,cY );
};

// Removes an unit from a position.
// 
// @param {Number} uid id number of the target unit
// @param {Number} x x coordinate
// @param {Number} y y coordinate
// 
model.clearUnitPosition = function( uid ){
  var unit = model.units[uid];
  
  var x = unit.x;
  var y = unit.y;
  
  model.modifyVisionAt(x,y,unit.owner,unit.type.vision,-1);
  //model.unitPosMap[x][y] = null;
  unit.x = -unit.x;
  unit.y = -unit.y;
};

controller.defineEvent("setUnitPosition");

// Sets the position of an unit.
// 
// @param {Number} uid id number of the target unit
// @param {Number} x x coordinate
// @param {Number} y y coordinate
//
model.setUnitPosition = function( uid, x,y ){
  var unit = model.units[uid];
  
  unit.x = x;
  unit.y = y;
  // model.unitPosMap[x][y] = unit;
  model.modifyVisionAt(x,y,unit.owner,unit.type.vision,1);
  
  // Invoke event
  var evCb = controller.events.setUnitPosition;
  if( evCb ) evCb( uid, x,y );
};

// Returns the movecosts to move with a given move type on a given tile type.
// 
// @param {model.moveType} movetype
// @returns {Number} move costs or -1 if unmovable
// 
model.moveCosts = function( movetype, x,y  ){
  var map = movetype.costs;
  var v;
  
  var prop = model.propertyPosMap[x][y];
  var type = ( prop )? prop.type : model.map[x][y];
  v = map[type.ID];
  if( typeof v === "number" ) return v;
  
  v = map["*"];
  if( typeof v === "number" ) return v;
  
  return -1;
};

// Extracts the move code between two positions.
//
//  @param {type} sx source x coordinate
//  @param {type} sy source y coordinate
//  @param {type} tx target x coordinate
//  @param {type} ty target y coordinate
//  @returns {entry of model.moveCodes}
//
model.moveCodeFromAtoB = function( sx,sy,tx,ty ){
  if( model.distance(sx,sy,tx,ty) > 1 ){
    model.criticalError( constants.error.ILLEGAL_PARAMETERS, constants.error.POSITIONS_SHOULD_BE_NEIGHBORS );
  }
  
  if( sx < tx ) return model.moveCodes.RIGHT;
  if( sx > tx ) return model.moveCodes.LEFT;
  if( sy < ty ) return model.moveCodes.DOWN;
  if( sy > ty ) return model.moveCodes.UP;
  model.criticalError( constants.error.ILLEGAL_PARAMETERS, constants.error.UNKNOWN );
};