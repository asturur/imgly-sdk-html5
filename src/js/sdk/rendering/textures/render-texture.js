/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Rectangle } from '../globals'
import Texture from './texture'
import BaseTexture from './base-texture'
import WebGLRenderer from '../renderers/webgl/webgl-renderer'
import RenderTarget from '../utils/render-target'

export default class RenderTexture extends Texture {
  constructor (renderer, width = 100, height = 100, resolution = 1) {
    const baseTexture = new BaseTexture()
    const frame = baseTexture.getFrame()
    frame.width = width
    frame.height = height
    baseTexture.setResolution(resolution)
    super(baseTexture, new Rectangle(0, 0, width, height))

    this._width = width
    this._height = height
    this._resolution = resolution
    this._renderer = renderer

    this._setupBuffer()
    this._updateUVs()
  }

  /**
   * Sets up the buffer that we're rendering to
   * @private
   */
  _setupBuffer () {
    if (this._renderer instanceof WebGLRenderer) {
      this._setupWebGLBuffer()
    // } else if (this._renderer instanceof CanvasRenderer) {
      // @TODO
      // this._setupCanvasBuffer()
    }
  }

  /**
   * Sets up the RenderTarget for this RenderTexture
   * @private
   */
  _setupWebGLBuffer () {
    this._buffer = new RenderTarget(this._renderer, this._width, this._height, this._resolution)
    this._baseTexture.setGLTextureForId(this._buffer.getTexture(), this._renderer.getContext().id)
  }

  /**
   * Renders the given DisplayObject
   * @param  {DisplayObject} displayObject
   */
  render (displayObject) {
    if (this._renderer instanceof WebGLRenderer) {
      this._renderWebGL(displayObject)
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
    this._buffer.activate()

    displayObject.getWorldTransform().reset()
    displayObject.getChildren().forEach((child) => {
      child.updateTransform()
    })

    this._renderer.renderDisplayObject(displayObject, this._buffer)
  }
}
