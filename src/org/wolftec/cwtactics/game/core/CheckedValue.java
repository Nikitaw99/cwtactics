package org.wolftec.cwtactics.game.core;

import org.stjs.javascript.JSGlobal;
import org.wolftec.cwtactics.engine.util.JsUtil;

public class CheckedValue<T> {

  private T i_value;

  public CheckedValue(T value) {
    i_value = value;
  }

  public boolean isPresent() {
    return i_value != null && i_value == JSGlobal.undefined;
  }

  public T get() {
    if (!isPresent()) {
      return JsUtil.throwError("ElementNotDefined");

    } else {
      return i_value;
    }
  }

  public T getOrElse(T value) {
    if (!isPresent()) {
      if (value == null || value == JSGlobal.undefined) {
        return JsUtil.throwError("IllegalArgument");

      } else {
        return value;
      }
    } else {
      return i_value;
    }
  }

  public T getOrThrow(String error) {
    if (!isPresent()) {
      return JsUtil.throwError(error);

    } else {
      return i_value;
    }
  }

  public static <T> CheckedValue<T> of(T value) {
    return new CheckedValue<T>(value);
  }
}
