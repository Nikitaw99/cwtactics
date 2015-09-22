package org.wolftec.cwt.test.tools;

import org.wolftec.cwt.core.test.Test;
import org.wolftec.cwt.model.ModelManager;
import org.wolftec.cwt.model.ModelResetter;
import org.wolftec.cwt.sheets.SheetManager;
import org.wolftec.cwt.states.UserInteractionData;

public abstract class AbstractCwtTest implements Test {

  protected SheetManager        sheets;
  protected ModelResetter       modelReset;
  protected ModelManager        model;
  protected UserInteractionData uiData;

  protected AssertionStub assertModel() {
    return new AssertionStub(model, uiData);
  }

  protected ExpectationStub expect() {
    return new ExpectationStub(model, uiData);
  }

  @Override
  public void beforeTest() {
    modelReset.reset();
    model.mapHeight = 40;
    model.mapWidth = 40;
    model.weather = sheets.weathers.get("WSUN");
    model.weatherLeftDays = 4;
    model.turnOwner = model.getPlayer(0);

    model.forEachTile((x, y, tile) -> {
      tile.type = sheets.tiles.get("PLIN");
    });

    uiData.cursorX = 0;
    uiData.cursorY = 0;
    uiData.actor = model.turnOwner;
  }
}
