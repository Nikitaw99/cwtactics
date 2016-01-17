package org.wolftec.cwt.i18n;

import org.stjs.javascript.JSObjectAdapter;
import org.stjs.javascript.functions.Callback0;
import org.wolftec.cwt.annotations.OptionalReturn;
import org.wolftec.cwt.loading.GameLoadingHandler;
import org.wolftec.cwt.log.Log;
import org.wolftec.cwt.serialization.PersistenceManager;
import org.wolftec.cwt.util.NullUtil;

class LanguageSelector implements GameLoadingHandler
{

  private Log log;
  private I18Service i18n;
  private PersistenceManager storage;

  @Override
  public int priority()
  {
    return 1;
  }

  private void tryToSelectLanguage(String key)
  {
    if (i18n.hasLanguage(key))
    {
      log.info("select language " + key);
      i18n.selectLanguage(key);
    }
  }

  @Override
  public void onLoad(Callback0 done)
  {
    storage.get("cfg.language", (error, keyValue) ->
    {
      if (NullUtil.isPresent(keyValue))
      {
        tryToSelectLanguage((String) keyValue);
        done.$invoke();

      }
      else
      {
        switch (NullUtil.getOrElse(browserLanguage(), "en"))
        {

          case "de":
          case "de-de":
          case "de-De":
          case "german":
          case "Deutsch":
            tryToSelectLanguage("de");
            break;

          case "en":
          default:
            tryToSelectLanguage("en");
            break;
        }

        done.$invoke();
      }
    });
  }

  @OptionalReturn
  private String browserLanguage()
  {
    return (String) JSObjectAdapter.$js("window.navigator.userLanguage || window.navigator.language");
  }
}
