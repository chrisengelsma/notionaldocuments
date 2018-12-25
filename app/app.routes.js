(function() {
  'use strict';

  angular.module('notionalApp')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/profile');
      $urlRouterProvider.when('/', '/profile');

      $stateProvider
        .state('app', {
          abstract: true,
          name: 'app',
          resolve: {
            apiService: ['ApiService', (ApiService) => {
              return new ApiService();
            }],
            libraryService: ['LibraryService', 'library', (LibraryService, library) => {
              let libraryService = new LibraryService();
              libraryService.setLibrary(library);
              return libraryService;
            }],
            profileService: ['ProfileService', 'profile', (ProfileService, profile) => {
              let profileService = new ProfileService();
              profileService.setProfile(profile);
              return profileService;
            }],
            profile: ['$state', 'apiService', ($state, apiService) => {
              return apiService.readProfile().then((result) => {
                if (result.status !== 200) {
                  $state.go('login');
                }
                return result.data;
              }).catch((error) => {
                console.error(error);
                $state.go('login');
              });
            }],
            library: ['$state', 'apiService', ($state, apiService) => {
              return apiService.readLibrary().then((result) => {
                if (result.status !== 200) {
                  $state.go('login');
                }
                return result.data;
              }).catch((error) => {
                console.error(error);
                $state.go('login');
              });
            }]
          }
        })
        .state('app.editor', {
          url: '/editor',
          controller: 'EditorController',
          controllerAs: 'editorCtrl',
          templateUrl: './app/editor/editor.controller.html',
          resolve: {
            propositions: ['apiService', 'profileService', (apiService, profileService) => {
              const uid = profileService.getProfile().lastEditedBook;
              return apiService.readPropositions(uid).then((result) => {
                return result.data;
              }).catch((error) => {
                console.error(error);
              });
            }]
          }
        })
        .state('app.backoffice', {
          url: '/',
         templateUrl: './app/backoffice/backoffice.controller.html'
        })
        .state('app.backoffice.profile', {
          url: 'profile',
          templateUrl: './app/backoffice/views/backoffice.profile.html',
          controller: 'BackOfficeController',
          controllerAs: 'backofficeCtrl',
        })
        .state('app.backoffice.mybooks', {
          url: 'mybooks',
          templateUrl: './app/backoffice/views/backoffice.mybooks.html',
          controller: 'BackOfficeController',
          controllerAs: 'backofficeCtrl',
        })
        .state('app.backoffice.library', {
          url: 'library',
          templateUrl: './app/library/library.controller.html',
          controller: 'LibraryController',
          controllerAs: 'libraryCtrl',
        })
        .state('login', {
          url: '/login',
          controller: 'AuthController',
          controllerAs: 'authCtrl',
          templateUrl: './app/auth/auth.controller.html',
          resolve: {
            requiresNoAuth: ['$rootScope', '$state', ($rootScope, $state) => {
              return firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                  $rootScope.uid = user.uid;
                  user.getIdToken(true).then((token) => {
                    $rootScope.token = token;
                    $state.go('app.backoffice');
                  }).catch((error) => {
                    console.error(error);
                  });
                }
              });
            }]
          }
        });
    }]);
})();
