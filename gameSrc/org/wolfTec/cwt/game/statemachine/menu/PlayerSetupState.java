package org.wolfTec.cwt.game.statemachine.menu;

import org.wolfTec.cwt.game.EngineGlobals;
import org.wolfTec.wolfTecEngine.statemachine.MenuState;
import org.wolfTec.wolfTecEngine.statemachine.State;

public class PlayerSetupState extends MenuState {

  @Override
  public String getId() {
    return EngineGlobals.STATE_GAMEROUND_PLAYER_SETUP;
  }

}
