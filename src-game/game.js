// encapsulates the given world and client for
// the returned game logic handler

const Guard = (expr, msg) => {
  if (!expr) {
    try {
      throw new Error()
    } catch (e) {
      const stack = e.stack
      if (!msg) {
        const lines = typeof stack == "string" ? stack.split("\n") : []
        const lastFunction = lines.length >= 3 ? lines[2] : "unknown"
        msg = "GuardFailed(" + lastFunction + ")"
      }
      throw new Error(msg)
    }
  }
}

const Lists = {}

Lists.notEmpty = list => list.length > 0

const Logic = {}

// A => Boolean - returns true if a is truthy (object, non-empty list, true, ...) or else false
Logic.truthy = a => !!a

// A => Boolean - (complement of Logic.truthy)
Logic.falsy = a => !a

// A, A => A - either first A or second one when the first one is falsy   
Logic.either = (a, b) => !!a ? a : b
  
const Maths = {}
  
// Int, Int => Int - random integer between the two numbers, returns 0 
// if second number is smaller than the first one
Maths.rndInt = (from, to) => to > from ? from + Math.trunc(Math.random() * (to - from)) : 

Maths.isInt = i => typeof i === "number" && Math.trunc(i) === i

Maths.between = (from, to, value) => from <= value && value <= to

//
//
// design decision - game logic is designed by it's contract and will not check 
//                   incoming data. this means Game stuff may not be accessable by
//                   user interaction layers directly. there should be a fail-fast 
//                   or fail-safe layer between both to handle input data
//
const Game = {}

Game.UnitType = {

}

// Actor? => Boolean - returns true when the given object is an actor object, else false
Game.ActorType = {
  position: {
    x: Maths.beetween.partial(0, 100),
    y: Maths.beetween.partial(0, 100)
  },
  unit: Game.UnitType
}

// Unit => Boolean - returns true when the unit is a supplier, else false
Game.isSupplier = (unit) => Logic.truthy(unit.type.supply)

Game.sliceRangeFromMap = (map, range, position) => {
  if (range == 0) return []

  const result = []

  const leftX = Math.max(0, position.x - range)
  const leftY = Math.max(0, position.y - range)
  const rightX = Math.max(map.length - 1, position.x + range)
  const rightY = Math.max(map[0].length - 1, position.y + range)

  for (let x = leftX; x <= rightX; x++) {
    for (let y = leftY; y <= rightY; y++) {
      const actualRange = Math.abs(position.x - x) + Math.abs(position.y - y)
      if (actualRange <= range) {
        result.push(map[x][y])
      }
    }
  }

  return result
}

// Map, Actor => [Unit] - returns a list of units which can be supplied
// by the given unit at a given position
Game.getSupplyTargets = (map, actor) => { 
  const belongsToUnitOwner = tile => !!tile.unit && tile.unit.owner == actor.unit.owner
  const area = Game.getTilesInRange(map, 1, actor.position)
  const tilesWithOwnUnits = area.filter(belongsToUnitOwner)
  
  return tilesWithOwnUnits 
}
  
// Map, Actor => Boolean - returns true if the unit can supply its neighbours
Game.canSupplyNeighbours = (map, actor) => Lists.notEmpty(Game.getSupplyTargets(map,actor))

// Unit => Unit - takes the unit, refills all of its ammo and fuel and returns it
Game.refillSupplies = (unit) => {
  unit.ammo = unit.type.maxAmmo
  unit.fuel = unit.type.maxFuel
  
  return unit
}

// Unit => Unit - takes the unit and supplies all of its neighbours and returns
// the unit
Game.supplyNeighbours = (map, actor) => {
  const targets = Game.getSupplyTargets(map, actor.unit, actor.position)
  const handler = Game.refillSupplies
  
  targets.forEach(handler)
  return actor
} 

// Unit, Int(1-99) => Int - refills the hp of an unit by amount and returns 
// the overfilled amount. when the refill would overfill and unit, then 
// the gap between max hp and the old hp plus amount will be added in 
// relation to the unit price to the units owner gold depot.
Game.refillHP = (unit, amount) => {  
  const aboveMaxHP = Math.max(0, unit.hp + amount - 99)
  const newhp = Math.min(99, unit.hp + amount)
  const overfillRefunds = Math.trunc(aboveMaxHP * unit.type.cost / 100)
    
  unit.owner.gold += overfillRefunds
  unit.hp = newhp
    
  return aboveMaxHP
}

// Property, Int => Property - takes the property and increases the gold depot of its
//                             owner and returns 
Game.raiseFunds = (property, amount) => property.owner.gold += amount
  
// Unit => Unit - drains the fuel of the unit, may drains more fuel when the 
// unit is in hidden status.
Game.drainFuel = unit => {
  const hidden = unit.hidden
  const drainDaily = Logic.either(unit.type.dailyFuelDrain, 0)
  const drainDailyHidden = Logic.either(unit.type.dailyFuelDrainHidden, 0)
  const drain = hidden ? Math.max(drainDaily, drainDailyHidden) : drainDaily
    
  unit.fuel = unit.fuel - drain
  return unit
}

Game.joinable = (sourceUnit, targetUnit, maxHP) => 
  sourceUnit.owner == targetUnit.owner &&
  sourceUnit.type == targetUnit.type &&
  targetUnit.hp < maxHP

Game.joinUnits = (sourceUnit, targetUnit, maxHP) => {
  Guard(Game.canJoin(sourceUnit, targetUnit))

  const aboveFullHp = Math.max(0, sourceUnit.hp + targetUnit.hp - 99)

  targetUnit.hp = Math.min(targetUnit.hp + sourceUnit.hp, 99)
  targetUnit.fuel = Math.min(targetUnit.fuel + sourceUnit.fuel, targetUnit.type.fuel)
  targetUnit.ammo = Math.min(targetUnit.ammo + sourceUnit.ammo, targetUnit.type.ammo)
  sourceUnit.owner = null

  // TODO ?
  targetUnit.owner.gold = targetUnit.owner.gold + (sourceUnit.type.cost * 0.1)
}

