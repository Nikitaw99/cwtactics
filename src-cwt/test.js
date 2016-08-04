/*global R, RExt, Cg*/

var Ct = typeof process != "undefined" ?
  (exports.Ct = {}) :
  (window.Ct || (window.Ct = {}));

Ct.assertThat = (expression, msg) =>
  R.ifElse(
    R.equals(true),
    R.always({
      expectation: "PASSED"
    }),
    R.always({
      expectation: "FAILED",
      reason: msg
    }))(expression);

Ct.assertNeverCalled =
  any => Ct.assertThat(false, "unreachable point was reached: " + any);

Ct.assertStartsWith = R.curry(
  (startsWith, string) => Ct.assertThat(string.indexOf(startsWith) === 0, "expected: " + string + " to starts with " + startsWith));

Ct.assertEquals = R.curry(
  (expected, actual) => Ct.assertThat(expected === actual, "expected: " + expected + ", but was: " + actual));

Ct.assertNotEquals = R.curry(
  (expected, actual) => Ct.assertThat(expected !== actual, "expected different than: " + expected + ", but was equal"));

Ct.specification = (description, expectations) => () => R.pipe(
  R.always({
    description,
    type: "specification",
    cases: R.map(expectation => expectation(), expectations),
    status: {
      executionTimeInMs: -1
    }
  }),
  data => R.set(
    RExt.nestedPath(["status", "executionTimeInMs"]),
    R.reduce((sum, expectation) => sum + expectation.status.executionTimeInMs, 0, data.cases),
    data),
  data => R.set(
    RExt.nestedPath(["status", "expectation"]),
    R.any(R.where({
      status: R.complement(R.equals("PASSED"))
    }), data.cases),
    data),
  data => R.over(
    RExt.nestedPath(["status", "expectation"]),
    R.ifElse(
      R.equals(true),
      R.always("PASSED"),
      R.always("FAILED")),
    data)
)();

Ct.expectation = (description, expectation) => () => ({
  description,
  type: "expectation",
  status: RExt
    .IO(() => expectation)
    .map(test => {
      const startTime = Date.now();
      const result = RExt.Either.tryIt(test).fold(
        err => ({
          status: "CRASHED",
          reason: err.message
        }),
        R.identity);
      const executionTimeInMs = Date.now() - startTime;
      return {
        executionTimeInMs,
        status: result.expectation,
        reason: RExt.Maybe(result.reason).toString()
      };
    })
    .run()
});

Ct.foldEither = R.invoker(2, "fold");

Ct.testGameModel = Object.freeze({
  "fog": R.times(() => R.times(() => R.F, 10), 10),
  "map": {
    "tiles": R.times(() => R.times(() => R.clone({
      type: "PLIN"
    }), 10), 10)
  },
  "tileTypes": {},
  "cfg": {},
  "turn": {
    "day": 0,
    "owner": 0
  },
  "players": R.times(() => R.clone({
    "name": "Player",
    "team": 1,
    "gold": 0,
    "power": 0,
    "activePowerLevel": 1
  }), 4),
  "properties": R.times(i => R.clone({
    "type": "PRTA",
    "points": 20,
    "owner": -1,
    "x": parseInt(i / 10, 10),
    "y": i % 10
  }), 300),
  "units": R.times(i => R.clone({
    "hp": 99,
    "owner": -1,
    "type": "UNTA",
    "fuel": 0,
    "x": parseInt(i / 10, 10),
    "y": i % 10
  }), 200),
  "weather": {
    "day": 0,
    "type": ""
  },
  "actables": R.times(R.F, 50),
  "limits": {
    "leftDays": null,
    "leftTurnTime": null,
    "leftGameTime": null,
    "minimumProperties": 0
  },
  "unitTypes": {
    "UNTA": {
      "moveType": "MVTA"
    },
    "UNTD": {
      "minRange": 1,
      "maxRange": 1,
      "mainWeaponDamage": {
        "UNTD": 10,
        "UNTI": 20
      },
      "secondaryWeaponDamage": {
        "UNTD": 10
      }
    },
    "UNTI": {
      "minRange": 2,
      "maxRange": 3,
      "mainWeaponDamage": {
        "UNTD": 30,
        "UNTI": 30
      }
    }
  },
  "moveTypes": {
    "MVTA": {
      "costs": {
        "TITA": 2,
        "*": 1
      }
    }
  },
  "propertyTypes": {
    "PRTA": {
      "funds": 1000,
      "builds": ["UNTA"]
    },
    "PRTB": {}
  },
  "weatherTypes": {
    "WSUN": {}
  }
});

Ct.createGameSpec = Ct.specification("Create-Game", [
  Ct.expectation("declines illegal weather types", Ct.assertNeverCalled),
  Ct.expectation("declines illegal property types", Ct.assertNeverCalled),
  Ct.expectation("declines illegal unit types", Ct.assertNeverCalled),
  Ct.expectation("declines illegal move types", Ct.assertNeverCalled),
  Ct.expectation("declines illegal limits", Ct.assertNeverCalled),
  Ct.expectation("declines illegal actables", Ct.assertNeverCalled),
  Ct.expectation("declines illegal weathers", Ct.assertNeverCalled),
  Ct.expectation("declines illegal units", Ct.assertNeverCalled),
  Ct.expectation("declines illegal properties", Ct.assertNeverCalled),
  Ct.expectation("declines illegal players", Ct.assertNeverCalled),
  Ct.expectation("declines illegal turn", Ct.assertNeverCalled),
  Ct.expectation("declines illegal config", Ct.assertNeverCalled),
  Ct.expectation("declines illegal tile types", Ct.assertNeverCalled),
  Ct.expectation("declines illegal map", Ct.assertNeverCalled),
  Ct.expectation("declines illegal fog", Ct.assertNeverCalled),
  Ct.expectation("creates valid model", Ct.assertNeverCalled)
]);

Ct.moveSpec = Ct.specification("Unit-Movement", [
  Ct.expectation("declines when move path is illegal", Ct.assertNeverCalled),
  Ct.expectation("declines when costs of move path exceeds move range", Ct.assertNeverCalled),
  Ct.expectation("declines when costs of move path exceeds fuel", Ct.assertNeverCalled),
  Ct.expectation("declines when move path is blocked by an enemy unit", Ct.assertNeverCalled),
  Ct.expectation("can move through own units", Ct.assertNeverCalled),
  Ct.expectation("own unit as move target is accepted because handled by action itself", Ct.assertNeverCalled),
  Ct.expectation("updates fog when moving from a to b", Ct.assertNeverCalled),
  Ct.expectation("falls down to wait action when move path is blocked", Ct.assertNeverCalled)
]);

