(function() {
  'use strict';

  /** @ngInject */
  function ApiService($rootScope, $q, $http) {
    var apiService = function() {
    };

    apiService.prototype = {
      registerWithEmailAndPassword: registerWithEmailAndPassword,

      signInWithEmailAndPassword: signInWithEmailAndPassword,

      signOut: signOut,

      readProfile: function() {
        return get('/user/' + $rootScope.uid + '/profile');
      },

      updateProfile: function(profile) {
        return post('/user/' + $rootScope.uid + '/profile', profile);
      },

      readLibrary: function() {
        return get('/library');
      },
      createBook: function(book) {
        return post('/library/book', { book: book });
      },
      readBook: function(bookId) {
        return get('/library/book/' + bookId);
      },
      updateBook: function(bookId, book) {
        return post('/library/book/' + bookId + '/update', { book: book });
      },

      removeBook: function(bookId) {
        return del('/library/book/' + bookId);
      },

      updatePropositions: function(bookId, propositions) {
        return post('/library/props/' + bookId, { propositions: propositions });
      },
      readPropositions: function(bookId) {
        return get('/library/props/' + bookId);
      }
    };

    function registerWithEmailAndPassword(email, password) {
      var d = $q.defer();
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(/*userRecord*/) {
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

    function signInWithEmailAndPassword(email, password) {
      var d = $q.defer();
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(/*userRecord*/) {
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

    function signOut() {
      var d = $q.defer();
      firebase.auth().signOut().then(function() {
        $rootScope.uid = '';
        $rootScope.token = '';
        d.resolve();
      }, function(error) {
        d.reject(error);
      });
      return d.promise;
    }

    function post(endpoint, obj) {
      var d = $q.defer();
      $http({
        method: 'POST',
        url: endpoint,
        data: JSON.stringify(obj),
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

    return apiService;
  }

  angular.module('ndApp').service('ApiService', ApiService);
})();
