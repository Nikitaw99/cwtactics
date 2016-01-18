package org.wolftec.cwt.system;

import org.stjs.javascript.Global;
import org.stjs.javascript.functions.Callback0;
import org.wolftec.cwt.log.Log;
import org.wolftec.cwt.parameters.ParameterAction;
import org.wolftec.cwt.serialization.StorageProvider;

public class SystemResetter implements ParameterAction
{

  public static final String WIPE_PARAMETER = "resetData";

  @Override
  public String watchesOnParameterKey()
  {
    return WIPE_PARAMETER;
  }

  @Override
  public boolean isValid(String parameterValue)
  {
    return parameterValue == "1" || parameterValue == "true";
  }

  @Override
  public void handle(String parameterValue, Callback0 whenDone)
  {
    new Log(this).info("going to clear the game storage");

    StorageProvider.getStorageProvider().clear((error) ->
    {
      String href = Global.window.document.location.href;

      // this invokes a reload of the game.. calling whenDone is not necessary
      Global.window.document.location.replace(href.substring(0, href.indexOf("?")));
    });
  }

}
