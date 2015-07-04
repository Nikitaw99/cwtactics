package org.wolftec.cwtactics.game.event.game;

import org.stjs.javascript.Array;
import org.wolftec.cwtactics.game.core.SystemEvent;

public interface MoveEvent extends SystemEvent {
  default void onUnitMove(String unit, Array<Integer> steps) {
  }

  default void onUnitMoved(String unit, int fromX, int fromY, int toX, int toY) {
  }
}
