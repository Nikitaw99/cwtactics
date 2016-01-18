package org.wolftec.cwt.parameters;

import org.stjs.javascript.Map;
import org.stjs.javascript.functions.Callback0;
import org.wolftec.cwt.collection.ListUtil;
import org.wolftec.cwt.log.Log;
import org.wolftec.cwt.util.NullUtil;
import org.wolftec.cwt.util.Plugins;
import org.wolftec.cwt.util.UrlParameterUtil;

public class Parameters
{

  private Log log;
  private Plugins<ParameterAction> actions;

  public Parameters()
  {
    log = new Log(this);
    actions = new Plugins<>(ParameterAction.class);
  }

  public void invokeAllUrlParameterActions(Callback0 whenDone)
  {
    Map<String, String> parameters = UrlParameterUtil.getParameters();
    ListUtil.forEachArrayValueAsync(actions.getPlugins(), (index, action, next) ->
    {
      String parameterKey = action.watchesOnParameterKey();
      String parameterValue = parameters.$get(parameterKey);

      if (NullUtil.isPresent(parameterValue))
      {
        if (!action.isValid(parameterValue))
        {
          log.warn("url parameter value " + parameterValue + " for key " + parameterKey
              + " is not valid. Will be ingored.");
        }
        else
        {
          action.handle(parameterValue, next);
        }
      }

    } , whenDone);
  }
}
