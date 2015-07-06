package org.wolftec.cwtactics.game.factory;

import org.wolftec.cwtactics.game.core.syscomponent.Components;
import org.wolftec.cwtactics.game.core.sysobject.Asserter;
import org.wolftec.cwtactics.game.core.sysobject.Log;
import org.wolftec.cwtactics.game.core.systems.System;
import org.wolftec.cwtactics.game.event.BuildUnit;
import org.wolftec.cwtactics.game.event.IllegalGameData;
import org.wolftec.cwtactics.game.event.LoadPropertyType;
import org.wolftec.cwtactics.game.event.LoadUnitType;
import org.wolftec.cwtactics.game.event.UnitProduced;
import org.wolftec.cwtactics.game.map.Position;
import org.wolftec.cwtactics.game.player.Owner;

public class FactorySystem implements System, BuildUnit, LoadUnitType, LoadPropertyType {

  Log                  log;
  Asserter             asserter;

  IllegalGameData      illegalGameDataExc;
  UnitProduced         producedEvent;

  Components<Buyable>  buyables;
  Components<Factory>  factories;
  Components<Owner>    owners;
  Components<Position> positions;

  @Override
  public void onLoadUnitType(String entity, Object data) {
    Buyable buyable = buyables.acquireWithRootData(entity, data);
    asserter.inspectValue("Buyable.cost of " + entity, buyable.cost).isIntWithinRange(0, 999999);
  }

  @Override
  public void onLoadPropertyType(String entity, Object data) {
    Factory factory = factories.acquireWithRootData(entity, data);
    asserter.inspectValue("Factory.builds of " + entity, factory.builds).forEachArrayValue((value) -> {
      asserter.isEntityId();
    });
  }

  @Override
  public void onBuildUnit(String factory, String type) {
    Factory factoryData = factories.get(factory);

    checkBuildData(type, factoryData);

    String unit = "XYSAS"; // TODO FIIIIIIIX IT !!!!

    Owner unitOwner = owners.acquire(unit);
    Owner factoryOwner = owners.get(factory);
    Position unitPos = positions.acquire(unit);
    Position factoryPos = positions.get(factory);

    unitOwner.owner = factoryOwner.owner;
    unitPos.x = factoryPos.x;
    unitPos.y = factoryPos.y;

    em.setEntityPrototype(unit, type); // TODO FIIIIIIIX IT !!!!

    log.info("produced a unit [ID:" + unit + ", Type: " + type + "]");

    producedEvent.onUnitProduced(unit, type, unitPos.x, unitPos.y);
  }

  private void checkBuildData(String type, Factory factoryData) {
    if (factoryData == null) {
      illegalGameDataExc.onIllegalGameData("NotAFactory");

    } else if (factoryData.builds.indexOf(type) == -1) {
      illegalGameDataExc.onIllegalGameData("TypeIsNotProcuceAble");
    }
  }
}