// Unit => Boolean - returns true when the unit is a stealth unit, otherwise false
Game.isStealth = unit => !!unit.type.stealth

Game.isHidden = unit => !!unit.hidden

Game.canHide = unit => !unit.hidden

Game.canReveal = unit => !!unit.hidden

Game.hide = (unit) => unit.stealth.hidden = true

Game.reveal = (unit) => unit.hidden = false

// returns true when the current active day is in peace phase, false otherwise
Game.inPeacePhase = (cfg, turn) => turn.day < cfg.daysOfPeace

// returns true if the given unit has a primary weapon, false otherwise
Game.hasMainWeapon = unit => !!unit.type.attack.primary

// returns true if the given unit has a secondary weapon, false otherwise
Game.hasSecondaryWeapon = unit => !!unit.type.attack.secondary

// returns 'direct' if the unit attacks only surrounding units, 'indirect' when
// the unit has an attack range of 2 or greater, 'ballistic' when it's minimum
// attack range is 1 and maximum range 2 or greater, if nothing matches then
// 'nothing' will be returned
Game.getFireType = unit => {
  const hasMainWp = Game.hasMainWeapon(unit)
  const hasSecondaryWp = Game.hasSecondaryWeapon(unit)
  const hasWeapon = !!hasMainWp && !!hasSecondaryWp
  const longMaxRange = hasWeapon ? unit.type.attack.range.max > 1 : false
  const longMinRange = hasWeapon ? unit.type.attack.range.min > 1 : false

  if (!hasWeapon) return "nothing"
  if (longMaxRange) return longMinRange ? "indirect" : "ballistic"
  return "direct"
}

// returns true when the unit is a ballistic unit, false otherwise
Game.isBallisticUnit = unit => Game.getFireType(unit) == "ballistic"

// returns true when the unit is a indirect unit, false otherwise
Game.isIndirectUnit = unit => Game.getFireType(unit) == "indirect"

// returns true when the unit is a direct unit, false otherwise
Game.isDirectUnit = unit => Game.getFireType(unit) == "direct"

// returns true when the unit is a peaceful unit, false otherwise
Game.isPeacefulUnit = unit => Game.getFireType(unit) == "nothing"

Game.destroyUnit = unit => unit.owner = null

Game.damageUnit = (unit, amount, minRest = 0) => {
  unit.hp = Math.max(minRest, unit.hp - amount)
  if (unit.hp == 0) {
    Game.destroyUnit(unit)
  }
}

// returns true when the unit is a suicide unit, false otherwise
Game.isSuicideUnit = unit => !!unit.type.suicide

// damages all surrounding units at the position of the exploding unit
// and destroys the unit itself
Game.selfDestruct = (world, unit) => {
  const range = Game.sliceRangeFromMap(world.map, unit.type.suicide.damage, unit.position)
  const containsUnit = tile => !!tile.unit
  const unitsInRange = range.filter(containsUnit)
  const handler = tile => Game.damageUnit(tile.unit, unit.type.suicide.damage)
  
  unitsInRange.forEach(handler)
  Game.destroyUnit(unit)
}

// returns true if the property can be captured by the unit
Game.canBeCapturedBy = (property, unit) => 
  !!unit.type.capturer && unit.owner.team != property.owner.team

// let unit captures property which results in lowered property
// points. all properties and units of the property owner will
// be cleared when the points falls down to zero and the property
// is critical. otherwise only the property owner changes to
// the capturers owner.
Game.captureProperty = (property, unit) => {
  const capturedPoints = Math.trunc(world.cfg.capturePerStep / 100 * (unit.hp + 1))
  const pointsLeft = property.points - capturedPoints
  const newOwner = pointsLeft < 0
  const newPoints = newOwner ? world.cfg.capturePoints : pointsLeft
  const afterCaptureType = property.type.transformation.afterCaptured
  const isCriticalLoss = newOwner && property.type.isCriticalProperty
  const newType = newOwner && !!afterCaptureType ? afterCaptureType : property.type
  const belongsToPropertyOwner = ownable => property.owner == ownable.owner

  modifyVision(unit.position, newOwner ? 1 : 0, property.type.vision, property.owner.visionMap)
  modifyVision(unit.position, newOwner ? 1 : 0, newType.vision, unit.owner.visionMap)
  
  if (isCriticalLoss){
    world.units
      .filter(belongsToPropertyOwner)
      .forEach(Game.destroyUnit)
  
    world.properties
      .filter(belongsToPropertyOwner)
      .filter(p => p != property)
      .forEach(property => property.owner = null)
  }

  property.points = newPoints
  property.owner = newOwner ? unit.owner : property.owner
  property.type = newType
}

// 
// design decision - all sequences are fail fast, they check the input data
//                   and will throw error as soon illegal data will be detected
//
const Sequences = {}

// attacks one unit with a unit. may introduces a counter attack when the attacker
// attacks directly and the defender has the ability to attack the attacker.
// furthermore this sequence will increase the power level of both unit owners.
Sequences.attack = (world, attackerID, defenderID) => {
  const attacker = world.units[attackerID]
  const defender = world.units[defenderID]
  
  Guard(!!attacker)
  Guard(!!defender)
  Guard(attacker != defender)
  Guard(!Game.isPeacefulUnit(attacker))
  
  ...
}

Sequences.produce = () => null

Sequences.drainAll = (world) => {
  
}

Sequences.supplyAll = (world) => {}

Sequences.repairAll = (world) => {
  const turnOwner = world.turn.owner
  const belongsToTurnOwner = tile => !!tile.unit && tile.unit.owner == turnOwner
  const standsOnAlliedProperty = tile => !!tile.property && tile.property.owner == turnOwner
  const predicate = tile => belongsToTurnOwner(tile) && standsOnAlliedProperty(tile)
  const tiles = world.units.filter(predicate)
  const repairAmount = world.config.propertyRepairAmount
  const handler = tile => Game.refillHp(tile.unit, repairAmount)
  
  Guard(repairAmount)
  
  tiles.forEach(handler)
} 

Sequences.supply = () => null

