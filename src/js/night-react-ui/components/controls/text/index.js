/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDK, Vector2, SDKUtils } from '../../../globals'
const { Text } = SDK.Operations.SpriteOperation
import Controls from '../controls'
import SpritesCanvasControlsComponent from '../sprites/sprites-canvas-controls-component'
import TextControlsComponent from './text-controls-component'

/**
 * The text controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class TextControls extends Controls {
  /**
   * Gets called when the user leaves these controls
   * @this {StickersControlsComponent}
   * @ignore
   */
  static onExit () {
    const { editor } = this.context
    const operation = this.getSharedState('operation')

    editor.addHistory(
      operation,
      this.getSharedState('initialOptions'),
      this.getSharedState('operationExistedBefore')
    )

    operation.setEnabled(true)

    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')
    editor.render()
  }

  /**
   * Checks if there is something at the given position that
   * would cause the UI to switch to this control on click
   * @param  {PhotoEditorSDK.Math.Vector2} position
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @return {*}
   * @ignore
   */
  static clickAtPosition (position, editor) {
    if (!editor.operationExists('sprite')) return false

    const sdk = editor.getSDK()
    const operation = editor.getOrCreateOperation('sprite')
    const sprite = operation.getSpriteAtPosition(sdk, position)
    if (sprite && sprite instanceof Text) {
      return { selectedSprite: sprite }
    } else {
      return false
    }
  }

  /**
   * Returns the initial shared state for this control
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @param  {Object} additionalState = {}
   * @return {Object}
   * @ignore
   */
  static getInitialSharedState (editor, additionalState = {}) {
    const operationExistedBefore = editor.operationExists('sprite')
    const operation = editor.getOrCreateOperation('sprite')
    const sprites = operation.getSprites()
    const initialOptions = operation.serializeOptions()
    let selectedSprite = null

    if (!additionalState.selectedSprite) {
      const sdk = editor.getSDK()
      const renderer = sdk.getRenderer()

      const finalDimensions = sdk.getFinalDimensions()
      const text = operation.createText({
        text: 'Double-click to edit',
        position: finalDimensions.clone().divide(2),
        maxWidth: finalDimensions.x / 2,
        maxHeight: renderer.getMaxTextureSize() || (sdk.getFinalDimensions().y * 3),
        fontSize: Math.round(finalDimensions.y * 0.08),
        fontFamily: 'Impact',
        alignment: 'center',
        anchor: new Vector2(0, 0),
        pivot: new Vector2(0.5, 0)
      })
      operation.addSprite(text)
      selectedSprite = text
    }

    operation.setEnabled(false)

    editor.render()

    const state = {
      operationExistedBefore, operation, sprites, initialOptions, selectedSprite
    }

    return SDKUtils.extend({}, state, additionalState)
  }

  /**
   * Checks if this control is available to the user
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @return {Boolean}
   * @ignore
   */
  static isAvailable (editor) {
    return editor.isToolEnabled('text')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
TextControls.controlsComponent = TextControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
TextControls.canvasControlsComponent = SpritesCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
TextControls.identifier = 'text'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
TextControls.iconPath = 'controls/overview/text@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
TextControls.languageKey = 'controls.overview.text'

/**
 * The default options for this control
 * @type {Object}
 * @property {Object[]} [additionalFonts = []]
 * @property {Boolean} [replaceFonts = false]
 * @property {String[]} [availableFonts = null]
 */
TextControls.defaultOptions = {
  additionalFonts: [],
  replaceFonts: false,
  availableFonts: null
}

export default TextControls
