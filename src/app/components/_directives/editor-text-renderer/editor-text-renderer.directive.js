(function() {
  'use strict';

  /** @ngInject */
  function EditorTextRendererController() {

  }

  /** @ngInject */
  function ndEditorTextRenderer() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/_directives/editor-text-renderer/editor-text-renderer.html',
      controller: EditorTextRendererController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndEditorTextRenderer', ndEditorTextRenderer);

})();
