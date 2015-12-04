/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class Shader {
  constructor (renderer, vertexSource, fragmentSource, uniforms, attributes) {
    this._renderer = renderer
    this._vertexSource = vertexSource
    this._fragmentSource = fragmentSource
    this._uniforms = uniforms || {}
    this._attributes = attributes || []
    this._attributeLocations = {}

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
    const location = uniform._location

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
        throw new Error(`Unknown uniform type: ${uniform.type}`)
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
      const uniform = this._uniforms[key]
      uniform._location = gl.getUniformLocation(this._program, key)
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
      const lastError = gl.getProgramInfoLog(program)
      gl.deleteProgram(program)
      throw new Error(`WebGL program linking error: ${lastError}`)
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
      const lastError = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(`WebGL shader compilation error: ${lastError}`)
    }

    return shader
  }

  getProgram () { return this._program }
}
