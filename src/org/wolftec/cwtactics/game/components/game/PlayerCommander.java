package org.wolftec.cwtactics.game.components.game;

import org.wolftec.cwtactics.game.core.IEntityComponent;

public class PlayerCommander implements IEntityComponent {

  public enum PowerLevel {
    NONE, POWER, SUPER_POWER
  }

  public int power;
  public PowerLevel activeLevel;
}
