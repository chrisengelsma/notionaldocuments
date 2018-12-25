(function() {
  'use strict';

  LibraryService.$inject = [];

  function LibraryService() {
    let library = [];

    const libraryService = function() { };

    libraryService.prototype = {
      setLibrary: setLibrary,
      getLibrary: getLibrary,
      addBook: addBook,
      getBooks: getBooks,
      clear: clear
    };

    function getBooks(uids) {
      let books = [];
      for (let key in library) {
        if (uids.includes(key)) {
          books.push(library[key]);
        }
      }
      return books;
    }

    function addBook(uid, value) {
      if (library === '') {
        library = {};
      }
      library[uid] = value;
    }

    function setLibrary(value) {
      library = value;
    }

    function getLibrary() {
      return library;
    }

    function clear() {
      library = [];
    }

    return libraryService;
  }

  angular.module('notionalApp')
    .service('LibraryService', LibraryService);

})();
