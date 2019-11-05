(function() {
  'use strict';

  /** @ngInject */
  function NewBookModalController(
    $uibModalInstance, apiService, libraryService, profileService, BookFactory) {
    var vm = this;

    vm.title = '';
    vm.processing = false;

    vm.addNewBook = function(isValid) {
      if (isValid) {
        vm.processing = true;

        var book = Object.assign({}, BookFactory.empty(vm.title));
        var now = moment().unix();
        book.dateCreated = now;
        book.lastModified = now;
        book.lastModifiedBy = profileService.getProfile().uid;
        apiService.createBook(book).then(function(result) {
          libraryService.addBook(result.data, book);
          profileService.addBookId(result.data.id);
          vm.processing = false;
          $uibModalInstance.close(true);
          /*
          var uid = Object.keys(result.data)[0];
          vm.library = libraryService.getLibrary();
          console.log(libraryCtrl.library);
          vm.userLibrary.push(result.data);
          console.log(libraryCtrl.userLibrary);
          vm.selected.push(result.data);
          console.log(libraryCtrl.selected);
          libraryCtrl.saveLibrary();
           */

        }).catch(function(error) {
          vm.processing = false;
          console.error(error);
        });

      }
    };

    vm.cancel = function() {
      $uibModalInstance.close(false);
    };
  }

  angular.module('ndApp')
    .controller('NewBookModalController', NewBookModalController);
})();
