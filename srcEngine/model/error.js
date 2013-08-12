// Define event
controller.defineEvent("criticalError");

util.scoped(function() {

  // Called when a known/catched error will be recognized 
  // by the engine. This function throws the `criticalError`
  // event which allows the client to render error messages
  // (*e.g. for debug mode*).
  //
  // @param {Number} errorId error id
  // @param {Number} errorData error data id
  model.criticalError = function(errorId, errorData) {

		// print stack trace in the active javaScript environment
    console.trace();
		
		// TODO get action stack data 
		var stackData = [];

    // invoke event     
    controller.events.criticalError(errorId, errorData, stackData);

    // log error
    util.error(errorId, errorData, stackData );
  };

});