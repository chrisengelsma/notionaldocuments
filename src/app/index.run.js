(function () {
  'use strict';

  /** @ngInject */
  function runBlock($rootScope, $log) {
    $log.debug('runBlock end');

    $rootScope.firstEntry = true;
    $rootScope.redirectToEditor = false;
    $rootScope.editorParams = {};

    $rootScope.$on('$stateChangeStart', function (ev, to, toParams) {
      if ($rootScope.firstEntry) {
        if (to.name === 'main.editor') {
          $rootScope.redirectToEditor = true;
          $rootScope.editorParams = toParams;
        }
        $rootScope.firstEntry = false;
      }
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      $log.debug(error);
    });
  }

  angular.module('ndApp').run(runBlock);
})();