Sequences.hide = (world, unitID) => {
  const unit = world.units[unitID]
  
  Guard(unit)
  Guard(Game.isStealth(unit))
  Guard(!Game.isHidden(unit))
  
  Game.hide(unit)
  
  Guard(Game.isHidden(unit))
}

Sequences.reveal = () => {
  const unit = world.units[unitID]
  
  Guard(unit)
  Guard(Game.isStealth(unit))
  Guard(Game.isHidden(unit))
  
  Game.reveal(unit)
  
  Guard(!Game.isHidden(unit))
}

Sequences.capture = (world, capturerID) => {
  const capturer = world.units[capturerID]
  Guard(!!capturer)
  
  const position = capturer.position
  const property = world.map[position.x, position.y].property
  Guard(!!property)

  Guard(Game.canBeCapturedBy(property, capturer))
  
  Game.captureProperty(property, capturer)
}

Sequences.launchSilo = () => null

Sequences.load = () => null

Sequences.unload = () => null

Sequences.saveGame = () => null

Sequences.loadGame = () => null

Sequences.join = (world, unitA, unitB) => {
  Guard(Game.joinable(unitA, unitB))
  Guard(Game.isTransporter(unitA))
  Guard(Game.hasLoadedUnits(unitB))
  Guard(unitA != unitB)
  
  Game.joinUnits(unitA, unitB)
  
  Guard(Logic.falsy(unitA.owner))
}

Sequences.getAvailableSequences = (world, actor) => {
  const sequences = []
  
  
  
  return sequences
}






// =======================================================================
// =======================================================================
// =======================================================================


const gameLogic = {}

gameLogic.emptyList = Object.freeze([])

