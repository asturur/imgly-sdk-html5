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

exports.BATCH_SIZE = 2000
exports.VERTEX_SIZE = 5
exports.VERTEX_BYTE_SIZE = exports.VERTEX_SIZE * 4

exports.Color = Color
exports.Matrix = Matrix
exports.Vector2 = Vector2
exports.Rectangle = Rectangle
exports.EventEmitter = EventEmitter
exports.Log = Log
