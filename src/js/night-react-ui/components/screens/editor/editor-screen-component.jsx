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
const WINDOW_RESIZE_DELAY = 500

import { React, ReactBEM, Constants, SharedState, Log } from '../../../globals'
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
      '_onWindowResize',
      '_onWindowResizeDone',
      '_onImageResize',
      '_onNewImage',
      '_onRenderError'
    )

    this._previousControlsStack = []
    this.state = {
      zoom: null,
      controls: OverviewControls,
      dragEnabled: true
    }

    this._editor = new Editor(this.context.options, this.context.mediator)
    this._editor.on('new-image', this._onNewImage)
    this._editor.on('ready', this._startEditor)
    this._editor.on('resize', this._onImageResize)
    this._editor.on('render-error', this._onRenderError)
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called after this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this._editor.setImage(this.context.options.image)
    window.addEventListener('resize', this._onWindowResize)
  }

  /**
   * Gets called before this component is unmounted
   */
  componentWillUnmount () {
    super.componentWillUnmount()

    this._editor.dispose()

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
   * Gets called when an error occurred while rendering
   * @param  {Event} e
   * @private
   */
  _onRenderError (e) {
    ModalManager.instance.displayError(
      this._t('errors.renderingError.title'),
      this._t('errors.renderingError.text'),
      true
    )
    Log.error(this.constructor.name, 'An error occurred while rendering: ' + e.message)
    Log.printError(e)
  }

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

    this.context.mediator.emit(Constants.EVENTS.CONTROLS_SWITCHED, newControls)

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
    const ControlsComponent = this.state.controls.controlsComponent
    const controlsIdentifier = this.state.controls.identifier
    const controlsOptions = this.context.options.controlsOptions[controlsIdentifier] || {}
    let CanvasControlsComponent = this.state.controls.canvasControlsComponent
    if (!CanvasControlsComponent) {
      CanvasControlsComponent = OverviewControls.canvasControlsComponent
    }

    let controls, canvasControls

    if (ControlsComponent) {
      controls = (<ControlsComponent
        onSwitchControls={this.switchToControls}
        sharedState={this.state.sharedState}
        options={controlsOptions}
        ref='controls' />)
    }

    if (CanvasControlsComponent) {
      canvasControls = (<CanvasControlsComponent
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
