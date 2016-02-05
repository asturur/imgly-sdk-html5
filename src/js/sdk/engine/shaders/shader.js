/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Globals from '../globals'
const { Log } = Globals

export default class Shader {
  constructor (renderer, vertexSource, fragmentSource, uniforms, attributes) {
    this._renderer = renderer
    this._vertexSource = vertexSource
    this._fragmentSource = fragmentSource
    this._uniforms = uniforms || {}
    this._uniformLocations = {}
    this._attributes = attributes || []
    this._attributeLocations = {}

    this._onContextChange = this._onContextChange.bind(this)
    this._renderer.on('context', this._onContextChange)

    this.init()
  }

  /**
   * Compiles this shader and caches the uniform locations
   */
  init () {
    this._compile()

    const gl = this._renderer.getContext()
    gl.useProgram(this._program)

    this._cacheUniformLocations()
    this._cacheAttributeLocations()
  }

  /**
   * Gets called when the attached Renderer changes its context
   * @private
   */
  _onContextChange () {
    this.init()
  }

  /**
   * Binds the given buffers for this shader
   * @param {WebGLBuffer} vertexBuffer
   * @param {WebGLBuffer} indexBuffer
   */
  setupBuffers (vertexBuffer, indexBuffer) {
    const gl = this._renderer.getContext()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    gl.vertexAttribPointer(this._attributeLocations.a_position, 2, gl.FLOAT, false, Globals.VERTEX_BYTE_SIZE, 0)
    gl.vertexAttribPointer(this._attributeLocations.a_texCoord, 2, gl.FLOAT, false, Globals.VERTEX_BYTE_SIZE, 2 * 4)
    gl.vertexAttribPointer(this._attributeLocations.a_color, 4, gl.UNSIGNED_BYTE, true, Globals.VERTEX_BYTE_SIZE, 4 * 4)
  }

  /**
   * Synchronizes all uniforms with WebGL
   */
  syncUniforms () {
    Object.keys(this._uniforms)
      .forEach((key) => {
        this.syncUniform(key)
      })
  }

  /**
   * Synchronizes the uniform with the given name
   * @param  {String} name
   */
  syncUniform (name) {
    const gl = this._renderer.getContext()
    const uniform = this._uniforms[name]
    const location = this._uniformLocations[name]

    switch (uniform.type) {
      case 'sampler2d':
      case 'i':
      case '1i':
        gl.uniform1i(location, uniform.value)
        break
      case 'f':
      case '1f':
        gl.uniform1f(location, uniform.value)
        break
      case '2f':
        gl.uniform2f(location, uniform.value[0], uniform.value[1])
        break
      case '3f':
        gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2])
        break
      case '4f':
        gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
        break
      case '2fv':
        gl.uniform2fv(location, uniform.value)
        break
      case 'mat3':
      case 'mat3fv':
        gl.uniformMatrix3fv(location, false, uniform.value)
        break
      default:
        Log.warn(this.constructor.name, `Unknown uniform type: ${uniform.type}`)
    }
  }

  /**
   * Caches the locations for all attributes
   * @private
   */
  _cacheAttributeLocations () {
    const gl = this._renderer.getContext()
    this._attributes.forEach((name) => {
      this._attributeLocations[name] = gl.getAttribLocation(this._program, name)
    })
  }

  /**
   * Caches the locations for all uniforms
   * @private
   */
  _cacheUniformLocations () {
    const gl = this._renderer.getContext()
    const keys = Object.keys(this._uniforms)
    keys.forEach((key) => {
      this._uniformLocations[key] = gl.getUniformLocation(this._program, key)
    })
  }

  /**
   * Compiles the vertex and fragment sources of this shader
   * @private
   */
  _compile () {
    const gl = this._renderer.getContext()

    const vertexShader = this._compileShader(gl.VERTEX_SHADER, this._vertexSource)
    const fragmentShader = this._compileShader(gl.FRAGMENT_SHADER, this._fragmentSource)

    // Create the WebGL program and attach the shaders
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    // Link the program
    gl.linkProgram(program)

    // Check linking status
    // Check linking status
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!linked) {
      let errorMessage = gl.getProgramInfoLog(program)
      if (gl.isContextLost()) errorMessage = 'WebGL context lost'
      gl.deleteProgram(program)
      Log.error(this.constructor.name, `WebGL program linking error: ${errorMessage}`)
    }

    this._program = program
  }

  /**
   * Creates and compiles a shader with the given type and source
   * @param  {Number} shaderType
   * @param  {String} shaderSource
   * @return {WebGLShader}
   * @private
   */
  _compileShader (shaderType, shaderSource) {
    const gl = this._renderer.getContext()

    // Create the shader and compile it
    const shader = gl.createShader(shaderType)
    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)

    // Check compilation status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!compiled) {
      let errorMessage = gl.getShaderInfoLog(shader)
      if (gl.isContextLost()) errorMessage = 'WebGL context lost'
      gl.deleteShader(shader)
      Log.error(this.constructor.name, `WebGL shader compilation error: ${errorMessage}`)
    }

    return shader
  }

  /**
   * Sets the given uniform to the given value
   * @param {String} name
   * @param {*} value
   * @param {Boolean} sync = false
   */
  setUniform (name, value, sync = false) {
    this._uniforms[name].value = value
    if (sync) {
      this.syncUniform(name)
    }
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
   * Cleans up this shader
   */
  dispose () {
    const gl = this._renderer.getContext()
    gl.deleteProgram(this._program)

    this._uniforms = null
    this._uniformLocations = null
    this._attributes = null
    this._attributeLocations = null

    this._renderer.off('context', this._onContextChange)
  }

  getUniforms () { return this._uniforms }
  getAttributes () { return this._attributes }
  getAttributeLocations () { return this._attributeLocations }
  getProgram () { return this._program }
}
