(function() {
  'use strict';

  chatSocket.$inject = ['socketFactory'];

  function chatSocket(socketFactory) {
    var socket = socketFactory();
    //add strings to the arguments array for each server emission
    socket.forward(['broadcast', 'broadcastProposition', 'broadcastDeletion', 'broadcastNameAssignment']);
    return socket;
  }

  angular.module('notionalApp')
    .factory('chatSocket', chatSocket);

})();
