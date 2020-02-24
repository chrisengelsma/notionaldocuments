(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     EditorTextRendererController
   * @description
   *    Implementation for the editor text renderer controller.
   * @ngInject
   */
  function EditorTextRendererController() {

  }

  /**
   * @memberOf ndApp
   * @ngdoc    directive
   * @name     ndEditorTextRenderer
   * @description
   *    Renders editor text component.
   * @ngInject
   */
  function ndEditorTextRenderer() {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'app/components/_directives/editor-text-renderer/editor-text-renderer.html',
      controller: EditorTextRendererController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndEditorTextRenderer', ndEditorTextRenderer);

})();
