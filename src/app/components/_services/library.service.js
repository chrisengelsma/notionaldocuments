(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    service
   * @name     LibraryService
   * @ngInject
   */
  function LibraryService() {
    var library = [];

    var libraryService = function() {
    };

    /**
     * Gets a list of books from a list of book ids.
     * @memberOf LibraryService
     * @function getBooks
     * @param    {string[]} bookIds a list of book ids
     * @returns  a list of books
     */
    function getBooks(bookIds) {
      var books = [];
      for (var key in library) {
        if (bookIds.includes(key)) {
          books.push({ book: library[key], uid: key });
        }
      }
      return books;
    }

    /**
     * Adds a new book to the library.
     * @memberOf LibraryService
     * @function addBook
     * @param    {string} bookId a book id
     * @param    {object} book a book
     */
    function addBook(bookId, book) {
      if (library === '') {
        library = {};
      }
      library[bookId] = book;
    }

    /**
     * Removes a book from the library.
     * @memberOf LibraryService
     * @function removeBook
     * @param    {string} bookId id of book to remove
     */
    function removeBook(bookId) {
      delete library[bookId];
    }

    /**
     * Sets the library.
     * @memberOf LibraryService
     * @function setLibrary
     * @param    {object[]} lib a library
     */
    function setLibrary(lib) {
      library = lib;
    }

    /**
     * Gets the library.
     * @memberOf LibraryService
     * @function getLibrary
     * @returns  {object[]} the libary
     */
    function getLibrary() {
      return library;
    }

    /**
     * Clears this service cache.
     */
    function clear() {
      library = [];
    }

    libraryService.prototype = {
      setLibrary: setLibrary,
      getLibrary: getLibrary,
      addBook: addBook,
      getBooks: getBooks,
      removeBook: removeBook,
      clear: clear
    };

    return libraryService;
  }

  angular.module('ndApp')
    .service('LibraryService', LibraryService);
})();
