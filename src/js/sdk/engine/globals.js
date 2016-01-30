/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Log from '../../shared/log'
import Color from '../lib/color'
import Matrix from '../lib/math/matrix'
import Rectangle from '../lib/math/rectangle'
import Vector2 from '../lib/math/vector2'
import EventEmitter from '../lib/event-emitter'

let Globals = {}

Globals.BATCH_SIZE = 2000
Globals.VERTEX_SIZE = 5
Globals.VERTEX_BYTE_SIZE = Globals.VERTEX_SIZE * 4

Globals.Color = Color
Globals.Matrix = Matrix
Globals.Vector2 = Vector2
Globals.Rectangle = Rectangle
Globals.EventEmitter = EventEmitter
Globals.Log = Log

export default Globals
