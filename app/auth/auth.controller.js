(function() {
  'use strict';

  AuthController.$inject = ['$rootScope', '$state', 'ApiService', 'moment'];

  function AuthController($rootScope, $state, ApiService, moment) {
    const authCtrl = this;

    let apiService = new ApiService();

    authCtrl.user = {
      email: '',
      password: ''
    };

    authCtrl.login = function() {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
        apiService.signInWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password).then(() => {
          $state.go('app.profile');
        }).catch((error) => {
          authCtrl.errorMessage = error.message;
        });
      }).catch((error) => {
        console.error(error);
      });
    };

    authCtrl.register = function() {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
        apiService.registerWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password).then(() => {
          const now = moment().unix();
          let data = {
            emailAddress: authCtrl.user.email,
            displayName: 'New User',
            lastModified: now,
            dateCreated: now
          };
          apiService.updateProfile(data).then(() => {
            $state.go('app.profile');
          }).catch((error) => {
            authCtrl.errorMessage = error.message;
          });
        }).catch((error) => {
          authCtrl.errorMessage = error.message;
        });
      }).catch((error) => {
        console.error(error);
      });
    };
  }

  angular.module('notionalApp')
    .controller('AuthController', AuthController);

})();
