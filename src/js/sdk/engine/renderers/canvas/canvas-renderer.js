/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Log } from '../../globals'
import ContextPerformanceHook from '../../utils/context-performance-hook'
import BaseRenderer from '../base-renderer'

export default class CanvasRenderer extends BaseRenderer {
  constructor (...args) {
    super(...args)
    this._type = 'canvas'
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
  }

  /**
   * Renders the given DisplayObject
   * @param  {DisplayObject} displayObject
   */
  render (displayObject) {
    const ctx = this._context

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

    this.renderDisplayObject(displayObject, this._context)
  }

  /**
   * Renders the given DisplayObject
   * @param  {DisplayObject} displayObject
   * @param  {RenderTarget} context
   */
  renderDisplayObject (displayObject, context) {
    const originalContext = this._context
    this._context = context
    displayObject.renderCanvas(this)
    this._context = originalContext
  }

  getCurrentRenderTarget () { return this._context }
}

CanvasRenderer.contextId = 0
