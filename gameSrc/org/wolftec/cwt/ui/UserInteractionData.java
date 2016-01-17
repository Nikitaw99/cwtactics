package org.wolftec.cwt.ui;

import org.wolftec.cwt.Constants;
import org.wolftec.cwt.action.Action;
import org.wolftec.cwt.action.ActionService;
import org.wolftec.cwt.collection.MatrixSegment;
import org.wolftec.cwt.collection.RingList;
import org.wolftec.cwt.log.Log;
import org.wolftec.cwt.managed.ManagedClass;
import org.wolftec.cwt.model.gameround.Player;
import org.wolftec.cwt.model.gameround.PositionData;
import org.wolftec.cwt.util.AssertUtil;
import org.wolftec.cwt.util.NumberUtil;

public class UserInteractionData implements ManagedClass
{

  private Log log;

  private ActionService actions;

  public Player actor;

  public PositionData source;
  public PositionData target;
  public PositionData actionTarget;

  public RingList<Integer> movePath;

  public RingList<String> infos;
  public int infoIndex;

  public String action;
  public int actionCode;

  public String actionData;
  public int actionDataCode;

  public MatrixSegment targets;

  public int cursorX;
  public int cursorY;

  public boolean preventMovepathGeneration;

  @Override
  public void onConstruction()
  {
    source = new PositionData();
    target = new PositionData();
    actionTarget = new PositionData();

    movePath = new RingList<>(Constants.MAX_SELECTION_RANGE);
    infos = new RingList<>(50);

    targets = new MatrixSegment(Constants.MAX_SELECTION_RANGE);
  }

  public void addInfo(String key, boolean flag)
  {
    if (flag)
    {
      infos.push(key);
      log.info("added user action [" + key + "]");
    }
  }

  public void cleanInfos()
  {
    infos.clear();
    infoIndex = 0;
    log.info("cleaned user actions");
  }

  public int getNumberOfInfos()
  {
    return infos.getSize();
  }

  public Action getAction()
  {
    return actions.getAction(action);
  }

  public void increaseIndex()
  {
    infoIndex++;
    if (infoIndex == getNumberOfInfos())
    {
      infoIndex = 0;
    }
    log.info("current selected user action [" + getInfo() + "]");
  }

  public void decreaseIndex()
  {
    infoIndex--;
    if (infoIndex < 0)
    {
      infoIndex = getNumberOfInfos() - 1;
    }
    log.info("current selected user action [" + getInfo() + "]");
  }

  public String getInfo()
  {
    return infos.get(infoIndex);
  }

  public String getInfoAtIndex(int index)
  {
    return infos.get(index);
  }

  public void selectInfoAtIndex(int index)
  {
    AssertUtil.assertThat(index >= 0 && index < getNumberOfInfos(), "IllegalIndex");
    infoIndex = 0;
    updateActionData();
  }

  public void updateActionData()
  {
    actionData = getInfo();
    actionDataCode = NumberUtil.asIntOrElse(actionData, Constants.INACTIVE);
  }

  public void reset()
  {
    cursorX = 0;
    cursorY = 0;
    actor = null;
    source.clean();
    target.clean();
    actionTarget.clean();
    action = "";
    actionCode = -1;
    actionData = "";
    actionDataCode = -1;
    movePath.clear();
    cleanInfos();
  }
}
