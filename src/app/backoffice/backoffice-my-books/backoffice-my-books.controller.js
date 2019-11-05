(function () {
  'use strict';

  /** @ngInject */
  function BackOfficeMyBooksController(libraryService, profileService, $state) {
    var vm = this;

    vm.books = libraryService.getBooks(profileService.getBookIds());
    vm.profile = profileService.getProfile();

    vm.selectBook = function(index) {
      vm.profile.lastEditedBook = vm.profile.books[index];
      profileService.setSelectedBook( [ vm.books[index] ] );
      $state.go('main.editor', { bookId: vm.profile.books[index] });
    };

  }

  angular.module('ndApp')
    .controller('BackOfficeMyBooksController', BackOfficeMyBooksController);

})();
