(function() {
  'use strict';

  /** @ngInject */
  function EditorDialogueRendererController() {

  }

  /** @ngInject */
  function ndEditorDialogueRenderer() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/_directives/editor-dialogue-renderer/editor-dialogue-renderer.html',
      controller: EditorDialogueRendererController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndEditorDialogueRenderer', ndEditorDialogueRenderer);

})();
