(function() {
  'use strict';

  /** @ngInject */
  function onMouseHold($parse, $interval) {
    var stop;

        var dirDefObj = {
            restrict: 'A',
            scope: { method: '&onMouseHold' },
            link: function (scope, element, attrs) {
                var expressionHandler = scope.method();
                var actionInterval = (attrs.mouseHoldRepeat) ? attrs.mouseHoldRepeat : 500;

                var startAction = function () {
                    expressionHandler();
                    stop = $interval(function () {
                        expressionHandler();
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

        return dirDefObj;
  }

  angular.module('ndApp')
    .directive('onMouseHold', onMouseHold);

}());