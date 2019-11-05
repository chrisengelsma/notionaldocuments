(function() {
  'use strict';

  /** @ngInject */
  function RegisterModalController($uibModalInstance, $state) {
    var vm = this;

    vm.errors = {
      passwordsMatch: null,
      malformedEmail: null
    };

    vm.isValid = false;
    vm.passwordVerify = '';

    vm.user = {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };

    vm.register = function(isValid) {
      if (isValid) {
        vm.processing = true;
        vm.apiService.registerWithEmailAndPassword(vm.user.email, vm.user.password)
          .then(function() {
            $uibModalInstance.close(true);
            $state.go('main.backoffice.my-books');
            vm.processing = false;
          }, function(error) {
            console.error(error);
            vm.processing = false;
          });
      }
    };

    vm.cancel = function() {
      $uibModalInstance.close(false);
    };

  }

  angular.module('ndApp')
    .controller('RegisterModalController', RegisterModalController);

})
();
