package org.wolftec.cwt.core;

import org.stjs.javascript.functions.Callback0;
import org.stjs.javascript.functions.Callback1;
import org.wolftec.cwt.system.Maybe;

public interface DataLoader {

  String forPath();

  /**
   * Loads the given data key from the remote data location.
   * 
   * @param entryDesc
   * @param doneCb
   */
  void downloadRemoteFolder(FileDescriptor entryDesc, Callback1<Maybe<Object>> doneCb);

  /**
   * Loads the given data key from the local data location.
   * 
   * @param entryDesc
   * @param entry
   * @param doneCb
   */
  void handlerFolderEntry(FileDescriptor entryDesc, Object entry, Callback0 doneCb);
}
