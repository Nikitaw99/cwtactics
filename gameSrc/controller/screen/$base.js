/**
 *
 * @class
 */
cwt.ScreenLayer = my.Class(/** @lends cwt.Screen.Layer.prototype */ {

  constructor: function (frames, frameTime) {
    this.canvas = [];
    this.ctx = [];
    this.cFrame = 0;
    this.cTime = 0;
    this.frameLimit = frameTime;

    // create canvas objects
    var n = 0;
    while (n < frames) {
      this.canvas[n] = document.createElement("canvas");
      this.ctx[n] = this.canvas[n].getContext("2d");
      n++;
    }
  },

  /**
   * Returns the current active canvas of the layer.
   *
   * @return {HTMLCanvasElement}
   */
  getActiveFrame: function () {
    return this.canvas[this.cFrame];
  },

  /**
   * Returns the rendering context for a given frame id.
   *
   * @param frame
   * @return {CanvasRenderingContext2D}
   */
  getContext: function (frame) {
    if (this.DEBUG) assert(frame >= 0 && frame < this.canvas.length);

    return this.ctx[frame];
  },

  /**
   * Updates the internal timer of the layer.
   *
   * @param delta
   */
  update: function (delta) {
    this.cTime += delta;

    // increase frame
    if (this.cTime >= this.frameLimit) {
      this.cTime = 0;
      this.cFrame++;

      // reset frame
      if (this.cFrame === this.canvas.length) {
        this.cFrame = 0;
      }
    }
  },

  /**
   * Resets timer and frame counter.
   */
  resetTimer: function () {
    this.cTime = 0;
    this.cFrame = 0;
  }

});

/**
 * Screen model.
 *
 * @namespace
 */
cwt.Screen = {

  /**
   * Tile size base.
   *
   * @constant
   */
  TILE_BASE: 16,

  /**
   * Number of tiles in a row in the screen.
   *
   * @constant
   */
  MAX_TILES_W: 20,

  /**
   * Number of tiles in a column in the screen.
   *
   * @constant
   */
  MAX_TILES_H: 15,

  /**
   * Steps for a unit animation step.
   *
   * @constant
   */
  UNIT_ANIM_TIME: 150,

  /**
   * Steps for a unit animation.
   *
   * @constant
   */
  UNIT_ANIM_STEP: 3,

  /**
   * Time for a tile/property animation step.
   *
   * @constant
   */
  TILE_ANIM_TIME: 300,

  /**
   * Steps for a tile/property animation.
   *
   * @constant
   */
  TILE_ANIM_STEP: 8,

  /**
   * Animation time for a one frame layer.
   *
   * @constant
   */
  ONE_FRAME_ANIM_TIME: 9999,

  /**
   * Steps for a one frame layer.
   *
   * @constant
   */
  ONE_FRAME_ANIM_STEP: 1,

  /**
   * Layer #1: Background behind all other layers
   *
   * @type {cwt.ScreenLayer}
   */
  backgroundLayer: new cwt.ScreenLayer(this.ONE_FRAME_ANIM_STEP, this.ONE_FRAME_ANIM_TIME),

  /**
   * Layer #2
   *
   * @type {cwt.ScreenLayer}
   */
  mapLayer: new cwt.ScreenLayer(this.TILE_ANIM_STEP, this.TILE_ANIM_TIME),

  /**
   * Layer #3
   *
   * @type {cwt.ScreenLayer}
   */
  fogLayer: new cwt.ScreenLayer(this.ONE_FRAME_ANIM_STEP, this.ONE_FRAME_ANIM_TIME),

  /**
   * Layer #4
   *
   * @type {cwt.ScreenLayer}
   */
  unitLayer: new cwt.ScreenLayer(this.UNIT_ANIM_STEP, this.UNIT_ANIM_TIME),

  /**
   * Layer #5
   *
   * @type {cwt.ScreenLayer}
   */
  weatherLayer: new cwt.ScreenLayer(this.ONE_FRAME_ANIM_STEP, this.ONE_FRAME_ANIM_TIME),

  /**
   * Layer #6: Front layer
   *
   * @type {cwt.ScreenLayer}
   */
  interfaceLayer: new cwt.ScreenLayer(this.ONE_FRAME_ANIM_STEP, this.ONE_FRAME_ANIM_TIME)

};