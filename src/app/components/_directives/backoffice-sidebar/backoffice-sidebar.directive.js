(function() {
  'use strict';

  /** @ngInject */
  function BackOfficeSidebarController($rootScope) {
    var vm = this;
    vm.addBookPressed = function() { $rootScope.$emit('addBookPressed'); };
    vm.logoutPressed  = function() { $rootScope.$emit('logoutPressed'); };
  }

  /** @ngInject */
  function ndBackofficeSidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/_directives/backoffice-sidebar/backoffice-sidebar.html',
      controller: BackOfficeSidebarController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndBackofficeSidebar', ndBackofficeSidebar);
})();
