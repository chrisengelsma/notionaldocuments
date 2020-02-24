(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    service
   * @name     IdFactory
   * @ngInject
   */
  function IdFactory() {
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    /**
     * Generates a new random id.
     * @returns {string} an id
     */
    function generateId() {
      var idText = '';
      for (var i = 0; i < 20; i++) {
        idText += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return idText;
    }

    return {
      next: generateId
    };

  }

  angular.module('ndApp')
    .factory('IdFactory', IdFactory);
})();
