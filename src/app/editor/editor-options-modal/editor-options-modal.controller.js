(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     EditorOptionsModalController
   * @param    {service} $uibModalInstance AngularJS Bootstrap modal instance
   * @param    {object} options            modal options
   * @ngInject
   */
  function EditorOptionsModalController($uibModalInstance, options) {
    var vm = this;

    vm.options = options;

    vm.close = function() {
      $uibModalInstance.close(vm.options);
    };
  }

  angular.module('ndApp')
    .controller('EditorOptionsModalController', EditorOptionsModalController);

})();
