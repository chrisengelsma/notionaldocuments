#!/usr/env/bin node
'use strict';

// define globals =====================================
const express      = require('express'),
      path         = require('path'),
      morgan       = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser   = require('body-parser'),
      admin        = require('./server/firebase-admin'),
      http         = require('http'),
      app          = module.exports = express(),
      server       = http.createServer(app),
      io           = require('socket.io').listen(server);


const port = process.env.PORT || 3000;

// set up our socket server
require('./sockets/base')(io);

// view engine  =======================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware =========================================
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));


// application ========================================
server.listen(port, () => {
  console.log('listening on port', port);
});

app.use(express.static(path.join(__dirname)));

// Set up router
let router = require('./server/routes')(admin, express);
app.use('/', router);

process.on('SIGTERM', gracefullyExit);           // Explicitly close server on kill
process.on('uncaughtException', gracefullyExit); // Explicitly close server on crash

function gracefullyExit() { server.close(); }
