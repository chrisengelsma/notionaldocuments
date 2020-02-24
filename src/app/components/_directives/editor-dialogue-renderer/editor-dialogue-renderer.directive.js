(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    controller
   * @name     EditorDialogueRendererController
   * @description
   *    Implementation for the editor dialog renderer controller.
   * @ngInject
   */
  function EditorDialogueRendererController() {
  }

  /**
   * @memberOf ndApp
   * @ngdoc    directive
   * @name     ndEditorDialogueRenderer
   * @description
   *    Renders editor dialogue.
   * @ngInject */
  function ndEditorDialogueRenderer() {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'app/components/_directives/editor-dialogue-renderer/editor-dialogue-renderer.html',
      controller: EditorDialogueRendererController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndEditorDialogueRenderer', ndEditorDialogueRenderer);

})();
