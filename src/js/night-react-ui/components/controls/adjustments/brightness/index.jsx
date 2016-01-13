/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import BrightnessControlsComponent from './brightness-controls-component'

export default {
  canvasControls: null,
  controls: BrightnessControlsComponent,
  identifier: 'brightness',
  icon: 'controls/adjustments/brightness@2x.png',
  label: 'controls.adjustments.brightness',
  getInitialSharedState: (editor) => {
    const operationExistedBefore = editor.operationExists('brightness')
    const operation = editor.getOrCreateOperation('brightness')
    const initialOptions = {
      brightness: operation.getBrightness()
    }
    return {
      operationExistedBefore,
      operation,
      initialOptions
    }
  },
  isSelectable: (editor) => {
    return editor.isOperationEnabled('brightness')
  }
}
