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
            console.log("Key: ", obj.color, " Color: ", x)
          }
          // x is the value for a key that's not an object or array
          // key is the key
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

      // Run this function only once
      if (!$scope.once){
        $scope.once = true;
        traverse($scope.data[0])
      }
            
      // Clear cursor values
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
      var prep = {};
      var apply = {};
      var temp = {};

      // Pastel colors for paragraphs
      $scope.pastels = ['#f9ceee','#e0cdff','#c1f0fb','#dcf9a8','#ffebaf']
      $scope.otherPastels = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA']

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
              if (x !== $scope.userId && x !== '') { 
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

      // Scrolls to the bottom of messages
      $timeout(function() {
        var pane = document.getElementById('dialoguelist');
        pane.scrollTop = pane.scrollHeight;
      }, 30);

      // If an empty book, focus on the blank proposition
      if ($scope.data[0].paragraphs[0].propositions[0].type === 'blank' && 
        $scope.data[0].paragraphs[0].propositions[0][$scope.userId] !== 'hidden'){
        var id = $scope.data[0].paragraphs[0].propositions[0].id;
        $scope.selectedNode = $scope.data[0];
        $scope.selectedParagraph = $scope.data[0].paragraphs[0];
        $scope.selectedProposition = $scope.data[0].paragraphs[0].propositions[0];
        $timeout( function(){
          document.getElementById('proposition' + id).click();
          console.log("Runs repeatedly for some reason")
        },0)
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
        console.log("Selecting paragraph: ", $scope.selectedParagraph.paragraphId)
        paragraph.cursor = false;
      };

      $scope.clearBlankOnBlur = function(proposition){
        if (proposition.type === 'blank'){
          return;
        }


        if ($scope.hasRightFocus.id && $scope.selectedProposition.type === 'blank'){
          for (var i = 0; i < $scope.selectedNode.paragraphs.length; i++){
            if($scope.selectedNode){
              if($scope.selectedNode.paragraphs[i][$scope.userId] !== 'hidden' && 
              $scope.selectedNode.paragraphs[i].paragraphId !== $scope.selectedParagraph.paragraphId){
                var prep = {};
                prep.address = $scope.selectedNode.address;
                prep.nodePath = '$scope.data';
                for (var i = 0; i < prep.address.length; i++) {
                  if (i < prep.address.length - 1) {
                    prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
                  } else {
                    prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
                  }
                }
                prep.payload = {
                  class: $scope.selectedNode.class,
                  topic: $scope.selectedNode.topic,
                  paragraphPosition: $scope.selectedParagraph.position,
                  address: $scope.selectedNode.address,
                  nodePath: prep.nodePath,
                  proposition: $scope.selectedProposition,
                  author: $scope.selectedProposition.author,
                  id: $scope.selectedProposition.id,
                  paragraphId: $scope.selectedParagraph.paragraphId,
                  hideBlank: true,
                  paragraphBlankId: IdFactory.next(),
                  blankId: IdFactory.next(),
                  deleter: $scope.userId
                }
                console.log('Payload to be deleted: ', prep.payload);

                chatSocket.emit('deletion', $scope.userId, prep.payload);
                prep = {};
                $scope.hasRightFocus.id = '';

                apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
                apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
                profileService.setSelectedBook($scope.data[0]);
              }
            
            } else {
              console.log('Returning, no selected node');
              return;
            }
          }
        } else {
          return;
        }
      }

      // Makes a new left id and focuses on it
      $scope.clearWithLeftAdder = function() {
        $scope.leftAdderId = IdFactory.next();
        focusFactory($scope.leftAdderId);
      };

      // Manages top adder selection
      $scope.clearWithTopAdder = function(paragraph) {
        $scope.selectedProposition = {};
        $scope.selectedProposition.textSide = true;
        $scope.topAdderId = IdFactory.next();
        $scope.hasTopFocus = paragraph.paragraphId;
        focusFactory($scope.topAdderId);
      };

      // Manages bottom adder selection
      $scope.clearWithBottomAdder = function(paragraph) {
        $timeout( function(){
          $scope.$apply(function() {
        paragraph.bottomAdd = true;
        console.log("Paragraph bottomadd: ", paragraph.bottomAdd)
        $scope.hasBottomFocus.id = paragraph.paragraphId;
        console.log("Has bottom focus: ", $scope.hasBottomFocus)
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



      // Selects proposition (propositions are often selected without this function)
      $scope.selectProposition = function(proposition) {
        if ($scope.selectedProposition){
          if ($scope.selectedProposition.id !== proposition.id) {
            $scope.clearPropositionInput();
            $scope.selectedProposition = proposition;
            focusFactory($scope.selectedProposition.id);
            console.log("if")
          } else {
            $scope.selectedProposition = proposition;
            focusFactory($scope.selectedProposition.id);
            console.log("Inner else")
          }
        } else {
          $scope.selectedProposition = proposition;
          focusFactory($scope.selectedProposition.id);
          console.log('Outer else')
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
          console.log("If")
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
            propositionPath: propositionPath
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

      // Processes the deletion payload on the client side prior to emission (for paragraphs of others)
      // This hides propositions more than deletes them
      $scope.deleteAllPropositions = function() {

       

        // Calculates a path to the node on which the deletion is occurring
        prep.address = $scope.selectedNode.address;
        prep.nodePath = '$scope.data';
        for (var i = 0; i < prep.address.length; i++) {
          if (i < prep.address.length - 1) {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
          } else {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
          }
        }
        // Calculates a path to the selected paragraph, then gets a reference to what's there
        prep.paragraphPath = prep.nodePath + '.paragraphs[' + $scope.selectedParagraph.position + ']'
        prep.paragraphDestination = eval(prep.paragraphPath)
        // Gets ids for all propositions in the paragraph selected
        var ids = [];
        for (var i = 0; i < prep.paragraphDestination.propositions.length; i++){
          ids.push(prep.paragraphDestination.propositions[i].id);
        }
        // Does hide propositions of others and make the paragraph vacant for the deleter, except for the blank
        if (!prep.hideParagraphForDeleter){
          prep.hidesOthersProp = true;
          prep.hideAndPlaceBlankAbove = true;
        }
        // Defines the payload to be emitted
        prep.payload = {
          class: $scope.selectedNode.class,
          topic: $scope.selectedNode.topic,
          paragraphPosition: $scope.selectedParagraph.position,
          address: $scope.selectedNode.address,
          nodePath: prep.nodePath,
          proposition: $scope.selectedProposition,
          author: $scope.selectedProposition.author,
          id: $scope.selectedProposition.id,
          ids: ids,
          hideAndPlaceBlankAbove: (prep.hideAndPlaceBlankAbove ? prep.hideAndPlaceBlankAbove : undefined),
          paragraphBlankId: IdFactory.next(),
          blankId: IdFactory.next(),
          hidesOthersProp: (prep.hidesOthersProp ? prep.hidesOthersProp : undefined),
          hidesOwn: (prep.hidesOwn ? prep.hidesOthersProp : undefined),
          hideParagraphForDeleter: (prep.hideParagraphForDeleter ? prep.hideParagraphForDeleter : undefined),
          deleter: $scope.userId
        };
        console.log('Payload to be deleted: ', prep.payload);
        // Transmits it
        chatSocket.emit('deletion', $scope.userId, prep.payload);
        // Clears variables
        prep = {};
        ids = [];
        // Hits backend services
        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);
      };

      $scope.deleteProposition = function(node, allflag) {
        // Calculates a path to the node from the selected node
        prep.address = $scope.selectedNode.address;
        prep.nodePath = '$scope.data';
        for (var i = 0; i < prep.address.length; i++) {
          if (i < prep.address.length - 1) {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
          } else {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
          }
        }

        // Won't be from a blank or one's own paragraph
        if (allflag == true){
          for (var i = 0; i < node.paragraphs.length; i++){
            if (node.paragraphs[i].owner !== $scope.userId && node.paragraphs[i][$scope.userId] !== 'hidden' &&
              node.paragraphs[i].paragraphId !== $scope.selectedParagraph.paragraphId &&
              $scope.selectedProposition.type !== 'blank'){
              prep.hideParagraphForDeleter = true;
              prep.hideOthersProp = true;
              prep.assigned = true;
              break;
            }
          }

          for (var i = 0; i < node.paragraphs.length; i++){ 
            if (node.paragraphs[i].owner === $scope.userId && node.paragraphs[i][$scope.userId] !== 'hidden' && 
              node.paragraphs[i].paragraphId !== $scope.selectedParagraph.paragraphId && 
              $scope.selectedProposition.type !== 'blank' && !prep.assigned){
              prep.hideParagraphForDeleter = true;
              prep.hideOthersProp = true;
              prep.assigned = true;
              break;
            }
          }

          if (!prep.assigned){
            prep.blankParagraphForDeleter = true;
            prep.assigned = true;
          }
          // Clears some markups to the propositions
          $scope.selectedParagraph.markAll = false;
          $scope.selectedParagraph.highlightAll = false;

          var ids = [];
          for (var i = 0; i < prep.paragraphDestination.propositions.length; i++){
            ids.push(prep.paragraphDestination.propositions[i].id);
          }
        }

        // Running deletion on a blank 
        if ($scope.selectedProposition.type === 'blank' && !prep.assigned) {
          for (var i = 0; i < node.paragraphs.length; i++){
            if ((node.paragraphs[i][$scope.userId] !== 'hidden' &&
            node.paragraphs[i].paragraphId !== $scope.selectedParagraph.paragraphId) ){
              prep.hideBlank = true;
              prep.assigned = true;
              break;
            }
          }
          if (!prep.assigned){
            return;
          }
        } else if (!prep.assigned) {
          prep.hideOwn = true;
          for (var i = 0; i < $scope.selectedParagraph.propositions.length; i++) {
            if (
              $scope.selectedParagraph.propositions[i][$scope.userId] !== 'hidden' &&
              $scope.selectedParagraph.propositions[i].id !== $scope.selectedProposition.id &&
              $scope.selectedParagraph.propositions[i].type !== 'negation') {
              prep.blankPropositionForEveryone = true;
              prep.assigned = true;
              break;
              // proposition just gets hidden for everyone
              // what to do about negations?
            }
          }
          if (!prep.assigned) {
            prep.blankParagraphForDeleter = true;
            prep.assigned = true;
            //paragraph will be shared
          }
        }

        prep.payload = {
          class: $scope.selectedNode.class,
          topic: $scope.selectedNode.topic,
          paragraphPosition: $scope.selectedParagraph.position,
          address: $scope.selectedNode.address,
          nodePath: prep.nodePath,
          proposition: $scope.selectedProposition,
          author: $scope.selectedProposition.author,
          id: $scope.selectedProposition.id,
          paragraphId: $scope.selectedParagraph.paragraphId,
          ids: ids ? ids : undefined,
          selectedParagraphId: $scope.selectedParagraph.paragraphId,
          blankParagraphForDeleter: (prep.blankParagraphForDeleter ? prep.blankParagraphForDeleter : undefined),
          hideBlank: (prep.hideBlank ? prep.hideBlank : undefined),
          blankPropositionForEveryone: (prep.blankPropositionForEveryone ? prep.blankPropositionForEveryone : undefined),
          paragraphBlankId: IdFactory.next(),
          blankId: IdFactory.next(),
          hideOthersProp: (prep.hideOthersProp ? prep.hideOthersProp : undefined),
          hideOwn: (prep.hideOwn ? prep.hideOthersProp : undefined),
          deleter: $scope.userId
        };

        console.log('Payload to be deleted: ', prep.payload);

        chatSocket.emit('deletion', $scope.userId, prep.payload);
        prep = {};

        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);
      };


      $scope.$on('socket:broadcastDeletion', function(event, payload) {

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
              apply.paragraphDestination.propositions[i][$scope.userId] = 'hidden';
              apply.paragraphDestination.propositions[i].position++;
              apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
            }

            apply.paragraphDestination.propositions[0] = {                                    
              id: payload.blankId,
              type: 'blank',
              text: '',
              author: '',
              position: 0,
              isPlaceholder: true
            };


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
            $scope.selectedProposition.textSide = true;
            focusFactory($scope.selectedProposition.id);
            $('proposition' + $scope.selectedProposition.id).trigger('click');
          } else {
            for (var i = apply.paragraphDestination.propositions.length; i > -1; i--) {
              apply.paragraphDestination.propositions[i].position++;
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

            };
            apply.paragraphDestination.propositions[0][$scope.userId] = 'hidden';
          }

          // other stuff for blank paragraph for deleter
        }

        // Deletions on blank cursors
        // Delete the paragraph and find where to put the cursor
        if (payload.hideBlank && payload.deleter === $scope.userId) {
          apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
          for (var i = payload.paragraphPosition; i > -1 ; i--){
            if (apply.nodeDestination.paragraphs[i].owner){
              if(apply.nodeDestination.paragraphs[i].owner === $scope.userId &&
              apply.nodeDestination.paragraphs[i][$scope.userId] !== 'hidden' ){
                for (var j = apply.nodeDestination.paragraphs[i].propositions.length; j > -1; j--){
                  if (apply.nodeDestination.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
                  !apply.nodeDestination.paragraphs[i].propositions[j].rejoined &&
                  apply.nodeDestination.paragraphs[i].propositions[j].author === $scope.userId){
                    $scope.selectedParagraph = apply.nodeDestination.paragraphs[i];
                    $scope.selectedProposition = apply.nodeDestination.paragraphs[i].propositions[j]
                    $scope.selectedProposition.textSide = true;
                    focusFactory($scope.selectedProposition.id);
                    var query = 'proposition' + $scope.selectedProposition.id;
                    console.log("*** Query: ", query)
                    $(query).trigger('click');
                    query = '';
                    
                    apply.paragraphDestination[payload.deleter] = 'hidden';
                    break;
                  }
                }
              }
            // if no owner, encounters a blank
            } else if (apply.nodeDestination.paragraphs[i][$scope.userId] !== 'hidden') {
              for (var j = apply.nodeDestination.paragraphs[i].propositions.length; j > -1; j--){
                if(apply.nodeDestination.paragraphs[i].propositions[j][$scope.userId] !== 'hidden' &&
                apply.nodeDestination.paragraphs[i].propositions[j].type === 'blank'){
                  $scope.selectedParagraph = apply.nodeDestination.paragraphs[i];
                  $scope.selectedProposition = apply.nodeDestination.paragraphs[i].propositions[j]
                  $scope.selectedProposition.textSide = true;
                  focusFactory($scope.selectedProposition.id);
                  var query = 'proposition' + $scope.selectedProposition.id;
                  console.log("*** Query: ", query)
                  $(query).trigger('click');
                  query = '';
                  
                  apply.paragraphDestination[payload.deleter] = 'hidden';
                  break;
                }
              }
            }
          }

        }
      

        if (payload.blankPropositionForEveryone) {
          apply.paragraphDestination.propositions[payload.proposition.position][$scope.userId] = 'hidden';


          //disables dialogue interactivity for affected remarks
          for (var i = 0; i < $scope.data[0].dialogue.length; i++) {
            for (var j = 0; j < $scope.data[0].dialogue[i].remarks.length-1; j++){
              if ($scope.data[0].dialogue[i].remarks[j].id === payload.proposition.id) {
                $scope.data[0].dialogue[i].remarks[j][$scope.userId] = 'hidden';
              }
              if ($scope.data[0].dialogue[i].remarks[j+1] && $scope.data[0].dialogue[i].remarks[j+1].type === 'negation'){
                $scope.data[0].dialogue[i].remarks[j+1][$scope.userId] = 'hidden';
              
              }
            }
          }


          if (payload.deleter === $scope.userId) {
            for (var i = payload.proposition.position; i > -1; i--) {
              if (apply.paragraphDestination.propositions[i][$scope.userId] !== 'hidden') {
                $scope.selectedProposition = apply.paragraphDestination.propositions[i];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');
                break;
              }
            }
          }

            // Updates paragraph ownership
           
            for (var i = 0; i < apply.paragraphDestination.propositions.length; i++){
              if(apply.paragraphDestination.propositions[i][$scope.userId] !== 'hidden' &&
              apply.paragraphDestination.propositions[i].type !== 'blank'){
                apply.paragraphDestination.owner = apply.paragraphDestination.propositions[i].author;
                break;
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

        $scope.scroll.threadId = IdFactory.next();

        updateDialogue(payload, scrollMessagesToBottom);

        // var apply = {};
        // var notification = {};
        $scope.scroll = {};

        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);
      });

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
          console.log("Negation incoming")
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

        

          console.log('Path to assertion: ', prep.assertionPath);
          console.log('New remark address: ', prep.remarkAddress);             
          console.log('Node position: ', prep.nodePath);
          console.log('Question/Topic: ', prep.topic);
          console.log('Destination: ', prep.class);
        } else if ($scope.selectedProposition.of &&                                                //   REJOINDER
          $scope.selectedProposition.of.author === $scope.userId &&
          $scope.selectedProposition.type === 'negation' &&
          !$scope.selectedProposition.question) {
          prep.topic = $scope.selectedNode.topic;
          prep.type = 'rejoinder';
          console.log("Rejoinder incoming")
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
            console.log("Capacity count greater than 1, repeated rejoinder")
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

            //
            console.log("Capacity count not greater than 1")
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

          console.log('Shouldnt trigger as questions not being given special behavior yet')
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


          console.log('Node position: ', prep.nodePath);
          console.log('Old node path: ', prep.oldNodePath);
          console.log('Question/Topic: ', prep.topic);                                              //   CONSOLE LOGS
          console.log('Destination: ', prep.newClass);

          prep.type = 'assertion';
          prep.adjustedText = input;
        } else {
     
          prep.topic = $scope.selectedNode.topic;
          prep.class = $scope.selectedNode.class;
          prep.type = 'assertion';
          prep.adjustedText = input;
          console.log('It\'s an assertion');
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
            if (!prep.paragraphPosition){
              prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
              prep.position = 0;
              prep.insertsBelow = true;
              prep.replacesBlankAndMoves = true;
              console.log("Placing this at the end of the document")
            }
          }   
          console.log("Selected Paragraph Position: ", $scope.selectedParagraph.position)
          if (prep.paragraphPosition < $scope.selectedParagraph.position){
            prep.ofParagraphPosition = ($scope.selectedParagraph.position +1);
          } else {
            prep.ofParagraphPosition = $scope.selectedParagraph.position;
          }
          console.log("Assigned ofParagraphPosition: ", prep.ofParagraphPosition)
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
                console.log("Putting it above")

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
                          console.log("Placing this as the last paragraph in the section of one's own document")
                          break;
                        }
                      } else {
                        prep.paragraphPosition = i;
                        prep.position = 0;
                        prep.insertsAbove = true;
                        console.log("Placing this as the last paragraph in the section of one's own document")
                        break;
                      }
                    }
                  }
                } 

                // Differentiate here based on whether the selected paragraph is one's own or not
                if($scope.selectedParagraph.owner === $scope.userId){
                  prep.paragraphPosition = $scope.selectedParagraph.position-1;
                  prep.position = 0;
                  prep.insertsAbove = true;
                  console.log("Putting it above")
                } else if (!prep.paragraphPosition){
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
                      if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId){
                        prep.paragraphPosition = j;
                        prep.position = 0;
                        prep.insertsAbove = true;
                        console.log("Placing this as the first paragraph in the section of one's own document")
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
              if (!prep.paragraphPosition && !prep.insertsAbove){
                prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Placing this at the end of the document, else")
              }
            }

          } else if (paragraph.bottomAdd) {
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
            prep.candidateParagraphPosition = $scope.selectedParagraph.position+1;
            prep.candidateParagraphPath = prep.nodePath + '.paragraphs[' + prep.candidateParagraphPosition.toString()
            + ']';
            if (eval(prep.candidateParagraphPath)){
              // if there is a paragraph one position above
              prep.candidateParagraphDestination = eval(prep.candidateParagraphPath);
              if (prep.candidateParagraphDestination.owner == $scope.userId){
                prep.paragraphPosition = prep.candidateParagraphDestination.position;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Putting it below")
              } else {
                console.log("Finding ones paragraphs")
                for (var i = 0; i < prep.nodeDestination.paragraphs.length; i++){
                  console.log("I: ", i)
                  if (prep.nodeDestination.paragraphs[i].owner == $scope.userId){
                    console.log("I hit")
                    for (var j = i+1; j < prep.nodeDestination.paragraphs.length; j++){
                      console.log("I: ", i, " J: ", j)
                      if (prep.nodeDestination.paragraphs[j]){
                        if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId){
                        
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
                if (!prep.paragraphPosition){
                  prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                  prep.position = 0;
                  prep.insertsBelow = true;
                  console.log("Placing this at the end of the document as not have found")
                }
              }
            } else {
              console.log("Finding ones paragraphs")
              for (var i = 0; i < prep.nodeDestination.paragraphs.length; i++){
                console.log("I: ", i)
                if (prep.nodeDestination.paragraphs[i].owner == $scope.userId){
                  console.log("I hit")
                  for (var j = i+1; j < prep.nodeDestination.paragraphs.length; j++){
                    console.log("I: ", i, " J: ", j)
                    if (prep.nodeDestination.paragraphs[j]){
                      if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId){
                      
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
              if (!prep.paragraphPosition){
                prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Placing this at the end of the document as not have found")
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
                      if (prep.nodeDestination.paragraphs[j].owner !== $scope.userId){
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
              if (!prep.paragraphPosition){
                prep.paragraphPosition = prep.nodeDestination.paragraphs.length;
                prep.position = 0;
                prep.insertsBelow = true;
                console.log("Placing this at the end of the document")
              }
            }
          } else if ($scope.newProp){
            prep.paragraphPosition = $scope.selectedNode.paragraphs.length;
            prep.position = 0;
            prep.newProp = true;
            console.log('New prop');        
          } else if (prep.type !== 'rejoinder') {
            console.log('Adding to existing paragraph');
            for (var i = $scope.selectedProposition.position; i < $scope.selectedParagraph.propositions.length; i++) {                 //     OTHERWISE ITS WITHIN AN EXISTING PARAGRAPH
              if ($scope.selectedParagraph.propositions[i + 1] &&
                $scope.selectedParagraph.propositions[i + 1].type !== 'negation' &&
                $scope.selectedParagraph.propositions[i + 1].hidden !== true) {
                prep.paragraphPosition = $scope.selectedParagraph.position;
                prep.position = i + 1;
                prep.getsOwnProposition = true;
                break;
              }
            }
            if (!prep.position) {
              prep.paragraphPosition = $scope.selectedParagraph.position;                //    IF NO POSITION HAS BEEN CALCULATED, GETS OWN PROPOSITION WITH POSITION ON THE END
              prep.position = $scope.selectedParagraph.propositions.length;
              prep.getsOwnProposition = true;
            }
          }
        }

        console.log("Assigned ofParagraphPosition: ", prep.ofParagraphPosition)
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
        console.log("Assigned ofParagraphPosition: ", prep.ofParagraphPosition)

        console.log('Author: ', $scope.userId);
        console.log('Type: ', prep.type);                                                     //    CONSOLE LOGS
        console.log('Paragraph Position: ', prep.paragraphPosition);
        console.log('Position: ', prep.position);
        console.log('Text: ', prep.adjustedText);
        prep.payload = {
          topic: prep.topic,
          address: prep.address,
          paragraphPosition: prep.paragraphPosition,
          ofParagraphPosition: (prep.ofParagraphPosition !== undefined ? prep.ofParagraphPosition : undefined),
          blankId: IdFactory.next(),
          textSide: $scope.selectedProposition.textSide,
          class: (prep.newClass ? prep.newClass : prep.class),
          nodePath: (prep.nodePath ? prep.nodePath : undefined),
          oldNodePath: (prep.oldNodePath ? prep.oldNodePath : undefined),                          //    COMPOSITION OF THE PAYLOAD
          question: (prep.question ? prep.question : undefined),
          paragraphId: IdFactory.next(),
          selectedParagraphId: $scope.selectedParagraph.paragraphId,
          proposition: {
            id: IdFactory.next(),
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
        console.log('Paragraph: ', paragraph)
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
        $scope.hasRightFocus = {};
        $scope.newProp = '';
        $scope.threadAdding = '';



      };


      $scope.$on('socket:broadcastProposition', function(event, payload) {
        $timeout(function() {
          $scope.$apply(function() {

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
                  paragraphs: [
                    {
                      paragraphId: payload.paragraphId,
                      position: payload.paragraphPosition,
                      propositions: [
                        {
                          id: payload.proposition.id,
                          type: 'blank',
                          text: '',
                          author: '',
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

            // else if (payload.proposition.replacesBlankAndMoves) {


            //   apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
            //   apply.paragraphDestination = eval(apply.paragraphPath);
            //   console.log('Paragraph destination: ', apply.paragraphDestination)
            //   apply.nodePath = payload.nodePath;
            //   apply.nodeDestination = eval(payload.nodePath);
            //   console.log('Node destination: ', apply.nodeDestination)
              
            //   if ($scope.userId === payload.proposition.author) {
            //     apply.paragraphDestination[$scope.userId] = 'hidden';
            //   }


            //   for (var i = apply.nodeDestination.paragraphs.length - 1; i > payload.paragraphPosition - 1; i--) {
            //     apply.nodeDestination.paragraphs[i].position++;
            //     if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id) {
            //       $scope.selectedParagraph.position = angular.copy(apply.nodeDestination.paragraphs[i].position);
            //     }

            //     apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];

            //     for (var j = 0; j < apply.nodeDestination.paragraphs[i + 1].propositions.length; j++) {
            //       if (apply.nodeDestination.paragraphs[i + 1].propositions[j].type === 'assertion') {
            //         apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + j.toString() + ']';
            //       }
            //       for (var k = 0; k < apply.nodeDestination.paragraphs[i + 1].propositions.length; k++) {
            //         if (apply.nodeDestination.paragraphs[i + 1].propositions[k].type === 'assertion' &&
            //           apply.nodeDestination.paragraphs[i + 1].propositions[k].assertionId === payload.proposition.assertionId) {
            //           apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + k.toString() + ']';
            //         }
            //       }
            //     }

            //     for (var l = 0; l < $scope.propositions.length; l++) {
            //       if ($scope.propositions[l].assertionId === payload.proposition.assertionId) {
            //         $scope.propositions[l].assertionPath = payload.proposition.assertionPath;
            //       }
            //     }
            //   }

            //   apply.nodeDestination.paragraphs[payload.paragraphPosition] = {
            //     paragraphId: payload.paragraphId,
            //     position: payload.paragraphPosition,
            //     propositions: [payload.proposition]
            //   };

            //   if (payload.proposition.author === $scope.userId) {
            //     $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
            //     $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
            //     $scope.selectedProposition.textSide = true;
            //     focusFactory($scope.selectedProposition.id);
            //     $('proposition' + $scope.selectedProposition.id).trigger('click');

            //   }
            // } 
            else if (payload.proposition.replacesBlank) {

              // shouldnt trigger
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.nodePath = payload.nodePath;
              apply.nodeDestination = eval(payload.nodePath);

              for (var i = apply.paragraphDestination.propositions.length - 1; i > payload.proposition.position - 1; i--) {
                apply.paragraphDestination.propositions[i].position++;

                if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id) {
                  $scope.selectedProposition.position = angular.copy(apply.paragraphDestination.propositions[i].position);
                }
                apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
              }


              if (apply.paragraphDestination[$scope.userId] === 'hidden') {
                apply.paragraphDestination[$scope.userId] = '';
              }

              apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position] = payload.proposition;
              apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position + 1][$scope.userId] = 'hidden';
              console.log('Pushed a blank paragraph');

              if (apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position].id === $scope.selectedProposition.id) {
                $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position + 1];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
              }

              if (payload.proposition.author === $scope.userId) {
            
                $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
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

                  if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id) {
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
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');
              }

            } else if (payload.proposition.insertsAbove) {
              apply.nodeDestination = eval(payload.nodePath);
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              console.log('Payload Paragraph Position: ', payload.paragraphPosition)
              console.log('Paragraph path: ', apply.paragraphPath)
              apply.paragraphDestination = eval(apply.paragraphPath);
              console.log("Paragraph destination: ", apply.paragraphDestination);
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
              if (apply.paragraphDestination){
                apply.propositionDestination = eval(apply.propositionPath);

                var counter = angular.copy(apply.nodeDestination.paragraphs.length-1)
                console.log("Counter: ", counter)
                // from the last paragraph position on the node down to the calculated paragraph position minus one, exclusive...
                for (var i =  counter; i > payload.paragraphPosition - 1; i--) {
                 
                  // up the paragraph position
                  apply.nodeDestination.paragraphs[i].position++;
                  // if user has selected the paragraph being moved up, update selectedParagraph
                  if ($scope.selectedParagraph){
                    if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id) {
                      $scope.selectedParagraph.position = angular.copy(apply.nodeDestination.paragraphs[i].position);
                    }
                  }
                  // copy the paragraph up
                  apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];
                  console.log("I plus one: ", apply.nodeDestination.paragraphs[i + 1])
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
                    $scope.selectedProposition.textSide = true;

                    focusFactory($scope.selectedProposition.id);
                    $($scope.selectedProposition.id).trigger('click');
                  }, 30);


                }
              }


            } else if (payload.proposition.insertsBelow) {
              console.log("Inserts below. ParagraphId: ", payload.paragraphId)
              apply.nodeDestination = eval(payload.nodePath);
              console.log("node destination: ", apply.nodeDestination)
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.paragraphAbovePath = payload.nodePath + '.paragraphs[' + (payload.paragraphPosition - 1).toString() + ']';
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + 
              '.propositions[' + payload.proposition.position.toString() + ']';
              // apply.propositionDestination = eval(apply.propositionPath);

              if (typeof (eval(apply.paragraphPath)) === 'undefined') {
                console.log('Typeof if')
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };
              } else {
                console.log('There is such a paragraph')
                for (var i = apply.nodeDestination.paragraphs.length - 1; i > payload.paragraphPosition - 1; i--) {
                  apply.nodeDestination.paragraphs[i].position++;
                  if ($scope.selectedParagraph){
                    if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id) {
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
                    if ($scope.propositions[i].assertionId === payload.proposition.assertionId) {
                      $scope.propositions[i].assertionPath = payload.proposition.assertionPath;
                    }
                  }
                }
                console.log("maybe here eh")
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };
              }

              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.paragraphAboveDestination = eval(apply.paragraphAbovePath);




              if (payload.proposition.author === $scope.userId && payload.textSide === true && payload.proposition.replacesBlankAndMoves) {
                console.log("In here eh")
                apply.ofParagraphPosition = payload.ofParagraphPosition;
                apply.ofParagraphPath = payload.nodePath + '.paragraphs[' + apply.ofParagraphPosition.toString() + ']';
                apply.ofParagraphDestination = eval(apply.ofParagraphPath);
                apply.ofParagraphDestination.propositions[0][$scope.userId] = 'hidden';
                apply.ofParagraphDestination[$scope.userId] = 'hidden';

                $timeout(function() {

                  $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                  $scope.selectedProposition = 
                  apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                  $scope.selectedProposition.textSide = true;
                  focusFactory($scope.selectedProposition.id);
                  $($scope.selectedProposition.id).trigger('click');
                }, 30);


              } else if (payload.proposition.author === $scope.userId && payload.textSide === true ){
                  $timeout(function() {

                    $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                    $scope.selectedProposition = 
                    apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                    $scope.selectedProposition.textSide = true;
                    focusFactory($scope.selectedProposition.id);
                    $($scope.selectedProposition.id).trigger('click');
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
                for (var i = apply.paragraphDestination.propositions.length - 1; i > payload.proposition.position - 1; i--) {
                  apply.paragraphDestination.propositions[i].position++;
                  if ($scope.selectedParagraph){
                    if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id) {
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

                $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');
                }, 30);    
              }
            } else if (payload.proposition.newProp) {
              apply.nodeDestination = eval(payload.nodePath);
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
              // apply.propositionDestination = eval(apply.propositionPath);

              if (typeof (eval(apply.paragraphPath)) === 'undefined') {
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };
              } else {




                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };
              }

              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.paragraphAboveDestination = eval(apply.paragraphAbovePath);



            } else {
              apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;
           
              if (payload.proposition.author === $scope.userId && $scope.selectedProposition.textSide === true) {
                $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
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
                }
              }
            } else if (payload.proposition.type === 'rejoinder' || payload.proposition.answeredQuestion) {
              for (var i = 0; i < apply.paragraphDestination.propositions.length; i++) {
                if (payload.proposition.of.id === apply.paragraphDestination.propositions[i].id) {
                  apply.paragraphDestination.propositions[i].rejoined = true;
                  apply.paragraphDestination.propositions[i][$scope.userId] = 'hidden';
                }
              }
            }

            $scope.scroll.threadId = IdFactory.next();


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
            // for (var i = 0; i < apply.paragraphDestination.propositions.length; i++){
            //   if(apply.paragraphDestination.propositions[i][$scope.userId] !== 'hidden'){
            //     apply.paragraphDestination.owner = apply.paragraphDestination.propositions[i].author;
            //     console.log("Owner: ", apply.paragraphDestination.owner)
            //     break;
            //   }
            // }
            if (!apply.paragraphDestination.owner){
              apply.paragraphDestination.owner = payload.proposition.author;
            }

            // for every incoming proposition, when assigning an owner to the paragraph
            for (var i = 0; i < $scope.userColorTable.length; i++){
              if($scope.userColorTable[i].author === payload.proposition.author && 
                payload.proposition.author !== $scope.userId){
                var alreadyThere = true;
                var place = i;
                console.log('Already there')
                break;
                
              }
            }
            if (!alreadyThere){
              if (payload.proposition.author !== $scope.userId && payload.proposition.type !== 'negation'){
                console.log("Push")
                $scope.userColorTable.push(
                  {
                    author: payload.proposition.author, 
                    color: $scope.generateNewColor()
                  }
                )
                apply.paragraphDestination.color = $scope.userColorTable[$scope.userColorTable.length-1].color;
              }
              
            } else if (payload.proposition.author !== $scope.userId && payload.proposition.type !== 'negation'){
              console.log("else if")
              apply.paragraphDestination.color = $scope.userColorTable[place].color;
            }

            $scope.assignColorsToExistingRemarks();
            temp = {};

          
            $scope.scroll = {};

            $scope.propositions.push(payload.proposition);  // PUSHES THE PROPOSITION TO THE PROPOSITIONS ARRAY

            apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
            apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
            profileService.setSelectedBook($scope.data[0]);
          });
        }, 30);                                             // HAS A TIMEOUT


        // $scope.initialize();

       
        // Scroll
        $timeout(function() {
          var pane = document.getElementById('dialoguelist');
          pane.scrollTop = pane.scrollHeight;
        }, 30);

        // $scope.makePristine();

      });

      $scope.selectThread = function(thread) {
        console.log("Selecting thread: ", thread)
        // if (!thread.remarks[0].assertionId) {
        //   console.log('Returning from selectThread');
        //   return;
        // }
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

        console.log('Selecting by Id: ', id)
        // insert left changes assertion paths

   

        for (var i = 0; i < $scope.propositions.length; i++) {
          if ($scope.propositions[i].id === id) {
            temp.assertionPath = $scope.propositions[i].assertionPath;
            break;
          }
        }
        if (!temp.assertionPath) {
          console.log('Returning having not found a remark');
          return;
        }
        $scope.mark = {};
        $scope.highlight = {};
        if (temp.hasOwnProperty('assertionPath') && temp.assertionPath !== undefined) {
          temp.sliceStartingAt = temp.assertionPath.indexOf('.propositions');
          temp.paragraphPath = temp.assertionPath.slice(0, temp.sliceStartingAt);
          // console.log('Paragraph path: ', temp.paragraphPath)
          temp.paragraphDestination = eval(temp.paragraphPath);

          $scope.selectedParagraph = temp.paragraphDestination;
          for (var i = 0; i < temp.paragraphDestination.propositions.length; i++) {
            // console.log('Working with id in loop: ', temp.paragraphDestination.propositions[i].id)
            if (temp.paragraphDestination.propositions[i].id === id) {
              console.log('If')
              if ($scope.selectedProposition){
                if ($scope.selectedProposition.id) {
                  // $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                  //   .expanding('destroy');
                  $scope.selectedProposition = temp.paragraphDestination.propositions[i];
                  console.log('Selected proposition id: ', $scope.selectedProposition.id)
                  $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                  $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                  $scope.hasChatFocusId = $scope.selectedProposition.id;
                } else {
                    $scope.selectedProposition = temp.paragraphDestination.propositions[i];
                    console.log('Selected proposition id, else: ', $scope.selectedProposition.id)
                    $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                    $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                    .expanding();
                    $scope.hasChatFocusId = $scope.selectedProposition.id;
                }
              } else {
                $scope.selectedProposition = temp.paragraphDestination.propositions[i];
                console.log('Selected proposition id, else: ', $scope.selectedProposition.id)
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                .expanding();
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                .expanding();
                $scope.hasChatFocusId = $scope.selectedProposition.id;
              }
              $scope.selectedProposition.dialogueSide = true;
              //get the remark to satisfy the ng-if so the form appears
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



      $scope.getLastVisiblePropositionInBook = function () {

        console.log('Get last in book')

        var path = '$scope.data[0]';
        var destination = eval(path);
        var id = '';
        var flagged;

        //Find the rightmost child, if any

        if (destination.children){
          while (destination.children){

          path = path + '.children[' + (destination.children.length-1).toString() + ']';
          destination = eval(path);
          } 
        }

        $scope.selectedNode = destination;

        // Find the rightmost visible paragraph
        for (var i = destination.paragraphs.length-1; i > -1; i--){
          if (destination.paragraphs[i][$scope.userId] !== 'hidden'){
            path = path + '.paragraphs[' + i.toString() + ']';
            destination = eval(path);
            break;
          }
        }

        $scope.selectedParagraph = destination;

        // Find the rightmost visible proposition
        for (var i = destination.propositions.length-1; i > -1; i--){
          if (destination.propositions[i][$scope.userId] !== 'hidden'){
            path = path + '.propositions[' + i.toString() + ']';
            destination = eval(path);
            flagged = true;
            break;
          }
        }

        // if (!flagged){
        //   $scope.selectedProposition = destination;
        // }
        $scope.selectedProposition = destination;

        // Click the id of the proposition landed upon
        id = destination.id;

        $timeout(function() {
          focusFactory(id)
          
          var selection = document.getSelection();
          var range = document.createRange();
          var contenteditable = document.getElementById(id)

          // Was contenteditable.lastChild.nodeType == 3 condition below here
 
          if (contenteditable.contentEditable) {
            range.setStart(contenteditable.lastChild,contenteditable.lastChild.length);
          } else{
            range.setStart(contenteditable,contenteditable.childNodes.length);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        }, 10); 
      }

      $scope.getLastVisiblePropositionInNode = function () {

        var id = '';
        return id;
      }

      $scope.getLastVisiblePropositionInParagraph = function (node, paragraph, event) {

        if (event.target.localName !== 'ol'  ){
          return;
        }

        $scope.selectedNode = node;

        $scope.selectedParagraph = paragraph;


        for (var i = paragraph.propositions.length-1; i > -1; i--){
          if (paragraph.propositions[i][$scope.userId] !== 'hidden'){
            $scope.selectedProposition = paragraph.propositions[i];
            break;
          }
        }


        var id = $scope.selectedProposition.id;


        $timeout(function() {
          focusFactory(id)
          var selection = document.getSelection();
          var range = document.createRange();
          var contenteditable = document.getElementById(id)
 
          if (contenteditable.lastChild && contenteditable.contentEditable) {
            range.setStart(contenteditable.lastChild,contenteditable.lastChild.length);
          } else {
            range.setStart(contenteditable,contenteditable.childNodes.length);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        }, 10); 
      }


      $scope.hideExpandingTextarea = function () {
        // setTimeout(function() {
          // console.log("Clearing: ", $scope.hasChatFocusId, $scope.hasChatFocusThreadId)
          if ($scope.hasChatFocusId){
            $('#' + $scope.hasChatFocusId + $scope.hasChatFocusThreadId).parent().hide();
            $scope.inputs.chatProposition = '';

            
          }

        // }, 10);
      }

      $scope.clearExpandingClass = function(remark) {
        if (!remark.assertionPath || !$scope.selectProposition) {
          console.log('No assertion path');
          return;
        }

        if(!$scope.toBeClearedLater.remarkId){
          $scope.toBeClearedLater.remarkId = remark.id;
          $scope.toBeClearedLater.threadId = $scope.selectedThread.threadId;
        }
        

        // if ($scope.toBeClearedLater.remarkId){
          // console.log("Clearing: ",$scope.toBeClearedLater.remarkId, $scope.toBeClearedLater.threadId )
          $('#' + $scope.toBeClearedLater.remarkId + $scope.toBeClearedLater.threadId)
            .parent().hide();
            $scope.toBeClearedLater = {};
        //   console.log('hides due to click away or initial click')
        //   $scope.toBeClearedLater = {};
        // } else {
        //    $('#' + remark.id + $scope.selectedThread.threadId)
        //     .parent().hide();
        //   console.log("Hides due to outgoing proposition")
        // }
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
          console.log('No actual remarks');
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
        if ((payload.blankParagraphForDeleter && payload.hidesOthersProp) || payload.hidesBlankParagraph) {
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
