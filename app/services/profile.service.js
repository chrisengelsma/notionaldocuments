(function () {
  'use strict';

  ProfileService.$inject = [];

  function ProfileService() {
    const profileService = function() {};

    let profile = {};
    let selectedBook = null;

    profileService.prototype = {
      setProfile: setProfile,
      getProfile: getProfile,
      getBookIds: getBookIds,
      setBookIds: setBookIds,
      setSelectedBook: setSelectedBook,
      getSelectedBook: getSelectedBook,
      clear: clear
    };

    function setProfile(value) {
      profile = value;
    }

    function getProfile() {
      console.log(profile);
      return profile;
    }

    function setBookIds(value) {
      profile.books = value;
    }

    function getBookIds() {
      return profile.books || [];
    }

    function setSelectedBook(value) {
      selectedBook = value;
    }

    function getSelectedBook() {
      return selectedBook;
    }

    function clear() {
      profile = {};
      selectedBook = null;
    }

    return profileService;
  }

  angular.module('notionalApp')
    .service('ProfileService', ProfileService);

})();
