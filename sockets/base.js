module.exports = function (io) {
  'use strict';

  let userCount = 0;
  io.on('connection', function (socket) {
    socket.broadcast.emit('user connected');

    io.sockets.emit('A user just connected');

    userCount++;

    socket.on('message', (from, msg) => {
      io.sockets.emit('broadcast', {
        payload: msg,
        source: from
      });
    });

    socket.on('proposition', (from, obj) => { //for first emission
      io.sockets.emit('broadcastProposition', obj);
    });

    socket.on('deletion', (from, obj) => { //for first emission
      io.sockets.emit('broadcastDeletion', obj);
    });





  });
};

