/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDK, React, ReactBEM, SDKUtils, EXIF } from '../globals'
import ImageResizer from '../lib/image-resizer'
import OverviewControlsComponent from './controls/overview/overview-controls-component'
import SplashScreenComponent from './screens/splash/splash-screen-component'
import WebcamScreenComponent from './screens/webcam/webcam-screen-component'
import EditorScreenComponent from './screens/editor/editor-screen-component'
import EmptyScreenComponent from './screens/screen-component'
import ModalContainerComponent from './modal-container-component'
import ModalManager from '../lib/modal-manager'

class EditorComponent extends React.Component {
  constructor (...args) {
    super(...args)

    this._screens = {
      splash: SplashScreenComponent,
      webcam: WebcamScreenComponent,
      editor: EditorScreenComponent,
      empty: EmptyScreenComponent
    }

    this._onModalManagerUpdate = this._onModalManagerUpdate.bind(this)

    this._initSDK()

    let initialScreen
    if (this._sdk.hasImage()) {
      initialScreen = this._screens.editor
    } else {
      initialScreen = this._screens.splash
    }

    this.state = { screen: initialScreen }

    this._initOperations()
    this._initControls()
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    const renderer = this._sdk
    if (renderer.hasImage()) {
      const image = renderer.getImage()
      renderer.setImage(null)
      this.setImage(image)
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Initializes the SDK
   * @private
   * @todo Move this to a separate Editor class
   */
  _initSDK () {
    const { image, preferredRenderer } = this.props.options
    const rendererOptions = {
      image
    }
    this._sdk = new SDK(preferredRenderer, rendererOptions)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the modal manager has triggered an update
   * @private
   */
  _onModalManagerUpdate () {
    this.forceUpdate()
  }

  /**
   * Switches to the webcam screen
   */
  switchToWebcamScreen () {
    this.setState({ screen: this._screens.webcam })
  }

  /**
   * Switches to the splash screen
   */
  switchToSplashScreen () {
    this.setState({ screen: this._screens.splash })
  }

  /**
   * Initializes the available and enabled controls
   * @private
   * @TODO Move this to a separate Editor class
   */
  _initOperations () {
    this._availableOperations = this._sdk.getOperations()
    this._enabledOperations = []

    const { options } = this.props

    let operationIdentifiers = options.operations
    if (!(operationIdentifiers instanceof Array)) {
      operationIdentifiers = operationIdentifiers
        .replace(/\s+?/ig, '')
        .split(',')
    }

    for (let identifier in this._availableOperations) {
      if (options.operations === 'all' ||
          operationIdentifiers.indexOf(identifier) !== -1) {
        this._enabledOperations.push(identifier)
      }
    }
  }

  /**
   * Initializes the available and enabled controls
   * @private
   * @todo Move this to a separate Editor class
   */
  _initControls () {
    this._overviewControls = OverviewControlsComponent
    // @TODO Use `options.extensions.controls` instead of `options.additionalControls`.
    //       Same goes for operations and languages.
    this._availableControls = SDKUtils.extend({
      filters: require('./controls/filters/'),
      orientation: require('./controls/orientation/'),
      adjustments: require('./controls/adjustments/'),
      crop: require('./controls/crop/'),
      focus: require('./controls/focus/'),
      frame: require('./controls/frame/'),
      stickers: require('./controls/stickers/'),
      text: require('./controls/text/')
    }, this.props.options.additionalControls)

    this._enabledControls = []
    for (let identifier in this._availableControls) {
      const controls = this._availableControls[identifier]
      if (!controls.isSelectable || controls.isSelectable(this)) {
        this._enabledControls.push(controls)
      }
    }

    this._enabledControls.sort((a, b) => {
      let sortA = this.props.options.controlsOrder.indexOf(a.identifier)
      let sortB = this.props.options.controlsOrder.indexOf(b.identifier)
      if (sortA === -1) return 1
      if (sortB === -1) return -1
      if (sortA < sortB) return -1
      if (sortA > sortB) return 1
      return 0
    })
  }

  /**
   * Checks whether an operation with the given identifier exists
   * @param {String} identifier
   * @return {Boolean}
   * @todo Move this to a separate Editor class
   */
  operationExists (identifier) {
    return !!this._operationsMap[identifier]
  }

  /**
   * Checks whether the operation with the given identifier is enabled
   * @param  {String}  name
   * @return {Boolean}
   * @todo Move this to a separate Editor class
   */
  isOperationEnabled (name) {
    return this._enabledOperations.indexOf(name) !== -1
  }

  /**
   * Returns the enabled controls
   * @return {Array.<Object>}
   * @todo Move this to a separate Editor class
   */
  getEnabledControls () {
    return this._enabledControls
  }

  /**
   * Gets called when an image is ready for editing
   * @param {Image} image
   * @todo Move this to a separate Editor class
   */
  setImage (image) {
    const translate = this.props.ui.translate.bind(this.props.ui)
    const exif = EXIF.isJPEG(image.src) ? EXIF.fromBase64String(image.src) : null

    const done = (image) => {
      this._operationsMap = {}
      this._sdk.getOperationsStack().clear()
      this._sdk.setImage(image, exif)

      // Forces reinitialization
      this.setState({ screen: null })
      this.setState({ screen: this._screens.editor })
    }

    const maxMegaPixels = this._getMaxMegapixels()
    const maxPixels = maxMegaPixels * 1000000
    const maxDimensions = this._sdk.getMaxDimensions()

    const megaPixelsExceeded = image.width * image.height > maxPixels
    const dimensionsExceeded = maxDimensions && (image.width > maxDimensions || image.height > maxDimensions)

    if (megaPixelsExceeded || dimensionsExceeded) {
      const loadingModal = ModalManager.instance.displayLoading(translate('loading.resizing'))
      const imageResizer = new ImageResizer(image, maxPixels, maxDimensions)

      imageResizer.resize()
        .then(({ canvas, dimensions }) => {
          loadingModal.close()

          if (megaPixelsExceeded) {
            ModalManager.instance.displayWarning(
              translate('warnings.imageResized_megaPixels.title'),
              translate('warnings.imageResized_megaPixels.text', {
                maxMegaPixels: maxMegaPixels,
                width: dimensions.x,
                height: dimensions.y
              })
            )
          } else if (dimensionsExceeded) {
            ModalManager.instance.displayWarning(
              translate('warnings.imageResized_maxDimensions.title'),
              translate('warnings.imageResized_maxDimensions.text', {
                width: dimensions.x,
                height: dimensions.y
              })
            )
          }
          done(canvas)
        })
    } else {
      done(image)
    }
  }

  /**
   * Returns the context passed to all children
   * @return {Object}
   */
  getChildContext () {
    return {
      editor: this,
      ui: this.props.ui,
      sdk: this._sdk,
      options: this.props.options,
      operationsStack: this._sdk.getOperationsStack(),
      mediator: this.props.mediator
    }
  }

  /**
   * Renders this component
   * @return {React.Component}
   */
  render () {
    const Screen = this.state.screen
    if (!Screen) { return ReactBEM.transform(<div />) }

    return ReactBEM.transform(<div bem='b:editor'>
      <ModalContainerComponent
        modalManager={ModalManager.instance}
        onUpdate={this._onModalManagerUpdate} />

      <Screen ref='screen' />
    </div>)
  }

  /**
   * Returns the maximum megapixels for the current device
   * @return {Number}
   * @private
   */
  _getMaxMegapixels () {
    const { maxMegaPixels } = this.props.options
    if (typeof maxMegaPixels === 'number') {
      return maxMegaPixels
    } else {
      const isMobile = SDKUtils.isMobile()
      return maxMegaPixels[isMobile ? 'mobile' : 'desktop']
    }
  }
}

EditorComponent.childContextTypes = {
  editor: React.PropTypes.object.isRequired,
  ui: React.PropTypes.object.isRequired,
  sdk: React.PropTypes.object.isRequired,
  operationsStack: React.PropTypes.object.isRequired,
  mediator: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

EditorComponent.propTypes = {
  ui: React.PropTypes.object.isRequired,
  mediator: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

export default EditorComponent
