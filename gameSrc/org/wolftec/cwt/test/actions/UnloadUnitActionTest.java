package org.wolftec.cwt.test.actions;

import org.wolftec.cwt.actions.LoadUnit;
import org.wolftec.cwt.core.action.TileMeta;
import org.wolftec.cwt.core.util.JsUtil;
import org.wolftec.cwt.test.tools.AbstractCwtTest;

public class UnloadUnitActionTest extends AbstractCwtTest {

  private LoadUnit action;

  public void test_sourceMustBeOwnUnit() {
    test.assertThat.value(ActionsTest.sourceCheck(action, ActionsTest.fromPos(TileMeta.OWN), ActionsTest.allPos())).is(true);
  }

  public void test_targetMustBeEmpty() {
    test.assertThat.value(ActionsTest.sourceCheck(action, ActionsTest.fromPos(TileMeta.EMPTY), ActionsTest.allPos())).is(true);
  }

  public void test_unloadTargetSelectionMapContainsEmptyFields() {
    JsUtil.throwError("test missing");
  }

  public void test_unloadTargetSelectionMapContainsHiddenFields() {
    JsUtil.throwError("test missing");
  }

  public void test_unloadTargetSelectionMapDoesNotContainsOccupiedFields() {
    JsUtil.throwError("test missing");
  }

  public void test_usableWhenTransporterHasLoads() {
    JsUtil.throwError("test missing");
  }

  public void test_unusableWhenTransporterIsEmpty() {
    JsUtil.throwError("test missing");
  }

  public void test_removesLoadFromTransporter() {
    JsUtil.throwError("test missing");
  }

  public void test_movesLoadToActionTargetTile() {
    JsUtil.throwError("test missing");
  }

}
