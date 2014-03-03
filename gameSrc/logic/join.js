/**
 * Logic object for the join mechanic.
 *
 * @namespace
 */
cwt.Join = {

  /**
   * Declines wish if two units can join each other in the current situation.
   * Transporters cannot join each other when they loaded units.
   *
   * @param {cwt.Unit} source
   * @param {cwt.Unit} target
   */
  canJoin: function (source, target) {
    if (this.DEBUG) assert(source instanceof cwt.Unit);
    if (this.DEBUG) assert(target instanceof cwt.Unit);

    if (source.type !== target.type) return false;

    // don't increase HP to more then 10
    if (target.hp >= 90) return false;

    // do they have loads?
    if (cwt.Transport.hasLoads(source) || cwt.Transport.hasLoads(target)) return false;

    return true;
  },

  /**
   * Joins two units together. If the combined health is greater than the maximum
   * health then the difference will be payed to the owners resource depot.
   *
   * @param {cwt.Unit} source
   * @param {number} x
   * @param {number} y
   */
  join: function (source, x, y) {
    if (this.DEBUG) assert(source instanceof cwt.Unit);

    var target = cwt.Map.data[x][y].unit;
    if (this.DEBUG) assert(target instanceof cwt.Unit);
    if (this.DEBUG) assert(source.type === target.type);

    // hp
    target.heal(cwt.Unit.pointsToHealth(cwt.Unit.healthToPoints(source)), true);

    // ammo
    target.ammo += source.ammo;
    if (target.ammo > target.type.ammo) target.ammo = target.type.ammo;

    // fuel
    target.fuel += source.fuel;
    if (target.fuel > target.type.fuel) target.fuel = target.type.fuel;

    // TODO experience points

    cwt.Lifecycle.destroyUnit(x, y, true);
  }

};