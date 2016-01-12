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
import { React, ReactBEM, Constants, SDKUtils, SharedState } from '../../../globals'
import OverviewControlsComponent from '../../controls/overview/overview-controls-component'
import FileLoader from '../../../lib/file-loader'
import ScreenComponent from '../screen-component'
import HeaderComponent from '../../header-component'
import SubHeaderComponent from '../../sub-header-component'
import SubHeaderButtonComponent from '../../sub-header-button-component'
import CanvasComponent from './canvas-component'
import ZoomComponent from './zoom-component'
import ModalManager from '../../../lib/modal-manager'
import OverviewControls from '../../controls/overview/'
import Editor from '../../../lib/editor'

export default class EditorScreenComponent extends ScreenComponent {
  constructor (...args) {
    super(...args)

    this._editor = new Editor(this.context.options)
    this._overviewControls = OverviewControlsComponent

    this._bindAll(
      'switchToControls',
      '_onFirstCanvasRender',
      '_onZoomIn',
      '_onZoomOut',
      '_zoom',
      '_undoZoom',
      '_onDisableFeatures',
      '_onEnableFeatures',
      '_onNewClick',
      '_onExportClick',
      '_onUndoClick',
      '_onWindowResize',
      '_updateZoomToFitNewSize',
      '_onNewFile'
    )

    this._history = []
    this._previousControlsStack = []
    this.state = {
      zoom: null,
      controls: OverviewControls,
      zoomEnabled: true,
      dragEnabled: true
    }

    this._events = {
      [Constants.EVENTS.CANVAS_ZOOM]: this._zoom,
      [Constants.EVENTS.CANVAS_UNDO_ZOOM]: this._undoZoom,
      [Constants.EVENTS.EDITOR_DISABLE_FEATURES]: this._onDisableFeatures,
      [Constants.EVENTS.EDITOR_ENABLE_FEATURES]: this._onEnableFeatures
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this._fileLoader = new FileLoader(this.refs.fileInput)
    this._fileLoader.on('file', this._onNewFile)

    const { options } = this.context
    if (options.responsive) {
      window.addEventListener('resize', this._onWindowResize)
    }
  }

  /**
   * Gets called before this component is unmounted
   */
  componentWillUnmount () {
    super.componentWillUnmount()

    const { options } = this.context
    if (options.responsive) {
      window.removeEventListener('resize', this._onWindowResize)
    }
    this._fileLoader.off('file', this._onNewFile)
    this._fileLoader.dispose()
  }

  // -------------------------------------------------------------------------- PUBLIC OPERATIONS API

  /**
   * If the operation with the given identifier already exists, it returns
   * the existing operation. Otherwise, it creates and returns a new one.
   * @param  {String} identifier
   * @param  {Object} options
   * @return {PhotoEditorSDK.Operation}
   */
  getOrCreateOperation (identifier, options = {}) {
    if (this._operationsMap[identifier]) {
      return this._operationsMap[identifier]
    } else {
      const Operation = this._availableOperations[identifier]
      const operation = new Operation(this._renderer, options)
      this.addOperation(operation)
      return operation
    }
  }

  /**
   * Adds the given operation to the stack
   * @param {Operation} operation
   */
  addOperation (operation) {
    const identifier = operation.constructor.identifier
    operation.on('updated', () => {
      this._mediator.emit(Constants.EVENTS.OPERATION_UPDATED, operation)
    })
    const index = this._preferredOperationOrder.indexOf(identifier)
    this._operationsStack.set(index, operation)
    this._operationsMap[identifier] = operation
  }

  /**
   * Removes the given operation from the stack
   * @param  {Operation} operation
   */
  removeOperation (operation) {
    const identifier = operation.constructor.identifier
    const stack = this._operationsStack.getStack()

    // Remove operation from map
    if (this._operationsMap[identifier] === operation) {
      delete this._operationsMap[identifier]
    }

    // Remove operation from stack
    const index = stack.indexOf(operation)
    if (index !== -1) {
      this._operationsStack.removeAt(index)

      // Set all following operations to dirty, since they might
      // have cached stuff drawn by the removed operation
      for (let i = index + 1; i < stack.length; i++) {
        const operation = stack[i]
        if (!operation) continue
        operation.setDirty(true)
      }
    }
  }

  /**
   * Returns the operation with the given identifier
   * @param  {String} identifier
   * @return {PhotoEditorSDK.Operation}
   */
  getOperation (identifier) {
    return this._operationsMap[identifier]
  }

  getEnabledOperations () { return this._enabledOperations }

  // -------------------------------------------------------------------------- FILE LOADING

  /**
   * Gets loaded when the user has selected a new file
   * @param  {Image} image
   * @private
   */
  _onNewFile (image) {
    this.props.editor.setImage(image)
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called on window resize
   * @private
   */
  _onWindowResize () {
    if (this._resizeTimeout) {
      window.clearTimeout(this._resizeTimeout)
      this._resizeTimeout = null
    }
    this._resizeTimeout = window.setTimeout(this._updateZoomToFitNewSize, 500)
  }

  /**
   * Gets called when the user clicks on the new button
   * @private
   */
  _onNewClick () {
    if (this.context.options.webcam !== false) {
      this.props.editor.switchToSplashScreen()
    } else {
      this._fileLoader.open()
    }
  }

  /**
   * Gets called when the user clicks the export button
   * @private
   */
  _onExportClick () {
    const { ui, options } = this.context
    const exportOptions = options.export

    this.switchToControls(OverviewControls, null, () => {
      const loadingModal = ModalManager.instance.displayLoading(this._t('loading.exporting'))

      // Give it some time to display the loading modal
      setTimeout(() => {
        ui.export(exportOptions.download)
          .then(() => {
            loadingModal.close()
          })
      }, 1000)
    })
  }

  /**
   * Gets called when the user clicks the undo button
   * @private
   */
  _onUndoClick () {
    this.undo()
  }

  // -------------------------------------------------------------------------- HISTORY

  /**
   * Reverts the last change
   */
  undo () {
    const lastItem = this._history.pop()
    if (lastItem) {
      const { ui } = this.context
      let { operation, existent, options } = lastItem
      if (!existent) {
        ui.removeOperation(operation)
        this._emitEvent(Constants.EVENTS.OPERATION_REMOVED, operation)
      } else {
        operation = ui.getOrCreateOperation(operation.constructor.identifier)
        operation.set(options)
        this._emitEvent(Constants.EVENTS.OPERATION_UPDATED, operation)
      }

      this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
      this.forceUpdate()
    }
  }

  /**
   * Adds the given data to the history
   * @param {Operation} operation
   * @param {Object} options
   * @param {Boolean} existent
   * @return {Object}
   */
  addHistory (operation, options, existent) {
    const historyItem = {
      operation, options, existent
    }
    this._history.push(historyItem)
    this.forceUpdate()
    return historyItem
  }

  // -------------------------------------------------------------------------- FEATURES

  /**
   * Gets called when a EDITOR_DISABLE_FEATURES event is emitted
   * @param {Array.<String>} features
   */
  _onDisableFeatures (features) {
    let { zoomEnabled, dragEnabled } = this.state
    if (features.indexOf('zoom') !== -1) {
      zoomEnabled = false
    }
    if (features.indexOf('drag') !== -1) {
      dragEnabled = false
    }
    this.setState({ zoomEnabled, dragEnabled })
  }

  /**
   * Gets called when a EDITOR_ENABLE_FEATURES event is emitted
   * @param {Array.<String>} features
   */
  _onEnableFeatures (features) {
    let { zoomEnabled, dragEnabled } = this.state
    if (features.indexOf('zoom') !== -1) {
      zoomEnabled = true
    }
    if (features.indexOf('drag') !== -1) {
      dragEnabled = true
    }
    this.setState({ zoomEnabled, dragEnabled })
  }

  // -------------------------------------------------------------------------- ZOOM

  /**
   * Updates the zoom level to fit the new editor dimensions
   * @private
   */
  _updateZoomToFitNewSize () {
    const canvasComponent = this.refs.canvas
    canvasComponent.onResize()
    canvasComponent.updateOffset()
  }

  /**
   * Undos the last zoom
   * @param {Function} [callback]
   * @private
   */
  _undoZoom (callback) {
    if (!this._previousZoomState) return

    const canvasComponent = this.refs.canvas
    const { zoom, canvasState } = this._previousZoomState

    // Couldn't come up with something clean here :(
    canvasComponent.setState(canvasState)
    this._previousZoomState = null
    this.setState({ zoom }, callback)
  }

  /**
   * Zooms to the given level
   * @param {Number|String} zoom
   * @param {Function} [callback]
   * @private
   */
  _zoom (zoom, callback) {
    const sdk = this._editor.getSDK()
    const canvasComponent = this.refs.canvas

    let newZoom = zoom
    if (zoom === 'auto') {
      newZoom = canvasComponent.getDefaultZoom()
      this._lastDefaultZoom = newZoom
    }

    sdk.setZoom(newZoom)
    canvasComponent.updateOffset()

    this._previousZoomState = SDKUtils.extend({
      zoom: this.state.zoom,
      canvasState: SDKUtils.clone(canvasComponent.state)
    }, canvasComponent.state)

    this.setState({ zoom: newZoom }, () => {
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER, undefined, callback)
    })
  }

  /**
   * Gets called when the user clicked the zoom in button
   * @private
   */
  _onZoomIn () {
    const canvasComponent = this.refs.canvas
    const defaultZoom = canvasComponent.getDefaultZoom()

    let newZoom = this.state.zoom
    newZoom += 0.1
    newZoom = Math.min(defaultZoom * 2, newZoom)

    this._zoom(newZoom)
  }

  /**
   * Gets called when the user clicked the zoom out button
   * @private
   */
  _onZoomOut () {
    const canvasComponent = this.refs.canvas
    const defaultZoom = canvasComponent.getDefaultZoom()

    let newZoom = this.state.zoom
    newZoom -= 0.1
    newZoom = Math.max(Math.min(defaultZoom, 1), newZoom)

    console.log('newZoom', newZoom)

    this._zoom(newZoom)
  }

  // -------------------------------------------------------------------------- MISC

  /**
   * Returns the canvas dimensions
   * @return {Vector2}
   */
  getCanvasDimensions () {
    return this.refs.canvas.getDimensions()
  }

  /**
   * Returns the output dimensions
   * @return {Vector2}
   */
  getOutputDimensions () {
    return this.refs.canvas.getOutputDimensions()
  }

  /**
   * Returns the initial dimensions for the current settings
   * @return {Vector2}
   */
  getInitialDimensions () {
    return this.refs.canvas.getInitialDimensions()
  }

  /**
   * We only know the canvas dimensions after the first rendering has been done.
   * On the first render, we should set the initial zoom level
   * @private
   */
  _onFirstCanvasRender () {
    this._zoom('auto')
  }

  /**
   * Switches to the given controls
   * @param  {Component} controls
   * @param  {Object} [state] = {}
   * @param  {Function} [callback]
   */
  switchToControls (controls, state = {}, callback = null) {
    let newControls = null
    if (controls === 'back') {
      newControls = this._previousControlsStack.pop()
    } else if (typeof controls === 'string') {
      const allControls = this.context.ui.getAvailableControls()
      newControls = allControls[controls]
    } else {
      newControls = controls
      this._previousControlsStack.push(this.state.controls)
    }

    const initialState = newControls.getInitialSharedState &&
      newControls.getInitialSharedState(this.context, state)
    const sharedState = new SharedState(initialState)

    // If the controls have an `onExit` method, call it
    // with the controls as `this`
    if (this.state.controls.onExit) {
      this.state.controls.onExit.call(
        this.refs.controls
      )
    }

    this.setState({
      controls: newControls,
      sharedState
    }, callback)
  }

  /**
   * Returns the zoom level
   * @return {Number}
   */
  getZoom () {
    return this.state.zoom
  }

  /**
   * Checks if the editor is at the default zoom level
   * @return {Boolean}
   */
  isDefaultZoom () {
    return this.state.zoom === this._lastDefaultZoom
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Decides whether the undo button should be displayed
   * @return {Boolean}
   * @private
   */
  _showUndoButton () {
    return !!this._history.length
  }

  /**
   * Returns the context passed to all children
   * @return {Object}
   */
  getChildContext () {
    return {
      editor: this._editor,
      ui: this.context.ui,
      options: this.context.options,
      mediator: this.context.mediator
    }
  }

  /**
   * Renders this component
   * @return {ReactBEM.Element}
   */
  renderWithBEM () {
    const Controls = this.state.controls.controls
    const controlsIdentifier = this.state.controls.identifier
    const controlsOptions = this.context.options.controlsOptions[controlsIdentifier] || {}
    let CanvasControls = this.state.controls.canvasControls
    if (!CanvasControls) {
      CanvasControls = OverviewControls.canvasControls
    }

    let controls, canvasControls

    if (Controls) {
      controls = (<Controls
        onSwitchControls={this.switchToControls}
        editor={this}
        sharedState={this.state.sharedState}
        options={controlsOptions}
        ref='controls' />)
    }

    if (CanvasControls) {
      canvasControls = (<CanvasControls
        onSwitchControls={this.switchToControls}
        editor={this}
        sharedState={this.state.sharedState}
        ref='canvasControls' />)
    }

    let newButton
    if (this.context.options.showNewButton !== false) {
      newButton = (<SubHeaderButtonComponent
        label={this._t('editor.new')}
        icon='editor/new@2x.png'
        onClick={this._onNewClick} />)
    }

    let undoButton
    if (this._showUndoButton()) {
      undoButton = (<SubHeaderButtonComponent
        label={this._t('editor.undo')}
        icon='editor/undo@2x.png'
        onClick={this._onUndoClick} />)
    }

    let exportButton
    if (this.context.options.export.showButton !== false) {
      const exportLabel = this.context.options.export.label || this._t('editor.export')
      exportButton = (<SubHeaderButtonComponent
        style='blue'
        label={exportLabel}
        icon='editor/export@2x.png'
        onClick={this._onExportClick} />)
    }

    return (<div bem='b:screen'>
      <HeaderComponent />
      <div bem='$b:editorScreen'>
        <SubHeaderComponent
          label={this._t('webcam.headline')}>
          <bem specifier='$b:subHeader'>
            <input type='file' bem='b:hiddenFileInput' ref='fileInput' />
            <div bem='e:left'>
              {newButton}
            </div>

            <div bem='e:right'>
              {undoButton}
              {exportButton}
            </div>

            <ZoomComponent
              zoom={this.state.zoom}
              onZoomIn={this._onZoomIn}
              onZoomOut={this._onZoomOut}
              zoomEnabled={this.state.zoomEnabled} />
          </bem>
        </SubHeaderComponent>

        <CanvasComponent
          ref='canvas'
          onFirstRender={this._onFirstCanvasRender}
          zoom={this.state.zoom}
          dragEnabled={this.state.dragEnabled}
          largeControls={this.state.controls.largeCanvasControls}>
          {canvasControls}
        </CanvasComponent>

        <div bem='$b:controls $e:container e:row'>
          <div bem='e:cell'>
            {controls}
          </div>
        </div>
      </div>
    </div>)
  }
}

EditorScreenComponent.childContextTypes = {
  ui: React.PropTypes.object.isRequired,
  editor: React.PropTypes.object.isRequired,
  mediator: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired
}

