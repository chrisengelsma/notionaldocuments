'use strict';

var path = require('path');
var gulp = require('gulp');

var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var $ = require('gulp-load-plugins')();

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    files: [{
      match: ['app/**/*.*']
    }],
    browser: 'google chrome',
    port: 3001
  });
});

gulp.task('nodemon', function(callback) {
  var started = false;

  return nodemon({
    script: 'server.js',
    ext: 'js scss html',
    ignore: ['dist/**/*.*'],
    tasks: function(changedFiles) {
      var tasks = [];
      changedFiles.forEach(function(file) {
        console.log(file);
        if (!~tasks.indexOf('html-watch')) {
          tasks.push('html-watch');
        }
      });
      return tasks;
    }
  }).on('start', function() {
    if (!started) {
      callback();
      started = true;
    }
  });

});

gulp.task('serve', ['browser-sync'], function() {});