Ct.nextTurnSpec = Ct.specification("map action: next turn", [
  Ct.expectation("changes turn owner",
    R.pipe(
      R.always(Ct.testGameModel),
      Cg.nextTurn,
      R.map(R.view(R.lensPath(["turn", "owner"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertNotEquals(Ct.testGameModel.turn.owner)))),

  Ct.expectation("when the last player ends his turn, then the day counter increases",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(R.lensPath(["turn", "owner"]), 3),
      Cg.nextTurn,
      R.map(R.view(R.lensPath(["turn", "day"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(Ct.testGameModel.turn.day + 1)))),

  Ct.expectation("after a day change the day limit counter decreases",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(R.lensPath(["turn", "owner"]), 3),
      Cg.nextTurn,
      R.map(R.view(R.lensPath(["limits", "leftDays"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(Ct.testGameModel.limits.leftDays - 1)))),

  Ct.expectation("increases the gold of the turn owner by the sum of all funds given by properties",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(RExt.nestedPath(["properties"]), R.map(R.evolve({
        owner: R.always(-1)
      }))),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "type"]), "PRTA"),
      R.set(RExt.nestedPath(["properties", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["properties", 1, "type"]), "PRTA"),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "funds"]), 1000),
      R.set(RExt.nestedPath(["players", 1, "gold"]), 0),
      R.set(RExt.nestedPath(["turn", "owner"]), 0),
      Cg.nextTurn,
      R.map(R.view(RExt.nestedPath(["players", 1, "gold"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(2000)))),

  Ct.expectation("updates fog according to the objects of the new turn owner", Ct.assertNeverCalled)
]);

Ct.waitSpec = Ct.specification("Unit-Action: Wait", [
  Ct.moveSpec,

  Ct.expectation("sets the unit into wait status",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(R.lensProp("actables"), R.over(R.lensIndex(0), R.T)),
      R.curry(Cg.wait)(0),
      R.map(R.view(R.lensPath(["actables", 0]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(false)))),

  Ct.expectation("does not changes the state of other units",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(R.lensProp("actables"), R.map(R.T)),
      R.curry(Cg.wait)(0),
      R.map(R.view(R.lensProp("actables"))),
      R.map(R.reduce((a, b) => b ? a + 1 : a, 0)),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(49)))),

  Ct.expectation("cannot set unit into wait status if unit id is illegal (left OOB)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.wait)(-1),
      Ct.foldEither(Ct.assertStartsWith("IAE-IUI"), Ct.assertNeverCalled))),

  Ct.expectation("cannot set unit into wait status if unit id is illegal (right OOB)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.wait)(50),
      Ct.foldEither(Ct.assertStartsWith("IAE-IUI"), Ct.assertNeverCalled))),

  Ct.expectation("cannot set unit into wait status if they cannot act",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(R.lensProp("actables"), R.over(R.lensIndex(0), R.F)),
      R.curry(Cg.wait)(0),
      Ct.foldEither(Ct.assertStartsWith("IAE-UCA"), Ct.assertNeverCalled)))
]);

Ct.captureSpec = Ct.specification("Unit-Action: Capture", [
  Ct.moveSpec,

  Ct.expectation("game declines call when capturer and property aren't on the same tile",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 2),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 2),
      R.curry(Cg.captureProperty)(0, 0),
      Ct.foldEither(Ct.assertStartsWith("IAE-SFE"), Ct.assertNeverCalled)
    )),

  Ct.expectation("game declines call on illegal unit id (left-oob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.captureProperty)(-1, 0),
      Ct.foldEither(Ct.assertStartsWith("IAE-IUI"), Ct.assertNeverCalled)
    )),

  Ct.expectation("game declines call on illegal unit id (right-oob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.captureProperty)(50, 0),
      Ct.foldEither(Ct.assertStartsWith("IAE-IUI"), Ct.assertNeverCalled)
    )),

  Ct.expectation("game declines call on non-actable unit id",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), false),
      R.curry(Cg.captureProperty)(0, 0),
      Ct.foldEither(Ct.assertStartsWith("IAE-UCA"), Ct.assertNeverCalled)
    )),

  Ct.expectation("game declines call when capturer and property are in the same team",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.set(RExt.nestedPath(["players", 0, "team"]), 1),
      R.set(RExt.nestedPath(["players", 1, "team"]), 1),
      R.curry(Cg.captureProperty)(0, 0),
      Ct.foldEither(Ct.assertStartsWith("IAE-DTE"), Ct.assertNeverCalled)
    )),

  Ct.expectation("a capture lowers the capture points of the property",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "points"]), 20),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.curry(Cg.captureProperty)(0, 0),
      R.map(R.view(RExt.nestedPath(["properties", 0, "points"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(10))
    )),

  Ct.expectation("the capture value is hp relative",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "points"]), 20),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.curry(Cg.captureProperty)(0, 0),
      R.map(R.view(RExt.nestedPath(["properties", 0, "points"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(15))
    )),

  Ct.expectation("a capture changes the owner of the property if points fall down to zero",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "points"]), 10),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.curry(Cg.captureProperty)(0, 0),
      R.map(R.view(RExt.nestedPath(["properties", 0]))),
      Ct.foldEither(Ct.assertNeverCalled, R.allPass([
        R.propSatisfies(Ct.assertEquals(20), "points"),
        R.propSatisfies(Ct.assertEquals(0), "owner")
      ]))
    )),

  Ct.expectation("a capture changes the type of the property if changes type is given",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "points"]), 10),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.curry(Cg.captureProperty)(0, 0),
      R.map(R.view(RExt.nestedPath(["properties", 0]))),
      Ct.foldEither(Ct.assertNeverCalled, R.pipe(
        R.tap(R.propSatisfies(Ct.assertEquals(20), "points")),
        R.tap(R.propSatisfies(Ct.assertEquals(0), "owner"))))
    )),

  Ct.expectation("property changes its type when capture_change_to is given",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "points"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "type"]), "PRTA"),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "capture_change_to"]), "PRTB"),
      R.set(RExt.nestedPath(["players", 0, "team"]), 1),
      R.set(RExt.nestedPath(["players", 1, "team"]), 2),
      R.curry(Cg.captureProperty)(0, 0),
      R.map(R.view(RExt.nestedPath(["properties", 0, "type"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals("PRTB"))
    )),

  Ct.expectation("changing owner leads into a loss of the previous owner when capture_loose_after_captured is enabled",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "points"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "type"]), "PRTA"),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "capture_loose_after_captured"]), true),
      R.curry(Cg.captureProperty)(0, 0),
      Ct.foldEither(Ct.assertNeverCalled, R.pipe(
        R.where({
          properties: R.pipe(R.reduce((a, b) => b.owner == 1 ? a + 1 : a, 0), Ct.assertEquals(0)),
          players: R.pipe(R.nth(0), R.prop("team"), Ct.assertEquals(-1))
        })
      ))
    )),

  Ct.expectation("changing owner leads into loss of the old owner when its left properties are lower than the minimum amount",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "points"]), 1),
      R.set(RExt.nestedPath(["players", 0, "team"]), 1),
      R.set(RExt.nestedPath(["players", 1, "team"]), 2),
      R.set(RExt.nestedPath(["limits", "minimumProperties"]), 5),
      R.curry(Cg.captureProperty)(0, 0),
      Ct.foldEither(Ct.assertNeverCalled, R.where({
        properties: R.pipe(R.reduce((a, b) => b.owner == 1 ? a + 1 : a, 0), Ct.assertEquals(0)),
        players: R.pipe(R.nth(1), R.prop("team"), Ct.assertEquals(-1))
      }))
    )),

  Ct.expectation("updates fog when property is captured", Ct.assertNeverCalled)
]);

