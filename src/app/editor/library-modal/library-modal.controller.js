(function() {
  'use strict';

  /** @ngInject */
  function LibraryModalController($uibModalInstance, profileService, libraryService, apiService) {
    var vm = this;

    vm.lastClickDelete = null;
    vm.selected = profileService.getBookIds();
    vm.books = libraryService.getLibrary();

    vm.toggleSelection = function(uid) {
      var idx = vm.selected.indexOf(uid);

      if (idx > -1) {
        vm.selected.splice(idx, 1);
      } else {
        vm.selected.push(uid);
      }

      vm.saveLibrary();
    };

    vm.saveLibrary = function() {
      profileService.setBookIds(vm.selected);
      apiService.updateProfile(profileService.getProfile()).then(function() {
      }).catch(function(error) {
        console.log(error);
      });
    };

    vm.isInUserLibrary = function(uid) {
      return vm.selected.includes(uid);
    };

    vm.editUserLibrary = function(uid) {
      if (vm.isInUserLibrary(uid)) {
        var index = vm.selected.indexOf(uid);
        vm.selected.splice(index, 1);
      } else {
        vm.selected.push(uid);
      }
    };

    vm.removeBook = function() {
      var bookId = vm.lastClickDelete;
      var book = vm.books[bookId];
      if (book !== undefined) {
        apiService.removeBook(bookId).then(function() {

          libraryService.removeBook(bookId, book);
          profileService.removeBookId(bookId);

          vm.books = libraryService.getLibrary();
          vm.selected = profileService.getBookIds();

        }).catch(function(error) {
          console.error(error);
        });
      }
    };

    vm.dismiss = function() {
      $uibModalInstance.dismiss();
    };
  }

  angular.module('ndApp')
    .controller('LibraryModalController', LibraryModalController);

})();
