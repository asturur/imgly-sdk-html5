/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { SDK, SDKUtils } from '../../../globals'
const { Sticker } = SDK.Operations.SpriteOperation
import Controls from '../controls'
import StickerControlsComponent from './sticker-controls-component'
import SpritesCanvasControlsComponent from '../sprites/sprites-canvas-controls-component'

/**
 * The sticker controls
 * @class
 * @extends PhotoEditorSDK.UI.NightReact.Control
 * @memberof PhotoEditorSDK.UI.NightReact.Controls
 */
class StickerControls extends Controls {
  /**
   * Gets called when the user leaves these controls
   * @this {StickerControlsComponent}
   * @override
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
   * @override
   * @ignore
   */
  static clickAtPosition (position, editor) {
    if (!editor.operationExists('sprite')) return false

    const sdk = editor.getSDK()
    const operation = editor.getOrCreateOperation('sprite')
    const sprite = operation.getSpriteAtPosition(sdk, position)
    if (sprite && sprite instanceof Sticker) {
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
   * @override
   * @ignore
   */
  static getInitialSharedState (editor, additionalState = {}) {
    const operationExistedBefore = editor.operationExists('sprite')
    const operation = editor.getOrCreateOperation('sprite')
    const sprites = operation.getSprites()
    const stickers = operation.getSpritesOfType(Sticker)
    const initialOptions = operation.serializeOptions()

    operation.setEnabled(false)

    const state = {
      operationExistedBefore, operation, sprites, stickers, initialOptions
    }

    return SDKUtils.extend({}, state, additionalState)
  }

  /**
   * Checks if this control is available to the user
   * @param  {PhotoEditorSDK.UI.NightReact.Editor} editor
   * @return {Boolean}
   * @override
   * @ignore
   */
  static isAvailable (editor) {
    return editor.isToolEnabled('sticker')
  }
}

/**
 * This control's controls component. Used for the lower controls part of the editor.
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
StickerControls.controlsComponent = StickerControlsComponent

/**
 * This control's canvas component. Used for the upper controls part of the editor (on
 * top of the canvas)
 * @type {PhotoEditorSDK.UI.NightReact.ControlsComponent}
 * @ignore
 */
StickerControls.canvasControlsComponent = SpritesCanvasControlsComponent

/**
 * This control's identifier
 * @type {String}
 * @default
 */
StickerControls.identifier = 'sticker'

/**
 * This control's icon path
 * @type {String}
 * @ignore
 */
StickerControls.iconPath = 'controls/overview/sticker@2x.png'

/**
 * The language key that should be used when displaying this filter
 * @type {String}
 * @ignore
 */
StickerControls.languageKey = 'controls.overview.sticker'

/**
 * The default options for this control
 * @type {Object}
 * @property {Object[]} [additionalStickers = []]
 * @property {Boolean} [replaceStickers = false]
 * @property {String[]} [availableStickers = null]
 * @property {Boolean} [tooltips = false]
 */
StickerControls.defaultOptions = {
  additionalStickers: [],
  replaceStickers: false,
  availableStickers: null,
  tooltips: false
}

export default StickerControls
