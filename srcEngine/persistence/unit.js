model.data_unitParser.addHandler(function(sheet){

  assert( model.data_movetypeSheets.hasOwnProperty(sheet.movetype) );

  assert( util.intRange( sheet.range, 0, MAX_SELECTION_RANGE ) );
  assert( util.intRange( sheet.fuel, 0, 99 ) );
  
  assert( (typeof sheet.stealth === "undefined" || typeof sheet.stealth === "boolean") );
});

controller.persistence_defineHandler(
  
  
  // -----------------------------------------------------------------------
  // load map data
  //

  function(dom){
    for( var i=0,e=model.unit_data.length; i<e; i++ ){
      model.unit_data[i].owner = INACTIVE_ID;
    }
    model.unit_posData.resetValues();
    
    var data;
    if( dom.units ){
      assert( Array.isArray(dom.units) );
  
      for( var i=0,e=dom.units.length; i<e; i++ ){
        data = dom.units[i];
        
        // check data of the data block this save handler uses a differn't saving schema
        assert( util.isInt(data[0]) );
        assert( typeof data[1] === "string" );
        assert( model.data_unitSheets.hasOwnProperty(data[1]));
  
        var type = model.data_unitSheets[data[1]];
  
        assert( model.map_isValidPosition(data[2],data[3]) );
        assert( util.intRange( data[4] , 1, 99 ) );
        assert( util.intRange( data[5] , 0, type.ammo ) );
        assert( util.intRange( data[6] , 0, type.fuel ) );
        assert( util.isInt(data[7]) );
        assert( util.intRange( data[8],-1,MAX_PLAYER-1) );
  
        // get unit object
        var id        = data[0];
        var unit      = model.unit_data[id];
        
        // inject data
        unit.type     = type;
        unit.x        = data[2];
        unit.y        = data[3];
        unit.hp       = data[4];
        unit.ammo     = data[5];
        unit.fuel     = data[6];
        unit.loadedIn = data[7]; // TODO: move to transport
        unit.owner    = data[8];
        
        model.unit_posData[ data[2] ][ data[3] ] = unit;
      }
    }
  },

  // -----------------------------------------------------------------------
  // load save game data
  //

  function(dom){
  },
  
  // -----------------------------------------------------------------------
  // save game data
  //
  
  function(dom){    
    var unit;
    
    dom.units = [];    
    for( var i=0,e=model.unit_data.length; i<e; i++ ){
      unit = model.unit_data[i];
      
      if( unit.owner !== INACTIVE_ID ){
        dom.units.push([
          model.unit_extractId(unit),
          unit.type.ID,
          unit.x,
          unit.y,
          unit.hp,
          unit.ammo,
          unit.fuel,
          unit.loadedIn,
          unit.owner
        ]);
      }
    }
  }
);
