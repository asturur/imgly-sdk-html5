/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import CanvasRenderer from './renderers/canvas/canvas-renderer'
import WebGLRenderer from './renderers/webgl/webgl-renderer'
import DisplayObject from './display/display-object'
import Container from './display/container'
import BaseTexture from './textures/base-texture'
import Texture from './textures/texture'
import RenderTexture from './textures/render-texture'
import Sprite from './sprites/sprite'
import Shaders from './shaders/'
import Shader from './shaders/shader'
import Filter from './filters/filter'

window.PhotoEditorRendering = {
  WebGLRenderer,
  CanvasRenderer,
  DisplayObject,
  Container,
  BaseTexture,
  Texture,
  RenderTexture,
  Sprite,
  Shaders,
  Shader,
  Filter
}

// -------------------------------------------------------------------------- EXAMPLE

const image = new window.Image()
image.addEventListener('load', () => {
  run()
})
image.src = 'test.jpg'

function run () {
  const canvas = document.querySelector('canvas')
  const renderer = new WebGLRenderer(800, 600, {
    canvas,
    pixelRatio: window.devicePixelRatio ? window.devicePixelRatio : 1
  })

  class RedFilter extends Filter {
    constructor () {
      const fragmentSource = `
        precision lowp float;
        uniform sampler2D u_image;
        varying vec2 v_texCoord;
        varying vec4 v_color;

        void main() {
          vec4 color = texture2D(u_image, v_texCoord);
          color.r = 1.0;
          gl_FragColor = color;
        }
      `

      super(null, fragmentSource)
    }
  }

  const container = new Container()

  const texture = Texture.fromImage(image)
  const sprite = new Sprite(texture)
  container.addChild(sprite)

  const renderTexture = new RenderTexture(renderer, 300, 300)
  renderTexture.render(container)

  const newSprite = new Sprite(renderTexture)
  newSprite.addFilter(new RedFilter())

  const newContainer = new Container()
  newContainer.addChild(newSprite)

  renderer.render(newContainer)
  setTimeout(() => {
    renderer.render(newContainer)
  }, 1000)
}
