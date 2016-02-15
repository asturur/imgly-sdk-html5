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

import { React, ReactBEM } from '../globals'
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

    let initialScreen
    if (this.props.options.image) {
      initialScreen = this._screens.editor
    } else {
      initialScreen = this._screens.splash
    }

    this.state = { screen: initialScreen }
  }

  // -------------------------------------------------------------------------- EVENTS

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
    const { options } = this.props
    options.image = image
    this.setState({ screen: this._screens.editor })
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
        modalManager={ModalManager.instance} />

      <Screen ref='screen' app={this} />
    </div>)
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
