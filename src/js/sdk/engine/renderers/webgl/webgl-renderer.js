/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2 } from '../../globals'
import BaseRenderer from '../base-renderer'
import RenderTarget from '../../utils/render-target'
import ObjectRenderer from './object-renderers/object-renderer'
import SpriteRenderer from './object-renderers/sprite-renderer'
import TextureShader from '../../shaders/texture-shader'
import DisplayObject from '../../display/display-object'
import FilterManager from '../../managers/filter-manager'

export default class WebGLRenderer extends BaseRenderer {
  constructor (...args) {
    super(...args)

    this._fakeObject = new DisplayObject()

    this.shaders = this._initShaders()
    this.renderers = this._initRenderers()
  }

  /**
   * Gets called before the context has been set up
   * @private
   */
  _onBeforeContext () {
    this._filterManager = new FilterManager(this)
    this._currentObjectRenderer = new ObjectRenderer(this)
  }

  /**
   * Sets the given shader to active
   * @param {Shader} shader
   */
  setShader (shader) {
    this._currentShader = shader
    this._context.useProgram(shader.getProgram())
    this._setAttributesForShader(shader)
  }

  /**
   * Uploads the given shader's attributes to the GPU
   * @param {Shader} shader
   */
  _setAttributesForShader (shader) {
    const gl = this._context
    const attributes = shader.getAttributes()
    const attributeLocations = shader.getAttributeLocations()

    attributes.forEach((attributeName) => {
      const attributeLocation = attributeLocations[attributeName]
      gl.enableVertexAttribArray(attributeLocation)
    })
  }

  /**
   * Initializes the default shaders
   * @return {Object.<String,Shader>}
   * @private
   */
  _initShaders () {
    return {
      default: new TextureShader(this)
    }
  }

  /**
   * Initializes the available object renderers
   * @return {Object.<String,ObjectRenderer>}
   * @private
   */
  _initRenderers () {
    return {
      sprite: new SpriteRenderer(this)
    }
  }

  /**
   * Gets the rendering context for this renderer
   * @returns {Object}
   * @private
   */
  _createContext () {
    const canvas = this._canvas
    let gl = canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')

    if (window.WebGLDebugUtils) {
      const logGL = (functionName, args) => {
        console.error('gl.' + functionName + '(' +
          window.WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ')')
      }
      gl = window.WebGLDebugUtils.makeDebugContext(gl, null, null)
    }

    this.id = gl.id = WebGLRenderer.contextId++
    this._context = gl
    gl.renderer = this

    this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)

    this.emit('context', gl)

    return gl
  }

  /**
   * Sets up the rendering context for this renderer
   * @private
   */
  _setupContext () {
    const gl = this._context

    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    this._defaultRenderTarget = new RenderTarget(this,
      this._width,
      this._height,
      this._options.pixelRatio,
      true)
    this.setRenderTarget(this._defaultRenderTarget)

    this.resizeTo(new Vector2(this._width, this._height))
  }

  /**
   * Resizes the context and view to the given size
   * @param  {Vector2} dimensions
   */
  resizeTo (dimensions) {
    super.resizeTo(dimensions)
    if (this._currentRenderTarget) {
      this._currentRenderTarget.resizeTo(dimensions)
    }
  }

  /**
   * Sets the current render target to the passed one and activates
   * it for rendering
   * @param {RenderTarget} renderTarget
   */
  setRenderTarget (renderTarget) {
    this._currentRenderTarget = renderTarget
    this._currentRenderTarget.activate()
  }

  /**
   * Sets the current object renderer to the given one
   * @param {ObjectRenderer} objectRenderer
   */
  setObjectRenderer (objectRenderer) {
    this._currentObjectRenderer.stop()
    this._currentObjectRenderer = objectRenderer
    this._currentObjectRenderer.start()
  }

  /**
   * Renders the given DisplayObject
   * @param  {DisplayObject} displayObject
   */
  render (displayObject) {
    this.setRenderTarget(this._defaultRenderTarget)
    this._defaultRenderTarget.clear(this._options.clearColor)

    // Since the given displayObject is the "root" object
    // right now, we need to give it a dummy / fake object
    // as parent with the default world transform and alpha
    const originalParent = displayObject.getParent()
    displayObject.setParent(this._fakeObject)

    // Update transforms and render this object
    displayObject.updateTransform()

    // Reset parent
    displayObject.setParent(originalParent)

    this.renderDisplayObject(displayObject, this._defaultRenderTarget)
  }

  /**
   * Renders the given DisplayObject
   * @param  {DisplayObject} displayObject
   * @param  {RenderTarget} renderTarget
   */
  renderDisplayObject (displayObject, renderTarget) {
    this.setRenderTarget(renderTarget)
    this._filterManager.setFilterStack(renderTarget.getFilterStack())
    displayObject.renderWebGL(this)
    this._currentObjectRenderer.flush()
  }

  /**
   * Clears the context
   */
  clear () {
    const gl = this._context

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  /**
   * Returns and/or creates a WebGLTexture for the given BaseTexture object
   * @param  {BaseTexture} texture
   * @return {WebGLTexture}
   */
  getOrCreateGLTexture (texture) {
    const gl = this._context

    let glTexture = texture.getGLTextureForId(gl.id)
    if (!glTexture) {
      glTexture = gl.createTexture()
      texture.setGLTextureForId(glTexture, gl.id)
    }

    return glTexture
  }

  /**
   * Updates the given texture
   * @param  {BaseTexture} texture
   * @param  {Boolean} upload = true
   */
  updateTexture (texture, upload = true) {
    const source = texture.getSource()
    const hasSource = !!source

    const gl = this._context
    const glUnit = texture.getGLUnit()
    const glTexture = this.getOrCreateGLTexture(texture)

    gl.activeTexture(gl.TEXTURE0 + glUnit)
    gl.bindTexture(gl.TEXTURE_2D, glTexture)

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

    if (upload && hasSource) {
      if (source instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, source)
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
      }
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.activeTexture(gl.TEXTURE0)
  }

  getCurrentRenderTarget () { return this._currentRenderTarget }
  getCurrentObjectRenderer () { return this._currentObjectRenderer }
  getFilterManager () { return this._filterManager }
  setFilterManager (filterManager) { this._filterManager = filterManager }
}

WebGLRenderer.contextId = 0
