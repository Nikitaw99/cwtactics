package org.wolfTec.cwt.game.model.types;

import org.stjs.javascript.Map;
import org.wolfTec.cwt.game.EngineGlobals;
import org.wolfTec.wolfTecEngine.data.IntValue;
import org.wolfTec.wolfTecEngine.data.StringKey;

public class AttackType {

  @IntValue(min = 1, max = EngineGlobals.MAX_SELECTION_RANGE)
  public Integer minrange;
  @IntValue(min = 2, max = EngineGlobals.MAX_SELECTION_RANGE)
  public Integer maxrange;

  @StringKey(minLength = 4, maxLength = 4)
  @IntValue(min = 0, max = 999)
  public Map<String, Integer> mainWeapon;

  @StringKey(minLength = 4, maxLength = 4)
  @IntValue(min = 0, max = 999)
  public Map<String, Integer> secondaryWeapon;
}
