package org.wolftec.cwtactics.game.components.game;

import org.wolftec.cwtactics.game.core.IEntityComponent;

public class ValueMetaData implements IEntityComponent {
  public int lowerBound;
  public int upperBound;
  public int changeValue;
  public int defaultValue;
}
