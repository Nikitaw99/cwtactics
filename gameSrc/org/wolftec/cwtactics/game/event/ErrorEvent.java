package org.wolftec.cwtactics.game.event;

import org.wolftec.cwtactics.game.IEvent;

public interface ErrorEvent extends IEvent {
  void onIllegalGameData(String message);
}
