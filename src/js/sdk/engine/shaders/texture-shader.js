/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Matrix } from '../globals'
import Shader from './shader'

/**
 * The default texture shader
 * @class
 * @alias Engine.TextureShader
 * @extends PhotoEditorSDK.Engine.Shader
 * @memberof PhotoEditorSDK
 */
class TextureShader extends Shader {
  /**
   * Creates a TextureShader
   * @param  {PhotoEditorSDK.Engine.BaseRenderer} renderer
   * @param  {String} vertexSource
   * @param  {String} fragmentSource
   */
  constructor (renderer, vertexSource, fragmentSource) {
    vertexSource = vertexSource || TextureShader.defaultVertexSource
    fragmentSource = fragmentSource || TextureShader.defaultFragmentSource

    super(renderer, vertexSource, fragmentSource,
      TextureShader.defaultUniforms,
      TextureShader.defaultAttributes)
  }
}

/**
 * The default vertex shader source code
 * @type {String}
 */
TextureShader.defaultVertexSource = require('raw!./source/texture.vert')

/**
 * The default fragment shader source code
 * @type {String}
 */
TextureShader.defaultFragmentSource = require('raw!./source/texture.frag')

const matrix = new Matrix()

/**
 * The default uniforms
 * @type {Object}
 */
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

/**
 * The default WebGL attributes
 * @type {String[]}
 */
TextureShader.defaultAttributes = [
  'a_position',
  'a_texCoord',
  'a_color'
]

export default TextureShader
