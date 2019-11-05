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
            apiService: function(ApiService) {
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
                if (result.status !== 200) {
                  $state.go('login');
                  return;
                }
                return result.data;
              }).catch(function(error) {
                console.error(error);
                $state.go('login');
              });
            },
            library: function($state, apiService) {
              return apiService.readLibrary().then(function(result) {
                if (result.status !== 200) {
                  $state.go('login');
                  return;
                }
                return result.data;
              }).catch(function(error) {
                console.error(error);
                $state.go('login');
              });
            }
          }
        })
        .state('main.editor', {
          url: '/editor/:bookId',
          controller: 'EditorController',
          controllerAs: 'vm',
          templateUrl: 'app/editor/editor.html',
          resolve: {
            book: function(apiService, $stateParams, $state) {
              if (!$stateParams.bookId) {
                console.error('No bookId specified, retreating');
                $state.go('main.backoffice.my-books');
              }
              var bookId = $stateParams.bookId;

              return apiService.readBook(bookId).then(function(result) {
                return [result.data];
              }).catch(function(error) {
                console.error(error);
                $state.go('main.backoffice.my-books');
              });
            },
            propositions: function(apiService, $state, $stateParams) {
              if (!$stateParams.bookId) {
                console.error('No bookId specified, retreating');
                $state.go('main.backoffice.my-books');
              }
              var bookId = $stateParams.bookId;

              return apiService.readPropositions(bookId)
                .then(function(result) {
                  console.log('propositions', result);
                  return result.data;
                }).catch(function(error) {
                  console.error(error);
                  $state.go('main.backoffice.my-books');
                });
            }
          }
        })
        .state('main.backoffice', {
          url: '/backoffice',
          templateUrl: 'app/backoffice/backoffice.html',
          controller: 'BackOfficeController',
          controllerAs: 'vm'
        })
        .state('main.backoffice.profile', {
          url: '/profile',
          templateUrl: 'app/backoffice/backoffice-profile/backoffice-profile.html',
          controller: 'BackOfficeProfileController',
          controllerAs: 'vm'
        })
        .state('main.backoffice.my-books', {
          url: '/my-books',
          templateUrl: 'app/backoffice/backoffice-my-books/backoffice-my-books.html',
          controller: 'BackOfficeMyBooksController',
          controllerAs: 'vm'
        })
        .state('main.backoffice.library', {
          url: '/library',
          templateUrl: 'app/backoffice/backoffice-library/backoffice-library.html',
          controller: 'BackOfficeLibraryController',
          controllerAs: 'vm'
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
                      $state.go('main.backoffice.library');
                    }
                  }).catch(function(error) {
                    console.error(error);
                    return;
                  });
                }
              });
            }
          }
        });

      $urlRouterProvider.when('/', '/login');
      $urlRouterProvider.when('/backoffice', '/backoffice/my-books');
      $urlRouterProvider.otherwise('/');

    });
})();
