/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { BaseComponent } from '../../../../globals'

export default class ItemComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRemoveClick',
      '_onItemDragStart',
      '_onItemDragStop',
      '_onItemDrag',
      '_onSpriteUpdate'
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

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
    this.props.sprite.on('update', this._onSpriteUpdate)
  }

  /**
   * Gets called when this component is about to be unmounted
   */
  componentWillUnmount () {
    super.componentWillUnmount()
    this.props.sprite.off('update', this._onSpriteUpdate)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when this component's sprite has been updated
   * @private
   */
  _onSpriteUpdate () {
    this.forceUpdate()
  }

  /**
   * Gets called when the user starts dragging this item
   * @private
   */
  _onItemDragStart () {
    const { sprite } = this.props
    this._initialPosition = sprite.getPosition()

    this.props.onDragStart && this.props.onDragStart()
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
  }

  /**
   * Gets called when the user stops dragging this item
   * @private
   */
  _onItemDragStop () {
    this.props.onDragStop && this.props.onDragStop()
  }

  /**
   * Gets called when the user clicks the remove button
   * @private
   */
  _onRemoveClick (e) {
    e.stopPropagation()

    const { operation, sprite, onRemove } = this.props
    operation.removeSprite(sprite)

    onRemove && onRemove()
  }
}
