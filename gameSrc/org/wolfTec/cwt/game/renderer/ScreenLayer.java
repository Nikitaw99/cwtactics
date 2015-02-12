package org.wolfTec.cwt.game.renderer;

import org.stjs.javascript.Array;
import org.stjs.javascript.Global;
import org.stjs.javascript.JSCollections;
import org.stjs.javascript.dom.Canvas;
import org.stjs.javascript.dom.canvas.CanvasRenderingContext2D;
import org.wolfTec.cwt.game.EngineGlobals;
import org.wolfTec.cwt.game.model.Direction;

public abstract class ScreenLayer implements LayerGroup {

  protected Canvas cv;
  protected CanvasRenderingContext2D ctx;
  public int w;
  public int h;
  protected Array<CanvasRenderingContext2D> contexts;
  protected Array<Canvas> layers;

  public abstract int getZIndex();

  public abstract String getLayerCanvasId();

  public void onScreenShift(Direction dir, int offsetX, int offsetY, int amount, int scale) {

  };

  public void onFullScreenRender() {

  };

  public void onSetScreenPosition(int x, int y, int offsetX, int offsetY) {

  };

  protected void initialize(String canvasId, int frames, int w, int h) {

    // root canvas
    this.cv = (Canvas) Global.window.document.getElementById(canvasId);
    this.cv.width = w;
    this.cv.height = h;
    this.ctx = this.cv.getContext("2d");
    this.w = w;
    this.h = h;

    // cached layers
    if (frames > 0) {
      this.contexts = JSCollections.$array();
      this.layers = JSCollections.$array();

      int n = 0;
      while (n < frames) {
        Canvas cv = (Canvas) Global.window.document.createElement("canvas");

        cv.width = w;
        cv.height = h;

        this.contexts.$set(n, cv.getContext("2d"));
        this.layers.$set(n, cv);

        n++;
      }
    }
  }

  @Override
  public void renderState(int index) {
    CanvasRenderingContext2D ctx = this.getContext(EngineGlobals.INACTIVE_ID);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.drawImage(getLayer(index), 0, 0, this.w, this.h);
  }

  /**
   *
   * @param {number?} index
   * @returns {HTMLCanvasElement}
   */
  public Canvas getLayer(int index) {
    if (index == EngineGlobals.INACTIVE_ID) {
      return this.cv;
    }

    return this.layers.$get(index);
  }

  /**
   * Clears the layer with the given index.
   *
   * @param index
   *          index of the layer
   */
  public void clear(int index) {
    this.getContext(index).clearRect(0, 0, this.w, this.h);
  }

  /**
   * Clears all background layers including the front layer.
   */
  public void clearAll() {
    int n = this.layers.$length() - 1;
    while (n >= 0) {
      this.clear(n);
      n--;
    }
    this.clear(EngineGlobals.INACTIVE_ID);
  }

  /**
   * Returns the context of a layer with the given index.
   *
   * @param {number?} index
   * @returns {CanvasRenderingContext2D}
   */
  public CanvasRenderingContext2D getContext(int index) {
    if (index == EngineGlobals.INACTIVE_ID) {
      return this.ctx;
    }

    return this.contexts.$get(index);
  }

  public void renderSprite(Sprite sprite, int x, int y) {

  }
}
