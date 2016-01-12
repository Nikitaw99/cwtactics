package org.wolftec.cwt.states.ingame;

import org.wolftec.cwt.input.InputService;
import org.wolftec.cwt.logic.MoveLogic;
import org.wolftec.cwt.model.gameround.ModelManager;
import org.wolftec.cwt.states.base.AbstractIngameState;
import org.wolftec.cwt.states.base.StateFlowData;
import org.wolftec.cwt.tags.Configurable;
import org.wolftec.cwt.tags.Configuration;
import org.wolftec.cwt.ui.UserInteractionData;

public class IngameMovepathSelectionState extends AbstractIngameState implements Configurable
{

  private UserInteractionData data;

  private MoveLogic    move;
  private ModelManager model;

  private Configuration fastClickMode;

  @Override
  public void onConstruction()
  {
    fastClickMode = new Configuration("app.input.fastClick", 0, 1, 0);
  }

  private void updateMovepath()
  {
    int x = data.cursorX;
    int y = data.cursorY;

    /*
     * selected tile is not in the selection -> ignore action
     */
    if (data.targets.getValue(x, y) < 0)
    {
      return;
    }

    int ox = data.target.x;
    int oy = data.target.y;
    int dis = model.getDistance(ox, oy, x, y);

    model.updatePositionData(data.target, x, y);

    if (dis == 1)
    {

      /*
       * Try to add the cursor move as code to the move path
       */
      move.addCodeToMovePath(move.codeFromAtoB(ox, oy, x, y), data.movePath, data.targets, data.source.x,
                             data.source.y);

    }
    else if (dis > 1)
    {

      /*
       * Generate a complete new path because between the old tile and the new
       * tile is at least another one tile
       */
      move.generateMovePath(data.source.x, data.source.y, x, y, data.targets, data.movePath);
    }
  }

  @Override
  public void onEnter(StateFlowData transition)
  {

    /*
     * when we do back steps in the game flow then we don't want to recreate an
     * already created move way
     */
    if (data.preventMovepathGeneration)
    {
      data.preventMovepathGeneration = false;
      return;
    }

    boolean breakMove = false;
    if (model.isTurnOwnerObject(data.source.unit) && data.source.unit.canAct)
    {
      data.movePath.clear();
      move.fillMoveMap(data.source, data.targets);

      // go directly into action menu when the unit cannot move
      if (!data.targets.hasActiveNeighbour(data.source.x, data.source.y))
      {
        breakMove = true;
      }

    }
    else
    {
      breakMove = true;
    }

    if (breakMove)
    {
      transition.setTransitionTo("IngameMenuState");
    }
  }

  @Override
  public void onExit(StateFlowData transition)
  {
    data.targets.reset();
  }

  @Override
  public void handleButtonA(StateFlowData transition, int delta)
  {
    if (model.getDistance(data.cursorX, data.cursorY, data.target.x, data.target.y) == 0 || fastClickMode.value == 1)
    {
      transition.setTransitionTo("IngameMenuState");
    }
  }

  @Override
  public void update(StateFlowData flowData, int delta, InputService input)
  {
    super.update(flowData, delta, input);
    updateMovepath();
  }
}
