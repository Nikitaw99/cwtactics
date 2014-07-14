//
//
// @namespace
//
cwt.CO = {

  //
  // Power level of normal CO power.
  //
  POWER_LEVEL_COP: 0,

  //
  // Power level of normal super CO power.
  //
  POWER_LEVEL_SCOP: 1,

  //
  // Modifies the power level of a player.
  //
  modifyStarPower: function(player, value) {
    if (this.DEBUG) cwt.assert(player instanceof cwt.Player);

    player.power += value;
    if (player.power < 0) player.power = 0;
  },

  //
  // Decline activate power action on game modes that aren't AW1-3.
  // Decline activate power action when a player cannot activate the base cop level.
  // Returns `true`when a given player can activate a power level.
  //
  // @param player
  // @param powerType
  // @return {boolean}
  //
  canActivatePower: function(player, powerType) {
    if (cwt.Config.getValue("co_enabledCoPower") === 0) return false;

    if (this.DEBUG) cwt.assert(player instanceof cwt.Player);
    if (this.DEBUG) cwt.assert(powerType >= cwt.INACTIVE && powerType <= this.POWER_LEVEL_SCOP);

    // co must be available and current power must be inactive
    if (player.coA === null || player.activePower !== cwt.INACTIVE) return false;

    var stars;
    switch (powerType) {

      case this.POWER_LEVEL_COP:
        stars = player.coA.coStars;
        break;

      case this.POWER_LEVEL_SCOP:
        if (cwt.Gameround.gameMode < cwt.Gameround.GAME_MODE_AW2) return false;
        stars = player.coA.scoStars;
        break;

        // TODO
    }

    return (player.power >= (this.getStarCost(player) * stars));
  },

  //
  // Activates the CO power of a player.
  //
  // @param {cwt.Player} player
  // @param level
  //
  activatePower: function(player, level) {
    if (this.DEBUG) cwt.assert(player instanceof cwt.Player);
    if (this.DEBUG) cwt.assert(level === cwt.CO.POWER_LEVEL_COP || level === cwt.CO.POWER_LEVEL_SCOP);

    player.power = 0;
    player.activePower = level;
    player.powerUsed++;
  },

  //
  // Deactivates the CO power of a player.
  //
  // @param {cwt.Player} player
  //
  deactivatePower: function(player) {
    if (this.DEBUG) cwt.assert(player instanceof cwt.Player);

    player.activePower = cwt.INACTIVE;
  },

  //
  // Returns the cost for one CO star for a given player.
  //
  // @param {cwt.Player} player
  //
  getStarCost: function(player) {
    if (this.DEBUG) cwt.assert(player instanceof cwt.Player);

    var cost = cwt.Config.getValue("co_getStarCost");
    var used = player.powerUsed;

    // if usage counter is greater than max usage counter then use
    // only the maximum increase counter for calculation
    var maxUsed = cwt.Config.getValue("co_getStarCostIncreaseSteps");
    if (used > maxUsed) used = maxUsed;

    cost += used * cwt.Config.getValue("co_getStarCostIncrease");

    return cost;
  },

  //
  // Sets the main CO of a player.
  //
  // @param {cwt.Player} player
  // @param type
  //
  setMainCo: function(player, type) {
    if (this.DEBUG) cwt.assert(player instanceof cwt.Player);

    if (type === null) {
      player.coA = null;
    } else {
      if (this.DEBUG) cwt.assert(cwt.CoSheet.isValidSheet(type));

      player.coA = type;
    }
  }
};
