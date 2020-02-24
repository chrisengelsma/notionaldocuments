(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     LandingController
   * @param    {service} $uibModal angular bootstrap modal
   * @param    {service} $uibModalStack angular bootstrap modal stack
   * @param    {service} $state ui-router state provider
   * @param    {service} $rootScope angular root scope
   * @ngInject
   */
  function LandingController($uibModal, $uibModalStack, $state, $rootScope) {

    if ($rootScope.$$listenerCount.openRegisterModal === undefined) {
      $rootScope.$on('openRegisterModal', function() {
        $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-register',
          ariaDescribedBy: 'modal-body-register',
          templateUrl: 'app/landing/register-modal/register-modal.html',
          size: 'lg',
          controller: 'RegisterModalController',
          controllerAs: 'vm'
        }).result.then(function(success) {
          if (success) {
            $state.go('main.editor');
          }
        });
      });
    }

    if ($rootScope.$$listenerCount.openLoginModal === undefined) {
      $rootScope.$on('openLoginModal', function() {
        $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-login',
          ariaDescribedBy: 'modal-body-login',
          templateUrl: 'app/landing/login-modal/login-modal.html',
          size: 'lg',
          controller: 'LoginModalController',
          controllerAs: 'vm'
        }).result.then(function(success) {
          if (success) {
            $state.go('main.editor');
          }
        });
      });
    }
  }

  angular.module('ndApp')
    .controller('LandingController', LandingController);

})();
