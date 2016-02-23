/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial usf please contact us at contact@9elements.com
 */

import { Constants, Utils, SDK, ReactBEM } from '../../../globals'
import TextItemComponent from './items/text-item-component'
import StickerItemComponent from './items/sticker-item-component'
import CanvasControlsComponent from '../canvas-controls-component'
const { Sticker, Text } = SDK.Operations.SpriteOperation

export default class SpritesCanvasControlsComponent extends CanvasControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onCanvasClick',
      '_onSpriteDragStart',
      '_onSpriteDragStop',
      '_onOperationUpdated',
      '_onOperationRemoved'
    )

    this._canvasClickDisabled = false
    this._operation = this.getSharedState('operation')

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated,
      [Constants.EVENTS.OPERATION_REMOVED]: this._onOperationRemoved
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation has been removed
   * @param  {Operation} operation
   * @private
   */
  _onOperationRemoved (operation) {
    const selectedSprite = this.getSharedState('selectedSprite')
    if (operation !== this._operation || !selectedSprite) return

    // Operation can be removed by the undo button. We need
    // to make sure we re-create the operation for the lifetime
    // of this control
    const { editor } = this.context
    const newOperation = editor.getOrCreateOperation('sprite', {
      sprites: [selectedSprite],
      enabled: false
    })
    this._operation = newOperation
    this.setSharedState({
      operation: newOperation,
      operationExistedBefore: false,
      initialOptions: {}
    })
  }

  /**
   * Gets called when an operation has been updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    const selectedSprite = this.getSharedState('selectedSprite')
    if (operation !== this._operation || !selectedSprite) return

    // If the currently selected sprite is no longer existent,
    // re-add it
    const sprites = operation.getSprites()
    if (sprites.indexOf(selectedSprite) === -1) {
      sprites.push(selectedSprite)
    }

    this.forceUpdate()
  }

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onCanvasClick (e) {
    if (this._canvasClickDisabled) return

    const hitTest = this._performHitTest(Utils.getEventPosition(e))
    if (!hitTest) {
      this.props.onSwitchControls('home')
    }
  }

  /**
   * Gets called when the user removes a sprite
   * @param  {Sprite} sprite
   * @private
   */
  _onSpriteRemove (sprite) {
    this.props.onSwitchControls('back')
  }

  // -------------------------------------------------------------------------- DRAGGING

  /**
   * Gets called when a sprite has received a dragging event. Blocks the `_onCanvasClick`
   * handler until `_onSpriteDragStop`
   * @private
   */
  _onSpriteDragStart () {
    this._canvasClickDisabled = true
  }

  /**
   * Since `_onCanvasClick` is triggered right after the drag end event for knobs is triggered,
   * we need to wait a short amount of time until we re-enabale the canvas click
   * @private
   */
  _onSpriteDragStop () {
    setTimeout(() => {
      this._canvasClickDisabled = false
    }, 100)
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the container style
   * @return {Object}
   * @private
   */
  _getContainerStyle () {
    const { x, y, width, height } = this.context.editor.getSDK().getSprite().getBounds()
    return {
      left: x,
      top: y,
      width, height
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the sprite items
   * @return {Array.<SpriteItemComponent>}
   * @private
   */
  _renderSpriteItems () {
    const sprites = this._operation.getSprites()
    const selectedSprite = this.getSharedState('selectedSprite')

    return sprites
      .map((s) => {
        const isSelected = s === selectedSprite
        let ComponentClass = null
        if (s instanceof Text) {
          ComponentClass = TextItemComponent
        } else if (s instanceof Sticker) {
          ComponentClass = StickerItemComponent
        }

        return (<ComponentClass
          operation={this._operation}
          sprite={s}
          selected={isSelected}
          onDragStart={this._onSpriteDragStart}
          onDragStop={this._onSpriteDragStop}
          onRemove={this._onSpriteRemove.bind(this, s)} />)
      })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const spriteItems = this._renderSpriteItems()

    return (<div
      bem='b:canvasControls e:container'
      ref='root'
      style={this._getContainerStyle()}
      onClick={this._onCanvasClick}>
        <div
          bem='$b:spritesCanvasControls'
          ref='container'>
          {spriteItems}
        </div>
      </div>)
  }
}
