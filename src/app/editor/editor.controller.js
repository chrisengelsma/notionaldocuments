(function() {
  'use strict';

  /** @ngInject */
  function EditorController(
    $log,
    $state,
    $location,
    $interval,
    $rootScope,
    $scope,
    $sce,
    $stateParams,
    chatSocket,
    apiService,
    profileService,
    libraryService,
    profile,
    library,
    $uibModal,
    messageFormatter,
    focusFactory,
    Notification,
    $document,
    $timeout,
    IdFactory) {

    // Check to load profile if we're logged in and profile isn't loaded for some reason
    $interval(function() {
      if ($rootScope.uid && $rootScope.token && $scope.profile === undefined) {
        apiService.readProfile().then(function(res) {
          if (res.status === 200) {
            profileService.setProfile(res.data);
            $scope.profile = profileService.getProfile();
            $scope.userId = $rootScope.uid;
          }
        });
        apiService.readLibrary().then(function(res) {
          if (res.status === 200) {
            libraryService.setLibrary(res.data);
            $scope.library = libraryService.getLibrary();
          }
        });
      }
    }, 500);

    // Function that clears vestigial stuff saved into the model
    $scope.makePristine = function () {
      function traverse(x, key, obj) {
        if (isArray(x)) {
        traverseArray(x)
        } else if ((typeof x === 'object') && (x !== null)) {
          traverseObject(x)
        } else {
          if (key == 'color'){
            obj.color = '#ffffff';
            
          }
   
        }
      }

      function traverseArray(arr) { 
        arr.forEach(function (x) {
          traverse(x)
        })
      }

      function traverseObject(obj) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            traverse(obj[key], key, obj)
          }
        }
      }

      function isArray(o) {
        return Object.prototype.toString.call(o) === '[object Array]'
      }

      
      if (!$scope.once){
        $scope.once = true;
        traverse($scope.data[0])
      }
            
      
      if ($('.cursor').is('.visible-cursor')){
        $('.cursor').removeClass('visible-cursor')
        $('.cursor').addClass('invisible-cursor')
      }

      if ($('.bottomparagraphadder').is('.blackline')){
        $('.cursor').removeClass('blackline')
      }
    }

    // Inverts page colors
    $scope.invert = function() {
      var css = 'html {-webkit-filter: invert(100%);' +
        '-moz-filter: invert(100%);' + 
        '-o-filter: invert(100%);' + 
        '-ms-filter: invert(100%); }',
      head = document.getElementsByTagName('head')[0],
      style = document.createElement('style');
      if (!window.counter){ 
        window.counter = 1;
        } else  { 
          window.counter ++;
        }
      if (window.counter % 2 == 0) { 
        var css =
        'html {-webkit-filter: invert(0%); -moz-filter: invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }'
      }
      style.type = 'text/css';
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);
    }
    
    // Modal button function for new books
    $scope.openNewBookModal = function() {
      $scope.addBookModalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-new-book',
        ariaDescribedBy: 'modal-body-new-book',
        templateUrl: 'app/editor/new-book-modal/new-book-modal.html',
        size: 'lg',
        controller: 'NewBookModalController',
        controllerAs: 'vm',
        resolve: {
          profileService: profileService,
          libraryService: libraryService,
          apiService: apiService
        }
      }).result.then(function(bookId) {
        if (bookId) {
          $state.go('main.editor', { bookId: bookId });
        }
      });
    };

    $scope.openLibraryModal = function() {
      $scope.addBookModalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-library',
        ariaDescribedBy: 'modal-body-library',
        templateUrl: 'app/editor/library-modal/library-modal.html',
        size: 'lg',
        controller: 'LibraryModalController',
        controllerAs: 'vm',
        resolve: {
          profileService: profileService,
          libraryService: libraryService,
          apiService: apiService
        }
      });
    };

    $scope.openLoginModal = function() {
      $scope.loginModalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-login',
        ariaDescribedBy: 'modal-body-login',
        templateUrl: 'app/landing/login-modal/login-modal.html',
        size: 'lg',
        controller: 'LoginModalController',
        controllerAs: 'vm'
      }).result.then(function(success) {
        if (success) {
          $location.reload();
        }
      });
    };

    $scope.openRegisterModal = function() {
      $scope.loginModalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-register',
        ariaDescribedBy: 'modal-body-register',
        templateUrl: 'app/landing/register-modal/register-modal.html',
        size: 'lg',
        controller: 'RegisterModalController',
        controllerAs: 'vm'
      }).result.then(function(success) {
        if (success) {
          $location.reload();
        }
      });
    };

    $scope.openProfileModal = function() {
      $scope.addBookModalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-profile',
        ariaDescribedBy: 'modal-body-profile',
        templateUrl: 'app/editor/profile-modal/profile-modal.html',
        size: 'lg',
        controller: 'ProfileModalController',
        controllerAs: 'vm',
        resolve: {
          profileService: profileService,
          libraryService: libraryService,
          apiService: apiService
        }
      }).result.then(function() {
        this.profile = profileService.getProfile();
      });
    };

    $scope.openMyBooksModal = function() {
      $scope.addBookModalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title-my-books',
        ariaDescribedBy: 'modal-body-my-books',
        templateUrl: 'app/editor/my-books-modal/my-books-modal.html',
        size: 'lg',
        controller: 'MyBooksModalController',
        controllerAs: 'vm',
        resolve: {
          profileService: profileService,
          libraryService: libraryService
        }
      }).result.then(function(bookId) {
        if (bookId) {
          $state.go('main.editor', { bookId: bookId });
        }
      });

    };

    $scope.openOptionsModal = function() {
      var optionsModalInstance = $uibModal.open({
        ariaLabelledBy: 'modal-title-editor-options',
        ariaDescribedBy: 'modal-body-editor-options',
        templateUrl: 'app/editor/editor-options-modal/editor-options-modal.html',
        controller: 'EditorOptionsModalController',
        controllerAs: 'vm',
        size: 'md',
        resolve: {
          options: function() { return $scope.options; }
        }
      }).result.then(function(res) {
        $scope.options = res;
      });

    };

    // Loading data
    $scope.loadData = function(bookId) {
      apiService.readBook(bookId).then(function(result) {
        $scope.data = [result.data];
        $scope.title = $scope.data[0].topic;
        apiService.readPropositions(bookId).then(function(result) {
          if (result) {
            $scope.propositions = result.data;
            $scope.mainLoop();
          }
        }).catch(function(error) {
          // console.error(error);
        });
      }).catch(function(error) {
        // console.error(error);
      });
    };

    // If a book id is present, load it
    if ($stateParams.bookId) {
      $scope.bookId = $stateParams.bookId;
      $scope.loadData($scope.bookId);
    }

    // Frontend option variables
    $scope.options = {
      highlightOwned: false,
      dimNotOwned: false
    };

    $scope.title = '';
    $scope.profile = profileService.getProfile();
    $scope.userId = $rootScope.uid;

    $scope.loggedIn = function() {
      return $rootScope.uid !== undefined;
    };

    // Main function
    $scope.mainLoop = function() {
      $scope.treeOptions = {};
      $scope.mousedOverProposition = {};
      $scope.topics = [{}];
      $scope.scroll = {};
      $scope.keyword = {};
      $scope.messageLog = '';
      $scope.inputs = {};
      $scope.selectedThread = {};
      $scope.preselectedProposition = {};
      $scope.selectedRemark = {};
      $scope.of = {};
      $scope.highlight = {};
      $scope.mark = {};
      $scope.doubleClick = 0;
      $scope.whatHasBeenClicked = '';
      $scope.dontrunfocusout = false;
      $scope.hasTopFocus = '';
      $scope.hasBottomFocus = {};
      $scope.hasLeftFocus = '';
      $scope.hasRightFocus = {};
      $scope.hasChatFocusThreadId = ''
      $scope.hasChatFocusId = ''
      $scope.toBeClearedLater = {};
      $scope.toSetLater = {};
      $scope.threadAddMouseover = '';
      $scope.threadAdding = '';
      $scope.newProp;
      $scope.stopToggle = false;
      $scope.once = false;
      $scope.lastItemCursorLayer = 0;
      var hidden = '';
      var visibilityChange = '';

      var prep = {};
      var apply = {};
      var temp = {};


      //   Pastel colors for paragraphs
      $scope.pastels = ['#f9ceee','#e0cdff','#c1f0fb','#dcf9a8','#ffebaf']
      $scope.otherPastels = ['#ffbec4', '#edf5dd', '#d0f1e5', '#dbe0f1']
      // had '#FFDAC1' and '#ffd1cd' also; extra redscale shades

      // Blur listener
      if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
        hidden = "hidden";
        visibilityChange = "visibilitychange";
      } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
      }

      var dialogueList = document.getElementById("dialoguelist");

      function handleVisibilityChange() {
        if (document[hidden]) {
            
            $scope.clearBlankOnBlur();
          } else {
           return;
          }
      }

      // Warn if the browser doesn't support addEventListener or the Page Visibility API
      if (typeof document.addEventListener === "undefined" || hidden === undefined) {
        console.log('')
      } else {
        // Handle page visibility change   
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
          

      }



      // Shuffles paragraph color order
      function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
          }
          return array;
      }

      shuffle($scope.otherPastels);

      $scope.userColorTable = [];

      //initializes as number of colors in the palette
      $scope.userColorCount = $scope.otherPastels.length;

      // For picking a color from the palette
      $scope.generateNewColor = function () {
        var index = $scope.userColorCount % $scope.otherPastels.length;
        $scope.userColorCount++;
        return $scope.otherPastels[index];
      }

      $scope.toggleNode = function(node){
        node.minimized = !node.minimized;
      }

      // Upon load, assigns colors to paragraphs
      $scope.assignColorsToExistingParagraphs = function () {
        function traverse(x, key, obj) {
          if (isArray(x)) {
            traverseArray(x)
          } else if ((typeof x === 'object') && (x !== null)) {
            traverseObject(x)
          } else {
            if (key == 'owner'){
              for (var i = 0; i < $scope.userColorTable.length; i++){
                if (x == $scope.userColorTable[i].author && x !== $scope.userId){
                  
                  var alreadyThere = true;
                  var index = i;
                  break;
                }
              }
              if (!alreadyThere && x !== $scope.userId && x !== ''){
                
                $scope.userColorTable.push(
                  {
                    author: x, 
                    color: $scope.generateNewColor()
                  }
                )
                  
                obj.color = $scope.userColorTable[$scope.userColorTable.length-1].color;  
                 
              } else if (x !== $scope.userId && x !== '') {
               
                obj.color = $scope.userColorTable[index].color;
              }
            }
              apply = {};
              if (key === 'class'){
                var theNode = document.getElementById(obj.nodeId);
                var theNodeParagraphs = theNode.querySelectorAll(".paragraph");
                for (var m = 0; m < theNodeParagraphs.length; m++){
                  console.log("the node paragraphs html: ", theNodeParagraphs[m].innerText, " (",m,")")
                  var isFirst = theNodeParagraphs[m].id.toString().slice(9); 
                  break;
                }
                console.log("obj.paragraphs: ", obj.paragraphs)
                if (isFirst){
                  for (var n = 0; n < obj.paragraphs.length; n++){
                    if (obj.paragraphs[n].paragraphId === isFirst &&
                      obj.paragraphs[n][$scope.userId] !== 'hidden' &&
                      !obj.paragraphs[n].hiddenForAll){
                      obj.paragraphs[n].first = true;
                    } else {
                      obj.paragraphs[n].first = false;
                    }
                  }
                } else {
                  for (var n = 0; n < obj.paragraphs.length; n++){
                    obj.paragraphs[i].first = false;
                  }
                }
                  
                // propositions
                for (var i = 0; i < obj.paragraphs.length; i++){
                // for all paragraphs

                  for (var j = 0; j < obj.paragraphs[i].propositions.length; j++){
                  // and all propositions
                    if (obj.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
                    !obj.paragraphs[i].propositions[j].hiddenForAll){
                      obj.paragraphs[i].propositions[j].first = true;
                      for (var k = j; k < obj.paragraphs[i].propositions.length; k++){
                        if (k > j){ 
                          obj.paragraphs[i].propositions[k].first = false;
                        }
                      }
                      j = obj.paragraphs[i].propositions.length;
                    } else {
                      obj.paragraphs[i].propositions[j].first = false;
                    }
                  }
                }
                // apply.nodeDestination = eval(obj.nodePath)
                // for (var i = 0; i < apply.nodeDestination.paragraphs.length; i++){
                // // for all paragraph
                //   for (var j = 0; j < apply.nodeDestination.paragraphs[i].propositions.length; j++){
                //   // and all propositions
                //     if (apply.nodeDestination.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
                //     !apply.nodeDestination.paragraphs[i].propositions[j].hiddenForAll){
                //       apply.nodeDestination.paragraphs[i].propositions[j].first = true;
                //       for (var k = j; k < apply.nodeDestination.paragraphs[i].propositions.length; k++){
                //         if (k > j){
                //           apply.nodeDestination.paragraphs[i].propositions[k].first = false;
                //         }
                //       }
                //       j = apply.nodeDestination.paragraphs[i].propositions.length;
                //     } else {
                //       apply.nodeDestination.paragraphs[i].propositions[j].first = false;
                //     }
                //   }
                //   if (apply.nodeDestination.paragraphs[i][$scope.userId] !== 'hidden' &&
                //   !apply.nodeDestination.paragraphs[i].hiddenForAll){
                //     apply.nodeDestination.paragraphs[i].first = true;
                //     for (var k = i; k < apply.nodeDestination.paragraphs.length; k++){
                //       if (k > i){
                //         apply.nodeDestination.paragraphs[k].first = false;
                //       }
                //     }
                //     i = apply.nodeDestination.paragraphs.length;
                //   } else {
                //     apply.nodeDestination.first = false;
                //   } 
                // }
              }
            apply = {};
          }
        }

        function traverseArray(arr) { 
          arr.forEach(function (x) {
            traverse(x)
          })
        }

        function traverseObject(obj) {
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              traverse(obj[key], key, obj)
            }
          }
        }

        function isArray(o) {
          return Object.prototype.toString.call(o) === '[object Array]'
        }

        // Executes
        traverse($scope.data[0])
      }

      $scope.assignColorsToExistingRemarks = function () {
        function traverse(x, key, obj) {
          if (isArray(x)) {
            traverseArray(x)
          } else if ((typeof x === 'object') && (x !== null)) {
            traverseObject(x)
          } else {
            if (key == 'author'){
              for (var i = 0; i < $scope.userColorTable.length; i++){
                if (x == $scope.userColorTable[i].author && x !== $scope.userId){
                  var alreadyThere = true;
                  var index = i;
                  break;
                }
              }
              if (x !== $scope.userId && x !== '' && obj.type !== 'topic') { 
                obj.color = $scope.userColorTable[index].color;
              }

            }
          }
        }

        function traverseArray(arr) { 
          arr.forEach(function (x) {
            traverse(x)
          })
        }

        function traverseObject(obj) {
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              traverse(obj[key], key, obj)
            }
          }
        }

        function isArray(o) {
          return Object.prototype.toString.call(o) === '[object Array]'
        }

        // Executes
        traverse($scope.data[0].dialogue)
      }

      // Runs functions that clean up vestigial stuff saved into the data
      $scope.makePristine();
      $scope.assignColorsToExistingParagraphs();
      $scope.assignColorsToExistingRemarks();

      //Initializing clear blank on blur
      $scope.clearBlankOnBlur = function(){
        console.log('INITIALIZING clear blank on blur')

        function traverseArray(arr) { 
          arr.forEach(function (x) {
            traverse(x)
          })
        }

        function traverseObject(obj) {
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              traverse(obj[key], key, obj)
            }
          }
        }

        function isArray(o) {
          return Object.prototype.toString.call(o) === '[object Array]'
        }

        function traverse(x, key, obj) {
          if (isArray(x)) {
            traverseArray(x)
          } else if ((typeof x === 'object') && (x !== null)) {
            traverseObject(x)
          } else {
            if (key === 'type'){
              if (x === 'blank' && document.activeElement.id !== obj['id'] && obj.nodePath){
                // Clearing blanks:
                // When there are other visible paragraphs in the node
                // When the blank has right focus
                // Its found a blank with an id and nodePath
                apply = {};        
                apply.nodeDestination = eval(obj.nodePath);
                apply.assigned = false;

                for (var i = 0; i < apply.nodeDestination.paragraphs.length; i++){
                  apply.paragraphDestination = apply.nodeDestination.paragraphs[i];
                  
                  for (var j = 0; j < apply.paragraphDestination.propositions.length; j++){
                    if (apply.paragraphDestination.propositions[j].id === obj['id'] &&
                    apply.paragraphDestination.propositions[j].id !== $scope.hasRightFocus.id){
                      for (var k = 0; k < apply.nodeDestination.paragraphs.length; k++){
                        // Go through the paragraphs in the nodepath
                        if (apply.nodeDestination.paragraphs[k][$scope.userId] !== 'hidden' && 
                        !apply.nodeDestination.paragraphs[k].hiddenForAll &&
                        apply.nodeDestination.paragraphs[k].paragraphId !== apply.paragraphDestination.paragraphId
                        ){
                        
                          apply.assigned = true;
                          for (var l = 0; l < apply.paragraphDestination.propositions.length; l++){
                            if (obj['id'] === apply.paragraphDestination.propositions[l].id && 
                            !apply.paragraphDestination.propositions[l].hiddenForAll &&
                            apply.paragraphDestination.propositions[l][$scope.userId] !== 'hidden'){
                              apply.paragraphPosition = apply.paragraphDestination.position;
                              apply.position = l;
                              apply.address = obj['address'];
                              apply.nodePath = obj['nodePath'];
                              apply.payload = {
                                class: apply.nodeDestination.class,
                                topic: apply.nodeDestination.topic,
                                paragraphPosition: apply.paragraphPosition,
                                position: apply.position,
                                address: apply.address,
                                nodePath: apply.nodePath,
                                proposition: apply.nodeDestination.paragraphs[apply.paragraphPosition].propositions[apply.position],
                                author: obj['author'],
                                id: obj['id'],
                                paragraphId: apply.paragraphDestination.paragraphId,
                                hideBlank: true,
                                paragraphBlankId: IdFactory.next(),
                                blankId: IdFactory.next(),
                                deleter: $scope.userId,
                                bookId: $scope.bookId
                              }
                              console.log('Payload to be deleted: ', apply.payload);
                              chatSocket.emit('deletion', $scope.userId, apply.payload);
                              apply = {};
                              // $scope.hasRightFocus.id = '';
                              apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
                              apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
                              profileService.setSelectedBook($scope.data[0]);
                              return;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
            // x is the value for a key that's not an object or array
            // key is the key
            // obj is the object being processed
        
        traverse($scope.data[0])
      }

      // Scrolls to the bottom of messages
      $timeout(function() {
        var pane = document.getElementById('dialoguelist');
        pane.scrollTop = pane.scrollHeight;
      }, 30);

      // If an empty book, focus on the blank proposition
      var blankClickAssigned = {};
      for (var i = 0; i < $scope.data[0].paragraphs.length; i++){
        for (var j = 0; j < $scope.data[0].paragraphs[i].propositions.length; j++){
          if ($scope.data[0].paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
          $scope.data[0].paragraphs[i].propositions[j].hiddenForAll !== true &&
          $scope.data[0].paragraphs[i].propositions[j].type !== 'blank'){
            blankClickAssigned.assigned = true;
            break;
          } else if ($scope.data[0].paragraphs[i].propositions[j].type === 'blank' &&
                    $scope.data[0].paragraphs[i].propositions[j].hiddenForAll !== true &&
                     $scope.data[0].paragraphs[i].propositions[j][$scope.userId] !== 'hidden' ){
                       blankClickAssigned.id = $scope.data[0].paragraphs[i].propositions[j].id;
                       blankClickAssigned.paragraphPosition = $scope.data[0].paragraphs[i].position;
                       blankClickAssigned.position = $scope.data[0].paragraphs[i].propositions[j].position;
                      

          }
        }
      }
      if (!blankClickAssigned.assigned){
        $scope.selectedNode = $scope.data[0];
        $scope.selectedParagraph = $scope.data[0].paragraphs[blankClickAssigned.paragraphPosition];
        $scope.selectedProposition = $scope.data[0].paragraphs[blankClickAssigned.paragraphPosition].propositions[blankClickAssigned.position];
        $timeout( function(){
          
          document.getElementById('proposition'+ blankClickAssigned.id).click();
          
          blankClickAssigned = {};
        },10)
        
      } else {
        
        $scope.clearBlankOnBlur();
        blankClickAssigned = {};
      }

      
      // If the data doesn't have a dialogue, make the dialogue empty
      if (!$scope.data[0].hasOwnProperty('dialogue')) {
        $scope.data[0].dialogue = [];
      }
    

      // When propositions are being typed as new messages on a topic
      $scope.showThreadAdd = function (thread) {

        setTimeout(function() {
          $scope.$apply(function() {
            $scope.hasChatFocusId = '';
            $scope.hasChatFocusThreadId = '';
            $scope.threadAdding = thread.threadId;
            $('#addto' + thread.threadId).expanding();
            focusFactory('addto' + thread.threadId)
          });
        }, 20);

        setTimeout(function() {
          $scope.$apply(function() {
            $scope.hasChatFocusId = '';
            $scope.hasChatFocusThreadId = '';
            $scope.threadAdding = thread.threadId;
            $('#addto' + thread.threadId).expanding();
            $('#addto' + thread.threadId).expanding(); //duplicate
            focusFactory('addto' + thread.threadId)
          });
        }, 20);
        $scope.stopToggle = true;

      }

      // Hides 
      $scope.hideThreadAdd = function () {
        $scope.threadAdding = '';
        $scope.stopToggle = true;
      }

      // For when clicks do multiple things
      $scope.exitNgClick = function () {
        $scope.stopToggle = false;
      }

      

      // Fires sometimes
      $scope.selectBlank = function (node) {
        var id = $scope.data[0].paragraphs[0].propositions[0].id;
        $scope.selectedNode = node;
        $scope.selectedParagraph = $scope.data[0].paragraphs[0];
        $scope.selectedProposition = $scope.data[0].paragraphs[0].propositions[0];
        $timeout( function(){
          document.getElementById('proposition' + id).click();
        },0)         
      }

      // Signs out
      $scope.logout = function() {
        apiService.signOut().then(function() {
          profileService.clear();
          libraryService.clear();
          $state.go('login');
        });
      };

      //For copying direct link addresses when built out
      // document.querySelector("#copy-button").onclick = function() {
      // Select the content
      // document.querySelector("#copy-input").select();
      // Copy to the clipboard
      // document.execCommand('copy');
      // };

      // Open and close navs, might be able to delete these functions
      $scope.openNav = function() {
        document.getElementById('myNav').style.height = '100%';
      };

      $scope.closeNav = function() {
        document.getElementById('myNav').style.height = '0%';
      };

      // For blurring the text
      $scope.blurText = function() {
        if (document.getElementById('tree-root').classList
          .contains('dialogueblurrer')) {
          document.getElementById('tree-root').classList
            .remove('dialogueblurrer');
        } else {
          document.getElementById('tree-root').classList
            .add('dialogueblurrer');
        }
      };

      // For text blurrer
      $scope.mouseOverTextBlurrer = function() {
        document.getElementById('textblurrer').classList
          .add('dialogueblurrermouseover');
      };

      // Leave text blurrer
      $scope.mouseLeaveTextBlurrer = function() {
        document.getElementById('textblurrer').classList
          .remove('dialogueblurrermouseover');
      };

      // Blurs dialogue
      $scope.blurDialogue = function() {
        if (document.getElementById('dialoguepane').classList
          .contains('dialogueblurrer')) {
          document.getElementById('dialoguepane').classList
            .remove('dialogueblurrer');
        } else {
          document.getElementById('dialoguepane').classList
            .add('dialogueblurrer');
        }
      };

      // For dialogue blurrer
      $scope.mouseOverDialogueBlurrer = function() {
        document.getElementById('dialogueblurrer').classList
          .add('dialogueblurrermouseover');
      };

      // Leave dialogue blurrer
      $scope.mouseLeaveDialogueBlurrer = function() {
        document.getElementById('dialogueblurrer').classList
          .remove('dialogueblurrermouseover');
      };

      // Assigns mouseover to a proposition and keeps track of which proposition has the mouse over
      $scope.mouseOver = function(proposition) {
        $scope.mousedOverProposition = proposition;
        $scope.mousedOverProposition.mouseOver = true;
      };

      // Clears upon mouseleave
      $scope.mouseLeave = function() {
        $scope.mousedOverProposition = {};
      };

      // Clears the selected proposition and paragraph
      $scope.clearSelectedProposition = function() {
        $scope.selectedProposition = null;
        $scope.selectedParagraph = null;
      };

      // Selects right editable span
      $scope.selectRight = function(proposition){
        focusFactory(proposition.id);
      }

      $scope.assignRightFocus = function (proposition){
        
        $scope.hasRightFocus.id = proposition.id;
      }

      // Selects left editable span
      $scope.selectLeft = function(proposition, paragraph){
        $scope.selectedProposition = proposition
      }

      // Selects node
      $scope.selectNode = function(node) {
        $scope.selectedNode = node;

      };

      // Selects paragraph
      $scope.selectParagraph = function(paragraph) {
        
        $scope.selectedParagraph = paragraph;
        paragraph.cursor = false;
      };

      $scope.clearBlankOnBlur = function(proposition){
        if (proposition){
          if(proposition.type === 'blank'){
            return;
          }     
        }

        function traverseArray(arr) { 
          arr.forEach(function (x) {
            traverse(x)
          })
        }

        function traverseObject(obj) {
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              traverse(obj[key], key, obj)
            }
          }
        }

        function isArray(o) {
          return Object.prototype.toString.call(o) === '[object Array]'
        }

        function traverse(x, key, obj) {
          if (isArray(x)) {
            traverseArray(x)
          } else if ((typeof x === 'object') && (x !== null)) {
            traverseObject(x)
          } else {
            if (key === 'type'){

              if (x === 'blank' && document.activeElement.id !== obj['id'] && obj.nodePath){
                // Clearing blanks:
                // When there are other visible paragraphs in the node
                // When the blank has right focus
                // Its found a blank with an id and nodePath
                
                apply = {
                  nodeDestination: eval(obj.nodePath),
                  assigned: false

                };        
       
                // console.log("Active element: ", document.activeElement)
                // apply.nodeDestination = eval(obj.nodePath);
                // apply.assigned = false;
                for (var i = 0; i < apply.nodeDestination.paragraphs.length; i++){
                  
                  apply.paragraphDestination = apply.nodeDestination.paragraphs[i];
                  

                  for (var j = 0; j < apply.paragraphDestination.propositions.length; j++){
                  
                    if (apply.paragraphDestination.propositions[j].id === obj['id'] &&
                    apply.paragraphDestination.propositions[j].id !== $scope.hasRightFocus.id){
                   

                      for (var k = 0; k < apply.nodeDestination.paragraphs.length; k++){
                
                        if (apply.nodeDestination.paragraphs[k][$scope.userId] !== 'hidden' && 
                        !apply.nodeDestination.paragraphs[k].hiddenForAll &&
                        apply.nodeDestination.paragraphs[k].paragraphId !== apply.paragraphDestination.paragraphId
                        ){
                         
                          
                          apply.assigned = true;
                          for (var l = 0; l < apply.paragraphDestination.propositions.length; l++){
                           
                            if (obj['id'] === apply.paragraphDestination.propositions[l].id && 
                            !apply.paragraphDestination.propositions[l].hiddenForAll &&
                            apply.paragraphDestination.propositions[l][$scope.userId] !== 'hidden'){
                           
                              apply.paragraphPosition = apply.paragraphDestination.position;
                              apply.position = l;
                           
                              apply.address = obj['address'];
                              apply.nodePath = obj['nodePath'];
                              apply.payload = {
                                class: apply.nodeDestination.class,
                                topic: apply.nodeDestination.topic,
                                paragraphPosition: apply.paragraphPosition,
                                position: apply.position,
                                address: apply.address,
                                nodePath: apply.nodePath,
                                proposition: apply.nodeDestination.paragraphs[apply.paragraphPosition].propositions[apply.position],
                                author: obj['author'],
                                id: obj['id'],
                                paragraphId: apply.paragraphDestination.paragraphId,
                                hideBlank: true,
                                paragraphBlankId: IdFactory.next(),
                                blankId: IdFactory.next(),
                                deleter: $scope.userId,
                                bookId: $scope.bookId
                              }
                              console.log('Payload to be deleted: ', apply.payload);
                              chatSocket.emit('deletion', $scope.userId, apply.payload);
                              apply = {};                              apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
                              apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
                              profileService.setSelectedBook($scope.data[0]);
                              return;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
            // x is the value for a key that's not an object or array
            // key is the key
            // obj is the object being processed
        
        traverse($scope.data[0])
      }

      // Makes a new left id and focuses on it
      $scope.clearWithLeftAdder = function() {
        $scope.leftAdderId = IdFactory.next();
        focusFactory($scope.leftAdderId);
      };

      // Manages top adder selection
      $scope.clearWithTopAdder = function(paragraph) {
        
        $timeout( function(){
            $scope.$apply(function() {
              $scope.selectedProposition = {};
              $scope.selectedProposition.textSide = true;
              $scope.topAdderId = IdFactory.next();
              $scope.hasTopFocus = paragraph.paragraphId;
              focusFactory($scope.topAdderId);
            })
        },0)
      };



      // Manages bottom adder selection
      $scope.clearWithBottomAdder = function(paragraph) {
        $timeout( function(){
          $scope.$apply(function() {
            paragraph.bottomAdd = true;
            
            $scope.hasBottomFocus.id = paragraph.paragraphId;
            
            $scope.selectedProposition = {};
            $scope.selectedProposition.textSide = true;
            focusFactory(paragraph.paragraphId);
          })
        },0)
      };

      

      // For ordering the paragraphs, with one's own paragraphs on top
      // Will not work right if over a thousand paragraphs in the node
      $scope.paragraphSorter = function (paragraph) {
        var value = 0;
        if (paragraph.owner == $scope.userId){
          value++;
        } else if (paragraph.owner && paragraph.owner !== $scope.userId) {
          value++;
          value++;
        }
        value = value + paragraph.position*.001;
        return value;
      }

      $scope.findFirst = function (node, paragraphId){
        // console.log("Runs findfirst paragraph")
        // var initFunction = true;
        // var theNode = document.getElementById(node.nodeId);
        // var theNodeParagraphs = theNode.querySelectorAll(".paragraph");
        // for (var m = 0; m < theNodeParagraphs.length; m++){
        //   console.log("Ng repeat index ", m, ": ", theNodeParagraphs[m])
          
        //     var isFirst = theNodeParagraphs[m].id.toString().slice(9); 
        //     break;
        //     console.log("Node paragraphs: ", node.paragraphs)
        // }
        // if (isFirst && initFunction == false){
        //   console.log("there is an isfirst")
          
        //   for (var n = 0; n < node.paragraphs.length; n++){
        //     if (node.paragraphs[n].paragraphId === isFirst){
        //         node.paragraphs[n].first = true;
        //     } else {
        //       node.paragraphs[n].first = false;
        //     }
        //   }
        // } else if (!initFunction) {
       
        //   for (var n = 0; n < node.paragraphs.length; n++){
        //     node.paragraphs[i].first = false;
        //   }
        // }
        
        
        // if (isFirst === paragraphId && initFunction == true){
        //     return true;
        // } else if (initFunction == true){
        //   return false;
        // }
        

      }

      $scope.findFirstProposition = function (paragraph, id){
        //paragraphId is paragraph in the iterator
        // want to find out if the 
        
        for (var i = 0; i < paragraph.propositions.length; i++){
          if (paragraph.propositions[i][$scope.userId] !== 'hidden' && paragraph.propositions[i].hiddenForAll !== true){
            if (paragraph.propositions[i].id === id){
            
              return true
            } else {
             
              return false
            }
          }
        }
      }

      $scope.didItRun = function () {
        
      }

      $scope.reverseCarriageReturn = function(node, paragraph){
 
        for (var i = paragraph.propositions.length-1; i > -1; i--){
         
          // see if the carriage return is coming from the last visible proposition in the paragraph
          if (paragraph.propositions[i][$scope.userId] !== 'hidden' && 
          paragraph.propositions[i].hiddenForAll !== true &&
          paragraph.owner === $scope.userId){
            
            var query = paragraph.propositions[i].id;
            
            $timeout( function(){              
              $('#proposition' + query).trigger('click');
            },0)
          }     
        }    
      }

      $scope.carriageReturn = function(node, paragraph){
        
        if (paragraph.owner !== $scope.userId){
         
          document.getElementById($scope.selectedProposition.id).innerText = '';
          return;
        } else{
         
          for (var i = paragraph.propositions.length-1; i > -1; i--){
           
            // see if the carriage return is coming from the last visible proposition in the paragraph
            if (paragraph.propositions[i][$scope.userId] !== 'hidden' && 
            paragraph.propositions[i].hiddenForAll !== true &&
            paragraph.owner === $scope.userId &&
            $scope.selectProposition.type !== 'blank'){
            
              if ($scope.selectedProposition.id === paragraph.propositions[i].id){
                
                document.getElementById($scope.selectedProposition.id).innerText = '';
                $scope.selectedProposition = {};
                var query = paragraph.paragraphId;
               
                $timeout( function(){              
                  $('#' + query).trigger('click');
                },0)
                return;
              } else {
                document.getElementById($scope.selectedProposition.id).innerText = '';
                return;
              }
            }     
          }
        }   
      }

      // Selects proposition (propositions are often selected without this function)
      $scope.selectProposition = function(proposition) {
        if ($scope.selectedProposition){
          if ($scope.selectedProposition.id !== proposition.id) {
            $scope.clearPropositionInput();
            $scope.selectedProposition = proposition;
            focusFactory($scope.selectedProposition.id);
            
          } else {
            $scope.selectedProposition = proposition;
            focusFactory($scope.selectedProposition.id);
            
          }
        } else {
          $scope.selectedProposition = proposition;
          focusFactory($scope.selectedProposition.id);
          
        }
        $scope.highlight.id = '';
        $scope.highlight.highlit = null;
        $scope.mark.id = '';
        $scope.mark.marked = null;
        $scope.mark = {};
        $scope.highlight = {};
      };

      // Clears the proposition input, like when clicked away
      $scope.clearPropositionInput = function() {
       
        $scope.inputs.proposition = '';
        $scope.highlight.id = '';
        $scope.mark.id = '';
      };

      // Highlights all of another's propositions in a paragraph, first backspace
      $scope.highlightAllPropositions = function(node, paragraph, proposition) {
        $scope.selectedParagraph.highlightAll = true;
      };

      // Marks all of another's propositions in a paragraph, second backspace
      $scope.markAllPropositions = function() {
        $scope.selectedParagraph.markAll = true;
        $scope.selectedParagraph.highlightAll = false;
      };


      // Defines what's been highlighted
      $scope.highlightProposition = function(node, paragraph, proposition) {
        if ($scope.highlight.id !== proposition.id) {
          $scope.highlight.id = proposition.id;
          $scope.highlight.highlit = true;
        }
      };

      // Defines what's been marked for deletion with additional backspace
      $scope.markProposition = function(proposition) {
        $scope.mark.id = proposition.id;
        $scope.mark.marked = true;
      };

      // Processes incomplete edits to one's own propositions
      $scope.clearEditable = function () {
        
         
            if ($scope.whatHasBeenClicked){
              for (var i = 0; i < $scope.propositions.length; i++){
                if ($scope.whatHasBeenClicked === $scope.propositions[i].id){
                 
                  // is either clearing what has been clicked or somehow made the proposition inaccessible
                  document.getElementById('proposition' + $scope.whatHasBeenClicked).innerText = $scope.propositions[i].text;
                }
              
            }
            document.getElementById('proposition' + $scope.whatHasBeenClicked).contentEditable = false;
            $scope.whatHasBeenClicked = '';
          } 

      }

      // For when there is a single click on a proposition
      $scope.listenForDoubleClick = function (element, paragraph, proposition) {
       
        var string = 'proposition';
        var id = proposition.id;
        string = string + id;
        $scope.selectedParagraph = paragraph;
        $scope.selectedProposition = proposition;
        $scope.selectedProposition.textSide = true;
        $scope.selectedProposition.dialogueSide = false;
        $scope.selectedParagraph.highlightAll = false;
        $scope.selectedParagraph.markAll = false;
        if ($scope.whatHasBeenClicked !== proposition.id ) {
         
          focusFactory(id);
          document.getElementById(string).contentEditable = true;
          $scope.whatHasBeenClicked = proposition.id;
          $scope.dontrunfocusout = true;
        } 
      }

      // Backstops something about proposition editability
      $scope.focusouteditable = function (element) {
        
        if ($scope.dontrunfocusout){  
          return;
        }
        element.contentEditable = false;
        $scope.whatHasBeenClicked = '';
      }

      // Processes an edit to one's own proposition
      $scope.updateProposition = function(node, paragraph, proposition) {
        // In case an edit out of bounds occurs
        if (proposition.author !== $scope.userId) {
          return;
        }
        // Turns off editability and gets paths to the proposition and paragraph being edited
        var elem = document.getElementById('proposition' + proposition.id);
        elem.contentEditable = false;
        if (elem) {
          prep.address = node.address;
          prep.nodePath = '$scope.data';
          for (var i = 0; i < prep.address.length; i++) {
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }
          var propositionPath = prep.nodePath + '.paragraphs[' + paragraph.position.toString() + '].propositions[' + proposition.position.toString() + ']'; 
          var propositionDestination = eval(propositionPath)
          // Copies the current status of the span
          propositionDestination.text = angular.copy(elem.textContent);
          propositionDestination.text = propositionDestination.text.replace(/\u00a0/g, " ");
          $scope.whatHasBeenClicked = '';
          // Updates the propositions array
          // Defines the payload to be emitted
          prep.payload = {
            proposition: propositionDestination,
            propositionPath: propositionPath,
            bookId: $scope.bookId
          };
          // Emits it, clears a variable
          chatSocket.emit('update', $scope.userId, prep.payload);
          console.log("Payload: ", prep.payload.proposition)
          prep = {};
          // Clicks the element to allow for continued typing
          // $timeout( function(){
          //   elem.click(); 
          // },0)
          // Hits backend services, updates the model
          // apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
          // apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
          // profileService.setSelectedBook($scope.data[0]);
        }
      };

      // Listener for updates
      $scope.$on('socket:broadcastUpdate', function(event, payload) {
        if (payload.bookId !== $scope.bookId){
          
          return;
        }
        // Looks up proposition in the propositions array, updates it
        var index = $scope.propositions.findIndex(function(x) {
          return x.id === payload.proposition.id;
        });
        var elem = document.getElementById('proposition' + payload.proposition.id);
        // Updates text for the proposition in the text
        if (elem && index >= 0) {
          $scope.propositions[index] = payload.proposition;
          eval(payload.propositionPath).text = payload.proposition.text;
          // Marks remarks as updated (for markup purposes)
          for (var i = 0; i < $scope.data[0].dialogue.length; i++){
            for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length; j++){
              if (payload.proposition.id === $scope.data[0].dialogue[i].remarks[j].id){
                $scope.data[0].dialogue[i].remarks[j].updated = true;
              }
            }
          }
        }
        if (payload.proposition.author === $scope.userId){
          $timeout( function(){
            elem.click(); 
          },0)
        }
        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0]))); 
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0])
      });

      $scope.deleteProposition = function(node, paragraph, allflag) {
        prep.address = $scope.selectedNode.address;
        prep.nodePath = '$scope.data';
        for (var i = 0; i < prep.address.length; i++) {
          if (i < prep.address.length - 1) {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
          } else {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
          }
        }
        if (allflag == true){
          // For deletions on others' paragraphs, to hide them
          for (var i = 0; i < node.paragraphs.length; i++){
            if (node.paragraphs[i].owner !== $scope.userId && node.paragraphs[i][$scope.userId] !== 'hidden' &&
              node.paragraphs[i].paragraphId !== $scope.selectedParagraph.paragraphId &&
              $scope.selectedProposition.type !== 'blank'){
              prep.hideParagraphForDeleter = true;
              prep.hideOthersProp = true;
              prep.assigned = true;
              prep.hiddenForAll = false;
              
              break;
            }
          }

          if (!prep.assigned){
            // if there wasn't another visible paragraph in the node
            prep.blankParagraphForDeleter = true;
            prep.hiddenForAll = false;
            prep.hideOwn = false;
            
            prep.assigned = true;
          }
          // Clears some markups to the propositions
          $scope.selectedParagraph.markAll = false;
          $scope.selectedParagraph.highlightAll = false;
          prep.ids = [];
          for (var i = 0; i < paragraph.propositions.length; i++){
            prep.ids.push(paragraph.propositions[i].id);
          }
          if (prep.ids.length === 1){
            prep.id = prep.ids[0];
          }
        }
        // Running deletion on a blank 
        if ($scope.selectedProposition.type === 'blank' && !prep.assigned) {
          for (var i = 0; i < node.paragraphs.length; i++){
            if ((node.paragraphs[i][$scope.userId] !== 'hidden' && node.paragraphs[i].hiddenForAll !== true &&
            node.paragraphs[i].paragraphId !== $scope.selectedParagraph.paragraphId) ){
              // filters out blanks you wouldnt want to blank
              prep.hideBlank = true;
              prep.hiddenForAll = false;
              prep.assigned = true;
              prep.id = $scope.selectProposition.id;
             
              break;
            }
          }
          if (!prep.assigned){
            return;
          }
        } else if (!prep.assigned) {
          if($scope.selectedProposition.type === 'negation' &&
             $scope.selectedProposition.of.author === $scope.userId){
            prep.hideNegationForOthers = true;
            prep.hiddenForAll = false;
            prep.assigned = true;
            prep.id = $scope.selectProposition.id;
           
          } else if (!prep.assigned){
            prep.ids = [];
            for (var i = 0; i < paragraph.propositions.length; i++){
              if (( 
              paragraph.propositions[i].id === $scope.selectedProposition.id) ||
              (paragraph.propositions[i].type === 'negation' && 
              paragraph.propositions[i].of.id === $scope.selectedProposition.id)){
                prep.ids.push(paragraph.propositions[i].id);
              }               
            }
            // now have a list 'ids' of ids to remove
            // will this end up blanking the paragraph?
            
            for (var i = 0 ; i < paragraph.propositions.length; i++){
              prep.check = paragraph.propositions[i].id;
              
              if (paragraph.propositions[i][$scope.userId] !== 'hidden' &&
              !paragraph.propositions[i].hiddenForAll &&
              !prep.ids.includes(prep.check)){
                
                prep.assigned = true;
                prep.blankPropositionForEveryone = true;
                prep.hiddenForAll = true;
                prep.hideOwn = true;
                if (prep.ids.length === 1){
                  prep.id = prep.ids[0];
                }
                
              }
              
            }
            
            if (!prep.assigned) {
              prep.blankParagraphForDeleter = true;
              prep.assigned = true;
              prep.hideOwn = true;
            
              //paragraph will be blanked for deleter, hidden for others
              // this needs a fork
              // blanking in another's paragraph might work ok
              // blanking in one's own paragraph needs to put in a blank for oneself and delete paragraph
              // for others
            }
          }
        }
        // make ids an array and work with it only 
        // have a multiples flag variable
        // determine ahead of time if it will blank the paragraph, and for whom
        prep.payload = {
          class: $scope.selectedNode.class,
          topic: $scope.selectedNode.topic,
          paragraphPosition: $scope.selectedParagraph.position,
          address: $scope.selectedNode.address,
          nodePath: prep.nodePath,
          proposition: $scope.selectedProposition,
          author: $scope.selectedProposition.author,
          id: prep.id ? prep.id : undefined,
          paragraphId: $scope.selectedParagraph.paragraphId,
          hiddenForAll: prep.hiddenForAll ? prep.hiddenForAll : undefined,
          ids: prep.ids ? prep.ids : undefined,
          hideNegationForOthers: prep.hideNegationForOthers ? prep.hideNegationForOthers : undefined,
          selectedParagraphId: $scope.selectedParagraph.paragraphId,
          blankParagraphForDeleter: (prep.blankParagraphForDeleter ? prep.blankParagraphForDeleter : undefined),
          hideParagraphForDeleter: (prep.hideParagraphForDeleter ? prep.hideParagraphForDeleter : undefined),
          hideBlank: (prep.hideBlank ? prep.hideBlank : undefined),
          blankPropositionForEveryone: (prep.blankPropositionForEveryone ? prep.blankPropositionForEveryone : undefined),
          paragraphBlankId: IdFactory.next(),
          blankId: IdFactory.next(),
          hideOthersProp: (prep.hideOthersProp ? prep.hideOthersProp : undefined),
          hideOwn: (prep.hideOwn ? prep.hideOwn : undefined),
          deleter: $scope.userId,
          bookId: $scope.bookId
        };
        console.log('Payload to be deleted: ', prep.payload);
        chatSocket.emit('deletion', $scope.userId, prep.payload);
        prep = {};
        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);
      };

      $scope.$on('socket:broadcastDeletion', function(event, payload) {
        if (payload.bookId !== $scope.bookId){
         
          return;
        }
        console.log("Received deletion: ", payload)
        // Node and paragraph destination calcs
        apply.nodeDestination = eval(payload.nodePath);
        apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
        apply.paragraphDestination = eval(apply.paragraphPath);
        if (payload.hideParagraphForDeleter && payload.deleter === $scope.userId){
          
          apply.paragraphDestination[$scope.userId] = 'hidden';
          // Sets remarks to hidden in the dialogue
          for (var i = 0; i < $scope.data[0].dialogue.length - 1; i++) {
            for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length; j++){
              for (var k = 0; k < payload.ids.length; k++){
                if ($scope.data[0].dialogue[i].remarks[j].id === payload.ids[k]) {
                  $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden'
                }
              }
            }
          }
        }
        // Inserts a blank at the paragraph and hides all other propositions for the deleter
        if (payload.blankParagraphForDeleter) {
          // Hides the target paragraphs propositions
          if (payload.deleter === $scope.userId) {
            for (var i = apply.paragraphDestination.propositions.length - 1; i > -1; i--) {
              apply.paragraphDestination.propositions[i].hiddenForAll = true;
              apply.paragraphDestination.propositions[i].position++;
              apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
            }
            apply.paragraphDestination.propositions[0] = {                                    
              id: payload.blankId,
              type: 'blank',
              text: '',
              author: '',
              position: 0,
              isPlaceholder: true,
              address: payload.address,
              nodePath: payload.nodePath,
              privateFor: payload.deleter,
              first: true
            };


            apply.paragraphDestination.propositions[0].privateFor = payload.deleter;
            apply.paragraphDestination.privateFor = payload.deleter;
            // Sets remarks to hidden in the dialogue
            if (payload.ids){
              for (var i = 0; i < $scope.data[0].dialogue.length - 1; i++) {
                for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length; j++){
                  for (var k = 0; k < payload.ids.length; k++){
                    if ($scope.data[0].dialogue[i].remarks[j].id === payload.ids[k]) {
                      $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden'
                    }
                  }
                }
              }
            } else {
              for (var i = 0; i < $scope.data[0].dialogue.length - 1; i++) {
                for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length; j++){
                  if ($scope.data[0].dialogue[i].remarks[j].id === payload.id) {
                    $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden'
                  }
                }
              }
            }
            // Assigns paragraph color
            for (var i = 0; i < apply.paragraphDestination.propositions.length; i++){
              if(apply.paragraphDestination.propositions[i][$scope.userId]){
                if(apply.paragraphDestination.propositions[i][$scope.userId] !== 'hidden'){
                  apply.paragraphDestination.color = '#ffffff'
                  break;
                }
              } 
            }
            $scope.selectedParagraph = apply.paragraphDestination;
            $scope.selectedProposition = apply.paragraphDestination.propositions[0];
            $scope.hasRightFocus.id = $scope.selectedProposition.id
            $scope.selectedProposition.textSide = true;
            focusFactory($scope.selectedProposition.id);
            $('proposition' + $scope.selectedProposition.id).trigger('click');
          } else {
            for (var i = apply.paragraphDestination.propositions.length; i > -1; i--) {
              apply.paragraphDestination.propositions[i].position++;
              apply.paragraphDestination.propositions[i].hiddenForAll = true;
              apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
              if ($scope.selectedProposition){
                if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id) {
                  $scope.selectedProposition.position = angular.copy(apply.paragraphDestination.propositions[i].position);
                }
              }
            }

            // Insert new blank proposition for something to grab onto
            apply.paragraphDestination.propositions[0] = {                                    
              id: payload.blankId,
              type: 'blank',
              text: '',
              author: '',
              position: 0,
              isPlaceholder: true,
              address: payload.address,
              nodePath: payload.nodePath,
              privateFor: payload.deleter,
              first: true
            };
            apply.paragraphDestination.propositions[0][$scope.userId] = 'hidden';
            apply.paragraphDestination.propositions[0].privateFor = payload.deleter;
            apply.paragraphDestination[$scope.userId] = 'hidden';
            apply.paragraphDestination.privateFor = payload.deleter;

            // Sets remarks to hidden in the dialogue
            if (payload.ids){
              for (var i = 0; i < $scope.data[0].dialogue.length - 1; i++) {
                for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length; j++){
                  for (var k = 0; k < payload.ids.length; k++){
                    if ($scope.data[0].dialogue[i].remarks[j].id === payload.ids[k]) {
                      $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden'
                    }
                  }
                }
              }
            } else {
              for (var i = 0; i < $scope.data[0].dialogue.length - 1; i++) {
                for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length; j++){
                  if ($scope.data[0].dialogue[i].remarks[j].id === payload.id) {
                    $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden'
                  }
                }
              }
            }
          }
          // other stuff for blank paragraph for deleter
        }
        // Deletions on blank cursors
        // Delete the paragraph and find where to put the cursor
        if (payload.hideBlank){
        
          apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
          apply.paragraphDestination = eval(apply.paragraphPath);
          apply.propositionPath = apply.paragraphPath + '.propositions[' + payload.proposition.position.toString() + ']';
          apply.propositionDestination = eval(apply.propositionPath)
          if (payload.deleter === $scope.userId){
            if (!apply.paragraphDestination.owner || apply.paragraphDestination.owner !== $scope.userId){  
             
              apply.propositionDestination.hiddenForAll = true;
              apply.paragraphDestination.hiddenForAll = true;
              apply.assigned = true;
            } else if (apply.paragraphDestination.owner === $scope.userId){
              apply.propositionDestination.hiddenForAll = true;
              apply.paragraphDestination.hiddenForAll = true;
              apply.assigned = true;
              //hides them
             
              for (var i = payload.paragraphPosition; i > -1 ; i--){
                // go through the paragraph
               
                if(apply.nodeDestination.paragraphs[i][$scope.userId] !== 'hidden' &&
                  apply.nodeDestination.paragraphs[i].hiddenForAll != true &&
                  i < payload.paragraphPosition ){
                  // go and see what is to be clicked on
                  
                  for (var j = apply.nodeDestination.paragraphs[i].propositions.length-1; j > -1; j--){
                    if (apply.nodeDestination.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
                    !apply.nodeDestination.paragraphs[i].propositions[j].rejoined &&
                    apply.nodeDestination.paragraphs[i].propositions[j].author === $scope.userId &&
                    apply.nodeDestination.paragraphs[i].propositions[j].type !== 'negation'){
                    
                      $scope.selectedParagraph = apply.nodeDestination.paragraphs[i];
                      $scope.selectedProposition = apply.nodeDestination.paragraphs[i].propositions[j]
                      $scope.hasRightFocus.id = $scope.selectedProposition.id
                      $scope.selectedProposition.textSide = true;
                      focusFactory($scope.selectedProposition.id);
                      var query = 'proposition' + $scope.selectedProposition.id;
                      $(query).trigger('click');
                      query = '';                     
                      break;
                    }
                  }
                }
              }
              if (!apply.assigned){
                apply.assigned = true;
              }       
            } else if (payload.deleter !== $scope.userId){
              apply.propositionDestination.hiddenForAll = true;
              apply.paragraphDestination.hiddenForAll = true;
              apply.assigned = true;
            }
          }
        }

        if (payload.blankPropositionForEveryone || payload.hideNegationForOthers) {
          if (payload.blankPropositionForEveryone){
            if (payload.id){
              apply.paragraphDestination.propositions[payload.proposition.position].hiddenForAll = true;
            } else {
              for (var i = 0; i < apply.paragraphDestination.propositions.length; i++){
                for (var j = 0; j < payload.ids.length; j++){
                  if(payload.ids[j] === apply.paragraphDestination.propositions[i]){
                    apply.paragraphDestination.propositions[i].hiddenForAll = true;
                  }
                }
              }
            }
          } else if (payload.hideNegationForOthers){
            apply.paragraphDestination.propositions[payload.proposition.position][$scope.userId] = 'hidden'; 
          }
          //dialogue interactivity
          if (!payload.id){
            for (var i = 0; i < $scope.data[0].dialogue.length; i++) {
              for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length-1; j++){
                for (var k = 0; k < payload.ids.length; k++){
                  if ($scope.data[0].dialogue[i].remarks[j].id === payload.ids[k]) {
                    $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden';
                    $scope.data[0].dialogue[i].remarks[j].hiddenForAll = true;
                  }
                }
              }
            }
            // dialogue interactivity
            for (var i = 0; i < $scope.data[0].dialogue.length; i++) {
              for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length-1; j++){
                for (var k = 0; k < payload.ids.length; k++){
                  if ($scope.data[0].dialogue[i].remarks[j].id === payload.ids[k]) {
                    $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden';
                    $scope.data[0].dialogue[i].remarks[j].hiddenForAll = true;
                  }
                }                 
              }
            }
          } else {
            for (var i = 0; i < $scope.data[0].dialogue.length; i++) {
              for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length-1; j++){
                if ($scope.data[0].dialogue[i].remarks[j].id === payload.proposition.id) {
                  $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden';
                  $scope.data[0].dialogue[i].remarks[j].hiddenForAll = true;
                }
                if ($scope.data[0].dialogue[i].remarks[j+1]){
                  if ($scope.data[0].dialogue[i].remarks[j+1].type === 'negation'){
                    $scope.data[0].dialogue[i].remarks[j+1][$scope.userId] = 'hidden';
                    $scope.data[0].dialogue[i].remarks[j].hiddenForAll = true;
                  }
                } 
              }
            }
          }
          
          if (payload.deleter === $scope.userId) {
            for (var i = payload.proposition.position; i > -1; i--) {
              if (apply.paragraphDestination.propositions[i][$scope.userId] !== 'hidden' &&
              !apply.paragraphDestination.propositions[i].rejoined &&
              !apply.paragraphDestination.propositions[i].hiddenForAll) {
                $scope.selectedProposition = apply.paragraphDestination.propositions[i];
                $scope.hasRightFocus.id = $scope.selectedProposition.id
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');
                break;
              }
            }
          }

        }

        // Updates paragraph ownership
        for (var i = 0; i < apply.paragraphDestination.propositions.length; i++){
          if(apply.paragraphDestination.propositions[i][$scope.userId] !== 'hidden' &&
          !apply.paragraphDestination.propositions[i].hiddenForAll &&
          apply.paragraphDestination.propositions[i].type !== 'blank'){
            apply.paragraphDestination.owner = apply.paragraphDestination.propositions[i].author;
            break;
          }
        }

        // assigns firsts to propositions

        var theNode = document.getElementById(apply.nodeDestination.nodeId);
        var theNodeParagraphs = theNode.querySelectorAll(".paragraph");
        for (var m = 0; m < theNodeParagraphs.length; m++){
          console.log("the node paragraphs html: ", theNodeParagraphs[m].innerText, " (",m,")")
          var isFirst = theNodeParagraphs[m].id.toString().slice(9); 
          break;
        }
        console.log("apply.nodeDestination.paragraphs: ", apply.nodeDestination.paragraphs)
        if (isFirst){
          for (var n = 0; n < apply.nodeDestination.paragraphs.length; n++){
            if (apply.nodeDestination.paragraphs[n].paragraphId === isFirst &&
              apply.nodeDestination.paragraphs[n][$scope.userId] !== 'hidden' &&
              !apply.nodeDestination.paragraphs[n].hiddenForAll){
              apply.nodeDestination.paragraphs[n].first = true;
            } else {
              apply.nodeDestination.paragraphs[n].first = false;
            }
          }
        } else {
          for (var n = 0; n < apply.nodeDestination.paragraphs.length; n++){
            apply.nodeDestination.paragraphs[i].first = false;
          }
        }
          
        // propositions
        for (var i = 0; i < apply.nodeDestination.paragraphs.length; i++){
        // for all paragraphs

          for (var j = 0; j < apply.nodeDestination.paragraphs[i].propositions.length; j++){
          // and all propositions
            if (apply.nodeDestination.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
            !apply.nodeDestination.paragraphs[i].propositions[j].hiddenForAll){
              apply.nodeDestination.paragraphs[i].propositions[j].first = true;
             
              for (var k = j; k < apply.nodeDestination.paragraphs[i].propositions.length; k++){
                if (k > j){ 
                  apply.nodeDestination.paragraphs[i].propositions[k].first = false;
                }
              }
              j = apply.nodeDestination.paragraphs[i].propositions.length;
            } else {
              apply.nodeDestination.paragraphs[i].propositions[j].first = false;
            }
          }
        }
        
        for (var i = 0; i < apply.paragraphDestination.propositions.length; i++) {
          if (apply.paragraphDestination.propositions[i].type === 'assertion' &&
            apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {
            apply.propositionPath = apply.paragraphPath + '.propositions[' + i.toString() + ']';
            apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;
         
          }
        }
        for (var i = 0; i < apply.paragraphDestination.propositions.length; i++) {
          if (apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {
            apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;
          }
        }

        for (var i = 0; i < $scope.propositions.length; i++) {
          if ($scope.propositions[i].assertionId === payload.proposition.assertionId) {
            $scope.propositions[i].assertionPath = apply.propositionPath;
          }
        }

        if(!payload.hideBlank){
          $scope.scroll.threadId = IdFactory.next();
          updateDialogue(payload, scrollMessagesToBottom);
        }

        apply.mutedParagraphPath = payload.nodePath + ".paragraphs[" + payload.paragraphPosition + "]";
        if (eval(apply.mutedParagraphPath)){
          if (eval(apply.mutedParagraphPath)[$scope.userId] === 'hidden'){
            apply.muteIncomingThread = true;
          }
        } else {
          console.log("")
        }

        if (apply.muteIncomingThread){
          $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1][$scope.userId] = 'hidden'
        }
        

        // var apply = {};
        // var notification = {};
        $scope.scroll = {};

        $scope.clearBlankOnBlur();

        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);
      });

      $scope.hideNode = function(node){
        node[$scope.userId] = 'hidden';

        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);

      }

      $scope.getRemarkLocation = function(address, assertionId) {
        // var temp = {};
        // temp.location = eval(assertionPath);
        for (var i = 0; i < $scope.propositions.length; i++) {
          if ($scope.propositions[i].id === assertionId) {
            break;
          }
        }
      };

      $scope.setNewProp = function () {
        $scope.newProp = true;
        $scope.selectedProposition = {};
        $scope.selectedParagraph = {}
      }

      $scope.prepProposition = function(input, thread, paragraph) {
        
        if ($scope.selectedParagraph){
          $scope.selectedParagraph.highlightAll = false;
          $scope.selectedParagraph.markAll = false;
        }
        apply = {};
        // Define characters at the beginning and end of the input
        prep.firstChar = input.charAt(0);
        prep.lastChar = input.charAt(input.length - 1);
        // Bounce bad inputs:
        // Those on nodes with no paragraphs
        // Those that are blank
        if (prep.lastChar !== '.' && prep.lastChar !== '?' && prep.lastChar !== '!' && prep.lastChar !== ':' ){
          input = input + '.';
        }
      
        //   Topics

        // If it's ended with a colon,
        // it's a topic
        if (prep.lastChar === ':') {
          // Get rid of the colon
          prep.topic = input.substring(0, input.length - 1);
          // Make it a topic that will have a blank sentence at position Paragraph 0 Proposition 0
          prep.type = 'topic';
          prep.adjustedText = '';
          prep.position = 0;
          prep.paragraphPosition = 0;
          prep.author = $scope.userId;
          // Give it its own node
          prep.getsOwnNode = true;
          // Check how many children the selected node has
          if (!$scope.selectedNode.children) {
            prep.classBasis = 0;
          } else {
            prep.classBasis = $scope.selectedNode.children.length;
          }
          // Calculate class code
          // Rewrite needed for more than 100 nodes on the same level
          prep.newClass = angular.copy($scope.selectedNode.class);
          if (prep.classBasis > 99) {
            prep.newClass = prep.newClass.toString() + prep.classBasis.toString();
          } else if (prep.classBasis > 9) {
            prep.newClass = prep.newClass.toString() + '.0' + prep.classBasis.toString();
          } else {
            prep.newClass = prep.newClass.toString() + '.00' + prep.classBasis.toString();
          }
          // Get the address and the path to the selected node / "old node"
          prep.oldNodePath = '$scope.data';
          prep.address = angular.copy($scope.selectedNode.address);
          for (var i = 0; i < prep.address.length; i++) {
            if (i < prep.address.length - 1) {
              prep.oldNodePath = prep.oldNodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.oldNodePath = prep.oldNodePath + '[' + prep.address[i].toString() + ']';
            }
          }
          // Get the address of the new node
          // Changes address variable from calculating the old node
          // Might be able to remove the type condition
          prep.nodePath = '$scope.data';
          if (prep.type === 'topic' && !$scope.selectedNode.children) {
            prep.address.push(0);
          } else if (prep.type === 'topic') {
            prep.address.push($scope.selectedNode.children.length);
          }
          // Get the path to the new node
          for (var i = 0; i < prep.address.length; i++) {
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }
          prep.assertionPath = prep.nodePath + '.paragraphs[' + prep.paragraphPosition.toString() + '].propositions[' + prep.position.toString() + ']';    
          // If posting user is on a blank proposition, his selected proposition is now
          // the first proposition on the new node
          if (!$scope.selectedProposition.text) {
            $scope.selectedProposition = eval(prep.oldNodePath + '.paragraphs[0].propositions[0]');
          }
          // Collect info on the selected proposition
          prep.of = {
            id: $scope.selectedProposition.id,
            type: $scope.selectedProposition.type,
            author: $scope.selectedProposition.author,
            text: $scope.selectedProposition.text,
          };
   
        }

          // Negations

          // If the selected proposition is not your own
          // and it's an assertion or rejoinder (not a blank)
          // Or if it's a continuation of another negation
          // it's a negation
        else if (((($scope.selectedProposition.type === 'assertion' || $scope.selectedProposition.type === 'rejoinder') &&
          $scope.selectedProposition.author !== $scope.userId) || ($scope.selectedProposition.type === 'negation' 
          && $scope.selectedProposition.author === $scope.userId)) && !paragraph.leftAdd) {
          
          // if (prep.lastChar === '?') {
          //   prep.topic = input;
          //   prep.question = prep.topic;
          // }
          // The above code can be used to activate the mechanism whereby answered questions
          // inaugurate new sections
          // 
          //           

          if ($scope.selectedProposition.type === 'negation') {
            prep.isOfNegation = true;
            for (var i = $scope.selectedProposition.position - 1; i > -1; i--) {
              if ($scope.selectedParagraph.propositions[i].type !== 'negation') {
                prep.of = {
                  id: $scope.selectedParagraph.propositions[i].id,
                  type: $scope.selectedParagraph.propositions[i].type,
                  author: $scope.selectedParagraph.propositions[i].author,
                  text: $scope.selectedParagraph.propositions[i].text,
                };
                break;
              }
            }
          } else {
            prep.of = {
              id: $scope.selectedProposition.id,
              type: $scope.selectedProposition.type,
              author: $scope.selectedProposition.author,
              text: $scope.selectedProposition.text,
            };
          }
          prep.topic = $scope.selectedNode.topic;
          prep.type = 'negation';
          prep.assertionId = $scope.selectedProposition.assertionId;
          prep.adjustedText = input;
          prep.paragraphPosition = $scope.selectedParagraph.position;
          for (var i = 0; i < $scope.selectedParagraph.propositions.length; i++) {
            if ($scope.selectedParagraph.propositions[i].id === $scope.selectedProposition.id) {
              prep.preliminaryPosition = i;
              break;
            }
          }
          for (var i = prep.preliminaryPosition; i < $scope.selectedParagraph.propositions.length; i++) {
            if ($scope.selectedParagraph.propositions[i + 1] && $scope.selectedParagraph.propositions[i + 1].type !== 'negation') {
              prep.position = i + 1;
              prep.getsOwnProposition = true;
              break;
            }
          }
          if (!prep.position) {
            prep.position = $scope.selectedParagraph.propositions.length;                                 //    IF THE NEGATION MUST BE PUT AT THE END OF THE PARAGRAPH
            prep.getsOwnProposition = true;
          }
          prep.class = $scope.selectedNode.class;
          prep.nodePath = '$scope.data';
          prep.address = $scope.selectedNode.address;
          for (var i = 0; i < prep.address.length; i++) {                                          //     BUILDS THE ADDRESS TO THE NODE WHERE THE PROPOSITION GOES
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }
          prep.assertionPath = $scope.selectedProposition.assertionPath;                                   // CALCULATES PATH TO THE ASSERTION
          if ($scope.selectedProposition.remarkAddress) {      // only if it's a negation of a rejoinder
            if ($scope.selectedProposition.type === 'negation') {
              var start = prep.assertionPath;
              for (var i = 0; i < $scope.selectedProposition.remarkAddress.length - 1; i++) { // calculate the path to the selectedProposition's remark location
                start = start + '.remarks[' + $scope.selectedProposition.remarkAddress[i].toString() + ']';
              }
              var endOfAddress = angular.copy($scope.selectedProposition.remarkAddress[$scope.selectedProposition.remarkAddress.length - 1]);
              endOfAddress++;
              start = start + '.remarks[' + endOfAddress.toString() + ']';
              prep.remarkPath = start;
              prep.remarkAddress = angular.copy($scope.selectedProposition.remarkAddress);
              prep.remarkAddress[prep.remarkAddress.length - 1] = endOfAddress;
              endOfAddress = '';
              start = '';
            } else {
              var start = prep.assertionPath; // start with the path taking you to the assertion
              for (var i = 0; i < $scope.selectedProposition.remarkAddress.length; i++) { // calculate the path to the selectedProposition's remark location
                start = start + '.remarks[' + $scope.selectedProposition.remarkAddress[i].toString() + ']';
              }
              prep.remarkAddress = angular.copy($scope.selectedProposition.remarkAddress); // the new remark address will be based on the selectedProposition's remark address array
              prep.check = eval(start);                     // check the selectedProposition's remark location
              start = '';
              if (prep.check.remarks) {                  // if the remark has remarks,
                prep.neighbors = prep.check.remarks.length;
                prep.remarkAddress.push(prep.neighbors);    // the remark address will be the old remark address with a another level with the value +1 from the last value at that level
              } else {
                prep.remarkAddress.push(0);
              }            // or the remark address will just be the first on the new level
              prep.remarkPath = prep.assertionPath;
              for (var i = 0; i < prep.remarkAddress.length; i++) { // calculate the path to the selectedProposition's remark location
                prep.remarkPath = prep.remarkPath + '.remarks[' + prep.remarkAddress[i].toString() + ']';
              }
            }
          } else {
            if ($scope.selectedProposition.type === 'negation') {
              var start = prep.assertionPath;
              prep.check = eval(start);
              if (prep.check.remarks) {
                prep.remarkAddress = [prep.check.remarks.length];
                var toStringify = prep.check.remarks.length - 1;
                prep.remarkPath = prep.assertionPath + '.remarks[' + toStringify.toString() + ']';
                toStringify = '';
              } else {
                prep.remarkAddress = [0];                     //   otherwise it's a first negation
                prep.remarkPath = prep.assertionPath + '.remarks[0]';
                console.log('This was not expected to trigger');
              }
            } else {
              var start = prep.assertionPath;
              prep.check = eval(start);
              if (prep.check.remarks) {
                prep.remarkAddress = [prep.check.remarks.length];
                var toStringify = prep.remarkAddress[prep.remarkAddress.length - 1];
                prep.remarkPath = prep.assertionPath + '.remarks[' + toStringify.toString() + ']';
                toStringify = '';
              } else {
                prep.remarkAddress = [0];                     //   otherwise it's a first negation
                prep.remarkPath = prep.assertionPath + '.remarks[0]';
              }
            }
          }                                                                         

        

  
        } else if ($scope.selectedProposition.of &&                                                //   REJOINDER
          $scope.selectedProposition.of.author === $scope.userId &&
          $scope.selectedProposition.type === 'negation' &&
          !$scope.selectedProposition.question) {
          prep.topic = $scope.selectedNode.topic;
          prep.type = 'rejoinder';
          
          //    IF ITS AN EXCLAMATION AND THE SELECTED PROPOSITION IS A REMARK ON ONE'S OWN PROPOSITION
          //   IN THE FORM OF A NEGATION, IT'S A REJOINDER
          prep.adjustedText = input.substring(0, input.length - 1) + '.';
          prep.assertionId = $scope.selectedProposition.assertionId;

          prep.nodePath = '$scope.data';
          prep.address = $scope.selectedNode.address;
          for (var i = 0; i < prep.address.length; i++) {                                         
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }
          prep.paragraphPath = prep.nodePath + '.paragraphs[' + $scope.selectedParagraph.position.toString() + ']';
          
          prep.paragraphDestination = eval(prep.paragraphPath);
          prep.capacityCount = 0;
          for (var i = 0; i < prep.paragraphDestination.propositions.length; i++) {
          
            if (prep.paragraphDestination.propositions[i].assertionId === prep.assertionId && 
              prep.paragraphDestination.propositions[i].type !== 'negation'
              && prep.paragraphDestination.propositions[i].deleted !== true)
              //what about hiddens?
              {
              prep.capacityCount++;
            }
          }
         
          if (prep.capacityCount > 1) {
           
            prep.paragraphPosition = $scope.selectedParagraph.position + 1;
            prep.position = 0;
            prep.insertsBelow = true;
            prep.of = {
              id: $scope.selectedProposition.id,                                             
              type: $scope.selectedProposition.type,
              author: $scope.selectedProposition.author,
              text: $scope.selectedProposition.text,
            };
            prep.class = $scope.selectedNode.class;

            prep.nodePath = '$scope.data';
            prep.address = $scope.selectedNode.address;

            for (var i = 0; i < prep.address.length; i++) {                                         
              if (i < prep.address.length - 1) {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
              } else {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
              }
            }

            prep.assertionPath = $scope.selectedProposition.assertionPath;                    //  IT WILL HAVE THE SAME ASSERTION PATH AS SELECTEDPROPOSITION

            if ($scope.selectedProposition.remarkAddress.length > 0) {                       //      IF SELECTED PROPOSITION IS A NEGATION OF A REJOINDER
              var start = $scope.selectedProposition.assertionPath;                               // start with the path taking you to the assertion
              for (var i = 0; i < $scope.selectedProposition.remarkAddress.length; i++) {                    // calculate the path to the selectedProposition's remark location

                start = start + '.remarks[' + $scope.selectedProposition.remarkAddress[i].toString() + ']';
              }


              prep.remarkAddress = angular.copy($scope.selectedProposition.remarkAddress);    //  the new remark address will be based on the selectedProposition's remark address array
              prep.check = eval(start);                                         //  check the selectedProposition's remark location
              start = '';
              if (prep.check && prep.check.remarks.length > 0) {                              //  if the remark has remarks
                prep.remarkAddress.push(prep.check.remarks.length);             //  make a new index
              } else {
                prep.remarkAddress.push(0);                                     //  otherwise the index is 0


                prep.remarkPath = prep.assertionPath;
                for (var i = 0; i < prep.remarkAddress.length; i++) {                            // calculate the path to the selectedProposition's remark location
                  prep.remarkPath = prep.remarkPath + '.remarks[' + prep.remarkAddress[i].toString() + ']';
                }
              }
            } else {
              prep.remarkAddress = $scope.selectedProposition.remarkAddress;          // shouldn't trigger
              prep.remarkAddress.push(0);
              prep.remarkPath = prep.assertionPath + '.remarks[0]';
            }


          } else {

            
           
            prep.paragraphPosition = $scope.selectedParagraph.position;
            for (var i = 0; i < $scope.selectedParagraph.propositions.length; i++) {
              if ($scope.selectedParagraph.propositions[i].id === $scope.selectedProposition.id) {
                prep.preliminaryPosition = i;
                break;
              }
            }
            for (var i = prep.preliminaryPosition; i < $scope.selectedParagraph.propositions.length; i++) {
              if ($scope.selectedParagraph.propositions[i] && $scope.selectedParagraph.propositions[i].type !== 'negation') {
                prep.position = i;
                break;
              }
            }
            if (!prep.position) {
              prep.position = $scope.selectedParagraph.propositions.length;                                 //    IF THE NEGATION MUST BE PUT AT THE END OF THE PARAGRAPH
              prep.getsOwnProposition = true;
            }

            prep.getsOwnProposition = true;
            prep.of = {
              id: $scope.selectedProposition.id,                                              //   CALCULATIONS FOR A REJOINDER
              type: $scope.selectedProposition.type,
              author: $scope.selectedProposition.author,
              text: $scope.selectedProposition.text,
            };
            prep.class = $scope.selectedNode.class;

            prep.nodePath = '$scope.data';
            prep.address = $scope.selectedNode.address;

            for (var i = 0; i < prep.address.length; i++) {                                          //    FOLLOW THE SELECTEDPROPOSITION'S ADDRESS TO GET TO THE NODE
              if (i < prep.address.length - 1) {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
              } else {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
              }
            }

            prep.assertionPath = $scope.selectedProposition.assertionPath;                    //  IT WILL HAVE THE SAME ASSERTION PATH AS SELECTEDPROPOSITION

            if ($scope.selectedProposition.remarkAddress.length > 0) {                       //      IF SELECTED PROPOSITION IS A NEGATION OF A REJOINDER
              var start = $scope.selectedProposition.assertionPath;                               // start with the path taking you to the assertion

              for (var i = 0; i < $scope.selectedProposition.remarkAddress.length; i++) {                    // calculate the path to the selectedProposition's remark location

                start = start + '.remarks[' + $scope.selectedProposition.remarkAddress[i].toString() + ']';
              
              }
              


              prep.remarkAddress = angular.copy($scope.selectedProposition.remarkAddress);    //  the new remark address will be based on the selectedProposition's remark address array
              prep.check = eval(start);                                         //  check the selectedProposition's remark location
              start = '';
              if (prep.check && prep.check.remarks.length > 0) {                              //  if the remark has remarks
              
                prep.remarkAddress.push(prep.check.remarks.length);             //  make a new index
                
                prep.remarkAddress.push(0);                                     //  otherwise the index is 0
                


                prep.remarkPath = prep.assertionPath;
                for (var i = 0; i < prep.remarkAddress.length; i++) {                            // calculate the path to the selectedProposition's remark location
                  prep.remarkPath = prep.remarkPath + '.remarks[' + prep.remarkAddress[i].toString() + ']';
                }
              } else {
                prep.remarkAddress = $scope.selectedProposition.remarkAddress;          
                prep.remarkAddress.push(0);
                prep.remarkPath = prep.assertionPath + '.remarks[0]';                
              }
            } else {
             
              prep.remarkAddress = $scope.selectedProposition.remarkAddress;          
              prep.remarkAddress.push(0);
              prep.remarkPath = prep.assertionPath + '.remarks[0]';
           
            }
          }


        } else if ($scope.selectedProposition.question) {

          
          prep.type = 'assertion';
          prep.adjustedText = input;
          prep.position = 0;
          prep.paragraphPosition = 0;
          prep.getsOwnNode = true;
          prep.answeredQuestion = $scope.selectedProposition.question;

          if (!$scope.selectedNode.children) {
            prep.classBasis = 0;
          } else {
            prep.classBasis = $scope.selectedNode.children.length;
          }

          prep.newClass = $scope.selectedNode.class;
          if (prep.classBasis > 99) {
            prep.newClass = prep.newClass.toString() + prep.classBasis.toString();
          } else if (prep.classBasis > 9) {
            prep.newClass = prep.newClass.toString() + '.0' + prep.classBasis.toString();
          } else {
            prep.newClass = prep.newClass.toString() + '.00' + prep.classBasis.toString();
          }


          prep.oldNodePath = '$scope.data';                                                           //    BUILD PATH TO THE OLD NODE FROM ITS ADDRESS
          prep.address = angular.copy($scope.selectedNode.address);
          for (var i = 0; i < prep.address.length; i++) {
            if (i < prep.address.length - 1) {
              prep.oldNodePath = prep.oldNodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.oldNodePath = prep.oldNodePath + '[' + prep.address[i].toString() + ']';
            }
          }


          prep.nodePath = '$scope.data';                                                              //     ADD LAST COMPONENT OF THE ADDRESS FOR THE NEW NODE
          if (!$scope.selectedNode.children) {
            prep.address.push(0);
          } else {
            prep.address.push($scope.selectedNode.children.length);
          }


          for (var i = 0; i < prep.address.length; i++) {                                              // BUILD PATH TO THE NEW NODE
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }

          prep.assertionPath = prep.nodePath + '.paragraphs[' + prep.paragraphPosition + '].propositions[' + prep.position + ']';

          if (!$scope.selectedProposition.text) {                                                          //   SWITCHING SELECTEDPROPOSITION TO THE BLANK TO COLLECT 'OF'
            $scope.selectedProposition = eval(prep.oldNodePath + '.paragraphs[0].propositions[0]');
          }

          if (prep.answeredQuestion.charAt(prep.answeredQuestion.length - 1) === '?' && prep.answeredQuestion.substring(0, 8) === 'Where is') {
            prep.topic = 'Location of ' + prep.answeredQuestion.substring(8, prep.answeredQuestion.length - 1);
          } else if (prep.answeredQuestion.charAt(prep.answeredQuestion.length - 1) === '?' && prep.answeredQuestion.substring(0, 6) === 'Who is') {

            prep.topic = 'Who ' + prep.answeredQuestion.substring(6, prep.answeredQuestion.length - 1) + ' is';
          } else if (prep.answeredQuestion.charAt(prep.answeredQuestion.length - 1) === '?' && prep.answeredQuestion.substring(0, 7) === 'Who was') {

            prep.topic = 'Who ' + prep.answeredQuestion.substring(7, prep.answeredQuestion.length - 1) + ' was';
          } else if (prep.answeredQuestion.charAt(prep.answeredQuestion.length - 1) === '?' && prep.answeredQuestion.substring(0, 10) === 'What makes') {

            prep.topic = prep.answeredQuestion.substring(0, prep.answeredQuestion.length - 1);
          } else if (prep.answeredQuestion.charAt(prep.answeredQuestion.length - 1) === '?') {
            prep.topic = prep.answeredQuestion;                                       // SETS PREP TOPIC TO THE QUESTION WITH PUNCTUATION
            // COPIES IT AS A QUESTION TO PUT ON THE PREP OBJECT
          }
          prep.of = {
            id: $scope.selectedProposition.id,                                            //   CALCULATING 'OF'
            type: $scope.selectedProposition.type,
            author: $scope.selectedProposition.author,
            text: $scope.selectedProposition.text,
          };


  

          prep.type = 'assertion';
          prep.adjustedText = input;
        } else {
     
          prep.topic = $scope.selectedNode.topic;
          prep.class = $scope.selectedNode.class;
          prep.type = 'assertion';
          prep.adjustedText = input;
          
        }



        if ($scope.selectedProposition.type === 'blank' && prep.type !== 'topic') {
          //placeholders only appear after deletions
          prep.nodePath = '$scope.data';
          prep.address = $scope.selectedNode.address;
          for (var i = 0; i < prep.address.length; i++) {                                         
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }
          prep.nodeDestination = eval(prep.nodePath)
          prep.candidateParagraphPosition = $scope.selectedParagraph.position;
          prep.candidateParagraphPath = prep.nodePath + '.paragraphs[' + prep.candidateParagraphPosition.toString() + ']';    
          prep.candidateParagraphDestination = eval(prep.candidateParagraphPath);
          if (prep.candidateParagraphDestination.owner == $scope.userId){
            //if you own that paragraph, just put it there
            prep.paragraphPosition = prep.candidateParagraphDestination.position+1;
            prep.position = 0;
            prep.insertsBelow = true;
            prep.replacesBlankAndMoves = true;
            console.log("Starting a new paragraph from a deleted blank in one's own document")
            // close off the paragraph above to the user
          } else {
            // it exists but its not yours
            for (var i = 0; i < prep.nodeDestination.paragraphs.length; i++){
              if (prep.nodeDestination.paragraphs[i].owner == $scope.userId && prep.nodeDestination.paragraphs[i].owner !== ''){
                for (var j = i+1; j < prep.nodeDestination.paragraphs.length; j++){
                  if (prep.nodeDestination.paragraphs[j]){
                    if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId && 
                    prep.nodeDestination.paragraphs[i].owner !== ''){
                      prep.paragraphPosition = j;
                      prep.position = 0;
                      prep.insertsBelow = true;
                      prep.replacesBlankAndMoves = true;
                      console.log("Placing this as the last paragraph in the section of one's own document")
                      break;
                    }
                  } else {
                    prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                    prep.position = 0;
                    prep.insertsBelow = true;
                    prep.replacesBlankAndMoves = true;
                    console.log("Placing this at the end of the document, after going through")
                    break;
                  }
                }
              }
            } 
            if (!prep.insertsAbove && !prep.insertsBelow){
              prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
              prep.position = 0;
              prep.insertsBelow = true;
              prep.replacesBlankAndMoves = true;
              console.log("Placing this at the end of the document")
            }
          }   
          
          if (prep.paragraphPosition < $scope.selectedParagraph.position){
            prep.ofParagraphPosition = ($scope.selectedParagraph.position +1);
          } else {
            prep.ofParagraphPosition = $scope.selectedParagraph.position;
          }
          
        } else if (!prep.answeredQuestion && prep.type !== 'topic') {

          if (paragraph.topAdd) {
            prep.nodePath = '$scope.data'; 
            prep.address = $scope.selectedNode.address;
            for (var i = 0; i < prep.address.length; i++) {                                          //     BUILDS THE ADDRESS TO THE NODE WHERE THE PROPOSITION GOES
              if (i < prep.address.length - 1) {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
              } else {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
              }
            }
            prep.nodeDestination = eval(prep.nodePath)
            prep.candidateParagraphPosition = $scope.selectedParagraph.position-1;
            prep.candidateParagraphPath = prep.nodePath + '.paragraphs[' + prep.candidateParagraphPosition.toString()
            + ']';
            if (eval(prep.candidateParagraphPath)){
              //there's a place to put it above
              prep.candidateParagraphDestination = eval(prep.candidateParagraphPath);
              if (prep.candidateParagraphDestination.owner == $scope.userId){
                //youre the owner
                prep.paragraphPosition = prep.candidateParagraphDestination.position;
                prep.position = 0;
                prep.insertsAbove = true;
                console.log("Putting it above, 1st")

                // close off the paragraph above to the user
              } else {
                // if its there but youre not the author at the candidate destination,
                // find your document
                for (var i = 0; i < prep.nodeDestination.paragraphs.length; i++){
                  if (prep.nodeDestination.paragraphs[i].owner == $scope.userId){
                    for (var j = i+1; j < prep.nodeDestination.paragraphs.length; j++){
                      if (prep.nodeDestination.paragraphs[j]){
                        if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId){
                          prep.paragraphPosition = j;
                          prep.position = 0;
                          prep.insertsAbove = true;
                          console.log("Placing this as the last paragraph in the section of one's own document 1st")
                          break;
                        }
                      } else {
                        prep.paragraphPosition = i;
                        prep.position = 0;
                        prep.insertsAbove = true;
                        console.log("Placing this as the last paragraph in the section of one's own document 2nd")
                        break;
                      }
                    }
                  }
                } 

                // Differentiate here based on whether the selected paragraph is one's own or not
                if($scope.selectedParagraph.owner === $scope.userId){
                  prep.paragraphPosition = $scope.selectedParagraph.position;
                  prep.position = 0;
                  prep.insertsAbove = true;
                  console.log("Putting it above, lower")
                } else if (!prep.insertsAbove && !prep.insertsBelow){
                  prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                  prep.position = 0;
                  prep.insertsBelow = true;
                  console.log("Placing this at the end of the document, if")
                }
              }
            } else {
              // theres no paragraph at a position above
              if (prep.nodeDestination.paragraphs[$scope.selectedParagraph.position].owner !== $scope.userId){
                prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Placing this at the end of the document, else escape")
              } else {
              for (var i = prep.nodeDestination.paragraphs.length-1; i > -1; i--){
                if (prep.nodeDestination.paragraphs[i].owner == $scope.userId){
                  if (prep.nodeDestination.paragraphs[i-1]){
                    for (var j = i-1; j > -1; j--){
                      if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId && !prep.insertsAbove){
                        prep.paragraphPosition = j;
                        prep.position = 0;
                        prep.insertsAbove = true;
                        console.log("Placing this as the first paragraph in the section of one's own document, else escape")
                        break;
                      }
                    }
                  } else {
                    prep.paragraphPosition = 0;
                    prep.position = 0;
                    prep.insertsAbove = true;
                    console.log("Putting at top of authors clump and document")
                    break;
                  }
                }
              }
              } 
              if (!prep.insertsAbove){
                prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Placing this at the end of the document, else")
              }
            }

          } else if (paragraph.bottomAdd || $scope.newProp) {
            prep.nodePath = '$scope.data';
            prep.address = $scope.selectedNode.address;
            for (var i = 0; i < prep.address.length; i++) {                                          //     BUILDS THE ADDRESS TO THE NODE WHERE THE PROPOSITION GOES
              if (i < prep.address.length - 1) {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
              } else {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
              }
            }
            prep.nodeDestination = eval(prep.nodePath)
            if (!$scope.newProp){
              prep.candidateParagraphPosition = $scope.selectedParagraph.position+1;
            } else {
              prep.candidateParagraphPosition = 490951;
            }
            prep.candidateParagraphPath = prep.nodePath + '.paragraphs[' + prep.candidateParagraphPosition.toString()
            + ']';
            if (eval(prep.candidateParagraphPath)){
              // if there is a paragraph one position above
              // wont find anything due to changing the path, above
              prep.candidateParagraphDestination = eval(prep.candidateParagraphPath);
              if (prep.candidateParagraphDestination.owner == $scope.userId &&
              $scope.selectedParagraph.owner !== $scope.userId){
                prep.paragraphPosition = prep.candidateParagraphDestination.position;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Putting it below, top")
                // puts it wrong above
              } else {
               
                for (var i = 0; i < prep.nodeDestination.paragraphs.length; i++){
                 
                  if (prep.nodeDestination.paragraphs[i].owner == $scope.userId && !prep.insertsBelow){
                    
                    for (var j = i+1; j < prep.nodeDestination.paragraphs.length; j++){
                      
                      if (prep.nodeDestination.paragraphs[j]){
                        if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId){
                        
                          prep.paragraphPosition = j;
                          prep.position = 0;
                          prep.insertsBelow = true;
                          console.log("Placing this as the last paragraph in the section of one's own document, 1st")
                          break;
                        }
                      } else {
                        prep.paragraphPosition = i;
                        prep.position = 0;
                        prep.insertsBelow = true;
                        console.log("Placing this at the end of the document as paragraphs stretch to the bottom of the section")  
                        break;     
                      }
                    }
                  }

                } 
                if (!prep.insertsBelow){
                  prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                  prep.position = 0;
                  prep.insertsBelow = true;
                  console.log("Placing this at the end of the document as not have found")
                }
              }
            } else {
              
              for (var i = 0; i < prep.nodeDestination.paragraphs.length; i++){
               
                if (prep.nodeDestination.paragraphs[i].owner == $scope.userId){
                  
                  for (var j = i+1; j < prep.nodeDestination.paragraphs.length; j++){
                    
                    if (prep.nodeDestination.paragraphs[j]){
                      if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId && !prep.insertsBelow){
                      
                        prep.paragraphPosition = j;
                        prep.position = 0;
                        prep.insertsBelow = true;
                        console.log("Placing this as the last paragraph in the section of one's own document, 2nd")
                        break;
                      }

                      // breaks here - user thinks they are adding to the bottom of another author's section
                      // but it puts it at the top of the user's section
                    } else {
                      prep.paragraphPosition = i;
                      prep.position = 0;
                      prep.insertsBelow = true;
                      console.log("Placing this at the end of the document as paragraphs stretch to the bottom of the section, 2nd") 
                      break;      
                    }
                  }
                }
              } 
              if (!prep.insertsBelow){
                prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Placing this at the end of the document as not have found, 2nd")
              }
           



            }
          } else if (paragraph.leftAdd) {
            prep.nodePath = '$scope.data';
            prep.address = $scope.selectedNode.address;
            for (var i = 0; i < prep.address.length; i++) {                                          //     BUILDS THE ADDRESS TO THE NODE WHERE THE PROPOSITION GOES
              if (i < prep.address.length - 1) {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
              } else {
                prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
              }
            }
            prep.nodeDestination = eval(prep.nodePath)
            // prep.candidateParagraphPosition = $scope.selectedParagraph.position-1;
            // prep.candidateParagraphPath = prep.nodePath + '.paragraphs[' + prep.candidateParagraphPosition.toString()
            // + ']';
            if ($scope.selectedProposition.author == $scope.userId){
              prep.paragraphPosition = $scope.selectedParagraph.position;
              prep.position = $scope.selectedProposition.position;
              prep.insertsLeft = true;
              console.log("Putting it to the left")
              // close off the paragraph above to the user
            } else {
              for (var i = 0; i < prep.nodeDestination.paragraphs.length; i++){
                if (prep.nodeDestination.paragraphs[i].owner == $scope.userId){
                  for (var j = i+1; j < prep.nodeDestination.paragraphs.length; j++){
                    if (prep.nodeDestination.paragraphs[j]){
                      if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId && !prep.insertsBelow){
                        prep.paragraphPosition = j;
                        prep.position = 0;
                        prep.insertsBelow = true;
                        console.log("Placing this as the last paragraph in the section of one's own document")
                        break;
                      }
                    } else {
                      prep.paragraphPosition = i;
                      prep.position = 0;
                      prep.insertsBelow = true;
                      console.log("Placing this at the end of the document as paragraphs stretch to the bottom of the section") 
                      break;      
                    }
                  }
                }
              } 
              if (!prep.insertsBelow){
                prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Placing this at the end of the document")
              }
            }
          } else if ($scope.newProp){
            // prep.paragraphPosition = $scope.selectedNode.paragraphs.length;
            // prep.position = 0;
            // prep.newProp = true;
            // console.log('New prop');        
          } else if (prep.type !== 'rejoinder') {
           
            for (var i = $scope.selectedProposition.position; i < $scope.selectedParagraph.propositions.length; i++) {                 //     OTHERWISE ITS WITHIN AN EXISTING PARAGRAPH
              if ($scope.selectedParagraph.propositions[i + 1] &&
                $scope.selectedParagraph.propositions[i + 1].type !== 'negation' &&
                $scope.selectedParagraph.propositions[i + 1].hiddenForAll !== true  &&
                $scope.selectedParagraph.propositions[i + 1].hidden !== true  &&
                $scope.selectedParagraph.propositions[i + 1][$scope.userId] !== 'hidden'
                ) {
                prep.paragraphPosition = $scope.selectedParagraph.position;
                prep.position = i + 1;
                prep.getsOwnProposition = true;
                break;
              }
            }
            if (!prep.getsOwnProposition) {
              prep.paragraphPosition = $scope.selectedParagraph.position;                //    IF NO POSITION HAS BEEN CALCULATED, GETS OWN PROPOSITION WITH POSITION ON THE END
              prep.position = $scope.selectedParagraph.propositions.length;
              prep.getsOwnProposition = true;
            }
          }
        }

      
        if (prep.type !== 'topic' && prep.type !== 'negation' && !prep.answeredQuestion && prep.type !== 'rejoinder') {
          prep.nodePath = '$scope.data';
          prep.address = $scope.selectedNode.address;

          for (var i = 0; i < prep.address.length; i++) {                                          //    CALCULATES PATH TO THE NODE
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }


          // Had a toString of undefined about here, needs to be fixed

          prep.assertionPath = prep.nodePath + '.paragraphs[' + prep.paragraphPosition.toString() + '].propositions[' + prep.position.toString() + ']';

          if (prep.assertionDestination) {
            $scope.selectedProposition = eval(prep.assertionPath);   //   SET SELECTEDPROPOSITION EQUAL TO THE PLACE IT IS BEING PUT
          }

          prep.of = {
            id: $scope.selectedProposition.id,     //    THE OF WILL BE WHAT'S AT THE PLACE WHERE IT'S PUT
            type: $scope.selectedProposition.type,
            author: $scope.selectedProposition.author,
            text: $scope.selectedProposition.text,
          };
        }

        prep.adjustedText = prep.adjustedText.replace(/&nbsp;/g, ' ');
      

   
        prep.payload = {
          topic: prep.topic,
          address: prep.address,
          paragraphPosition: prep.paragraphPosition,
          ofParagraphPosition: (prep.ofParagraphPosition !== undefined ? prep.ofParagraphPosition : undefined),
          blankId: IdFactory.next(),
          textSide: $scope.selectedProposition.textSide,
          class: (prep.newClass ? prep.newClass : prep.class),
          nodePath: (prep.nodePath ? prep.nodePath : undefined),
          nodeId: IdFactory.next(),
          oldNodePath: (prep.oldNodePath ? prep.oldNodePath : undefined),                          //    COMPOSITION OF THE PAYLOAD
          question: (prep.question ? prep.question : undefined),
          paragraphId: IdFactory.next(),
          selectedParagraphId: $scope.selectedParagraph.paragraphId,
          bookId: $scope.bookId,
          proposition: {
            id: IdFactory.next(),
            address: prep.address,
            nodePath: (prep.nodePath ? prep.nodePath : undefined),
            question: (prep.question ? prep.question : undefined),
            answeredQuestion: (prep.answeredQuestion ? prep.answeredQuestion : undefined),
            getsOwnNode: (prep.getsOwnNode === true ? prep.getsOwnNode : undefined),
            getsOwnParagraph: (prep.getsOwnParagraph === true ? prep.getsOwnParagraph : undefined),
            getsOwnPlace: (prep.getsOwnPlace === true ? prep.getsOwnPlace : undefined),
            newProp: (prep.newProp === true ? prep.newProp : undefined),
            getsOwnProposition: (prep.getsOwnProposition === true ? prep.getsOwnProposition : undefined),
            replacesBlank: (prep.replacesBlank === true ? prep.replacesBlank : undefined),
            replacesBlankAndMoves:
              (prep.replacesBlankAndMoves === true ? prep.replacesBlankAndMoves : undefined),
            insertsAbove: (prep.insertsAbove === true ? prep.insertsAbove : undefined),
            insertsBelow: (prep.insertsBelow === true ? prep.insertsBelow : undefined),
            insertsLeft: (prep.insertsLeft === true ? prep.insertsLeft : undefined),
            assertionPath: (prep.assertionPath ? prep.assertionPath : undefined),
            assertionId: (prep.assertionId ? prep.assertionId : undefined),
            remarkAddress: (prep.remarkAddress ? prep.remarkAddress : undefined),
            remarkPath: (prep.remarkPath ? prep.remarkPath : undefined),
            isAntecedent: (prep.isAntecedent ? prep.isAntecedent : undefined),
            isConsequent: (prep.isConsequent ? prep.isConsequent : undefined),
            isPlaceholder: (prep.isPlaceholder ? prep.isPlaceholder : undefined),
            author: $scope.userId,
            text: prep.adjustedText,
            dialogueText: angular.copy(prep.adjustedText),
            type: prep.type,
            of: (prep.of ? prep.of : undefined),
            position: prep.position,
            remarks: []
          }
        };
        if (prep.payload.proposition.type === 'assertion' && !prep.payload.proposition.question) {
          prep.payload.proposition.assertionId = prep.payload.proposition.id;            //     DEFINES ASSERTIONID FOR NEW ASSERTIONS
        } else if (prep.payload.proposition.type === 'assertion') {
          prep.payload.proposition.assertionId = prep.payload.proposition.id;
        }

        $scope.inputs.proposition = '';
        $scope.inputs.chatProposition = '';                                             //      CLEARS THINGS AND EMITS THE PAYLOAD
        chatSocket.emit('proposition', $scope.userId, prep.payload);
        console.log('Payload:', prep.payload);
        prep = {};


        if (paragraph){
      
        paragraph.topAdd = false;
        paragraph.bottomAdd = false;
        paragraph.leftAdd = false;
        paragraph.leftMouseOver = false;
        paragraph.topMouseOver = false;
        paragraph.bottomAdd = false;
        paragraph.bottomMouseOver = false;
        }

        $scope.hasTopFocus = '';
        $scope.hasBottomFocus = {};
        $scope.hasLeftFocus = '';
        // $scope.hasRightFocus = {};
        $scope.newProp = '';
        $scope.threadAdding = '';



      };


      $scope.$on('socket:broadcastProposition', function(event, payload) {
        if (payload.bookId !== $scope.bookId){
         
          return;
        }
        $timeout(function() {
          $scope.$apply(function() {
            console.log("Received proposition")

            apply = {};



            if (payload.proposition.getsOwnNode) {
              apply.oldNodeDestination = eval(payload.oldNodePath);
              if (!apply.oldNodeDestination.children) {
                apply.oldNodeDestination.children = [];
              }

              // Topics
              if (payload.proposition.type === 'topic') {
                apply.oldNodeDestination.children.push({
                  class: payload.class,
                  address: payload.address,
                  topic: payload.topic,
                  nodePath: payload.nodePath,
                  nodeId: payload.nodeId,
                  paragraphs: [
                    {
                      paragraphId: payload.paragraphId,
                      position: payload.paragraphPosition,
                      owner: '',
                      propositions: [
                        {
                          id: payload.proposition.id,
                          type: 'blank',
                          text: '',
                          author: '',
                          position: payload.proposition.position,
                          nodePath: payload.nodePath,
                          address: prep.address
                        }
                      ]
                    }
                  ],
                  children: []
                });
                apply.nodeDestination = eval(payload.nodePath);
                apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
                apply.paragraphDestination = eval(apply.paragraphPath);
                apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
                apply.propositionDestination = eval(apply.propositionPath);
                if (payload.proposition.author === $scope.userId && $scope.selectedProposition.textSide === true) {
                  $scope.selectedNode = apply.nodeDestination;
                 
                  $scope.selectedParagraph = apply.paragraphDestination;
               
                  $scope.selectedProposition = apply.propositionDestination;
                  $scope.hasRightFocus.id = $scope.selectedProposition.id
                  $scope.selectedProposition.textSide = true;
                  focusFactory($scope.selectedProposition.id);
                  
                  var query = 'proposition' + $scope.selectedProposition.id;
                  $(query).trigger('click');
                  query = '';
                }
              }

              // Answered questions

              if (payload.proposition.answeredQuestion) {

               
                for (var i = 0; i < apply.oldNodeDestination.paragraphs.length; i++) {
                  for (var j = 0; j < apply.oldNodeDestination.paragraphs[i].propositions.length; j++) {
                    if (payload.proposition.of.id === apply.oldNodeDestination.paragraphs[i].propositions[j].id) {
                      apply.oldNodeDestination.paragraphs[i].propositions[j][$scope.userId] = 'hidden';
                      apply.oldNodeDestination.paragraphs[i].propositions[j].rejoined = true;
                      
                      break;
                    }
                  }
                }

                apply.oldNodeDestination.children.push({
                  class: payload.class,
                  address: payload.address,
                  topic: payload.topic,
                  paragraphs: [
                    {
                      paragraphId: payload.paragraphId,
                      position: payload.paragraphPosition,
                      propositions: [
                        {
                          id: payload.proposition.id,
                          author: payload.proposition.author,
                          type: payload.proposition.type,
                          text: payload.proposition.text,
                          dialogueText: payload.proposition.dialogueText,
                          position: payload.proposition.position
                        }
                      ]
                    }
                  ],
                  children: []
                });
                apply.nodeDestination = eval(payload.nodePath);
                apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
                apply.paragraphDestination = eval(apply.paragraphPath);
                apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
                apply.propositionDestination = eval(apply.propositionPath);
                if (payload.proposition.author === $scope.userId && $scope.selectedProposition.textSide === true) {
                  $scope.selectedNode = apply.nodeDestination;
                
                  $scope.selectedParagraph = apply.paragraphDestination;
              
                  $scope.selectedProposition = apply.propositionDestination;
                
                  $scope.selectedProposition.textSide = true;
                  focusFactory($scope.selectedProposition.id);
                  var query = 'proposition' + $scope.selectedProposition.id;
                  $(query).trigger('click');
                  query = '';
                }
              }


            } else if (payload.proposition.getsOwnPlace) {
              apply.nodeDestination = eval(payload.nodePath);
              apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position] = payload.proposition;
            
            } 

      

            else if (payload.proposition.replacesBlank) {

              // shouldnt trigger
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.nodePath = payload.nodePath;
              apply.nodeDestination = eval(payload.nodePath);

              for (var i = apply.paragraphDestination.propositions.length - 1; i > payload.proposition.position - 1; i--) {
                apply.paragraphDestination.propositions[i].position++;

                if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id &&
                    payload.proposition.author !== $scope.userId) {
                  $scope.selectedProposition.position = angular.copy(apply.paragraphDestination.propositions[i].position);
                }
                apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
              }


              if (apply.paragraphDestination[$scope.userId] === 'hidden' || apply.paragraphDestination.hiddenForAll === true) {
                apply.paragraphDestination[$scope.userId] = '';
              }

              apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position] = payload.proposition;
              apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position + 1][$scope.userId] = 'hidden';
              apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position + 1].hiddenForAll = true;
              

              if (apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position].id === $scope.selectedProposition.id) {
                $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position + 1];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
              }

              if (payload.proposition.author === $scope.userId) {
            
                $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                $scope.hasRightFocus.id = $scope.selectedProposition.id
                $scope.selectedProposition.textSide = true;
                if (payload.textSide === true) {
                  $scope.selectedProposition.textSide = true;
                }
                focusFactory($scope.selectedProposition.id);
              }
            } else if (payload.proposition.getsOwnProposition) {
             

              apply.nodeDestination = eval(payload.nodePath);
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
              apply.propositionDestination = eval(apply.propositionPath);

              if (apply.propositionDestination) {
                for (var i = apply.paragraphDestination.propositions.length - 1; i > payload.proposition.position - 1; i--) {
                  apply.paragraphDestination.propositions[i].position++;

                  if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id &&
                    payload.proposition.author !== $scope.userId) {
                    $scope.selectedProposition.position = angular.copy(apply.paragraphDestination.propositions[i].position);
                  }
                  apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
                }
                apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;
              } else {
                apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;
              }
              if (payload.proposition.author === $scope.userId && payload.textSide === true) {
                $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
                $scope.hasRightFocus.id = $scope.selectedProposition.id
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');
              }

            } else if (payload.proposition.insertsAbove) {
              apply.nodeDestination = eval(payload.nodePath);
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
           
              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
              if (apply.paragraphDestination){
                apply.propositionDestination = eval(apply.propositionPath);

                var counter = angular.copy(apply.nodeDestination.paragraphs.length-1)
                // from the last paragraph position on the node down to the calculated paragraph position minus one, exclusive...
                for (var i =  counter; i > payload.paragraphPosition - 1; i--) {
                 
                  // up the paragraph position
                  apply.nodeDestination.paragraphs[i].position++;
                  // if user has selected the paragraph being moved up, update selectedParagraph
                  if ($scope.selectedParagraph){
                    if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id &&
                    payload.proposition.author !== $scope.userId) {
                      $scope.selectedParagraph.position = angular.copy(apply.nodeDestination.paragraphs[i].position);
                    }
                  }
                  // copy the paragraph up
                  apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];
                  // increase index of assertion paths affected
                  for (var j = 0; j < apply.nodeDestination.paragraphs[i + 1].propositions.length; j++) {
                   
                    if (apply.nodeDestination.paragraphs[i + 1].propositions[j].type === 'assertion') {
                      apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + 
                      (i + 1).toString() + '].propositions[' + j.toString() + ']';
                    }
                    for (var k = 0; k < apply.nodeDestination.paragraphs[i + 1].propositions.length; k++) {
                     
                      if (apply.nodeDestination.paragraphs[i + 1].propositions[k].type === 'assertion' &&
                        // if an assertion is found matching 

                        apply.nodeDestination.paragraphs[i + 1].propositions[k].assertionId === 
                        apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionId) {
                        apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = 
                        payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + k.toString() + ']';
                      }
                    }
                  }

               


                  for (var l = 0; l < $scope.propositions.length; l++) {
                    if ($scope.propositions[l].assertionId === payload.proposition.assertionId) {
                      $scope.propositions[l].assertionPath = payload.proposition.assertionPath;
                    }
                  }
                }
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };

                if (payload.proposition.author === $scope.userId && payload.textSide === true) {


                  $timeout(function() {

                    $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                    $scope.selectedProposition = 
                    apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                    $scope.hasRightFocus.id = $scope.selectedProposition.id
                    $scope.selectedProposition.textSide = true;

                    focusFactory($scope.selectedProposition.id);
                    $($scope.selectedProposition.id).trigger('click');
                  }, 30);


                }

              } else {
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };

                if (payload.proposition.author === $scope.userId && payload.textSide === true) {


                  $timeout(function() {

                    $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                    $scope.selectedProposition = 
                    apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                    $scope.hasRightFocus.id = $scope.selectedProposition.id
                    $scope.selectedProposition.textSide = true;

                    focusFactory($scope.selectedProposition.id);
                    $($scope.selectedProposition.id).trigger('click');
                  }, 30);


                }
              }


            } else if (payload.proposition.insertsBelow) {
              console.log("Inserts below")
              apply.nodeDestination = eval(payload.nodePath);
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.paragraphAbovePath = payload.nodePath + '.paragraphs[' + (payload.paragraphPosition - 1).toString() + ']';
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + 
              '.propositions[' + payload.proposition.position.toString() + ']';

              if (typeof (eval(apply.paragraphPath)) === 'undefined') {
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                {
                  first: true,
                  paragraphId: payload.paragraphId,
                  position: payload.paragraphPosition,
                  propositions: [payload.proposition]
                };
                apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position].first = true;
              } else {
                for (var i = apply.nodeDestination.paragraphs.length - 1; i > payload.paragraphPosition - 1; i--) {
                  apply.nodeDestination.paragraphs[i].position++;
                  if ($scope.selectedParagraph){
                    if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id &&
                    payload.proposition.author !== $scope.userId) {
                      $scope.selectedParagraph.position = angular.copy(apply.nodeDestination.paragraphs[i].position);
                    }
                  }
                  apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];
                  for (var j = 0; j < apply.nodeDestination.paragraphs[i + 1].propositions.length; j++) {
                   
                    if (apply.nodeDestination.paragraphs[i + 1].propositions[j].type === 'assertion') {
                      
                      apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + 
                      (i + 1).toString() + '].propositions[' + j.toString() + ']';
                    }
                   
                    for (var k = 0; k < apply.nodeDestination.paragraphs[i + 1].propositions.length; k++) {
                     
                      if (apply.nodeDestination.paragraphs[i + 1].propositions[k].type === 'assertion' &&
                        apply.nodeDestination.paragraphs[i + 1].propositions[k].assertionId === 
                        apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionId) {
                        apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = 
                      payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + k.toString() + ']';
                      }
                    }
                  }


                  for (var l = 0; l < $scope.propositions.length; l++) {
                    if ($scope.propositions[l].assertionId === payload.proposition.assertionId) {
                      $scope.propositions[l].assertionPath = payload.proposition.assertionPath;
                    }
                  }
                }
                
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    first: true,
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };
                apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position].first = true;
              }

              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.paragraphAboveDestination = eval(apply.paragraphAbovePath);




              if (payload.proposition.author === $scope.userId && payload.textSide === true && payload.proposition.replacesBlankAndMoves) {
                console.log("own replaces blank and moves")
                $scope.selectedNode = apply.nodeDestination;
                console.log('selected node: ', $scope.selectedNode)
                console.log('node destination: ', apply.nodeDestination)
                apply.ofParagraphPosition = payload.ofParagraphPosition;
                apply.ofParagraphPath = payload.nodePath + '.paragraphs[' + apply.ofParagraphPosition.toString() + ']';
                apply.ofParagraphDestination = eval(apply.ofParagraphPath);
                apply.ofParagraphDestination.propositions[0][$scope.userId] = 'hidden';
                apply.ofParagraphDestination.propositions[0].hiddenForAll = true;
                apply.ofParagraphDestination[$scope.userId] = 'hidden';
                apply.ofParagraphDestination.hiddenForAll = true;

                $timeout(function() {
                  
                  $scope.selectedParagraph = $scope.selectedNode.paragraphs[payload.paragraphPosition];
                  console.log("before the click selected paragraph: ", $scope.selectedParagraph)
                  $scope.selectedProposition = 
                  $scope.selectedParagraph.propositions[payload.proposition.position];
                  $scope.hasRightFocus.id = $scope.selectedProposition.id
                  $scope.selectedProposition.textSide = true;
                  focusFactory($scope.selectedProposition.id);
                  console.log("before the click node: ", $scope.selectedNode)
                  console.log("before the click selected proposition: ", $scope.selectedProposition)
                  $($scope.selectedProposition.id).trigger('click');
                }, 30);


              } else if (payload.proposition.author === $scope.userId && payload.textSide === true ){
                  console.log("own else if")
                  $timeout(function() {
                    apply.nodeDestination = eval(payload.nodePath);
                    $scope.selectedNode = apply.nodeDestination;
                    $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                    $scope.selectedProposition = 
                    apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                    $scope.hasRightFocus.id = $scope.selectedProposition.id
                    $scope.selectedProposition.textSide = true;
                    focusFactory($scope.selectedProposition.id);
                    $('proposition' + $scope.selectedProposition.id).trigger('click');
                  }, 30);            
                }
            } else if (payload.proposition.insertsLeft) {
              
              
              apply.nodeDestination = eval(payload.nodePath);
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
            
              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + 
              '.propositions[' + payload.proposition.position.toString() + ']';
              apply.propositionDestination = eval(apply.propositionPath);
              if (apply.propositionDestination) {
                for (var i = apply.paragraphDestination.propositions.length - 1; i > payload.proposition.position; i--) {
                  apply.paragraphDestination.propositions[i].position++;
                  if ($scope.selectedProposition){
                    if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id &&
                    payload.proposition.author !== $scope.userId) {
                      $scope.selectedProposition.position = angular.copy(apply.paragraphDestination.propositions[i].position);
                    }
                  }
                  apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
                }
                apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition; 
              } else {
                apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;
              }

              if (payload.proposition.author === $scope.userId && payload.textSide === true) {
                $timeout(function() {
               
                $scope.selectedParagraph = eval(payload.nodePath + '.paragraphs[' + 
                payload.paragraphPosition.toString() + ']');
                $scope.selectedProposition = eval(payload.nodePath + '.paragraphs[' + 
                payload.paragraphPosition.toString() + '].propositions[' + payload.proposition.position.toString() +
                ']');
                $scope.hasRightFocus.id = $scope.selectedProposition.id
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');
                }, 30);    
              }
            } 



            else {
              apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;
           
              if (payload.proposition.author === $scope.userId && $scope.selectedProposition.textSide === true) {
                $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
                $scope.hasRightFocus.id = $scope.selectedProposition.id
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');
              }
            }


            // Hides rejoined propositions
            if ((payload.proposition.type === 'rejoinder' || payload.proposition.answeredQuestion) && payload.proposition.insertsBelow) {
              for (var i = 0; i < apply.paragraphAboveDestination.propositions.length; i++) {
                if (payload.proposition.of.id === apply.paragraphAboveDestination.propositions[i].id) {
                  apply.paragraphAboveDestination.propositions[i].rejoined = true;
                  apply.paragraphAboveDestination.propositions[i][$scope.userId] = 'hidden';
                  apply.paragraphAboveDestination.propositions[i].hiddenForAll = true;
                }
              }
            } else if (payload.proposition.type === 'rejoinder' || payload.proposition.answeredQuestion) {
              for (var i = 0; i < apply.paragraphDestination.propositions.length; i++) {
                if (payload.proposition.of.id === apply.paragraphDestination.propositions[i].id) {
                  apply.paragraphDestination.propositions[i].rejoined = true;
                  apply.paragraphDestination.propositions[i][$scope.userId] = 'hidden';
                  apply.paragraphDestination.propositions[i].hiddenForAll = true;
                }
              }
            }

            $scope.scroll.threadId = IdFactory.next();

            // Check to see if paragraph is muted, set muted flag

            apply.mutedParagraphPath = payload.nodePath + ".paragraphs[" + payload.paragraphPosition + "]";
            if (eval(apply.mutedParagraphPath)){
              if (eval(apply.mutedParagraphPath)[$scope.userId] === 'hidden' || eval(apply.mutedParagraphPath).hiddenForAll == true){
                apply.muteIncomingThread = true;
              }
            } 
            // else {
              
            // }

            //       DIALOGUE PRINTER


            if (payload.proposition.type === 'topic') {

              temp.oldNodePath = eval(payload.oldNodePath);
              apply.nodeDestination = eval(payload.nodePath);

              $scope.data[0].dialogue.push({
                class: temp.oldNodePath.class,
                topic: temp.oldNodePath.topic,
                address: payload.address,
                paragraphPosition: payload.paragraphPosition,
                nodePath: (payload.nodePath ? payload.nodePath : undefined),
                oldNodePath: (payload.oldNodePath ? payload.oldNodePath : undefined),
                question: (payload.question ? payload.question : undefined)
              });
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks = [];
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0] = payload.proposition;
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0].dialogueText = apply.nodeDestination.topic;
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0].isDialogueTopic = true;
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].threadId = $scope.scroll.threadId;

            } else if (payload.proposition.type === 'assertion') {



              temp.assertionPath = payload.proposition.assertionPath;
              temp.assertionDestination = eval(payload.proposition.assertionPath);
              $scope.data[0].dialogue.push({
                class: payload.class,
                topic: payload.topic,
                address: payload.address,
                nodePath: (payload.nodePath ? payload.nodePath : undefined),
                oldNodePath: (payload.oldNodePath ? payload.oldNodePath : undefined),
                paragraphPosition: payload.paragraphPosition,
                question: (payload.question ? payload.question : undefined),
                threadId: $scope.scroll.threadId,
                remarks: [payload.proposition]
              });

              if (apply.muteIncomingThread){
                $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1][$scope.userId] = 'hidden'
              }

              for (var i = 0; i < apply.paragraphDestination.propositions.length; i++) {
                if (apply.paragraphDestination.propositions[i].type === 'assertion' &&                                 //    FIND WHERE TEH ASSERTION IS NOW
                  apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {           //    UPDATE ITS PATH
                  apply.propositionPath = apply.paragraphPath + '.propositions[' + i.toString() + ']';
                  apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;
                  
                }
              }


              for (var i = 0; i < apply.paragraphDestination.propositions.length; i++) {
                if (apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {                   //    UPDATES THE ASSERTIONPATH FOR ALL THE PROPOSITIONS
                  apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;                               //    IN THE PARAGRAPH AS APPROPRIATE
                }
              }

              for (var i = 0; i < $scope.propositions.length; i++) {
                if ($scope.propositions[i].assertionId === payload.proposition.assertionId) { // UPDATES THE ASSERTIONPATH FOR THE PROPOSITIONS
                  $scope.propositions[i].assertionPath = apply.propositionPath;               // IN THE PROPOSITIONS ARRAY
                }
              }

            } else { // theres a remarkPath
            
              temp.remarkAddress = payload.proposition.remarkAddress;
              apply.nodeDestination = eval(payload.nodePath);
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.paragraphDestination = eval(apply.paragraphPath);


              for (var i = 0; i < apply.nodeDestination.paragraphs.length; i++) {
                for (var j = 0; j < apply.nodeDestination.paragraphs[i].propositions.length; j++) {
                  if (apply.nodeDestination.paragraphs[i].propositions[j].type === 'assertion' &&                                 //    FIND WHERE TEH ASSERTION IS NOW
                    apply.nodeDestination.paragraphs[i].propositions[j].assertionId === payload.proposition.assertionId) {           //    UPDATE ITS PATH
                    apply.propositionPath = payload.nodePath + '.paragraphs[' + i.toString() + '].propositions[' + j.toString() + ']';
                    apply.nodeDestination.paragraphs[i].propositions[j].assertionPath = apply.propositionPath;
                  }

                }
              }


              for (var i = 0; i < $scope.propositions.length; i++) {
                if ($scope.propositions[i].assertionId === payload.proposition.assertionId) { // UPDATES THE ASSERTIONPATH FOR THE PROPOSITIONS
                  $scope.propositions[i].assertionPath = apply.propositionPath;               // IN THE PROPOSITIONS ARRAY
                }
              }

              temp.remarkPath = apply.propositionPath;          // the path to the assertion is the starting basis for the remark path
              temp.remarkDestination = eval(temp.remarkPath);


              for (var i = 0; i < payload.proposition.remarkAddress.length - 1; i++) {
                temp.remarkPath = temp.remarkPath + '.remarks[' + temp.remarkAddress[i].toString() + ']';   // navigate to the place to put the remark
              }


              temp.remarkDestination = eval(temp.remarkPath);
             
              if (temp.remarkDestination && temp.remarkDestination.remarks) {
                temp.remarkDestination.remarks[temp.remarkDestination.remarks.length] = payload.proposition;
              } else {
              
                // temp.remarkDestination.remarks;                                                                                                      //   OTHER POSSIBILITIES
                temp.remarkDestination.remarks = [];
                temp.remarkDestination.remarks[temp.remarkDestination.remarks.length] = payload.proposition;                                                              // If what's coming in is a first rejoinder
              }


              $scope.data[0].dialogue.push({
                class: payload.class,
                topic: payload.topic,
                address: payload.address,
                paragraphPosition: payload.paragraphPosition,
                nodePath: (payload.nodePath ? payload.nodePath : undefined),                          //   PUSH THE SUBSTANCE OF THE NODE TO THE DIALOGUE
                oldNodePath: (payload.oldNodePath ? payload.oldNodePath : undefined),
                question: (payload.question ? payload.question : undefined),
                assertionId: (payload.proposition.assertionId ? payload.proposition.assertionId : undefined),
                threadId: $scope.scroll.threadId,
                remarks: []
              });  // new thread topic is node topic

              if (apply.muteIncomingThread){
                $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1][$scope.userId] = 'hidden'
              }

              temp.propositionPath = apply.propositionPath;

              temp.assertionDestination = eval(temp.propositionPath);
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0] = temp.assertionDestination;  // new thread's first remark object is the assertion


              for (var i = 0; i < payload.proposition.remarkAddress.length; i++) {
                temp.propositionPath = temp.propositionPath + '.remarks[' + payload.proposition.remarkAddress[i].toString() + ']'; // calculate path to the parent remark for the new remark

                temp.propositionDestination = eval(temp.propositionPath);
                //     PUSH PROPOSITIONS TO THE THREAD ACCORDING TO THE ADDRESS
                $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[i + 1] = temp.propositionDestination; // the last thread's last remark is where the loop is pointing

                // the last thread's last remark is where proposition destination is pointing

              }


              // LOOP FOR HIDING THREADS
              // loop through threads
              // if assertionid matches payload assertionid and has one remark or assertionid matches payload assertionid, thread has more than one remark,
              // and last remark id matches second to last remark, hide the thread

              for (var i = 0; i < $scope.data[0].dialogue.length - 1; i++) {
                if ($scope.data[0].dialogue[i].remarks[0].assertionId === payload.proposition.assertionId &&
                  $scope.data[0].dialogue[i].remarks.length > 1 &&
                  $scope.data[0].dialogue[i].remarks[$scope.data[0].dialogue[i].remarks.length - 1].remarkAddress ===
                  $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[$scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks.length - 2].remarkAddress) {
                  $scope.data[0].dialogue[i].hidden = true;
                }

              }

            }

            $scope.inputs.remarkselected = false;

            if (payload.proposition.author === $scope.userId && $scope.selectedProposition.dialogueSide === true) {
              $timeout(function() {
                var query = '#' + payload.proposition.id + $scope.scroll.threadId;
               
                $(query).expanding();
                $(query).focus();
              }, 0);
            }

            //Update paragraph ownership
            apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
            apply.paragraphDestination = eval(apply.paragraphPath)

            if (!apply.paragraphDestination.owner && payload.proposition.type !== 'topic'){
            
              apply.paragraphDestination.owner = payload.proposition.author;
            }

            // for every incoming proposition, when assigning an owner to the paragraph
            for (var i = 0; i < $scope.userColorTable.length; i++){
              if($scope.userColorTable[i].author === payload.proposition.author && 
                payload.proposition.author !== $scope.userId){
                var alreadyThere = true;
                var place = i;
                
                break;
                
              }
            }
            if (!alreadyThere && payload.proposition.type !== 'topic'){
              if (payload.proposition.author !== $scope.userId && payload.proposition.type !== 'negation'){
               
                $scope.userColorTable.push(
                  {
                    author: payload.proposition.author, 
                    color: $scope.generateNewColor()
                  }
                )
                apply.paragraphDestination.color = $scope.userColorTable[$scope.userColorTable.length-1].color;
              }
              
            } else if (payload.proposition.author !== $scope.userId && payload.proposition.type !== 'negation' &&
              payload.proposition.type !== 'topic'){
              
              apply.paragraphDestination.color = $scope.userColorTable[place].color;
            }

            
            // assigns firsts to propositions

            
            
              
            // propositions
            for (var i = 0; i < apply.nodeDestination.paragraphs.length; i++){
            // for all paragraphs

              for (var j = 0; j < apply.nodeDestination.paragraphs[i].propositions.length; j++){
              // and all propositions
                if (apply.nodeDestination.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
                !apply.nodeDestination.paragraphs[i].propositions[j].hiddenForAll){
                  apply.nodeDestination.paragraphs[i].propositions[j].first = true;
                  for (var k = j; k < apply.nodeDestination.paragraphs[i].propositions.length; k++){
                    if (k > j){ 
                      apply.nodeDestination.paragraphs[i].propositions[k].first = false;
                    }
                  }
                  j = apply.nodeDestination.paragraphs[i].propositions.length;
                } else {
                  apply.nodeDestination.paragraphs[i].propositions[j].first = false;
                }
              }
            }

            $scope.assignColorsToExistingRemarks();
            temp = {};

          
            $scope.scroll = {};

            $scope.clearBlankOnBlur();

            $scope.propositions.push(payload.proposition);  // PUSHES THE PROPOSITION TO THE PROPOSITIONS ARRAY

            apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
            apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
            profileService.setSelectedBook($scope.data[0]);
          });
        }, 30);                                             // HAS A TIMEOUT


        // $scope.initialize();

       
        

        // $scope.makePristine();
        setTimeout(function() {
          apply.x = document.activeElement.id;
          if (apply.x !== $scope.hasRightFocus.id && apply.x !== $scope.hasLeftFocus  &&
              apply.x !== $scope.hasTopFocus && apply.x !== $scope.hasBottomFocus.id){
            $scope.clearBlankOnBlur();
          }
        });

        // Scroll
        $timeout(function() {
          var pane = document.getElementById('dialoguelist');
          pane.scrollTop = pane.scrollHeight;

          var theNode = document.getElementById(apply.nodeDestination.nodeId);
          var theNodeParagraphs = theNode.querySelectorAll(".paragraph");
          for (var m = 0; m < theNodeParagraphs.length; m++){
            console.log("the node paragraphs html: ", theNodeParagraphs[m].innerText, " (",m,")")
            var isFirst = theNodeParagraphs[m].id.toString().slice(9); 
            break;
          }
          console.log("apply.nodeDestination.paragraphs: ", apply.nodeDestination.paragraphs)
          if (isFirst){
            for (var n = 0; n < apply.nodeDestination.paragraphs.length; n++){
              if (apply.nodeDestination.paragraphs[n].paragraphId === isFirst &&
                apply.nodeDestination.paragraphs[n][$scope.userId] !== 'hidden' &&
                !apply.nodeDestination.paragraphs[n].hiddenForAll){
                apply.nodeDestination.paragraphs[n].first = true;
              } else {
                apply.nodeDestination.paragraphs[n].first = false;
              }
            }
          } else {
            for (var n = 0; n < apply.nodeDestination.paragraphs.length; n++){
              apply.nodeDestination.paragraphs[i].first = false;
            }
          }


        }, 30);

      });

      $scope.selectThread = function(thread) {
        $scope.selectedThread = thread;
        $scope.hasChatFocusThreadId = thread.threadId; 
      };

      $scope.clearGoddamnTextarea = function (){
        $('#' + $scope.selectedRemark.id + $scope.selectedThread.threadId)
            .parent().hide();     
      }

      $scope.clickBottom = function(paragraphId){
        $timeout( function(){
          document.getElementById(paragraphId).click();
        },0)
      }

      $scope.clearTopAndBottomHasFocus = function (){
       
        $scope.hasTopFocus = '';
        $scope.hasBottomFocus = {};
      }

      $scope.clearThreadAdding = function () {
        $scope.threadAdding = ''
      }


      $scope.selectPropositionById = function(id) {

        
        // insert left changes assertion paths

   

        for (var i = 0; i < $scope.propositions.length; i++) {
          if ($scope.propositions[i].id === id) {
            temp.assertionPath = $scope.propositions[i].assertionPath;
            break;
          }
        }
        if (!temp.assertionPath) {
          
          return;
        }
        $scope.mark = {};
        $scope.highlight = {};
        if (temp.hasOwnProperty('assertionPath') && temp.assertionPath !== undefined) {
          temp.sliceStartingAt = temp.assertionPath.indexOf('.propositions');
          temp.paragraphPath = temp.assertionPath.slice(0, temp.sliceStartingAt);
          temp.paragraphDestination = eval(temp.paragraphPath);
          $scope.selectedParagraph = temp.paragraphDestination;
          for (var i = 0; i < temp.paragraphDestination.propositions.length; i++) {
            if (temp.paragraphDestination.propositions[i].id === id) {
              if ($scope.selectedProposition){
                if ($scope.selectedProposition.id) {
                  $scope.selectedProposition = temp.paragraphDestination.propositions[i];
                  $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                  $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                  $scope.hasChatFocusId = $scope.selectedProposition.id;
                } else {
                    $scope.selectedProposition = temp.paragraphDestination.propositions[i];
                    $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                    $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                    $scope.hasChatFocusId = $scope.selectedProposition.id;
                }
              } else {
                $scope.selectedProposition = temp.paragraphDestination.propositions[i];
              
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                .expanding();
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                .expanding();
                $scope.hasChatFocusId = $scope.selectedProposition.id;
              }
              $scope.selectedProposition.dialogueSide = true;
              //get the remark to satisfy the ng-if so the form appear
              break;
            }
          }

        }



        setTimeout(function() {
          var destination = document.getElementById('proposition' + $scope.selectedProposition.id);
          if (destination) {
            destination.scrollIntoView({ behavior: 'smooth' });
          }
          var query = '#' + $scope.selectedProposition.id + $scope.selectedThread.threadId;
        
          $scope.$apply(function() {
            $(query).parent().show();
            $(query).expanding();
            $(query).focus();
         
          });
        }, 20);
        temp = {};
      };

      $scope.saveForLater = function (remarkId, thread){
        $scope.toSetLater = {
          remarkId: remarkId,
          threadId: thread.threadId
        }
      }

      $scope.showTextArea = function () {
        $scope.selectThread($scope.toSetLater.thread)
        $scope.selectPropositionById($scope.toSetLater.remarkId) 
      }

      $scope.blurLightUpLastVisiblePropositionInBook = function(book, event){
        
        var apply = {};
        apply.path = '$scope.data[0]';
        apply.destination = eval(apply.path);
        apply.id = '';
        apply.flagged;

        

        if (apply.destination.children){
          if (apply.destination.children.length > 0){
            while (apply.destination.children){
              if (apply.destination.children.length == 0){
               
                break;
              } else {
                apply.path = apply.path + '.children[' + (apply.destination.children.length-1).toString() + ']';
                apply.destination = eval(apply.path);
              }  
            }    
          }
        }

        apply.node = angular.copy(apply.destination)

        for (var i = apply.node.paragraphs.length-1; i > -1; i--){
          if (apply.node.paragraphs[i][$scope.userId] !== 'hidden' && !apply.node.paragraphs[i].hiddenForAll){
            for (var j = apply.node.paragraphs[i].propositions.length-1; j > -1; j--){
              if (apply.node.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' && 
              apply.node.paragraphs[i].propositions[j].hiddenForAll !== true &&
              apply.node.paragraphs[i].propositions[j].preSelected == true){
                apply.node.paragraphs[i].propositions[j].preSelected = false;
                return;
              }
            }
          }
        }
        apply = {};
      }

      $scope.lightUpLastVisiblePropositionInBook = function (book, event) {
        

        var apply = {}
        apply.path = '$scope.data[0]';
        apply.bookDestination = eval(apply.path);
        apply.id = '';
        apply.flagged;

        //Find the rightmost child, if any

        if (apply.bookDestination.children){
          if (apply.bookDestination.children.length > 0){
            while (apply.bookDestination.children){
              if (apply.bookDestination.children.length == 0){
                
                break;
              } else {
                apply.path = apply.path + '.children[' + (apply.bookDestination.children.length-1).toString() + ']';
                apply.bookDestination = eval(apply.path);
              }  
            }    
          }
        }


        for (var i = apply.bookDestination.paragraphs.length-1; i > -1; i--){
          if (apply.bookDestination.paragraphs[i][$scope.userId] !== 'hidden' && !apply.bookDestination.paragraphs[i].hiddenForAll){
            for (var j = apply.bookDestination.paragraphs[i].propositions.length-1; j > -1; j--){
              if (apply.bookDestination.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' && 
              apply.bookDestination.paragraphs[i].propositions[j].hiddenForAll !== true){
                apply.bookDestination.paragraphs[i].propositions[j].preSelected = true;
                return;
              }
            }
          }
        }
        apply = {};
      }

      $scope.getLastVisiblePropositionInBook = function(book, event){
        // console.log("Get runs")

         

          var path = '$scope.data[0]';
          var destination = eval(path);
          var id = '';
          var flagged;

          //Find the rightmost child, if any

          if (destination.children){
            if (destination.children.length > 0){
              while (destination.children){
                if (destination.children.length == 0){
                  // console.log("Break")
                  break;
                } else {
                  path = path + '.children[' + (destination.children.length-1).toString() + ']';
                  destination = eval(path);
                }  
              }    
            }
          }

          $scope.selectedNode = angular.copy(destination);

          // Find the rightmost visible paragraph
          for (var i = destination.paragraphs.length-1; i > -1; i--){
            if (destination.paragraphs[i][$scope.userId] !== 'hidden' && destination.paragraphs[i].hiddenForAll !== true){
              path = path + '.paragraphs[' + i.toString() + ']';
              destination = eval(path);
              break;
            }
          }

          $scope.selectedParagraph = angular.copy(destination);

          // Find the rightmost visible proposition
          for (var i = destination.propositions.length-1; i > -1; i--){
            if (destination.propositions[i][$scope.userId] !== 'hidden' && destination.propositions[i].hiddenForAll !== true){
              path = path + '.propositions[' + i.toString() + ']';
              destination = eval(path);
              flagged = true;
              break;
            }
          }

          // if (!flagged){
          //   $scope.selectedProposition = destination;
          // }
          $scope.selectedProposition = angular.copy(destination);

          // Click the id of the proposition landed upon
          id = $scope.selectedProposition.id;

          $timeout( function(){
            document.getElementById('proposition'+ id).click();
          },10)


        
      }

      $scope.blurLightUpLastVisiblePropositionInNode = function(node, event){
        for (var i = node.paragraphs.length-1; i > -1; i--){
          if (node.paragraphs[i][$scope.userId] !== 'hidden' && !node.paragraphs[i].hiddenForAll){
            for (var j = node.paragraphs[i].propositions.length-1; j > -1; j--){
              if (node.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' && node.paragraphs[i].propositions[j].hiddenForAll !== true &&
                node.paragraphs[i].propositions[j].preSelected == true){
                node.paragraphs[i].propositions[j].preSelected = false;
                return;
              }
            }
          }
        }
      }

      $scope.lightUpLastVisiblePropositionInNode = function (node, event) {

        if (event.target.localName !== 'ol'  ){
          return;
        }
        for (var i = node.paragraphs.length-1; i > -1; i--){
          if (node.paragraphs[i][$scope.userId] !== 'hidden' && !node.paragraphs[i].hiddenForAll){
            for (var j = node.paragraphs[i].propositions.length-1; j > -1; j--){
              if (node.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' && node.paragraphs[i].propositions[j].hiddenForAll !== true){
                node.paragraphs[i].propositions[j].preSelected = true;
                return;
              }
            }
          }
        }
      }

      $scope.getLastVisiblePropositionInNode = function(node, event){
        

        if (event.target.localName !== 'ol'  ){
          return;
        }
        $scope.selectedNode = node;
        
        for (var i = node.paragraphs.length-1; i > -1; i--){
          if (node.paragraphs[i][$scope.userId] !== 'hidden' && node.paragraphs[i].hiddenForAll !== true){
            $scope.selectedParagraph = node.paragraphs[i];
            for (var j = node.paragraphs[i].propositions.length-1; j > -1; j--){
              if (node.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' && !node.paragraphs[i].propositions[j].hiddenForAll){
                $scope.selectedProposition = node.paragraphs[i].propositions[j];
                break;
              }
            } 
          }
        }
        var id = $scope.selectedProposition.id;

        $timeout( function(){
          document.getElementById('proposition'+ id).click();
          
        },10)

      }

      $scope.blurLightUpLastVisiblePropositionInParagraph = function(node, paragraph, event){
        console.log('B P')
        for (var i = paragraph.propositions.length-1; i > -1; i--){
          if (paragraph.propositions[i][$scope.userId] !== 'hidden' && paragraph.propositions[i].hiddenForAll !== true &&
            paragraph.propositions[i].preSelected == true){
            paragraph.propositions[i].preSelected = false;
            break;
          }
        }
      }

      $scope.lightUpLastVisiblePropositionInParagraph = function (node, paragraph, event) {
        console.log('L P')
        if (event.target.localName !== 'ol'  ){
          return;
        }
        for (var i = paragraph.propositions.length-1; i > -1; i--){
          if (paragraph.propositions[i][$scope.userId] !== 'hidden' && paragraph.propositions[i].hiddenForAll !== true){
            
            paragraph.propositions[i].preSelected = true;
            break;
          }
        }
      }

      $scope.getLastVisiblePropositionInParagraph = function (node, paragraph, event) {
        
        if (event.target.localName !== 'ol'  ){
          return;
        }
        $scope.selectedNode = node;
        $scope.selectedParagraph = paragraph;
        for (var i = paragraph.propositions.length-1; i > -1; i--){
          if (paragraph.propositions[i][$scope.userId] !== 'hidden' && paragraph.propositions[i].hiddenForAll !== true){
            $scope.selectedProposition = paragraph.propositions[i];
            break;
          }
        }
        var id = $scope.selectedProposition.id;

        $timeout( function(){
          document.getElementById('proposition'+ id).click();
          
        },10)
        // var contenteditable = document.getElementById(id)
        // $timeout(function() {
        //   focusFactory(id)
        //   var selection = document.getSelection();
        //   var range = document.createRange();
          
        //   if (contenteditable.lastChild){
        //     if (contenteditable.contentEditable) {
        //       range.setStart(contenteditable.lastChild,contenteditable.lastChild.length);
        //     } else {
        //       range.setStart(contenteditable,contenteditable.childNodes.length);
        //     }
        //   } else {
        //     range.setStart(contenteditable, contenteditable);
        //   }
        //   selection.removeAllRanges();
        //   selection.addRange(range);
        // }, 10); 
      }

      $scope.hideExpandingTextarea = function () {
        
          if ($scope.hasChatFocusId){
            $('#' + $scope.hasChatFocusId + $scope.hasChatFocusThreadId).parent().hide();
            $scope.inputs.chatProposition = '';

            
          }

        // }, 10);
      }

      $scope.clearExpandingClass = function(remark) {
        if (!remark.assertionPath || !$scope.selectProposition) {
         
          return;
        }

        if(!$scope.toBeClearedLater.remarkId){
          $scope.toBeClearedLater.remarkId = remark.id;
          $scope.toBeClearedLater.threadId = $scope.selectedThread.threadId;
        }
        

          $('#' + $scope.toBeClearedLater.remarkId + $scope.toBeClearedLater.threadId)
            .parent().hide();
            $scope.toBeClearedLater = {};
      
      };

      $scope.clearLater = function(remarkId, threadId){
        if (remarkId !== $scope.selectedProposition.id && threadId !== $scope.selectedThread.threadId){
          $scope.toBeClearedLater = {
            remarkId: $scope.selectedProposition.id,
            threadId: $scope.selectedThread.threadId
          }
        } else {
          $scope.toBeClearedLater.remarkId = remarkId;
          $scope.toBeClearedLater.threadId = threadId;
        }
      
      }


      $scope.selectNodeByClass = function(thread) {
        if (!thread.remarks[0].assertionId) {
         console.log("bounced")
        }
        temp.nodeDestination = eval(thread.nodePath);
        $scope.selectedNode = temp.nodeDestination;
        if ($scope.selectedProposition){
          $scope.selectedProposition.dialogueSide = true;
        }
        temp = {};
      };

