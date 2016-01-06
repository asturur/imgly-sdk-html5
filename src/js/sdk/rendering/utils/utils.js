/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default {
  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object for all destination properties that resolve to undefined. Once a
   * property is set, additional values of the same property are ignored.
   * @param  {Object} object
   * @param  {Object} ...sources
   * @return {Object}
   */
  defaults: (object, ...sources) => {
    // Shallow clone
    let newObject = {}
    for (let key in object) {
      newObject[key] = object[key]
    }

    // Clone sources
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i]
      for (let key in source) {
        if (typeof newObject[key] === 'undefined') {
          newObject[key] = source[key]
        }
      }
    }

    return newObject
  },

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources overwrite property assignments of previous
   * sources.
   * @param {Object} object
   * @param {Object} ...sources
   * @return {Object}
   */
  extend: (object, ...sources) => {
    // Shallow clone
    let newObject = {}
    for (let key in object) {
      newObject[key] = object[key]
    }

    // Extend sources
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i]
      for (let key in source) {
        newObject[key] = source[key]
      }
    }

    return newObject
  }
}
