package org.wolftec.cwt.model.sheets.types;

import org.stjs.javascript.JSCollections;
import org.stjs.javascript.Map;

public class AttackType
{
  public int                  minrange;
  public int                  maxrange;
  public Map<String, Integer> main_wp;
  public Map<String, Integer> sec_wp;

  public AttackType()
  {
    main_wp = JSCollections.$map();
    sec_wp = JSCollections.$map();
  }
}
