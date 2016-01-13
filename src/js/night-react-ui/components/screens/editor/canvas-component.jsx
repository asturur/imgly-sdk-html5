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

import {
  Utils, SDKUtils, ReactBEM, Vector2, BaseComponent, Constants, EventEmitter
} from '../../../globals'
import ModalManager from '../../../lib/modal-manager'

export default class CanvasComponent extends BaseComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onDragStart',
      '_onDragMove',
      '_onDragEnd',
      '_onCanvasUpdate'
    )

    this._rendering = false
    this._scheduledRenderings = []
    this._canvasDimensions = new Vector2()
    this._containerDimensions = new Vector2()

    this.state = {
      canvasPosition: new Vector2(),
      canvasOffset: new Vector2()
    }

    this._events = {
      [Constants.EVENTS.CANVAS_RENDER]: this._onCanvasUpdate
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component receives some new props
   * @param {Object} props
   */
  componentWillReceiveProps (props) {
    if (props.zoom !== this.props.zoom) {
      const { editor } = this.context
      const sdk = editor.getSDK()
      sdk.setAllOperationsToDirty()
      this._onCanvasUpdate(props.zoom)
    }
  }

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    const { editor } = this.context
    const renderer = editor.getRenderer()

    const { canvas } = this.refs
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    renderer.setCanvas(canvas)
    renderer.resizeTo(new Vector2(width, height))

    this._cacheDimensions()

    this._onCanvasUpdate()
      .then(() => {
        this.props.onFirstRender && this.props.onFirstRender()
      })
  }

  /**
   * Gets called after this component has been updated
   */
  componentDidUpdate (prevProps, newProps) {
    this._cacheDimensions()
  }

  // -------------------------------------------------------------------------- DRAGGING

  /**
   * Gets called when the user starts dragging the canvas
   * @param {React.SyntheticEvent} e
   * @private
   */
  _onDragStart (e) {
    if (!this.props.dragEnabled) return

    const { editor } = this.context
    const sdk = editor.getSDK()
    this._dragStartPosition = Utils.getEventPosition(e.nativeEvent)
    this._dragInitialOffset = sdk.getOffset().clone()
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

    this.updateOffset(newOffset)
  }

  /**
   * Sets the offsets to the given one and takes boundaries into account
   * @param  {Vector2} newOffset
   */
  updateOffset (newOffset) {
    const { editor } = this.context
    const sdk = editor.getSDK()

    const initialOffset = sdk.getOffset()
    if (!newOffset) {
      newOffset = initialOffset.clone()
    }

    const sprite = sdk.getSprite()
    const bounds = sprite.getBounds()
    const dimensions = new Vector2(bounds.width, bounds.height)

    const minOffset = this._containerDimensions
      .clone()
      .subtract(dimensions)
      .divide(2)
      .clamp(null, new Vector2(0, 0))

    const maxOffset = dimensions
      .clone()
      .subtract(this._containerDimensions)
      .divide(2)
      .clamp(new Vector2(0, 0), null)

    newOffset.clamp(minOffset, maxOffset).round()
    if (!initialOffset.equals(newOffset)) {
      sdk.setOffset(newOffset)
      this._onCanvasUpdate()
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

  // -------------------------------------------------------------------------- POSITIONING

  /**
   * Repositions the canvas
   * @private
   */
  _repositionCanvas () {
    const canvasPosition = this._containerDimensions
      .clone()
      .divide(2)
      .subtract(this._canvasDimensions.divide(2))

    this.setState({ canvasPosition })
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Returns the default zoom level
   * @param {Boolean} updateDimensions = false
   * @return {Number}
   */
  getDefaultZoom (updateDimensions = false) {
    if (updateDimensions) {
      this._cacheDimensions()
    }

    const { editor } = this.context
    const sdk = editor.getSDK()

    const initialDimensions = sdk.getInputDimensions()
    const defaultDimensions = SDKUtils.resizeVectorToFit(initialDimensions, this._containerDimensions)

    // Since default and native dimensions have the same ratio, we can take either x or y here
    return defaultDimensions
      .divide(initialDimensions)
      .x
  }

  /**
   * Updates the stored canvas and container dimensions
   * @private
   */
  _cacheDimensions () {
    const { canvas, canvasCell } = this.refs

    this._canvasDimensions = new Vector2(canvas.offsetWidth, canvas.offsetHeight)
    this._containerDimensions = new Vector2(canvasCell.offsetWidth, canvasCell.offsetHeight)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the dimensions or zoom has been changed
   * @param {Number} zoom = this.props.zoom
   * @param {Function} [callback]
   * @private
   */
  _onCanvasUpdate (zoom = this.props.zoom, callback) {
    return this._renderCanvas()
      .then(() => {
        callback && callback()
        this.updateOffset()
      })
      .catch((e) => {
        ModalManager.instance.displayError(
          this._t('errors.renderingError.title'),
          this._t('errors.renderingError.text', { error: e.message })
        )
        console && console.error && console.error(e)
      })
  }

  // -------------------------------------------------------------------------- GETTERS

  /**
   * Returns the current output dimensions
   * @return {Vector2}
   */
  getOutputDimensions () {
    const { kit } = this.context
    return kit.getOutputDimensions()
  }

  /**
   * Returns the initial dimensions for the current settings
   * @return {Vector2}
   */
  getInitialDimensions () {
    const { kit } = this.context
    return kit.getInitialDimensions()
  }

  /**
   * Returns the current canvas dimensions
   * @return {Vector2}
   */
  getDimensions () {
    return this._canvasDimensions
  }

  /**
   * Returns the current canvas container dimensions
   * @return {Vector2}
   */
  getContainerDimensions () {
    return this._containerDimensions
  }

  // -------------------------------------------------------------------------- RENDERING

  onResize () {
    this._cacheDimensions()
    const { editor } = this.context
    const sdk = editor.getSDK()
    sdk.resizeTo(this._containerDimensions)
    this._onCanvasUpdate()
  }

  /**
   * Renders the canvas. Avoids multiple render processes at the same time.
   * @return {Promise}
   * @private
   */
  _renderCanvas () {
    const scheduledRendering = new EventEmitter()
    const promise = new Promise((resolve, reject) => {
      scheduledRendering.on('done', () => resolve())
      scheduledRendering.on('error', (e) => reject(e))
    })
    this._scheduledRenderings.push(scheduledRendering)
    this._runScheduledRenderings()
    return promise
  }

  /**
   * Runs the queued renderings
   * @private
   */
  _runScheduledRenderings () {
    if (this._rendering) return
    const scheduledRendering = this._scheduledRenderings[0]
    if (!scheduledRendering) return

    // Remove scheduled rendering from queue
    this._scheduledRenderings.splice(0, 1)

    this._rendering = true

    const { editor } = this.context
    editor.render()
      .then(() => {
        scheduledRendering.emit('done')
        this._rendering = false
        this._runScheduledRenderings()
      })
      .catch((e) => {
        scheduledRendering.emit('error', e)
        this._rendering = false
        this._runScheduledRenderings()
      })
  }

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

    return (
      <div bem='$b:canvas e:container e:row'>
        <div bem='e:container e:cell' ref='canvasCell'>
          <div
            bem='e:innerContainer'
            className={this.props.dragEnabled ? 'is-draggable' : null}
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
