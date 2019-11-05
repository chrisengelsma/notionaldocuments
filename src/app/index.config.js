(function() {
  'use strict';

  /** @ngInject */
  function config($logProvider, toastrConfig, $locationProvider) {
    // Enable log
    $logProvider.debugEnabled(true);

    // $locationProvider.html5Mode({ enabled: true });

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-bottom-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;
    var firebaseConfig = {
      apiKey: 'AIzaSyAM1xXKEHxIHuoMWPdiIrnOiZyXtL-us6E',
      authDomain: 'notionaldocuments-march.firebaseapp.com',
      databaseURL: 'https://notionaldocuments-march.firebaseio.com',
      projectId: 'notionaldocuments-march',
      storageBucket: 'notionaldocuments-march.appspot.com',
      messagingSenderId: '68298833353'
    };
    firebase.initializeApp(firebaseConfig);
  }

  angular.module('ndApp').config(config);
})();
