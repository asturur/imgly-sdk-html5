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

import { Constants, ReactBEM, BaseComponent } from '../../../globals'

export default class ZoomComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onZoomOutClick',
      '_onZoomInClick',
      '_onZoomDone'
    )

    this._events = {
      [Constants.EVENTS.ZOOM_DONE]: this._onZoomDone
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when a zoom level has been applied / when the zoom has been done
   * @private
   */
  _onZoomDone () {
    this.forceUpdate()
  }

  /**
   * Gets called when the user clicks the "zoom out" button
   * @param {Event} e
   * @private
   */
  _onZoomOutClick (e) {
    if (!this.props.enabled) return
    this.props.onZoomOut && this.props.onZoomOut()
  }

  /**
   * Gets called when the user clicks the "zoom in" button
   * @param {Event} e
   * @private
   */
  _onZoomInClick (e) {
    if (!this.props.enabled) return
    this.props.onZoomIn && this.props.onZoomIn()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { enabled } = this.props
    const zoom = this.context.editor.getZoom()

    return (
      <div bem='$b:editorScreen $e:zoom'>

        <div bem='$e:button m:zoomOut'
          onClick={this._onZoomOutClick}
          className={enabled ? null : 'is-disabled'}>
            <img bem='e:image' src={this._getAssetPath('controls/minus@2x.png', true)} />
        </div>

        <div bem='e:label'>
          Zoom<br />
        {Math.round(zoom * 100)}%
        </div>

        <div
          bem='$e:button m:zoomIn'
          onClick={this._onZoomInClick}
          className={enabled ? null : 'is-disabled'}>
            <img bem='e:image' src={this._getAssetPath('controls/plus@2x.png', true)} />
        </div>

      </div>
    )
  }
}
