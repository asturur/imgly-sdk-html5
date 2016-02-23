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

import { ReactBEM } from '../../../../globals'
import DraggableComponent from '../../../draggable-component'
import ItemComponent from './item-component'

export default class TextItemComponent extends ItemComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onTextChange',
      '_onItemDoubleClick',
      '_onResizeKnobDragStart',
      '_onResizeKnobDrag',
      '_onResizeKnobDragStop',
      '_onRotationKnobDragStart',
      '_onRotationKnobDrag',
      '_onRotationKnobDragStop'
    )

    this.state = {
      editMode: false
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user has changed the text
   * @param  {Event} e
   * @private
   */
  _onTextChange (e) {
    const { sprite } = this.props
    sprite.setText(e.target.value)
  }

  /**
   * Gets called when the user double clicks the text. Turns the sprite into
   * editing mode.
   * @private
   */
  _onItemDoubleClick () {
    this.setState({ editMode: true }, () => {
      this.refs.textarea.focus()
      this.refs.textarea.select()
    })
  }

  // -------------------------------------------------------------------------- ROTATION DRAGGING

  /**
   * Gets called when the user starts dragging the resize knob
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDragStart (position, e) {
    this._dragging = true
    this._initialPosition = this._getRotationKnobPosition()

    this.props.onDragStart && this.props.onDragStart()
  }

  /**
   * Gets called while the user rotates the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDrag (offset, e) {
    const { sprite } = this.props
    const { editor } = this.context

    const spritePosition = this._getAbsoluteSpritePosition()
    const newKnobPosition = this._initialPosition
      .clone()
      .add(offset)

    // Calculate new rotation and scale from new knob position
    const knobDistanceFromCenter = newKnobPosition
      .clone()
      .subtract(spritePosition)

    const boundingBox = sprite.getBoundingBox(editor.getSDK(), true)
    const radians = Math.atan2(
      knobDistanceFromCenter.y,
      knobDistanceFromCenter.x
    ) - Math.atan2(boundingBox.y, boundingBox.x / 2)

    sprite.setRotation(radians)
  }

  /**
   * Gets called when the user stops rotating the text
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDragStop (e) {
    this.props.onDragStop && this.props.onDragStop()
  }

  // -------------------------------------------------------------------------- RESIZE DRAGGING

  /**
   * Gets called when the user starts resizing the text
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDragStart (position, e) {
    this._initialPosition = this._getResizeKnobPosition()

    this.props.onDragStart && this.props.onDragStart()
  }

  /**
   * Gets called while the user resizes the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDrag (offset, e) {
    const { sprite } = this.props
    const textRotation = sprite.getRotation()

    const { editor } = this.context
    const zoom = editor.getZoom()

    const cos = Math.cos(textRotation)
    const sin = Math.sin(textRotation)

    const newKnobPosition = this._initialPosition.clone()
      .add(offset)
    const position = this._getAbsoluteSpritePosition()
    const distanceToPosition = newKnobPosition.clone()
      .subtract(position)

    const newMaxWidth = (distanceToPosition.x * cos + distanceToPosition.y * sin) / zoom * 2
    sprite.setMaxWidth(newMaxWidth)
  }

  /**
   * Gets called when the user stops resizing the text
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDragStop (e) {
    this.props.onDragStop && this.props.onDragStop()
  }

  // -------------------------------------------------------------------------- STYLING

  /**
   * Returns the style object for the rotation knob
   * @return {Object}
   * @private
   */
  _getRotationKnobStyle () {
    const position = this._getRotationKnobPosition()
    return {
      left: position.x,
      top: position.y
    }
  }

  /**
   * Returns the style object for the resize knob
   * @return {Object}
   * @private
   */
  _getResizeKnobStyle () {
    const position = this._getResizeKnobPosition()
    return {
      left: position.x,
      top: position.y
    }
  }

  /**
   * Returns the style object for the remove knob
   * @return {Object}
   * @private
   */
  _getRemoveKnobStyle () {
    const { sprite } = this.props
    const { editor } = this.context

    const sin = Math.sin(sprite.getRotation())
    const cos = Math.cos(sprite.getRotation())

    const boundingBox = sprite.getBoundingBox(editor.getSDK(), true)
    const halfDimensions = boundingBox.clone().divide(2)
    const position = sprite.getPosition()
      .clone()
      .multiply(editor.getZoom())
      .add(
        -halfDimensions.x * cos,
        -halfDimensions.x * sin
      )

    return {
      left: position.x,
      top: position.y
    }
  }

  /**
   * Returns the style object for the given text object
   * @return {Object}
   * @private
   */
  _getTextStyle () {
    const { editor } = this.context
    const { sprite } = this.props
    const sdk = editor.getSDK()
    const outputDimensions = editor.getOutputDimensions()
    let style = sprite.getDOMStyle(sdk, outputDimensions)

    const spritePosition = this._getAbsoluteSpritePosition()
    const boundingBox = sprite.getBoundingBox(editor.getSDK(), true)
    style.height = Math.min(boundingBox.y, outputDimensions.y - spritePosition.y)

    return style
  }

  /**
   * Returns the style object for the item container
   * @return {Object}
   * @private
   */
  _getItemContainerStyle () {
    const { editor } = this.context
    const zoom = editor.getZoom()

    const { sprite } = this.props
    const textPosition = sprite.getPosition().clone()
      .multiply(zoom)

    const degrees = sprite.getRotation() * 180 / Math.PI
    const transform = `rotateZ(${degrees.toFixed(2)}deg)`
    const transformOrigin = '50% 0'

    const maxWidth = sprite.getMaxWidth() * zoom
    return {
      width: maxWidth,
      left: textPosition.x,
      top: textPosition.y,
      marginLeft: maxWidth * -0.5,
      transform: transform,
      MozTransform: transform,
      msTransform: transform,
      WebkitTransform: transform,
      transformOrigin: transformOrigin,
      MozTransformOrigin: transformOrigin,
      msTransformOrigin: transformOrigin,
      WebkitTransformOrigin: transformOrigin
    }
  }

  // -------------------------------------------------------------------------- CALCULATIONS

  /**
   * Returns the position of the rotation knob
   * @return {Vector2}
   * @private
   */
  _getRotationKnobPosition () {
    const { sprite } = this.props
    const { editor } = this.context
    const zoom = editor.getZoom()

    const sin = Math.sin(sprite.getRotation())
    const cos = Math.cos(sprite.getRotation())

    const boundingBox = sprite.getBoundingBox(editor.getSDK(), true)
    const halfDimensions = boundingBox.clone().divide(2)
    const position = sprite.getPosition()
      .clone()
      .multiply(zoom)
      .add(
        halfDimensions.x * cos - boundingBox.y * sin,
        halfDimensions.x * sin + boundingBox.y * cos
      )
    return position
  }

  /**
   * Returns the position of the resize knob
   * @return {Vector2}
   * @private
   */
  _getResizeKnobPosition () {
    const { sprite } = this.props
    const { editor } = this.context

    const sin = Math.sin(sprite.getRotation())
    const cos = Math.cos(sprite.getRotation())

    const boundingBox = sprite.getBoundingBox(editor.getSDK(), true)
    const halfDimensions = boundingBox.clone().divide(2)
    const position = sprite.getPosition()
      .clone()
      .multiply(editor.getZoom())
      .add(
        halfDimensions.x * cos,
        halfDimensions.x * sin
      )
    return position
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the knobs for this item
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderKnobs () {
    let knobs = []
    if (this.props.selected && !this.state.editMode) {
      knobs = [
        (<DraggableComponent
          onStart={this._onRotationKnobDragStart}
          onDrag={this._onRotationKnobDrag}
          onStop={this._onRotationKnobDragStop}>
          <div bem='e:knob m:rotate $b:knob' style={this._getRotationKnobStyle()}>
            <img bem='e:icon m:larger' src={this._getAssetPath('controls/knobs/rotate@2x.png', true)} />
          </div>
        </DraggableComponent>),
        (<DraggableComponent
          onStart={this._onResizeKnobDragStart}
          onDrag={this._onResizeKnobDrag}
          onStop={this._onResizeKnobDragStop}>
          <div bem='e:knob m:resize $b:knob' style={this._getResizeKnobStyle()}>
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
   * Renders the draggable item
   * @return {ReactBEM.Element}
   * @private
   */
  _renderItem () {
    const { sprite } = this.props

    let content = []
    content = [(<textarea
      bem='e:content'
      ref='textarea'
      style={this._getTextStyle()}
      defaultValue={sprite.getText()}
      disabled={!this.state.editMode}
      onChange={this._onTextChange} />)]

    let textBEM = '$e:text'
    if (this.props.selected) {
      textBEM += ' m:selected'
    }

    if (!this.state.editMode) {
      content.push(<div
        bem='e:disabledOverlay'
        onDoubleClick={this._onItemDoubleClick} />)
    }

    return (<DraggableComponent
      onStart={this._onItemDragStart}
      onStop={this._onItemDragStop}
      onDrag={this._onItemDrag}
      disabled={!this.props.selected || (this.props.selected && this.state.editMode)}>
        <div
          bem='$e:text'
          style={this._getItemContainerStyle()}
          className={this.props.selected ? 'is-selected' : null}>
          {content}
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
        {this._renderItem()}
        {this._renderKnobs()}
      </div>
    </bem>)
  }
}
