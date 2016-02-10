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
const WINDOW_RESIZE_DELAY = 500

import { Utils, React, ReactBEM, Constants, SharedState } from '../../../globals'
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

    this._overviewControls = OverviewControlsComponent

    this._bindAll(
      'switchToControls',
      '_startEditor',
      '_onZoomIn',
      '_onZoomOut',
      '_zoom',
      '_undoZoom',
      '_onHistoryUpdated',
      '_onDisableFeatures',
      '_onEnableFeatures',
      '_onNewClick',
      '_onExportClick',
      '_onUndoClick',
      '_onWindowResize',
      '_onWindowResizeDone',
      '_onNewFile',
      '_onImageResize'
    )

    this._previousControlsStack = []
    this.state = {
      zoom: null,
      controls: OverviewControls,
      zoomEnabled: true,
      dragEnabled: true
    }

    this._events = {
      [Constants.EVENTS.CANVAS_ZOOM]: this._zoom,
      [Constants.EVENTS.CANVAS_ZOOM_UNDO]: this._undoZoom,
      [Constants.EVENTS.EDITOR_DISABLE_FEATURES]: this._onDisableFeatures,
      [Constants.EVENTS.EDITOR_ENABLE_FEATURES]: this._onEnableFeatures,
      [Constants.EVENTS.HISTORY_UPDATED]: this._onHistoryUpdated
    }

    this._editor = new Editor(this.context.options, this.context.mediator)
    this._editor.on('ready', this._startEditor)
    this._editor.on('resize', this._onImageResize)
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this._fileLoader = new FileLoader(this.refs.fileInput)
    this._fileLoader.on('file', this._onNewFile)

    window.addEventListener('resize', this._onWindowResize)
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

  /**
   * Sets the zoom level and starts the editor rendering
   * @private
   */
  _startEditor () {
    this._zoom('auto')
    this._editor.start()
  }

  // -------------------------------------------------------------------------- FILE LOADING

  /**
   * Gets loaded when the user has selected a new file
   * @param  {Image} image
   * @private
   */
  _onNewFile (image) {
    this._editor.setImage(image)
    this._zoom('auto')
    this.forceUpdate()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the editor starts resizing an image
   * @private
   */
  _onImageResize () {
    const loadingModal = ModalManager.instance.displayLoading(this._t('loading.resizing'))
    this._editor.once('resized', ({ dimensions, reason }) => {
      loadingModal.close()

      ModalManager.instance.displayWarning(
        this._t(`warnings.imageResized_${reason}.title`),
        this._t(`warnings.imageResized_${reason}.text`,
          {
            maxMegaPixels: this._editor.getMaxMegapixels(),
            width: dimensions.x,
            height: dimensions.y
          }
        ))
    })
  }

  /**
   * Gets called on window resize
   * @private
   */
  _onWindowResize () {
    if (this._resizeTimeout) {
      window.clearTimeout(this._resizeTimeout)
      this._resizeTimeout = null
    }
    this._resizeTimeout = window.setTimeout(this._onWindowResizeDone, WINDOW_RESIZE_DELAY)
  }

  /**
   * Gets called `WINDOW_RESIZE_DELAY` ms after the last resize event has been called
   * @private
   */
  _onWindowResizeDone () {
    this._emitEvent(Constants.EVENTS.WINDOW_RESIZE)
  }

  /**
   * Gets called when the user clicks on the new button
   * @private
   */
  _onNewClick () {
    if (this.context.options.webcam !== false && !Utils.isMobile()) {
      this.props.app.switchToSplashScreen()
    } else {
      this._fileLoader.open()
    }
  }

  /**
   * Gets called when the user clicks the export button
   * @private
   */
  _onExportClick () {
    const { options } = this.context
    const exportOptions = options.export

    this.switchToControls(OverviewControls, null, () => {
      const loadingModal = ModalManager.instance.displayLoading(this._t('loading.exporting'))

      // Give it some time to display the loading modal
      setTimeout(() => {
        this._editor.export(exportOptions.download)
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
    this._editor.undo()
  }

  /**
   * Gets called when the history has been changed
   * @private
   */
  _onHistoryUpdated () {
    this.forceUpdate()
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
   * Undos the last zoom
   * @param {Function} [callback]
   * @private
   */
  _undoZoom (callback) {
    if (this._previousZoom !== null) return

    // Couldn't come up with something clean here :(
    this._zoom(this._previousZoom, callback)
    this._previousZoom = null
  }

  /**
   * Zooms to the given level
   * @param {Number|String} zoom
   * @param {Function} [callback]
   * @private
   */
  _zoom (zoom, callback) {
    const canvasComponent = this.refs.canvas

    let newZoom = zoom
    const defaultZoom = canvasComponent.getDefaultZoom()
    if (zoom === 'auto' || newZoom === defaultZoom) {
      newZoom = defaultZoom
      zoom = 'auto'
    }

    const maxZoom = defaultZoom * 2
    const minZoom = canvasComponent.getMinimumZoom()
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))

    this._editor.setZoom(newZoom, zoom === 'auto')
    this._previousZoom = zoom

    this.setState({ zoom: newZoom }, () => {
      this._emitEvent(Constants.EVENTS.CANVAS_RENDER, undefined, () => {
        this._emitEvent(Constants.EVENTS.CANVAS_ZOOM_DONE)
        callback && callback()
      })
    })
  }

  /**
   * Gets called when the user clicked the zoom in button
   * @private
   */
  _onZoomIn () {
    this._zoom(this.state.zoom + 0.1)
  }

  /**
   * Gets called when the user clicked the zoom out button
   * @private
   */
  _onZoomOut () {
    this._zoom(this.state.zoom - 0.1)
  }

  // -------------------------------------------------------------------------- MISC

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
    } else if (controls === 'home') {
      newControls = OverviewControls
      this._previousControlsStack = []
    } else if (typeof controls === 'string') {
      const allControls = this.context.ui.getAvailableControls()
      newControls = allControls[controls]
    } else {
      newControls = controls
      this._previousControlsStack.push(this.state.controls)
    }

    // If the controls have an `onExit` method, call it
    // with the controls as `this`
    if (this.state.controls.onExit) {
      this.state.controls.onExit.call(
        this.refs.controls
      )
    }

    const initialState = newControls.getInitialSharedState &&
      newControls.getInitialSharedState(this._editor, state)
    const sharedState = new SharedState(initialState)

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

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Decides whether the undo button should be displayed
   * @return {Boolean}
   * @private
   */
  _showUndoButton () {
    return this._editor.historyAvailable()
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
      editorScreen: this,
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
        sharedState={this.state.sharedState}
        options={controlsOptions}
        ref='controls' />)
    }

    if (CanvasControls) {
      canvasControls = (<CanvasControls
        onSwitchControls={this.switchToControls}
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
  options: React.PropTypes.object.isRequired,
  editorScreen: React.PropTypes.object.isRequired
}
