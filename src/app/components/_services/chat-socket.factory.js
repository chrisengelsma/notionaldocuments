(function () {
  'use strict';

  /** @ngInject */
  function chatSocket(socketFactory) {
    var socket = socketFactory({ioSocket: io.connect('localhost:3001')});

    //add strings to the arguments array for each server emission
    socket.forward([
      'broadcast',
      'broadcastProposition',
      'broadcastDeletion',
      'broadcastUpdate',
      'broadcastNameAssignment',
      'userUpdated',
      'roomUsers',
      'join',
      'leave'
    ]);

    return socket;
  }

  angular.module('ndApp')
    .factory('chatSocket', chatSocket);

})();
