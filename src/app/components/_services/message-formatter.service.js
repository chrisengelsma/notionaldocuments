(function() {
  'use strict';

  /** @ngInject */
  function messageFormatter(date, nick, message) {
    return date.toLocaleTimeString() + ' - ' +
      nick + ' - ' +
      message + '\n';
  }

  angular.module('ndApp')
    .value('messageFormatter', messageFormatter);

})();
