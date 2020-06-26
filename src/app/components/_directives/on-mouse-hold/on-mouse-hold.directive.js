(function() {
  'use strict';

  /** @ngInject */
  function onMouseHold($parse, $interval) {
    var stop;
    return {
      restrict: 'A',
      scope: { method: '&onMouseHold' },
      link: function (scope, element, attrs) {
        
        var actionInterval = (attrs.mouseHoldRepeat) ? attrs.mouseHoldRepeat : 300;
        
        function startAction () {
          $scope.dragProposition();
          stop = $interval(function () {
            $scope.dragProposition();
          }, actionInterval);
        };

        var stopAction = function () {
          if (stop) {
            $interval.cancel(stop);
            stop = undefined;
          }
        };

        element.bind('mousedown', startAction);
        element.bind('mouseup', stopAction);
        element.bind('mouseout', stopAction);
      }
    };
  }

  angular.module('ndApp')
    .directive('onMouseHold', onMouseHold);

}());