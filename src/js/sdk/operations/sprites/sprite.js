/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2, Engine, Utils, Configurable } from '../../globals'

export default class Sprite extends Configurable {
  constructor (operation, options) {
    super(options)
    this._operation = operation
    this._dirtiness = {}
    this.id = Utils.getUUID()

    this._identitySprite = new Engine.Sprite()
    this._sprite = new Engine.Sprite()

    if (this._options.adjustments) {
      this._onOptionsChange = this._onOptionsChange.bind(this)
      this._options.adjustments.on('updated', this._onOptionsChange)
    }
  }

  // -------------------------------------------------------------------------- EVENTS

  /**
   * Gets called when options have been changed. Sets this operation to dirty.
   * @private
   */
  _onOptionsChange () {
    const dirtiness = this._dirtiness
    for (let id in dirtiness) {
      dirtiness[id] = true
    }
  }

  /**
   * Returns the DisplayObject of this Sprite
   * @return {Engine.Sprite}
   */
  getDisplayObject () {
    return this._sprite
  }

  /**
   * Renders this sprite
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise}
   */
  update (sdk) {
    const outputSprite = sdk.getSprite()
    const outputBounds = outputSprite.getBounds()

    this._sprite.setAnchor(this._options.anchor)
    this._sprite.setPosition(this._options.position.clone()
      .multiply(outputBounds.width, outputBounds.height)
    )

    if (this._options.scale) {
      this._sprite.setScale(this._options.scale)
    }
    this._sprite.updateTransform()

    const frame = this._sprite.getTexture().getFrame()
    const spriteDimensions = new Vector2(frame.width, frame.height)

    this._sprite.setPivot(this._options.pivot.clone().multiply(spriteDimensions))
    this._sprite.setRotation(this._options.rotation)

    return Promise.resolve()
  }

  /**
   * Checks if this operation is dirty for the given renderer
   * @param  {BaseRenderer}  renderer
   * @return {Boolean}
   */
  isDirtyForRenderer (renderer) {
    if (!(renderer.id in this._dirtiness)) {
      this._dirtiness[renderer.id] = true
    }
    return this._dirtiness[renderer.id]
  }

  /**
   * Sets the dirtiness for the given renderer
   * @param {Boolean} dirty
   * @param {BaseRenderer} renderer
   */
  setDirtyForRenderer (dirty, renderer) {
    this._dirtiness[renderer.id] = dirty
  }

  /**
   * Sets the dirtiness for all renderers
   * @param {Boolean} dirty
   */
  setDirty (dirty) {
    for (let rendererId in this._dirtiness) {
      this._dirtiness[rendererId] = dirty
    }
  }

  /**
   * Cleans up this Sprite
   */
  dispose () {
    if (this._options.adjustments) {
      this._options.adjustments.off('updated', this._onOptionsChange)
    }
  }
}
