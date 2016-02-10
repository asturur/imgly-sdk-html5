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
import { ReactBEM, Utils } from '../../../globals'
import HeaderComponent from '../../header-component'
import ScreenComponent from '../screen-component'
import SplashScreenUploadComponent from './upload-component'
import SplashScreenWebcamComponent from './webcam-component'

export default class SplashScreenComponent extends ScreenComponent {
  constructor () {
    super()

    this._bindAll('_onWebcamClick', '_onImage')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the WebcamComponent has received a click
   * @private
   */
  _onWebcamClick () {
    this.props.app.switchToWebcamScreen()
  }

  /**
   * Gets called when the UploadComponent has received an image file
   * @param  {image} image
   * @private
   */
  _onImage (image) {
    this.props.app.setImage(image)
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Checks if the webcam is available for the given device
   * @private
   */
  _isWebcamAvailable () {
    return !Utils.isMobile() && this.context.options.webcam !== false
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const webcamAvailable = this._isWebcamAvailable()
    let webcamComponent
    if (webcamAvailable) {
      webcamComponent = <SplashScreenWebcamComponent
        halfHeight
        onClick={this._onWebcamClick} />
    }

    return (<div bem='b:screen'>
      <HeaderComponent />
      {webcamComponent}
      <SplashScreenUploadComponent
        halfHeight={webcamAvailable}
        onImage={this._onImage} />
    </div>)
  }
}
