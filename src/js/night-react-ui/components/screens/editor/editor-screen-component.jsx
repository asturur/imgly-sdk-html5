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
import ScreenComponent from '../screen-component'
import HeaderComponent from '../../header-component'
import EditorSubHeaderComponent from './editor-sub-header-component'
import CanvasComponent from './canvas-component'
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
      '_onHistoryUpdated',
      '_onDisableFeatures',
      '_onEnableFeatures',
      '_onUndoClick',
      '_onWindowResize',
      '_onWindowResizeDone',
      '_onImageResize',
      '_onNewImage'
    )

    this._previousControlsStack = []
    this.state = {
      zoom: null,
      controls: OverviewControls,
      zoomEnabled: true,
      dragEnabled: true
    }

    this._events = {
      [Constants.EVENTS.EDITOR_DISABLE_FEATURES]: this._onDisableFeatures,
      [Constants.EVENTS.EDITOR_ENABLE_FEATURES]: this._onEnableFeatures,
      [Constants.EVENTS.HISTORY_UPDATED]: this._onHistoryUpdated
    }

    this._editor = new Editor(this.context.options, this.context.mediator)
    this._editor.on('new-image', this._onNewImage)
    this._editor.on('ready', this._startEditor)
    this._editor.on('resize', this._onImageResize)
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

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
  }

  /**
   * Sets the zoom level and starts the editor rendering
   * @private
   */
  _startEditor () {
    this._editor.start()
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the image has been changed
   * @private
   */
  _onNewImage () {
    this.switchToControls(OverviewControls)
  }

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

    return (<div bem='b:screen'>
      <HeaderComponent />
      <div bem='$b:editorScreen'>
        <EditorSubHeaderComponent
          app={this.props.app} />

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
