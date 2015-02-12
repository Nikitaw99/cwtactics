package org.wolfTec.cwt.game.gamelogic;

import org.stjs.javascript.JSGlobal;
import org.wolfTec.cwt.game.EngineGlobals;
import org.wolfTec.cwt.game.model.Property;

public interface FactoryLogic extends CaptureLogic, BaseLogic {

  /**
   * Returns **true** when the given **property** is a factory, else **false**.
   *
   * @return
   */
  default boolean isFactory(Property prop) {
    return (prop.type.builds != JSGlobal.undefined);
  }

  /**
   * Returns **true** when the given **property** is a factory and can produce
   * something technically, else **false**.
   * 
   * @return
   */
  default boolean canProduce(Property prop) {
    if (isNeutral(prop)) return false;

    if (!isFactory(prop)) {
      return false;
    }

    // check left manpower
    if (prop.owner.manpower == 0) {
      return false;
    }

    // check unit limit and left slots
    int unitLimit = getGameConfig().getConfigValue("unitLimit");
    if (prop.owner.numberOfUnits >= unitLimit
        || prop.owner.numberOfUnits >= EngineGlobals.MAX_UNITS) {
      return false;
    }

    return true;
  }

}
