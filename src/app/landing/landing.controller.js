(function() {
  'use strict';

  /** @ngInject */
  function LandingController($uibModal, $log, $document, $rootScope) {
    $rootScope.$on('openRegisterModal', function() {
      $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-top',
        ariaDescribedBy: 'modal-body-top',
        templateUrl: 'app/landing/register-modal/register-modal.html',
        size: 'lg',
        controller: 'RegisterModalController',
        controllerAs: 'vm'
      });
    });

    $rootScope.$on('openLoginModal', function() {
      $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-top',
        ariaDescribedBy: 'modal-body-top',
        templateUrl: 'app/landing/login-modal/login-modal.html',
        size: 'lg',
        controller: 'LoginModalController',
        controllerAs: 'vm'
      });
    });
  }

  angular.module('ndApp')
    .controller('LandingController', LandingController);

})();
