// commands
controller.action_registerCommands("player_noTeamsAreLeft");
controller.action_registerCommands("player_playerGivesUp");
controller.action_registerCommands("player_deactivatePlayer");

// events
model.event_define("player_playerGivesUp");
model.event_define("player_deactivatePlayer");
model.event_define("player_noTeamsAreLeft");

// Different relationship modes between two objects
//
model.player_RELATION_MODES = {
	SAME_OBJECT: -1,
	NONE:         0,
	OWN:          1,
	ALLIED:       2,
	TEAM:         3,
	ENEMY:        4,
	NULL:					5
};

// List that contains all player instances. An inactive player is marked with `INACTIVE_ID` 
// as team number.
//
model.player_data = util.list( MAX_PLAYER, function( index ){
	return {
		gold: 0,
		team: INACTIVE_ID,
		name: null
	};
});

// Returns true if a given player id is valid or false if not.
//
model.player_isValidPid = function( pid ){
  assert( model.property_isValidPropId(pid) );

	if( pid < 0 || pid >= MAX_PLAYER ) return false;
	return model.player_data[pid].team !== INACTIVE_ID;
};

// Extracts the identical number from an player object.
//
model.player_extractId = function( player ){
	var index = model.player_data.indexOf( player );
  assert( index > -1 );

	return index;
};

// A player has loosed the game round due a specific reason. This function removes all of his 
// units and properties. Furthermore the left teams will be checked. If only one team is left 
// then the end game event will be invoked.
// 
model.player_deactivatePlayer = function( pid ){
  assert( model.property_isValidPropId(pid) );
  
	var i,e;
	
  model.events.player_deactivatePlayer( pid );
	
	// remove all unit
	i = model.unit_firstUnitId( pid ); 
	e = model.unit_lastUnitId( pid );
	for( ; i<e; i++ ){
		if( model.unit_data[i].owner !== INACTIVE_ID ) model.unit_destroy(i);
	}
	
	// remove all properties
	i = 0; 
	e = model.property_data.length;
	for( ; i<e; i++ ){
		var prop = model.property_data[i];
		if( prop.owner === pid ){
			prop.owner = -1;
			
			// change type when the property is a 
			// changing type property
			var changeType = prop.type.changeAfterCaptured;
			if( changeType ) model.property_changeType( i, changeType );
		}
	}
	
	// mark player slot as remove by removing
	// its team reference
	model.player_data[pid].team = -1;
	
	// when no opposite teams are found then the game has ended
	if( !model.player_areEnemyTeamsLeft() ){
		controller.action_localInvoke("player_noTeamsAreLeft");
	}
};

// Returns `true` when at least two opposite teams are left, else `false`.
//
model.player_areEnemyTeamsLeft = function(){
	var player;
	var foundTeam  = -1;
	var i          = 0;
	var e          = model.player_data.length;

	for( ; i<e; i++ ){
		player = model.player_data[i];
		
		if( player.team !== -1 ){
			
			// found alive player
			if( foundTeam === -1 ) foundTeam = player.team;
			else if( foundTeam !== player.team ){
				foundTeam = -1;
				break;
			}
		}
	}

	return (foundTeam === -1);
};

// Returns true if there is an unit with a given relationship on a tile at a given position (x,y).
// 
model.player_getRelationship = function( pidA, pidB ){

	// none
	if( pidA === null || pidB === null ) return model.player_RELATION_MODES.NULL;
	if( pidA === -1   || pidB === -1   ) return model.player_RELATION_MODES.NONE;
	if( model.player_data[pidA].team === -1 || 
      model.player_data[pidB].team === -1 ) return model.player_RELATION_MODES.NONE;
	
	// own
	if( pidA === pidB ) return model.player_RELATION_MODES.OWN;
	
	var teamA = model.player_data[pidA].team;
	var teamB = model.player_data[pidB].team;
	if( teamA === -1 || teamB === -1 ) return model.player_RELATION_MODES.NONE;
	
	// allied
	if( teamA === teamB ) return model.player_RELATION_MODES.ALLIED;
	
	// enemy
	if( teamA !== teamB ) return model.player_RELATION_MODES.ENEMY;
	
	return model.player_RELATION_MODES.NONE;
};

// Returns true if there is an unit with a given relationship in one of the neighbour 
// tiles at a given position (x,y).
// 
// @example
//       x
//     x o x
//       x
// 
model.player_getRelationshipUnitNeighbours = function( pid, x,y , mode ){
  assert( model.property_isValidPropId(pid) );
  assert( model.map_isValidPosition(x,y) );
  
	var check = model.player_getRelationship;
	
	var ownCheck = ( mode === model.player_RELATION_MODES.OWN );
	var i = 0;
	var e = model.unit_data.length;
	
	// enhance lookup when only 
	// own units are checked
	if( ownCheck ){
		i = model.unit_firstUnitId(pid);
		e = model.unit_lastUnitId(pid);
	}
	
	// check all
	for( ; i<e; i++ ){
		
		// true when neighbor is given and mode is correct
		if( model.unit_getDistance( sid, i ) === 1 ){
			if( ownCheck || check( pid, model.unit_data[i].owner ) === mode ) return true;
		}
	}
	
	return false;
};

// This function yields the game for the turn owner and invokes directly the 
// `nextTurn` action. 
//
// **Allowed to be called directly by the client.**
//
model.player_playerGivesUp = function(){
	assert( model.client_isLocalPid( model.round_turnOwner ) );

	model.player_deactivatePlayer( model.round_turnOwner );
	model.round_nextTurn();
	
	// TODO: check this here
	// if model.player_playerGivesUp was called from network context
	// and the turn owner in in the local player instances then
	// it's an illegal action 
	
	model.events.player_playerGivesUp( model.round_turnOwner );
};

// Invoked when the game ends because of a battle victory over all enemy player_data. 
//
model.player_noTeamsAreLeft = function(){
	controller.update_endGameRound();
	
	model.events.player_noTeamsAreLeft();
};
