(function() {
  'use strict';

  /** @ngInject */
  function NewBookModalController(
    $uibModalInstance, profileService, libraryService,
    apiService, BookFactory) {
    var vm = this;

    vm.title = '';
    vm.processing = false;

    vm.addNewBook = function() {
      vm.processing = true;

      var book = Object.assign({}, BookFactory.empty(vm.title));
      var now = moment().unix();
      book.dateCreated = now;
      book.lastModified = now;
      book.lastModifiedBy = profileService.getProfile().uid;
      apiService.createBook(book).then(function(result) {
        console.log(result);
        libraryService.addBook(result.data, book);
        profileService.addBookId(result.data);
        vm.processing = false;
        $uibModalInstance.close(result.data);
      }).catch(function(error) {
        vm.processing = false;
        console.error(error);
      });

    };

    vm.cancel = function() {
      $uibModalInstance.close(false);
    };
  }

  angular.module('ndApp')
    .controller('NewBookModalController', NewBookModalController);
})();
