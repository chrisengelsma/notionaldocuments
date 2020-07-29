#!/usr/env/bin node
'use strict';

require('dotenv').config();

// define globals =====================================
var express = require('express'),
  morgan = require('morgan'),
  path = require('path'),
  bodyParser = require('body-parser'),
  admin = require('./server/firebase-admin'),
  app = module.exports = express(),
  sockets = require('./sockets');


var distDir = path.resolve(__dirname, './dist');

var port = process.env.PORT || 3000;

// middleware =========================================
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(distDir));

// application ========================================

// Set up router
var router = require('./server/routes')(admin, express);
app.use('/', router);

app.listen(port, '0.0.0.0', function (err) {
  if (err) {
    gracefullyExit();
  }

  console.log('listening on port', port);

  new sockets.SocketService(app, 3001);
});

process.on('SIGTERM', gracefullyExit);           // Explicitly close server on kill
process.on('uncaughtException', gracefullyExit); // Explicitly close server on crash


function gracefullyExit(err) {
  console.error(err);
  // app.close();
}
