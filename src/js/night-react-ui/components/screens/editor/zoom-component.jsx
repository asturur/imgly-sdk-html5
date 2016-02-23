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

import { Constants, ReactBEM, BaseComponent } from '../../../globals'

export default class ZoomComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onZoomOutClick',
      '_onZoomInClick',
      '_onZoomDone',
      '_onFeaturesUpdated'
    )

    this._events = {
      [Constants.EVENTS.ZOOM_DONE]: this._onZoomDone,
      [Constants.EVENTS.FEATURES_UPDATED]: this._onFeaturesUpdated
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the features have been updated
   * @private
   */
  _onFeaturesUpdated () {
    this.forceUpdate()
  }

  /**
   * Gets called when the new zoom level has been applied
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
    const { editor } = this.context
    if (!editor.isFeatureEnabled('zoom')) return

    editor.zoomOut()
  }

  /**
   * Gets called when the user clicks the "zoom in" button
   * @param {Event} e
   * @private
   */
  _onZoomInClick (e) {
    const { editor } = this.context
    if (!editor.isFeatureEnabled('zoom')) return

    editor.zoomIn()
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const { editor } = this.context
    const zoom = editor.getZoom()
    const enabled = editor.isFeatureEnabled('zoom')

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
