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

import { Constants, ReactBEM, Vector2, Utils } from '../../../globals'
import CanvasControlsComponent from '../canvas-controls-component'

export default class BrushCanvasControlsComponent extends CanvasControlsComponent {
  constructor (...args) {
    super(...args)

    this._drawing = false
    this._bindAll(
      '_onMouseEnter',
      '_onMouseLeave',
      '_onMouseMove',
      '_onMouseDown',
      '_onMouseUp',
      '_onOperationUpdated'
    )

    this.state = {
      cursorVisible: false,
      cursorPosition: new Vector2()
    }

    this._events = {
      [Constants.EVENTS.OPERATION_UPDATED]: this._onOperationUpdated
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when an operation has been updated
   * @param  {Operation} operation
   * @private
   */
  _onOperationUpdated (operation) {
    if (operation === this.getSharedState('operation')) {
      this.forceUpdate()
    }
  }

  /**
   * Gets called when the user enters the canvas
   * @param {Event} event
   * @private
   */
  _onMouseEnter (e) {
    const cursorPosition = this._getCursorPosition(e)
    this.setState({
      cursorVisible: true,
      cursorPosition
    })
  }

  /**
   * Gets called when the user leaves the canvas
   * @private
   */
  _onMouseLeave () {
    this.setState({
      cursorVisible: false
    })
  }

  /**
   * Gets called while the user moves the mouse
   * @param {Event} e
   * @private
   */
  _onMouseMove (e) {
    const cursorPosition = this._getCursorPosition(e)
    this.setState({ cursorPosition })

    if (this._drawing) {
      const zoom = this.context.editor.getZoom()
      this._currentPath.addControlPoint(cursorPosition.clone().divide(zoom))

      const { editor } = this.context
      editor.render()
    }
  }

  // -------------------------------------------------------------------------- DRAWING

  /**
   * Gets called when the user presses a mouse button
   * @param  {Event} e
   * @private
   */
  _onMouseDown (e) {
    e.preventDefault()
    const zoom = this.context.editor.getZoom()
    const cursorPosition = this._getCursorPosition(e)

    const operation = this.getSharedState('operation')

    this._optionsBeforeDraw = operation.serializeOptions()
    this._operationExistedBeforeDraw = !!operation.getPaths().length

    const thickness = operation.getThickness()
    const color = operation.getColor()
    this._drawing = true
    this._currentPath = operation.createPath(thickness, color)
    this._currentPath.addControlPoint(cursorPosition.clone().divide(zoom))

    const { editor } = this.context
    editor.render()
  }

  /**
   * Gets called when the user releases a mouse button
   * @private
   */
  _onMouseUp () {
    this._currentPath = null
    this._drawing = false

    const { editor } = this.context
    editor.addHistory(
      this.getSharedState('operation'),
      this._optionsBeforeDraw,
      this._operationExistedBeforeDraw)
  }

  /**
   * Draws the brushes
   * @private
   */
  _drawBrushes () {
    const { canvas } = this.refs
    const { editor } = this.context
    const sdk = editor.getSDK()

    this.getSharedState('operation').renderBrushCanvas(sdk, canvas)
  }

  // -------------------------------------------------------------------------- CURSOR

  /**
   * Returns the cursor position for the given event
   * @param  {Event} event
   * @private
   */
  _getCursorPosition (event) {
    const position = Utils.getEventPosition(event)
    const boundingRect = this.refs.container.getBoundingClientRect()
    return position
      .subtract(boundingRect.left, boundingRect.top)
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
   * Returns the cursor's style object
   * @return {Object}
   * @private
   */
  _getCursorStyle () {
    const { editor } = this.context
    const zoom = editor.getZoom()

    const operation = this.getSharedState('operation')
    const thickness = operation.getThickness() * zoom
    const color = operation.getColor()

    const { cursorPosition } = this.state
    return {
      left: cursorPosition.x,
      top: cursorPosition.y,
      width: thickness,
      height: thickness,
      background: color.toRGBA(),
      marginLeft: thickness * -0.5,
      marginTop: thickness * -0.5
    }
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const cursorClass = this.state.cursorVisible ? 'is-visible' : null
    return (<div
      bem='b:canvasControls e:container m:full'
      ref='container'
      style={this._getContainerStyle()}
      onMouseEnter={this._onMouseEnter}
      onMouseMove={this._onMouseMove}
      onMouseLeave={this._onMouseLeave}
      onMouseDown={this._onMouseDown}
      onMouseUp={this._onMouseUp}>
      <div bem='$b:brushCanvasControls'>
        <div bem='e:cursor' className={cursorClass} style={this._getCursorStyle()} />
        <canvas bem='e:canvas' ref='canvas' />
      </div>
    </div>)
  }
}
