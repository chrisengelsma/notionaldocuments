(function() {
  'use strict';

  IdFactory.$inject = [];

  function IdFactory() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return {
      next: generateId
    };

    function generateId() {
      let idText = '';
      for (let i = 0; i < 20; i++) {
        idText += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return idText;
    }

  }

  angular.module('notionalApp')
    .factory('IdFactory', IdFactory);

})();
