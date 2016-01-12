/* jshint unused:false */
/* jshint -W083 */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Engine from '../engine/'
import Utils from '../lib/utils'
import Vector2 from '../lib/math/vector2'
import Configurable from '../lib/configurable'

/**
 * Base class for Operations. Extendable via {@link PhotoEditorSDK.Operation#extend}.
 * @class
 * @alias PhotoEditorSDK.Operation
 */
class Operation extends Configurable {
  constructor (kit, options) {
    super(options, {
      numberFormat: { type: 'string', default: 'relative', available: ['absolute', 'relative'] },
      enabled: { type: 'boolean', default: true }
    })

    this._kit = kit
    this._dirtiness = {}

    this._glslPrograms = {}
    this._uuid = Utils.getUUID()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when options have been changed. Sets this operation to dirty.
   * @private
   */
  _onOptionsChange () {
    this._dirty = true
  }

  /**
   * Applies this operation
   * @param  {Renderer} renderer
   * @return {Promise}
   * @abstract
   */
  render (renderer) {
    if (!this.getEnabled()) {
      return Promise.resolve()
    }

    let renderFn
    if (renderer.getRenderer() instanceof Engine.WebGLRenderer) {
      /* istanbul ignore next */
      renderFn = this._renderWebGL.bind(this)
    } else {
      renderFn = this._renderCanvas.bind(this)
    }

    // Handle caching
    if (this._dirty) {
      return renderFn(renderer)
        .then(() => {
          // renderer.cache(this._uuid)
          this._dirty = false
        })
    } else {
      return renderer.drawCached(this._uuid)
    }
  }

  /**
   * Applies this operation using WebGL
   * @return {WebGLRenderer} renderer
   * @private
   */
  /* istanbul ignore next */
  _renderWebGL () {
    throw new Error('Operation#_renderWebGL is abstract and not implemented in inherited class.')
  }

  /**
   * Applies this operation using Canvas2D
   * @return {CanvasRenderer} renderer
   * @private
   */
  _renderCanvas () {
    throw new Error('Operation#_renderCanvas is abstract and not implemented in inherited class.')
  }

  /**
   * Gets the new dimensions
   * @param {Renderer} renderer
   * @param {Vector2} [dimensions]
   * @return {Vector2}
   * @private
   */
  getNewDimensions (renderer, dimensions) {
    let canvas = renderer.getCanvas()
    dimensions = dimensions || new Vector2(canvas.width, canvas.height)

    return dimensions
  }

  /**
   * Gets called when this operation has been marked as dirty
   * @protected
   */
  _onDirty () {

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
   * @param  {BaseRenderer}  renderer
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
   * @param {BaseRenderer} renderer
   */
  setDirtyForRenderer (dirty, renderer) {
    this._dirtiness[renderer.id] = dirty
  }

  getOptions () { return this._options }
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
