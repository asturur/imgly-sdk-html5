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

import AppComponent from './components/app-component'
import ScrollbarComponent from './components/scrollbar-component'
import ControlsComponent from './components/controls/controls-component'
import ModalManager from './lib/modal-manager'

/**
 * The React UI
 * @class
 * @alias NightReact
 * @extends PhotoEditorSDK.EventEmitter
 * @memberof PhotoEditorSDK.UI
 */
class NightReactUI extends EventEmitter {
  /**
   * Creates an UI instance
   * @param  {Object} [options = {}]
   */
  constructor (options = {}) {
    super()

    this._mediator = new EventEmitter()
    this._options = options
    this._initOptions()
    this._initLanguage()

    this.run()
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
   * Renders the UI
   * @private
   */
  _render () {
    const component = (<AppComponent
      ui={this}
      mediator={this._mediator}
      options={this._options} />)

    if (this._options.renderReturnsComponent) {
      return component
    } else {
      ReactDOM.render(component, this._options.container)
    }
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
      title: 'PhotoEditor SDK',
      maxMegaPixels: {},
      responsive: false,
      webcam: true,
      assets: {},
      tools: [
        'crop', 'rotation', 'flip', 'filter', 'brightness', 'saturation', 'contrast', 'text', 'sticker', 'brush', 'radial-blur', 'tilt-shift', 'frame'
      ],
      controlsOrder: [
        ['crop', 'orientation'],
        ['filter', 'adjustments'],
        ['text', 'sticker', 'brush'],
        ['focus', 'frame']
      ],
      operationsOrder: [
        // First, all operations that affect the image dimensions
        'orientation',
        'crop',

        // Then color operations (first filter, then fine-tuning)
        'filter',
        'adjustments',

        // Then post-processing
        'radial-blur',
        'tilt-shift',
        'frame',
        'sprite',
        'brush',
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

    this._webFontsStyle = document.createElement('style')
    this._webFontsStyle.innerHTML = css

    const head = document.getElementsByTagName('head')[0]
    head.appendChild(this._webFontsStyle)
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

  /**
   * Disposes the UI
   */
  dispose () {
    // Remove web fonts style
    this._webFontsStyle.parentNode.removeChild(this._webFontsStyle)

    // Unmount AppComponent
    ReactDOM.unmountComponentAtNode(this._options.container)
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

    this._ui = new NightReactUI(this.props)
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

export default NightReactUI
