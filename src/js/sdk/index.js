/*!
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import { RenderType, ImageFormat } from './constants'

let PhotoEditorSDK = require('./sdk')

PhotoEditorSDK.Engine = require('./engine')

/**
 * The current version of the SDK
 * @name PhotoEditorSDK.version
 * @internal Keep in sync with package.json
 */
PhotoEditorSDK.version = require('../../../package.json').version

// Exposed classes
PhotoEditorSDK.Color = require('./lib/color')
PhotoEditorSDK.Filter = require('./operations/filters/filter')
PhotoEditorSDK.Operation = require('./operations/operation')
PhotoEditorSDK.Rectangle = require('./lib/math/rectangle')
PhotoEditorSDK.EventEmitter = require('./lib/event-emitter')
PhotoEditorSDK.Utils = require('./lib/utils')
PhotoEditorSDK.OperationsStack = require('./lib/operations-stack')
PhotoEditorSDK.EXIF = require('./lib/exif')
PhotoEditorSDK.Promise = require('./vendor/promise')
PhotoEditorSDK.Sticker = require('./operations/sprites/sticker')
PhotoEditorSDK.Text = require('./operations/sprites/text')

// Namespaces
PhotoEditorSDK.Math = require('./lib/math/')
PhotoEditorSDK.Operations = require('./operations/')
PhotoEditorSDK.Filters = require('./operations/filters/')
PhotoEditorSDK.FilterPrimitives = require('./operations/filters/primitives/')

// Exposed constants
PhotoEditorSDK.RenderType = RenderType
PhotoEditorSDK.ImageFormat = ImageFormat

// Exposed libs
PhotoEditorSDK.Base64 = require('./lib/base64')

export default PhotoEditorSDK
