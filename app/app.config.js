(function() {
  'use strict';

  angular.module('notionalApp')
    .config(['$locationProvider', function($locationProvider) {
      $locationProvider.hashPrefix('');
    }]);

})();
