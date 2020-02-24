(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    service
   * @name     ProfileService
   * @ngInject
   */
  function ProfileService() {
    var profileService = function() {};

    var profile = {};
    var selectedBook = null;

    /**
     * Sets the profile.
     * @memberOf ProfileService
     * @function setProfile
     * @param    {object} value the profile
     */
    function setProfile(value) {
      profile = value;
    }

    /**
     * Gets the profile.
     * @memberOf ProfileService
     * @function getProfile
     * @returns  {object} the profile.
     */
    function getProfile() {
      return profile;
    }

    /**
     * Sets the book ids associated with this profile.
     * @memberOf ProfileService
     * @function setBookIds
     * @param    {string[]} bookIds a list of book ids.
     */
    function setBookIds(bookIds) {
      profile.books = bookIds;
    }

    /**
     * Adds a book id to this user's list of book ids.
     * @memberOf ProfileService
     * @function addBookId
     * @param    {string} bookId a book id
     */
    function addBookId(bookId) {
      if (profile.books) {
        var existingId = profile.books.filter(function(x) {return x === bookId;});
        if (!existingId) {
          profile.books.push(bookId);
        }
      }
    }

    /**
     * Removes a book id from this user's list of book ids.
     * @memberOf ProfileService
     * @function removeBookId
     * @param    {string} bookId a book id
     */
    function removeBookId(bookId) {
      if (profile.books) {
        profile = profile.books.filter(function(x) {return x !== bookId;});
      }
    }

    /**
     * Gets the list of book ids for this user.
     * @memberOf ProfileService
     * @function getBookIds
     * @returns  {string[]} a list of book ids
     */
    function getBookIds() {
      return profile.books || [];
    }

    /**
     * Sets the selected book.
     * @memberOf ProfileService
     * @function setSelectedBook
     * @param    {string} bookId a book id
     */
    function setSelectedBook(bookId) {
      selectedBook = bookId;
    }

    /**
     * Gets the selected book id.
     * @memberOf ProfileService
     * @function getSelectedBook
     * @returns  {string} the selected book id
     */
    function getSelectedBook() {
      return selectedBook;
    }

    /**
     * Clears this profile.
     * @memberOf ProfileService
     * @function clear
     */
    function clear() {
      profile = {};
      selectedBook = null;
    }

    profileService.prototype = {
      setProfile: setProfile,
      getProfile: getProfile,
      getBookIds: getBookIds,
      setBookIds: setBookIds,
      removeBookId: removeBookId,
      addBookId: addBookId,
      setSelectedBook: setSelectedBook,
      getSelectedBook: getSelectedBook,
      clear: clear
    };

    return profileService;
  }

  angular.module('ndApp')
    .service('ProfileService', ProfileService);

})();
