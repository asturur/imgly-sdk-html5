/* global HTMLElement */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Base64 from './base64'

/**
 * Provides utility functions for internal use
 * @class
 * @alias PhotoEditorSDK.Utils
 * @private
 */
class Utils {

  /**
   * Checks if the given object is an Array
   * @param  {Object}  object
   * @return {Boolean}
   */
  static isArray (object) {
    return Object.prototype.toString.call(object) === '[object Array]'
  }

  /**
   * Returns the items selected by the given selector
   * @param  {Array} items
   * @param  {PhotoEditorSDK~Selector} selector = null - The selector
   * @return {Array} The selected items
   */
  static select (items, selector = null) {
    if (selector === null) {
      return items
    }

    // Turn string parameter into an array
    if (typeof selector === 'string') {
      selector = selector.split(',').map(function (identifier) {
        return identifier.trim()
      })
    }

    // Turn array parameter into an object with `only`
    if (Utils.isArray(selector)) {
      selector = { only: selector }
    }

    if (typeof selector.only !== 'undefined') {
      if (typeof selector.only === 'string') {
        selector.only = selector.only.split(',').map(function (identifier) {
          return identifier.trim()
        })
      }

      // Select only the given identifiers
      return items.filter(function (item) {
        return selector.only.indexOf(item) !== -1
      })
    } else if (typeof selector.except !== 'undefined') {
      if (typeof selector.except === 'string') {
        selector.except = selector.except.split(',').map(function (identifier) {
          return identifier.trim()
        })
      }

      // Select all but the given identifiers
      return items.filter(function (item) {
        return selector.except.indexOf(item) === -1
      })
    }

    throw new Error('Utils#select failed to filter items.')
  }

  /**
   * Returns the given object's values as an array
   * @param {Object} object
   * @returns {Array<*>}
   */
  static values (object) {
    var values = []
    for (var key in object) {
      values.push(object[key])
    }
    return values
  }

  /**
   * Checks if the given object is a DOM element
   * @param  {Object}  o
   * @return {Boolean}
   */
  /* istanbul ignore next */
  static isDOMElement (o) {
    return (
      typeof HTMLElement === 'object' ? o instanceof HTMLElement
      : o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
    )
  }

  /**
   * Checks if th given event is a touch event
   * @param  {Event}  e
   * @return {Boolean}
   */
  static isTouchEvent (e) {
    return (e.type.indexOf('touch') !== -1)
  }

  /**
   * Resizes the given vector to fit inside the given max size while maintaining
   * the aspect ratio
   * @param  {Vector2} vector
   * @param  {Vector2} max
   * @return {Vector2}
   */
  static resizeVectorToFit (vector, max) {
    const scale = Math.min(max.x / vector.x, max.y / vector.y)
    const newSize = vector.clone()
      .multiply(scale)
    return newSize
  }

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object for all destination properties that resolve to undefined. Once a
   * property is set, additional values of the same property are ignored.
   * @param  {Object} object
   * @param  {Object} ...sources
   * @return {Object}
   */
  static defaults (object, ...sources) {
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
  }

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources overwrite property assignments of previous
   * sources.
   * @param {Object} object
   * @param {Object} ...sources
   * @return {Object}
   */
  static extend (object, ...sources) {
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

  /**
   * Creates a shallow clone of the given object
   * @param {Object} object
   * @returns {Object}
   */
  static clone (object) {
    return this.extend({}, object)
  }

  /**
   * Gets the property value at `path` of `object`
   * @param  {Object} object
   * @param  {String} key
   * @param  {?} [defaultValue]
   * @return {?}
   */
  static fetch (object, path, defaultValue) {
    // Replace indexes with property accessors
    path = path.replace(/\[(\w+)\]/g, '.$1')
    // Strip leading dot (when path begins with [0] for example)
    path = path.replace(/^\./, '')

    const pathSegments = path.split('.')
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      object = object[segment]
      if (!object) {
        break
      }
    }

    if (typeof object === 'undefined') {
      object = defaultValue
    }

    return object
  }

  /**
   * Creates a Blob URI from the given Data URI
   * @param {String} data
   */
  static createBlobURIFromDataURI (data) {
    if (!window.Blob || !window.URL || !ArrayBuffer || !Uint8Array) {
      return data
    }

    const rawData = Base64.decode(data.split(',')[1])
    const mimeString = data.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    const arrayBuffer = new ArrayBuffer(rawData.length)
    const intArray = new Uint8Array(arrayBuffer)
    for (let i = 0; i < rawData.length; i++) {
      intArray[i] = rawData[i]
    }

    // write the ArrayBuffer to a blob, and you're done
    const blob = new window.Blob([arrayBuffer], {
      type: mimeString
    })
    return window.URL.createObjectURL(blob)
  }

  /**
   * Vendor proxy for requestAnimationFrame
   * @param  {Function} cb
   * @return {Number}
   */
  static requestAnimationFrame (cb) {
    const fallback = function (callback) {
      setTimeout(callback, 1000 / 60)
    }

    if (typeof window === 'undefined') {
      return fallback(cb)
    }

    return (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            fallback)(cb)
  }

  /**
   * Generates a UUID
   * @return {String}
   */
  static getUUID () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0
      let v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * Checks whether the user agent represents a mobile device
   * @return {Boolean}
   */
  static isMobile () {
    const a = navigator.userAgent || navigator.vendor || window.opera
    /* eslint-disable */
    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
    /* eslint-enable */
  }

}

export default Utils