Ct.fireRocketSpec = Ct.specification("fire rocket", [
  Ct.moveSpec,

  Ct.expectation("illegal position will be declined",
    R.pipe(
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(0, 0, -1, 0),
        Ct.foldEither(Ct.assertStartsWith("IAE-IPV"), Ct.assertNeverCalled)),
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(0, 0, 0, -1),
        Ct.foldEither(Ct.assertStartsWith("IAE-IPV"), Ct.assertNeverCalled)),
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(0, 0, 1000, 0),
        Ct.foldEither(Ct.assertStartsWith("IAE-IPV"), Ct.assertNeverCalled)),
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(0, 0, 0, 1000),
        Ct.foldEither(Ct.assertStartsWith("IAE-IPV"), Ct.assertNeverCalled)))),

  Ct.expectation("illegal firer id will be declined",
    R.pipe(
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(0, -1, 0, 0),
        Ct.foldEither(Ct.assertStartsWith("IAE-IUI"), Ct.assertNeverCalled)),
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(0, 50, 0, 0),
        Ct.foldEither(Ct.assertStartsWith("IAE-IUI"), Ct.assertNeverCalled)))),

  Ct.expectation("illegal rocket silo id will be declined",
    R.pipe(
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(-1, 0, 0, 0),
        Ct.foldEither(Ct.assertStartsWith("IAE-IPI"), Ct.assertNeverCalled)),
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.fireRocket)(300, 0, 0, 0),
        Ct.foldEither(Ct.assertStartsWith("IAE-IPI"), Ct.assertNeverCalled)))),

  Ct.expectation("non rocket silo will be declined",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "rocket_range"]), 0),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "canFireRockets"]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.curry(Cg.fireRocket)(0, 0, 2, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:ipt"), Ct.assertNeverCalled)
    )),

  Ct.expectation("when firer doesnt able to fire a rocket silo then the call will be declined",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "rocket_range"]), 1),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "canFireRockets"]), false),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.curry(Cg.fireRocket)(0, 0, 2, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iut"), Ct.assertNeverCalled)
    )),

  Ct.expectation("when firer isnt on the rocket silo then the call will be declined",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "rocket_range"]), 1),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "canFireRockets"]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.curry(Cg.fireRocket)(0, 0, 2, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:spe"), Ct.assertNeverCalled)
    )),

  Ct.expectation("damages all units in range at the target position",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), -1),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "rocket_range"]), 3),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "canFireRockets"]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 1, "x"]), 4),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 2, "x"]), 5),
      R.set(RExt.nestedPath(["units", 2, "y"]), 0),
      R.set(RExt.nestedPath(["units", 2, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 3, "x"]), 6),
      R.set(RExt.nestedPath(["units", 3, "y"]), 0),
      R.set(RExt.nestedPath(["units", 3, "owner"]), 2),
      R.curry(Cg.fireRocket)(0, 0, 5, 0),
      Ct.foldEither(Ct.assertNeverCalled, R.where({
        units: R.pipe(
          R.take(4),
          R.takeLast(3),
          R.map(R.prop("hp")),
          R.all(Ct.assertEquals(79)))
      }))
    )),

  Ct.expectation("damages no unit that are not in the range at the target position",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), -1),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "rocket_range"]), 1),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "canFireRockets"]), true),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.curry(Cg.fireRocket)(0, 0, 2, 0),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(99))
    ))
]);

Ct.elapseTimeSpec = Ct.specification("elapse time", [

  Ct.expectation("negative time will be declined",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.elapseTime)(-100),
      Ct.foldEither(Ct.assertStartsWith("IAE-PIE"), Ct.assertNeverCalled)
    )),

  Ct.expectation("decreases the left turn time in the limit object",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["limits", "leftTurnTime"]), 100),
      R.curry(Cg.elapseTime)(50),
      R.map(R.view(RExt.nestedPath(["limits", "leftTurnTime"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(50))
    )),

  Ct.expectation("decreases the left game time in the limit object",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["limits", "leftGameTime"]), 100),
      R.curry(Cg.elapseTime)(50),
      R.map(R.view(RExt.nestedPath(["limits", "leftGameTime"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(50))
    )),

  Ct.expectation("increases turn owner when leftTurnTime falls down to zero",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["limits", "leftTurnTime"]), 100),
      R.set(RExt.nestedPath(["turn", "owner"]), 0),
      R.curry(Cg.elapseTime)(100),
      R.map(R.view(RExt.nestedPath(["turn", "owner"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(1))
    )),

  Ct.expectation("deactivates all players when game timit falls dawn to zero",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["limits", "leftGameTime"]), 100),
      R.curry(Cg.elapseTime)(100),
      R.map(R.view(RExt.nestedPath(["players"]))),
      R.map(R.reduce((a, b) => b.team > -1 ? a + 1 : a, 0)),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(0))
    ))
]);

