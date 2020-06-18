(function() {
  'use strict';

  angular.module('ndApp')
    .config(function($stateProvider, $urlRouterProvider) {

      $stateProvider
        .state('main', {
          name: 'main',
          abstract: true,
          template: '<ui-view />',
          resolve: {
            auth: function($rootScope) {
              
              firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                  $rootScope.uid = user.uid;
                  user.getIdToken().then(function(token) {
                    $rootScope.token = token;
                  }).catch(function(error) {
                    console.error(error);
                  });
                }
              });
            },
            apiService: function(auth, ApiService) {
              
              return new ApiService();
            },
            libraryService: function(LibraryService, library) {
             
              var libraryService = new LibraryService();
              libraryService.setLibrary(library);
              return libraryService;
            },
            profileService: function(ProfileService, profile) {
              
              var profileService = new ProfileService();
              profileService.setProfile(profile);
              return profileService;
            },
            profile: function($state, apiService) {
              
              return apiService.readProfile().then(function(result) {
                if (result.status === 200) {
                  return result.data;
                } else {
                  return {};
                }
              }).catch(function(error) {
                console.error(error);
              });
            },
            library: function($state, apiService) {
              console.log('resolving library');
              return apiService.readLibrary().then(function(result) {
                if (result.status === 200) {
                  return result.data;
                } else {
                  return {};
                }
              }).catch(function(error) {
                console.error(error);
              });
            },

          }
        })
        .state('main.editor', {
          url: '/editor/:bookId',
          controller: 'EditorController',
          controllerAs: 'vm',
          templateUrl: 'app/editor/editor.html'
        })
        .state('login', {
          url: '/login',
          controller: 'LandingController',
          controllerAs: 'vm',
          templateUrl: 'app/landing/landing.html',
          resolve: {
            requiresNoAuth: function($rootScope, $state) {
              return firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                  $rootScope.uid = user.uid;
                  user.getIdToken().then(function(token) {
                    $rootScope.token = token;
                    if ($rootScope.redirectToEditor) {
                      $rootScope.redirectToEditor = false;
                      $state.go('main.editor', $rootScope.editorParams);
                    } else {
                      $state.go('main.editor');
                    }
                  }).catch(function(error) {
                    console.error(error);
                  });
                }
              });
            }
          }
        });

      $urlRouterProvider.when('/', '/login');
      $urlRouterProvider.otherwise('/');

    });
})();
