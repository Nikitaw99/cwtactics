cwt.Turn = {

  /**
   * Ends the turn for the current active turn owner.
   */
  next: function () {
    var pid = this.players.indexOf(this.turnOwner);
    var oid = pid;
    var i, e;

    // Try to find next player from the player pool
    pid++;
    while (pid !== oid) {

      if (pid === MAX_PLAYER) {
        pid = 0;

        // Next day
        model.round_day++;

        cwt.Gameround.weatherLeftDays--;

        var round_dayLimit = controller.configValue("round_dayLimit");
        if (round_dayLimit > 0 && this.day >= round_dayLimit) {

          // TODO
          controller.update_endGameRound();
        }
      }

      // Found next player
      if (this.players[pid].team !== INACTIVE_ID) break;

      // Try next player
      pid++;
    }

    // If the new player id is the same as the old
    // player id then the game aw2 is corrupted
    if (DEBUG) assert(pid !== oid);

    // Do end/start turn logic
    this.endsTurn_(this.players[oid]);
    this.startsTurn_(this.players[pid]);
  },

  /**
   *
   */
  endsTurn_: function (player) {
  },

  /**
   *
   */
  startsTurn_: function (player) {

    // Sets the new turn owner and also the client, if necessary
    this.turnOwner = player;
    if (cwt.Client.isLocal(player)) cwt.Client.lastPlayer = player;


    // the active client can see what his and all allied objects can see
    // TODO
    var clTid = model.client_lastPid;
    for (var i = 0, e = MAX_PLAYER; i < e; i++) {
      model.fog_visibleClientPids[i] = false;
      model.fog_visibleTurnOwnerPids[i] = false;

      if (model.player_data[i].team === INACTIVE_ID) continue;

      if (model.player_data[i].team === clTid) model.fog_visibleClientPids[i] = true;
      if (model.player_data[i].team === toTid) model.fog_visibleTurnOwnerPids[i] = true;
    }

    // recalculate fog
    this.fog.fullRecalculation();

    // Do turn start stuff for all **properties**
    for (i = 0, e = MAX_PROPERTIES; i < e; i++) {
      if (model.property_data[i].owner !== player) continue;


    }

    // Do turn start stuff for all **units**
    for (var i = 0, e = MAX_UNITS_PER_PLAYER; i < e; i++) {

      cwt.Gameround.actors[i] = (model.unit_data[i].owner !== INACTIVE_ID);
    }

    // Do host only actions
    if (cwt.Network.isHost()) {

      // Generate new weather
      if (this.weatherLeftDays === 0) {

      }

      // Do AI-Turn
      // TODO
    }

    /*

     var turnStartSupply = (controller.configValue("autoSupplyAtTurnStart") === 1);

     // do turn start stuff for all **units**
     i = model.unit_firstUnitId(pid);
     e = model.unit_lastUnitId(pid);
     for (; i < e; i++) {

     if (model.unit_data[i].owner === INACTIVE_ID) continue;
     model.events.nextTurn_unitCheck(i);
     }

     // start AI logic if new turn owner is AI controlled
     // this local instance is the host
     if (controller.network_isHost() && !controller.ai_isHuman(pid)) {
     controller.ai_machine.event("tick");
     }

     var prop = model.property_data[i];
     if (prop.type.supply) {

     var x = prop.x;
     var y = prop.y;
     var pid = prop.owner;

     var check = model.unit_thereIsAUnit;
     var mode = model.MODE_OWN;
     if (controller.configValue("supplyAlliedUnits") === 1) mode = model.MODE_TEAM;

     if (check(x, y, pid, mode)) {
     var unitTp = model.unit_posData[x][y].type;
     if (prop.type.supply.indexOf(unitTp.ID) !== -1 ||
     prop.type.supply.indexOf(unitTp.movetype) !== -1) {

     model.events.supply_refillResources(model.unit_posData[x][y]);
     }
     }
     }
     */

    /*
     var prop = model.property_data[i];
     if (prop.type.repairs) {
     var x = prop.x;
     var y = prop.y;
     var pid = prop.owner;

     var check = model.unit_thereIsAUnit;
     var mode = model.MODE_OWN;
     if (controller.configValue("repairAlliedUnits") === 1) mode = model.MODE_TEAM;

     if (check(x, y, pid, mode)) {
     var unitTp = model.unit_posData[x][y].type;
     var value;
     value = prop.type.repairs.get(unitTp.ID);
     if (!value) value = prop.type.repairs.get(unitTp.movetype);

     // script it :P
     value = controller.scriptedValue(pid, "propertyHeal", value);

     if (value > 0) {
     model.events.healUnit(
     model.unit_extractId(model.unit_posData[x][y]),
     model.unit_convertPointsToHealth(value),
     true
     );
     }
     }
     }
     */
  }

};