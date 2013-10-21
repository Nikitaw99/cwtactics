controller.screenStateMachine.structure.NONE = Object.create(controller.stateParent);

controller.screenStateMachine.structure.NONE.section = null;

controller.screenStateMachine.structure.NONE.start = function(){
  if( DEBUG ) util.log("start client");
  
  // registers generic error listener
	window.onerror = function( e ){
    model.criticalError(
      error.UNKNOWN,
      error.NON_CAUGHT_ERROR
    );
      
    console.error("FOUND ERROR: "+e);
  };

  (function setupAnimationFrame(){
    if( DEBUG ) util.log("setup animation frame");

    var oldTime = new Date().getTime();
    function looper(){

      // acquire next frame
      requestAnimationFrame( looper );

      // calculate delta
      var now = new Date().getTime();
      var delta = now - oldTime;
      oldTime = now;

      controller.updateGamePadControls(delta);

      // if the system is in the game loop, then update the game data
      if( controller.inGameLoop ){

        if( controller.inGameRound ) controller.gameLoop( delta );
        else controller.screenStateMachine.event("gameHasEnded"); // game ends --> stop game loop
      }
    }

    // ENTER LOOP
    requestAnimationFrame( looper );
  })();
	
	return "LOAD"; 
};
