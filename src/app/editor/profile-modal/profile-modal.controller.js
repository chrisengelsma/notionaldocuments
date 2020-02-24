(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     ProfileModalController
   * @param    {service} $uibModalInstance           AngularJS Bootstrap modal instance
   * @param    {ndApp.ProfileService} profileService Profile service
   * @param    {ndApp.LibraryService} libraryService Library service
   * @param    {ndApp.ApiService} apiService         API service
   * @ngInject
   */
  function ProfileModalController($uibModalInstance, profileService, libraryService, apiService) {
    var vm = this;

    vm.profile = profileService.getProfile();
    vm.processing = false;

    /**
     * Saves the updated profile.
     * @memberOf ProfileModalController
     * @function updateProfile
     */
    vm.updateProfile = function() {
      vm.processing = true;
      return apiService.updateProfile(vm.profile).then(function(result) {
        vm.profile = result.data;
        profileService.setProfile(result.data);
        vm.processing = false;
        vm.dismiss();
      }).catch(function(error) {
        vm.processing = false;
        vm.profileError = error.message;
      });
    };

    /**
     * Closes this modal.
     * @memberOf ProfileModalController
     * @function dismiss
     */
    vm.dismiss = function() {
      vm.processing = false;
      $uibModalInstance.dismiss();
    };
  }

  angular.module('ndApp')
    .controller('ProfileModalController', ProfileModalController);

})();
