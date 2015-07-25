package org.wolftec.cwt.actions.gameactions;

import org.stjs.javascript.Array;
import org.wolftec.cwt.actions.Action;
import org.wolftec.cwt.actions.ActionType;
import org.wolftec.cwt.model.ModelManager;

public class WaitUnit implements Action {

  ModelManager model;

  @Override
  public String key() {
    return "wait";
  }

  @Override
  public ActionType type() {
    return ActionType.UNIT_ACTION;
  }

  @Override
  public void action() {
    // TODO Auto-generated method stub

  }

  @Override
  public boolean condition() {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public Array<Integer> relationToProp() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void invoke(int p1, int p2, int p3, int p4, int p5) {

  }

}
