/**
 * This script will build the documentation.
 */
'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('build-docs', shell.task([
  'node_modules/jsdoc/jsdoc.js ' +
    '-c node_modules/angular-jsdoc/common/conf.json ' + // config file
    '-t node_modules/angular-jsdoc/angular-template ' + // template file
    '-d docs ' +                                        // output dir
    './README.md ' +                                    // to include README.md as index contents
    '-r src/app '                                       // source code dir
]));