Ct.yieldGameSpec = Ct.specification("yield game", [

  Ct.expectation("decilines when a player is already disabled",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "team"]), -1),
      R.curry(Cg.yieldGame)(0),
      Ct.foldEither(Ct.assertStartsWith("iae:pad"), Ct.assertNeverCalled)
    )),

  Ct.expectation("decilines when the player id is invalid",
    R.pipe(
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.yieldGame)(-1),
        Ct.foldEither(Ct.assertStartsWith("iae:ipi"), Ct.assertNeverCalled)
      ),
      R.pipe(
        R.always(Ct.testGameModel),
        R.curry(Cg.yieldGame)(4),
        Ct.foldEither(Ct.assertStartsWith("iae:ipi"), Ct.assertNeverCalled)
      ))),

  Ct.expectation("when a player yields then he/she will be disabled",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.yieldGame)(0),
      R.map(R.view(RExt.nestedPath(["players", 0, "team"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(-1))
    ))
]);

Ct.produceUnitSpec = Ct.specification("produce unit", [

  Ct.expectation("declined when factory does not belongs to the turn owner",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 1),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(Ct.assertStartsWith("iae:nto"), Ct.assertNeverCalled))),

  Ct.expectation("declined when factory id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.curry(Cg.produceUnit)(-1, "UNTA"),
      Ct.foldEither(Ct.assertStartsWith("iae:ipi"), Ct.assertNeverCalled))),

  Ct.expectation("declined when factory id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.curry(Cg.produceUnit)(-1, "UNTA"),
      Ct.foldEither(Ct.assertStartsWith("iae:ipi"), Ct.assertNeverCalled))),

  Ct.expectation("declined when unit type is invalid",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.curry(Cg.produceUnit)(0, "UNKN"),
      Ct.foldEither(Ct.assertStartsWith("iae:utn"), Ct.assertNeverCalled))),

  Ct.expectation("declined when player has too much units",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(
        RExt.nestedPath(["units"]),
        R.map(R.evolve({
          owner: R.always(0)
        }))),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(Ct.assertStartsWith("iae:nfs"), Ct.assertNeverCalled))),

  Ct.expectation("declined when player has not enough gold",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 0),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "costs"]), 1),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(Ct.assertStartsWith("iae:isf"), Ct.assertNeverCalled))),

  Ct.expectation("declined when factory is occuppied by an unit",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.set(RExt.nestedPath(["units", 0, "x"]), 1),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 1),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(Ct.assertStartsWith("iae:tio"), Ct.assertNeverCalled))),

  Ct.expectation("declined when factory cannot build the given unit type",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 1),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "costs"]), 1),
      R.over(RExt.nestedPath(["propertyTypes", "PRTA", "builds"]), R.without(["UNTA"])),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(Ct.assertStartsWith("iae:cbt"), Ct.assertNeverCalled))),

  Ct.expectation("subtracts the unit costs from the factory owners gold",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 1),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "costs"]), 1),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(
        Ct.assertNeverCalled,
        R.pipe(R.view(RExt.nestedPath(["players", 0, "gold"])), Ct.assertEquals(0))))),

  Ct.expectation("creates a new unit on the factory",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(
        RExt.nestedPath(["units"]),
        R.map(R.evolve({
          owner: R.always(-1)
        }))),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "costs"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(Ct.assertNeverCalled, R.pipe(
        R.view(RExt.nestedPath(["units", 0])),
        unit => "{" + unit.x + "," + unit.y + "}",
        Ct.assertEquals("{0,0}"))))),

  Ct.expectation("created new unit cannot act in the active turn",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(
        RExt.nestedPath(["units"]),
        R.map(R.evolve({
          owner: R.always(-1)
        }))),
      R.set(RExt.nestedPath(["players", 0, "gold"]), 99999),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "costs"]), 1),
      R.curry(Cg.produceUnit)(0, "UNTA"),
      Ct.foldEither(Ct.assertNeverCalled, R.pipe(
        R.view(RExt.nestedPath(["actables", 0])),
        Ct.assertEquals(false))))),
]);

Ct.destroyUnitSpec = Ct.specification("destroy unit", [

  Ct.expectation("declined when unit id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.destroyUnit)(50),
      Ct.foldEither(Ct.assertStartsWith("iae:iui"), Ct.assertNeverCalled))),

  Ct.expectation("declined when unit id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.destroyUnit)(-1),
      Ct.foldEither(Ct.assertStartsWith("iae:iui"), Ct.assertNeverCalled))),

  Ct.expectation("removes unit from the game round",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.destroyUnit)(0),
      R.map(R.view(RExt.nestedPath(["units", 0, "owner"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(-1)))),

  Ct.expectation("player does looses game when he/she has at least one units left an noUnitsLeftMeansLoose is enabled",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(
        RExt.nestedPath(["units"]),
        R.map(R.evolve({
          owner: R.always(-1)
        }))),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 0),
      R.set(RExt.nestedPath(["cfg", "noUnitsLeftMeansLoose"]), true),
      R.curry(Cg.destroyUnit)(0),
      R.map(R.view(RExt.nestedPath(["players", 0, "team"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(1)))),

  Ct.expectation("player looses game when he/she has no units left an noUnitsLeftMeansLoose is enabled",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(
        RExt.nestedPath(["units"]),
        R.map(R.evolve({
          owner: R.always(-1)
        }))),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["cfg", "noUnitsLeftMeansLoose"]), true),
      R.curry(Cg.destroyUnit)(0),
      R.map(R.view(RExt.nestedPath(["players", 0, "team"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(-1)))),

  Ct.expectation("updates fog", Ct.assertNeverCalled)
]);

