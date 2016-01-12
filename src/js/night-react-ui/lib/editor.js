/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDK, SDKUtils } from '../globals'

/**
 * The Editor class is an interface to the SDK, managing operations, rendering,
 * history, zoom etc.
 */
export default class Editor {
  constructor (options) {
    this._options = options

    this._initSDK()
    this._initOperations()
    this._initControls()
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the SDK
   * @private
   */
  _initSDK () {
    const { image, preferredRenderer } = this._options
    const rendererOptions = {
      image
    }
    this._sdk = new SDK(preferredRenderer, rendererOptions)
  }

  /**
   * Initializes the available and enabled controls
   * @private
   */
  _initOperations () {
    this._availableOperations = this._sdk.getOperations()
    this._enabledOperations = []

    let operationIdentifiers = this._options.operations
    if (!(operationIdentifiers instanceof Array)) {
      operationIdentifiers = operationIdentifiers
        .replace(/\s+?/ig, '')
        .split(',')
    }

    for (let identifier in this._availableOperations) {
      if (this._options.operations === 'all' ||
          operationIdentifiers.indexOf(identifier) !== -1) {
        this._enabledOperations.push(identifier)
      }
    }
  }

  /**
   * Initializes the available and enabled controls
   * @private
   */
  _initControls () {
    // @TODO Use `options.extensions.controls` instead of `options.additionalControls`.
    //       Same goes for operations and languages.
    this._availableControls = SDKUtils.extend({
      filters: require('../components/controls/filters/'),
      orientation: require('../components/controls/orientation/'),
      adjustments: require('../components/controls/adjustments/'),
      crop: require('../components/controls/crop/'),
      focus: require('../components/controls/focus/'),
      frame: require('../components/controls/frame/'),
      stickers: require('../components/controls/stickers/'),
      text: require('../components/controls/text/')
    }, this._options.additionalControls)

    this._enabledControls = []
    for (let identifier in this._availableControls) {
      const controls = this._availableControls[identifier]
      if (!controls.isSelectable || controls.isSelectable(this)) {
        this._enabledControls.push(controls)
      }
    }

    this._enabledControls.sort((a, b) => {
      let sortA = this._options.controlsOrder.indexOf(a.identifier)
      let sortB = this._options.controlsOrder.indexOf(b.identifier)
      if (sortA === -1) return 1
      if (sortB === -1) return -1
      if (sortA < sortB) return -1
      if (sortA > sortB) return 1
      return 0
    })
  }

  // -------------------------------------------------------------------------- PUBLIC CONTROLS API

  /**
   * Returns the enabled controls
   * @return {Array.<Object>}
   */
  getEnabledControls () {
    return this._enabledControls
  }

  // -------------------------------------------------------------------------- PUBLIC OPERATIONS API

  /**
   * Checks whether the operation with the given identifier is enabled
   * @param  {String}  name
   * @return {Boolean}
   */
  isOperationEnabled (name) {
    return this._enabledOperations.indexOf(name) !== -1
  }

  // -------------------------------------------------------------------------- MISC PUBLIC API

  /**
   * Triggers a render
   */
  render () {
    return this._sdk.render()
  }

  // -------------------------------------------------------------------------- GETTERS / SETTERS

  getRenderer () { return this._sdk.getRenderer() }
  getSDK () { return this._sdk }
}
