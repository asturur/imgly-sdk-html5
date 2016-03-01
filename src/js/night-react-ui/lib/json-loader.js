/* global PhotoEditorSDK, XMLHttpRequest */
/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

const TIMEOUT = 5000
const { Promise } = PhotoEditorSDK
import URL from 'url'

export default class JSONLoader {
  constructor (url) {
    this._url = url
    this._parsedUrl = URL.parse(this._url, true)
  }

  /**
   * Checks if this request is a JSONP request
   * @return {Boolean}
   */
  _isJSONPRequest () {
    const { query } = this._parsedUrl
    for (let key in query) {
      const value = query[key]
      if (value === '?') {
        return true
      }
    }
    return false
  }

  /**
   * Loads the JSON(P) from the given URL
   * @return {Promise}
   */
  load () {
    if (this._isJSONPRequest()) {
      return this._loadJSONP()
    } else {
      return this._loadJSON()
    }
  }

  /**
   * Loads the URL as JSON
   * @return {Promise}
   */
  _loadJSON () {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', this._url, true)

      xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const json = JSON.parse(xhr.responseText)
            resolve(json)
          } else {
            reject(new Error(xhr.statusText))
          }
        }
      }
      xhr.send(null)
    })
  }

  /**
   * Loads the URL as JSONP
   * @return {Promise}
   */
  _loadJSONP () {
    let failed = false
    let succeeded = false

    const fnName = 'pesdk' + Math.round(Math.random() * 99999999999999)
    return new Promise((resolve, reject) => {
      const node = this._createJSONPNode(fnName)
      window[fnName] = (result) => {
        this._removeJSONPNode(node)
        if (!failed) {
          succeeded = true
          resolve(result)
        }
      }

      window.setTimeout(() => {
        if (!succeeded) {
          this._removeJSONPNode(node)
          failed = true
          reject(new Error('Timeout of 5 seconds exceeded.'))
        }
      }, TIMEOUT)
    })
  }

  /**
   * Creates a JSONP <script> node inside the <head> element
   * @param  {String} fnName
   * @return {DOMElement}
   * @private
   */
  _createJSONPNode (fnName) {
    const JSONPUrl = this._buildJSONPUrl(fnName)
    const headNode = document.querySelector('head')
    const scriptNode = document.createElement('script')
    scriptNode.src = JSONPUrl
    headNode.appendChild(scriptNode)
    return scriptNode
  }

  /**
   * Removes the JSONP <script> node from the <head> element
   * @param  {DOMElement} node
   * @private
   */
  _removeJSONPNode (node) {
    node.parentNode.removeChild(node)
  }

  /**
   * Builds a JSONP url for the given function name
   * @param  {String} fnName
   * @return {String}
   */
  _buildJSONPUrl (fnName) {
    // Find JSONP parameter
    const { query } = this._parsedUrl
    let parameter = null
    for (let param in query) {
      if (query[param] === '?') {
        parameter = param
        break
      }
    }

    delete this._parsedUrl.search
    query[parameter] = fnName

    return URL.format(this._parsedUrl)
  }
}
