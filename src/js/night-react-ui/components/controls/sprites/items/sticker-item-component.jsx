/** @jsx ReactBEM.createElement **/
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, SDKUtils, ReactBEM } from '../../../../globals'
import DraggableComponent from '../../../draggable-component'
import ItemComponent from './item-component'

export default class StickerItemComponent extends ItemComponent {
  constructor (...args) {
    super(...args)

    this._id = SDKUtils.getUUID()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user starts dragging a knob
   * @param  {String} side
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onKnobDragStart (side, position, e) {
    const { sprite } = this.props
    switch (side) {
      case 'bottom':
        this._initialPosition = this._getBottomDragKnobPosition()
        break
      case 'top':
        this._initialPosition = this._getTopDragKnobPosition()
        break
    }

    this._initialScale = sprite.getScale().clone()

    this.props.onDragStart && this.props.onDragStart()
  }

  /**
   * Gets called while the user drags a sticker
   * @param  {String} side
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onKnobDrag (side, offset, e) {
    const { sprite } = this.props
    const stickerPosition = this._getAbsoluteSpritePosition()
    const newKnobPosition = this._initialPosition
      .clone()
      .add(offset)

    const halfDimensions = this._getStickerDimensions()
      .divide(2)

    // Calculate new rotation and scale from new knob position
    const knobDistanceFromCenter = newKnobPosition
      .clone()
      .subtract(stickerPosition)

    const initialDistanceFromCenter = this._initialPosition
      .clone()
      .subtract(stickerPosition)

    let radians

    switch (side) {
      case 'bottom':
        radians = Math.atan2(
          knobDistanceFromCenter.y,
          knobDistanceFromCenter.x
        ) - Math.atan2(halfDimensions.y, halfDimensions.x)
        break
      case 'top':
        radians = Math.atan2(
          knobDistanceFromCenter.y,
          knobDistanceFromCenter.x
        ) + Math.atan2(halfDimensions.y, halfDimensions.x)
        break
    }

    const newScale = this._initialScale
      .clone()
      .multiply(
        knobDistanceFromCenter.len() / initialDistanceFromCenter.len()
      )

    sprite.set({
      scale: newScale,
      rotation: radians
    })
  }

  /**
   * Gets called when the user stops dragging a knob
   * @private
   */
  _onKnobDragStop () {
    this.props.onDragStop && this.props.onDragStop()
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the style object for the remove knob
   * @return {Object}
   * @private
   */
  _getRemoveKnobStyle () {
    const { sprite } = this.props
    const stickerPosition = this._getAbsoluteSpritePosition()
    const stickerRotation = sprite.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions(sprite)
      .divide(2)

    // Calculate knob position
    const knobPosition = stickerPosition.clone()
      .subtract(
        halfDimensions.x * cos - halfDimensions.y * sin,
        halfDimensions.x * sin + halfDimensions.y * cos
      )

    return {
      left: knobPosition.x,
      top: knobPosition.y
    }
  }

  /**
   * Returns the style object for the bottom right drag knob
   * @return {Object}
   * @private
   */
  _getBottomDragKnobStyle () {
    const knobPosition = this._getBottomDragKnobPosition()

    return {
      left: knobPosition.x,
      top: knobPosition.y
    }
  }

  /**
   * Returns the style object for the top right drag knob
   * @return {Object}
   * @private
   */
  _getTopDragKnobStyle () {
    const knobPosition = this._getTopDragKnobPosition()

    return {
      left: knobPosition.x,
      top: knobPosition.y
    }
  }

  /**
   * Builds the style object for this sticker
   * @return {Object}
   * @private
   */
  _getStickerStyle () {
    const { sprite } = this.props

    const stickerDimensions = this._getStickerDimensions()
    const spritePosition = this._getAbsoluteSpritePosition()
      .subtract(stickerDimensions.clone().divide(2))

    const degrees = sprite.getRotation() * 180 / Math.PI
    let transform = `rotate(${degrees.toFixed(2)}deg)`

    if (sprite.getFlipVertically()) {
      transform += ` rotateX(180deg)`
    }

    if (sprite.getFlipHorizontally()) {
      transform += ` rotateY(180deg)`
    }

    return {
      top: spritePosition.y,
      left: spritePosition.x,
      width: stickerDimensions.x,
      height: stickerDimensions.y,
      WebkitTransform: transform,
      msTransform: transform,
      MozTransform: transform,
      OTransform: transform
    }
  }

  // -------------------------------------------------------------------------- CALCULATIONS

  /**
   * Calculates the sticker dimensions
   * @param  {Object} sticker
   * @return {Vector2}
   * @private
   */
  _getStickerDimensions () {
    const { sprite } = this.props
    const { editor } = this.context
    const image = sprite.getImage()

    return new Vector2(image.width, image.height)
      .multiply(sprite.getScale())
      .multiply(editor.getZoom())
      .abs()
  }

  /**
   * Calculates the drag bottom right knob's position
   * @return {Vector2}
   * @private
   */
  _getBottomDragKnobPosition () {
    const { sprite } = this.props
    const stickerPosition = this._getAbsoluteSpritePosition()
    const stickerRotation = sprite.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions()
      .divide(2)

    // Calculate knob position
    return stickerPosition.clone()
      .add(
        halfDimensions.x * cos - halfDimensions.y * sin,
        halfDimensions.x * sin + halfDimensions.y * cos
      )
  }

  /**
   * Calculates the drag top right knob's position
   * @return {Vector2}
   * @private
   */
  _getTopDragKnobPosition () {
    const { sprite } = this.props
    const stickerPosition = this._getAbsoluteSpritePosition()
    const stickerRotation = sprite.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions()
      .divide(2)

    // Calculate knob position
    return stickerPosition.clone()
      .add(
        halfDimensions.x * cos + halfDimensions.y * sin,
        halfDimensions.x * sin - halfDimensions.y * cos
      )
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the knobs for this item
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderKnobs () {
    let knobs = []
    if (this.props.selected) {
      knobs = [
        (<DraggableComponent
          onStart={this._onKnobDragStart.bind(this, 'bottom')}
          onStop={this._onKnobDragStop.bind(this, 'bottom')}
          onDrag={this._onKnobDrag.bind(this, 'bottom')}>
          <div bem='e:knob $b:knob' style={this._getBottomDragKnobStyle()}>
            <img bem='e:icon' src={this._getAssetPath('controls/knobs/resize-diagonal-down@2x.png', true)} />
          </div>
        </DraggableComponent>),
        (<DraggableComponent
          onStart={this._onKnobDragStart.bind(this, 'top')}
          onStop={this._onKnobDragStop.bind(this, 'top')}
          onDrag={this._onKnobDrag.bind(this, 'top')}>
          <div bem='e:knob $b:knob' style={this._getTopDragKnobStyle()}>
            <img bem='e:icon' src={this._getAssetPath('controls/knobs/resize-diagonal-up@2x.png', true)} />
          </div>
        </DraggableComponent>),
        (<div bem='e:knob $b:knob' style={this._getRemoveKnobStyle()} onClick={this._onRemoveClick}>
          <img bem='e:icon' src={this._getAssetPath('controls/knobs/remove@2x.png', true)} />
        </div>)
      ]
    }
    return knobs
  }

  /**
   * Renders the SVG filters
   * @return {[type]} [description]
   */
  _renderSVGFilter () {
    const { sprite } = this.props
    const adjustments = sprite.getAdjustments()
    const brightness = adjustments.getBrightness()
    const saturation = adjustments.getSaturation()
    const contrast = adjustments.getContrast()

    const filtersSVG = (
      `<filter id='pesdk-sticker-${this._id}-filter'>
        <feComponentTransfer>
          <feFuncR type='linear' intercept='${brightness}' />
          <feFuncG type='linear' intercept='${brightness}' />
          <feFuncB type='linear' intercept='${brightness}' />
        </feComponentTransfer>
        <feColorMatrix type='saturate' values='${saturation}' />
        <feComponentTransfer>
          <feFuncR type='linear' slope='${contrast}' intercept='${-(0.5 * contrast) + 0.5}' />
          <feFuncG type='linear' slope='${contrast}' intercept='${-(0.5 * contrast) + 0.5}' />
          <feFuncB type='linear' slope='${contrast}' intercept='${-(0.5 * contrast) + 0.5}' />
        </feComponentTransfer>
      </filter>`
    )

    // We added `key: Math.random()` because in Safari, dangerouslySetInnerHTML
    // would not update without that...
    // https://github.com/facebook/react/issues/2863
    return (<svg width='0' height='0' color-interpolation-filters='sRGB' is='svg'>
      {ReactBEM.createElement('defs', { key: Math.random(), dangerouslySetInnerHTML: {
        __html: filtersSVG
      }})}
    </svg>)
  }

  /**
   * Renders the draggable item
   * @return {ReactBEM.Element}
   * @private
   */
  _renderItem () {
    const { sprite } = this.props
    const stickerStyle = this._getStickerStyle()
    const className = this.props.selected ? 'is-selected' : null
    const stickerImageStyle = { filter: `url("#pesdk-sticker-${this._id}-filter")` }

    return (<DraggableComponent
      onStart={this._onItemDragStart}
      onStop={this._onItemDragStop}
      onDrag={this._onItemDrag}
      disabled={!this.props.selected}>
      <div
        bem='$e:sticker'
        style={stickerStyle}
        className={className}>
          <svg width={stickerStyle.width} height={stickerStyle.height} color-interpolation-filters='sRGB' is='svg'>
            {ReactBEM.createElement('image', {
              xlinkHref: sprite.getImage().src,
              width: stickerStyle.width,
              height: stickerStyle.height,
              style: stickerImageStyle
            })}
          </svg>
      </div>
    </DraggableComponent>)
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    return (<bem specifier='b:spritesCanvasControls'>
      <div bem='$e:item e:container'>
        {this._renderSVGFilter()}
        {this._renderItem()}
        {this._renderKnobs()}
      </div>
    </bem>)
  }
}
