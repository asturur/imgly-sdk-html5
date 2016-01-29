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

const ALIGNMENTS = [
  'left',
  'center',
  'right'
]

import { ReactBEM, Constants } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'
import ColorPickerComponent from '../../color-picker/color-picker-component'
import SliderOverlayComponent from '../slider-overlay-component'
import FontPreviewComponent from './font-preview-component'
import FontComponent from './font-component'

export default class TextControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onFontSizeChange',
      '_onFontChange',
      '_onAlignmentClick',
      '_onForegroundColorChange',
      '_onBackgroundColorChange'
    )
    this._texts = this.getSharedState('texts')
    this._operation = this.getSharedState('operation')

    this.state = { mode: null }

    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
    this._initFonts()
  }

  // -------------------------------------------------------------------------- INITIALIZATIOn

  /**
   * Initializes the available fonts
   * @private
   */
  _initFonts () {
    const additionalFonts = this.props.options.fonts || []
    const replaceFonts = !!this.props.options.replaceFonts
    const fonts = [
      { fontFamily: 'Helvetica', fontWeight: 'normal' },
      { fontFamily: 'Verdana', fontWeight: 'normal' },
      { fontFamily: 'Times New Roman', fontWeight: 'normal' },
      { fontFamily: 'Impact', fontWeight: 'normal' }
    ]

    if (replaceFonts) {
      this._fonts = additionalFonts
    } else {
      this._fonts = fonts.concat(additionalFonts)
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    // Reset zoom to fit the container
    this._emitEvent(Constants.EVENTS.CANVAS_ZOOM, 'auto', () => {
      // Disable zoom and drag while we're cropping
      this._emitEvent(Constants.EVENTS.EDITOR_DISABLE_FEATURES, ['zoom', 'drag'])
    })
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this._operation.setTexts(this._texts)
    this._emitEvent(Constants.EVENTS.CANVAS_RENDER)
    super._onBackClick()
  }

  /**
   * Gets called when the shared state has changed
   * @param  {Object} newState
   */
  sharedStateDidChange (newState) {
    if ('selectedSprite' in newState) {
      this.forceUpdate()
    }
  }

  /**
   * Gets called when the font size has been changed
   * @param  {Number} fontSize
   * @private
   */
  _onFontSizeChange (fontSize) {
    const { editor } = this.context
    const getOutputDimensions = editor.getOutputDimensions()

    const selectedText = this.getSharedState('selectedSprite')
    selectedText.setFontSize(fontSize / getOutputDimensions.y)
    this.forceSharedUpdate()
  }

  /**
   * Gets called when the font family or weight has been changed
   * @param  {Object} font
   * @private
   */
  _onFontChange (font) {
    const selectedText = this.getSharedState('selectedSprite')
    selectedText.setFontFamily(font.fontFamily)
    selectedText.setFontWeight(font.fontWeight)
    this.forceSharedUpdate()
  }

  /**
   * Gets called when the user clicks the alignment button
   * @param  {Event} e
   * @private
   */
  _onAlignmentClick (e) {
    const selectedText = this.getSharedState('selectedSprite')
    const alignment = selectedText.getAlignment()

    const currentIndex = ALIGNMENTS.indexOf(alignment)
    const nextIndex = (currentIndex + 1) % ALIGNMENTS.length
    const newAlignment = ALIGNMENTS[nextIndex]

    selectedText.setAlignment(newAlignment)
    this.forceSharedUpdate()
  }

  /**
   * Gets called when the user changes the foreground color
   * @param  {Color} color
   * @private
   */
  _onForegroundColorChange (color) {
    const selectedText = this.getSharedState('selectedSprite')
    selectedText.setColor(color)
    this.forceSharedUpdate()
  }

  /**
   * Gets called when the user changes the background color
   * @param  {Color} color
   * @private
   */
  _onBackgroundColorChange (color) {
    const selectedText = this.getSharedState('selectedSprite')
    selectedText.setBackgroundColor(color)
    this.forceSharedUpdate()
  }

  // -------------------------------------------------------------------------- MODES

  /**
   * Switches to the given mode
   * @param  {String} mode
   * @private
   */
  _switchToMode (mode) {
    if (mode === this.state.mode) mode = null

    this.setState({ mode })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the overlay controls of this component
   * @return {ReactBEM.Element}
   */
  renderOverlayControls () {
    switch (this.state.mode) {
      case 'size':
        return this._renderFontSizeOverlayControl()
      case 'font':
        return this._renderFontFamilyOverlayControl()
      default:
        return null
    }
  }

  // -------------------------------------------------------------------------- FONT SIZE

  /**
   * Renders the font size overlay control (slider)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderFontSizeOverlayControl () {
    const selectedText = this.getSharedState('selectedSprite')
    if (!selectedText) return

    const { editor } = this.context
    const zoom = editor.getSDK().getZoom()
    const outputDimensions = editor.getOutputDimensions()

    const maxFontSize = Math.round(outputDimensions.y * zoom)
    const fontSize = Math.round(selectedText.getFontSize() * outputDimensions.y)
    return (<SliderOverlayComponent
      value={fontSize}
      maxValue={maxFontSize}
      label={this._t('controls.text.size')}
      onChange={this._onFontSizeChange} />)
  }

  /**
   * Renders the font size list item
   * @return {Component}
   * @private
   */
  _renderSizeItem () {
    const selectedText = this.getSharedState('selectedSprite')
    if (!selectedText) return

    const { editor } = this.context
    const outputDimensions = editor.getOutputDimensions()

    const fontSize = Math.round(selectedText.getFontSize() * outputDimensions.y)
    const className = this.state.mode === 'size' ? 'is-active' : null

    return (<li
      bem='e:item'
      key='size'>
      <bem specifier='$b:controls'>
        <div
          bem='$e:button m:withLabel'
          className={className}
          onClick={this._switchToMode.bind(this, 'size')}>
            <div bem='b:fontSize e:text'>{fontSize}</div>
            <div bem='e:label'>{this._t(`controls.text.size`)}</div>
        </div>
      </bem>
    </li>)
  }

  // -------------------------------------------------------------------------- FONT FAMILY

  /**
   * Renders the font family overlay control
   * @return {ReactBEM.Element}
   * @private
   */
  _renderFontFamilyOverlayControl () {
    const selectedText = this.getSharedState('selectedSprite')
    if (!selectedText) return

    return (<FontComponent
      fontFamily={selectedText.getFontFamily()}
      fontWeight={selectedText.getFontWeight()}
      fonts={this._fonts}
      onChange={this._onFontChange} />)
  }

  /**
   * Renders the font list item
   * @return {Component}
   * @private
   */
  _renderFontItem () {
    const selectedText = this.getSharedState('selectedSprite')
    if (!selectedText) return

    const className = this.state.mode === 'font' ? 'is-active' : null
    return (<li
      bem='e:item'
      key='font'>
      <bem specifier='$b:controls'>
        <div
          bem='$e:button m:withLabel'
          className={className}
          onClick={this._switchToMode.bind(this, 'font')}>
            <FontPreviewComponent
              fontFamily={selectedText.getFontFamily()}
              fontWeight={selectedText.getFontWeight()} />
            <div bem='e:label'>{this._t(`controls.text.font`)}</div>
        </div>
      </bem>
    </li>)
  }

  // -------------------------------------------------------------------------- ALIGNMENT

  /**
   * Renders the text alignment list item
   * @return {Component}
   * @private
   */
  _renderAlignmentItem () {
    const selectedText = this.getSharedState('selectedSprite')
    if (!selectedText) return

    const alignment = selectedText.getAlignment()

    return (<li
      bem='e:item'
      key='alignment'>
      <bem specifier='$b:controls'>
        <div
          bem='$e:button m:withLabel'
          onClick={this._onAlignmentClick}>
            <img bem='e:icon' src={this._getAssetPath(`controls/text/align_${alignment}@2x.png`, true)} />
            <div bem='e:label'>{this._t(`controls.text.alignment`)}</div>
        </div>
      </bem>
    </li>)
  }

  /**
   * Renders this component
   * @return {Array.<ReactBEM.Element>}
   */
  renderControls () {
    const listItems = [
      this._renderSizeItem(),
      this._renderFontItem(),
      this._renderAlignmentItem()
    ]

    const selectedText = this.getSharedState('selectedSprite')

    const foregroundColor = selectedText.getColor().clone()
    const backgroundColor = selectedText.getBackgroundColor().clone()

    return [
      (<div bem='e:cell m:list'>
        <ScrollbarComponent ref='scrollbar'>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>),
      (<div bem='e:cell m:colorPicker'>
        <ColorPickerComponent
          initialValue={foregroundColor}
          label={this._t('controls.text.foreground')}
          onChange={this._onForegroundColorChange} />
      </div>),
      (<div bem='e:cell m:colorPicker'>
        <ColorPickerComponent
          initialValue={backgroundColor}
          label={this._t('controls.text.background')}
          onChange={this._onBackgroundColorChange} />
      </div>)
    ]
  }
}
