"use strict";

var relation = require("../relationship");
var renderer = require("../renderer");
var model = require("../model");

exports.action = {
  relation: ["S", "T", relation.RELATION_NONE, relation.RELATION_SAME_THING],

  condition: function (unit) {
    return unit.canAct;
  },

  invoke: function (unitId) {
    model.getUnit(unitId).setActable(false);
    renderer.renderUnitsOnScreen();
  }
};