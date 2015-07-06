package org.wolftec.cwtactics.test.game;

import org.wolftec.cwtactics.game.core.sysobject.Asserter;
import org.wolftec.cwtactics.game.core.sysobject.Log;
import org.wolftec.cwtactics.game.core.systems.System;
import org.wolftec.cwtactics.test.core.ITest;

public class ExampleTest implements ITest, System {

  private Log      log;
  private Asserter asserter;

  @Override
  public void beforeTest() {
    log.info("cleanup asserter");
    asserter.resetFailureDetection();
  }

  @Override
  public void afterTest() {
    log.info("check assertion faults");
    asserter.throwErrorWhenFailureDetected();
  }

  public void testWhichSucceeds() {
    asserter.inspectValue("myInt", 10).isInt();
    asserter.inspectValue("myString", "MyString").isString();
  }

  public void testWhichFails() {
    asserter.inspectValue("myInt", 10).isString();
  }
}
