/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import DisplayObject from './display-object'

export default class Container extends DisplayObject {
  constructor (...args) {
    super(...args)

    this._children = []
  }

  /**
   * Adds the given DisplayObject to the list of children
   * @param {DisplayObject} child
   */
  addChild (child) {
    this._children.push(child)
  }

  /**
   * Renders this DisplayObject using the given WebGLRenderer
   * @param  {WebGLRenderer} renderer
   * @override
   */
  renderWebGL (renderer) {
    this._renderWebGL(renderer)

    this._children.forEach((child) => {
      child.renderWebGL(renderer)
    })
  }

  /**
   * Renders the contents of this container
   * @param {WebGLRenderer} renderer
   * @private
   * @abstract
   */
  _renderWebGL (renderer) {

  }
}
