(function() {
  'use strict';

  focusFactory.$inject = ['$timeout', '$window'];

  function focusFactory($timeout, $window) {
      return function (id) {
        // timeout makes sure that is invoked after any other event has been triggered.
        // e.g. click events that need to run before the focus or
        // inputs elements that are in a disabled state but are enabled when those events
        // are triggered.
        $timeout(function () {
          let element = $window.document.getElementById(id);
          if (element) { element.focus(); }
        });
      };
  }

  angular.module('notionalApp')
    .factory('focusFactory', focusFactory);
})();
