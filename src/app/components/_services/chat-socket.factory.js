(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    service
   * @name     chatSocket
   * @param    {service} socketFactory a socket.io factory provider
   * @ngInject
   */
  function chatSocket(socketFactory) {
    var socket = socketFactory();
    //add strings to the arguments array for each server emission
    socket.forward(['broadcast', 'broadcastProposition', 'broadcastDeletion', 'broadcastUpdate', 'broadcastNameAssignment']);
    return socket;
  }

  angular.module('ndApp')
    .factory('chatSocket', chatSocket);

})();
