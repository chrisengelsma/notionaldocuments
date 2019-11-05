(function() {
  'use strict';

  /** @ngInject */
  function BackOfficeProfileController(
    profileService, libraryService, apiService) {
    var vm = this;

    vm.profile = profileService.getProfile();
    vm.processing = false;

    vm.updateProfile = function(callback) {
      vm.processing = true;
      return apiService.updateProfile(vm.profile).then(function(result) {
        vm.profile = result.data;
        profileService.setProfile(result.data);
        if (typeof callback === 'function') {
          callback();
        }
      }).catch(function(error) {
        vm.profileError = error.message;
      });
    };
  }

  angular.module('ndApp')
    .controller('BackOfficeProfileController', BackOfficeProfileController);

})();
