'use strict';

/**
 * A socket service.
 */
class SocketService {

  /**
   * Constructs a new socket service with a given app and port number.
   * @param app the express app.
   * @param port the port number
   */
  constructor(app, port) {
    this.users = {};
    this.app = app;
    this.port = port;

    this.initServer();
    this.initSockets();
  }

  /**
   * Initializes the sockets.
   */
  initSockets() {
    var self = this;

    var debug = (event, socket) => {
      console.log(event + ' event triggered');
      console.log(`Socket server: ${Object.keys(self.users).length} connected.`);
      console.table(self.users);
      console.log(`Rooms:`);
      console.table(socket.adapter.rooms);
    };

    /**
     * Gets the display names of users in the specified book id room.
     * @param bookId the book id, used as the room id.
     * @returns the list of users in the room.
     */
    var getRoomUsers = (bookId) => {
      var connected = [];
      var rooms = self.io.sockets.adapter.rooms;
      if (rooms.hasOwnProperty(bookId)) {
        for (var id in rooms[bookId].sockets) {
          var user = self.users[id];
          if (user) {
            var displayName = user.displayName !== ' ' ? user.displayName : '(unnamed user)';
            connected.push(displayName);
          }
        }
      }
      return connected;
    };

    this.io.on('connection', function (socket) {

      /**
       * Socket for when a user's information is updated.
       */
      socket.on('userUpdated', function (data) {
        var emitUpdate = false;

        if (!self.users[socket.id]) {
          self.users[socket.id] = {displayName: data.displayName};
          emitUpdate = true;
        } else {
          if (data.displayName && data.displayName !== self.users[socket.id].displayName) {
            self.users[socket.id].displayName = data.displayName;
          }
        }

        if (emitUpdate) {
          self.io.in(data.bookId).emit('roomUsers', getRoomUsers(data.bookId));
          debug('userUpdated', socket);
        }
      });

      /**
       * Socket for when a user leaves a room.
       */
      socket.on('leave', function (bookId) {
        socket.leave(bookId);
        socket.to(bookId).emit('roomUsers', getRoomUsers(bookId));
      });

      /**
       * Socket for when a user enters a room.
       */
      socket.on('room', function (bookId) {
        socket.join(bookId);
        self.io.in(bookId).emit('roomUsers', getRoomUsers(bookId));
        debug('room', socket);

        socket.on('disconnect', function () {
          self.io.sockets.in(bookId).emit('roomUsers', getRoomUsers(bookId));
        });
      });

      /**
       * Socket for when a user disconnects form the service.
       */
      socket.on('disconnect', () => {
        if (self.users.hasOwnProperty(socket.id)) {
          delete self.users[socket.id];
        }
        debug('disconnect', socket);
      });

      /**
       * Socket for when a proposition is emitted.
       */
      socket.on('proposition', function (from, obj, bookId) {
        self.io.to(bookId).emit('broadcastProposition', obj);
      });

      /**
       * Socket for when a deletion is emitted.
       */
      socket.on('deletion', function (from, obj, bookId) {
        self.io.to(bookId).emit('broadcastDeletion', obj);
      });

      /**
       * Socket for when an update is emitted.
       */
      socket.on('update', function (from, obj, bookId) {
        self.io.to(bookId).emit('broadcastUpdate', obj);
      });
    });

  }

  /**
   * Initializes the server.
   */
  initServer() {
    var self = this;
    this.server = require('http').createServer(this.app);
    this.io = require('socket.io').listen(this.server, {origins: '*:*'});

    this.server.listen(this.port, function () {
      console.log(`Socket server listening on port ${self.port}`);
    });
  }
}

module.exports = {
  SocketService: SocketService
};
