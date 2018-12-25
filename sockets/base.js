module.exports = function (io) {
  'use strict';

  let userCount = 0;
  let nameList = ['Moe', 'Larry', 'Curly', 'Shemp', 'Groucho', 'Harpo', 'Chico', 'Zeppo','Gummo'];

  let fs = require('fs');
  let library;
  let read;
  // fs.readFile('library.json', handleFile);

  // function handleFile(err, library) {
  //   if (err) throw err

  //   library = JSON.parse(library)
  //   console.log(library);
  //   // You can now play with your datas
  // }

  io.on('connection', function (socket) {
    socket.broadcast.emit('user connected');
    io.sockets.emit('A user just connected')
    library = JSON.parse(fs.readFileSync('library.json'));

    console.log(library);



    /*
    io.sockets.emit('broadcastNameAssignment', {
      name: 'user ' + userCount,
      userCount: userCount,
      test: 'look',
      library: library
    })
    */

    userCount++;

    socket.on('message', function (from, msg) {

      console.log('received message from', from, 'msg', JSON.stringify(msg));

      console.log('broadcasting message');
      console.log('payload is', msg);
      io.sockets.emit('broadcast', {
        payload: msg,
        source: from
      });
      console.log('broadcast complete');
    });

    socket.on('proposition', function (from, obj) { //for first emission

      console.log('received proposition from', from, 'msg', JSON.stringify(obj));

      console.log('broadcasting message');
      console.log('payload is', obj);
      io.sockets.emit('broadcastProposition', obj);
      console.log('broadcast complete');
    });

    socket.on('deletion', function (from, obj) { //for first emission

      console.log('received deletion from', from, 'msg', JSON.stringify(obj));

      console.log('broadcasting message');
      console.log('payload is', obj);
      io.sockets.emit('broadcastDeletion', obj);
      console.log('broadcast complete');
    });





  });
};

