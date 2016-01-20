/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Vector2 from '../../lib/math/vector2'
import Engine from '../../engine/'
import Promise from '../../vendor/promise'

/**
 * A helper class that can collect {@link Primitive} instances and render
 * the stack
 * @class
 * @alias PhotoEditorSDK.Filter.PrimitivesStack
 */

/**
 * @TODO
 * Add a dirtiness hash for each renderer, have a RenderTexture for each renderer
 * to make this Stack renderer independent.
 */
class PrimitivesStack {
  constructor (intensity = 1) {
    this._intensity = intensity

    this._stack = []
    this._dirty = true
  }

  /**
   * Adds the given primitive to the stack
   * @param {PhotoEditorSDK.Filter.Primitive} primitive
   */
  add (primitive) {
    this._stack.push(primitive)
  }

  /**
   * Renders this stack using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise}
   */
  renderWebGL (sdk) {
    if (this._stack.length === 0) return Promise.resolve()

    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)
    if (!this._dirty) {
      outputSprite.setTexture(renderTexture)
      return Promise.resolve()
    } else {
      const spriteBounds = outputSprite.getBounds()
      const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)
      renderTexture.resizeTo(spriteDimensions)

      const tempFilters = outputSprite.getFilters()

      this._stack.forEach((primitive) => primitive.update(sdk))
      const newFilters = this._stack.map((primitive) => primitive.getFilter())
      outputSprite.setFilters(newFilters)

      outputSprite.setAnchor(0, 0)
      outputSprite.setPosition(0, 0)

      renderTexture.render(outputSprite)

      outputSprite.setFilters(tempFilters)
      outputSprite.setTexture(renderTexture)
    }

    this._dirty = false
    return Promise.resolve()
  }

  /**
   * Creates and returns a render texture
   * @param  {Renderer} renderer
   * @return {RenderTexture}
   */
  _getRenderTexture (renderer) {
    if (!this._renderTexture) {
      this._renderTexture = renderer.createRenderTexture()
    }
    return this._renderTexture
  }

  /**
   * Renders this stack using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   */
  renderCanvas (renderer) {
    const outputCanvas = renderer.cloneCanvas()

    let promise = Promise.resolve()
    if (this._dirty) {
      for (var i = 0; i < this._stack.length; i++) {
        var primitive = this._stack[i]
        primitive.renderCanvas(renderer, outputCanvas)
      }
    }

    promise = promise.then(() => {
      this._dirty = false
    }).then(() => {
      // Render with intensity
      const context = renderer.getContext()
      context.globalAlpha = this._intensity
      context.drawImage(outputCanvas, 0, 0)
      context.globalAlpha = 1.0
    })

    return promise
  }

  /**
   * Renders the stack of primitives on the renderer
   * @param  {Renderer} renderer
   */
  render (renderer) {
    if (renderer.getRenderer() instanceof Engine.WebGLRenderer) {
      return this.renderWebGL(renderer)
    } else {
      return this.renderCanvas(renderer)
    }
  }

  setDirty (dirty) { this._dirty = dirty }
  setIntensity (intensity) { this._intensity = intensity }
}

export default PrimitivesStack
