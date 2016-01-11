/* global PhotoEditorSDK */
/*!
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import {
  SDKUtils, EventEmitter, Constants, Utils, RenderType, BaseComponent,
  React, ReactDOM, ReactBEM, SharedState
} from './globals'

import EditorComponent from './components/editor-component'
import ScrollbarComponent from './components/scrollbar-component'
import ControlsComponent from './components/controls/controls-component'
import Exporter from './lib/exporter'
import ModalManager from './lib/modal-manager'

export default class NightReactUI extends EventEmitter {
  constructor (options) {
    super()

    this._mediator = new EventEmitter()
    this._options = options
    this._initOptions()

    this._initLanguage()
    // this._initOperations()
    // this._initControls()

    this._operationsMap = {}
    this._initWatermarkOperation()

    this.run()
  }

  /**
   * Initializes the PhotoEditorSDK.Renderer instance
   * @private
   */
  _initRenderer () {
    const rendererOptions = {
      image: this._options.image
    }

    this._renderer = new PhotoEditorSDK.Renderer(this._options.preferredRenderer, rendererOptions)
  }

  /**
   * Sets the given image
   * @param {Image} image
   * @param {EXIF} exif = null
   */
  setImage (image, exif = null) {
    this._renderer.reset()
    this._renderer.operationsStack.clear()
    this._operationsMap = {}
    this._renderer.setImage(image, exif)

    this.fixOperationsStack()
    this._initWatermarkOperation()
  }

  /**
   * Main entry point for the UI
   * @private
   */
  run () {
    this._registerWebFonts()

    // Container has to be position: relative
    this._options.container.style.position = 'relative'
    this._render()
  }

  /**
   * Creates the watermark operation if it doesn't exist yet
   * @private
   */
  _initWatermarkOperation () {
    if (this._options.watermark) {
      this._watermarkOperation = this.getOrCreateOperation('watermark', {
        image: this._options.watermark
      })
    }
  }

  /**
   * Handles error events emitted by the renderer
   * @private
   */
  _handleRendererErrors () {
    this._renderer.on('error', (e) => {
      ModalManager.instance.displayError(
        this.translate(`errors.${e}.title`),
        this.translate(`errors.${e}.text`)
      )
    })
  }

  /**
   * Fixes the operation stack by moving the existing operations to
   * the preferred index
   */
  fixOperationsStack () {
    const stack = this._operationsStack.clone()
    this._operationsStack.clear()
    stack.forEach((operation) => {
      this.addOperation(operation)
    })
  }

  /**
   * Renders the UI
   * @private
   */
  _render () {
    const component = (<EditorComponent
      ui={this}
      mediator={this._mediator}
      options={this._options} />)

    if (this._options.renderReturnsComponent) {
      return component
    } else {
      ReactDOM.render(component, this._options.container)
    }
  }

  /**
   * Exports an image
   * @param {Boolean} download = false
   * @return {Promise}
   */
  export (download = false) {
    if (this._watermarkOperation) {
      this._watermarkOperation = this.getOperation('watermark')
      this._watermarkOperation.setEnabled(false)
    }

    const options = this._options.export
    const exporter = new Exporter(this._renderer, options, download)
    return exporter.export()
      .then((output) => {
        this.emit('export', output)

        if (this._watermarkOperation) {
          this._watermarkOperation.setEnabled(true)
        }
        this._renderer.operationsStack.setAllToDirty()

        return output
      })
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the default options
   * @private
   */
  _initOptions () {
    this._options = SDKUtils.defaults(this._options, {
      preferredRenderer: 'webgl',
      language: 'en',
      operations: 'all',
      title: 'PhotoEditor SDK',
      maxMegaPixels: {},
      responsive: false,
      webcam: true,
      assets: {},
      controlsOrder: [
        'filters', 'orientation', 'adjustments', 'crop', 'focus', 'frame', 'sticker', 'text'
      ],
      operationsOrder: [
        // First, all operations that affect the image dimensions
        'orientation',
        'crop',

        // Then color operations (first filter, then fine-tuning)
        'filter',
        'contrast',
        'brightness',
        'saturation',

        // Then post-processing
        'radial-blur',
        'tilt-shift',
        'frame',
        'sticker',
        'text',
        'watermark'
      ],
      controlsOptions: {},
      showNewButton: true
    })

    if (typeof this._options.maxMegaPixels !== 'number') {
      this._options.maxMegaPixels = SDKUtils.defaults(this._options.maxMegaPixels, {
        mobile: 5,
        desktop: 10
      })
    }

    // @TODO Move `additionalControls` to `extensions.controls`
    this._options.extensions = SDKUtils.defaults(this._options.extensions || {}, {
      languages: [],
      operations: [],
      controls: []
    })

    this._options.assets = SDKUtils.defaults(this._options.assets || {}, {
      baseUrl: '/',
      resolver: null
    })

    this._options.export = SDKUtils.defaults(this._options.export || {}, {
      showButton: true,
      format: 'image/png',
      type: RenderType.IMAGE,
      download: true
    })
  }

  /**
   * Creates a <style> block in <head> that specifies the web fonts
   * that we use in this UI. We're doing this in JS because the assets
   * path is dynamic.
   * @private
   */
  _registerWebFonts () {
    const regularFontPath = this.getAssetPath('fonts/montserrat-regular.woff', true)
    const lightFontPath = this.getAssetPath('fonts/montserrat-light.woff', true)

    const css = `
      // Injected by PhotoEditorSDK
      @font-face {
        font-family: "__pesdk_Montserrat";
        src: url('${regularFontPath}') format('woff');
        font-weight: normal;
        font-style: normal;
      }

      @font-face {
        font-family: "__pesdk_Montserrat";
        src: url('${lightFontPath}') format('woff');
        font-weight: 100;
        font-style: normal;
      }
    `

    const style = document.createElement('style')
    style.innerHTML = css

    const head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
  }

  // -------------------------------------------------------------------------- I18N

  /**
   * Initializes the internationalization
   * @private
   */
  _initLanguage () {
    this._languages = {
      de: require('./lang/de.json'),
      en: require('./lang/en.json')
    }
    this._language = this._languages[this._options.language]
  }

  /**
   * Returns the translation for `key`
   * @param  {String} key
   * @param  {Object} [interpolationOptions]
   * @return {String}
   */
  translate (key, interpolationOptions) {
    return Utils.translate(this._language, key, interpolationOptions)
  }

  // -------------------------------------------------------------------------- PUBLIC OPERATIONS API

  /**
   * If the operation with the given identifier already exists, it returns
   * the existing operation. Otherwise, it creates and returns a new one.
   * @param  {String} identifier
   * @param  {Object} options
   * @return {PhotoEditorSDK.Operation}
   */
  getOrCreateOperation (identifier, options = {}) {
    if (this._operationsMap[identifier]) {
      return this._operationsMap[identifier]
    } else {
      const Operation = this._availableOperations[identifier]
      const operation = new Operation(this._renderer, options)
      this.addOperation(operation)
      return operation
    }
  }

  /**
   * Adds the given operation to the stack
   * @param {Operation} operation
   */
  addOperation (operation) {
    const identifier = operation.constructor.identifier
    operation.on('updated', () => {
      this._mediator.emit(Constants.EVENTS.OPERATION_UPDATED, operation)
    })
    const index = this._preferredOperationOrder.indexOf(identifier)
    this._operationsStack.set(index, operation)
    this._operationsMap[identifier] = operation
  }

  /**
   * Removes the given operation from the stack
   * @param  {Operation} operation
   */
  removeOperation (operation) {
    const identifier = operation.constructor.identifier
    const stack = this._operationsStack.getStack()

    // Remove operation from map
    if (this._operationsMap[identifier] === operation) {
      delete this._operationsMap[identifier]
    }

    // Remove operation from stack
    const index = stack.indexOf(operation)
    if (index !== -1) {
      this._operationsStack.removeAt(index)

      // Set all following operations to dirty, since they might
      // have cached stuff drawn by the removed operation
      for (let i = index + 1; i < stack.length; i++) {
        const operation = stack[i]
        if (!operation) continue
        operation.setDirty(true)
      }
    }
  }

  /**
   * Returns the operation with the given identifier
   * @param  {String} identifier
   * @return {PhotoEditorSDK.Operation}
   */
  getOperation (identifier) {
    return this._operationsMap[identifier]
  }

  getEnabledOperations () { return this._enabledOperations }
  getAvailableControls () { return this._availableControls }

  /**
   * Checks whether the kit has an image
   * @return {Boolean}
   */
  hasImage () { return this._renderer.hasImage() }

  /**
   * Returns the resolved asset path for the given asset name
   * @param  {String} asset
   * @param  {Boolean} uiAsset = false
   * @return {String}
   */
  getAssetPath (asset, uiAsset = false) {
    const { baseUrl, resolver } = this._options.assets
    let path = `${baseUrl}/${asset}`

    if (uiAsset) {
      path = `${baseUrl}/ui/night-react/${asset}`
    }

    if (typeof resolver !== 'undefined' && resolver !== null) {
      path = resolver(path)
    }

    return path
  }
}

/**
 * A unique string that represents this UI
 * @type {String}
 */
NightReactUI.prototype.identifier = 'night-react'

// Export extendable stuff
NightReactUI.BaseComponent = BaseComponent
NightReactUI.ControlsComponent = ControlsComponent
NightReactUI.React = React
NightReactUI.ReactBEM = ReactBEM
NightReactUI.SharedState = SharedState
NightReactUI.Constants = Constants
NightReactUI.Utils = Utils
NightReactUI.ScrollbarComponent = ScrollbarComponent
NightReactUI.ModalManager = ModalManager

NightReactUI.Component = class extends React.Component {
  constructor (...args) {
    super(...args)

    this._renderer = new PhotoEditorSDK.Renderer('webgl', {
      image: this.props.image
    })

    this._ui = new NightReactUI(this._renderer, this.props)
  }

  /**
   * Renders this component
   * @return {React.Component}
   */
  render () {
    return this._ui.render()
  }
}

// Extend PhotoEditorSDK object
PhotoEditorSDK.UI = PhotoEditorSDK.UI || {}
PhotoEditorSDK.UI.NightReact = NightReactUI