Ct.attackUnitSpec = Ct.specification("attack units", [
  Ct.moveSpec,

  Ct.expectation("declined when attacker id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.attackUnit)(50, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:att"), Ct.assertNeverCalled))),

  Ct.expectation("declined when attacker id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.attackUnit)(-1, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:att"), Ct.assertNeverCalled))),

  Ct.expectation("declined when defender id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.attackUnit)(0, 50),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:def"), Ct.assertNeverCalled))),

  Ct.expectation("declined when defender id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.attackUnit)(0, -1),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:def"), Ct.assertNeverCalled))),

  Ct.expectation("declined when attacker cannot act",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), false),
      R.curry(Cg.attackUnit)(0, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:uca"), Ct.assertNeverCalled))),

  Ct.expectation("attack lowers defenders health",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 1, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertNotEquals(99)))),

  Ct.expectation("defender lowers attackers health when he/she survives and is direct and standing on a neighbour tile",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertNotEquals(99)))),

  Ct.expectation("defender does not lowers attackers health when he/she dies",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 1),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(99)))),

  Ct.expectation("defender does not lowers attackers health when he/she does not standing on a neighbour tile",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTI"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 3),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(99)))),

  Ct.expectation("defender does not lowers attackers health when he/she is indirect",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTI"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(99)))),

  Ct.expectation("attackers damage is relative to it's hp",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTI"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(84)))),

  Ct.expectation("defenders couter attack damage is relative to it's hp",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(74)))),

  Ct.expectation("attackers damage is relative to defenders tile defence",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["tileTypes", "TITA", "defence"]), 5),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 1, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(74)))),

  Ct.expectation("attackers damage is relative to defenders property defence when tile is occuppied by a property",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 1),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["tileTypes", "TITA", "defence"]), 5),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "defence"]), 2),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 1, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(89)))),

  Ct.expectation("defenders couter attack damage is relative to attackers tile defence",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["map", "tiles", 0, 0]), "TITB"),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["tileTypes", "TITB", "defence"]), 5),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(74)))),

  Ct.expectation("defenders couter attack damage is relative to attackers property defence when tile is occuppied by a property",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["properties", 0, "x"]), 0),
      R.set(RExt.nestedPath(["properties", 0, "y"]), 0),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["tileTypes", "TITA", "defence"]), 0),
      R.set(RExt.nestedPath(["propertyTypes", "PRTA", "defence"]), 2),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 1, "hp"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(79)))),

  Ct.expectation("attacker uses main weapon if given and ammo is greater zero",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "secondaryWeaponDamage", "UNTD"]), 10),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 1, "health"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(49)))),

  Ct.expectation("attacker uses secondary weapon if exists and ammo is zero",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 0),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "secondaryWeaponDamage", "UNTD"]), 10),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 1, "health"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(89)))),

  Ct.expectation("primary weapon attacks does uses ammo",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "ammo"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(0)))),

  Ct.expectation("secondary weapon attacks does not uses ammo",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.dissocPath(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"])),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "secondaryWeaponDamage", "UNTD"]), 10),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "ammo"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(1)))),

  Ct.expectation("attackers owner power value increases by damage dealt",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "costs"]), 2000),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "secondaryWeaponDamage", "UNTD"]), 10),
      R.set(RExt.nestedPath(["players", 0, "power"]), 0),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["players", 0, "power"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertThat(R.gte(R.__, 500))))),

  Ct.expectation("attackers owner power value increases by damage received from counter",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "costs"]), 2000),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "secondaryWeaponDamage", "UNTD"]), 10),
      R.set(RExt.nestedPath(["players", 0, "power"]), 0),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["players", 0, "power"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertThat(R.gte(R.__, 1000))))),

  Ct.expectation("defenders owner power value increases by damage received ",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "costs"]), 2000),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "secondaryWeaponDamage", "UNTD"]), 10),
      R.set(RExt.nestedPath(["players", 0, "power"]), 0),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["players", 0, "power"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertThat(R.gte(R.__, 1000))))),

  Ct.expectation("defenders owner power value increases by damage dealt from counter",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["units", 0, "hp"]), 49),
      R.set(RExt.nestedPath(["units", 0, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 0),
      R.set(RExt.nestedPath(["units", 0, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["units", 1, "hp"]), 99),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 0),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTD"),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "costs"]), 2000),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "mainWeaponDamage", "UNTD"]), 50),
      R.set(RExt.nestedPath(["unitTypes", "UNTD", "secondaryWeaponDamage", "UNTD"]), 10),
      R.set(RExt.nestedPath(["players", 0, "power"]), 0),
      R.curry(Cg.attackUnit)(0, 1),
      R.map(R.view(RExt.nestedPath(["players", 0, "power"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertThat(R.gte(R.__, 1500))))),

  Ct.expectation("updates fog when counter attack kills attacker and fog is enabled", Ct.assertNeverCalled),
  Ct.expectation("does not updates fog when counter attack kills attacker and fog is disabled", Ct.assertNeverCalled)
]);

Ct.activatePowerSpec = Ct.specification("activate power", [
  Ct.moveSpec,

  Ct.expectation("declined when the player is is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.activatePower)(-1),
      Ct.foldEither(Ct.assertStartsWith("iae:ipl"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player is is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.activatePower)(4),
      Ct.foldEither(Ct.assertStartsWith("iae:ipl"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player is is invalid (deactivated)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "team"]), -1),
      R.curry(Cg.activatePower)(0),
      Ct.foldEither(Ct.assertStartsWith("iae:ipl"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player has already an activated power",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "activePowerLevel"]), 2),
      R.curry(Cg.activatePower)(0),
      Ct.foldEither(Ct.assertStartsWith("ise:paa"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player has not enough power to activate", Ct.assertNeverCalled),

  Ct.expectation("set the power level of the player to POWER",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "activePowerLevel"]), 1),
      R.curry(Cg.activatePower)(0),
      R.map(R.view(RExt.nestedPath(["players", 0, "activePowerLevel"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(2)))),

  Ct.expectation("sets the power value of the player to zero",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "activePowerLevel"]), 1),
      R.set(RExt.nestedPath(["players", 0, "power"]), 1000),
      R.curry(Cg.activatePower)(0),
      R.map(R.view(RExt.nestedPath(["players", 0, "power"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(0))))
]);

Ct.activateSuperPowerSpec = Ct.specification("activate super power", [
  Ct.moveSpec,

  Ct.expectation("declined when the player is is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.activateSuperPower)(-1),
      Ct.foldEither(Ct.assertStartsWith("iae:ipl"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player is is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.activateSuperPower)(4),
      Ct.foldEither(Ct.assertStartsWith("iae:ipl"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player is is invalid (deactivated)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "team"]), -1),
      R.curry(Cg.activateSuperPower)(0),
      Ct.foldEither(Ct.assertStartsWith("iae:ipl"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player has already an activated power",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "activePowerLevel"]), 2),
      R.curry(Cg.activateSuperPower)(0),
      Ct.foldEither(Ct.assertStartsWith("ise:paa"), Ct.assertNeverCalled))),

  Ct.expectation("declined when the player has not enough power to activate", Ct.assertNeverCalled),

  Ct.expectation("set the power level of the player to POWER",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "activePowerLevel"]), 1),
      R.curry(Cg.activateSuperPower)(0),
      R.map(R.view(RExt.nestedPath(["players", 0, "activePowerLevel"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(3)))),

  Ct.expectation("sets the power value of the player to zero",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["players", 0, "activePowerLevel"]), 1),
      R.set(RExt.nestedPath(["players", 0, "power"]), 1000),
      R.curry(Cg.activateSuperPower)(0),
      R.map(R.view(RExt.nestedPath(["players", 0, "power"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(0))))
]);

Ct.resupplyNeightboursSpec = Ct.specification("resupply neightbours", [
  Ct.moveSpec,

  Ct.expectation("declines when supplier id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(-1),
      Ct.foldEither(Ct.assertStartsWith("iae:iui"), Ct.assertNeverCalled))),

  Ct.expectation("declines when supplier id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(50),
      Ct.foldEither(Ct.assertStartsWith("iae:iui"), Ct.assertNeverCalled))),

  Ct.expectation("declines when supplier cannot act",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), false),
      R.curry(Cg.unloadUnit)(0),
      Ct.foldEither(Ct.assertStartsWith("iae:uca"), Ct.assertNeverCalled))),

  Ct.expectation("declines when no target is surrouding the supplier",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 5),
      R.set(RExt.nestedPath(["units", 0, "y"]), 5),
      R.curry(Cg.unloadUnit)(0),
      Ct.foldEither(Ct.assertStartsWith("iae:nis"), Ct.assertNeverCalled))),

  Ct.expectation("refills fuel in all own units in range",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 5),
      R.set(RExt.nestedPath(["units", 0, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "x"]), 6),
      R.set(RExt.nestedPath(["units", 1, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "fuel"]), 0),
      R.set(RExt.nestedPath(["units", 2, "x"]), 4),
      R.set(RExt.nestedPath(["units", 2, "y"]), 5),
      R.set(RExt.nestedPath(["units", 2, "fuel"]), 20),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "maxFuel"]), 35),
      R.curry(Cg.unloadUnit)(0),
      R.map(model => {
        return [
          R.view(RExt.nestedPath(["units", 1, "fuel"]))(model),
          R.view(RExt.nestedPath(["units", 2, "fuel"]))(model)
        ];
      }),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals([35, 35])))),

  Ct.expectation("refills ammo in all own units in range",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 5),
      R.set(RExt.nestedPath(["units", 0, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "x"]), 6),
      R.set(RExt.nestedPath(["units", 1, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 2, "x"]), 4),
      R.set(RExt.nestedPath(["units", 2, "y"]), 5),
      R.set(RExt.nestedPath(["units", 2, "ammo"]), 0),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "maxAmmo"]), 5),
      R.curry(Cg.unloadUnit)(0),
      R.map(model => {
        return [
          R.view(RExt.nestedPath(["units", 1, "ammo"]))(model),
          R.view(RExt.nestedPath(["units", 2, "ammo"]))(model)
        ];
      }),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals([5, 5])))),

  Ct.expectation("ignores allied units",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 5),
      R.set(RExt.nestedPath(["units", 0, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "x"]), 6),
      R.set(RExt.nestedPath(["units", 1, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["players", 0, "team"]), 1),
      R.set(RExt.nestedPath(["players", 1, "team"]), 1),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "maxAmmo"]), 5),
      R.curry(Cg.unloadUnit)(0),
      R.map(R.view(RExt.nestedPath(["units", 1, "ammo"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(1)))),

  Ct.expectation("ignores enemy units",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 5),
      R.set(RExt.nestedPath(["units", 0, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "x"]), 6),
      R.set(RExt.nestedPath(["units", 1, "y"]), 5),
      R.set(RExt.nestedPath(["units", 1, "ammo"]), 1),
      R.set(RExt.nestedPath(["units", 1, "owner"]), 1),
      R.set(RExt.nestedPath(["players", 0, "team"]), 1),
      R.set(RExt.nestedPath(["players", 1, "team"]), 2),
      R.set(RExt.nestedPath(["unitTypes", "UNTA", "maxAmmo"]), 5),
      R.curry(Cg.unloadUnit)(0),
      R.map(R.view(RExt.nestedPath(["units", 1, "ammo"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(1))))
]);

