package org.wolftec.cwt.system;

import org.stjs.javascript.Global;
import org.stjs.javascript.JSObjectAdapter;
import org.stjs.javascript.XMLHttpRequest;
import org.stjs.javascript.annotation.STJSBridge;
import org.stjs.javascript.functions.Callback1;

/**
 * Utility class which contains a lot of browser environment related functions.
 */
public abstract class RequestUtil {

  @STJSBridge
  public static interface ArrayBufferRespone {

  }

  public static class ResponseData<T> {
    public Option<T>      data;
    public Option<String> error;
  }

  /**
   * 
   * @param path
   * @param callback
   */
  public static void getText(String path, Callback1<ResponseData<String>> callback) {
    final XMLHttpRequest request = new XMLHttpRequest();

    request.onreadystatechange = () -> {
      if (request.readyState == 4) {
        ResponseData<String> response = new ResponseData<>();

        String err = null;
        String data = null;

        if (request.readyState == 4 && request.status == 200) {
          data = request.responseText;
        } else {
          err = request.statusText;
        }

        response.data = Option.ofNullable(data);
        response.error = Option.ofNullable(err);

        callback.$invoke(response);
      }
    };

    // create a randomized parameter for the URL to make sure it won't be cached
    request.open("get", path, true);

    request.send();
  }

  /**
   * 
   * @param path
   * @param callback
   */
  public static <T> void getJSON(String path, Callback1<ResponseData<T>> callback) {
    final XMLHttpRequest request = new XMLHttpRequest();

    request.onreadystatechange = () -> {
      if (request.readyState == 4) {
        ResponseData<T> response = new ResponseData<>();

        String err = null;
        T data = null;

        if (request.readyState == 4 && request.status == 200) {
          try {
            data = (T) Global.JSON.parse(request.responseText);
          } catch (Exception e) {
            err = e.toString();
          }
        } else {
          err = request.statusText;
        }

        response.data = Option.ofNullable(data);
        response.error = Option.ofNullable(err);

        callback.$invoke(response);
      }
    };

    // create a randomized parameter for the URL to make sure it won't be cached
    request.open("get", path, true);

    request.send();
  }

  /**
   * 
   * @param path
   * @param callback
   */
  public static void getArrayBuffer(String path, Callback1<ResponseData<ArrayBufferRespone>> callback) {
    final XMLHttpRequest request = new XMLHttpRequest();

    JSObjectAdapter.$js("request.responseType = 'arraybuffer'");
    request.onreadystatechange = () -> {
      if (request.readyState == 4) {
        ResponseData<ArrayBufferRespone> response = new ResponseData<>();

        String err = null;
        ArrayBufferRespone data = null;

        if (request.readyState == 4 && request.status == 200) {
          data = JSObjectAdapter.$js("request.response");
        } else {
          err = request.statusText;
        }

        response.data = Option.ofNullable(data);
        response.error = Option.ofNullable(err);

        callback.$invoke(response);
      }
    };

    // create a randomized parameter for the URL to make sure it won't be cached
    request.open("get", path, true);

    request.send();
  }
}
