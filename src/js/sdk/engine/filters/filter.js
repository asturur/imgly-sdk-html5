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

export default class Filter extends Configurable {
  constructor (...args) {
    super(...args)

    this._shaders = []
    this._availableUniforms = TextureShader.defaultUniforms
    this._attributes = TextureShader.defaultAttributes
    this._vertexSource = TextureShader.defaultVertexSource
    this._fragmentSource = TextureShader.defaultFragmentSource

    this._initUniforms()
    this._initOptions()
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
        Log.warn(this.constructor.name, `Option \`${optionName}\` is missing a \`uniformType\`!`)
      }

      this._uniforms[`u_${optionName}`] = {
        type: optionConfig.uniformType,
        value: optionConfig.default || null
      }
    }
  }

  /**
   * Sets the value for the given option, validates it
   * @param {String} optionName
   * @param {*} value
   * @param {Boolean} update = true
   * @private
   */
  setOption (optionName, value, update = true) {
    super.setOption(optionName, value, update)

    this.setUniform(`u_${optionName}`, value)
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
   * @param  {WebGLRenderer} renderer
   * @return {Shader}
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
   * @param  {BaseRenderer} renderer
   * @param  {RenderTarget} inputTarget
   * @param  {RenderTarget} outputTarget
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
   * @param  {WebGLRenderer} renderer
   * @param  {RenderTarget} inputTarget
   * @param  {RenderTarget} outputTarget
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
   * @param  {CanvasRenderer} renderer
   * @param  {RenderTarget} inputTarget
   * @param  {RenderTarget} outputTarget
   * @param  {Boolean} clear = false
   * @private
   */
  _applyCanvas (renderer, inputTarget, outputTarget, clear = false) {
    const canvas = inputTarget.getCanvas()
    const inputContext = inputTarget.getContext()
    const outputContext = outputTarget.getContext()

    const imageData = inputContext.getImageData(0, 0, canvas.width, canvas.height)
    outputContext.putImageData(imageData, 0, 0)
  }

  /**
   * Cleans up this instance
   */
  dispose () {
    this._shaders.forEach((shader) => shader.dispose())
    this._shaders = []
  }
}
