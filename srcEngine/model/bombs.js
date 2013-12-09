// commands
controller.action_registerCommands("bombs_explosionAt");
controller.action_registerCommands("bombs_fireSilo");
controller.action_registerCommands("bonbs_siloRegeneratesIn");
controller.action_registerCommands("bombs_fireCannon");
controller.action_registerCommands("bombs_fireLaser");

// events
controller.event_define("bombs_explosionAt");
controller.event_define("bombs_startFireSilo");
controller.event_define("bombs_fireCannon");
controller.event_define("bombs_fireLaser");

// Inflicts damage to all units in a given range at a given position.
//
model.bombs_doDamage_ = function(x, y, damage){
  assert( model.map_isValidPosition(x, y) );
  assert( util.isInt(damage) && damage >= 0 );

  var unit = model.unit_posData[x][y];
  if(unit) model.unit_inflictDamage(model.unit_extractId(unit), damage, 9);
}

// fires a bomb at a given position (x,y) and inflicts damage
// to all units in a range around the position.
//
model.bombs_explosionAt = function(tx, ty, range, damage, owner){
  model.map_doInRange(tx, ty, range, model.bombs_doDamage_, damage);
  
  // Invoke event
  controller.events.bombs_explosionAt(tx, ty, range, damage, owner);
};

// Marks all cannon targets in a selection. The area of fire will be defined by the rectangle from
// `sx,sy` to `tx,ty`. The cannon is on the tile `ox,oy` with a given `range`.
// TODO : refa
model.bombs_tryToMarkCannonTargets = function(pid,selection,ox,oy,otx,oty,sx,sy,tx,ty,range ){
  assert( model.player_isValidPid(pid) );
  
  var tid = model.player_data[pid].team;
  var osy = sy;
  var result = false;
  for( ; sx<=tx; sx++ ){ 
    for( sy=osy; sy>=ty; sy-- ){
      if( !model.map_isValidPosition(sx,sy) ) continue;
      
      // range maybe don't match
      if( (Math.abs(sx-ox)  + Math.abs(sy-oy)) > range  ) continue;
      if( (Math.abs(sx-otx) + Math.abs(sy-oty)) > range ) continue;
      
      // in fog
      if( model.fog_turnOwnerData[sx][sy] <= 0) continue;
      
      var unit = model.unit_posData[sx][sy];
      if( unit ){
        if( unit.owner !== pid && model.player_data[unit.owner].team !== tid ){
          selection.setValueAt( sx,sy, 1 ); 
          result = true;
        }
      }
    } 
  } 
  
  return result;
};

// Marks all cannon targets in a given selection model.
//
model.bombs_markCannonTargets = function( prid, selection ){
  var result;
  
  var prop = model.property_data[prid];
  var type = prop.type;
  
  // no cannon
  if( !type.cannon ) return false;
  
  selection.setCenter( prop.x, prop.y, 0 );
  
  var max = type.cannon.range;
  switch( type.cannon.direction ){
      
    case "N": 
      result = model.bombs_tryToMarkCannonTargets( 
        prop.owner, 
        selection, 
        prop.x,         prop.y, 
        prop.x,         prop.y-max-1, 
        prop.x-prop+1,  prop.y-1, 
        prop.x+prop-1,  prop.y-max, 
        max 
      ); 
      break;
      
    case "E": 
      result = model.bombs_tryToMarkCannonTargets( 
        prop.owner, 
        selection, 
        prop.x,         prop.y, 
        prop.x+max+1,   prop.y, 
        prop.x+1,       prop.y+max-1, 
        prop.x+max,     prop.y-max+1, 
        max 
      ); 
      break;
      
    case "W": 
      result = model.bombs_tryToMarkCannonTargets( 
        prop.owner, 
        selection, 
        prop.x,       prop.y, 
        prop.x-max-1, prop.y, 
        prop.x-max,   prop.y+max-1, 
        prop.x-1,     prop.y-max+1, 
        max
      ); 
      break;
      
    case "S": 
      result = model.bombs_tryToMarkCannonTargets( 
        prop.owner, 
        selection, 
        prop.x,       prop.y, 
        prop.x,       prop.y+max+1, 
        prop.x-max+1, prop.y+max, 
        prop.x+max-1, prop.y+1, 
        max 
      ); 
      break;
  }
  
  return result;
};

