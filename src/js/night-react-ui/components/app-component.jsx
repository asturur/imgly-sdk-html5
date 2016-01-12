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

import { React, ReactBEM, SDKUtils, EXIF } from '../globals'
import ImageResizer from '../lib/image-resizer'
import SplashScreenComponent from './screens/splash/splash-screen-component'
import WebcamScreenComponent from './screens/webcam/webcam-screen-component'
import EditorScreenComponent from './screens/editor/editor-screen-component'
import EmptyScreenComponent from './screens/screen-component'
import ModalContainerComponent from './modal-container-component'
import ModalManager from '../lib/modal-manager'

export default class AppComponent extends React.Component {
  constructor (...args) {
    super(...args)

    this._screens = {
      splash: SplashScreenComponent,
      webcam: WebcamScreenComponent,
      editor: EditorScreenComponent,
      empty: EmptyScreenComponent
    }

    this._onModalManagerUpdate = this._onModalManagerUpdate.bind(this)

    let initialScreen
    if (this.props.options.image) {
      initialScreen = this._screens.editor
    } else {
      initialScreen = this._screens.splash
    }

    this.state = { screen: initialScreen }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    // @TODO Deprecated code - move this to editor
    // const renderer = this._sdk
    // if (renderer.hasImage()) {
    //   const image = renderer.getImage()
    //   renderer.setImage(null)
    //   this.setImage(image)
    // }
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
      ui: this.props.ui,
      options: this.props.options,
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
   * @todo  This belongs to the Editor class
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

AppComponent.childContextTypes = {
  ui: React.PropTypes.object.isRequired,
  mediator: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

AppComponent.propTypes = {
  ui: React.PropTypes.object.isRequired,
  mediator: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}
