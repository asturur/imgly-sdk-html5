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

import { SDK, ReactBEM, BaseComponent, Constants } from '../../../globals'
import DraggableComponent from '../../draggable-component.jsx'

const { Text } = SDK

export default class TextCanvasControlsComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onRemoveClick',
      '_onCanvasClick',
      '_onTextDragStart',
      '_onTextDrag',
      '_onTextChange',
      '_onResizeKnobDragStart',
      '_onResizeKnobDrag',
      '_onResizeKnobDragStop',
      '_onRotationKnobDragStart',
      '_onRotationKnobDrag',
      '_onRotationKnobDragStop'
    )

    this._operation = this.getSharedState('operation')
    this._sprites = this.getSharedState('sprites')
    this._selectedTextMoved = false
    this._dragging = false
    this.state = { editMode: false }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the currently edited text changes
   * @param  {Event} e
   * @private
   */
  _onTextChange (e) {
    const selectedText = this.getSharedState('selectedText')
    selectedText.setText(e.target.value)
    this.forceUpdate()
  }

  /**
   * Gets called when the user clicks on a text
   * @param  {Text} text
   * @param  {Event} e
   * @private
   */
  _onTextClick (text, e) {
    const selectedText = this.getSharedState('selectedText')
    if (text !== selectedText) {
      this.refs[`textArea-${selectedText.id}`].blur()
      this.setSharedState({ selectedText: text })
      return this.setState({
        editMode: false
      })
    }
    if (this._selectedTextMoved) return
    if (this.state.editMode) return

    this.setState({ editMode: true }, () => {
      this.refs[`textArea-${selectedText.id}`].focus()
    })
  }

  /**
   * Gets called when the user clicks the remove button
   * @param  {Event} e
   * @private
   */
  _onRemoveClick (e) {
    const selectedText = this.getSharedState('selectedText')
    if (!selectedText) return

    this._operation.removeSprite(selectedText)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER, undefined, () => {
      this.props.onSwitchControls('back')
    })

    this.setSharedState({
      selectedText: null
    })
  }

  /**
   * Gets called when the user clicks somewhere on the canvas
   * @param  {Event} e
   * @private
   */
  _onCanvasClick (e) {
    if (this._dragging) return
    if (e.target !== this.refs.container) return

    if (this.state.editMode) {
      this.setState({ editMode: false })
    } else {
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER, undefined, () => {
        this.props.onSwitchControls('back')
      })
    }
  }

  // -------------------------------------------------------------------------- TEXT DRAGGING

  /**
   * Gets called when the user starts to drag the text
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onTextDragStart (position, e) {
    this._selectedTextMoved = false

    const selectedText = this.getSharedState('selectedText')
    this._initialPosition = selectedText.getPosition()
  }

  /**
   * Gets called when the user drags the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onTextDrag (offset, e) {
    // Move more than 5 pixels? Flag as moved
    // This will result in a click event on this element not being handled
    if (offset.len() > 5) {
      this._selectedTextMoved = true
    }

    const selectedText = this.getSharedState('selectedText')
    const { editor } = this.context

    const outputDimensions = editor.getOutputDimensions()
    const newPosition = this._initialPosition.clone()
      .add(offset.clone().divide(outputDimensions))

    selectedText.setPosition(newPosition)
    this.forceUpdate()
  }

  // -------------------------------------------------------------------------- RESIZE DRAGGING

  /**
   * Gets called when the user starts resizing the text
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDragStart (position, e) {
    this._dragging = true
    this._initialPosition = this._getResizeKnobPosition()
  }

  /**
   * Gets called while the user resizes the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDrag (offset, e) {
    const selectedText = this.getSharedState('selectedText')
    const textRotation = selectedText.getRotation()

    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const cos = Math.cos(textRotation)
    const sin = Math.sin(textRotation)

    const newKnobPosition = this._initialPosition.clone()
      .add(offset)
    const position = this._getAbsoluteTextPosition(selectedText)
    const distanceToPosition = newKnobPosition.clone()
      .subtract(position)

    const newMaxWidth = (distanceToPosition.x * cos + distanceToPosition.y * sin) / outputDimensions.x * 2
    selectedText.setMaxWidth(newMaxWidth)
    this.forceUpdate()
  }

  /**
   * Gets called when the user stops resizing the text
   * @param  {Event} e
   * @private
   */
  _onResizeKnobDragStop (e) {
    // Allow clicks on canvas 100ms after dragging has stopped
    setTimeout(() => {
      this._dragging = false
    }, 100)
  }

  // -------------------------------------------------------------------------- ROTATION

  /**
   * Gets called when the user starts dragging the resize knob
   * @param  {Vector2} position
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDragStart (position, e) {
    this._dragging = true
    this._initialPosition = this._getRotationKnobPosition()
  }

  /**
   * Gets called while the user rotates the text
   * @param  {Vector2} offset
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDrag (offset, e) {
    const selectedText = this.getSharedState('selectedText')
    const { editor } = this.context

    const textPosition = this._getAbsoluteTextPosition(selectedText)
    const newKnobPosition = this._initialPosition
      .clone()
      .add(offset)

    // Calculate new rotation and scale from new knob position
    const knobDistanceFromCenter = newKnobPosition
      .clone()
      .subtract(textPosition)

    const boundingBox = selectedText.getBoundingBox(editor.getSDK(), true)
    const radians = Math.atan2(
      knobDistanceFromCenter.y,
      knobDistanceFromCenter.x
    ) - Math.atan2(boundingBox.y, boundingBox.x / 2)

    selectedText.setRotation(radians)
    this.forceUpdate()
  }

  /**
   * Gets called when the user stops rotating the text
   * @param  {Event} e
   * @private
   */
  _onRotationKnobDragStop (e) {
    // Allow clicks on canvas 100ms after dragging has stopped
    setTimeout(() => {
      this._dragging = false
    }, 100)
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
    const selectedText = this.getSharedState('selectedText')
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const sin = Math.sin(selectedText.getRotation())
    const cos = Math.cos(selectedText.getRotation())

    const boundingBox = selectedText.getBoundingBox(editor.getSDK(), true)
    const halfDimensions = boundingBox.clone().divide(2)
    const position = selectedText.getPosition()
      .clone()
      .multiply(outputDimensions)
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
   * @param  {Text} text
   * @return {Object}
   * @private
   */
  _getTextStyle (text) {
    const { editor } = this.context
    const sdk = editor.getSDK()
    const outputDimensions = editor.getOutputDimensions()
    let style = text.getDOMStyle(sdk, outputDimensions)

    const textPosition = this._getAbsoluteTextPosition(text)
    const boundingBox = text.getBoundingBox(editor.getSDK(), true)
    style.height = Math.min(boundingBox.y, outputDimensions.y - textPosition.y)

    return style
  }

  /**
   * Returns the style object for the text container
   * @param  {Text} text
   * @return {Object}
   * @private
   */
  _getTextContainerStyle (text) {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const textPosition = text.getPosition()
      .clone()
      .multiply(outputDimensions)

    const degrees = text.getRotation() * 180 / Math.PI
    const transform = `rotateZ(${degrees.toFixed(2)}deg)`
    const transformOrigin = '50% 0'

    const maxWidth = text.getMaxWidth() * outputDimensions.x
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
   * Renders the sticker items
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderTextItems () {
    const selectedText = this.getSharedState('selectedText')

    return this._sprites
      .filter((s) => s instanceof Text)
      .map((text, i) => {
        const textStyle = this._getTextStyle(text)
        const containerStyle = this._getTextContainerStyle(text)
        const isSelected = selectedText === text
        const className = isSelected ? 'is-selected' : null

        const contentClassName = (isSelected && this.state.editMode ? null : 'is-draggable')
        const content = (<textarea
          bem='e:content'
          className={contentClassName}
          style={textStyle}
          defaultValue={text.getText()}
          ref={`textArea-${text.id}`}
          onChange={this._onTextChange}
          onClick={this._onTextClick.bind(this, text)} />)

        return (<DraggableComponent
          onStart={this._onTextDragStart.bind(this, text)}
          onDrag={this._onTextDrag}
          disabled={isSelected && this.state.editMode}>
            <div bem='$e:text' style={containerStyle} className={className}>
              {content}
            </div>
        </DraggableComponent>)
      })
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const selectedText = this.getSharedState('selectedText')
    const stickerItems = this._renderTextItems()

    let knobs = []
    if (selectedText) {
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

    return (<div
      bem='b:canvasControls e:container m:full'
      ref='root'
      style={this._getContainerStyle()}
      onClick={this._onCanvasClick}>
        <div
          bem='$b:textCanvasControls'
          ref='container'>
          {stickerItems}
          {knobs}
        </div>
      </div>)
  }

  // -------------------------------------------------------------------------- MATHS

  /**
   * Returns the position of the rotation knob
   * @return {Vector2}
   * @private
   */
  _getRotationKnobPosition () {
    const selectedText = this.getSharedState('selectedText')
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const sin = Math.sin(selectedText.getRotation())
    const cos = Math.cos(selectedText.getRotation())

    const boundingBox = selectedText.getBoundingBox(editor.getSDK(), true)
    const halfDimensions = boundingBox.clone().divide(2)
    const position = selectedText.getPosition()
      .clone()
      .multiply(outputDimensions)
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
    const selectedText = this.getSharedState('selectedText')
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const sin = Math.sin(selectedText.getRotation())
    const cos = Math.cos(selectedText.getRotation())

    const boundingBox = selectedText.getBoundingBox(editor.getSDK(), true)
    const halfDimensions = boundingBox.clone().divide(2)
    const position = selectedText.getPosition()
      .clone()
      .multiply(outputDimensions)
      .add(
        halfDimensions.x * cos,
        halfDimensions.x * sin
      )
    return position
  }

  /**
   * Returns the absolute position for the given text
   * @param  {Text} text
   * @return {Vector2}
   * @private
   */
  _getAbsoluteTextPosition (text) {
    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    return text.getPosition()
      .clone()
      .multiply(outputDimensions)
  }
}
