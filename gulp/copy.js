var gulp = require('gulp')
var changed = require('gulp-changed')
var watch = require('gulp-watch')
var config = require('../config')

var watching = false
gulp.task('copy', function () {
  var task = gulp.src(config.staticBuildAssets.src)
    .pipe(changed(config.staticBuildAssets.dest)) // Ignore unchanged files
    .pipe(gulp.dest(config.staticBuildAssets.dest))

  // Only watch in development
  if (config.env === 'development' && !watching) {
    watching = true
    watch(config.staticBuildAssets.src, { verbose: true }, function () {
      gulp.start('copy')
    })
  }

  return task
})
