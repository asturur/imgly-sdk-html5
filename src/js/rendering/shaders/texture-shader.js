/* global PhotoEditorSDK */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

// @TODO
const { Matrix } = PhotoEditorSDK
import Shader from './shader'

export default class TextureShader extends Shader {
  constructor (renderer, vertexSource, fragmentSource) {
    vertexSource = vertexSource || TextureShader.defaultVertexSource
    fragmentSource = fragmentSource || TextureShader.defaultFragmentSource

    super(renderer, vertexSource, fragmentSource,
      TextureShader.defaultUniforms,
      TextureShader.defaultAttributes)
  }
}

TextureShader.defaultVertexSource = require('raw!./source/texture.vert')
TextureShader.defaultFragmentSource = require('raw!./source/texture.frag')

const matrix = new Matrix()
TextureShader.defaultUniforms = {
  u_image: {
    type: 'sampler2d',
    value: 0
  },
  u_projMatrix: {
    type: 'mat3',
    value: matrix.toArray()
  }
}
TextureShader.defaultAttributes = [
  'a_position',
  'a_texCoord',
  'a_color'
]
