(function () {
  'use strict';

  /** @ngInject */
  function MyBooksModalController($uibModalInstance, profileService, libraryService) {
    var vm = this;

    vm.books = libraryService.getBooks(profileService.getBookIds());
    vm.profile = profileService.getProfile();

    vm.selectBook = function(uid) {
      $uibModalInstance.close(uid);
    };

    vm.dismiss = function() {
      $uibModalInstance.dismiss();
    };

  }

  angular.module('ndApp')
    .controller('MyBooksModalController', MyBooksModalController);

})();
