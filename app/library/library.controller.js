(function () {
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
        libraryCtrl.userLibrary.splice(index, 1);
      } else {
        libraryCtrl.userLibrary.push(uid);
      }
    };

    libraryCtrl.toggleSelection = (uid) => {
      const idx = libraryCtrl.selected.indexOf(uid);

      if (idx > -1) {
        libraryCtrl.selected.splice(idx, 1);
      } // if there, remove one item at the index
      else {
        libraryCtrl.selected.push(uid);
      }               // if not there, push uid to selected

      libraryCtrl.saveLibrary();
    };

    /**
     * Removes a book.
     *
     * @param bookId the book id.
     */
    libraryCtrl.removeBook = (bookId) => {
      const book = libraryCtrl.library[bookId];
      if (book !== undefined) {
        apiService.removeBook(bookId).then((result) => {

          // I don't like how these are decoupled.
          // These should be connected using observables.

          libraryService.removeBook(bookId, book);
          libraryCtrl.library = libraryService.getLibrary();

          profileService.removeBookId(bookId);
          libraryCtrl.userLibrary = profileService.getBookIds();

        }).catch((error) => {
          console.error(error);
        });
      }
    };


    libraryCtrl.addBook = () => {
      const book = Object.assign({}, libraryCtrl.newBook);
      const now = moment().unix();
      book.dateCreated = now;
      book.lastModified = now;
      book.lastModifiedBy = profileService.getProfile().uid;
      apiService.createBook(book).then((result) => {
        libraryService.addBook(result.data, book);
        const uid = Object.keys(result.data)[0];
        libraryCtrl.library = libraryService.getLibrary();
        console.log(libraryCtrl.library);
        libraryCtrl.userLibrary.push(result.data);
        console.log(libraryCtrl.userLibrary);
        libraryCtrl.selected.push(result.data);
        console.log(libraryCtrl.selected);
        libraryCtrl.saveLibrary();

      }).catch((error) => {
        console.error(error);
      });
    };

  }

  angular.module('notionalApp')
    .controller('LibraryController', LibraryController);

})();
