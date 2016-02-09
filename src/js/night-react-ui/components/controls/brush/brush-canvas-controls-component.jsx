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

export default class TiltShiftCanvasControlsComponent extends CanvasControlsComponent {
  constructor (...args) {
    super(...args)

    this._drawing = false
    this._operation = this.getSharedState('operation')
    this._bindAll(
      '_onMouseEnter',
      '_onMouseLeave',
      '_onMouseMove',
      '_onMouseDown',
      '_onMouseUp'
    )

    this.state = {
      cursorVisible: false,
      cursorPosition: new Vector2()
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
      const zoom = this.context.editor.getSDK().getZoom()
      this._currentPath.addControlPoint(cursorPosition.clone().divide(zoom))
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
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
    const zoom = this.context.editor.getSDK().getZoom()
    const cursorPosition = this._getCursorPosition(e)

    const thickness = this._operation.getThickness()
    const color = this._operation.getColor()
    this._drawing = true
    this._currentPath = this._operation.createPath(thickness, color)
    this._currentPath.addControlPoint(cursorPosition.clone().divide(zoom))

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
  }

  /**
   * Gets called when the user releases a mouse button
   * @private
   */
  _onMouseUp () {
    this._currentPath = null
    this._drawing = false
  }

  /**
   * Draws the brushes
   * @private
   */
  _drawBrushes () {
    const { canvas } = this.refs
    const { editor } = this.context
    const sdk = editor.getSDK()

    this._operation.renderBrushCanvas(sdk, canvas)
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
    const thickness = this._operation.getThickness()
    const color = this._operation.getColor()

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
