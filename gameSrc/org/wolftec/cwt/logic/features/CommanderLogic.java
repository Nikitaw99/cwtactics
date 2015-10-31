package org.wolftec.cwt.logic.features;

import org.stjs.javascript.functions.Callback1;
import org.wolftec.cwt.Constants;
import org.wolftec.cwt.model.gameround.Player;
import org.wolftec.cwt.model.sheets.types.CommanderType;
import org.wolftec.cwt.system.Configurable;
import org.wolftec.cwt.system.Configuration;
import org.wolftec.cwt.system.ManagedClass;

public class CommanderLogic implements ManagedClass, Configurable {

  public final static int POWER_LEVEL_OFF = 0;
  public final static int POWER_LEVEL_COP = 1;
  public final static int POWER_LEVEL_SCOP = 2;
  public final static int POWER_LEVEL_TAG = 3;

  private Configuration cfgStarCost;
  private Configuration cfgStarCostIncrease;
  private Configuration cfgStarCostIncreaseSteps;
  private Configuration cfgCoLevel;

  @Override
  public void onConstruction() {
    cfgCoLevel = new Configuration("game.co.level", POWER_LEVEL_OFF, POWER_LEVEL_TAG, POWER_LEVEL_SCOP);
    cfgStarCost = new Configuration("game.co.stars.cost", 100, 50000, 9000, 100);
    cfgStarCostIncrease = new Configuration("game.co.stars.cost.increase.value", 0, 50000, 1800, 100);
    cfgStarCostIncreaseSteps = new Configuration("game.co.stars.cost.increase.steps", 0, 50, 10);
  }

  /**
   * 
   * @param player
   * @param value
   */
  public void modifyPlayerCoPower(Player player, int value) {
    player.power += value;
    if (player.power < 0) {
      player.power = 0;
    }
  }

  /**
   * 
   * @param player
   * @param powerLevel
   * @return
   */
  public boolean canActivatePower(Player player, int powerLevel) {
    if (cfgCoLevel.value < powerLevel) {
      return false;
    }

    // commanders must be available and current power must be inactive
    if (player.coA == null || player.activePower != POWER_LEVEL_OFF) {
      return false;
    }

    int stars = 0;
    switch (powerLevel) {

      case POWER_LEVEL_COP:
        stars = player.coA.coStars;
        break;

      case POWER_LEVEL_SCOP:
        stars = player.coA.scoStars;
        break;
    }

    return (player.power >= (getStarCost(player) * stars));
  }

  /**
   * 
   * @param player
   * @param level
   */
  public void activatePower(Player player, int level) {
    player.power = 0;
    player.activePower = level;
    player.powerUsed++;
  }

  /**
   * 
   * @param player
   */
  public void deactivatePower(Player player) {
    player.activePower = Constants.INACTIVE;
  }

  /**
   * 
   * @param player
   * @return
   */
  public int getStarCost(Player player) {
    int cost = cfgStarCost.value;
    int used = player.powerUsed;

    // if usage counter is greater than max usage counter then use
    // only the maximum increase counter for calculation
    int maxUsed = cfgStarCostIncreaseSteps.value;
    if (used > maxUsed) used = maxUsed;

    cost += used * cfgStarCostIncrease.value;

    return cost;
  }

  public void addActivatableLevelsToList(Player actor, Callback1<Integer> levelCb) {
    for (int i = POWER_LEVEL_COP; i <= POWER_LEVEL_SCOP; i++) {
      if (canActivatePower(actor, i)) {
        levelCb.$invoke(i);
      }
    }
  }

  public boolean isValidPowerlevel(int level) {
    return level >= POWER_LEVEL_OFF && level <= POWER_LEVEL_SCOP;
  }

  /**
   * @param player
   * @param type
   */
  public void setMainCo(Player player, CommanderType type) {
    player.coA = type;
  }
}
