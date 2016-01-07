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
    this._filters = []
    this._boundsNeedUpdate = true
  }

  /**
   * Adds the given filter to the filter stack
   * @param {Filter} filter
   */
  addFilter (filter) {
    this._filters.push(filter)
  }

  /**
   * Removes the given filter from the filter stack
   * @param  {Filter} filter
   * @return {Boolean} Has the filter been removed?
   */
  removeFilter (filter) {
    const index = this._filters.indexOf(filter)
    if (index !== -1) {
      this._filters.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Sets the filters
   * @param {Array.<Filter>} filters
   */
  setFilters (filters) {
    this._filters = filters
  }

  /**
   * Adds the given DisplayObject to the list of children
   * @param {DisplayObject} child
   */
  addChild (child) {
    // Remove from previous parent
    const originalParent = child.getParent()
    if (originalParent !== null) {
      originalParent.removeChild(child)
    }

    child.setParent(this)
    this._children.push(child)
  }

  /**
   * Renders this DisplayObject using the given WebGLRenderer
   * @param  {WebGLRenderer} renderer
   * @override
   */
  renderWebGL (renderer) {
    const filterManager = renderer.getFilterManager()
    if (this._filters && this._filters.length) {
      filterManager.pushFilters(this, this._filters)
    }

    renderer.getCurrentObjectRenderer().start()

    this._renderWebGL(renderer)

    this._children.forEach((child) => {
      child.renderWebGL(renderer)
    })

    renderer.getCurrentObjectRenderer().flush()

    if (this._filters && this._filters.length) {
      filterManager.popFilters()
    }
    renderer.getCurrentObjectRenderer().start()
  }

  /**
   * Updates the world transform for this DisplayObject
   */
  updateTransform () {
    super.updateTransform()
    this._children.forEach((child) => {
      child.updateTransform()
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

  /**
   * Returns the bounds for this DisplayObject
   * @return {Rectangle}
   */
  getBounds () {
    if (this._boundsNeedUpdate) {
      // @TODO Calculate bounds by looking at children
      this._boundsNeedUpdate = false
    }
    return this._bounds
  }

  getChildren () { return this._children }
  getFilters () { return this._filters }
}
