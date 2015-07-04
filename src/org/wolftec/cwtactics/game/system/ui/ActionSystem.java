package org.wolftec.cwtactics.game.system.ui;

import org.stjs.javascript.JSGlobal;
import org.stjs.javascript.JSObjectAdapter;
import org.stjs.javascript.annotation.SyntheticType;
import org.wolftec.cwtactics.Constants;
import org.wolftec.cwtactics.engine.bitset.BitSet;
import org.wolftec.cwtactics.game.ComponentHolder;
import org.wolftec.cwtactics.game.EntityId;
import org.wolftec.cwtactics.game.components.game.Capturable;
import org.wolftec.cwtactics.game.components.game.Owner;
import org.wolftec.cwtactics.game.components.game.Player;
import org.wolftec.cwtactics.game.components.game.Position;
import org.wolftec.cwtactics.game.components.game.Turn;
import org.wolftec.cwtactics.game.components.ui.ActionBuffer;
import org.wolftec.cwtactics.game.components.ui.Menu;
import org.wolftec.cwtactics.game.core.CircularBuffer;
import org.wolftec.cwtactics.game.core.ConstructedClass;
import org.wolftec.cwtactics.game.event.ErrorEvent;
import org.wolftec.cwtactics.game.event.NextFrameEvent;
import org.wolftec.cwtactics.game.event.ui.ActionEvents;

public class ActionSystem implements ConstructedClass, ActionEvents, NextFrameEvent {

  @SyntheticType
  public class ActionData {
    String command;
    int sx;
    int sy;
    int tx;
    int ty;
  }

  private BitSet flags;

  private ErrorEvent errors;
  private ActionEvents actions;

  private ComponentHolder<Menu> menus;
  private ComponentHolder<Turn> turns;
  private ComponentHolder<Owner> owners;
  private ComponentHolder<Player> players;
  private ComponentHolder<Position> positions;
  private ComponentHolder<Capturable> capturables;
  private ComponentHolder<ActionBuffer> buffers;

  @Override
  public void onConstruction() {
    flags = new BitSet();
    buffers.get(EntityId.GAME_UI).buffer = new CircularBuffer<String>(Constants.COMMAND_BUFFER_SIZE);
  }

  @Override
  public void addAction(String key, boolean enabled) {
    menus.get(EntityId.GAME_UI).menu.add(key);
  }

  @Override
  public void onTriggerAction(String action) {
    // TODO not enough here to invoke actions later
    ActionData data = (ActionData) JSObjectAdapter.$js("{}");
    data.command = action;
    data.sx = 0;
    data.sy = 0;
    data.tx = 0;
    data.ty = 0;
    buffers.get(EntityId.GAME_UI).buffer.add(JSGlobal.JSON.stringify(data));
  }

  @Override
  public void onNextFrame(int delta) {
    CircularBuffer<String> buffer = buffers.get(EntityId.GAME_UI).buffer;
    if (!buffer.isEmpty()) {
      ActionData data = (ActionData) JSGlobal.JSON.parse(buffer.popFirst());
      actions.invokeAction(data.command, data.sx, data.sy, data.tx, data.ty);
    }
  }

  @Override
  public void onTriggerActionGeneration(int x, int y) {
    if (flags == null) {
      errors.onIllegalState("cannot trigger menu generation twice at the same time");
      return;
    }

    // localize instance vars to improve performance
    BitSet accFlags = this.flags;
    ComponentHolder<Owner> owners = this.owners;
    // localize instance vars to improve performance

    flags = null;

    accFlags.clear();
    positions.each((entity, pos) -> {
      if (pos.x == x && pos.y == y) {
        Owner owner = owners.get(entity);

        if (owner == null) {
          accFlags.set(FLAG_SOURCE_PROP_NONE);

        } else {
          Turn turn = turns.get(EntityId.GAME_ROUND);
          int gap = capturables.has(entity) ? 0 : FLAG_UNIT_GAP_START;

          /* show found object type (property or unit) */
          accFlags.set(gap);

          if (owner.owner == turn.owner) {
            accFlags.set(FLAG_SOURCE_PROP_TO + gap);

          } else if (players.get(owner.owner).team == players.get(turn.owner).team) {
            accFlags.set(FLAG_SOURCE_PROP_TO_ALLIED + gap);

          } else {
            accFlags.set(FLAG_SOURCE_PROP_TO_ENEMY + gap);
          }
        }
      }
    });

    flags = accFlags;
  }
}
