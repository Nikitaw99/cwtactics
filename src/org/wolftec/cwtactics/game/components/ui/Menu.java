package org.wolftec.cwtactics.game.components.ui;

import org.wolftec.cwtactics.game.core.CircularBuffer;
import org.wolftec.cwtactics.game.core.IEntityComponent;

public class Menu implements IEntityComponent {

  public CircularBuffer<String> menu;
}