// ************** Generate the tree diagram  *****************

      $scope.initialize = function() {

        var margin = { top: 20, right: 120, bottom: 20, left: 120 },
            width  = 1200 - margin.right - margin.left,
            height = 550 - margin.top - margin.bottom;

        var i        = 0,
            duration = 750;

        /*
         * [CE] d3.layout.tree() is now d3.tree() (d3 v4+)
         *
         * Removed:
         * var tree = d3.layout.tree()
         */
        var tree = d3.tree()
          .size([height, width]);

        /*
         * [CE] d3.svg.diagonal permanently removed (d3 v4+)
         * This is Mike Bostok's recommended replacement.
         *
         * Removed:
         * var diagonal = d3.svg.diagonal()
         *   .projection(function(d) { return [d.y, d.x]; });
        */
        function diagonal(d) {
          return 'M' + d.source.y + ',' + d.source.x +
            'C' + (d.source.y + d.target.y) / 2 + ',' + d.source.x +
            ' ' + (d.source.y + d.target.y) / 2 + ',' + d.target.x +
            ' ' + d.target.y + ',' + d.target.x;
        }

        d3.select('svg').remove();

        var svg = d3.select('.modal-body').append('svg')
          .attr('width', width + margin.right + margin.left)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var root = {};
        angular.copy($scope.data[0], root);
        root.x0 = 0;
        root.y0 = 0;

        // Compute the new tree layout.
        /*
         * [CE]
         * 1. tree.nodes(...) replaced with tree(...) (d3 v4+)
         * 2. root children must be set to null as tree is empty.
         * 3. root must be passed through d3.hierarchy() before tree()
         *
         * Removed:
         * var nodes = tree.nodes(root).reverse(),
         */
        root.children = null;
        root = d3.hierarchy(root);
        var nodes = tree(root),
            links = root.links();


        // Normalize for fixed-depth.
        nodes.each(function(d) {
          d.y = d.depth * 90;
        });

        // Update the nodes…
        var node = svg.selectAll('g.node')
          .data(nodes, function(d) {
            return d.id || (d.id = ++i);
          });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
          .attr('class', 'node')
          .attr('transform', function(/*d*/) {
            return 'translate(' + root.y0 + ',' + root.x0 + ')';
          });


        nodeEnter.append('circle')
          .attr('r', 1e-6)
          .style('fill', function(d) {
            return d._children ? 'rgb(30,135,193)' : 'rgb(30,135,193)';
          });


        nodeEnter.append('foreignObject')
          .attr('x', -18)
          .attr('y', 30)
          .attr('width', 30)
          .text(function(d) {
            return d.topic;
          });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
          .duration(duration)
          .attr('transform', function(d) {
            return 'translate(' + d.y + ',' + d.x + ')';
          });

        nodeUpdate.select('circle')
          .attr('r', 22)
          .style('fill', function(d) {
            return d._children ? 'lightsteelblue' : '#fff';
          });

        nodeUpdate.select('text')
          .style('color', 'rgb(255,255,255) !important');

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
          .duration(duration)
          .attr('transform', function(/*d*/) {
            return 'translate(' + root.y + ',' + root.x + ')';
          })
          .remove();

        nodeExit.select('circle')
          .attr('r', 22);

        nodeExit.select('text')
          .style('color', 'white');

        // Update the links…
        var link = svg.selectAll('path.link')
          .data(links, function(d) {
            return d.target.id;
          });

        // Enter any new links at the parent's previous position.
        link.enter().insert('path', 'g')
          .attr('class', 'link')
          .attr('d', function(/*d*/) {
            var o = { x: root.x0, y: root.y0 };
            return diagonal({ source: o, target: o });
          });

        // Transition links to their new position.
        link.transition()
          .duration(duration)
          .attr('d', diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
          .duration(duration)
          .attr('d', function(/*d*/) {
            var o = { x: root.x, y: root.y };
            return diagonal({ root: o, target: o });
          })
          .remove();

        // Stash the old positions for transition.
        nodes.each(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });

      };

      var scrollMessagesToBottom = function() {
        $timeout(function() {
          var pane = document.getElementById('dialoguelist');
          pane.scrollTop = pane.scrollHeight;
        }, 20); 
      };

      var updateDialogue = function(payload, callback) {
        if ((payload.blankParagraphForDeleter && payload.hidesOthersProp) || payload.hideBlankParagraph) {
          // $scope.data[0].dialogue.push({
          //   class: payload.class,
          //   topic: payload.topic,
          //   address: payload.address,
          //   nodePath: (payload.nodePath ? payload.nodePath : undefined),
          //   oldNodePath: (payload.oldNodePath ? payload.oldNodePath : undefined),
          //   paragraphPosition: payload.paragraphPosition,
          //   question: (payload.question ? payload.question : undefined),
          //   threadId: $scope.scroll.threadId,
          //   remarks: [payload.proposition]
          // });
          // $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0].text = '- Paragraph deleted -';
        } else {
          $scope.data[0].dialogue.push({
            class: payload.class,
            topic: payload.topic,
            address: payload.address,
            nodePath: (payload.nodePath ? payload.nodePath : undefined),
            oldNodePath: (payload.oldNodePath ? payload.oldNodePath : undefined),
            paragraphPosition: payload.paragraphPosition,
            question: (payload.question ? payload.question : undefined),
            threadId: $scope.scroll.threadId,
            remarks: [payload.proposition]
          });
          $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0].deleted = true;
        }
        // Need to write for deletions of paragraphs

        // This disables interactivity for deleted remarks
        for (var i = 0; i < $scope.data[0].dialogue.length - 1; i++) {
          for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length; j++){
            if ($scope.data[0].dialogue[i].remarks[j].id === payload.proposition.id){
              $scope.data[0].dialogue[i].remarks[j].hidden = true;
            } else if ($scope.data[0].dialogue[i].remarks[j].of){
              if ($scope.data[0].dialogue[i].remarks[j].of.id == payload.proposition.id &&
                 $scope.data[0].dialogue[i].remarks[j].type == 'negation'){
                $scope.data[0].dialogue[i].remarks[j].hidden = true;
              }
            }
            }
          }
        callback();
      };
    }; // end mainLoop

  }


  angular.module('ndApp')
    .controller('EditorController', EditorController);

})();
