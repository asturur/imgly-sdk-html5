/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

let maxLogLevel = 'warn'

const LEVELS = [
  { type: 'trace', background: '#EEEEEE', color: '#AAAAAA' },
  { type: 'info', background: '#BDE5F8', color: '#00529B' },
  { type: 'warn', background: '#FEEFB3', color: '#9F6000' },
  { type: 'error', background: '#FFBABA', color: '#D8000C' },
  { type: 'log', background: '#EEEEEE', color: '#1f4f6b' }
]
const LEVEL_TYPES = LEVELS.map((l) => l.type)

let Log = {}

Log.setLevel = (_level) => maxLogLevel = _level
Log.canLog = (type) => {
  if (maxLogLevel === null) return false
  const currentLevelIndex = LEVEL_TYPES.indexOf(type)
  const maxLevelIndex = LEVEL_TYPES.indexOf(maxLogLevel)
  if (currentLevelIndex < maxLevelIndex) return false
  return true
}

LEVELS.forEach((level) => {
  const { type, background, color } = level
  Log[type] = function (tag, ...args) {
    if (!Log.canLog(type)) return

    const output = args.map((a) => a.toString()).join(' ')
    console.log(
      `%c  %c PhotoEditorSDK %c  %c ${tag} %c  ${output}  %c  `,
      'background: #43ADEB; padding: 5px 0',
      'background: black; color: white; padding: 5px 0',
      'background: #43ADEB; padding: 5px 0',
      `background: ${background}; color: ${color}; padding: 5px 0; font-weight: bold`,
      'background: black; color: white; padding: 5px 0',
      'background: #43ADEB; padding: 5px 0')
  }
})

export default Log
