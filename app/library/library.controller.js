(function() {
  'use strict';

  LibraryController.$inject = ['$state', 'profileService', 'libraryService', 'apiService', 'BookFactory', 'moment'];

  function LibraryController($state, profileService, libraryService, apiService, BookFactory, moment) {
    let libraryCtrl = this;

    libraryCtrl.selected = profileService.getBookIds();
    libraryCtrl.library = libraryService.getLibrary();
    libraryCtrl.userLibrary = profileService.getBookIds();
    libraryCtrl.newBook = BookFactory.empty();

    libraryCtrl.saveLibrary = () => {
      profileService.setBookIds(libraryCtrl.userLibrary);
      apiService.updateProfile(profileService.getProfile()).then(() => {
        $state.go('app.profile');
      }).catch((error) => {
        console.log(error);
      });
    };

    libraryCtrl.isInUserLibrary = (uid) => {
      return libraryCtrl.userLibrary.includes(uid);
    };

    libraryCtrl.editUserLibrary = (uid) => {
      if (libraryCtrl.isInUserLibrary(uid)) {
        const index = libraryCtrl.userLibrary.indexOf(uid);
        libraryCtrl.userLibrary.splice(index,1);
      } else {
        libraryCtrl.userLibrary.push(uid);
      }
    };

    libraryCtrl.toggleSelection = (uid) => {
      const idx = libraryCtrl.selected.indexOf(uid);

      if (idx > -1) { libraryCtrl.selected.splice(idx, 1); } // if there, remove one item at the index
      else { libraryCtrl.selected.push(uid); }               // if not there, push uid to selected

      libraryCtrl.saveLibrary();
    };

    libraryCtrl.addBook = () => {
      const book = Object.assign({}, libraryCtrl.newBook);
      const now = moment().unix();
      book.dateCreated = now;
      book.lastModified = now;
      book.lastModifiedBy = profileService.getProfile().uid;
      apiService.createBook(book).then((result) => {
        libraryService.addBook(result.data, book);
        libraryCtrl.library = libraryService.getLibrary();
      }).catch((error) => {
        console.log(error);
      });
    };

  }

  angular.module('notionalApp')
    .controller('LibraryController', LibraryController);

})();
