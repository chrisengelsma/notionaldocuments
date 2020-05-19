(function() {
  'use strict';

  /** @ngInject */
  function BookFactory(IdFactory) {

    // TODO This needs to be defined as a typed object with enums and such
    var empty = function(title) {
      return {
        class: 'HA', // What is this?? 
        // -- ND was originally going to use the Library of Congress' classification system. 
        //HA is Statistics - JC
        address: [0],
        topic: title,
        isTitle: true,
        dateCreated: Date(),
        lastModified: null,
        nodePath: '$scope.data[0]',
        paragraphs: [
          {
            first: true,
            paragraphId: IdFactory.next(),
            position: 0,
            propositions: [
              {
                id: IdFactory.next(),
                type: 'blank',
                author: '',
                text: '',
                position: 0,
                of: {},
                remarks: [],
                dialogueSide: false,
                nodePath: '$scope.data[0]',
                address: [0],
                first: true
              }
            ]
          }
        ],
        children: []
      };
    };

    return {
      empty: empty
    };

  }

  angular.module('ndApp')
    .factory('BookFactory', BookFactory);
})();
