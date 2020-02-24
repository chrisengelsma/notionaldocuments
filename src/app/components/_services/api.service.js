(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    service
   * @name     ApiService
   * @param    {service} $rootScope AngularJS root scope
   * @param    {service} $q         AngularJS promise service
   * @param    {service} $http      AngularJS http service
   * @ngInject
   */
  function ApiService($rootScope, $q, $http) {

    var apiService = function() {
    };

    /**
     * Registers a new user using an email and password.
     *
     * @memberOf ApiService
     * @function registerWithEmailAndPassword
     * @param    {string} email    an email
     * @param    {string} password a password
     */
    function registerWithEmailAndPassword(email, password) {
      var d = $q.defer();
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function() {
          firebase.auth().onAuthStateChanged(function(user) {
            $rootScope.uid = user.uid;
            user.getIdToken(true).then(function(token) {
              $rootScope.token = token;
              d.resolve();
            }).catch(function(error) {
              d.reject(error);
            });
          });
        }, function(error) {
          d.reject(error);
        });
      return d.promise;
    }

    /**
     * Signs a user in using an email and password.
     *
     * @memberOf ApiService
     * @function signInWithEmailAndPassword
     * @param    {string} email    an email
     * @param    {string} password a password
     */
    function signInWithEmailAndPassword(email, password) {
      var d = $q.defer();
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function() {
          firebase.auth().onAuthStateChanged(function(user) {
            $rootScope.uid = user.uid;
            user.getIdToken(true).then(function(token) {
              $rootScope.token = token;
              d.resolve();
            }).catch(function(error) {
              d.reject(error);
            });
          });
        }, function(error) {
          d.reject(error);
        });
      return d.promise;
    }

    /**
     * Signs a user out.
     *
     * @memberOf ApiService
     * @function signOut
     */
    function signOut() {
      var d = $q.defer();
      console.log('signing out here');
      firebase.auth().signOut().then(function() {
        $rootScope.uid = '';
        $rootScope.token = '';
        d.resolve();
      }, function(error) {
        d.reject(error);
      });
      return d.promise;
    }

    /**
     * Convenience function for submitting POST requests.
     *
     * @memberOf ApiService
     * @function post
     * @param    {string} endpoint an endpoint
     * @param    {any}    data    post request data
     */
    function post(endpoint, data) {
      var d = $q.defer();
      $http({
        method: 'POST',
        url: endpoint,
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + $rootScope.token
        }
      }).then(
        function(result) {
          d.resolve(result);
        }, function(error) {
          d.reject(error);
        });
      return d.promise;
    }

    /**
     * Convenience function for submitting GET requests.
     *
     * @memberOf ApiService
     * @function get
     * @param    {string} endpoint an endpoint
     */
    function get(endpoint) {
      var d = $q.defer();
      $http({
        method: 'GET',
        url: endpoint,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + $rootScope.token
        }
      }).then(
        function(result) {
          d.resolve(result);
        }, function(error) {
          d.reject(error);
        });
      return d.promise;
    }

    /**
     * Convenience function for submitting DELETE requests.
     *
     * @memberOf ApiService
     * @function del
     * @param    {string} endpoint an endpoint
     */
    function del(endpoint) {
      var d = $q.defer();
      $http({
        method: 'DELETE',
        url: endpoint,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + $rootScope.token
        }
      }).then(
        function(result) {
          d.resolve(result);
        }, function(error) {
          d.reject(error);
        });
      return d.promise;
    }

    /**
     * Gets this user's profile.
     *
     * @memberOf ApiService
     * @function readProfile
     * @returns  the user profile
     */
    function readProfile() {
      return get('/user/' + $rootScope.uid + '/profile');
    }

    /**
     * Updates this user's profile.
     *
     * @memberOf ApiService
     * @function updateProfile
     * @param    {object} profile a user profile
     * @returns  the updated profile
     */
    function updateProfile(profile) {
      return post('/user/' + $rootScope.uid + '/profile', profile);
    }

    /**
     * Gets the library.
     * @returns the library
     */
    function readLibrary() {
      return get('/library');
    }

    /**
     * Creates a new book.
     *
     * @memberOf ApiService
     * @function createBook
     * @param    {object} book a book
     * @returns  the book
     */
    function createBook(book) {
      return post('/library/book', { book: book });
    }

    /**
     * Gets a book.
     *
     * @memberOf ApiService
     * @function readBook
     * @param    {string} bookId a book id
     * @returns  the book
     */
    function readBook(bookId) {
      return get('/library/book/' + bookId);
    }

    /**
     * Updates a book.
     *
     * @memberOf ApiService
     * @function updateBook
     * @param    {string} bookId a book id
     * @param    {string} book   the book to update
     */
    function updateBook(bookId, book) {
      return post('/library/book/' + bookId + '/update', { book: book });
    }

    /**
     * Removes a book from this user's library.
     *
     * @memberOf ApiService
     * @function removeBook
     * @param    {string} bookId a book id
     */
    function removeBook(bookId) {
      return del('/library/book/' + bookId);
    }

    /**
     * Updates a book's propositions.
     *
     * @memberOf ApiService
     * @function updatePropositions
     * @param    {string} bookId a book id
     * @param    {object} propositions the propositions
     */
    function updatePropositions(bookId, propositions) {
      return post('/library/props/' + bookId, { propositions: propositions });
    }

    /**
     * Gets a book's propositions.
     *
     * @memberOf ApiService
     * @function readPropositions
     * @param    {string} bookId a book id
     * @returns  the book's propositions
     */
    function readPropositions(bookId) {
      return get('/library/props/' + bookId);
    }

    apiService.prototype = {
      registerWithEmailAndPassword: registerWithEmailAndPassword,
      signInWithEmailAndPassword: signInWithEmailAndPassword,
      signOut: signOut,
      readProfile: readProfile,
      updateProfile: updateProfile,
      readLibrary: readLibrary,
      createBook: createBook,
      readBook: readBook,
      updateBook: updateBook,
      removeBook: removeBook,
      updatePropositions: updatePropositions,
      readPropositions: readPropositions
    };

    return apiService;
  }

  angular.module('ndApp').service('ApiService', ApiService);
})();
