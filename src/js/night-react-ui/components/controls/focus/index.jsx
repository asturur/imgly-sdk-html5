/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import FocusControlsComponent from './focus-controls-component'

export default {
  canvasControls: null,
  controls: FocusControlsComponent,
  identifier: 'focus',
  icon: 'controls/overview/focus@2x.png',
  label: 'controls.overview.focus',

  /**
   * Checks if this control is available to the user
   * @param  {Editor} editor
   * @return {Boolean}
   */
  isAvailable: (editor) => {
    return editor.isToolEnabled('radial-blur') ||
      editor.isToolEnabled('tilt-shift')
  }
}
