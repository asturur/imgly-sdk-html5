/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const elementSeparator = '__'
const modifierSeparator = '--'
const blockPrefix = 'pesdk-night-'

class BEMObject {
  constructor (parent, type, name) {
    this._parent = parent
    this._type = type
    this._name = name
  }

  /**
   * Creates a BEMObject of type "element" that has this element as parent
   * @param  {String} name
   * @return {BEMObject}
   */
  element (name) {
    return new BEMObject(this, 'element', name)
  }

  /**
   * Creates a BEMObject of type "modifier" that has this element as parent
   * @param  {String} name
   * @return {BEMObject}
   */
  modifier (name) {
    return new BEMObject(this, 'modifier', name)
  }

  /**
   * Builds the class name for this BEMObject
   * @return {String}
   */
  get str () {
    let response = this._parent ? this._parent.str : ''
    switch (this._type) {
      case 'block':
        response += `${blockPrefix}${this._name}`
        break
      case 'element':
        response += `${elementSeparator}${this._name}`
        break
      case 'modifier':
        response += `${modifierSeparator}${this._name}`
        break
    }
    return response
  }
}

export default {
  /**
   * Creates a BEMObject of type "block" that has this element as parent
   * @param  {String} name
   * @return {BEMObject}
   */
  block (name) {
    return new BEMObject(null, 'block', name)
  }
}
