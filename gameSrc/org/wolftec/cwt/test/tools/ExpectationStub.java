package org.wolftec.cwt.test.tools;

import org.wolftec.cwt.core.input.InputManager;
import org.wolftec.cwt.core.util.JsUtil;
import org.wolftec.cwt.model.gameround.ModelManager;
import org.wolftec.cwt.model.gameround.Player;
import org.wolftec.cwt.states.UserInteractionData;

public class ExpectationStub {

  private ModelManager        gameModel;
  private UserInteractionData uiData;
  private InputManager        input;

  public ExpectationStub(ModelManager lGameModel, UserInteractionData lUiData) {
    gameModel = lGameModel;
    uiData = lUiData;
  }

  public void unitAt(int x, int y, String type, Player owner) {

  }

  public void propertyAt(int x, int y, String type, Player owner) {

  }

  public void player(int id) {

  }

  public void cursorAt(int x, int y) {
    if (!gameModel.isValidPosition(x, y)) {
      JsUtil.throwError("ExpectationFailed: illegal position");
    }
    uiData.cursorX = x;
    uiData.cursorY = y;
  }

  public void triggerAction(String action) {

  }

  public void releaseAction(String action) {

  }

}
