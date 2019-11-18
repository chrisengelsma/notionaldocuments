(function() {
  'use strict';

  /** @ngInject */
  function BackOfficeController(
    $state, $rootScope, $uibModal, profileService,
    libraryService, apiService) {

    var vm = this;

    if ($rootScope.$$listenerCount.addBookPressed === undefined) {
      $rootScope.$on('addBookPressed', function() {
        vm.addBookModalInstance = $uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title-add-book',
          ariaDescribedBy: 'modal-body-add-book',
          templateUrl: 'app/backoffice/new-book-modal/new-book-modal.html',
          size: 'lg',
          controller: 'NewBookModalController',
          controllerAs: 'vm',
          resolve: {
            profileService: profileService,
            libraryService: libraryService,
            apiService: apiService
          }
        });
      });
    }


    $rootScope.$on('logoutPressed', function() {
      apiService.signOut().then(function() {
        profileService.clear();
        libraryService.clear();
        $state.go('login');
      });
    });
  }

  angular.module('ndApp')
    .controller('BackOfficeController', BackOfficeController);
})();
