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
import CanvasFilterManager from './managers/canvas-filter-manager'
import WebGLFilterManager from './managers/webgl-filter-manager'
import DisplayObject from './display/display-object'
import Container from './display/container'
import BaseTexture from './textures/base-texture'
import Texture from './textures/texture'
import RenderTexture from './textures/render-texture'
import CanvasBuffer from './utils/canvas-buffer'
import Sprite from './sprites/sprite'
import Shaders from './shaders/'
import Shader from './shaders/shader'
import Filter from './filters/filter'

/**
 * @namespace PhotoEditorSDK.Engine
 */
export default {
  WebGLRenderer,
  CanvasRenderer,
  WebGLFilterManager,
  CanvasFilterManager,
  DisplayObject,
  Container,
  BaseTexture,
  Texture,
  RenderTexture,
  CanvasBuffer,
  Sprite,
  Shaders,
  Shader,
  Filter,
  autoDetectRenderer: function (width, height, options = {}) {
    if (WebGLRenderer.isSupported()) {
      return new WebGLRenderer(width, height, options)
    } else {
      return new CanvasRenderer(width, height, options)
    }
  }
}
