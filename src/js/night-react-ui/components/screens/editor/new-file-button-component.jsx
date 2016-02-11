/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { ReactBEM, Utils, BaseComponent } from '../../../globals'
import FileLoader from '../../../lib/file-loader'
import SubHeaderButtonComponent from '../../sub-header-button-component'

export default class EditorSubHeaderComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onNewFile',
      '_onButtonClick'
    )
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    this._fileLoader = new FileLoader(this.refs.fileInput)
    this._fileLoader.on('file', this._onNewFile)
  }

  /**
   * Gets called when this component is about to be unmounted
   */
  componentWillUnmount () {
    this._fileLoader.off('file', this._onNewFile)
    this._fileLoader.dispose()
    this._fileLoader = null
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user has selected a new file
   * @param {Image} image
   */
  _onNewFile (image) {
    const { editor } = this.context
    editor.setImage(image)
    editor.setZoom('auto')
  }

  /**
   * Gets called when the button has been clicked
   * @private
   */
  _onButtonClick () {
    const { options } = this.context
    if (options.webcam !== false && !Utils.isMobile()) {
      this.props.app.switchToSplashScreen()
    } else {
      this._fileLoader.open()
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { options } = this.context
    if (!options.showNewButton) return

    return (<div>
      <input type='file' bem='b:hiddenFileInput' ref='fileInput' />
      <SubHeaderButtonComponent
        label={this._t('editor.new')}
        icon='editor/new@2x.png'
        onClick={this._onButtonClick} />
    </div>)
  }
}
