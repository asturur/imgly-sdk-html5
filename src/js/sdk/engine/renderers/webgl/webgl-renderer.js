/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Log } from '../../globals'
import BaseRenderer from '../base-renderer'
import RenderTarget from '../../utils/render-target'
import ObjectRenderer from './object-renderers/object-renderer'
import SpriteRenderer from './object-renderers/sprite-renderer'
import TextureShader from '../../shaders/texture-shader'
import DisplayObject from '../../display/display-object'
import WebGLFilterManager from '../../managers/webgl-filter-manager'
import ContextPerformanceHook from '../../utils/context-performance-hook'

/**
 * The renderer that is used for WebGL rendering
 * @class
 * @extends PhotoEditorSDK.Engine.BaseRenderer
 * @memberof PhotoEditorSDK.Engine
 */
class WebGLRenderer extends BaseRenderer {
  /**
   * Creates a WebGLRenderer
   * @override
   */
  constructor (...args) {
    super(...args)

    this._type = 'webgl'

    this._textures = []
    this._fakeObject = new DisplayObject()
    this._onContextLost = this._onContextLost.bind(this)
    this._onContextRestored = this._onContextRestored.bind(this)

    this.setCanvas(this._options.canvas || document.createElement('canvas'))

    this.shaders = this._initShaders()
    this.renderers = this._initRenderers()
  }

  // -------------------------------------------------------------------------- CONTEXT LOSS

  /**
   * Gets called when the WebGL context has been lost
   * @param  {Event} e
   * @private
   */
  _onContextLost (e) {
    e.preventDefault()
    Log.warn(this.constructor.name, 'WebGL context has been lost - trying to restore.')
  }

  /**
   * Gets called when the WebGL context has been restored. Cleans up and resets everything.
   * @private
   */
  _onContextRestored () {
    Log.warn(this.constructor.name, 'WebGL context has been restored. Clearing all textures.')

    this._textures.forEach((texture) => {
      texture.disposeGLTextures(this)
    })

    this._createContext()
    this._setupContext()
    this.emit('context-restored')
  }

  /**
   * Gets called before the context has been set up
   * @private
   */
  _onBeforeContext () {
    this._filterManager = new WebGLFilterManager(this)
    this._currentObjectRenderer = new ObjectRenderer(this)
  }

  /**
   * Sets the given shader to active
   * @param {PhotoEditorSDK.Engine.Shader} shader
   */
  setShader (shader) {
    this._currentShader = shader
    this._context.useProgram(shader.getProgram())
    this._setAttributesForShader(shader)
  }

  /**
   * Sets the canvas to the given one
   * @param {HTMLCanvasElement} canvas
   */
  setCanvas (canvas) {
    if (this._canvas) {
      this._canvas.removeEventListener('webglcontextlost', this._onContextLost)
      this._canvas.removeEventListener('webglcontextrestored', this._onContextRestored)
    }

    canvas.addEventListener('webglcontextlost', this._onContextLost)
    canvas.addEventListener('webglcontextrestored', this._onContextRestored)

    super.setCanvas(canvas)
  }

  /**
   * Uploads the given shader's attributes to the GPU
   * @param {PhotoEditorSDK.Engine.Shader} shader
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
   * @return {Object}
   * @private
   */
  _initShaders () {
    return {
      default: new TextureShader(this)
    }
  }

  /**
   * Initializes the available object renderers
   * @return {Object}
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

    if (window.WebGLDebugUtils && this._options.debug) {
      const logGL = (functionName, args) => {
        console.error('gl.' + functionName + '(' +
          window.WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ')')
      }
      gl = window.WebGLDebugUtils.makeDebugContext(gl, null, logGL)
    }

    if (Log.canLog('trace')) {
      gl = new ContextPerformanceHook(gl)
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
      this._pixelRatio,
      true)
    this.setRenderTarget(this._defaultRenderTarget)
  }

  /**
   * Resizes the context and view to the given size
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
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
   * @param {PhotoEditorSDK.Engine.RenderTarget} renderTarget
   */
  setRenderTarget (renderTarget) {
    this._currentRenderTarget = renderTarget
    this._currentRenderTarget.activate()
  }

  /**
   * Sets the current object renderer to the given one
   * @param {PhotoEditorSDK.Engine.ObjectRenderer} objectRenderer
   */
  setObjectRenderer (objectRenderer) {
    this._currentObjectRenderer.stop()
    this._currentObjectRenderer = objectRenderer
    this._currentObjectRenderer.start()
  }

  /**
   * Renders the given DisplayObject
   * @param  {PhotoEditorSDK.Engine.DisplayObject} displayObject
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
   * @param  {PhotoEditorSDK.Engine.DisplayObject} displayObject
   * @param  {PhotoEditorSDK.Engine.RenderTarget} renderTarget
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
   * @param  {PhotoEditorSDK.Engine.BaseTexture} texture
   * @return {PhotoEditorSDK.Engine.WebGLTexture}
   */
  getOrCreateGLTexture (texture) {
    const gl = this._context

    let glTexture = texture.getGLTextureForId(gl.id)
    if (!glTexture) {
      glTexture = gl.createTexture()
      texture.setGLTextureForId(glTexture, gl.id)

      // Hold reference to texture for easier disposal
      this._textures.push(texture)
    }

    return glTexture
  }

  /**
   * Updates the given texture
   * @param  {PhotoEditorSDK.Engine.BaseTexture} texture
   * @param  {Boolean} [upload = true]
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.getGLFilter(gl, 'min'))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.getGLFilter(gl, 'mag'))
    gl.activeTexture(gl.TEXTURE0)
  }

  /**
   * Returns the maximum dimensions
   * @return {Number}
   */
  getMaxDimensions () {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      return null
    } else {
      return gl.getParameter(gl.MAX_TEXTURE_SIZE)
    }
  }

  /**
   * Returns the current render target
   * @return {PhotoEditorSDK.Engine.RenderTarget}
   */
  getCurrentRenderTarget () { return this._currentRenderTarget }

  /**
   * Returns the current object renderer
   * @return {PhotoEditorSDK.Engine.ObjectRenderer}
   */
  getCurrentObjectRenderer () { return this._currentObjectRenderer }

  /**
   * Checks if this renderer is supported on the current device and browser
   * @return {Boolean}
   */
  static isSupported () {
    if (typeof window === 'undefined') { return false }

    let canvas = document.createElement('canvas')
    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  }

  /**
   * Disposes this Renderer
   */
  dispose () {
    this._filterManager.dispose()
    this._currentObjectRenderer.dispose()
    this._defaultRenderTarget.dispose()
    this._textures.forEach((texture) => {
      texture.disposeGLTextures(this)
    })
  }
}

WebGLRenderer.contextId = 0
WebGLRenderer.type = 'WebGL'

export default WebGLRenderer
