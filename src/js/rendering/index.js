/* global PhotoEditorRendering */
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
import Texture from './textures/texture'
import Sprite from './sprites/sprite'
import Shader from './shaders/shader'

window.PhotoEditorRendering = {
  WebGLRenderer,
  CanvasRenderer,
  DisplayObject,
  Container,
  Texture,
  Sprite,
  Shader
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
    canvas
  })

  const container = new Container()

  const texture = Texture.fromImage(image)
  const sprite = new Sprite(texture)
  container.addChild(sprite)
  renderer.render(container)
}
