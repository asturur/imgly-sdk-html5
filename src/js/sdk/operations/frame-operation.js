/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Engine, Vector2, Utils, Color } from '../globals'
import Operation from './operation'

class FrameFilter extends Engine.Filter {
  constructor () {
    const fragmentSource = require('raw!../shaders/operations/frame.frag')
    const uniforms = Utils.extend(Engine.Shaders.TextureShader.defaultUniforms, {
      u_color: {
        type: '4f',
        value: Color.TRANSPARENT
      },
      u_thickness: {
        type: '2f',
        value: 0
      }
    })
    super(null, fragmentSource, uniforms)
  }
}

/**
 * An operation that can draw a frame on the canvas
 *
 * @class
 * @alias PhotoEditorSDK.Operations.FrameOperation
 * @extends PhotoEditorSDK.Operation
 */
export default class FrameOperation extends Operation {
  constructor (...args) {
    super(...args)

    this._filter = new FrameFilter()
    this._sprite.setFilters([this._filter])
  }

  /**
   * Crops this image using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL (sdk) {
    const outputSprite = sdk.getSprite()
    const renderTexture = this._getRenderTexture(sdk)
    const renderer = sdk.getRenderer()

    this._sprite.setTexture(outputSprite.getTexture())

    const spriteBounds = outputSprite.getBounds()
    const spriteDimensions = new Vector2(spriteBounds.width, spriteBounds.height)

    renderTexture.resizeTo(spriteDimensions)

    // Update uniforms
    const thickness = this._options.thickness *
      Math.min(spriteDimensions.x, spriteDimensions.y)
    const thicknessVec2 = [thickness / spriteDimensions.x, thickness / spriteDimensions.y]
    this._filter.setUniforms({
      u_color: this._options.color.toGLColor(),
      u_thickness: thicknessVec2
    })

    renderTexture.render(this._container)
    outputSprite.setTexture(renderTexture)
    this.setDirtyForRenderer(false, renderer)

    return Promise.resolve()
  }

  /**
   * Crops the image using Canvas2D
   * @param  {CanvasRenderer} renderer
   * @return {Promise}
   * @private
   */
  _renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      const canvas = renderer.getCanvas()
      const context = renderer.getContext()

      const color = this._options.color
      const thickness = this._options.thickness * Math.min(canvas.width, canvas.height)

      context.save()
      context.beginPath()
      context.lineWidth = thickness * 2
      context.strokeStyle = color.toRGBA()
      context.rect(0, 0, canvas.width, canvas.height)
      context.stroke()
      context.restore()

      resolve()
    })
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FrameOperation.identifier = 'frame'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
FrameOperation.prototype.availableOptions = {
  color: { type: 'color', default: new Color(0, 0, 0, 1) },
  thickness: { type: 'number', default: 0.05 }
}
