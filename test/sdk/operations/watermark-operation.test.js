/* global SpecHelpers, describe, it, beforeEach */
/*
 * Copyright (c) 2013-2016 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import path from 'path'
import fs from 'fs'
import { Image } from 'canvas'

describe('WatermarkOperation', function () {
  let sdk, image

  beforeEach(function () {
    sdk = SpecHelpers.initSDK()
    const imagePath = path.resolve(__dirname, '../assets/sticker.png')
    const imageBuffer = fs.readFileSync(imagePath)
    image = new Image()
    image.src = imageBuffer
  })

  describe('#render', function () {
    it('should succeed', function () {
      sdk.createOperation('watermark', {
        image
      })

      return sdk.render().should.be.fulfilled
    })
  })
})
