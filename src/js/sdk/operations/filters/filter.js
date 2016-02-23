/* jshint unused: false */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import PrimitivesStack from './primitives-stack'

/**
 * Base class for filters. Extendable via {@link PhotoEditorSDK.Filter#extend}
 * @class
 * @memberof PhotoEditorSDK
 */
class Filter {
  constructor (intensity = 1.0) {
    this._intensity = intensity
    this._stack = new PrimitivesStack(intensity)
  }

  /**
   * Renders the filter
   * @param  {PhotoEditorSDK} sdk
   * @param  {Engine.RenderTexture}
   * @return {Promise}
   */
  render (sdk, renderTexture) {
    return this._stack.render(sdk, renderTexture)
  }

  /**
   * Sets the intensity to the given value
   * @param {Number} intensity
   */
  setIntensity (intensity) {
    this._intensity = intensity
    this._stack.setIntensity(intensity)
  }

  /**
   * Sets the dirtiness for the given renderer
   * @param {Boolean} dirty
   * @param {BaseRenderer} renderer
   */
  setDirtyForRenderer (dirty, renderer) {
    this._stack.setDirtyForRenderer(dirty, renderer)
  }

  /**
   * Cleans this instance up
   */
  dispose () {
    this._stack.dispose()
  }
}

/**
 * A unique string that identifies this filter
 * @type {String}
 */
Filter.identifier = null

/**
 * If `isIdentity` is true, this filter does not do anything and can be seen as
 * the default filter.
 * @type {Boolean}
 */
Filter.isIdentity = false

/**
 * This string is used by the UI
 * @type {String}
 */
Filter.displayName = null

/**
 * To create an {@link PhotoEditorSDK.Filter} class of your own, call this
 * method and provide instance properties and functions.
 * @function
 */
Filter.extend = require('../../lib/extend')

// Exposed classes
Filter.PrimitivesStack = PrimitivesStack
Filter.Primitives = {}
Filter.Primitives.Saturation = require('./primitives/saturation')
Filter.Primitives.LookupTable = require('./primitives/lookup-table')
Filter.Primitives.ToneCurve = require('./primitives/tone-curve')
Filter.Primitives.SoftColorOverlay = require('./primitives/soft-color-overlay')
Filter.Primitives.Desaturation = require('./primitives/desaturation')
Filter.Primitives.X400 = require('./primitives/x400')
Filter.Primitives.Grayscale = require('./primitives/grayscale')
Filter.Primitives.Contrast = require('./primitives/contrast')
Filter.Primitives.Glow = require('./primitives/glow')
Filter.Primitives.Gobblin = require('./primitives/gobblin')
Filter.Primitives.Brightness = require('./primitives/brightness')

export default Filter