Ct.unloadUnitSpec = Ct.specification("unload unit", [
  Ct.moveSpec,

  Ct.expectation("declines when load id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(-1, 0, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:lod"), Ct.assertNeverCalled))),

  Ct.expectation("declines when load id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(50, 0, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:lod"), Ct.assertNeverCalled))),

  Ct.expectation("declines when transporter id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(0, -1, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:trp"), Ct.assertNeverCalled))),

  Ct.expectation("declines when transporter id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(0, 50, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:trp"), Ct.assertNeverCalled))),

  Ct.expectation("declines when direction is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(0, 1, 4),
      Ct.foldEither(Ct.assertStartsWith("iae:idv"), Ct.assertNeverCalled))),

  Ct.expectation("declines when direction is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.unloadUnit)(0, 1, -1),
      Ct.foldEither(Ct.assertStartsWith("iae:idv"), Ct.assertNeverCalled))),

  Ct.expectation("declines when load is not loaded by transporter",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 2),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.curry(Cg.unloadUnit)(0, 1, 1),
      Ct.foldEither(Ct.assertStartsWith("iae:nal"), Ct.assertNeverCalled))),

  Ct.expectation("does nothing when the tile in target direction is not empty",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.curry(Cg.unloadUnit)(0, 1, 1),
      R.map(R.view(RExt.nestedPath(["units", 0, "loadedIn"]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(1)))),

  Ct.expectation("removes loaded in when target direction is empty",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.curry(Cg.unloadUnit)(0, 1, 1),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(-1)))),

  Ct.expectation("sets position when target direction is empty",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.curry(Cg.unloadUnit)(0, 1, 1),
      R.map(R.view(RExt.nestedPath(["units", 0]))),
      R.map(unit => "{" + unit.x + "," + unit.y + "}"),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals("{2,1}")))),

  Ct.expectation("sets load into wait mode when target direction is empty",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.curry(Cg.unloadUnit)(0, 1, 1),
      R.map(R.view(RExt.nestedPath(["actables", 0]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(false)))),

  Ct.expectation("sets transporter into wait mode when target direction is empty",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.map(R.view(RExt.nestedPath(["actables", 1]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(false)))),

  Ct.expectation("sets transporter into wait mode when target direction is not empty",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.set(RExt.nestedPath(["units", 2, "x"]), 2),
      R.set(RExt.nestedPath(["units", 2, "y"]), 1),
      R.curry(Cg.unloadUnit)(0, 1, 1),
      R.map(R.view(RExt.nestedPath(["actables", 1]))),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(false)))),

  Ct.expectation("declines when the transporter cannot act",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.set(RExt.nestedPath(["actables", 1]), false),
      R.curry(Cg.unloadUnit)(0, 1, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:uca"), Ct.assertNeverCalled)))
]);

