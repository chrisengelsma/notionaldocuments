(function() {
  'use strict';

  /** @ngInject */
  function LandingController($uibModal, $uibModalStack, $state, $log, $document, $rootScope) {
    var vm = this;

    if ($rootScope.$$listenerCount.openRegisterModal === undefined) {
      $rootScope.$on('openRegisterModal', function() {
        var registerModalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-register',
          ariaDescribedBy: 'modal-body-register',
          templateUrl: 'app/landing/register-modal/register-modal.html',
          size: 'lg',
          appendTo: undefined,
          controller: 'RegisterModalController',
          controllerAs: 'vm'
        });
      });
    }

    if ($rootScope.$$listenerCount.openLoginModal === undefined) {
      $rootScope.$on('openLoginModal', function() {
        var loginModalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-login',
          ariaDescribedBy: 'modal-body-login',
          templateUrl: 'app/landing/login-modal/login-modal.html',
          size: 'lg',
          appendTo: undefined,
          controller: 'LoginModalController',
          controllerAs: 'vm'
        });
      });
    }
  }

  angular.module('ndApp')
    .controller('LandingController', LandingController);

})();
