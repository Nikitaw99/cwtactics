package org.wolftec.cwtactics.game.event;

import org.wolftec.cwtactics.game.core.sysevent.SystemEvent;

public interface TurnEnd extends SystemEvent {

  void onTurnEnd(String player);
}
