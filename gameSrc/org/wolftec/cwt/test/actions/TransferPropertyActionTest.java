package org.wolftec.cwt.test.actions;

import org.wolftec.cwt.actions.TransferProperty;
import org.wolftec.cwt.core.action.TileMeta;
import org.wolftec.cwt.core.util.JsUtil;
import org.wolftec.cwt.test.tools.AbstractCwtTest;

public class TransferPropertyActionTest extends AbstractCwtTest {

  private TransferProperty action;

  @Override
  protected void prepareModel() {
  }

  public void test_sourceMustBeOwnProperty() {
    test.assertThat.value(ActionsTest.sourceCheck(action, ActionsTest.fromPos(TileMeta.EMPTY), ActionsTest.fromPos(TileMeta.OWN))).is(true);
  }

  public void test_usableOnlyIfTheGoldValueOfThePropertyOwnerIsGreaterEqualsTheFundsValue() {
    JsUtil.throwError("test missing");
  }

  public void test_subMenuContainsAllPlayersExceptPropertyOwner() {
    JsUtil.throwError("test missing");
  }

  public void test_changesOwnerOfThePropertyToTheTargetPlayer() {
    JsUtil.throwError("test missing");
  }

  public void test_lowersTheGoldValueOfThePropertyOwnerByFundsValue() {
    JsUtil.throwError("test missing");
  }
}
