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

import {
  Utils, ReactBEM, Vector2, BaseComponent, Constants
} from '../../../globals'

export default class CanvasComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onDragStart',
      '_onDragMove',
      '_onDragEnd',
      '_onWindowResize'
    )

    this._events = {
      [Constants.EVENTS.WINDOW_RESIZE]: this._onWindowResize
    }

    this._initialRenderDone = false

    this.state = {
      canvasPosition: new Vector2(),
      canvasOffset: new Vector2()
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called after the window has been resized
   * @private
   */
  _onWindowResize () {
    const { editor } = this.context
    const sdk = editor.getSDK()
    sdk.resizeTo(this._getContainerDimensions())
    editor.setZoom('auto')
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    const { editor } = this.context
    const renderer = editor.getRenderer()

    const { canvasCell, canvas } = this.refs
    const width = canvasCell.offsetWidth
    const height = canvasCell.offsetHeight
    renderer.setCanvas(canvas)
    renderer.resizeTo(new Vector2(width, height))
  }

  // -------------------------------------------------------------------------- DRAGGING

  /**
   * Gets called when the user starts dragging the canvas
   * @param {React.SyntheticEvent} e
   * @private
   */
  _onDragStart (e) {
    const { editor } = this.context
    if (!editor.isFeatureEnabled('drag')) return

    this._dragStartPosition = Utils.getEventPosition(e.nativeEvent)
    this._dragInitialOffset = editor.getOffset().clone()
    document.addEventListener('mousemove', this._onDragMove)
    document.addEventListener('touchmove', this._onDragMove)
    document.addEventListener('mouseup', this._onDragEnd)
    document.addEventListener('touchend', this._onDragEnd)
  }

  /**
   * Gets called while the user drags the canvas
   * @param {DOMEvent} e
   * @private
   */
  _onDragMove (e) {
    const eventPosition = Utils.getEventPosition(e)
    const diffFromStart = eventPosition
      .clone()
      .subtract(this._dragStartPosition)

    const newOffset = this._dragInitialOffset
      .clone()
      .add(diffFromStart)

    const { editor } = this.context
    const lastOffset = editor.getOffset().clone()
    editor.setOffset(newOffset)
    if (!editor.getOffset().equals(lastOffset)) {
      editor.render()
    }
  }

  /**
   * Gets called when the user stops dragging the canvas
   * @param {DOMEvent} e
   * @private
   */
  _onDragEnd (e) {
    document.removeEventListener('mousemove', this._onDragMove)
    document.removeEventListener('touchmove', this._onDragMove)
    document.removeEventListener('mouseup', this._onDragEnd)
    document.removeEventListener('touchend', this._onDragEnd)
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Returns the container's dimensions
   * @return {Vector2}
   * @private
   */
  _getContainerDimensions () {
    const { canvasCell } = this.refs
    return new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Returns the style properties for the draggable canvas area
   * @private
   */
  _getDraggableStyle () {
    return {
      top: this.state.canvasPosition.y + this.state.canvasOffset.y,
      left: this.state.canvasPosition.x + this.state.canvasOffset.x
    }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    let canvasContent = null
    let containerContent = null
    if (this.props.largeControls) {
      containerContent = this.props.children
    } else {
      canvasContent = this.props.children
    }

    const dragEnabled = this.context.editor.isFeatureEnabled('drag')

    return (
      <div bem='$b:canvas e:container e:row'>
        <div bem='e:container e:cell' ref='canvasCell'>
          <div
            bem='e:innerContainer'
            className={dragEnabled ? 'is-draggable' : null}
            onTouchStart={this._onDragStart}
            onMouseDown={this._onDragStart}
            style={this._getDraggableStyle()}>
            <canvas
              bem='e:canvas'
              ref='canvas' />
            {canvasContent}
          </div>
          {containerContent}
        </div>
      </div>
    )
  }
}
