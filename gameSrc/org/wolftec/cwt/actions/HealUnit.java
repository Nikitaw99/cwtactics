package org.wolftec.cwt.actions;

import org.wolftec.cwt.core.action.Action;
import org.wolftec.cwt.core.action.ActionData;
import org.wolftec.cwt.core.action.ActionType;

public class HealUnit implements Action {

  @Override
  public String key() {
    return "healUnit";
  }

  @Override
  public ActionType type() {
    return ActionType.ENGINE_ACTION;
  }

  @Override
  public void evaluateByData(int delta, ActionData data) {
    // TODO Auto-generated method stub

  }

}
