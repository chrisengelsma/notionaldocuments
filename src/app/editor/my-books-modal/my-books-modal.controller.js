(function () {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     MyBooksModalController
   * @param    {service} $uibModalInstance           AngularJS Bootstrap modal instance
   * @param    {ndApp.ProfileService} profileService Profile service provider
   * @param    {ndApp.LibraryService} libraryService Library service provider
   * @ngInject
   */
  function MyBooksModalController($uibModalInstance, profileService, libraryService) {
    var vm = this;

    vm.books = libraryService.getBooks(profileService.getBookIds());
    vm.profile = profileService.getProfile();

    /**
     * Selects a book and closes this modal.
     * @memberOf MyBooksModalController
     * @param    {string} bookId a book id
     */
    vm.selectBook = function(bookId) {
      $uibModalInstance.close(bookId);
    };

    /**
     * Closes this modal.
     */
    vm.cancel = function() {
      $uibModalInstance.dismiss();
    };

  }

  angular.module('ndApp')
    .controller('MyBooksModalController', MyBooksModalController);

})();
