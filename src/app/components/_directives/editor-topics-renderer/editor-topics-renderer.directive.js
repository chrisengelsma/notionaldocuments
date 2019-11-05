(function() {
  'use strict';

  /** @ngInject */
  function EditorTopicsRendererController() {

  }

  /** @ngInject */
  function ndEditorTopicsRenderer() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/_directives/editor-topics-renderer/editor-topics-renderer.html',
      controller: EditorTopicsRendererController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  angular.module('ndApp')
    .directive('ndEditorTopicsRenderer', ndEditorTopicsRenderer);

})();
