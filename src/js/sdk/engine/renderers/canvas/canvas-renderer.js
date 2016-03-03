/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Log } from '../../globals'
import ContextPerformanceHook from '../../utils/context-performance-hook'

import BaseRenderer from '../base-renderer'
import CanvasBuffer from '../../utils/canvas-buffer'
import CanvasFilterManager from '../../managers/canvas-filter-manager'

/**
 * The renderer that is used for Canvas2D rendering
 * @class
 * @extends PhotoEditorSDK.Engine.BaseRenderer
 * @memberof PhotoEditorSDK.Engine
 */
class CanvasRenderer extends BaseRenderer {
  /**
   * Creates a CanvasRenderer
   * @override
   */
  constructor (...args) {
    super(...args)
    this._type = 'canvas'

    this.setCanvas(this._options.canvas || this._createCanvas())
  }

  /**
   * Creates a canvas element
   * @return {Canvas}
   */
  _createCanvas () {
    if (typeof document !== 'undefined') {
      return document.createElement('canvas')
    } else {
      return new (require('canvas'))()
    }
  }

  /**
   * Gets the rendering context for this renderer
   * @returns {Object}
   * @private
   */
  _createContext () {
    const canvas = this._canvas
    let ctx = canvas.getContext('2d')

    if (Log.canLog('trace')) {
      ctx = new ContextPerformanceHook(ctx)
    }

    this.id = ctx.id = CanvasRenderer.contextId++
    this._context = ctx
    ctx.renderer = this

    this.emit('context', ctx)

    return ctx
  }

  /**
   * Sets up the rendering context for this renderer
   * @private
   */
  _setupContext () {
    const ctx = this._context

    // Enable image smoothing if available
    if (!('imageSmoothingEnabled' in ctx)) {
      ['moz', 'webkit', 'ms'].forEach((prop) => {
        if (ctx[prop]) {
          ctx[prop] = true
        }
      })
    } else {
      ctx.imageSmoothingEnabled = true
    }

    this._defaultRenderTarget = new CanvasBuffer(this._width,
      this._height,
      this._pixelRatio,
      this._canvas,
      this._context)
    this.setRenderTarget(this._defaultRenderTarget)

    this._filterManager = new CanvasFilterManager(this)
  }

  /**
   * Renders the given DisplayObject
   * @param  {PhotoEditorSDK.Engine.DisplayObject} displayObject
   */
  render (displayObject) {
    const ctx = this._renderTarget.getContext()

    // Since the given displayObject is the "root" object
    // right now, we need to give it a dummy / fake object
    // as parent with the default world transform and alpha
    const originalParent = displayObject.getParent()
    displayObject.setParent(this._fakeObject)

    // Update transforms and render this object
    displayObject.updateTransform()

    // Reset parent
    displayObject.setParent(originalParent)

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    // Clear the view
    const { width, height } = this._canvas
    ctx.clearRect(0, 0, width, height)
    if (this._options.clearColor.a !== 0) {
      ctx.save()
      ctx.fillStyle = this._options.clearColor.toRGBA()
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
    }

    this.renderDisplayObject(displayObject, this._renderTarget)
  }

  /**
   * Renders the given DisplayObject
   * @param  {PhotoEditorSDK.Engine.DisplayObject} displayObject
   * @param  {PhotoEditorSDK.Engine.RenderTarget} renderTarget
   */
  renderDisplayObject (displayObject, renderTarget) {
    const originalRenderTarget = this._renderTarget
    this._filterManager.setFilterStack(renderTarget.getFilterStack())
    this.setRenderTarget(renderTarget)
    displayObject.renderCanvas(this)
    this.setRenderTarget(originalRenderTarget)
  }

  /**
   * Returns the current render target
   * @return {PhotoEditorSDK.Engine.RenderTarget}
   */
  getCurrentRenderTarget () { return this._renderTarget }

  /**
   * Sets the render target
   * @param {PhotoEditorSDK.Engine.RenderTarget} renderTarget
   */
  setRenderTarget (renderTarget) {
    this._renderTarget = renderTarget
  }

  /**
   * Returns the current rendering context
   * @return {RenderingContext}
   */
  getContext () { return this._renderTarget.getContext() }

  /**
   * Disposes this Renderer
   */
  dispose () {
    this._filterManager.dispose()
  }
}

CanvasRenderer.contextId = 0
CanvasRenderer.type = 'Canvas2D'

export default CanvasRenderer
