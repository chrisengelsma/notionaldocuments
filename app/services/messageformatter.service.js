(function() {
  'use strict';

  messageFormatter.$inject = ['date', 'nick', 'message'];

  function messageFormatter(date, nick, message) {
    return date.toLocaleTimeString() + ' - ' +
      nick + ' - ' +
      message + '\n';
  }

  angular.module('notionalApp')
    .value('messageFormatter', messageFormatter);

})();
