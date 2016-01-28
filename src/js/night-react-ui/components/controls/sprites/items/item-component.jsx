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

import { ReactBEM, BaseComponent } from '../../../../globals'

export default class ItemComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRemoveClick',
      '_onItemDragStart',
      '_onItemDrag'
    )
  }

  // -------------------------------------------------------------------------- CALCULATIONS

  /**
   * Returns the absolute position of the sprite
   * @return {Vector2}
   * @private
   */
  _getAbsoluteSpritePosition () {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    return this.props.sprite.getPosition()
      .clone()
      .multiply(outputDimensions)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user starts dragging this item
   * @private
   */
  _onItemDragStart () {
    const { sprite } = this.props
    this._initialPosition = sprite.getPosition()
  }

  /**
   * Gets called while the user drags this item
   * @param  {Vector2} offset
   * @private
   */
  _onItemDrag (offset) {
    const { sprite } = this.props
    const { editor } = this.context

    const outputDimensions = editor.getOutputDimensions()
    const newPosition = this._initialPosition.clone()
      .add(offset.clone().divide(outputDimensions))

    sprite.setPosition(newPosition)
    this.forceUpdate()
  }

  /**
   * Gets called when the user clicks the remove button
   * @private
   */
  _onRemoveClick () {
    const { operation, sprite, onRemove } = this.props
    operation.removeSprite(sprite)

    onRemove && onRemove()
  }
}
