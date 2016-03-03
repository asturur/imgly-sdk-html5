/*!
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import PhotoEditorSDK from './sdk'

/**
 * The current version of the SDK
 * @name PhotoEditorSDK.version
 * @internal Keep in sync with package.json
 */
PhotoEditorSDK.version = require('../../../package.json').version

// Namespaces
import * as Math from './lib/math/'
PhotoEditorSDK.Math = Math

import * as Operations from './operations/'
PhotoEditorSDK.Operations = Operations

import * as Filters from './operations/filters/'
PhotoEditorSDK.Filters = Filters

import * as FilterPrimitives from './operations/filters/primitives/'
PhotoEditorSDK.FilterPrimitives = FilterPrimitives

import * as Engine from './engine/'
PhotoEditorSDK.Engine = Engine

// Classes
import Color from './lib/color'
PhotoEditorSDK.Color = Color

import Filter from './operations/filters/filter'
PhotoEditorSDK.Filter = Filter

import Operation from './operations/operation'
PhotoEditorSDK.Operation = Operation

import EventEmitter from './lib/event-emitter'
PhotoEditorSDK.EventEmitter = EventEmitter

import Utils from './lib/utils'
PhotoEditorSDK.Utils = Utils

import OperationsStack from './lib/operations-stack'
PhotoEditorSDK.OperationsStack = OperationsStack

import EXIF from './lib/exif'
PhotoEditorSDK.EXIF = EXIF

import Promise from './vendor/promise'
PhotoEditorSDK.Promise = Promise

// Constants
import { RenderType, ImageFormat } from './constants'
PhotoEditorSDK.RenderType = RenderType
PhotoEditorSDK.ImageFormat = ImageFormat

// Libs
import { default as Base64 } from './lib/base64'
PhotoEditorSDK.Base64 = Base64

module.exports = PhotoEditorSDK
