/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, Engine } from '../../globals'
import Promise from '../../vendor/promise'

class BlendFilter extends Engine.Filter {
  constructor () {
    super()
    this._fragmentSource = require('raw!../../shaders/generic/blend.frag')
  }

  /**
   * Applies this filter to the given inputTarget and renders it to
   * the given outputTarget using the CanvasRenderer
   * @param  {PhotoEditorSDK.Engine.CanvasRenderer} renderer
   * @param  {PhotoEditorSDK.Engine.RenderTarget} inputTarget
   * @param  {PhotoEditorSDK.Engine.RenderTarget} outputTarget
   * @param  {Boolean} clear = false
   * @private
   */
  _applyCanvas (renderer, inputTarget, outputTarget, clear = false) {
    const canvas = inputTarget.getCanvas()
    const outputContext = outputTarget.getContext()

    const { filteredCanvas } = this._options

    outputContext.save()
    outputContext.drawImage(canvas, 0, 0)
    outputContext.globalAlpha = this._options.intensity
    outputContext.drawImage(filteredCanvas, 0, 0)
    outputContext.restore()
  }
}

BlendFilter.prototype.availableOptions = {
  filteredImage: { type: 'number', default: 1, uniformType: 'i' },
  filteredCanvas: { type: 'object', default: null },
  intensity: { type: 'number', default: 1, uniformType: 'f' }
}

/**
 * A helper class that can collect {@link Primitive} instances and render
 * the stack
 * @class
 * @memberof PhotoEditorSDK.Filter
 */
class PrimitivesStack {
  constructor (intensity = 1) {
    this._intensity = intensity

    this._stack = []
    this._dirtiness = {}
    this._renderTextures = {}
    this._container = new Engine.Container()
    this._sprite = new Engine.Sprite()
    this._container.addChild(this._sprite)

    this._blendFilter = new BlendFilter()
  }

  /**
   * Adds the given primitive to the stack
   * @param {PhotoEditorSDK.Filter.Primitive} primitive
   */
  push (primitive) {
    this._stack.push(primitive)
  }

  /**
   * Clears the stack
   */
  clear () {
    this._stack = []
  }

  /**
   * Renders this stack
   * @param  {PhotoEditorSDK} sdk
   * @param  {PhotoEditorSDK.Engine.RenderTexture} outputTexture
   * @return {Promise}
   * @description This takes the output sprite's current texture and renders
   *              it to this stack's internal render texture. It then uses the
   *              internal texture as a uniform for a blend shader and renders
   *              the sprite with the original texture and the blend shader to
   *              the outputTexture
   */
  render (sdk, outputTexture) {
    if (this._stack.length === 0) return Promise.resolve()
    const renderer = sdk.getRenderer()

    let filteredRenderTexture = this._renderTextures[renderer.id]
    if (!filteredRenderTexture) {
      filteredRenderTexture =
        this._renderTextures[renderer.id] = sdk.createRenderTexture()
    }

    const outputSprite = sdk.getSprite()
    this._sprite.setTexture(outputSprite.getTexture())

    // Resize both the output and temp texture
    const spriteBounds = outputSprite.getBounds()
    const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)
    outputTexture.resizeTo(spriteDimensions)
    filteredRenderTexture.resizeTo(spriteDimensions)

    if (this.isDirtyForRenderer(renderer)) {
      // Update primitives
      this._stack.forEach((p) => p.update(sdk))

      // Set filters
      const filters = this._stack.map((p) => p.getFilter())
      this._sprite.setFilters(filters)

      // Render to RenderTexture
      filteredRenderTexture.render(this._container)
      this.setDirtyForRenderer(false, renderer)
    }

    // Use filteredRenderTexture as uniform for blend shader, blend the two
    // to achieve intensity
    this._blendFilter.setIntensity(this._intensity)
    if (renderer.isOfType('canvas')) {
      this._blendFilter.setFilteredCanvas(filteredRenderTexture.getRenderTarget().getCanvas())
    }
    this._sprite.setFilters([
      this._blendFilter
    ])

    const baseTexture = filteredRenderTexture.getBaseTexture()
    baseTexture.setGLUnit(1)

    if (renderer.isOfType('webgl')) {
      renderer.updateTexture(baseTexture, false)
    }

    outputTexture.render(this._container)

    outputSprite.setTexture(outputTexture)
    return Promise.resolve()
  }

  setIntensity (intensity) { this._intensity = intensity }

  /**
   * Checks if this operation is dirty for the given renderer
   * @param  {PhotoEditorSDK.Engine.BaseRenderer}  renderer
   * @return {Boolean}
   */
  isDirtyForRenderer (renderer) {
    if (!(renderer.id in this._dirtiness)) {
      this._dirtiness[renderer.id] = true
    }
    return this._dirtiness[renderer.id]
  }

  /**
   * Sets the dirtiness for the given renderer
   * @param {Boolean} dirty
   * @param {PhotoEditorSDK.Engine.BaseRenderer} renderer
   */
  setDirtyForRenderer (dirty, renderer) {
    this._dirtiness[renderer.id] = dirty
  }

  /**
   * Sets the dirtiness for all renderers
   * @param {Boolean} dirty
   */
  setDirty (dirty) {
    for (let rendererId in this._dirtiness) {
      this._dirtiness[rendererId] = dirty
    }
  }

  /**
   * Cleans up this instance
   */
  dispose () {
    for (let rendererId in this._renderTextures) {
      this._renderTextures[rendererId].dispose()
      delete this._renderTextures[rendererId]
    }
    this._stack.forEach((primitive) => primitive.dispose())
    this._stack = []
    this._blendFilter.dispose()

    this._sprite.dispose()
  }
}

export default PrimitivesStack
