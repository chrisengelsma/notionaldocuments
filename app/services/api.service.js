(function() {
  'use strict';

  ApiService.$inject = ['$rootScope', '$q', '$http'];

  function ApiService($rootScope, $q, $http) {
    let ApiService = function() {};

    ApiService.prototype = {
      registerWithEmailAndPassword: registerWithEmailAndPassword,
      signInWithEmailAndPassword: signInWithEmailAndPassword,
      signOut: signOut,

      readProfile: () => { return get('/user/' + $rootScope.uid + '/profile'); },
      updateProfile: (profile) => { return post('/user/' + $rootScope.uid + '/profile', profile); },

      readLibrary: () => { return get('/library'); },
      createBook: (book) => { return post('/library/book', { book: book } ); },
      readBook: (bookId) => { return get('/library/book/' + bookId); },
      updateBook: (bookId, book) => { return post('/library/book/' + bookId + '/update', { book: book }); },

      updatePropositions: (bookId, propositions) => { return post('/library/props/' + bookId, { propositions: propositions }); },
      readPropositions: (bookId) => { return get('/library/props/' + bookId); }
    };

    function registerWithEmailAndPassword(email, password) {
      let d = $q.defer();
      firebase.auth().createUserWithEmailAndPassword(email, password).then((userRecord) => {
        const user = firebase.auth().currentUser;
        $rootScope.uid = user.uid;
        user.getIdToken(true).then((token) => {
          $rootScope.token = token;
          d.resolve();
        }).catch((error) => {
          d.reject(error);
        });
      }, (error) => {
        d.reject(error);
      });
      return d.promise;
    }

    function signInWithEmailAndPassword(email, password) {
      let d = $q.defer();
      firebase.auth().signInWithEmailAndPassword(email, password).then((userRecord) => {
        const user = firebase.auth().currentUser();
        $rootScope.uid = user.uid;
        userRecord.getIdToken(true).then((token) => {
          $rootScope.token = token;
          d.resolve();
        }).catch((error) => {
          d.reject(error);
        });
      }, (error) => {
        d.reject(error);
      });
      return d.promise;
    }

    function signOut() {
      let d = $q.defer();
      firebase.auth().signOut().then(() => {
        $rootScope.uid = '';
        $rootScope.token = '';
        d.resolve();
      }, (error) => { d.reject(error); });
      return d.promise;
    }

    function post(endpoint, obj) {
      let d = $q.defer();
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
        }, function (error) {
          d.reject(error);
        });
      return d.promise;
    }

    function get(endpoint) {
      let d = $q.defer();
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
      let d = $q.defer();
      $http({
        method: 'DELETE',
        url: endpoint,
        headers: { 'Content-Type': 'application/json',
                   'Authorization': 'Bearer ' + $rootScope.token }
      }).then(
        function(result) {
          d.resolve(result);
        }, function(error) {
          d.reject(error);
        });
      return d.promise;
    }

    return ApiService;
  }

  angular.module('notionalApp')
    .service('ApiService', ApiService);

})();
