package org.wolftec.cwt.i18n;

import org.stjs.javascript.Global;
import org.stjs.javascript.Map;
import org.stjs.javascript.functions.Callback0;
import org.wolftec.cwt.core.BrowserUtil;
import org.wolftec.cwt.core.FileDescriptor;
import org.wolftec.cwt.core.Grabber;
import org.wolftec.cwt.core.Injectable;
import org.wolftec.cwt.persistence.PersistenceManager;

public class LanguageLoader implements Injectable, Grabber {

  private LanguageManager lang;

  @Override
  public String forPath() {
    return "languages\\";
  }

  @Override
  public void grabData(PersistenceManager pm, FileDescriptor file, Callback0 completeCb) {
    BrowserUtil.requestJsonFile(file.path, (data, error) -> {
      pm.set(file.path, data, (saveErr, saveData) -> {
        completeCb.$invoke();
      });
    });
  }

  @Override
  public void loadData(PersistenceManager pm, FileDescriptor file, Callback0 completeCb) {
    pm.get(file.path, (err, data) -> {
      lang.registerLanguage(file.fileName, (Map<String, String>) Global.JSON.parse(data.toString()));
      completeCb.$invoke();
    });
  }

}
