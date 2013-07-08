// Player gets funds from all properties.
// 
// @param {Number} prid id of the player
// 
model.doPropertyGiveFunds = function( prid ){
  var prop = props[i];
  
  // check parameters
  if( prop.owner === constants.INACTIVE_ID ){
    model.criticalError(
      constants.error.ILLEGAL_PARAMETERS,
      constants.error.UNKNOWN_PLAYER_ID
    );
  }
  
  controller.prepareTags( prop.x, prop.y );
  var funds = controller.scriptedValue( prop.owner,"funds", prop.type.funds );
  
  if( typeof funds === "number" ) model.players[prop].gold += funds;
};

// Player gets resupply from all properties.
// 
// @param {Number} i id of the property
// 
model.propertySupply = function( i ){
  var prop = props[i];
  if( prop.owner === pid && prop.type.supply ){
    var x = prop.x;
    var y = prop.y;
    
    // CHECK TEAM REPAIR OR OWN SIDE REPAIR ONLY
    var check = model.thereIsUnitCheck;
    var mode = model.MODE_OWN;
    if( controller.configValue("supplyAlliedUnits") === 1 ) mode = model.MODE_TEAM;
    
    if( check(x,y,pid,mode) ){
      var unitTp = model.unitPosMap[x][y].type;
      if( controller.objectInList(prop.type.supply,unitTp.ID, unitTp.movetype ) ){
        model.refillResources( model.unitPosMap[x][y] );
      }
    }
  }
};

// Player properties repairs if possible.
//
// @param {Number} i id of the property
// 
model.propertyRepairs = function( i ){
  var prop = props[i];
  
  // check parameters
  if( prop.owner === constants.INACTIVE_ID ){
    model.criticalError(
      constants.error.ILLEGAL_PARAMETERS,
      constants.error.UNKNOWN_PLAYER_ID
    );
  }
  
  if( prop.type.repairs ){
    var x = prop.x;
    var y = prop.y;
    
    var check = model.thereIsUnitCheck;
    var mode = model.MODE_OWN;
    if( controller.configValue("repairAlliedUnits") === 1 ) mode = model.MODE_TEAM;
    
    if( check(x,y,pid,mode) ){
      var unitTp = model.unitPosMap[x][y].type;
      var value = controller.objectInMap(prop.type.repairs,unitTp.ID, unitTp.movetype );
      
      if( value > 0 ) model.healUnit( model.extractUnitId(model.unitPosMap[x][y]),model.ptToHp(value),true);
    }
  }
};

model.tryUnitSuppliesNeighbours = function( sid ){
  if( !selectedUnit.type.supply ) return;
  model.unitSuppliesNeighbours(sid);
};

// A supplier supplies all surrounding units that can 
// be supplied by the supplier.
// 
// @param {Number} sid supplier id
// 
// @example
//  cross pattern
//      x
//    x o x
//      x
// 
model.unitSuppliesNeighbours = function( sid ){
  var selectedUnit = model.units[ sid ];  
  
  // unit must be a supply unit
  if( !selectedUnit.type.supply ) model.criticalError(
    constants.error.ILLEGAL_PARAMETERS, constants.error.SUPPLY_UNIT_EXPECTED
  );
  
  var x = selectedUnit.x;
  var y = selectedUnit.y;
  var pid = selectedUnit.owner;
  var i = model.getFirstUnitSlotId(pid);
  var e = model.getLastUnitSlotId(pid);
  
  // check all
  for( ; i<e; i++ ){
    
    // supply when neighbor
    if( model.unitDistance( sid, i ) === 1 ) model.refillResources(i);
  }
};

// Refills the resources of an unit.
// 
// @param {Number|Unit} uid id of the unit or the unit object itself
// 
model.refillResources = function( uid ){
  var unit = model.units[uid];
  var type = unit.type;
  unit.ammo = type.ammo;
  unit.fuel = type.fuel;
};
