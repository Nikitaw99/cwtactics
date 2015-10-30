package org.wolftec.cwt.logic.actions;

import org.wolftec.cwt.logic.features.HideLogic;
import org.wolftec.cwt.model.gameround.ModelManager;
import org.wolftec.cwt.states.UserInteractionData;
import org.wolftec.wTec.action.Action;
import org.wolftec.wTec.action.ActionData;
import org.wolftec.wTec.action.ActionType;
import org.wolftec.wTec.state.StateFlowData;

public class HideUnit implements Action {

  private HideLogic    hide;
  private ModelManager model;

  @Override
  public String key() {
    return "unitHide";
  }

  @Override
  public ActionType type() {
    return ActionType.UNIT_ACTION;
  }

  @Override
  public boolean condition(UserInteractionData data) {
    return hide.canHide(data.source.unit);
  }

  @Override
  public void fillData(UserInteractionData interactionData, ActionData actionData) {
    actionData.p1 = interactionData.source.unitId;
  }

  @Override
  public void evaluateByData(int delta, ActionData data, StateFlowData stateTransition) {
    hide.hide(model.getUnit(data.p1));
  }
}
