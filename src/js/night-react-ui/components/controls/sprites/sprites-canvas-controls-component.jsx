/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial usf please contact us at contact@9elements.com
 */

import { Utils, Vector2, SDK, ReactBEM, BaseComponent } from '../../../globals'
import TextItemComponent from './items/text-item-component'
import StickerItemComponent from './items/sticker-item-component'
const { Sticker, Text } = SDK

export default class SpritesCanvasControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onCanvasClick',
      '_onSpriteDragStart',
      '_onSpriteDragStop'
    )

    this._canvasClickDisabled = false
    this._operation = this.getSharedState('operation')
  }

  // -------------------------------------------------------------------------- HITTEST

  /**
   * Checks if any other control reacts to a click at the given position
   * @param  {Vector2} clickPosition
   * @private
   * @todo Move this to a BaseCanvasControlsComponent class
   */
  _performHitTest (clickPosition) {
    const { container } = this.refs
    const containerRect = container.getBoundingClientRect()
    const containerPosition = new Vector2(
      containerRect.left,
      containerRect.top
    )

    const position = clickPosition
      .subtract(containerPosition)

    const { editor } = this.context
    const controls = editor.getAvailableControls()

    // Check if any of the controls responds to a click
    // at the given position
    for (let identifier in controls) {
      const control = controls[identifier]
      const clickResponse = control.clickAtPosition &&
        control.clickAtPosition(position, editor)

      if (clickResponse) {
        // Don't re-select an already selected item
        if (clickResponse.selectedSprite === this.getSharedState('selectedSprite')) {
          return true
        }

        // Responds to click, switch to the controls
        this.props.onSwitchControls(control, clickResponse)
        return true
      }
    }

    return false
  }

  // -------------------------------------------------------------------------- EVENTS

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
