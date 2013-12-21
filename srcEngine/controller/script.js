//
//
controller.script_DESCRITORS = {
  MOVE_TYPE: 0,
  TILE_TYPE: 1,
  UNIT_TYPE: 2,
  ATTACK_TYPE: 3
};

//
//
controller.script_VALUES = {

  // attack types
  DIRECT: 0,
  INDIRECT: 1,
  BALLISTIC: 2

};

// Holds the current script tags
//
controller.scriptTags = {};

// Holds all scriptable var boundaries
//
controller.scriptBoundaries_ = {};

// Script memory that holds the data of the current object in focus.
//
controller.script_memory_ = util.list(200);

(function() {
  //
  //
  controller.script_memoryMapperFn_ = function(string, isValue) {
    var value;

    if (isValue) {
      // check value strings

      // try to extract static values
      value = controller.script_VALUES[string];
      if (value !== void 0) return value;

      // try to extract sheet indexes
      for (var i = 1; i >= 0; i--) {
        switch (i) {

          case 0: // units types
            value = model.data_unitSheets[string];
            break;

          case 1: // tile/property types
            value = model.data_tileSheets[string];
            break;
        }

        // extract index (=value) from sheet object itself
        if (value) return value.__sheetIndex__;
      }
    } else  {
      // check descriptor strings
      value = controller.script_DESCRITORS[string];
    }

    assert(value !== void 0, "unknown script string mapping");
    return value;
  };

  // Parses a set of rules in a list `data` or a string that represents the same, into
  // a valid jsonScript rule list. A converter (`listener`) converts all strings in the
  // list to numeric representations. This numbers must map to correct positions in the
  // used memory array.
  //
  controller.script_memoryMapper = function(data) {
    for (var ri = 0, re = data.length; ri < re; ri++) {
      var rule = data[ri];

      // check $when
      if (typeof rule.$when !== 'undefined') {
        
        var whenBlock = rule.$when;
        assert(whenBlock.length % 2 === 0,"when block length must be odd");

        for (var wi = 0, we = whenBlock.length; wi < we; wi += 2) {

        }
      }
    }

    // return converted rule list
    return data;
  };
})();

// Defines a scriptable variable to control the 
// game data via rules.
//
controller.defineGameScriptable = function(name, min, max) {

  // check name and meta data
  if (!name || controller.scriptBoundaries_.hasOwnProperty(name) || max < min) {
    model.criticalError(
      error.ILLEGAL_PARAMETERS,
      error.ILLEGAL_CONFIG_VAR_DEFINTION
    );
  }

  controller.scriptBoundaries_[name] = [min, max];
};

// Generates script tags based on a position pair
//
controller.prepareTags = function(x, y, uid, fx, fy, fuid) {
  var tags = controller.scriptTags;

  if (tags.__oldUnit__) tags[tags.__oldUnit__] = false;
  if (tags.__oldTile__) tags[tags.__oldTile__] = false;

  tags.INDIRECT = false;
  tags.DIRECT = false;

  var unit = (uid > -1) ? model.unit_data[uid] : model.unit_posData[x][y];
  if (unit) {
    tags.__oldUnit__ = unit.type.ID;
    tags[tags.__oldUnit__] = true;

    if (model.battle_isIndirectUnit((uid > -1) ? uid :
      model.unit_extractId(unit))) tags.INDIRECT = true;
    else tags.DIRECT = true;

  }

  var tileTp = model.map_data[x][y].ID;
  var prop = model.property_posMap[x][y];
  if (prop) {
    tileTp = prop.type.ID;
  }

  tags.__oldTile__ = tileTp;
  tags[tags.__oldTile__] = true;

  // FOCUS TILE GIVEN
  if (arguments.length > 3) {

    tags.OTHER_INDIRECT = false;
    tags.OTHER_DIRECT = false;

    unit = (fuid > -1) ? model.unit_data[fuid] : model.unit_posData[fx][fy];
    if (unit) {
      if (model.battle_isIndirectUnit((fuid > -1) ? fuid :
        model.unit_extractId(unit))) tags.OTHER_INDIRECT = true;
      else tags.OTHER_DIRECT = true;
    }
  }
};

(function() {

  // Solves an attribute (`attrName`) by iterating all rules from a `ruleList` in interconnection
  // to a given memory array (`memory`). A preset value (`value`) can be defined. If not then the
  // value `0` will be used as start value.
  //
  var solve = function(ruleList, memory, attrName, value) {

    // default start value is `0`
    if (typeof value !== 'number') value = 0;

    // evaluate all rules in the rule list
    for (var i = 0, e = ruleList.length; i < e; i++) {
      var rule = ruleList[i];

      // ignore null
      if (rule === null) continue;

      var attrVal = rule[attrName];

      // evaluate if the attribute is given in the rule
      if (typeof attrVal === "number") {

        var ruleSolvesTrue = true;

        // check all conditions if given
        var list = rule.$when;
        if (list) {

          for (var li = 0, le = list.length; li < le; li += 2) {
            var slot = memory[list[li]];
            var check = list[li + 1];

            var attrSolvesTrue = false;

            // **CHECK:** between values check
            if (check[0] === true) {
              if (slot >= check[1] && slot <= check[2]) {
                attrSolvesTrue = true;
              }
            }
            // **IS:** is value check
            else {
              for (var ci = 0, ce = check.length; ci < ce; ci++) {
                if (slot === check[ci]) {
                  attrSolvesTrue = true;
                  break;
                }
              }
            }

            // when the condition fails then stop the process and ignore this rule
            if (!attrSolvesTrue) {
              ruleSolvesTrue = false;
              break;
            }
          }
        }

        // change value when it`s condition matches
        if (ruleSolvesTrue) {

          // setter rule ?
          if (rule.$set) value = 0;

          // modify value
          value += attrVal;
        }
      }
    }

    // return result
    return value;
  };

  // Returns the value of a game attribute.
  //
  controller.scriptedValue = function(pid, attr, value) {
    assert(util.isInt(value));

    var tags = controller.scriptTags;

    // global effects
    value = solve(model.rule_global, tags, attr, value);

    // map effects
    value = solve(model.rule_map, tags, attr, value);

    // co effects
    var co = model.co_data[pid].coA;
    var weather = true;
    if (co) {
      value = solve(co.d2d, tags, attr, value);

      // neutralized weather ?
      weather = (solve(co.d2d, tags, "neutralizeWeather", 0) === 0);

      // active power ?
      if (model.co_data[pid].level >= model.co_POWER_LEVEL.COP) {
        if (model.co_data[pid].level === model.co_POWER_LEVEL.COP) {
          value = solve(co.cop.turn, tags, attr, value);
        } else if (model.co_data[pid].level === model.co_POWER_LEVEL.SCOP) {
          value = solve(co.scop.turn, tags, attr, value);
        }
      }
    }

    // weather effects
    var wth = model.weather_data;
    if (weather && wth) value = solve(wth.rules, tags, attr, value);

    // check boundaries
    var bounds = controller.scriptBoundaries_[attr];
    if (value < bounds[0]) value = bounds[0];
    else if (value > bounds[1]) value = bounds[1];

    // return calculated value
    return value;
  };
})();

controller.scriptedValueByRules = function(rules, pid, attr, value) {
  console.log("::WARNING:: this should not be used! ::WARNING::");
};