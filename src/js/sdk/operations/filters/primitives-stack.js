/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, Engine, Utils } from '../../globals'
import Promise from '../../vendor/promise'

class BlendFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../../shaders/generic/blend.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_filteredImage: {
        type: 'i',
        value: 1
      },
      u_intensity: {
        type: 'f',
        value: 1.0
      }
    })
    super(null, fragmentSource, uniforms)
  }
}

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
   * Renders this stack using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @param  {Engine.RenderTexture} outputTexture
   * @return {Promise}
   * @internal This takes the output sprite's current texture and renders
   *           it to this stack's internal render texture. It then uses the
   *           internal texture as a uniform for a blend shader and renders
   *           the sprite with the original texture and the blend shader to
   *           the outputTexture
   */
  renderWebGL (sdk, outputTexture) {
    if (this._stack.length === 0) return Promise.resolve()
    const renderer = sdk.getRenderer()

    let renderTexture = this._renderTextures[renderer.id]
    if (!renderTexture) {
      renderTexture =
        this._renderTextures[renderer.id] = sdk.createRenderTexture()
    }

    const outputSprite = sdk.getSprite()
    if (this.isDirtyForRenderer(renderer)) {
      this._sprite.setTexture(outputSprite.getTexture())

      // Resize both the output and temp texture
      const spriteBounds = outputSprite.getBounds()
      const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)
      outputTexture.resizeTo(spriteDimensions)
      renderTexture.resizeTo(spriteDimensions)

      // Update primitives
      this._stack.forEach((p) => p.update(sdk))

      // Set filters
      const filters = this._stack.map((p) => p.getFilter())
      this._sprite.setFilters(filters)

      // Render to RenderTexture
      renderTexture.render(this._container)

      // Use renderTexture as uniform for blend shader, blend the two
      // to achieve intensity
      this._blendFilter.setUniform('u_intensity', this._intensity)
      this._sprite.setFilters([
        this._blendFilter
      ])

      const baseTexture = renderTexture.getBaseTexture()
      baseTexture.setGLUnit(1)

      if (renderer.isOfType('webgl')) {
        renderer.updateTexture(baseTexture, false)
      }

      outputTexture.render(this._container)
    }

    outputSprite.setTexture(outputTexture)
    return Promise.resolve()
  }

  /**
   * Renders this stack using Canvas2D
   * @param  {PhotoEditorSDK} sdk
   * @param  {Engine.RenderTexture} renderTexture
   * @return {Promise}
   */
  renderCanvas (sdk, renderTexture) {
    return this.renderWebGL(sdk, renderTexture)
  }

  /**
   * Renders the stack of primitives on the renderer
   * @param  {PhotoEditorSDK} sdk
   * @param  {Engine.RenderTexture} renderTexture
   * @return {Promise}
   */
  render (sdk, renderTexture) {
    if (sdk.getRenderer().isOfType('webgl')) {
      return this.renderWebGL(sdk, renderTexture)
    } else {
      return this.renderCanvas(sdk, renderTexture)
    }
  }

  setIntensity (intensity) { this._intensity = intensity }

  /**
   * Checks if this operation is dirty for the given renderer
   * @param  {BaseRenderer}  renderer
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
   * @param {BaseRenderer} renderer
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
