(function () {
  'use strict';

  /** @ngInject */
  function chatSocket(socketFactory, $rootScope) {

    var socket = socketFactory({ioSocket: io.connect($rootScope.env.socketUrl + ':' + $rootScope.env.socketPort)});

    //add strings to the arguments array for each server emission
    socket.forward([
      'broadcast',
      'broadcastProposition',
      'broadcastDeletion',
      'broadcastUpdate',
      'broadcastNameAssignment',
      'userUpdated',
      'roomUsers',
      'room',
      'leave'
    ]);

    return socket;
  }

  angular.module('ndApp')
    .factory('chatSocket', chatSocket);

})();
