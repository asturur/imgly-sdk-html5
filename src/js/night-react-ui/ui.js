/* global PhotoEditorSDK */
/*!
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
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
   * @param  {Image} [options.image] - The image that the user can edit
   * @param  {DOMElement} [options.container] - The container that the UI should be rendered to
   * @param  {Boolean} [options.showNewButton] - Should the `new` button be displayed?
   * @param  {String} [options.preferredRenderer = 'webgl'] - `webgl` or `canvas`
   * @param  {String} [options.language = 'en'] - Currently `en` and `de` are supported
   * @param  {String} [options.title = 'PhotoEditor SDK'] - Only available for licensees
   * @param  {Boolen} [options.responsive = false] - Should the editor re-render on window resize?
   * @param  {Boolean} [options.webcam = true] - Enables webcam support. Disabled on mobile devices.
   * @param  {String[]} [options.tools] - The enabled tools. Available are: `crop`, `rotation`,
   *                                    `flip`, `filter`, `brightness`, `saturation`, `contrast`,
   *                                    `text`, `sticker`, `brush`, `radial-blur`, `tilt-shift`
   *                                    and `border`
   * @param  {(String[]|Array[])} [options.controlsOrder] - The order in which the controls are displayed.
   *                                           Available are `crop`, `orientation`, `filter`,
   *                                           `adjustments`, `text`, `sticker`, `brush`, `focus`,
   *                                           `border`. Can be grouped in arrays which will be
   *                                           displayed with separators.
   * @param  {String[]} [options.operationsOrder] - The order in which operations are added to
   *                                              the stack. Changing this may affect the
   *                                              performance.
   * @param  {Object} [options.controlsOptions] - Options that are passed to specific controls. See
   *                                            the documentation for each control to learn more
   *                                            about available values.
   * @param  {Object} [options.maxMegaPixels] - Maximum amount of megapixels per device type
   * @param  {Number} [options.maxMegaPixels.desktop = 10]
   * @param  {Number} [options.maxMegaPixels.mobile = 5]
   * @param  {Object} [options.assets]
   * @param  {String} [options.assets.baseUrl = '/assets'] - Path that is prepended to all asset paths
   * @param  {Function} [options.assets.resolver] - A function resolving a path to another path.
   * @param  {Object} [options.export]
   * @param  {Boolean} [options.export.showButton = true] - Should the `export` button be displayed?
   * @param  {String} [options.export.format = 'image/png'] - The export format. Available formats
   *                                         vary by browser.
   * @param  {PhotoEditorSDK.RenderType} [options.export.type] - The export type (image or data url)
   * @param  {Boolean} [options.export.download] - Should the result be presented as a download?
   * @param  {String} [options.logLevel] - `trace`, `info`, `warn`, `error` or `log`
   * @param  {Number} [options.pixelRatio = 1] - If none is given, PhotoEditorSDK automatically
   *   detects the current device's pixel ratio
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
        'crop', 'rotation', 'flip', 'filter', 'brightness', 'saturation', 'contrast', 'text', 'sticker', 'brush', 'radial-blur', 'tilt-shift', 'border'
      ],
      controlsOrder: [
        ['crop', 'orientation'],
        ['filter', 'adjustments'],
        ['text', 'sticker', 'brush'],
        ['focus', 'border']
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
        'border',
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
      baseUrl: '/assets',
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

/**
 * The PhotoEditorSDK UI can also be integrated as a React.js component
 * @class
 * @extends React.Component
 * @memberof PhotoEditorSDK.UI.NightReact
 */

class ReactComponent extends React.Component {
  constructor (...args) {
    super(...args)

    this._ui = new NightReactUI(this.props)
  }

  /**
   * Renders this component
   * @return {React.Element}
   */
  render () {
    return this._ui.render()
  }
}

NightReactUI.ReactComponent = ReactComponent

// Extend PhotoEditorSDK object
PhotoEditorSDK.UI = PhotoEditorSDK.UI || {}
PhotoEditorSDK.UI.NightReact = NightReactUI

export default NightReactUI
