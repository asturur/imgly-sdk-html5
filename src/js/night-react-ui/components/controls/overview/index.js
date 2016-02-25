/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Controls from '../controls'
import OverviewControlsComponent from './overview-controls-component'
import OverviewCanvasControlsComponent from './overview-canvas-controls-component'

class OverviewControls extends Controls {

}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
OverviewControls.controlsComponent = OverviewControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 */
OverviewControls.canvasControlsComponent = OverviewCanvasControlsComponent

export default OverviewControls
