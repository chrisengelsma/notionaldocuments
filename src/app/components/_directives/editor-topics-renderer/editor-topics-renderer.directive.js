(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     EditorTopicsRendererController
   * @description
   *    Implementation of the editor topics renderer controller.
   * @ngInject
   */
  function EditorTopicsRendererController() {
  }

  /**
   * @memberOf ndApp
   * @ngdoc    directive
   * @name     ndEditorTopicsRenderer
   * @description
   *    Renders editor topics.
   * @ngInject
   */
  function ndEditorTopicsRenderer() {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'app/components/_directives/editor-topics-renderer/editor-topics-renderer.html',
      controller: EditorTopicsRendererController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndEditorTopicsRenderer', ndEditorTopicsRenderer);

})();
