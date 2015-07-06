package org.wolftec.cwtactics.game.fog;

import org.stjs.javascript.Array;
import org.stjs.javascript.JSCollections;
import org.wolftec.cwtactics.Constants;
import org.wolftec.cwtactics.Entities;
import org.wolftec.cwtactics.game.core.syscomponent.Components;
import org.wolftec.cwtactics.game.core.sysobject.Asserter;
import org.wolftec.cwtactics.game.core.systems.System;
import org.wolftec.cwtactics.game.event.CapturedProperty;
import org.wolftec.cwtactics.game.event.LoadPropertyType;
import org.wolftec.cwtactics.game.event.LoadTileType;
import org.wolftec.cwtactics.game.event.LoadUnitType;
import org.wolftec.cwtactics.game.event.UnitDestroyed;
import org.wolftec.cwtactics.game.event.UnitMoved;
import org.wolftec.cwtactics.game.event.UnitProduced;
import org.wolftec.cwtactics.game.event.VisibilityChanged;
import org.wolftec.cwtactics.game.map.Position;
import org.wolftec.cwtactics.game.player.Owner;
import org.wolftec.cwtactics.game.turn.Turn;

public class FogSystem implements System, UnitProduced, UnitDestroyed, UnitMoved, CapturedProperty, LoadTileType, LoadPropertyType, LoadUnitType {

  private Asserter              asserter;

  private VisibilityChanged     visibilityChangedEvent;

  private Components<Vision>    visioners;
  private Components<Visible>   visibles;
  private Components<Position>  positions;
  private Components<Turn>      turns;
  private Components<Owner>     owners;

  private Array<Array<Integer>> turnOwnerData;
  private Array<Array<Integer>> clientOwnerData;

  @Override
  public void onConstruction() {
    initDataMap();
  }

  private void initDataMap() {
    turnOwnerData = JSCollections.$array();
    clientOwnerData = JSCollections.$array();

    for (int x = 0; x < Constants.MAX_MAP_SIDE_LENGTH; x++) {
      turnOwnerData.push(JSCollections.$array());
      clientOwnerData.push(JSCollections.$array());
    }

    resetData();
  }

  /**
   * Sets every field of the fog data map to zero.
   */
  private void resetData() {
    for (int x = 0; x < Constants.MAX_MAP_SIDE_LENGTH; x++) {

      turnOwnerData.push(JSCollections.$array());
      clientOwnerData.push(JSCollections.$array());

      for (int y = 0; y < Constants.MAX_MAP_SIDE_LENGTH; y++) {
        turnOwnerData.$get(x).$set(y, 0);
        clientOwnerData.$get(x).$set(y, 0);
      }
    }
  }

  @Override
  public void onLoadUnitType(String entity, Object data) {
    Vision vision = visioners.acquireWithRootData(entity, data);
    asserter.inspectValue("Vision.range of " + entity, vision.range).isIntWithinRange(1, Constants.MAX_SELECTION_RANGE);
  }

  @Override
  public void onLoadPropertyType(String entity, Object data) {
    Vision vision = visioners.acquireWithRootData(entity, data);
    asserter.inspectValue("Vision.range of " + entity, vision.range).isIntWithinRange(0, Constants.MAX_SELECTION_RANGE);
  }

  @Override
  public void onLoadTileType(String entity, Object data) {
    Visible visible = visibles.acquireWithRootData(entity, data);
    asserter.inspectValue("Visible.blocksVision of " + entity, visible.blocksVision).isBoolean();
  }

  @Override
  public void onCapturedProperty(String property, String newOwner, String oldOwner) {
    changeEntityVision(property, isTurnOwner(oldOwner), isClientOwner(oldOwner), -1);
    changeEntityVision(property, isTurnOwner(newOwner), isClientOwner(newOwner), +1);
  }

  @Override
  public void onUnitProduced(String unit, String type, int x, int y) {
    changeEntityVision(unit, isTurnOwner(unitOwner(unit)), isClientOwner(unitOwner(unit)), +1);
  }

  @Override
  public void onUnitDestroyed(String unit) {
    changeEntityVision(unit, isTurnOwner(unitOwner(unit)), isClientOwner(unitOwner(unit)), -1);
  }

  @Override
  public void onUnitMoved(String unit, int fromX, int fromY, int toX, int toY) {
    boolean clientOwnerObject = isClientOwner(unitOwner(unit));
    boolean turnOwnerObject = isTurnOwner(unitOwner(unit));

    changeEntityVisionByPosition(unit, turnOwnerObject, clientOwnerObject, fromX, fromY, -1);
    changeEntityVisionByPosition(unit, turnOwnerObject, clientOwnerObject, toX, toY, +1);
  }

  private void changeEntityVision(String entity, boolean turnOwnerAffect, boolean clientOwnerAffect, int change) {
    if (!turnOwnerAffect && !clientOwnerAffect) return;

    Position pos = positions.get(entity);
    changeEntityVisionByPosition(entity, turnOwnerAffect, clientOwnerAffect, pos.x, pos.y, change);
  }

  private void changeEntityVisionByPosition(String entity, boolean turnOwnerAffect, boolean clientOwnerAffect, int x, int y, int change) {
    if (!turnOwnerAffect && !clientOwnerAffect) return;

    Vision vision = visioners.get(entity);
    if (turnOwnerAffect) changeVision(turnOwnerData, x, y, vision.range, change, true);
    if (clientOwnerAffect) changeVision(clientOwnerData, x, y, vision.range, change, false);
  }

  private void changeVision(Array<Array<Integer>> data, int x, int y, int range, int change, boolean publishEvents) {
    int xe = x + range;
    int ye = y + range;

    // TODO may use real bounds to save iterations
    if (xe >= Constants.MAX_MAP_SIDE_LENGTH) xe = Constants.MAX_MAP_SIDE_LENGTH - 1;
    if (ye >= Constants.MAX_MAP_SIDE_LENGTH) ye = Constants.MAX_MAP_SIDE_LENGTH - 1;

    x -= range;
    y -= range;

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    int oy = y;
    for (; x <= xe; x++) {
      Array<Integer> column = data.$get(x);
      for (y = oy; y <= ye; y++) {

        int oldVision = column.$get(y);
        column.$set(y, oldVision + change);

        if (publishEvents) {
          if (column.$get(y) == 0 && oldVision > 0) {
            visibilityChangedEvent.onVisibilityChanged(x, y, false);

          } else if (column.$get(y) > 0 && oldVision == 0) {
            visibilityChangedEvent.onVisibilityChanged(x, y, true);
          }
        }
      }
    }
  }

  /**
   * 
   * @param unit
   * @return unit owner
   */
  private String unitOwner(String unit) {
    return owners.get(unit).owner;
  }

  /**
   * 
   * @param owner
   * @return true when the given owner is the turn owner
   */
  private boolean isTurnOwner(String owner) {
    return (owner == turns.get(Entities.GAME_ROUND).owner);
  }

  /**
   * 
   * @param owner
   * @return true when the given owner is the client visible player
   */
  private boolean isClientOwner(String owner) {
    return (owner == turns.get(Entities.GAME_ROUND).lastClientOwner);
  }
}
