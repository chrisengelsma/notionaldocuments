(function () {
  'use strict';

  BackOfficeController.$inject = ['$state', 'profileService', 'apiService', 'libraryService'];

  function BackOfficeController($state, profileService, apiService, libraryService) {
    const backofficeCtrl = this;

    backofficeCtrl.profile = profileService.getProfile();
    backofficeCtrl.books = libraryService.getBooks(profileService.getBookIds());

    backofficeCtrl.selectBook = function(index) {
      backofficeCtrl.profile.lastEditedBook = backofficeCtrl.profile.books[index];
      profileService.setSelectedBook( [ backofficeCtrl.books[index] ] );
      $state.go('app.editor');
    };

    backofficeCtrl.updateProfile = function(callback) {
      return apiService.updateProfile(backofficeCtrl.profile).then((result) => {
        backofficeCtrl.profile = result.data;
        backofficeCtrl.success = 'Successfully updated profile';
        profileService.setProfile(result.data);
        if (typeof callback === 'function') { callback(); }
      }).catch((error) => { backofficeCtrl.profileError = error.message; });
    };

    backofficeCtrl.goToLibrary = function() {
      $state.go('app.library');
    };

    backofficeCtrl.logout = function() {
      apiService.signOut().then(() => {
        profileService.clear();
        libraryService.clear();
        $state.go('login');
      });
    };
  }

  angular.module('notionalApp')
    .controller('BackOfficeController', BackOfficeController);
})();