Ct.loadUnitSpec = Ct.specification("load unit", [
  Ct.moveSpec,

  Ct.expectation("declines when load id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.loadUnit)(-1, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:lod"), Ct.assertNeverCalled))),

  Ct.expectation("declines when load id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.loadUnit)(50, 0),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:lod"), Ct.assertNeverCalled))),

  Ct.expectation("declines when transporter id is invalid (loob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.loadUnit)(0, -1),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:trp"), Ct.assertNeverCalled))),

  Ct.expectation("declines when transporter id is invalid (roob)",
    R.pipe(
      R.always(Ct.testGameModel),
      R.curry(Cg.loadUnit)(0, 50),
      Ct.foldEither(Ct.assertStartsWith("iae:iui:trp"), Ct.assertNeverCalled))),

  Ct.expectation("declines when load id is already loaded",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "loadedIn"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -2),
      R.curry(Cg.loadUnit)(0, 1),
      Ct.foldEither(Ct.assertStartsWith("iae:arl"), Ct.assertNeverCalled))),

  Ct.expectation("declines when transporter cannot load unit",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -1),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTA"),
      R.set(RExt.nestedPath(["units", "UNTA", "loadable"]), ["UNTB"]),
      R.set(RExt.nestedPath(["units", "UNTA", "maxLoadCount"]), 2),
      R.curry(Cg.loadUnit)(0, 1),
      R.view(RExt.nestedPath(["units", 0, "loadedIn"])),
      Ct.foldEither(Ct.assertStartsWith("iae:clu"), Ct.assertNeverCalled))),

  Ct.expectation("declines when transporter has no room left",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -3),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTA"),
      R.set(RExt.nestedPath(["units", "UNTA", "loadable"]), ["UNTA"]),
      R.set(RExt.nestedPath(["units", "UNTA", "maxLoadCount"]), 2),
      R.curry(Cg.loadUnit)(0, 1),
      Ct.foldEither(Ct.assertStartsWith("iae:mlr"), Ct.assertNeverCalled))),

  Ct.expectation("declines when the load cannot act",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["actables", 0]), false),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -1),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTA"),
      R.set(RExt.nestedPath(["units", "UNTA", "loadable"]), ["UNTA"]),
      R.set(RExt.nestedPath(["units", "UNTA", "maxLoadCount"]), 2),
      R.curry(Cg.loadUnit)(0, 1),
      Ct.foldEither(Ct.assertStartsWith("iae:uca"), Ct.assertNeverCalled))),

  Ct.expectation("load looses its position",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -1),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTA"),
      R.set(RExt.nestedPath(["units", "UNTA", "loadable"]), ["UNTA"]),
      R.set(RExt.nestedPath(["units", "UNTA", "maxLoadCount"]), 2),
      R.curry(Cg.loadUnit)(0, 1),
      R.view(RExt.nestedPath(["units", 0])),
      R.map(unit => "{" + unit.x + "," + unit.y + "}"),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals("{-1,-1}")))),

  Ct.expectation("load is loaded in transporter",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -1),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTA"),
      R.set(RExt.nestedPath(["units", "UNTA", "loadable"]), ["UNTA"]),
      R.set(RExt.nestedPath(["units", "UNTA", "maxLoadCount"]), 2),
      R.curry(Cg.loadUnit)(0, 1),
      R.view(RExt.nestedPath(["units", 0, "loadedIn"])),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(-1)))),

  Ct.expectation("transporters load count increases",
    R.pipe(
      R.always(Ct.testGameModel),
      R.set(RExt.nestedPath(["units", 0, "x"]), 0),
      R.set(RExt.nestedPath(["units", 0, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "x"]), 1),
      R.set(RExt.nestedPath(["units", 1, "y"]), 1),
      R.set(RExt.nestedPath(["units", 1, "loadedIn"]), -1),
      R.set(RExt.nestedPath(["units", 1, "type"]), "UNTA"),
      R.set(RExt.nestedPath(["units", "UNTA", "loadable"]), ["UNTA"]),
      R.set(RExt.nestedPath(["units", "UNTA", "maxLoadCount"]), 2),
      R.curry(Cg.loadUnit)(0, 1),
      R.view(RExt.nestedPath(["units", 1, "loadedIn"])),
      Ct.foldEither(Ct.assertNeverCalled, Ct.assertEquals(-2))))
]);

Ct.getActableObjectsSpec = Ct.specification("get actables objects", [
  Ct.expectation("returns all actable units of the turn owner",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(RExt.nestedPath(["actables"]), R.map(R.always(false))),
      R.set(RExt.nestedPath(["actables", 0]), true),
      R.set(RExt.nestedPath(["actables", 1]), true),
      Cg.getActableObjects,
      R.filter(R.where({
        type: R.equals("unit")
      })),
      R.pipe(R.length, Ct.assertEquals(2)))),

  Ct.expectation("returns all actable properties of the turn owner",
    R.pipe(
      R.always(Ct.testGameModel),
      R.over(RExt.nestedPath(["actables"]), R.map(R.always(false))),
      R.over(RExt.nestedPath(["properties"]), R.evolve({
        owner: R.always(-1)
      })),
      R.set(RExt.nestedPath(["properties", 0, "owner"]), 0),
      R.set(RExt.nestedPath(["properties", 1, "owner"]), 0),
      Cg.getActableObjects,
      R.filter(R.where({
        type: R.equals("property")
      })),
      R.pipe(R.length, Ct.assertEquals(2)))),

  Ct.expectation("contains the object-less map actions",
    R.pipe(
      R.always(Ct.testGameModel),
      Cg.getActableObjects,
      R.filter(R.where({
        type: R.equals("map")
      })),
      R.pipe(R.length, Ct.assertEquals(1)))),
]);

