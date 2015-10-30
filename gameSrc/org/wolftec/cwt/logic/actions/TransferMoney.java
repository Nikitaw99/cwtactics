package org.wolftec.cwt.logic.actions;

import org.wolftec.cwt.logic.features.LifecycleLogic;
import org.wolftec.cwt.logic.features.TeamLogic;
import org.wolftec.cwt.model.gameround.ModelManager;
import org.wolftec.cwt.states.UserInteractionData;
import org.wolftec.wTec.action.Action;
import org.wolftec.wTec.action.ActionData;
import org.wolftec.wTec.action.ActionType;
import org.wolftec.wTec.action.TileMeta;
import org.wolftec.wTec.state.StateFlowData;

public class TransferMoney implements Action {

  private TeamLogic team;
  private ModelManager model;
  private LifecycleLogic life;

  @Override
  public String key() {
    return "transferMoney";
  }

  @Override
  public ActionType type() {
    return ActionType.MAP_ACTION;
  }

  @Override
  public boolean hasSubMenu() {
    return true;
  }

  @Override
  public boolean checkTarget(TileMeta unitFlag, TileMeta propertyFlag) {
    return unitFlag == TileMeta.EMPTY && propertyFlag != TileMeta.OWN && propertyFlag != TileMeta.EMPTY;
  }

  @Override
  public boolean condition(UserInteractionData data) {
    return life.isCriticalProperty(data.target.property) && team.canTransferMoney(data.actor, data.target.property.owner);
  }

  @Override
  public void prepareActionMenu(UserInteractionData data) {
    team.getTransferMoneyTargets(data.actor, data);
  }

  @Override
  public void fillData(UserInteractionData interactionData, ActionData actionData) {
    actionData.p1 = interactionData.actor.id;
    actionData.p2 = interactionData.source.property.owner.id;
    actionData.p3 = interactionData.actionDataCode;
  }

  @Override
  public void evaluateByData(int delta, ActionData data, StateFlowData stateTransition) {
    team.transferMoney(model.getPlayer(data.p1), model.getPlayer(data.p2), data.p3);
  }
}
