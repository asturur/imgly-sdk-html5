/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Operation from './operation'
import IdentityFilter from './filters/identity-filter'

/**
 * An operation that can apply a selected filter
 * @class
 * @extends PhotoEditorSDK.Operation
 * @memberof PhotoEditorSDK.Operations
 */
class FilterOperation extends Operation {
  /**
   * Renders this operation
   * @param {PhotoEditorSDK} sdk
   * @return {Promise}
   * @private
   */
  _render (sdk) {
    return this._selectedFilter.render(sdk, this._getRenderTexture(sdk))
  }

  /**
   * Applies this operation
   * @param  {PhotoEditorSDK} sdk
   * @return {Promise}
   * @abstract
   */
  render (sdk) {
    if (!this.getEnabled() || this._selectedFilter.constructor.isIdentity) {
      return Promise.resolve()
    }

    super.render(sdk)
  }

  /**
   * Sets the dirtiness for the given renderer
   * @param {Boolean} dirty
   * @param {PhotoEditorSDK.Engine.BaseRenderer} renderer
   */
  setDirtyForRenderer (dirty, renderer) {
    super.setDirtyForRenderer(dirty, renderer)
    this._selectedFilter.setDirtyForRenderer(dirty, renderer)
  }
}

/**
 * A unique string that identifies this operation. Can be used to select
 * operations.
 * @type {String}
 */
FilterOperation.identifier = 'filter'

/**
 * Specifies the available options for this operation
 * @type {Object}
 */
FilterOperation.prototype.availableOptions = {
  intensity: {
    type: 'number',
    default: 1,
    setter: function (intensity) {
      this._selectedFilter &&
        this._selectedFilter.setIntensity(intensity)
      return intensity
    }
  },
  filter: { type: 'object', default: IdentityFilter,
    setter: function (Filter) {
      if (this._selectedFilter) {
        this._selectedFilter.dispose()
        this._selectedFilter = null
      }
      this._selectedFilter = new Filter(this._options.intensity)
      return Filter
    }
  }
}

export default FilterOperation
