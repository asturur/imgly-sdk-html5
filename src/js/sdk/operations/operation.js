/* jshint unused:false */
/* jshint -W083 */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Log from '../../shared/log'
import Engine from '../engine/'
import Configurable from '../lib/configurable'
import PerformanceTest from '../lib/performance-test'

/**
 * Base class for Operations
 * @class
 * @alias Operation
 * @extends PhotoEditorSDK.Configurable
 * @memberof PhotoEditorSDK
 */
class Operation extends Configurable {
  /**
   * Creates an Operation
   * @param  {PhotoEditorSDK} sdk
   * @param  {Object} [options]
   */
  constructor (sdk, options = {}) {
    super(options, {
      enabled: { type: 'boolean', default: true }
    })

    this._sdk = sdk
    this._dirtiness = {}

    this._sprite = new Engine.Sprite()
    this._container = new Engine.Container()
    this._container.addChild(this._sprite)

    this._initOptions(options)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when options have been changed. Sets this operation to dirty.
   * @private
   */
  _onOptionsChange () {
    this.setDirty(true)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Creates and returns a render texture
   * @param  {PhotoEditorSDK} sdk
   * @return {PhotoEditorSDK.Engine.RenderTexture}
   * @protected
   */
  _getRenderTexture (sdk) {
    if (!this._renderTexture) {
      this._renderTexture = sdk.createRenderTexture()
    }
    return this._renderTexture
  }

  /**
   * Applies this operation
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise}
   * @abstract
   */
  render (sdk) {
    if (!this.getEnabled()) {
      return Promise.resolve()
    }

    const renderer = sdk.getRenderer()
    let promise
    let perf
    if (PerformanceTest.canLog()) {
      perf = new PerformanceTest(this.constructor.name, 'Rendering')
    }

    // Handle caching
    if (this.isDirtyForRenderer(renderer)) {
      promise = this._render(sdk)
        .then(() => {
          this.setDirtyForRenderer(false, renderer)
        })
    } else {
      Log.info(this.constructor.name, 'Rendering from cache')
      promise = this.renderCached(sdk)
    }

    return promise
      .then(() => {
        if (perf) perf.stop()
      })
  }

  /**
   * Renders the cached version of this operation
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise}
   */
  renderCached (sdk) {
    const outputSprite = sdk.getSprite()
    outputSprite.setTexture(this._getRenderTexture(sdk))
    return Promise.resolve()
  }

  /**
   * Renders this operation
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise}
   * @private
   */
  _render (sdk) {
    let renderFn
    if (sdk.getRenderer() instanceof Engine.WebGLRenderer) {
      /* istanbul ignore next */
      renderFn = this._renderWebGL.bind(this)
    } else {
      renderFn = this._renderCanvas.bind(this)
    }

    return renderFn(sdk)
  }

  /**
   * Applies this operation using WebGL
   * @param  {PhotoEditorSDK} sdk
   * @return {PhotoEditorSDK.Engine.WebGLRenderer} renderer
   * @protected
   * @abstract
   */
  _renderWebGL (sdk) {
    throw new Error('Operation#_renderWebGL is abstract and not implemented in inherited class.')
  }

  /**
   * Applies this operation using Canvas2D
   * @param  {PhotoEditorSDK} sdk
   * @return {PhotoEditorSDK.Engine.CanvasRenderer} renderer
   * @protected
   * @abstract
   */
  _renderCanvas (sdk) {
    throw new Error('Operation#_renderCanvas is abstract and not implemented in inherited class.')
  }

  /**
   * Returns the dimensions that an image with the given `dimensions`
   * would have after this operation has been applied
   * @param  {PhotoEditorSDK.Math.Vector2} dimensions
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getNewDimensions (dimensions) {
    return dimensions.clone()
  }

  /**
   * Resets this operation
   */
  reset () {
    this._dirty = true
    this._glslPrograms = {}
  }

  // -------------------------------------------------------------------------- DIRTINESS

  /**
   * Checks if this operation is dirty for the given renderer
   * @param  {PhotoEditorSDK.Engine.BaseRenderer}  renderer
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
   * @param {PhotoEditorSDK.Engine.BaseRenderer} renderer
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
      this.setDirtyForRenderer(dirty, { id: rendererId })
    }
  }

  /**
   * Disposes the RenderTexture
   */
  disposeRenderTexture () {
    this._renderTexture = null
  }

  /**
   * Disposes this operation
   */
  dispose () {

  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
Operation.identifier = null

/**
 * To create an {@link PhotoEditorSDK.Operation} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
import extend from '../lib/extend'
Operation.extend = extend

export default Operation
