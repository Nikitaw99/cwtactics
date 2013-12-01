// Sizes in megabytes for the different storage modules.
//
controller.storage_SIZES = {
  maps:   10,
  assets: 40,
  general: 5
};

// Internal names of the storage modules.
//
controller.storage_NAMES = {
  maps:    "MAPS",
  assets:  "ASSETS",
  general: "GENERAL"
};

// Creates a new storage module.
//
controller.storage_create = function( name, sizeMb, storage_type, cb ){
  var store = new Lawnchair({
      adaptor : storage_type,
      maxSize : sizeMb*1024*1024,
      name    : name
    },
    function(){
      cb({
        get     : function( key, cb ){        store.get( key, cb ); },
        has     : function( key, cb ){        store.exists( key, cb ); },
        exists  : function( key, cb ){        store.exists( key, cb ); },
        set     : function( key, value, cb ){ 
          store.save({ key : key, value : value }, cb ); 
        },
        keys    : function( cb ){             store.keys(cb); },
        clear   : function( cb ){             store.nuke(cb); },
        remove  : function( key, cb ){        store.remove( key, cb ); }
      });
    }
  );
};

// Initializes the storage system.
//
controller.storage_initialize = function( p,mb ){
  mb.take();
  var storage_type = (Browser.mobile)? 'webkit-sqlite':'indexed-db';

  jWorkflow.order(function( p,b ){
      b.take();
      controller.storage_create(
        controller.storage_NAMES.maps,
        controller.storage_SIZES.maps,
        storage_type,
        function( str ){
          controller.storage_maps = str;
          b.pass();
        }
      );
    })

    .andThen(function( p,b ){
      b.take();
      controller.storage_create(
        controller.storage_NAMES.assets,
        controller.storage_SIZES.assets,
        storage_type,
        function( str ){
          controller.storage_assets = str;
          b.pass();
        }
      );
    })

    .andThen(function( p,b ){
      b.take();
      controller.storage_create(
        controller.storage_NAMES.general,
        controller.storage_SIZES.general,
        storage_type,
        function( str ){
          controller.storage_general = str;
          b.pass();
        }
      );
    })

    .start(function( r ){
      if( r ) ; // ERROR

      mb.pass();
    });
};

// Storage for maps.
//
controller.storage_maps    = null;

// Storage for assets data like images and sounds.
//
controller.storage_assets  = null;

// Storage for general data like settings.
//
controller.storage_general = null;