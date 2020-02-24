(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     RegisterModalController
   * @param    {service} $uibModalInstance angular bootstrap modal instance
   * @param    {service} $state ui-router state provider
   * @param    {service} ApiService the API service
   * @description
   *    Implementation of the RegisterModalController.
   *
   *    Initializes an empty user on construction persists the submitted user registration
   *    information.
   * @ngInject
   */
  function RegisterModalController($uibModalInstance, $state, ApiService) {
    var vm = this;

    vm.apiService = new ApiService();

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

    /**
     * Registers a new user and closes this modal.
     * @memberOf RegisterModalController
     * @function register
     */
    vm.register = function() {
      vm.processing = true;
      vm.apiService.registerWithEmailAndPassword(vm.user.email, vm.user.password)
        .then(function() {
          vm.apiService.updateProfile({
            displayName: vm.user.firstName + ' ' + vm.user.lastName,
            firstName: vm.user.firstName,
            lastName: vm.user.lastName,
            email: vm.user.email
          }).then(function() {
            vm.processing = false;
            $uibModalInstance.dismiss(true);
          }).catch(function(error) {
            console.error(error);
            vm.processing = false;
          });
        }, function(error) {
          console.error(error);
          vm.processing = false;
        });
    };

    /**
     * Closes this modal.
     */
    vm.cancel = function() {
      $uibModalInstance.dismiss();
    };

  }

  angular.module('ndApp')
    .controller('RegisterModalController', RegisterModalController);

})();
