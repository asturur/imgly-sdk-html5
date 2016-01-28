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

import { SDK, ReactBEM, BaseComponent } from '../../../globals'
import TextItemComponent from './items/text-item-component'
const { Sticker, Text } = SDK

export default class SpritesCanvasControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onCanvasClick'
    )

    this._operation = this.getSharedState('operation')
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onCanvasClick (e) {
    if (e.target !== this.refs.container) return
    if (!this.getSharedState('selectedSprite')) return

    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the user removes a sprite
   * @param  {Sprite} sprite
   * @private
   */
  _onSpriteRemove (sprite) {
    this.props.onSwitchControls('back')
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
      .filter((s) => s.getVisible())
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
