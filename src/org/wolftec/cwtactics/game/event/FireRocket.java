package org.wolftec.cwtactics.game.event;

import org.wolftec.cwtactics.game.core.sysevent.SystemEvent;

public interface FireRocket extends SystemEvent {
  void onFireRocket(String silo, String firer, int tx, int ty);
}
