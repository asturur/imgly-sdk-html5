/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Shader from './shader'
import Utils from '../utils/utils'

export default class TextureShader extends Shader {
  constructor (renderer, vertexSource, fragmentSource, customUniforms, customAttributes) {
    // @TODO: Directly require Matrix when this has been merged into the SDK
    const matrix = new PhotoEditorSDK.Matrix()

    const uniforms = Utils.extend({
      u_image: {
        type: 'sampler2d',
        value: 0
      },
      u_projMatrix: {
        type: 'mat3',
        value: matrix.toArray()
      }
    }, customUniforms)

    const attributes = [
      'a_position',
      'a_texCoord'
    ].concat(customAttributes)

    vertexSource = vertexSource || require('raw!./source/texture.vert')
    fragmentSource = fragmentSource || require('raw!./source/texture.frag')

    super(renderer, vertexSource, fragmentSource, uniforms, attributes)
  }
}
