package org.wolftec.cwtactics.engine.util;

import org.stjs.javascript.Array;
import org.stjs.javascript.JSObjectAdapter;
import org.stjs.javascript.Map;
import org.stjs.javascript.functions.Callback1;
import org.stjs.javascript.functions.Callback2;

public abstract class JsUtil {

  public static Array<String> objectKeys(Object obj) {
    return JSObjectAdapter.$js("Object.keys(obj)");
  }

  public static void forEachObjectKeys(Object obj, Callback1<String> callback) {
    objectKeys(obj).forEach(callback);
  }

  public static <T> void forEachObjectValue(Object obj, Callback2<String, T> callback) {
    Array<String> keys = objectKeys(obj);
    for (int i = 0; i < keys.$length(); i++) {
      String key = keys.$get(i);
      callback.$invoke(key, (T) JSObjectAdapter.$get(obj, key));
    }
  }

  public static <T> void forEachMapValue(Map<String, T> obj, Callback2<String, T> callback) {
    forEachObjectValue(obj, callback);
  }

  public static <T> void forEachArrayValue(Array<T> array, Callback2<Integer, T> callback) {
    for (int i = 0; i < array.$length(); i++) {
      callback.$invoke(i, array.$get(i));
    }
  }
}
