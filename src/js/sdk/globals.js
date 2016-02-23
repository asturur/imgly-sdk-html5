/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Engine from './engine'

import EventEmitter from './lib/event-emitter'
import Utils from './lib/utils'
import Configurable from './lib/configurable'
import Color from './lib/color'
import Constants from './constants'
import Log from '../shared/log'

import Vector2 from './lib/math/vector2'
import Rectangle from './lib/math/rectangle'
import Matrix from './lib/math/matrix'

import { requestAnimationFrame, cancelAnimationFrame } from '../shared/animation-frame'

const Globals = {
  Engine,

  EventEmitter,
  Utils,
  Configurable,
  Color,
  Constants,
  Log,

  Vector2, Rectangle, Matrix,

  requestAnimationFrame, cancelAnimationFrame
}

export default Globals
