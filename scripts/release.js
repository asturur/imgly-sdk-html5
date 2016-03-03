var prompt = require('prompt')
var fs = require('fs')
var child_process = require('child_process')
var pkg = require('../package.json')

function Release () {

}

/**
 * Runs the release script
 */
Release.prototype.run = function () {
  return this._readVersion()
    .then(this._writeVersion.bind(this))
    .then(this._readReleaseNotes.bind(this))
    .then(this._uploadRelease.bind(this))
}

/**
 * Reads the version number from the users input
 * @return {Promise}
 * @private
 */
Release.prototype._readVersion = function () {
  return new Promise(function (resolve, reject) {
    prompt.start()

    var schema = {
      properties: {
        version: {
          type: 'string',
          default: pkg.version
        }
      }
    }

    prompt.get(schema, function (err, result) {
      if (err) return reject(err)

      resolve(result.version)
    })
  })
}

/**
 * Writes the new version into package.json
 * @param  {String} version
 * @return {Promise}
 * @private
 */
Release.prototype._writeVersion = function (version) {
  pkg.version = version
  return new Promise(function (resolve, reject) {
    fs.writeFile('package.json', JSON.stringify(pkg, true, 2), function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}

/**
 * Opens $EDITOR to make the user write the release notes
 * @return {Promise}
 * @private
 */
Release.prototype._readReleaseNotes = function () {
  // Create .tmp folder for release description
  try {
    fs.mkdirSync('.tmp')
  } catch (e) {}
  try {
    fs.unlinkSync('.tmp/release.md')
  } catch (e) {}

  return new Promise(function (resolve, reject) {
    var editor = process.env.EDITOR || 'vi'
    var child = child_process.spawn(editor, ['.tmp/release.md'], {
      stdio: 'inherit'
    })
    child.on('exit', function (err, code) {
      if (err) return reject(err)
      if (code !== null) {
        console.log('`' + editor + '` exited with code ' + code)
        process.exit(code)
      }

      resolve()
    })
  })
}

Release.prototype._uploadRelease = function () {
  return new Promise(function (resolve, reject) {
    process.env.ENV = 'production'
    process.env.UPLOAD = 'true'
    var child = child_process.spawn('gulp', ['release'], {
      stdio: 'inherit',
      env: process.env
    })
    child.on('exit', function (err, code) {
      if (err) return reject(err)
      if (code !== null) {
        console.log('`gulp` exited with code ' + code)
        process.exit(code)
      }

      resolve()
    })
  })
}

var release = new Release()
release.run()
  .then(function () {
    console.log('Done.')
    process.exit(0)
  })
