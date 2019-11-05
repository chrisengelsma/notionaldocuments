(function() {
  'use strict';

  /** @ngInject */
  function BackOfficeController($rootScope, $uibModal, profileService, libraryService, apiService) {
    $rootScope.$on('addBookPressed', function() {
      $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-top',
        ariaDescribedBy: 'modal-body-top',
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

  angular.module('ndApp')
    .controller('BackOfficeController', BackOfficeController);
})();
