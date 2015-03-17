package org.wolftec.cwtactics.system.input;

import org.stjs.javascript.Map;
import org.wolftec.container.ContainerUtil;
import org.wolftec.core.ComponentManager;
import org.wolftec.core.JsUtil;
import org.wolftec.core.ManagedComponent;
import org.wolftec.core.ManagedComponentInitialization;

@ManagedComponent
public class LiveInputManager implements ManagedComponentInitialization {

  private Map<String, Integer> p_actionStatus;
  private Map<String, Boolean> p_keyStatus;
  private Map<String, String> p_actionMapping;

  @Override
  public void onComponentConstruction(ComponentManager manager) {
    p_actionStatus = ContainerUtil.createMap();
    p_actionMapping = ContainerUtil.createMap();
    p_keyStatus = ContainerUtil.createMap();
  }

  public boolean isActionPressed(String action) {
    return p_actionStatus.$get(action) > 0;
  }

  public boolean isKeyPressed(String action) {
    return p_keyStatus.$get(action);
  }

  public void keyPressed(String key) {
    p_keyStatus.$put(key, true);
    Integer value = p_actionStatus.$get(key);
    if (JsUtil.isTruly(value)) {
      p_actionStatus.$put(key, value + 1);
    }
  }

  public void keyReleased(String key) {
    p_keyStatus.$put(key, false);
    Integer value = p_actionStatus.$get(key);
    if (JsUtil.isTruly(value)) {
      p_actionStatus.$put(key, value - 1);
    }
  }

  public void connectActionMapping(String keyId, String action) {
    p_actionMapping.$put(keyId, action);
  }

  public void disconnectActionMapping(String keyId) {
    p_actionMapping.$put(keyId, null);
  }
}
