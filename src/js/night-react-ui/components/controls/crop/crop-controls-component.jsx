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

import { Utils, ReactBEM, Vector2 } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'

// Specifies the default distance to the border
// when selecting a ratio
const PADDING = 0.1

export default class OrientationControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._hasDoneButton = true
    this._bindAll(
      '_selectRatio'
    )

    this._operation = this.getSharedState('operation')

    this.state = { ratio: null }
    this._initRatios()
  }

  // -------------------------------------------------------------------------- INITIALIZATION

  /**
   * Initializes the available ratios
   * @private
   */
  _initRatios () {
    let { additionalRatios, replaceRatios, selectableRatios } = this.props.options
    additionalRatios = additionalRatios || []

    this._ratios = [
      { name: 'custom', ratio: '*', selected: true },
      { name: 'square', ratio: 1 },
      { name: '4-3', ratio: 1.33 },
      { name: '16-9', ratio: 1.77 }
    ]

    if (replaceRatios) {
      this._ratios = additionalRatios
    } else {
      this._ratios = this._ratios.concat(additionalRatios)
    }

    if (selectableRatios && selectableRatios.length) {
      this._ratios = Utils.select(this._ratios, selectableRatios, r => r.name)
    }
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component has been mounted
   */
  componentDidMount () {
    super.componentDidMount()

    this.setSharedState({
      start: this._operation.getStart().clone(),
      end: this._operation.getEnd().clone()
    }, false)

    // Make sure we see the whole image
    this._operation.set({
      start: new Vector2(0, 0),
      end: new Vector2(1, 1)
    })

    // Reset zoom to fit the container
    const { editor } = this.context
    editor.setZoom('auto', () => {
      // Disable zoom and drag while we're cropping
      editor.disableFeatures('zoom', 'drag')

      if (!this.getSharedState('operationExistedBefore')) {
        // Select first ratio as default (for now)
        this._selectInitialRatio()
      } else {
        // Canvas has been rendered, dimensions might have changed. Make sure
        // that the canvas controls are rendered again (to match the new dimensions)
        this.props.sharedState.broadcastUpdate()
      }
    })
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    const { editor } = this.context

    if (this.getSharedState('operationExistedBefore')) {
      const initialOptions = this.getSharedState('initialOptions')
      this._operation.set(initialOptions)
    } else {
      editor.removeOperation(this._operation)
    }

    editor.undoZoom()
    editor.enableFeatures('zoom', 'drag')

    super._onBackClick(e)
  }

  /**
   * Gets called when the user clicks the done button
   * @param {Event} e
   * @private
   */
  _onDoneClick (e) {
    const { editor } = this.context

    const newOptions = {
      start: this.getSharedState('start'),
      end: this.getSharedState('end')
    }
    const initialOptions = this.getSharedState('initialOptions')

    const optionsChanged = (!newOptions.start.equals(initialOptions.start) ||
      !newOptions.end.equals(initialOptions.end))

    // Update operation options
    this._operation.set(newOptions)

    if (optionsChanged) {
      editor.addHistory(this._operation,
        this.getSharedState('initialOptions'),
        this.getSharedState('operationExistedBefore'))
    }

    // Enable zoom and drag again
    editor.enableFeatures('zoom', 'drag')

    // Zoom to auto again
    editor.setZoom('auto')

    super._onDoneClick(e)
  }

  // -------------------------------------------------------------------------- RATIO HANDLING

  /**
   * Selects the initial ratio
   * @private
   */
  _selectInitialRatio () {
    let selectedRatio = null

    // 1. Selected ratio stored in operation
    const operationRatio = this._operation._ratio
    if (operationRatio) {
      const matchingRatios = this._ratios.filter((ratio) => ratio.ratio === operationRatio)
      selectedRatio = matchingRatios[0]
    }

    // 2. First ratio with `selected` flag
    if (!selectedRatio) {
      const selectedRatios = this._ratios.filter((ratio) => ratio.selected)
      selectedRatio = selectedRatios.pop()
    }

    // 3. First ratio
    if (!selectedRatio) {
      selectedRatio = this._ratios[0]
    }

    return this._selectRatio(selectedRatio)
  }

  /**
   * Selects the given ratio
   * @param {String} ratio
   * @private
   */
  _selectRatio (ratio) {
    this._setDefaultOptionsForRatio(ratio)
    this._operation._ratio = ratio.ratio
    this.setSharedState({ ratio })
  }

  /**
   * Sets the default options (start / end) for the given ratio
   * @param {Object} ratio
   * @private
   */
  _setDefaultOptionsForRatio ({ ratio, name }) {
    const { editor } = this.context
    let start = new Vector2()
    let end = new Vector2()

    if (ratio === '*') {
      start = new Vector2(PADDING, PADDING)
      end = new Vector2(1, 1).subtract(PADDING)
    } else {
      const outputDimensions = editor.getOutputDimensions()
      const canvasRatio = outputDimensions.x / outputDimensions.y
      if (canvasRatio <= ratio) {
        const height = 1 / outputDimensions.y * (outputDimensions.x / ratio * (1.0 - PADDING * 2))
        start.set(PADDING, (1.0 - height) / 2)
        end.set(1.0 - PADDING, 1 - start.y)
      } else {
        const width = 1 / outputDimensions.x * (ratio * outputDimensions.y * (1.0 - PADDING * 2))
        start.set((1 - width) / 2, PADDING)
        end.set(1 - start.x, 1.0 - PADDING)
      }
    }

    this.setSharedState({ start, end })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._ratios.map((ratio) => {
      return (<li
        bem='e:item'
        key={ratio.name}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel'
            className={this._operation._ratio === ratio.ratio ? 'is-active' : null}
            onClick={this._selectRatio.bind(this, ratio)}>
              <img bem='e:icon' src={this._getAssetPath(`controls/crop/${ratio.name}@2x.png`, true)} />
              <div bem='e:label'>{this._t(`controls.crop.${ratio.name}`)}</div>
          </div>
        </bem>
      </li>)
    })

    return (
      <div bem='e:cell m:list'>
        <ScrollbarComponent>
          <ul bem='$e:list'>
            {listItems}
          </ul>
        </ScrollbarComponent>
      </div>
    )
  }
}
