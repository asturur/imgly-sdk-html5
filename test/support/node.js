var path = require('path')
var fs = require('fs')
var canvas = require('canvas')

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
var sinonChai = require('sinon-chai')

chai.should()
chai.use(chaiAsPromised)
chai.use(sinonChai)

global.chaiAsPromised = chaiAsPromised
global.expect = chai.expect
global.AssertionError = chai.AssertionError
global.Assertion = chai.Assertion
global.assert = chai.assert
global.sinon = require('sinon')

global.SpecHelpers = {
  initSDK () {
    let image = new canvas.Image()
    let imagePath = path.resolve(__dirname, '../sdk/assets/test.png')
    let buffer = fs.readFileSync(imagePath)
    image.src = buffer

    return new PhotoEditorSDK('canvas', {
      image: image,
      displayWelcomeMessage: false
    })
  }
}

/**
 * Since node.js does not know about webpack's loader syntax
 * (loaderName!./path/to/module), we need to do some monkey patching...
 */
var Module = require('module')
var originalResolve = Module._resolveFilename
Module._resolveFilename = function (filename, parent) {
  if (filename.indexOf('raw!') === 0) {
    filename = filename.slice(4)
  }
  return originalResolve.call(this, filename, parent)
}

/*
 * Load GLSL shaders as strings
 */
var EXTENSIONS = ['.frag', '.vert']
EXTENSIONS.forEach(function (extension) {
  require.extensions[extension] = function (_module, filename) {
    return fs.readFileSync(filename)
  }
})

var PhotoEditorSDK = require('../../src/js/sdk')
global.PhotoEditorSDK = PhotoEditorSDK
