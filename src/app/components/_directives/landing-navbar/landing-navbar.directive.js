(function() {
  'use strict';

  /** @ngInject */
  function LandingNavbarController($rootScope) {
    var vm = this;

    vm.openRegisterModal = function() {
      $rootScope.$emit('openRegisterModal', {});
    };

    vm.openLoginModal = function() {
      $rootScope.$emit('openLoginModal', {});
    };
  }

  /** @ngInject */
  function ndLandingNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/_directives/landing-navbar/landing-navbar.html',
      controller: LandingNavbarController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndLandingNavbar', ndLandingNavbar);
})();
