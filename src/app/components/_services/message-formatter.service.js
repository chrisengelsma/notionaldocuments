(function() {
  'use strict';

  /**
   * @memberOf ndApp
   * @ngdoc    value
   * @name     messageFormatter
   * @ngInject
   */
  function messageFormatter(date, nick, message) {
    return date.toLocaleTimeString() + ' - ' +
      nick + ' - ' +
      message + '\n';
  }

  angular.module('ndApp')
    .value('messageFormatter', messageFormatter);

})();
