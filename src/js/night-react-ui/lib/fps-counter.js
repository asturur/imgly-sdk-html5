/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

export default class FPSCounter {
  startFrame () {
    this._startTime = window.performance.now()
  }

  endFrame () {
    const endTime = window.performance.now()
    const ms = (endTime - this._startTime).toFixed(2)
    const fps = Math.round(1000 / ms)

    let outputColor = 'green'
    if (fps < 60) {
      outputColor = 'yellow'
    } else if (fps < 30) {
      outputColor = 'orange'
    } else if (fps < 25) {
      outputColor = 'red'
    }

    console.log(`%c ${ms}ms, ${fps} FPS`, `background: black; color: ${outputColor}; font-weight: bold;`)
  }
}
