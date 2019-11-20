(function() {
  'use strict';

  /** @ngInject */
  function LandingController($uibModal, $uibModalStack, $state, $log, $document, $rootScope) {
<<<<<<< HEAD
    var vm = this;
=======
>>>>>>> e2455a5e4295771b470ca018820c5947e9ba3edd

    if ($rootScope.$$listenerCount.openRegisterModal === undefined) {
      $rootScope.$on('openRegisterModal', function() {
        var registerModalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-register',
          ariaDescribedBy: 'modal-body-register',
          templateUrl: 'app/landing/register-modal/register-modal.html',
          size: 'lg',
<<<<<<< HEAD
          appendTo: undefined,
=======
>>>>>>> e2455a5e4295771b470ca018820c5947e9ba3edd
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
<<<<<<< HEAD
          appendTo: undefined,
=======
>>>>>>> e2455a5e4295771b470ca018820c5947e9ba3edd
          controller: 'LoginModalController',
          controllerAs: 'vm'
        });
      });
    }
  }

  angular.module('ndApp')
    .controller('LandingController', LandingController);

})();
