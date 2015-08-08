package org.wolftec.cwt;

import org.stjs.javascript.JSObjectAdapter;
import org.stjs.javascript.annotation.GlobalScope;
import org.stjs.javascript.annotation.STJSBridge;
import org.stjs.javascript.functions.Callback0;
import org.wolftec.cwt.core.Injectable;
import org.wolftec.cwt.core.JsUtil;
import org.wolftec.cwt.input.InputManager;
import org.wolftec.cwt.input.backends.GamepadInput;
import org.wolftec.cwt.renderer.GraphicManager;
import org.wolftec.cwt.states.ActionManager;
import org.wolftec.cwt.states.State;
import org.wolftec.cwt.states.StateManager;
import org.wolftec.cwt.system.Log;

public class GameLoopManager implements Injectable {

  @GlobalScope
  @STJSBridge
  static class RequestAnimationFrameGlobal {
    native static void requestAnimationFrame(Callback0 handler);
  }

  private StateManager   sm;
  private InputManager   input;
  private Log            log;

  private ActionManager  actions;
  private GamepadInput   gamepad;
  private GraphicManager gfx;

  private boolean        active;

  private int            oldTime;
  private Callback0      loopFunction;

  @Override
  public void onConstruction() {
    active = false;

    /*
     * accessing the object with that is faster because loopFunction has not to
     * be bind against the loop object
     */
    final GameLoopManager that = this;

    oldTime = JSObjectAdapter.$js("new Date().getTime()");
    loopFunction = () -> {

      int now = JSObjectAdapter.$js("new Date().getTime()");
      int delta = now - that.oldTime;
      that.oldTime = now;

      that.update(delta);

      if (that.active) {
        RequestAnimationFrameGlobal.requestAnimationFrame(that.loopFunction);
      }
    };
  }

  /**
   * 
   * @param delta
   */
  public void update(int delta) {
    gamepad.checkData();

    // TODO commands into states
    if (actions.hasData()) {
      actions.invokeNext();
      return;
    }

    State activeState = sm.getActiveState();
    activeState.update(delta, input);
    activeState.render(delta, gfx);
  }

  /**
   * Starts the game state machine.
   */
  public void start() {
    if (active) {
      JsUtil.throwError("IllegalState");
      // TODO
    }

    active = true;
    log.info("starting game loop");

    RequestAnimationFrameGlobal.requestAnimationFrame(loopFunction);
  }

  public void stop() {
    active = false;
    log.info("stopping game loop");
  }
}
