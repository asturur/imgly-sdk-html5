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
import { ReactBEM } from '../../../globals'
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

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    let webcamComponent
    if (this.context.options.webcam !== false) {
      webcamComponent = <SplashScreenWebcamComponent
        halfHeight
        onClick={this._onWebcamClick} />
    }

    return (<div bem='b:screen'>
      <HeaderComponent />
      {webcamComponent}
      <SplashScreenUploadComponent
        halfHeight={this.context.options.webcam !== false}
        onImage={this._onImage} />
    </div>)
  }
}
