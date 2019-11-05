(function() {
  'use strict';

  /** @ngInject */
  function LoginModalController(
    $uibModalInstance, $rootScope, $state, ApiService) {
    var vm = this;
    vm.apiService = new ApiService();
    vm.processing = false;

    vm.user = {
      email: '',
      password: ''
    };

    vm.login = function(isValid) {
      if (isValid) {
        vm.processing = true;
        vm.apiService.signInWithEmailAndPassword(vm.user.email, vm.user.password)
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
    .controller('LoginModalController', LoginModalController);

})();
