(function() {
  'use strict';

  /** @ngInject */
  function eventFocus() {
    console.log('Event focusing');
    return function(scope, elem, attr) {
      elem.on(attr.eventFocus, function() {
        eventFocus(attr.eventFocusId);
      });

      // Removes bound events in the element itself
      // when the scope is destroyed
      scope.$on('$destroy', function() {
        elem.off(attr.eventFocus);
      });
    };
  }

  angular.module('ndApp')
    .directive('eventFocus', eventFocus);

}());
