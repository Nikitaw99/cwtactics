package org.wolftec.cwtactics;

import org.stjs.javascript.Array;
import org.stjs.javascript.JSStringAdapter;
import org.wolftec.cwtactics.engine.util.BrowserUtil;
import org.wolftec.cwtactics.game.core.CesKernel;
import org.wolftec.cwtactics.game.core.CheckedValue;
import org.wolftec.cwtactics.game.core.sysevent.SystemEventManager;
import org.wolftec.cwtactics.game.event.SystemStartEvent;

/**
 * Starter class with main function.
 */
public class Starter {
  public static void main(String[] args) {
    CesKernel.initObjects(grabForcedSystems());
    CesKernel.getObject(SystemEventManager.class).publish(SystemStartEvent.class).onSystemInitialized();
  }

  public static Array<String> grabForcedSystems() {
    return JSStringAdapter.split(CheckedValue.of(BrowserUtil.getUrlParameter("forcedConstruction")).getOrElse(""), ",");
  }
}
