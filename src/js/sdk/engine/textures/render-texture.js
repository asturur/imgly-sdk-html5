/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, Rectangle } from '../globals'
import Texture from './texture'
import BaseTexture from './base-texture'
import RenderTarget from '../utils/render-target'
import CanvasBuffer from '../utils/canvas-buffer'
import WebGLFilterManager from '../managers/webgl-filter-manager'
import CanvasFilterManager from '../managers/canvas-filter-manager'

export default class RenderTexture extends Texture {
  constructor (renderer, width = 100, height = 100, pixelRatio = 1) {
    const baseTexture = new BaseTexture()
    const frame = baseTexture.getFrame()
    frame.width = width
    frame.height = height
    baseTexture.setPixelRatio(pixelRatio)
    baseTexture.setLoaded(true)
    super(baseTexture, new Rectangle(0, 0, width, height))

    // RenderTexture is always loaded!
    this._loaded = true
    this._width = width
    this._height = height
    this._pixelRatio = pixelRatio
    this._renderer = renderer

    this._setupFilterManager()
    this._setupBuffer()
    this._updateUVs()
  }

  /**
   * Sets up the filter manager
   * @private
   */
  _setupFilterManager () {
    if (this._renderer.isOfType('webgl')) {
      this._filterManager = new WebGLFilterManager(this._renderer)
    } else if (this._renderer.isOfType('canvas')) {
      this._filterManager = new CanvasFilterManager(this._renderer)
    }

    this._filterManager.resizeTo(new Vector2(this._width, this._height))
  }

  /**
   * Sets up the buffer that we're rendering to
   * @private
   */
  _setupBuffer () {
    if (this._renderer.isOfType('webgl')) {
      this._setupWebGLBuffer()
    } else if (this._renderer.isOfType('canvas')) {
      this._setupCanvasBuffer()
    }
  }

  /**
   * Sets up the RenderTarget for this RenderTexture
   * @private
   */
  _setupWebGLBuffer () {
    this._renderTarget = new RenderTarget(this._renderer, this._width, this._height, this._pixelRatio)
    this._baseTexture.setGLTextureForId(this._renderTarget.getTexture(), this._renderer.getContext().id)
  }

  /**
   * Sets up the CanvasBuffer for this RenderTexture
   * @private
   */
  _setupCanvasBuffer () {
    this._renderTarget = new CanvasBuffer(
      this._width,
      this._height,
      this._pixelRatio)
    this._baseTexture.setSource(this._renderTarget.getCanvas())
  }

  /**
   * Clears this texture's RenderTarget
   * @param {SDK.Color} color
   */
  clear (color) {
    this._renderTarget.clear(color)
  }

  /**
   * Resizes this RenderTexture to the given dimensions
   * @param  {Vector2} dimensions
   */
  resizeTo (dimensions) {
    if (this._width === dimensions.x && this._height === dimensions.y) return

    this._width = dimensions.x
    this._height = dimensions.y
    this._frame.width = dimensions.x
    this._frame.height = dimensions.y

    this._baseTexture.resizeTo(dimensions)
    this._renderTarget.resizeTo(dimensions)
    if (this._filterManager) {
      this._filterManager.resizeTo(dimensions)
    }
  }

  /**
   * Renders the given DisplayObject
   * @param  {DisplayObject} displayObject
   */
  render (displayObject) {
    if (this._renderer.isOfType('webgl')) {
      this._renderWebGL(displayObject)
    } else if (this._renderer.isOfType('canvas')) {
      this._renderCanvas(displayObject)
    } else {
      throw new Error(`RenderTexture does not support rendering via ${this._renderer.constructor.name}`)
    }
  }

  /**
   * Renders the given DisplayObject using WebGL
   * @param  {DisplayObject} displayObject
   * @private
   */
  _renderWebGL (displayObject) {
    this._renderTarget.activate()

    displayObject.getWorldTransform().reset()
    displayObject.getChildren().forEach((child) => {
      child.updateTransform()
    })

    const tempFilterManager = this._renderer.getFilterManager()
    this._renderer.setFilterManager(this._filterManager)
    this._renderer.renderDisplayObject(displayObject, this._renderTarget)
    this._renderer.setFilterManager(tempFilterManager)
  }

  /**
   * Renders the given DisplayObject using Canvas2D
   * @param  {displayObject} displayObject
   * @private
   */
  _renderCanvas (displayObject) {
    displayObject.getWorldTransform().reset()
    displayObject.getChildren().forEach((child) => {
      child.updateTransform()
    })

    const originalPixelRatio = this._renderer.getPixelRatio()
    this._renderer.setPixelRatio(this._pixelRatio)
    this._renderer.renderDisplayObject(displayObject, this._renderTarget)
    this._renderer.setPixelRatio(originalPixelRatio)
  }

  getRenderTarget () { return this._renderTarget }

  /**
   * Cleans this instance up
   */
  dispose () {
    this._baseTexture.dispose(this._renderer)
    this._renderTarget.dispose()
    this._filterManager.dispose()
  }
}
