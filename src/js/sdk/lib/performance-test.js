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

/**
 * A simple class that tracks the time between start and end and renders it as FPS
 * @class
 * @memberof PhotoEditorSDK
 * @ignore
 */
class PerformanceTest {
  /**
   * Creates a PerformanceTest
   * @param  {String} tag
   * @param  {String} name
   */
  constructor (tag, name) {
    this._tag = tag
    this._name = name
    this._start = window.performance.now()
  }

  /**
   * Stops the performance test and prints the result
   */
  stop () {
    const end = window.performance.now()
    const ms = end - this._start
    const fps = Math.round(1000 / ms)
    Log.info(this._tag, `${this._name} took ${ms.toFixed(2)}ms (${fps} FPS)`)
  }

  /**
   * Checks if info logging is available
   * @return {Boolean}
   */
  static canLog () {
    return Log.canLog('info')
  }
}

export default PerformanceTest
