/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { Log } from '../globals'
import DisplayObject from './display-object'

/**
 * A container for DisplayObject instances
 * @class
 * @extends PhotoEditorSDK.Engine.DisplayObject
 * @memberof PhotoEditorSDK.Engine
 */
class Container extends DisplayObject {
  /**
   * Creates a Container
   * @override
   */
  constructor (...args) {
    super(...args)

    this._children = []
    this._filters = []
  }

  /**
   * Adds the given filter to the filter stack
   * @param {PhotoEditorSDK.Engine.Filter} filter
   */
  addFilter (filter) {
    this._filters.push(filter)
  }

  /**
   * Removes the given filter from the filter stack
   * @param  {PhotoEditorSDK.Engine.Filter} filter
   * @return {Boolean} - Whether the filter has been removed
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
   * @param {Array.<PhotoEditorSDK.Engine.Filter>} filters
   */
  setFilters (filters) {
    this._filters = filters
  }

  /**
   * Adds the given DisplayObject to the list of children
   * @param {PhotoEditorSDK.Engine.DisplayObject} child
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
   * Checks whether this container has the given child
   * @param  {PhotoEditorSDK.Engine.DisplayObject}  child
   * @return {Boolean}
   */
  hasChild (child) {
    const index = this._children.indexOf(child)
    return index !== -1
  }

  /**
   * Removes the given object from the list of children
   * @param  {PhotoEditorSDK.Engine.DisplayObject} child
   */
  removeChild (child) {
    const index = this._children.indexOf(child)
    if (index !== -1) {
      this._children.splice(index, 1)
    } else {
      Log.info(this.constructor.name, 'Tried to remove a child that does not exist')
    }
  }

  /**
   * Removes all children
   */
  clearChildren () {
    this._children = []
  }

  /**
   * Renders this DisplayObject using the given WebGLRenderer
   * @param  {PhotoEditorSDK.Engine.WebGLRenderer} renderer
   * @override
   */
  renderWebGL (renderer) {
    if (!this._visible) {
      return
    }

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
   * Renders the contents of this container
   * @param {PhotoEditorSDK.Engine.WebGLRenderer} renderer
   * @protected
   */
  _renderWebGL (renderer) {

  }

  /**
   * Renders this DisplayObject using the given CanvasRenderer
   * @param  {PhotoEditorSDK.Engine.CanvasRenderer} renderer
   * @override
   */
  renderCanvas (renderer) {
    if (!this._visible) {
      return
    }

    const filterManager = renderer.getFilterManager()
    if (this._filters && this._filters.length) {
      filterManager.pushFilters(this, this._filters)
    }

    this._renderCanvas(renderer)
    this._children.forEach((child) => {
      child.renderCanvas(renderer)
    })

    if (this._filters && this._filters.length) {
      filterManager.popFilters()
    }
  }

  /**
   * Renders the contents of this container
   * @param {PhotoEditorSDK.Engine.CanvasRenderer} renderer
   * @protected
   */
  _renderCanvas (renderer) {

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
   * Returns the non-global bounds of this DisplayObject
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getLocalBounds () {
    if (this._localBoundsNeedUpdate) {
      // @TODO Calculate bounds by looking at children
      this._localBoundsNeedUpdate = false
    }
    return this._localBounds.clone()
  }

  /**
   * Returns the bounds for this DisplayObject
   * @return {PhotoEditorSDK.Math.Rectangle}
   */
  getBounds () {
    if (this._boundsNeedUpdate) {
      // @TODO Calculate bounds by looking at children
      this._boundsNeedUpdate = false
    }
    return this._bounds.clone()
  }

  /**
   * Returns this Container's children
   * @return {PhotoEditorSDK.Engine.DisplayObject[]}
   */
  getChildren () { return this._children }

  /**
   * Returns this Container's filters
   * @return {PhotoEditorSDK.Engine.Filter[]}
   */
  getFilters () { return this._filters }

  /**
   * Disposes this Container
   */
  dispose () {

  }
}

export default Container
