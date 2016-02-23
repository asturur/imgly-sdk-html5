var gulp = require('gulp')
var jsdoc = require('gulp-jsdoc3')
var handleErrors = require('./util/handleErrors')

gulp.task('jsdoc', function () {
  return gulp.src([
    './README.md',
    './src/js/sdk/**/*.js',
    './src/js/night-react-ui/**/*.js',
    '!./src/js/sdk/vendor/**/*.js'
  ])
    .pipe(jsdoc({
      tags: {
        allowUnknownTags: true
      },
      source: {
        excludePattern: '(^|\\/|\\\\)_'
      },
      opts: {
        destination: './doc',
        template: 'node_modules/jaguarjs-jsdoc',
        access: 'public,undefined',
        query: 'inherits=false'
      },
      plugins: [
        'node_modules/jsdoc/plugins/markdown',
        'plugins/configurable'
      ],
      templates: {
        cleverLinks: false,
        monospaceLinks: false,
        default: {
          outputSourceFiles: true,
          layoutFile: 'node_modules/jaguarjs-jsdoc/tmpl/layout.tmpl'
        },
        theme: 'cerulean',
        navType: 'vertical',
        linenums: true,
        dateFormat: 'MMMM Do YYYY, h:mm:ss a'
      }
    }
, () => {}))
    .on('error', handleErrors)
})
