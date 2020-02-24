(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     LoginModalController
   * @param    {service} $uibModalInstance   AngularJS Bootstrap modal instance
   * @param    {ndApp.ApiService} ApiService API service
   * @ngInject
   */
  function LoginModalController($uibModalInstance, ApiService) {
    var vm = this;

    vm.apiService = new ApiService();
    vm.processing = false;

    vm.user = {
      email: '',
      password: ''
    };

    /**
     * Authenticates the user and closes this modal.
     *
     * @memberOf LoginModalController
     * @function login
     */
    vm.login = function() {
      vm.processing = true;
      vm.apiService.signInWithEmailAndPassword(vm.user.email, vm.user.password)
        .then(function() {
          vm.processing = false;
          $uibModalInstance.dismiss(true);
        }, function(error) {
          console.error(error);
          vm.processing = false;
        });
    };

    /**
     * Closes this modal.
     *
     * @memberOf LoginModalController
     * @function cancel
     */
    vm.cancel = function() {
      $uibModalInstance.dismiss(false);
    };
  }

  angular.module('ndApp')
    .controller('LoginModalController', LoginModalController);

})();
