(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     NewBookModalController
   * @param    {service} $uibModalInstance           AngularJS Bootstrap modal instance
   * @param    {ndApp.ProfileService} profileService Profile service provider
   * @param    {ndApp.LibraryService} libraryService Library service provider
   * @param    {ndApp.ApiService} apiService         API service provider
   * @param    {ndApp.BookFactory} BookFactory       Book factory
   * @ngInject
   */
  function NewBookModalController($uibModalInstance, profileService, libraryService, apiService, BookFactory) {
    var vm = this;

    vm.title = '';
    vm.processing = false;

    /**
     * Adds a new book and closes this modal.
     * @memberOf NewBookModalController
     * @function addNewBook
     */
    vm.addNewBook = function() {
      vm.processing = true;

      var book = Object.assign({}, BookFactory.empty(vm.title));
      var now = moment().unix();

      book.dateCreated = now;
      book.lastModified = now;
      book.lastModifiedBy = profileService.getProfile().uid;

      apiService.createBook(book).then(function(result) {

        var bookId = result.data;
        libraryService.addBook(bookId, book);

        var bookIds = profileService.getBookIds();
        bookIds.push(bookId);

        profileService.setBookIds(bookIds);

        apiService.updateProfile(profileService.getProfile()).then(function() {
          vm.processing = false;
          $uibModalInstance.close(bookId);
        }).catch(function(error) {
          console.log(error);
        });
      }).catch(function(error) {
        vm.processing = false;
        console.error(error);
      });

    };

    /**
     * Closes this modal without creating a new book.
     * @memberOf NewBookModalController
     * @function cancel
     */
    vm.cancel = function() {
      vm.processing = false;
      $uibModalInstance.close(false);
    };
  }

  angular.module('ndApp')
    .controller('NewBookModalController', NewBookModalController);
})();
