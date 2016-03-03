var fs = require('fs')
var gulp = require('gulp')
var gulpSequence = require('gulp-sequence')
var zip = require('gulp-zip')
var release = require('gulp-github-release')

gulp.task('release', function (cb) {
  var args = ['clean', 'assets', 'sass', 'standard', 'sass-lint', 'webpack', 'uglify:js', 'uglify:css', 'release:upload']
  args.push(cb)
  gulpSequence.apply(this, args)
})

gulp.task('release:upload', function (cb) {
  var githubToken = fs.readFileSync('.github-token', 'utf8')
  var pkg = require('../package.json')
  return gulp.src('build/**')
		.pipe(zip('imgly-sdk-html5-v' + pkg.version + '.zip'))
    .pipe(gulp.dest('build'))
    .pipe(release({
      repo: 'imgly-sdk-html5',
      owner: 'imgly',
      token: githubToken,
      draft: false,
      prerelease: false,
      notes: fs.readFileSync('.tmp/release.md', 'utf8'),
      manifest: require('../package.json')
    }))
})
