(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     LibraryModalController
   * @param    {service} $uibModalInstance           AngularJS Bootstrap modal instance
   * @param    {ndApp.ProfileService} profileService Profile service provider
   * @param    {ndApp.LibraryService} libraryService Library service provider
   * @param    {ndApp.ApiService} apiService         API service provider
   * @ngInject
   */
  function LibraryModalController($uibModalInstance, profileService, libraryService, apiService) {
    var vm = this;

    vm.lastClickDelete = null;
    vm.selected = profileService.getBookIds();
    vm.books = libraryService.getLibrary();

    /**
     * Toggles the selected books
     *
     * @memberOf LibraryModalController
     * @function toggleSelection
     * @param    {string} bookId id of book to toggle.
     */
    vm.toggleSelection = function(bookId) {
      var idx = vm.selected.indexOf(bookId);

      if (idx > -1) {
        vm.selected.splice(idx, 1);
      } else {
        vm.selected.push(bookId);
      }

      vm.saveLibrary();
    };

    /**
     * Saves the library.
     *
     * @memberOf LibraryModalController
     * @function saveLibrary
     */
    vm.saveLibrary = function() {
      profileService.setBookIds(vm.selected);
      apiService.updateProfile(profileService.getProfile()).then(function() {
      }).catch(function(error) {
        console.log(error);
      });
    };

    /**
     * Determines if a book with a given id is in the user's library.
     *
     * @memberOf LibraryModalController
     * @function isInUserLibrary
     * @param    {string} bookId a book id
     * @returns true, if book is in user library; false, otherwise
     */
    vm.isInUserLibrary = function(bookId) {
      return vm.selected.includes(bookId);
    };

    /**
     * Removes a book from the library.
     *
     * @memberOf LibraryModalController
     * @function removeBook
     */
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

    /**
     * Closes this modal.
     *
     * @memberOf LibraryModalController
     * @function cancel
     */
    vm.cancel = function() {
      $uibModalInstance.dismiss();
    };
  }

  angular.module('ndApp')
    .controller('LibraryModalController', LibraryModalController);

})();
