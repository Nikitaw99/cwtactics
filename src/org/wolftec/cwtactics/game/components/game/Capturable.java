package org.wolftec.cwtactics.game.components.game;

import org.wolftec.cwtactics.game.core.IEntityComponent;

public class Capturable implements IEntityComponent {
  public int points;
  public boolean looseAfterCaptured;
  public String changeIntoAfterCaptured;
}
