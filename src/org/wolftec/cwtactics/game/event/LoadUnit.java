package org.wolftec.cwtactics.game.event;

import org.wolftec.cwtactics.game.core.sysevent.SystemEvent;

public interface LoadUnit extends SystemEvent {

  void onLoadUnit(String transporter, String load);
}
