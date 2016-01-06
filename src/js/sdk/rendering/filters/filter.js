/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Shader from '../shaders/shader'
import TextureShader from '../shaders/texture-shader'

export default class Filter {
  constructor (vertexSource, fragmentSource, uniforms, attributes) {
    this._shaders = []
    this._uniforms = uniforms || TextureShader.defaultUniforms
    this._attributes = attributes || TextureShader.defaultAttributes
    this._vertexSource = vertexSource || TextureShader.defaultVertexSource
    this._fragmentSource = fragmentSource || TextureShader.defaultFragmentSource
  }

  /**
   * Returns the shader for the given renderer
   * @param  {WebGLRenderer} renderer
   * @return {Shader}
   */
  getShaderForRenderer (renderer) {
    const gl = renderer.getContext()
    let shader = this._shaders[gl.id]

    if (!shader) {
      shader = new Shader(renderer,
        this._vertexSource,
        this._fragmentSource,
        this._uniforms,
        this._attributes
      )

      this._shaders[gl.id] = shader
    }

    return shader
  }

  /**
   * Applies this filter to the given inputTarget and renders it to
   * the given outputTarget
   * @param  {WebGLRenderer} renderer
   * @param  {RenderTarget} inputTarget
   * @param  {RenderTarget} outputTarget
   * @param  {Boolean} clear = false
   */
  apply (renderer, inputTarget, outputTarget, clear = false) {
    const gl = renderer.getContext()
    const shader = this.getShaderForRenderer(renderer)

    renderer.setRenderTarget(outputTarget)
    if (clear) {
      outputTarget.clear()
    }

    renderer.setShader(shader)

    const projectionMatrix = renderer.getCurrentRenderTarget().getProjectionMatrix().toArray()
    shader.setUniform('u_projMatrix', projectionMatrix)
    shader.syncUniform('u_projMatrix')

    // Render!
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, inputTarget.getTexture())
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }
}
