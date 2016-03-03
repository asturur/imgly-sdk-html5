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
 * Hooks into a rendering context (WebGLRenderingContext or CanvasRenderingContext2D),
 * mocks its methods and measures the time consumed by the method calls. When `endFrame`
 * is called, it prints a performance report
 * @class
 * @memberof PhotoEditorSDK.Engine
 * @ignore
 */
class ContextPerformanceHook {
  constructor (context) {
    this._context = context
    this._tracking = false

    const self = this
    for (let key in context) {
      let value = context[key]
      if (typeof value === 'function') {
        value = function (...args) {
          const fn = context[key]
          if (!self._tracking) {
            return fn.apply(context, args)
          }

          const start = window.performance.now()
          const result = fn.apply(context, args)
          const time = window.performance.now() - start

          const call = {
            functionName: key,
            arguments: args,
            duration: time
          }
          self._trackedCalls.push(call)

          return result
        }
      }
      this[key] = value
    }
  }

  /**
   * Starts tracking a frame
   */
  startFrame () {
    this._tracking = true
    this._trackedCalls = []
  }

  /**
   * Stops tracking a frame and prints a performance report
   */
  endFrame () {
    const tag = 'Rendering'
    Log.trace(tag, 'Frame rendering results:')
    Log.trace(tag, `Context calls: ${this._trackedCalls.length}`)

    const groupedCalls = {}
    this._trackedCalls.forEach(({ functionName, duration }) => {
      groupedCalls[functionName] = groupedCalls[functionName] || {
        totalDuration: 0,
        calls: 0
      }

      groupedCalls[functionName].totalDuration += duration
      groupedCalls[functionName].calls++
    })

    let callsArray = []
    for (let key in groupedCalls) {
      const data = groupedCalls[key]
      data.averageDuration = data.totalDuration / data.calls

      callsArray.push({ functionName: key, data })
    }

    callsArray.sort((a, b) => b.data.totalDuration - a.data.totalDuration)
    callsArray = callsArray.slice(0, 3)

    callsArray.forEach((item) => {
      Log.trace(tag, `${item.functionName}: ${item.data.calls} calls, ${item.data.totalDuration.toFixed(2)}ms`)
    })
  }
}

export default ContextPerformanceHook
