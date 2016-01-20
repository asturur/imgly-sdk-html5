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

import { SDK, ReactBEM, BaseComponent, Vector2, Constants } from '../../../globals'
import DraggableComponent from '../../draggable-component.jsx'

export default class StickerCanvasControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRemoveClick',
      '_onStickerDrag',
      '_onCanvasClick'
    )

    this._operation = this.getSharedState('operation')
    this._sprites = this.getSharedState('sprites')
    this._stickers = this.getSharedState('stickers')
    this._selectedSticker = this.getSharedState('selectedSticker')
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  componentDidMount () {
    super.componentDidMount()

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
    this._resizeNewStickers()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the shared state did change
   * @param {Object} newState
   */
  sharedStateDidChange (newState) {
    this._stickers = this.getSharedState('stickers')
    this._resizeNewStickers()
  }

  /**
   * Gets called when the user clicks the remove button
   * @param  {Event} e
   * @private
   */
  _onRemoveClick (e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    if (!selectedSticker) return

    const stickers = this.getSharedState('stickers')
    const index = stickers.indexOf(selectedSticker)
    if (index !== -1) {
      stickers.splice(index, 1)
      this._stickers = stickers
      this._selectedSticker = null
      this._operation.setDirty(true)
      this.setSharedState({
        stickers,
        selectedSticker: null
      })
      this.props.onSwitchControls('back')
    }
  }

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onCanvasClick (e) {
    if (e.target !== this.refs.container) return
    if (!this.getSharedState('selectedSticker')) return

    this.props.onSwitchControls('back')
  }

  /**
   * Gets called when the user starts dragging a sticker
   * @param  {Object} sticker
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onStickerDragStart (sticker, position, e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    if (selectedSticker !== sticker) {
      this.setSharedState({ selectedSticker: sticker })
    }
    this._selectedSticker = sticker
    this._initialPosition = sticker.getPosition().clone()
  }

  /**
   * Gets called while the user drags a sticker
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onStickerDrag (offset, e) {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const relativeOffset = offset
      .divide(outputDimensions)
    const newPosition = this._initialPosition
      .clone()
      .add(relativeOffset)

    this._operation.setDirty(true)
    this._selectedSticker.setPosition(newPosition)
    this.forceUpdate()
  }

  /**
   * Gets called when the user starts dragging a knob
   * @param  {String} side
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onKnobDragStart (side, position, e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    switch (side) {
      case 'bottom':
        this._initialPosition = this._getBottomDragKnobPosition()
        break
      case 'top':
        this._initialPosition = this._getTopDragKnobPosition()
        break
    }

    this._initialScale = selectedSticker.getScale().clone()
  }

  /**
   * Gets called while the user drags a sticker
   * @param  {String} side
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onKnobDrag (side, offset, e) {
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerPosition = this._getAbsoluteStickerPosition(selectedSticker)
    const newKnobPosition = this._initialPosition
      .clone()
      .add(offset)

    const halfDimensions = this._getStickerDimensions(selectedSticker)
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

    selectedSticker.getScale().set(newScale.x, newScale.x)
    selectedSticker.setRotation(radians)
    this.forceUpdate()
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

  /**
   * Builds the style object for the given sticker
   * @param  {Object} sticker
   * @return {Object}
   * @private
   */
  _getStickerStyle (sticker) {
    const stickerDimensions = this._getStickerDimensions(sticker)
    const stickerPosition = this._getAbsoluteStickerPosition(sticker)
      .subtract(stickerDimensions.clone().divide(2))

    const degrees = sticker.getRotation() * 180 / Math.PI
    let transform = `rotate(${degrees.toFixed(2)}deg)`

    if (sticker.getFlipVertically()) {
      transform += ` rotateX(180deg)`
    }

    if (sticker.getFlipHorizontally()) {
      transform += ` rotateY(180deg)`
    }

    return {
      top: stickerPosition.y,
      left: stickerPosition.x,
      width: stickerDimensions.x,
      height: stickerDimensions.y,
      WebkitTransform: transform,
      msTransform: transform,
      MozTransform: transform,
      OTransform: transform
    }
  }

  /**
   * Calculates the drag bottom right knob's position
   * @return {Vector2}
   * @private
   */
  _getBottomDragKnobPosition () {
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerPosition = this._getAbsoluteStickerPosition(selectedSticker)
    const stickerRotation = selectedSticker.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions(selectedSticker)
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
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerPosition = this._getAbsoluteStickerPosition(selectedSticker)
    const stickerRotation = selectedSticker.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions(selectedSticker)
      .divide(2)

    // Calculate knob position
    return stickerPosition.clone()
      .add(
        halfDimensions.x * cos + halfDimensions.y * sin,
        halfDimensions.x * sin - halfDimensions.y * cos
      )
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
   * Returns the style object for the remove knob
   * @return {Object}
   * @private
   */
  _getRemoveKnobStyle () {
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerPosition = this._getAbsoluteStickerPosition(selectedSticker)
    const stickerRotation = selectedSticker.getRotation()

    // Calculate sin and cos for rotation
    const sin = Math.sin(stickerRotation || 0)
    const cos = Math.cos(stickerRotation || 0)

    // Calculate sticker dimensions
    const halfDimensions = this._getStickerDimensions(selectedSticker)
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
   * Returns the style object for the given sticker
   * @param  {Sticker} sticker
   * @param  {Image} i
   * @return {Object}
   * @private
   */
  _renderStickerSVGFilters () {
    const stickers = this._operation.getSpritesOfType(SDK.Sticker)
    const filtersSVG = { __html: stickers.map((sticker, i) => {
      const adjustments = sticker.getAdjustments()
      const brightness = adjustments.getBrightness()
      const saturation = adjustments.getSaturation()
      const contrast = adjustments.getContrast()

      return (
        `<filter id='pesdk-sticker-${i}-filter'>
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
    }).join() }

    // We added `key: Math.random()` because in Safari, dangerouslySetInnerHTML
    // would not update without that...
    // https://github.com/facebook/react/issues/2863
    return (<svg width='0' height='0' color-interpolation-filters='sRGB' is='svg'>
      {ReactBEM.createElement('defs', { key: Math.random(), dangerouslySetInnerHTML: filtersSVG })}
    </svg>)
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Sets the initial size for stickers that have not been initially resized yet
   * @private
   */
  _resizeNewStickers () {
    this._stickers
      .filter((sticker) => !sticker._loaded)
      .forEach((sticker) => this._setInitialStickerScale(sticker))
  }

  /**
   * Sets the initial scale for the given sticker to make sure it fits
   * the canvas dimensions
   * @param {Sticker} sticker
   * @private
   */
  _setInitialStickerScale (sticker) {
    const stickerImage = sticker.getImage()

    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()
    let scale = sticker.getScale().clone()

    const maxDimensions = Math.min(outputDimensions.x, outputDimensions.y) * 0.9

    const outputRatio = outputDimensions.x / outputDimensions.y
    const stickerRatio = stickerImage.width / stickerImage.height

    let newScale
    if (stickerRatio > outputRatio) {
      newScale = maxDimensions / stickerImage.width
      scale.set(newScale, newScale)
    } else {
      newScale = maxDimensions / stickerImage.height
      scale.set(newScale, newScale)
    }
    scale.divide(editor.getSDK().getZoom())

    sticker.setScale(scale)
    this._operation.setDirty(true)

    sticker._loaded = true
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the sticker items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderStickerItems () {
    const selectedSticker = this.getSharedState('selectedSticker')

    return this._stickers
      .map((sticker, i) => {
        const stickerStyle = this._getStickerStyle(sticker)
        const isSelected = selectedSticker === sticker
        const className = isSelected ? 'is-selected' : null
        const stickerImageStyle = { filter: `url("#pesdk-sticker-${i}-filter")` }

        return (<DraggableComponent
          onStart={this._onStickerDragStart.bind(this, sticker)}
          onDrag={this._onStickerDrag}>
          <div
            bem='$e:sticker'
            style={stickerStyle}
            className={className}
            key={`sticker-${i}`}>
              <svg width={stickerStyle.width} height={stickerStyle.height} color-interpolation-filters='sRGB' is='svg'>
                {ReactBEM.createElement('image', {
                  xlinkHref: sticker.getImage().src,
                  width: stickerStyle.width,
                  height: stickerStyle.height,
                  style: stickerImageStyle
                })}
              </svg>
          </div>
        </DraggableComponent>)
      })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const selectedSticker = this.getSharedState('selectedSticker')
    const stickerSVGFilters = this._renderStickerSVGFilters()
    const stickerItems = this._renderStickerItems()

    let knobs
    if (selectedSticker) {
      knobs = [
        (<DraggableComponent
          onStart={this._onKnobDragStart.bind(this, 'bottom')}
          onDrag={this._onKnobDrag.bind(this, 'bottom')}>
          <div bem='e:knob $b:knob' style={this._getBottomDragKnobStyle()}>
            <img bem='e:icon' src={this._getAssetPath('controls/knobs/resize-diagonal-down@2x.png', true)} />
          </div>
        </DraggableComponent>),
        (<DraggableComponent
          onStart={this._onKnobDragStart.bind(this, 'top')}
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

    return (<div
      bem='b:canvasControls e:container'
      ref='root'
      style={this._getContainerStyle()}
      onClick={this._onCanvasClick}>
        <div
          bem='$b:stickersCanvasControls'
          ref='container'>
          {stickerSVGFilters}
          {stickerItems}
          {knobs}
        </div>
      </div>)
  }

  // -------------------------------------------------------------------------- MATH HELPERS

  /**
   * Calculates the absolute sticker position on the canvas
   * @param  {Object} sticker
   * @return {Vector2}
   * @private
   */
  _getAbsoluteStickerPosition (sticker) {
    const { editor } = this.context
    const outputSprite = editor.getSDK().getSprite()
    const outputBounds = outputSprite.getBounds()

    return sticker.getPosition()
      .clone()
      .multiply(outputBounds.width, outputBounds.height)
  }

  /**
   * Calculates the sticker dimensions
   * @param  {Object} sticker
   * @return {Vector2}
   * @private
   */
  _getStickerDimensions (sticker) {
    const { editor } = this.context
    const sdk = editor.getSDK()
    const image = sticker.getImage()

    return new Vector2(image.width, image.height)
      .multiply(sticker.getScale())
      .multiply(sdk.getZoom())
      .abs()
  }
}
