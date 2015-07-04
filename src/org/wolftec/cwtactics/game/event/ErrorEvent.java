package org.wolftec.cwtactics.game.event;

import org.wolftec.cwtactics.game.core.SystemEvent;

public interface ErrorEvent extends SystemEvent {
  default void onIllegalGameData(String message) {
  }

  default void onIllegalArguments(String message) {
  }

  default void onIllegalState(String message) {
  }
}
