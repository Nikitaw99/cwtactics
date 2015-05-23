package org.wolftec.cwtactics.game.system;

import org.wolftec.cwtactics.game.components.objects.OwnableCmp;
import org.wolftec.cwtactics.game.components.objects.PlayerCmp;

public class PlayerSys implements ISystem {

  @Override
  public void onInit() {

    events().UNIT_DESTROYED.subscribe((unit) -> {
      OwnableCmp ownC = entityManager().getEntityComponent(unit, OwnableCmp.class);
      entityManager().getEntityComponent(ownC.owner, PlayerCmp.class).numOfUnits--;
    });

    events().UNIT_CREATED.subscribe((unit) -> {
      OwnableCmp ownC = entityManager().getEntityComponent(unit, OwnableCmp.class);
      entityManager().getEntityComponent(ownC.owner, PlayerCmp.class).numOfUnits++;
    });
  }
}
