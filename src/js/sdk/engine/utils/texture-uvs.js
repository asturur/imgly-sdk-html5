/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Vector2 } from '../globals'

/**
 * Represents the UV coordinates of a texture
 * @class
 * @memberof PhotoEditorSDK.Engine
 */
class TextureUVs {
  /**
   * Creates a TextureUVs instance
   */
  constructor () {
    this._uvs = [
      new Vector2(0, 0),
      new Vector2(1, 0),
      new Vector2(1, 1),
      new Vector2(0, 1)
    ]
  }

  /**
   * Updates the UVs based on the given baseframe
   * @param  {Rectangle} frame
   * @param  {Rectangle} baseFrame
   */
  update (frame, baseFrame) {
    // Upper left
    let uv = this._uvs[0]
    uv.x = frame.x / baseFrame.width
    uv.y = frame.y / baseFrame.height

    // Upper right
    uv = this._uvs[1]
    uv.x = (frame.x + frame.width) / baseFrame.width
    uv.y = frame.y / baseFrame.height

    // Lower right
    uv = this._uvs[2]
    uv.x = (frame.x + frame.width) / baseFrame.width
    uv.y = (frame.y + frame.height) / baseFrame.height

    // Lower left
    uv = this._uvs[3]
    uv.x = frame.x / baseFrame.width
    uv.y = (frame.y + frame.height) / baseFrame.height
  }

  /**
   * Returns the UV coordinates for the given index
   * @param  {Number} index
   * @return {PhotoEditorSDK.Math.Vector2}
   */
  getUVs (index) { return this._uvs[index] }
}

export default TextureUVs