const gameCreateLogicHandler = function(world, client) {
 

  const guardType = type => value => guard(createValidator(type)(value),
    "type missmatch")

  const createValidator = (spec, namespace = "") => (value, root = value) =>
    Object
    .keys(spec)
    .map(key => {
      switch (typeof spec[key]) {
        case "function":
          return !spec[key](value[key], value, root) ? namespace + key :
            null
        case "object":
          // TODO array support
          return createValidator(spec[key], namespace + key + ".")(value[
            key], root)
        default:
          return namespace + key + "(illegal)"
      }
    })
    .filter(v => !!v)
    .reduce((result, value) => result.concat(value), [])

  const condition = value => ({
    case (predicate, supplier) {
      return !!predicate(value) ? conditionSolved(supplier(value)) :
        condition(value)
    },
    default (newValue) {
      return newValue
    }
  })

  const conditionSolved = value => ({
    case () {
      return conditionSolved(value)
    },
    default () {
      return value
    }
  })

  const rotateList = (list, n) => list.slice(n, list.length).concat(list.slice(
    0, n))

  const position = (x, y) => {
    x,
    y
  }

  // returns true when the tile contains a unit, false otherwise
  const containsUnit = tile => !!tile.unit

  const toGameData = (data) => {
    const gamedata = {

      units: data.units.concat([{
        ID: "CANNON_UNIT_INV",
        cost: 0,
        range: 0,
        movetype: "NO_MOVE",
        vision: 1,
        fuel: 0,
        ammo: 0
      }, {
        ID: "LASER_UNIT_INV",
        cost: 0,
        range: 0,
        movetype: "NO_MOVE",
        vision: 1,
        fuel: 0,
        ammo: 0
      }]),

      tiles: data.tiles.concat([{
        ID: "PROP_INV",
        defense: 0,
        vision: 0,
        capturePoints: 1,
        blocker: !0
      }]),

      movetypes: data.movetypes.concat([{
        ID: "NO_MOVE",
        costs: {
          "*": -1
        }
      }]),

      cos: data.cos.map($.identity),

      weathers: data.weathers.map($.identity)
    }

    $.guard(exports.model.isValidGameData(gamedata))
    return gamedata
  }

  const convertWorldToMap = (world) => {
    let data = {}

    data.active = data.actives
      .map((value, index) => !!value ? index : -1)
      .filter(value => value >= 0)



    data.cfg = model.cfg_configuration
    data.co = exports.map((data, index) => exports.equal(-1, model.player_data[
        n].team) ?
      0 : [data.power, data.timesUsed, data.level, data.coA, data.coB],
      model.co_data
    )
    data.mp = exports.map(exports.identity, model.manpower_data)
    data.mpw = model.map_width
    data.mph = model.map_heigh
    data.gmTm = model.timer_gameTimeElapsed
    data.tnTm = model.timer_turnTimeElapsed
    data.trOw = model.round_turnOwner
    data.day = model.round_day
    data.wth = model.weather_data.ID

    data.prps = exports.map(
      (p, index) => [index, p.x, p.y, p.type.ID, p.capturePoints, p.owner],
      exports.filter(p => exports.notEqual(p.owner), model.property_data)
    )

    data.units = exports.map(
      (u, index) => [model.unit_data.indexOf(u), u.type.ID, u.x, u.y, u.hp,
        u.ammo,
        u.fuel, u.loadedIn, u.owner
      ],
      exports.filter(u => exports.notEqual(u.owner), model.unit_data))

    // reduce all tiles to a list of distinct id values
    data.typeMap = exports.reduce(
      (ids, col) => exports.reduce(
        (ids, cell) => exports.includes(cell.type.ID, ids) && ids.push(
          cell.type.ID),
        ids, col), [], model.map_data)

    // we turn all tiles into the index of their id in the type map
    data.map = exports.map(exports.map(cell => data.typeMap.indexOf(cell.type
        .ID)), model
      .map_data)

    data.dyet = exports.filter(exports.notEqual(-1), exports.map(exports.identity,
      model.dayTick_dataTime))
    data.dyee = exports.filter(exports.isTruthy, exports.map(exports.identity,
      model.dayTick_dataEvent))
    data.dyea = exports.filter(exports.isTruthy, exports.map(exports.identity,
      model.dayTick_dataArgs))

    // e.actr = exports.compose(filter(exports.greaterThan(-1)), exports.map((actable, index) => actable ? index : -1))(model.actions_leftActors)

    return JSON.stringify(data)
  }

  const convertMapToWorld = (worldShape, data) => {

    const model = {}

    exports.guard(exports.every(v => exports.isInteger(v) && exports.isBetween(
      0, 49), e.actr))

    model.actions_leftActors = exports.map(exports.always(false), exports.range(
      1, 50))
    exports.forEach(i => model.actions_leftActors[i] = true, e.actr)


    // PREPARE

    // controller.buildRoundConfig
    for (var t = controller.configBoundaries_, o = Object.keys(t), n = 0, a =
        o.length; a > n; n++) {
      var r, l = o[n];
      e && e.hasOwnProperty(l) ? (r = e[l], r < t[l].min && assert(!1, l,
          "is greater than it's minimum value"), r > t[l].max && assert(!
          1, l, "is greater than it's maximum value"), t[l].hasOwnProperty(
          "step") && 0 !== r % t[l].step && assert(!1, l,
          "is does not fits one of it's possible values")) : r = t[l].defaultValue,
        model.cfg_configuration[l] = r
    }


    model.client_lastPid = -1

    var e, t, o;
    for (t = 0, o = 4; o > t; t++) e = model.co_data[t], e.power = 0, e.timesUsed =
      0, e.level = -1, e.coA = null, e.coB = null

    model.dayTick_dataTime.resetValues(), model.dayTick_dataEvent.resetValues(),
      model.dayTick_dataArgs.resetValues()

    model.manpower_data.resetValues()


    model.map_width = e.mpw
    model.map_height = e.mph;
    for (var t = 0, o = model.map_width; o > t; t++)
      for (var n = 0, a = model.map_height; a > n; n++) {
        model.unit_posData[t][n] = null
        model.property_posMap[t][n] = null
        model.map_data[t][n] = model.data_tileSheets[e.typeMap[e.map[t][n]]]
      }

    assert(util.intRange(e.player, 2, 4));
    var t, o, n;
    for (o = 0, n = 4; n > o; o++) t = model.player_data[o], t.name = null,
      t.gold = 0, t.team = o <= e.player - 1 ? o : -2

    for (var t, o, n = 0, a = model.property_data.length; a > n; n++) model
      .property_data[n].owner = -1, model.property_data[n].type = null;
    for (var n = 0, a = e.prps.length; a > n; n++) o = e.prps[n], assert(
        util.intRange(o[0], 0, 299)), assert(util.intRange(o[1], 0, 99)),
      assert(util.intRange(o[2], 0, 99)), assert(util.isString(o[3]) && !
        util.isUndefined(model.data_tileSheets[o[3]].capturePoints) ||
        "undefined" != typeof model.data_tileSheets[o[3]].cannon ||
        "undefined" != typeof model.data_tileSheets[o[3]].laser ||
        "undefined" != typeof model.data_tileSheets[o[3]].rocketsilo),
      assert(util.intRange(o[4], 1, model.data_tileSheets[o[3]].capturePoints) ||
        util.intRange(o[4], -99, -1) || "undefined" != typeof model.data_tileSheets[
          o[3]].rocketsilo), assert(util.intRange(o[5], -1, 3)), t = model.property_data[
        o[0]], t.type = model.data_tileSheets[o[3]], t.capturePoints = 20,
      t.owner = o[5], t.x = o[1], t.y = o[2], model.property_posMap[o[1]][o[
        2]] = t

    model.round_turnOwner = -1, model.round_day = 0

    assert(util.intRange(e.trOw, 0, 999999)), assert(util.intRange(e.day, 0,
      999999)), model.round_turnOwner = e.trOw, model.round_day = e.day

    model.rule_map.resetValues()

    assert(util.isInt(e.gmTm) && e.gmTm >= 0), assert(util.isInt(e.tnTm) &&
        e.tnTm >= 0), model.timer_gameTimeElapsed = e.gmTm, model.timer_turnTimeElapsed =
      e.tnTm

    for (var t = 0, o = model.unit_data.length; o > t; t++) model.unit_data[
      t].owner = -1;
    model.unit_posData.resetValues();
    var n;
    if (e.units) {
      assert(Array.isArray(e.units));
      for (var t = 0, o = e.units.length; o > t; t++) {
        n = e.units[t], assert(util.isInt(n[0])), assert("string" == typeof n[
          1]), assert(model.data_unitSheets.hasOwnProperty(n[1]));
        var a = model.data_unitSheets[n[1]];
        assert(model.map_isValidPosition(n[2], n[3])), assert(util.intRange(
            n[4], 1, 99)), assert(util.intRange(n[5], 0, a.ammo)), assert(
            util.intRange(n[6], 0, a.fuel)), assert(util.isInt(n[7])),
          assert(util.intRange(n[8], -1, 3));
        var r = n[0],
          l = model.unit_data[r];
        l.type = a, l.x = n[2], l.y = n[3], l.hp = n[4], l.ammo = n[5], l.fuel =
          n[6], l.loadedIn = n[7], l.owner = n[8], model.unit_posData[n[2]]
          [n[3]] = l
      }

      // CONTAINS LOW_AMMO,LOW_FUEL,HAS_LOADS,CAPTURES,VISIBLE
      mode.unit_data.forEach(unit => unit.traits = new Set())
    }
    model.weather_data = model.data_defaultWeatherSheet

    // TODO uuuuugh

    for (var t = Object.keys(e.cfg), o = t.length; o--;) assert(util.isInt(
      e.cfg[t[o]]));
    controller.buildRoundConfig(e.cfg)

    var t, o, n, a;
    for (assert(Array.isArray(e.co) && 4 === e.co.length), n = 0, a = 4; a >
      n; n++) t = e.co[n], t > 0 && (assert(util.intRange(t[0], 0, 999999)),
      assert(util.intRange(t[1], 0, 999999)), assert(util.intRange(t[2],
        model.co_MODES.NONE, model.co_MODES.AWDR)), assert(util.isString(
        t[3]) && model.data_coSheets.hasOwnProperty(t[3])), assert(util.isString(
        t[4]) && model.data_coSheets.hasOwnProperty(t[4])), o = model.co_data[
        n], o.power = t[0], o.timesUsed = t[1], o.level = t[2], o.coA = t[
        3] ? model.data_coSheets[t[3]] : null, o.coB = t[4] ? model.data_coSheets[
        t[4]] : null)

    var t = 0,
      o = e.dyev.length;
    for (assert(e.dyea.length === 2 * o); o > t; t++) assertInt(e.dyev[t]),
      assertStr(e.dyee[t]), assert(e.dyev[t] > 0), model.dayTick_dataTime[t] =
      e.dyev[t], model.dayTick_dataEvent[t] = e.dyee[t], model.dayTick_dataArgs[
        2 * t] = e.dyea[2 * t], model.dayTick_dataArgs[2 * t + 1] = e.dyea[
        2 * t + 1]

    assert(Array.isArray(e.manpower));
    var t = e.manpower.length - 1;
    do assert(util.isInt(e.manpower[t]) && e.manpower[t] >= 0), t--; while (
      t >= 0);
    model.manpower_data.grabValues(e.manpower)

    var t, o, n, a;
    for (n = 0, a = e.players.length; a > n; n++) t = e.players[n], assert(
        util.intRange(t[0], 0, 3)), assert(util.isString(t[1])), assert(
        util.intRange(t[2], 0, 999999)), assert(util.intRange(t[3], 0, 3)),
      o = model.player_data[t[0]], o.name = t[1], o.gold = t[2], o.team = t[
        3]

    for (var t, o = 0, n = e.prps.length; n > o; o++) {
      var a = e.prps[o];
      t = model.property_data[a[0]], t.capturePoints = a[4]
    }

    assert(model.data_weatherSheets.hasOwnProperty(e.wth)), model.weather_data =
      model.data_weatherSheets[e.wth]

    // =======================================================
    // TODO

    model.properties = $.range(1, 300).map(id => ({
      id,
      capturePoints: 20,
        owner: -1,
        x: 0,
        y: 0,
        type: null
    }))

    model.cos = {
      data: $.range(1, 4).map(any => ({
        timesUsed: 0,
        power: 0,
        level: 0,
        coA: null,
        coB: null
      }))
    }

    model.players = $
      .range(1, 4)
      .map(any => ({
        gold: 0,
        team: -1,
        name: null
      }))

    model.units = $
      .range(1, 200)
      .map(id => ({
        id,
        hp: 99,
          x: 0,
          y: 0,
          ammo: 0,
          fuel: 0,
          loadedIn: -1,
          type: null,
          hidden: !1,
          owner: -1
      }))

    model.mode = "no-co"
  }

  // returns true when the buffer contains at least one command, false otherwise
  const hasCommands = (buffer) => buffer.length > 0

  // pushes a command into the buffer
  const pushCommand = (buffer, command) => {
    const MAX_SIZE = 200

    guard(_.size(buffer) < MAX_SIZE)
    return _.concat(buffer, command)
  }

  // pops a command from the buffer and returns it
  const popCommand = (buffer) => {
    guard(hasCommands(buffer))
    const next = _.first(buffer)
    const withoutNext = _.initial(buffer)
    return world.buffer.shift()
  }

             
  const tickAsyncEvents = model => {
    const events = model.events
    events.forEach(el => el.leftTicks--)
    model.events = events.filter(el => el.leftTicks > 0)
    return events.filter(el => el.leftTicks == 0)
  }

  const resetTurnTime = (model, cfg) => {
    model.leftTurnTime = or(cfg.turnTime, Number.POSITIVE_INFINITY)
  }

  const tickTurnTime = (model, time) => {
    model.leftTurnTime = Math.max(0, model.leftTurnTime - time)
    model.leftGameTime = Math.max(0, model.leftGameTime - time)

    return condition()
      .case(mode.leftGameTime <= 0, "end-game")
      .case(mode.leftTurnTime <= 0, "end-turn")
      .default("nothing")
  }

  const doPickNextTurnowner = () => {

    const currentOwner = world.turn.owner
    const currentOwnerIndex = players.indexOf(currentOwner)
    const playersWithoutTurnOwner = rotateList(world.players.filter(p => p !=
      currentOwner), currentOwnerIndex)
    const restPlayers = filter(p => p.team != -1)
    const nextOwner = restPlayers[0]

    guard(!!nextOwner)

    const nextOwnerIndex = players.indexOf(nextOwner)
    const dayChanged = nextOwnerIndex < currentOwnerIndex

    turn.day = turn.day + (dayChanged ? 1 : 0)
    turn.owner = nextOwner

    return dayChanged
  }

  const deactivatePlayer = player => player.team = -1

  const getCostOfOnePowerStar = (playerId) => {
    const STAR_COST = 9000
    const INCREASE_PER_USE = 1800
    const MAXIMUM_INCREASES = 10

    const timesUsed = Math.max(model.co_data[playerId].timesPowerUsed,
      MAXIMUM_INCREASES)
    return STAR_COST + timesUsed * INCREASE_PER_USE
  }

  const activatePower = (model, power, playerId) => {
    const powerLevel = model.co_POWER_LEVEL[power.toUpperCase()]
    exports.guard(powerLevel)

    const coData = model.co_data[playerId]
    coData.power = 0
    coData.level = powerLevel
    coData.timesUsed++
  }

  const activateCoPower = (model, playerId) => {
    // TODO
  }

  const activateSuperCoPower = (model, playerId) => {
    // TODO
  }

  const isPowerActivatable = (power, model, playerId) => {
    if ([model.co_MODES.AW1, model.co_MODES.AW2, model.co_MODES.AWDS].includes(
        model.co_activeMode)) {
      return false
    }

    const coData = model.co_data[playerId]

    if (!coData.coA) return false

    const stars = {
      cop: "coStars",
      scop: "scoStars"
    }

    const starsNeeded = stars[power]
    cwt.guard(!!stars)

    return coData.power >= exports.co.getCostOfOnePowerStar(playerId) *
      starsNeeded
  }

  const isCoPActivatable = isPowerActivatable.bind(null, "cop")

  const isSCoPActivatable = isPowerActivatable.bind(null, "scop")

  
  

  

  const getTargets = (unit, position = unit.position) => {
    const minRange = unit.type.attack.range.min
    const maxRange = unit.type.attack.range.max
    const team = unit.owner.team
    const visionMap = unit.owner.visionMap

    return sliceRange(world.map, maxRange, position)
      .map(tile => tile.unit)
      .filter(u => !!u)
      .filter(unit => visionMap[unit.position.x][unit.position.y] > 0)
      .filter(unit => exports.model.distance(position, unit.position) >=
        minRange)
      .filter(unit => unit.owner.team != team)
  }

  const hasTargets = (model, unit, position) => getTargets(model, unit,
    position).length > 0

  const getBaseDamageAgainst = (e, t, o) => {
    var n = e.type.attack;
    if (!n) return -1;
    var a, r = t.type.ID;
    return "undefined" == typeof o && (o = !0), o && e.ammo > 0 && void 0 !==
      n.main_wp && (a = n.main_wp[r], "undefined" != typeof a) ? a : void 0 !==
      n.sec_wp && (a = n.sec_wp[r], "undefined" != typeof a) ? a : -1
  }

  const getBattleDamageAgainst = (e, t, o, n, a) => {
    "undefined" == typeof a && (a = !1), assert(util.intRange(o, 0, 100)),
      assert(util.isBoolean(n)), assert(util.isBoolean(a));
    var r = model.battle_getBaseDamageAgainst(e, t, n);
    if (-1 === r) return -1;
    var l = model.unit_convertHealthToPoints(e),
      i = model.unit_convertHealthToPoints(t);
    controller.prepareTags(e.x, e.y);
    var d = parseInt(o / 100 * controller.scriptedValue(e.owner, "luck", 10),
        10),
      s = controller.scriptedValue(e.owner, "att", 100);
    a && (s += controller.scriptedValue(t.owner, "counteratt", 0)),
      controller.prepareTags(t.x, t.y);
    var c = controller.scriptedValue(t.owner, "def", 100),
      m = model.map_data[t.x][t.y].defense,
      u = parseInt(controller.scriptedValue(t.owner, "terrainDefense", m) *
        controller.scriptedValue(t.owner, "terrainDefenseModifier", 100) /
        100, 10),
      _ = (r * s / 100 + d) * (l / 10) * ((200 - (c + u * i)) / 100);
    return _ = parseInt(_, 10)
  }

  const attack = (map, attacker, defender, attackerLuck, defenderLuck) => {

    exports.guard(model.unit_isValidUnitId(e.source.unitId))
    exports.guard(model.unit_isValidUnitId(e.targetselection.unitId))

    exports.guard(exports.isInteger(attackerLuck))
    exports.guard(exports.isBetween(0, 100, attackerLuck))
    exports.guard(exports.isInteger(defenderLuck))
    exports.guard(exports.isBetween(0, 100, defenderLuck))

    var a = model.unit_data[e],
      r = model.unit_data[t],
      l = model.battle_isIndirectUnit(e);
    if (!l && 1 === controller.scriptedValue(r.owner, "firstCounter", 0) &&
      !model.battle_isIndirectUnit(t)) {
      var i = r;
      r = a, a = i
    }
    var d, s = a.type,
      c = r.type,
      m = a.owner,
      u = r.owner,
      _ = model.unit_convertHealthToPoints(r),
      p = model.unit_convertHealthToPoints(a),
      f = model.battle_canUseMainWeapon(a, r);
    d = model.battle_getBattleDamageAgainst(a, r, o, f, !1) - 1 !== d && (
      model.events.damageUnit(t, d), _ -= model.unit_convertHealthToPoints(
        r) f && a.ammo--
      _ = parseInt(.1 * _ * c.cost, 10) model.events.co_modifyPowerLevel(
        m, parseInt(.5 * _, 10)) model.events.co_modifyPowerLevel(u, _))
    r.hp > 0 && !model.battle_isIndirectUnit(t) && (
      f = model.battle_canUseMainWeapon(r, a), d = model.battle_getBattleDamageAgainst(
        r, a, n, f, !0), -1 !== d && (model.events.damageUnit(e, d), p -=
        model.unit_convertHealthToPoints(a), f && r.ammo--, p = parseInt(
          .1 * p * s.cost, 10), model.events.co_modifyPowerLevel(u,
          parseInt(.5 * p, 10)), model.events.co_modifyPowerLevel(m, p)))
  }

 

  const modifyVision = (position, range, by, fogModel) =>
    sliceRange(fogModel, range, position).map(x => x + by)

  const calculateVision = (map, owner) => {
    fogModel.map(col => col.map(x => 0))
    map.reduce((arr, col) => col.forEach(tile => {
        if (!!tile.property && tile.property.owner == owner) arr.push(
          tile.property)
        if (!!tile.unit && tile.unit.owner == owner) arr.push(tile.unit)
      }), [])
      .forEach(visioner => modifyVision(visioner.position, visioner.type.vision,
        owner.visionMap, +1))
  }

  const isCannon = cannon => "CANNON_UNIT_INV" === cannon.type.ID

  const canFireCannon = (cannon) => {
    cwt.guard(exports.specialProperties.isCannon(cannon))

    // TODO
    return model.bombs_markCannonTargets(e, t)
  }

  const getCannonTargets = (map, cannon) => {

    return []
  }

  const fireCannon = (cannon) => {
    // TODO
    const unit = model.unit_posData[e.targetselection.x][e.targetselection.y]
    const cannonType = model.bombs_grabPropTypeFromPos(e.target.x, e.target
      .y)

    model.events.damageUnit(
      model.unit_extractId(unit),
      model.unit_convertPointsToHealth(cannonType.cannon.damage), 9)
  }

  const isLaser = e => "LASER_UNIT_INV" === model.unit_data[e].type.ID

  const fireLaser = (laser) => {
    // TODO
    var o = model.property_posMap[e][t];
    assert(o);
    var n = e,
      a = t,
      r = o.owner;
    for (e = 0, xe = model.map_width; xe > e; e++)
      for (t = 0, ye = model.map_height; ye > t; t++)
        if (n === e || a === t) {
          var l = model.unit_posData[e][t];
          l && l.owner !== r && model.events.damageUnit(model.unit_extractId(
              l), model.unit_convertPointsToHealth(o.type.laser.damage),
            9)
        }
  }

  const tryToMarkCannonTargets = (e, t, o, n, a, r, l, i, d, s, c) => {
    assert(model.player_isValidPid(e));
    for (var m = model.player_data[e].team, u = i, _ = !1; d >= l; l++)
      for (i = u; i >= s; i--)
        if (model.map_isValidPosition(l, i) && !(Math.abs(l - o) + Math.abs(
            i - n) > c || Math.abs(l - a) + Math.abs(i - r) > c || model.fog_turnOwnerData[
            l][i] <= 0)) {
          var p = model.unit_posData[l][i];
          p && p.owner !== e && model.player_data[p.owner].team !== m && (t
            .setValueAt(l, i, 1), _ = !0)
        }
    return _
  }

  const markCannonTargets = (e, t) => {
    var o, n = model.unit_data[e],
      a = model.property_posMap[n.x][n.y],
      r = "PROP_INV" !== a.type.ID ? a.type : model.bombs_grabPropTypeFromPos(
        n.x, n.y);
    assert(r.cannon), t.setCenter(n.x, n.y, -1);
    var l = r.cannon.range;
    switch (r.cannon.direction) {
      case "N":
        o = model.bombs_tryToMarkCannonTargets(n.owner, t, n.x, n.y, n.x, n
          .y - l - 1, n.x - n + 1, n.y - 1, n.x + n - 1, n.y - l, l);
        break;
      case "E":
        o = model.bombs_tryToMarkCannonTargets(n.owner, t, n.x, n.y, n.x +
          l + 1, n.y, n.x + 1, n.y + l - 1, n.x + l, n.y - l + 1, l);
        break;
      case "W":
        o = model.bombs_tryToMarkCannonTargets(n.owner, t, n.x, n.y, n.x -
          l - 1, n.y, n.x - l, n.y + l - 1, n.x - 1, n.y - l + 1, l);
        break;
      case "S":
        o = model.bombs_tryToMarkCannonTargets(n.owner, t, n.x, n.y, n.x, n
          .y + l + 1, n.x - l + 1, n.y + l, n.x + l - 1, n.y + 1, l)
    }
    return o
  }

  const grabPropTypeFromPos = (e, t) => {
    for (;;) {
      if (!(t + 1 < model.map_height && model.property_posMap[e][t + 1] &&
          "PROP_INV" === model.property_posMap[e][t + 1].type.ID)) break;
      t++
    }
    if ("PROP_INV" !== model.property_posMap[e][t].type.ID) return model.property_posMap[
      e][t].type;
    for (;;) {
      if (e + 1 < model.map_width && model.property_posMap[e + 1][t] &&
        "PROP_INV" !== model.property_posMap[e + 1][t].type.ID) return model
        .property_posMap[e + 1][t].type;
      break
    }
    assert(!1)
  }

  const isSilo = (property) => !!property.type.rocketsilo

  const isSiloFireableBy = (unit, property) => {
    exports.guard(exports.specialProperties.isSilo(property))
    return property.type.rocketsilo.fireable.includes(unit.type.ID)
  }

  const fireSilo = (launchingUnit, silo, targetPosition) => {
    // TODO
    let x = e.target.x
    let y = e.target.y
    let tx = e.targetselection.x
    let ty = e.targetselection.y
    let r = model.property_posMap[x][y]
    let l = model.property_extractId(r)
    let i = r.type
    let d = i.rocketsilo.range
    let s = model.unit_convertPointsToHealth(i.rocketsilo.damage)

    // TODO
    model.events.property_changeType(l, model.data_tileSheets[i.changeTo])
    model.events.rocketFly(e, t, tx, ty)
    model.events.explode_invoked(tx, ty, d, s, e.source.unit.owner)
    model.events.dayEvent(5, "property_changeTypeById", l, model.data_propertyTypes
      .indexOf(i))
  }

  const emptifySilo = (types, silo) => {
    // TODO
    silo.type = types.find(t => t.id === "PSLE")
  }

  const refillSilo = (types, silo) => {
    // TODO
    silo.type = types.find(t => t.id === "PSLO")
  }

  const isTransporter = (unit) => {
    //TODO
  }

  const hasLoads = (unit) => {
    //TODO
  }

  const canLoad = (transporter, load) => {
    return !$.Stream([
      exports.greaterThan(model.unit_data[e].type.maxloads, 0),
      exports.notEqual(e.source.unitId, e.target.unitId),
      exports.notEqual(sourceUnit.loadedIn, e.target.unitId),
      exports.notEqual(targetUnit.loadedIn + 1 + targetUnit.type.maxloads,
        0),
      exports.notEqual(exports.includes(sourceUnit.type.movetype,
        targetUnit.type.canload))
    ]).includes(false)
  }

  const load = (transporter, load) => {
    load.loadedIn = transporter.id
    transporter.loadedIn -= 1
  }

  const canUnload = (transporter, load, direction) => {
    let e = data.source.unitId
    let t = data.target.x
    let o = data.target.y
    var n, a = model.unit_data[e],
      r = a.owner;

    if (!model.transport_isTransportUnit(e) || !model.transport_hasLoads(e))
      return !1;
    for (var l = model.unit_firstUnitId(r), i = model.unit_lastUnitId(r); i >=
      l; l++)
      if (n = model.unit_data[l], -1 !== n.owner && n.loadedIn === e) {
        var d = model.data_movetypeSheets[n.type.movetype];
        if (model.move_canTypeMoveTo(d, t - 1, o)) return;
        if (model.move_canTypeMoveTo(d, t + 1, o)) return;
        if (model.move_canTypeMoveTo(d, t, o - 1)) return;
        if (model.move_canTypeMoveTo(d, t, o + 1)) return
      }
    return !1
  }

  const getSuitableUnloads = (transporter) => {
    // TODO

    let e = data.source.unitId
    let t = data.target.x,
      let o = data.target.y
    let n = data.menu

    for (var a, r = model.unit_data[e], l = r.owner, i = model.unit_firstUnitId(
        l), d = model.unit_lastUnitId(l); d >= i; i++)
      if (a = model.unit_data[i], -1 !== a.owner && a.loadedIn === e) {
        var s = model.data_movetypeSheets[a.type.movetype];
        (model.move_canTypeMoveTo(s, t - 1, o) || model.move_canTypeMoveTo(
          s, t + 1, o) || model.move_canTypeMoveTo(s, t, o - 1) || model.move_canTypeMoveTo(
          s, t, o + 1)) && n.addEntry(i, !0)
      }
  }

  const getUnloadTargets = (transporter) => {
    // TODO
    var r = model.data_movetypeSheets[model.unit_data[e.action.selectedSubEntry]
      .type.movetype];
    let t = e.target.x
    let o = e.target.y

    model.move_canTypeMoveTo(r, t - 1, o) &&
      a.setValueAt(t - 1, o, 1)

    model.move_canTypeMoveTo(r, t + 1, o) &&
      a.setValueAt(t + 1, o, 1)

    model.move_canTypeMoveTo(r, t, o - 1) &&
      a.setValueAt(t, o - 1, 1)

    model.move_canTypeMoveTo(r, t, o + 1) &&
      a.setValueAt(t, o + 1, 1)
  }

  const unload = (transporter, load, direction) => {
    let e = e.source.unitId
    let t = e.target.x
    let o = e.target.y
    let n = e.action.selectedSubEntry
    let a = e.targetselection.x
    let r = e.targetselection.y
    if (assert(model.unit_data[n].loadedIn === e), -1 === a || -1 === r ||
      model.unit_posData[a][r]) return controller.stateMachine.data.breakMultiStep = !
      0, void 0;
    model.unit_data[n].loadedIn = -1, model.unit_data[e].loadedIn++;
    var l;
    t > a ? l = model.move_MOVE_CODES.LEFT : a > t ? l = model.move_MOVE_CODES
      .RIGHT : o > r ? l = model.move_MOVE_CODES.UP : r > o && (l = model.move_MOVE_CODES
        .DOWN), controller.commandStack_localInvokement(
        "move_clearWayCache"), controller.commandStack_localInvokement(
        "move_appendToWayCache", l), controller.commandStack_localInvokement(
        "move_moveByCache", n, t, o, 1), controller.commandStack_localInvokement(
        "wait_invoked", n)
  }

  const isFactory = (property) => !!property.type.builds

  const canProduce = (model, property) => {
    guard(isFactory(property))
    return model.manpower_data[property.owner] > 0 &&
      model.unit_data.filter(unit => unit.owner === property.owner).length <
      50
  }

  // returns a list of types which can be produced by the given factory
  const getProducableTypes = (factory) => world
    .types
    .units
    .filter(sheet => factory.type.builds.includes(sheet.movetype))
    .filter(sheet => sheet.cost <= model.player_data[property.owner].gold)
    .map(sheet => sheet.ID)

  const produce = (units, factory, type) => {
    $.guard(exports.factory.canProduce( ? ? ? , factory))

    // TODO change usable system

    const newUnit = units.find(u => !u.owner)
    $.guard(!!newUnit)

    newUnit.hp = 99
    newUnit.owner = factory.owner
    newUnit.type = type
    newUnit.ammo = type.ammo
    newUnit.fuel = type.fuel
    newUnit.loadedIn = -1
    newUnit.x = factory.x
    newUnit.y = factory.y

    // TODO model.manpower_data[model.property_posMap[e][t].owner]--

    // TODO
    var n = model.property_posMap[e][t],
      a = model.data_unitSheets[o].cost,
      r = model.player_data[n.owner];
    r.gold -= a, assert(r.gold >= 0), model.events.createUnit(model.unit_getFreeSlot(
      n.owner), n.owner, e, t, o)

    exports.client.events.onUnitCreated(type.ID, factory.x, factory.y)
  }

  // returns true if the unit is usable, false otherwise
  const isUsable = unit => world.usables.includes(unit)

  // sets the given unit as usable in the given usability model
  const doMarkUsable = unit => world.usables.push(unit)

  // sets the given unit as unusable in the given usability model
  const doMarkUnusable = unit => world.usables = world.usables.filter(u => u !=
    unit)

  // TODO
  const doUpdateWeather = (newType, seed) => {
    world.weather.active = newType
    world.weather.leftDays = randomInteger(newType.duration.min, newType.duration
      .max)
    exports.client.events.onWeatherChanged(newType.id)
  }

  // TODO
  const pickRandomWeather = () => {
    const weatherModel = world.weather
    const weathers = model.types.weathers.filter(type => type.id !=
      weatherModel.active.id)
    const nextWeather = weathers[Math.trunc(Math.random() * weathers.length)]
    const nextDuration = nextWeather.duration.min + Math.trunc(Math.random() *
      nextWeather.duration.max)
    setActiveWeather(weatherModel, nextWeather)
  }

  const getMovemap = (map, unitId) => {
    let movetargets = []

    // TODO

    return {
      x: -1,
      y: -1,
      data: [
        []
      ]
    }
  }

  const getMoveway = (map, unit, source, target) => {

  }

  const getCostsToMoveOn = (unit, tile) => {
    assert(model.map_isValidPosition(t, o));
    var n, a;
    return a = model.property_posMap[t][o], n = a ? a.type.blocker ? -1 : e
      .costs[a.type.ID] : e.costs[model.map_data[t][o].ID], "number" ==
      typeof n ? n : (n = e.costs["*"], "number" == typeof n ? n : -1)
  }

  const canMoveOntoTile = (unit, tile) => getCostsToMoveOn(unit, tile) > 0

  const getFuelCosts = (map, unit, way) => {

  }

  const move = (map, unit, way) => {

  }

  return {}
}
