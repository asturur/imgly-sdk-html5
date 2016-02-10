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
import SubHeaderComponent from '../../sub-header-component'
import SubHeaderButtonComponent from '../../sub-header-button-component'
import ZoomComponent from './zoom-component'

export default class EditorSubHeaderComponent extends SubHeaderComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onZoomIn',
      '_onZoomOut'
    )

    this.state = {
      zoomEnabled: true
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicked the zoom in button
   * @private
   */
  _onZoomIn () {
    const { editor } = this.context
    editor.zoomIn()
  }

  /**
   * Gets called when the user clicked the zoom out button
   * @private
   */
  _onZoomOut () {
    const { editor } = this.context
    editor.zoomOut()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the new button (if available)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderNewButton () {
    const { options } = this.context
    if (!options.showNewButton) return

    return (<SubHeaderButtonComponent
      label={this._t('editor.new')}
      icon='editor/new@2x.png'
      onClick={this._onNewClick} />)
  }

  /**
   * Renders the undo button (if available)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderUndoButton () {
    const { editor } = this.context
    if (!editor.historyAvailable()) return

    return (<SubHeaderButtonComponent
      label={this._t('editor.undo')}
      icon='editor/undo@2x.png'
      onClick={this._onUndoClick} />)
  }

  /**
   * Renders the export button (if available)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderExportButton () {
    const { options } = this.context
    if (!options.export.showButton) return

    return (<SubHeaderButtonComponent
      style='blue'
      label={options.export.label || this._t('editor.export')}
      icon='editor/export@2x.png'
      onClick={this._onExportClick} />)
  }

  /**
   * Renders the zoom component
   * @return {ZoomComponent}
   */
  _renderZoomComponent () {
    return (<ZoomComponent
      onZoomIn={this._onZoomIn}
      onZoomOut={this._onZoomOut}
      enabled={this.state.zoomEnabled} />)
  }

  /**
   * Renders the content of this SubHeaderComponent
   * @return {ReactBEM.Element}
   */
  renderContent () {
    return (<bem specifier='$b:subHeader'>
      <input type='file' bem='b:hiddenFileInput' ref='fileInput' />
      <div bem='e:left'>
        {this._renderNewButton()}
      </div>

      <div bem='e:right'>
        {this._renderUndoButton()}
        {this._renderExportButton()}
      </div>

      {this._renderZoomComponent()}
    </bem>)
  }
}
