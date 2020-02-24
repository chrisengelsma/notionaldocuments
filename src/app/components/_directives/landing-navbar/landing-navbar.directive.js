(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     LandingNavbarController
   * @ngInject
   */
  function LandingNavbarController($rootScope) {
    var vm = this;

    /**
     * Opens the register modal.
     *
     * @memberOf LandingNavbarController
     * @function openRegisterModal
     */
    vm.openRegisterModal = function() {
      $rootScope.$emit('openRegisterModal', {});
    };

    /**
     * Opens the login modal.
     *
     * @memberOf LandingNavbarController
     * @function openLoginModal
     */
    vm.openLoginModal = function() {
      $rootScope.$emit('openLoginModal', {});
    };
  }

  /**
   * @memberOf ndApp
   * @ngdoc    directive
   * @name     ndLandingNavbar
   * @ngInject
   */
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
