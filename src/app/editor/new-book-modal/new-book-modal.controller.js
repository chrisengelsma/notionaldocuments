(function () {
  'use strict';

  /** @ngInject */
  function NewBookModalController($uibModalInstance, profileService, libraryService, apiService, BookFactory) {
    var vm = this;

    vm.title = '';
    vm.processing = false;

    vm.addNewBook = function () {
      vm.processing = true;

      var book = Object.assign({}, BookFactory.empty(vm.title));
      var now = moment().unix();
      book.dateCreated = now;
      book.lastModified = now;
      book.lastModifiedBy = profileService.getProfile().uid;
      apiService.createBook(book).then(function (result) {
        var bookId = result.data;
        libraryService.addBook(bookId, book);
        var bookIds = profileService.getBookIds();
        bookIds.push(bookId);
        profileService.setBookIds(bookIds);
        apiService.updateProfile(profileService.getProfile()).then(function () {
          vm.processing = false;
          $uibModalInstance.close(bookId);
        }).catch(function (error) {
          console.log(error);
        });
      }).catch(function (error) {
        vm.processing = false;
        console.error(error);
      });

    };

    vm.cancel = function () {
      $uibModalInstance.close(false);
    };
  }

  angular.module('ndApp')
    .controller('NewBookModalController', NewBookModalController);

})();
