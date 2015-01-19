package net.wolfTec.utility;

import org.stjs.javascript.annotation.Template;

public abstract class ReadOnlyJsArray<T> {
  @Template("get") public native T $get(int index);
  @Template("toProperty") public native int $length();
}
