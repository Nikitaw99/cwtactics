package org.wolftec.cwtactics.game.event;

import org.wolftec.cwtactics.game.core.sysevent.SystemEvent;

public interface UnitDestroyed extends SystemEvent {
  void onUnitDestroyed(String unitEntity);
}
