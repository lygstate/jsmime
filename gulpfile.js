'use strict'

const watchify = require('watchify')
const browserify = require('browserify')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
// const uglify = require('gulp-uglify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const gutil = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const mocha = require('gulp-mocha') // Unit testing
const rename = require('gulp-rename')
const babelify = require('babelify')
const istanbul = require('gulp-babel-istanbul')
const clean = require('gulp-clean')

require('./test')

// Browsersync + Gulp.js
// http://www.browsersync.cn/docs/gulp/

function compile (watch) {
  let bundler = browserify('./jsmimeMain.js', {
    debug: true,
    standalone: 'jsmime'
  })
  bundler = bundler.transform(babelify)
  bundler.on('log', gutil.log)

  function rebundle () {
    return bundler.bundle()
      .on('error', function (err) { console.error(err); this.emit('end') })
      .pipe(plumber())
      .pipe(source('./jsmimeMain.js'))
      .pipe(rename('jsmime.js'))
      .pipe(buffer())
      // .pipe(uglify())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'))
      .pipe(gulp.dest('./'))
  }

  if (watch) {
    bundler = watchify(bundler)
    bundler.on('update', function () {
      console.log('-> bundling...')
      rebundle()
    })
  }

  return rebundle()
}

gulp.task('bundle', function () {
  return compile(false)
})

gulp.task('watch-bundle', function () {
  return compile(true)
})

function handleError (e) {
  console.error(e.toString())
  this.emit('end')
}

gulp.task('cleanup', () => {
  return gulp.src(['./jsmime.*', './dist/*'], {read:false})
    .pipe(clean({force: true}))
})

gulp.task('test', () => {
  // gulp-mocha needs filepaths so you can't have any plugins before it
  return gulp.src(['test/**/test_*.js'], {read: false})
    .pipe(
      mocha({
        ui: 'tdd',
        reporters : ['xunit-file', 'spec'],
        globals: ['define']
      }).on('error', handleError)
    )
})

gulp.task('coverage-hook', () => {
  return gulp.src(['./*.js', '!jsmime.*'])
    // Covering files
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
})

gulp.task('coverage', ['coverage-hook'], () => {
  // gulp-mocha needs filepaths so you can't have any plugins before it
  return gulp.src(['test/**/test_*.js'], {read: false})
    .pipe(
      mocha({
        ui: 'tdd',
        reporters : ['xunit-file', 'spec'],
        globals: ['define']
      }).on('error', handleError)
    )
    // Creating the reports after tests ran
    .pipe(
        istanbul.writeReports()
    )
    // Enforce a coverage of at least 90%
    .pipe(
        istanbul.enforceThresholds({ thresholds: { global: 10 } })
    )
})
