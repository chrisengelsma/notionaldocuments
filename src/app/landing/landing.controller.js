(function () {
  'use strict';

  /** @ngInject */
  function LandingController($uibModal, $uibModalStack, $state, $log, $document, $rootScope, $scope, $sce) {

    $scope.active = 0;

    $scope.slides = [
      {src: 'assets/images/doge.gif', alt: 'Doge', id: 0},
      {src: 'assets/images/hotdog.gif', alt: 'Hot Dog', id: 1},
      {src: 'assets/images/cena.gif', alt: 'Cena', id: 2},
    ];

    if ($rootScope.$$listenerCount.openRegisterModal === undefined) {
      $rootScope.$on('openRegisterModal', function () {
        $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-register',
          ariaDescribedBy: 'modal-body-register',
          templateUrl: 'app/landing/register-modal/register-modal.html',
          size: 'lg',
          controller: 'RegisterModalController',
          controllerAs: 'vm'
        }).result.then(function (success) {
          if (success) {
            $state.go('main.editor');
          }
        });
      });
    }

    if ($rootScope.$$listenerCount.openLoginModal === undefined) {
      $rootScope.$on('openLoginModal', function () {
        $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-login',
          ariaDescribedBy: 'modal-body-login',
          templateUrl: 'app/landing/login-modal/login-modal.html',
          size: 'lg',
          controller: 'LoginModalController',
          controllerAs: 'vm'
        }).result.then(function (success) {
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