Ct.getPositionActionsSpec = Ct.specification("get position actions", [
  Ct.expectation("shows wait when unit is selected", Ct.assertNeverCalled),
  Ct.expectation("shows fire rocket when unit is selected and position contains a silo", Ct.assertNeverCalled),
  Ct.expectation("shows capture when unit is selected, can capture and position contains an enemy property", Ct.assertNeverCalled),
  Ct.expectation("shows capture when unit is selected, can capture and position contains an neutral property", Ct.assertNeverCalled),
  Ct.expectation("shows no capture when unit is selected, can capture and position contains an allied property", Ct.assertNeverCalled),
  Ct.expectation("shows produce unit when nothing is selcted and position contains an own factory", Ct.assertNeverCalled),
  Ct.expectation("shows destroy unit when unit is selcted and position contains nothing special", Ct.assertNeverCalled),
  Ct.expectation("shows attack unit when unit is selcted, it moved, is direct and target in sight", Ct.assertNeverCalled),
  Ct.expectation("shows attack unit when unit is selcted, it does not moved, is indirect and target in sight", Ct.assertNeverCalled),
  Ct.expectation("shows no attack unit when unit is selcted, it moved, is indirect and target in sight", Ct.assertNeverCalled),
  Ct.expectation("shows activate power when nothing is selcted and player has enough power", Ct.assertNeverCalled),
  Ct.expectation("shows activate super power when nothing is selcted and player has enough power", Ct.assertNeverCalled),
  Ct.expectation("shows resupply neightbours when unit is selected, unit can resupply and targets are nearby", Ct.assertNeverCalled),
  Ct.expectation("shows no resupply neightbours when unit is selected, unit can resupply and no targets are nearby", Ct.assertNeverCalled),
  Ct.expectation("shows unload unit when unit is selected, has loads and target has empty or hidden fields nearby", Ct.assertNeverCalled),
  Ct.expectation("shows no unload unit when unit is selected, has loads and target has no empty or hidden field nearby", Ct.assertNeverCalled),
  Ct.expectation("shows load unit when unit is selected, own transporter is at the target and transporter can load unit", Ct.assertNeverCalled),
  Ct.expectation("shows yield game when nothing is selected", Ct.assertNeverCalled),
  Ct.expectation("shows nextTurn when nothing is selected", Ct.assertNeverCalled)
]);

Ct.getUnitMoveMapSpec = Ct.specification("get unit move map", [
  Ct.expectation("recognizes move range", Ct.assertNeverCalled),
  Ct.expectation("recognizes left fuel", Ct.assertNeverCalled),
  Ct.expectation("recognizes movable fields that are visible and occuppied by enemy units as non-movable", Ct.assertNeverCalled),
  Ct.expectation("recognizes movable fields that are visible and occuppied by allied units as movable", Ct.assertNeverCalled),
  Ct.expectation("recognizes movable fields that are visible and occuppied by own units as movable", Ct.assertNeverCalled),
  Ct.expectation("recognizes movable fields that are not visible and occuppied allied units as movable", Ct.assertNeverCalled),
  Ct.expectation("recognizes movable fields that are not visible and occuppied enemy units as movable", Ct.assertNeverCalled),
  Ct.expectation("returned data contains move map", Ct.assertNeverCalled),
  Ct.expectation("returned data contains move range", Ct.assertNeverCalled),
  Ct.expectation("returned move range is minimum type.moveRange, unit.fuel", Ct.assertNeverCalled)
]);

Ct.getUnitAttackMapSpec = Ct.specification("get unit attack map", [
  Ct.expectation("recognizes move range of direct units", Ct.assertNeverCalled),
  Ct.expectation("recognizes left fuel of direct units", Ct.assertNeverCalled),
  Ct.expectation("ignores move range of indirect units", Ct.assertNeverCalled),
  Ct.expectation("returned data contains attack map", Ct.assertNeverCalled)
]);

Ct.gameSpec = Ct.specification("CustomWars Tactics: Game Engine 0.35.951", [
  Ct.createGameSpec,
  Ct.waitSpec,
  Ct.captureSpec,
  Ct.destroyUnitSpec,
  Ct.attackUnitSpec,
  Ct.resupplyNeightboursSpec,
  Ct.unloadUnitSpec,
  Ct.loadUnitSpec,
  Ct.fireRocketSpec,
  Ct.produceUnitSpec,
  Ct.activatePowerSpec,
  Ct.activateSuperPowerSpec,
  Ct.nextTurnSpec,
  Ct.yieldGameSpec,
  Ct.elapseTimeSpec,
  Ct.getActableObjectsSpec,
  Ct.getPositionActionsSpec,
  Ct.getUnitMoveMapSpec,
  Ct.getUnitAttackMapSpec
]);

Ct.toHtml = content => (content + "").replace(/\n/gi, "</br>").replace(/\s/gi, "&nbsp;");

Ct.log = msg => document.getElementById("devOUT").innerHTML += Ct.toHtml(msg) + "</br>";

Ct.nWhitespaces = R.pipe(R.times(R.always(" ")), R.join(""));

Ct.whitespacesForIndentionLevel = R.pipe(R.multiply(4), Ct.nWhitespaces);

Ct.convertSpecResultToText = R.curryN(2, (level, object) => R.cond([
  [R.compose(
      R.equals("Array"),
      R.type,
      R.prop("cases")),
    data => R.useWith(
      (a, b) => Ct.whitespacesForIndentionLevel(level) + "Specification: " + a + "\n" + b, [
        R.prop("description"),
        R.compose(
          R.join("\n"),
          R.map(Ct.convertSpecResultToText(level+1)),
          R.prop("cases"))
      ])(data, data)
  ],
  [R.compose(
      R.equals("Object"),
      R.type,
      R.prop("status")),
    data => R.useWith(
      (a, b) => Ct.whitespacesForIndentionLevel(level) + "Expectation: " + a + " [" + b + "]", [
        R.prop("description"),
        R.compose(
          R.ifElse(
            R.propEq("status", "PASSED"), 
            R.always("PASSED"), 
            status => "FAILED due: " + status.reason),
          R.prop("status"))
      ])(data, data)
  ],
  [R.T, R.always("unexpected")]
])(object) );

Ct.testBlock = RExt
  .IO(() => true)
  .map(R.tap(any => Ct.log("Starting specification test")))
  .map(any => Ct.gameSpec())
  .map(R.tap(any => Ct.log("Finished specification test")))
  .map(R.tap(any => Ct.log("Results: ")))
  .map(Ct.convertSpecResultToText(0))
  .map(R.tap(Ct.log));