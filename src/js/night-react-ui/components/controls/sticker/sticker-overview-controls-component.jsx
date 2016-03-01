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

import { Utils, Constants, ReactBEM, Vector2 } from '../../../globals'
import ControlsComponent from '../controls-component'
import ScrollbarComponent from '../../scrollbar-component'
import ModalManager from '../../../lib/modal-manager'

export default class StickerOverviewControlsComponent extends ControlsComponent {
  constructor (...args) {
    super(...args)

    this._bindAll(
      '_onStickerMouseLeave',
      '_renderTooltipCanvas'
    )

    this._operation = this.getSharedState('operation')
    this._sprites = this.getSharedState('sprites')
    this._stickers = this.getSharedState('stickers')

    this._availableStickers = []
    this._initStickers(this.props.options.additionalStickers)

    this.state = {}
  }

  // -------------------------------------------------------------------------- LIFECYCLE

  /**
   * Gets called when this component is mounted
   */
  componentDidMount () {
    super.componentDidMount()

    if (this.props.options.stickersJSONPath) {
      this._loadExternalStickers()
    } else {
      this._renderStickers()
    }
  }

  // -------------------------------------------------------------------------- EXTERNAL STICKER LOADING

  /**
   * Loads the stickers from an external JSON source
   * @private
   */
  _loadExternalStickers () {
    // Display loading modal after 100ms
    let loadingModal = null
    let loadTimeout = setTimeout(() => {
      loadingModal = ModalManager.instance.displayLoading(this._t('loading.loading'))
    }, 100)

    // Called when loading is done. Cancels the loading timeout
    // or closes the loadingModal in case it has been opened
    const doneLoading = () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }
      if (loadingModal) loadingModal.close()
    }

    // Make sure not to show any stickers
    this._availableStickers = []
    this.forceUpdate()

    const url = this.props.options.stickersJSONPath
    Utils.getJSONP(url)
      .then((result) => {
        doneLoading()

        this._initStickers(result.stickers)
        this.forceUpdate(() => {
          this.refs.scrollbar.update()
          this._renderStickers()
        })
      })
      .catch((e) => {
        doneLoading()

        const errorModal = ModalManager.instance.displayError(
          this._t('errors.loadingStickersFailed.title'),
          e.message
        )
        errorModal.on('close', () => { this.props.onBack() })
      })
  }

  // -------------------------------------------------------------------------- STICKER RENDERING

  /**
   * Renders the stickers on the canvas preview elements
   * @private
   */
  _renderStickers () {
    this._availableStickers.forEach((sticker, i) =>
      this._renderSticker(i, sticker)
    )
  }

  /**
   * Renders the sticker on the tooltip canvas
   * @private
   */
  _renderTooltipCanvas () {
    const { hoveredSticker } = this.state
    const image = new window.Image()
    image.addEventListener('load', () => {
      if (!this.state.tooltipVisible ||
          this.state.hoveredSticker !== hoveredSticker) {
        return
      }

      const canvas = this.refs.tooltipCanvas
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const context = canvas.getContext('2d')
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
      const drawSize = new Vector2(image.width, image.height)
        .multiply(scale)
      const drawPosition = new Vector2(canvas.width, canvas.height)
        .divide(2)
        .subtract(drawSize.clone().divide(2))

      context.drawImage(image,
        0, 0,
        image.width, image.height,
        drawPosition.x, drawPosition.y,
        drawSize.x, drawSize.y)
    })

    const resolvedStickerPath = this._getAssetPath((
      hoveredSticker.images.mediaMedium || hoveredSticker.images.mediaBase
    ).uri)
    image.src = resolvedStickerPath
  }

  /**
   * Renders the given sticker on the canvas with the given index
   * @param  {Number} index
   * @param  {Object} sticker
   * @private
   */
  _renderSticker (index, sticker) {
    const { editor } = this.context
    const sdk = editor.getSDK()

    const resolvedStickerPath = this._getAssetPath(sticker.images.mediaThumb.uri)
    const canvas = this.refs[`canvas-${index}`]

    const pixelRatio = sdk.getPixelRatio()
    canvas.width = canvas.offsetWidth * pixelRatio
    canvas.height = canvas.offsetHeight * pixelRatio

    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.style.height = `${canvas.offsetHeight}px`

    const context = canvas.getContext('2d')

    const image = new window.Image()
    image.addEventListener('load', () => {
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
      const drawSize = new Vector2(image.width, image.height)
        .multiply(scale)
      const drawPosition = new Vector2(canvas.width, canvas.height)
        .divide(2)
        .subtract(drawSize.clone().divide(2))

      context.drawImage(image,
        0, 0,
        image.width, image.height,
        drawPosition.x, drawPosition.y,
        drawSize.x, drawSize.y)
    })
    image.src = resolvedStickerPath
  }

  // -------------------------------------------------------------------------- STICKERS

  /**
   * Initializes the available stickers
   * @param {Object[]} [additionalStickers = []]
   * @private
   */
  _initStickers (additionalStickers = []) {
    let { replaceStickers, selectableStickers } = this.props.options
    let stickers = Constants.DEFAULTS.STICKERS

    if (replaceStickers) {
      this._availableStickers = additionalStickers
    } else {
      this._availableStickers = stickers.concat(additionalStickers)
    }

    if (selectableStickers && selectableStickers.length) {
      this._availableStickers = Utils.select(this._availableStickers, selectableStickers, r => r.name)
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when the user clicks the back button
   * @param {Event} e
   * @private
   */
  _onBackClick (e) {
    this.props.onBack()
  }

  /**
   * Gets called when a sticker has been clicked
   * @param  {Object} sticker
   * @private
   */
  _onStickerClick (sticker) {
    const resolvedStickerPath = this._getAssetPath(sticker.images.mediaBase.uri)
    const image = new window.Image()

    let loadingModal
    let loadTimeout = setTimeout(() => {
      loadingModal = ModalManager.instance.displayLoading(this._t('loading.loading'))
    }, 100)

    image.addEventListener('load', () => {
      if (loadingModal) loadingModal.close()
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }

      const { editor } = this.context
      const sticker = this._operation.createSticker({
        image,
        position: editor.getFinalDimensions().divide(2),
        scale: new Vector2(1.0, 1.0),
        rotation: 0
      })
      this._operation.addSprite(sticker)
      this._stickers.push(sticker)

      editor.render(() => {
        // Broadcast new state
        this.setSharedState({
          selectedSprite: sticker,
          sprites: this._sprites,
          stickers: this._stickers
        })
      })
    })

    image.addEventListener('error', () => {
      if (loadingModal) loadingModal.close()
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }

      ModalManager.instance.displayError(
        this._t('errors.imageLoadFail.title'),
        this._t('errors.imageLoadFail.text', { path: image.src })
      )
    })

    image.crossOrigin = 'Anonymous'
    image.src = resolvedStickerPath
  }

  /**
   * Gets called when the user starts hovering a sticker
   * @param  {String} stickerPath
   * @param  {Event} e
   * @private
   */
  _onStickerMouseEnter (stickerPath, e) {
    this.setState({
      tooltipVisible: true,
      hoveredSticker: stickerPath,
      hoveredStickerElement: e.currentTarget
    }, () => {
      this._renderTooltipCanvas()
      this._updateTooltipPosition()
    })
  }

  /**
   * Updates the tooltip position to match the currently hovered
   * sticker's position
   * @private
   */
  _updateTooltipPosition () {
    const el = this.state.hoveredStickerElement
    const parent = el.parentNode
    const boundingRect = el.getBoundingClientRect()
    const parentBoundingRect = parent.getBoundingClientRect()

    this.setState({
      tooltipPosition:
        boundingRect.left -
        parentBoundingRect.left +
        boundingRect.width * 0.5
    })
  }

  /**
   * Gets called when the user does no longer hover a sticker
   * @private
   */
  _onStickerMouseLeave () {
    this.setState({
      tooltipVisible: false,
      hoveredSticker: null
    })
  }

  // -------------------------------------------------------------------------- RENDERING

  /**
   * Renders the list items for this control
   * @return {Array.<ReactBEM.Element>}
   * @private
   */
  _renderListItems () {
    return this._availableStickers.map((sticker, i) => {
      const { options } = this.props

      const itemEvents = options.tooltips
        ? {
          onMouseEnter: this._onStickerMouseEnter.bind(this, sticker),
          onMouseLeave: this._onStickerMouseLeave
        }
        : null

      return (<li
        bem='e:item'
        key={sticker.name}
        onClick={this._onStickerClick.bind(this, sticker)}
        {...itemEvents}>
        <bem specifier='$b:controls'>
          <div bem='$e:button m:withLabel'>
            <canvas bem='e:canvas m:large' ref={`canvas-${i}`} />
          </div>
        </bem>
      </li>)
    })
  }

  /**
   * Renders the tooltip (if present)
   * @return {ReactBEM.Element}
   * @private
   */
  _renderTooltip () {
    const tooltipVisible = this.props.options.tooltips &&
      this.state.tooltipVisible

    const style = {
      left: this.state.tooltipPosition
    }

    return tooltipVisible
      ? (<div bem='e:cell m:empty'>
        <div bem='$b:stickersControls $e:tooltip'
          visible={this.state.tooltipVisible}
          style={style}>
          <canvas bem='e:canvas' ref='tooltipCanvas' />
        </div>
      </div>)
      : null
  }

  /**
   * Renders the controls of this component
   * @return {ReactBEM.Element}
   */
  renderControls () {
    const listItems = this._renderListItems()
    const tooltip = this._renderTooltip()

    return [tooltip, (<div bem='e:cell m:list'>
      <ScrollbarComponent ref='scrollbar'>
        <ul bem='$e:list'>
          {listItems}
        </ul>
      </ScrollbarComponent>
    </div>)]
  }
}