// Returns `true` if a given property id is a cannon property.
//
model.bombs_isCannon = function( prid ){
  assert( model.property_isValidPropId(prid) );
  
  return typeof model.property_data[prid].type.cannon !== "undefined";
};

// Returns `true` if a given property id is a laser property.
//
model.bombs_isLaser = function( prid ){
  assert( model.property_isValidPropId(prid) );
  
  return typeof model.property_data[prid].type.laser !== "undefined";
};

// Returns `true` if a unit id is a suicide unit. A suicide unit has the ability to blow 
// itself up with an impact.
//
model.bombs_isSuicideUnit = function( uid ){
  assert( model.unit_isValidUnitId(uid) );
  
  return typeof model.unit_data[uid].type.suicide !== "undefined";
};

// Returns true if a property id is a rocket silo. A rocket silo has the ability to fire a
// rocket to a position with an impact.
//
model.bombs_isSilo = function( prid, uid ){
  assert( model.property_isValidPropId(prid) );
  assert( model.unit_isValidUnitId(uid) );
  
  var type = model.property_data[prid].type;
  
  if( !type.rocketsilo ) return false;
  if( arguments.length === 2 ){
    var fuidType = model.unit_data[uid].type.ID;
    if( type.rocketsilo.fireable.indexOf(fuidType) === -1 ) return false;
  }
  
  return true;
};

// Returns `true` when a silo can be fired by a given unit else false.
//
model.bombs_canBeFiredBy = model.bombs_isSilo;

// fires a rocket to a given position (x,y) and inflicts damage to all units in a range around 
// the position.
//
model.bombs_fireSilo = function( x,y, tx, ty, owner){
  assert( model.map_isValidPosition(x,y) );
  assert( model.map_isValidPosition(tx,ty) );
  assert( model.player_isValidPid(owner) );
  
  var silo    = model.property_posMap[x][y];
  var siloId  = model.property_extractId(silo);
  var type    = silo.type;
  var range   = type.rocketsilo.range;
  var damage  = model.unit_convertPointsToHealth(type.rocketsilo.damage);
  
  // SET EMPTY TYPE
  model.property_changeType(siloId, model.data_tileSheets[type.changeTo]);
  
  // Invoke event
  controller.events.bombs_startFireSilo( x,y, siloId, tx,ty, range, damage, owner );
  
  model.bombs_explosionAt(tx, ty, range, damage, owner);
  
  model.dayEvents_push( 
    model.round_daysToTurns(turns), 
    controller.action_convertToInvokeDataArray("property_changeType",[siloId, type])
  );
  
  // Invoke change event
  controller.events.bonbs_siloRegeneratesIn( siloId, turns, type );
};

// Fires a cannon at a given position.
//
model.bombs_fireCannon = function( prid, x,y ){
  assert( model.map_isValidPosition(x,y) );
  assert( model.property_isValidPropId(prid));
  
  var prop    = model.property_data[prid];
  var target  = model.unit_posData[x][y];
  var type    = prop.type;
  
  var target = model.unit_posData[x][y];
  model.unit_inflictDamage( 
    model.unit_extractId(target), 
    model.unit_convertPointsToHealth(type.cannon.damage), 
    9
  );
  
  // Invoke event
  controller.events.bombs_fireCannon( prid, x,y );
};

// Fires a laser at a given position.
//
model.bombs_fireLaser = function( prid ){
  assert( model.property_isValidPropId(prid));
  var prop = model.property_data[prid];
  var ox   = prop.x;
  var oy   = prop.y;
  var pid  = prop.owner;

  controller.events.bombs_fireLaser( prid, ox,oy );
  
  // check all tiles on the map
  for( var x=0,xe=model.map_width; x<xe; x++ ){
    for( var y=0,ye=model.map_height; y<ye; y++ ){
      
      // every tile on the cross ( same y or x coordinate ) will be damaged
      if( ox === x || oy === y ){
        
        var unit = model.unit_posData[x][y];
        if( unit && unit.owner !== pid ){
          model.unit_inflictDamage( 
            model.unit_extractId(unit), 
            model.unit_convertPointsToHealth(prop.type.laser.damage), 
            9 
          );
        }
      }
      
    }
  }
  
};
