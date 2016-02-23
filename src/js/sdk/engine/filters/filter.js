/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Log } from '../globals'
import Configurable from '../../lib/configurable'
import Shader from '../shaders/shader'
import TextureShader from '../shaders/texture-shader'

/**
 * A filter can be attached to a DisplayObject and affects the way it is displayed.
 * @class
 * @extends PhotoEditorSDK.Configurable
 * @memberof PhotoEditorSDK.Engine
 */
class Filter extends Configurable {
  /**
   * Goes through the available options, sets _options defaults
   * @param {Object} userOptions
   * @override
   * @protected
   */
  _initOptions () {
    this._shaders = []
    this._availableUniforms = TextureShader.defaultUniforms
    this._attributes = TextureShader.defaultAttributes
    this._vertexSource = TextureShader.defaultVertexSource
    this._fragmentSource = TextureShader.defaultFragmentSource

    this._initUniforms()
    super._initOptions()
  }

  /**
   * Initializes the uniforms
   * @private
   */
  _initUniforms () {
    this._uniforms = {}
    for (let name in this._availableUniforms) {
      const uniform = this._availableUniforms[name]
      this._uniforms[name] = {
        type: uniform.type,
        value: uniform.default || null
      }
    }

    // Options are also turned into uniforms
    for (let optionName in this.availableOptions) {
      const optionConfig = this.availableOptions[optionName]

      if (!optionConfig.uniformType) {
        Log.trace(this.constructor.name, `Option \`${optionName}\` is missing a \`uniformType\`!`)
      } else {
        this._uniforms[`u_${optionName}`] = {
          type: optionConfig.uniformType,
          value: optionConfig.default || null
        }
      }
    }
  }

  /**
   * Sets the value for the given option, validates it
   * @param {String} optionName
   * @param {*} value
   * @param {Boolean} update = true
   * @override
   */
  setOption (optionName, value, update = true) {
    super.setOption(optionName, value, update)

    let uniformValue = value
    const optionConfig = this.availableOptions[optionName]

    if (!optionConfig.uniformType) return

    switch (optionConfig.type) {
      case 'color':
        if (optionConfig.uniformType === '4f') {
          uniformValue = value.toGLColor()
        } else if (optionConfig.uniformType === '3f') {
          uniformValue = value.toRGBGLColor()
        }
        break
      case 'vector2':
        uniformValue = [value.x, value.y]
        break
    }

    this.setUniform(`u_${optionName}`, uniformValue)
  }

  /**
   * Sets the given uniform to the given value
   * @param {String} name
   * @param {*} value
   * @param {Boolean} sync = false
   */
  setUniform (name, value, sync = false) {
    this._uniforms[name].value = value
  }

  /**
   * Sets the given uniforms to their values
   * @param {Object}  uniforms
   * @param {Boolean} sync = false
   */
  setUniforms (uniforms, sync = false) {
    for (let name in uniforms) {
      this._uniforms[name].value = uniforms[name]
      if (sync) {
        this.syncUniform(name)
      }
    }
  }

  /**
   * Synchronizes the uniform with the given name
   * @param  {String} name
   */
  syncUniform (name) {
    this._shaders.forEach((shader) => {
      shader.syncUniform(name)
    })
  }

  /**
   * Synchronizes all uniforms with WebGL
   */
  syncUniforms () {
    this._shaders.forEach((shader) => {
      shader.syncUniforms()
    })
  }

  /**
   * Returns the shader for the given renderer
   * @param  {PhotoEditorSDK.Engine.WebGLRenderer} renderer
   * @return {PhotoEditorSDK.Engine.Shader}
   */
  getShaderForRenderer (renderer) {
    const gl = renderer.getContext()
    let shader = this._shaders[gl.id]

    if (!shader) {
      shader = new Shader(renderer,
        this._vertexSource,
        this._fragmentSource,
        this._uniforms,
        this._attributes
      )

      this._shaders[gl.id] = shader
    }

    return shader
  }

  /**
   * Applies this filter to the given inputTarget and renders it to
   * the given outputTarget
   * @param  {PhotoEditorSDK.Engine.BaseRenderer} renderer
   * @param  {PhotoEditorSDK.Engine.RenderTarget} inputTarget
   * @param  {PhotoEditorSDK.Engine.RenderTarget} outputTarget
   * @param  {Boolean} clear = false
   */
  apply (renderer, inputTarget, outputTarget, clear = false) {
    if (renderer.isOfType('webgl')) {
      this._applyWebGL(renderer, inputTarget, outputTarget, clear)
    } else if (renderer.isOfType('canvas')) {
      this._applyCanvas(renderer, inputTarget, outputTarget, clear)
    }
  }

  /**
   * Applies this filter to the given inputTarget and renders it to
   * the given outputTarget using the WebGLRenderer
   * @param  {PhotoEditorSDK.Engine.WebGLRenderer} renderer
   * @param  {PhotoEditorSDK.Engine.RenderTarget} inputTarget
   * @param  {PhotoEditorSDK.Engine.RenderTarget} outputTarget
   * @param  {Boolean} clear = false
   * @private
   */
  _applyWebGL (renderer, inputTarget, outputTarget, clear = false) {
    const gl = renderer.getContext()
    const shader = this.getShaderForRenderer(renderer)

    renderer.setRenderTarget(outputTarget)
    if (clear) {
      outputTarget.clear()
    }

    renderer.setShader(shader)

    const projectionMatrix = renderer.getCurrentRenderTarget().getProjectionMatrix().toArray()
    shader.setUniform('u_projMatrix', projectionMatrix)
    shader.syncUniforms()

    // Render!
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, inputTarget.getTexture())
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
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
    const inputContext = inputTarget.getContext()
    const outputContext = outputTarget.getContext()

    Log.warn(this.constructor.name, '`_applyCanvas` is not implemented. Just copying image data from `inputTarget` to `outputTarget`.')

    const imageData = inputContext.getImageData(0, 0, canvas.width, canvas.height)
    outputContext.putImageData(imageData, 0, 0)
  }

  /**
   * Disposes this Filter
   */
  dispose () {
    this._shaders.forEach((shader) => shader.dispose())
    this._shaders = []
  }
}

export default Filter
