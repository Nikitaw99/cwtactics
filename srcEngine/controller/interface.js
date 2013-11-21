util.scoped(function(){

  function clientNeedsToImplementMe( name ){
    return function(){
      assert(false,"client has to implement interface "+name);
    };
  }

  // Returns true if the current session a network session, else false.
  //
  controller.isNetworkGame        = clientNeedsToImplementMe("controller.isNetworkGame");

  // Returns true if the client is the host instance of a game round.
  //
  controller.isHost               = clientNeedsToImplementMe("controller.isHost");

  // Parses a network message and invokes the action stack with the decoded message as argument.
  //
  controller.parseNetworkMessage  = clientNeedsToImplementMe("controller.parseNetworkMessage");

  // Encodes an argument array and sends it to the server instance.
  //
  controller.sendNetworkMessage   = clientNeedsToImplementMe("controller.sendNetworkMessage");
	
});
