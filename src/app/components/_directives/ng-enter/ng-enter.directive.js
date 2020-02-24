(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    directive
   * @name     ngEnter
   * @ngInject
   */
  function ngEnter() {
    return function(scope, element, attrs) {
      element.bind('keydown keypress', function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter);
          });
          event.preventDefault();
        }
      });
    };
  }

  angular.module('ndApp')
    .directive('ngEnter', ngEnter);

})();
