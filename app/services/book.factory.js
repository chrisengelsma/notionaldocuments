(function() {
  'use strict';

  BookFactory.$inject = [];

  function BookFactory() {
    return {
      empty: empty
    };

    /**
     * Returns an empty book
     */
    function empty() {
      return {
        class: 'HA',
        address: [0],
        topic: '',
        isTitle: true,
        dateCreated: null,
        lastModified: null,
        paragraphs: [
          {
            paragraphId: '8nU2S1lP3yfUEhSAw3c9',
            position: 0,
            propositions: [
              {
                id: 'Ngmyk1lP1KfffhSAw333',
                type: 'blank',
                author: '',
                text: '',
                position: 0,
                of: {},
                remarks: [],
                dialogueSide: false
              }
            ]
          }
        ],
        children: []
      };
    }
  }

  angular.module('notionalApp')
    .factory('BookFactory', BookFactory);
})();
