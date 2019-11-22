(function() {
  'use strict';

  /** @ngInject */
  function EditorController(
    $log, $state, $rootScope, $scope, $stateParams, chatSocket,
    apiService, profileService, libraryService, profile, library, $uibModal,
    messageFormatter, focusFactory, Notification,
    $document, $timeout, IdFactory) {

    // All the modal buttons.

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
      });

      optionsModalInstance.result.then(function(res) {
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
          console.error(error);
        });
      }).catch(function(error) {
        console.error(error);
      });

    };

    if ($stateParams.bookId) {
      $scope.bookId = $stateParams.bookId;
      $scope.loadData($scope.bookId);
    }

    // Frontend option variables
    $scope.options = {
      highlightOwned: false,
      dimNotOwned: false
    };

    // If it loads nothing, go back to profile
    // $scope.data = profileService.getSelectedBook();
    // if ($scope.data === null) {
    //   $state.go('main.backoffice.profile');
    //   return;
    // }

    // Assign variables
    // $scope.propositions = propositions;
    // $scope.data = book;
    $scope.title = '';
    $scope.profile = profileService.getProfile();
    $scope.userId = $rootScope.uid;

    // Just put it in a big function
    // Down the line, this needs to be re-architectured.

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
      var prep = {};
      var apply = {};
      var temp = {};

      // If the data doesn't have a dialogue, make the dialogue empty
      if (!$scope.data[0].hasOwnProperty('dialogue')) {
        $scope.data[0].dialogue = [];
      }

      // Signs out
      $scope.logout = function() {
        apiService.signOut().then(function() {
          profileService.clear();
          libraryService.clear();
          $state.go('login');
        });
      };

      // Goes to profile
      $scope.goToProfile = function() {
        $state.go('main.backoffice.profile');
      };

      //For the direct link
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

      $scope.mouseOverTextBlurrer = function() {
        document.getElementById('textblurrer').classList
          .add('dialogueblurrermouseover');
      };

      $scope.mouseLeaveTextBlurrer = function() {
        document.getElementById('textblurrer').classList
          .remove('dialogueblurrermouseover');
      };

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

      $scope.mouseOverDialogueBlurrer = function() {
        document.getElementById('dialogueblurrer').classList
          .add('dialogueblurrermouseover');
      };

      $scope.mouseLeaveDialogueBlurrer = function() {
        document.getElementById('dialogueblurrer').classList
          .remove('dialogueblurrermouseover');
      };

      // Assigns mouseover to a proposition and keeps track of which proposition has the mouse over
      $scope.mouseOver = function(proposition) {
        $scope.mousedOverProposition = proposition;
        $scope.mousedOverProposition.mouseOver = true;
      };

      $scope.mouseLeave = function(/*proposition*/) {
        $scope.mousedOverProposition = {};
      };

      $scope.clearSelectedProposition = function() {
        $scope.selectedProposition = null;
        $scope.selectedParagraph = null;
      };

      $scope.readBookLevel = function(address) {
        // Seems necessary for some reason
        // The first time this fires, the address is [0]
        angular.copy(address, $scope.copyOfAddress);

        // Calculates the path
        $scope.compilationPath = $scope.buildNodePath(address);

        // And the destination
        $scope.compilationTarget = eval($scope.compilationPath);

        // Book being compiled starts with the topic at the address and a blank line
        $scope.bookBeingCompiled = $scope.bookBeingCompiled + $scope.compilationTarget.topic + '\r\n\r\n';

        // Through all paragraphs,
        for (var j = 0; j < $scope.compilationTarget.paragraphs.length; j++) {

          // And all propositions
          for (var k = 0; k < $scope.compilationTarget.paragraphs[j].propositions.length; k++) {

            // If it's not hidden, or a negation
            if ($scope.compilationTarget.paragraphs[j].propositions[k].type !== 'negation' &&
              $scope.compilationTarget.paragraphs[j].propositions[k][$scope.userId] !== 'hidden') {

              // Take propositions and add spaces between them
              $scope.bookBeingCompiled = $scope.bookBeingCompiled + $scope.compilationTarget.paragraphs[j].propositions[k].text + ' ';
            }
          }

          // After it's done, add a blank line
          $scope.bookBeingCompiled = $scope.bookBeingCompiled + '\r\n\r\n';
        }

        // Take the address being worked with and go a level deeper to the first one, if there
        address.push(0);

        // Build a path there
        $scope.compilationPath = $scope.buildNodePath(address);

        // The candidate is constructed from data[0]
        $scope.compilationCandidate = '$scope.data[0]';

        // If the book level address exactly equals [0], compilation candidate remains unchanged
        if (address === [0]) {
          $scope.compilationCandidate = '$scope.data[0]';
          // else if the book level address exactly equals [1], send back a terminating return address
        } else if (address === [1]) {
          $scope.returnAddress = [1];
          return;

          // otherwise calculate a path according to the address that gets the array of nodes below the address
        } else {
          for (var i = 1; i < address.length - 1; i++) {
            $scope.compilationCandidate = $scope.compilationCandidate + '.children[' + address[i] + ']';
          }
          $scope.compilationCandidate = $scope.compilationCandidate + '.children';
        }


        // if there is such an array of nodes...
        // if not, the else catches that contingency
        if (eval($scope.compilationCandidate)) {
          console.log('There\'s a level below');

          // and something at the address
          if (eval($scope.compilationPath)) {

            // return the address so as to read that level
            $scope.returnAddress = address;
            console.log('Found under the rug');

            return;

          } else {
            // otherwise get rid of the last entry of the array
            address.pop();

            // and look at the same level as the address just checked, one over
            address[address.length - 1]++;
            $scope.compilationPath = $scope.buildNodePath(address);

            // if there's something there, send back that return address to be read
            if (eval($scope.compilationPath)) {
              console.log('Found in the next room');
              $scope.returnAddress = address;
              return;
            } else {

              while (!eval($scope.compilationPath && address.length > 1)) {
                address.pop();
                address[address.length - 1]++;
                $scope.compilationPath = $scope.buildNodePath(address);
                if (eval($scope.compilationPath)) {
                  $scope.returnAddress = address;
                  console.log('Found in a corner somewhere in the attic');
                  return;
                }
                console.log('Didnt find');
                $scope.returnAddress = [0];
                return;

              }
            }

            address = {};


          }

        } else {
          console.log('There\'s no level below');
          address.pop();
          address[address.length - 1]++;
          $scope.compilationPath = $scope.buildNodePath(address);
          if (eval($scope.compilationPath)) {
            console.log('Found in the next room');
            $scope.returnAddress = address;
            return;
          } else {


            while (!eval($scope.compilationPath && address.length > 1)) {
              address.pop();
              address[address.length - 1]++;
              if (address[0] === 1) {
                console.log('Hit the end');
                $scope.returnAddress = [1];
                return;

              }
              $scope.compilationPath = $scope.buildNodePath(address);
              if (eval($scope.compilationPath)) {
                $scope.returnAddress = address;
                console.log('Found in a corner somewhere in the attic');
                return;
              }
              console.log('Didnt find');
              $scope.returnAddress = [0];
              return;


            }
          }
        }


      };

      $scope.buildNodePath = function(location) {
        $scope.compilationPath = '$scope.data[0]';
        if (location === [0]) {
          return $scope.compilationPath;
        } else if (location === [1]) {
          return '$scope.data[1]';
        } else {
          // not building node path to first level or non-existent [1] level, so build
          // an address string
          for (var i = 1; i < location.length; i++) {
            $scope.compilationPath = $scope.compilationPath + '.children[' + location[i] + ']';
          }

          return $scope.compilationPath;
        }
      };


      $scope.makeTextFile = function() {

        // Build the book into a text string

        $scope.bookBeingCompiled = '';

        // Get data from root topic
        // Will set the return address variable
        $scope.readBookLevel([0]);

        // If it tries to go to one on index zero, there isn't one to be found! Else it works with the return address
        while ($scope.returnAddress[0] !== 1) {
          console.log('Return address: ', $scope.returnAddress);
          $scope.readBookLevel($scope.returnAddress);
        }

        // Make a blob of teh book being compiled
        var data = new Blob([$scope.bookBeingCompiled], { type: 'text/plain' });

        // If there's already a text file variable assigned, revoke its url
        if ($scope.textFile !== null) {
          window.URL.revokeObjectURL($scope.textFile);
        }

        // Make a URL of the data and save it as textFile
        $scope.textFile = window.URL.createObjectURL(data);


        // Return textFile
        return $scope.textFile;
      };


      var create = document.getElementById('downloadlink');
      $scope.textFile = $scope.data[0];
      //works

      create.addEventListener('click', function() {
        var link = document.getElementById('downloadlink');
        link.href = $scope.makeTextFile();
        console.log('Link HREF: ', link.href);
      }, false);


      setTimeout(function() {
        if (!$scope.data[0].paragraphs[0].propositions[0].author) {
          $scope.$apply(function() {
            $scope.selectedNode = $scope.data[0];
            $scope.selectedParagraph = $scope.data[0].paragraphs[0];
            $scope.selectedProposition = $scope.data[0].paragraphs[0].propositions[0];
            $scope.selectedProposition.textSide = true;
            // console.log('timeout selected proposition', $scope.selectedProposition)
            // var query1 = '#proposition'+'Ngmyk1lP1KfffhSAw333';

            // var ids = document.querySelectorAll('[id]');

            // Array.prototype.forEach.call( ids, function( el, i ) {
            //  // "el" is your element
            //  console.log( el.id ); // log the ID
            // });

            // var ids = {};


            // if ($(query1).length) {
            //   console.log('query 1 exists');
            // }


            // angular.element(query1).trigger('click');
            // $(query1).click();

            // query1 = '';
          });
          $scope.$apply(function() {
            focusFactory('Ngmyk1lP1KfffhSAw333');
          });
        } else {
          $scope.selectedProposition = {};
        }
      }, 30);

      $scope.selectNode = function(node) {

        $scope.selectedNode = node;

      };

      $scope.selectParagraph = function(paragraph) {

        $scope.selectedParagraph = paragraph;

        paragraph.cursor = false;

        // if (event) {
        // var x = event.clientX;
        // var y = event.clientY;
        // var elementMouseIsOver = document.elementFromPoint(x, y);
        // }


      };

      $scope.clearWithLeftAdder = function(/*paragraph*/) {


        $scope.leftAdderId = IdFactory.next();


        focusFactory($scope.leftAdderId);

      };


      $scope.clearWithTopAdder = function(/*paragraph*/) {

        $scope.selectedProposition = {};
        $scope.selectedProposition.textSide = true;

        $scope.topAdderId = IdFactory.next();


        focusFactory($scope.topAdderId);

      };

      $scope.clearWithBottomAdder = function(/*paragraph*/) {

        $scope.selectedProposition = {};
        $scope.selectedProposition.textSide = true;

        $scope.bottomAdderId = IdFactory.next();


        focusFactory($scope.bottomAdderId);

      };

      $scope.selectProposition = function(proposition) {
        if ($scope.selectedProposition.id !== proposition.id) {
          $scope.clearPropositionInput();
          $scope.selectedProposition = proposition;
          focusFactory($scope.selectedProposition.id);

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

      $scope.clearPropositionInput = function() {
        $scope.inputs.proposition = '';
        $scope.highlight.id = '';
        $scope.mark.id = '';
      };

      $scope.highlightAllPropositions = function(node,
                                                 paragraph,
                                                 proposition) {
        // if($scope.selectedProposition.type === 'blank' && !paragraph.$first){
        //     paragraph[$scope.userId] = 'hidden'
        //     for(var i = $scope.selectedParagraph.position-1; i > -1; i--){
        //         if ($scope.selectedNode.paragraphs[i][$scope.userId] !== 'hidden')
        //     }
        //     $scope.selectedParagraph =
        // }
        // for(var i = 0; i < paragraph.propositions.length; i++){
        //   paragraph.propositions[i].highlightAll = true;
        // }
        if ($scope.highlight.id !== proposition.id) {
          // $scope.highlight.id = proposition.id;
          // $scope.highlight.highlit = true;
          console.log('highlighted all');
        }
        $scope.selectedParagraph.highlightAll = true;
      };

      $scope.markAllPropositions = function(/*proposition*/) {
        // for(var i = 0; i < paragraph.propositions.length; i++){
        //   paragraph.propositions[i].markAll = true;
        // }
        // $scope.mark.id = proposition.id;
        // $scope.mark.marked = true;
        console.log('marked all');
        $scope.selectedParagraph.markAll = true;
        $scope.selectedParagraph.highlightAll = false;
      };


      $scope.deleteAllPropositions = function(/*paragraph*/) {
        console.log('deleting all');
        $scope.selectedParagraph.markAll = false;
        $scope.selectedParagraph.highlightAll = false;
        $scope.selectedParagraph.markAll = false;
        prep.address = $scope.selectedNode.address;
        prep.nodePath = '$scope.data';

        //make the nodes part of the address
        for (var i = 0; i < prep.address.length; i++) {
          if (i < prep.address.length - 1) {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
          } else {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
          }
        }
        prep.hidesOthersProp = true;
        prep.blanksParagraphForDeleter = true;

        prep.payload = {
          class: $scope.selectedNode.class,
          topic: $scope.selectedNode.topic,
          paragraphPosition: $scope.selectedParagraph.position,
          address: $scope.selectedNode.address,
          nodePath: prep.nodePath,
          proposition: $scope.selectedProposition,
          author: $scope.selectedProposition.author,
          id: $scope.selectedProposition.id,
          blanksParagraphForDeleter: (prep.blanksParagraphForDeleter ? prep.blanksParagraphForDeleter : undefined),
          blanksPropositionForEveryone: (prep.blanksPropositionForEveryone ? prep.blanksPropositionForEveryone : undefined),
          complicatedDeletion: (prep.complicatedDeletion ? prep.complicatedDeletion : undefined),
          paragraphBlankId: IdFactory.next(),
          blankId: IdFactory.next(),
          hidesOthersProp: (prep.hidesOthersProp ? prep.hidesOthersProp : undefined),
          hidesOwn: (prep.hidesOwn ? prep.hidesOthersProp : undefined),
          deleter: $scope.userId
        };

        console.log('Payload to be deleted: ', prep.payload);

        chatSocket.emit('deletion', $scope.userId, prep.payload);
        prep = {};

        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);
      };


      $scope.highlightProposition = function(node, paragraph, proposition) {
        console.log('Highlighting proposition');
        if ($scope.highlight.id !== proposition.id) {
          $scope.highlight.id = proposition.id;
          $scope.highlight.highlit = true;
          console.log('highlit');
        }
      };

      $scope.markProposition = function(proposition) {
        $scope.mark.id = proposition.id;
        $scope.mark.marked = true;
        console.log('marked');
      };


      $scope.deleteProposition = function() {

        console.log('Just deleteProposition');
        prep.address = $scope.selectedNode.address;
        prep.nodePath = '$scope.data';

        //make the nodes part of the address
        for (var i = 0; i < prep.address.length; i++) {
          if (i < prep.address.length - 1) {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
          } else {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
          }
        }

        if ($scope.selectedProposition.type === 'blank') {
          prep.hidesBlankParagraph = true;

        }

        // If one proposition to remain is found not of user's authoring, can just hide the proposition
        // as something that just won't be engaged with
        if ($scope.selectedProposition.author !== $scope.userId && $scope.selectedProposition.type !== 'blank') {
          prep.hidesOthersProp = true;
          prep.blanksParagraphForDeleter = true;
          // for(var i = 0; i < $scope.selectedParagraph.propositions.length; i++){
          //   if ($scope.selectedParagraph.propositions[i].type !== "blank" &&
          //     $scope.selectedParagraph.propositions[i][$scope.userId] !== "hidden" &&
          //     $scope.selectedParagraph.propositions[i].id !== $scope.selectedProposition.id){
          //     prep.blanksPropositionForDeleter = true;
          //     break;
          //   }
          // }
          // if (!prep.blanksPropositionForDeleter){
          //   prep.blanksPropositionAndParagraphForDeleter = true;
          // }
        } else if ($scope.selectedProposition.type === 'blank') {
          prep.blanksPropositionAndParagraphForDeleter = true;
        } else {
          prep.hidesOwn = true;
          for (var i = 0; i < $scope.selectedParagraph.propositions.length; i++) {
            if ($scope.selectedParagraph.propositions[i].type !== 'blank' &&
              $scope.selectedParagraph.propositions[i][$scope.userId] !== 'hidden' &&
              $scope.selectedParagraph.propositions[i].id !== $scope.selectedProposition.id) {
              prep.blanksPropositionForEveryone = true;
              break;
            }
          }
          if (!prep.blanksPropositionForEveryone) {
            prep.complicatedDeletion = true;
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
          blanksParagraphForDeleter: (prep.blanksParagraphForDeleter ? prep.blanksParagraphForDeleter : undefined),
          hidesBlankParagraph: (prep.hidesBlankParagraph ? prep.hidesBlankParagraph : undefined),
          blanksPropositionForEveryone: (prep.blanksPropositionForEveryone ? prep.blanksPropositionForEveryone : undefined),
          complicatedDeletion: (prep.complicatedDeletion ? prep.complicatedDeletion : undefined),
          paragraphBlankId: IdFactory.next(),
          blankId: IdFactory.next(),
          hidesOthersProp: (prep.hidesOthersProp ? prep.hidesOthersProp : undefined),
          hidesOwn: (prep.hidesOwn ? prep.hidesOthersProp : undefined),
          deleter: $scope.userId
        };

        console.log('Payload to be deleted: ', prep.payload);

        chatSocket.emit('deletion', $scope.userId, prep.payload);
        prep = {};

        apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
        apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
        profileService.setSelectedBook($scope.data[0]);
      };

      // Deleting anothers paragraph has to save space on which to write
      // Hide all of their propositions, shift them up, add a blank at the beginning
      // Code it so the blank inserts a nueva paragraph above which will hide the blank
      // Make it possible to get rid of the blank by backspace

      $scope.$on('socket:broadcastDeletion', function(event, payload) {

        // if (payload.hidesOthersProp && payload.deleter !== $scope.userId){
        //   return;
        // }
        // Node and paragraph destination calcs
        apply.nodeDestination = eval(payload.nodePath);
        apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
        apply.paragraphDestination = eval(apply.paragraphPath);

        if (payload.blanksParagraphForDeleter) {
          // Hides the target paragraph
          if (payload.deleter === $scope.userId) {
            for (var i = apply.paragraphDestination.propositions.length - 1; i > -1; i--) {
              apply.paragraphDestination.propositions[i][$scope.userId] = 'hidden';
              apply.paragraphDestination.propositions[i].position++;
              apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
            }
            apply.paragraphDestination.propositions[0] = {                                                 //   PUT IN A NEW BLANK PARAGRAPH AFTER
              id: payload.blankId,
              type: 'blank',
              text: '',
              position: 0,
              isPlaceholder: true
            };
            $scope.selectedParagraph = apply.paragraphDestination;
            $scope.selectedProposition = apply.paragraphDestination.propositions[0];
            $scope.selectedProposition.textSide = true;
            focusFactory($scope.selectedProposition.id);
            $($scope.selectedProposition.id).trigger('click');
          } else {
            for (var i = apply.paragraphDestination.propositions.length; i > -1; i--) {
              apply.paragraphDestination.propositions[i].position++;
              apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
              if ($scope.selectedProposition.id === apply.paragraphDestination.propositions[i].id) {
                $scope.selectedProposition.position = angular.copy(apply.paragraphDestination.propositions[i].position);
              }
            }
            apply.paragraphDestination.propositions[0] = {                                                 //   PUT IN A NEW BLANK PARAGRAPH AFTER
              id: payload.blankId,
              type: 'blank',
              text: '',
              position: 0
            };
            apply.paragraphDestination.propositions[0][$scope.userId] = 'hidden';
          }
        }

        // if (payload.blanksPropositionAndParagraphForDeleter) {
        //   if (payload.deleter === $scope.userId ){
        //     apply.paragraphDestination[$scope.userId] = 'hidden';
        //     apply.paragraphDestination.propositions[payload.proposition.position][$scope.userId] = 'hidden';
        //   }
        // }
        if (payload.hidesBlankParagraph) {
          apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition + ']';
          apply.minusOne = payload.paragraphPosition - 1;
          apply.toBeSelected = payload.nodePath + '.paragraphs[' + apply.minusOne + ']';
          if (eval(apply.toBeSelected) && payload.deleter === $scope.userId) {
            apply.toBeSelectedDestination = eval(apply.toBeSelected);
            for (var i = apply.toBeSelectedDestination.propositions.length - 1; i > -1; i--) {
              if (apply.toBeSelectedDestination.propositions[i][$scope.userId] !== 'hidden' && apply.toBeSelectedDestination.propositions[i].author === $scope.userId) {
                $scope.selectedParagraph = apply.toBeSelectedDestination;
                $scope.selectedProposition = apply.toBeSelectedDestination.propositions[i];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                var query = 'proposition' + $scope.selectedProposition.id;
                $(query).trigger('click');
                query = '';
                break;
              }
            }
            apply.paragraphDestination = eval(apply.paragraphPath);
            apply.paragraphDestination[$scope.userId] = 'hidden';
            return;
          } else {
            apply.paragraphDestination = eval(prep.paragraphPath);
            apply.paragraphDestination[payload.deleter] = 'hidden';
            return;
          }
        }

        if (payload.blanksPropositionForEveryone) {
          apply.paragraphDestination.propositions[payload.proposition.position][$scope.userId] = 'hidden';
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
        }

        if (payload.complicatedDeletion) {
          apply.theCount = 0;
          for (var i = 0; i < apply.nodeDestination.paragraphs.length; i++) {
            if (payload.deleter !== $scope.userId && apply.nodeDestination.paragraphs[i][$scope.userId] !== 'hidden') {
              console.log('Found unhidden paragraph: ', i);
              apply.theCount++;
            }
          }

          if (apply.theCount > 1) {
            prep.hasElsewhereToWrite = true;
          }

          if (payload.deleter !== $scope.userId && prep.hasElsewhereToWrite === true) {
            apply.paragraphDestination[$scope.userId] = 'hidden';
            apply.paragraphDestination.propositions[payload.proposition.position][$scope.userId] = 'hidden';
          } else {
            apply.paragraphDestination.propositions[payload.proposition.position][$scope.userId] = 'hidden';
          }
          // Move subsequent propositions
          for (var i = apply.paragraphDestination.propositions.length - 1; i > payload.proposition.position; i--) {
            apply.paragraphDestination.propositions[i].position++;                                                                                   //       MAKE ROOM FOR IT
            apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
          }
          // Place a new blank
          apply.paragraphDestination.propositions[payload.proposition.position] = {                                                 //   PUT IN A NEW BLANK PARAGRAPH AFTER
            id: payload.blankId,
            type: 'blank',
            text: '',
            position: payload.proposition.position
          };

          // for (var i = 0; i < prep.paragraphDestination.propositions.length; i++){
          //   if (prep.paragraphDestination.propositions[i].type !== 'negation' &&
          //   prep.paragraphDestination.propositions[i][$scope.userId] !== 'hidden'){
          //     prep.paragraphDestination.propositions[i].
          //     break;
          //   }
          // }

          // Select if you're the author
          if (payload.proposition.author === $scope.userId) {
            $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
            $scope.selectedProposition.textSide = true;
            focusFactory($scope.selectedProposition.id);
            $($scope.selectedProposition.id).trigger('click');
          }
        }
        // If it hides anothers, and the paragraph would still have a non-blank, non-hidden proposition,
        // just hide privately
        //   If nothing but blanks and hides left, hide the proposition and hide the paragraph privately

        // If it hides your own, and the paragraph would still have a non-blank, non-hidden proposition,
        // just hide globally
        //   If nothing but blanks and hides left, hide the paragraph globally except for you,
        //   hide the proposition globally, move it up and put a blank in its place

        // Paragraphs will need to be un-hidden when propositions come in on paragraphs hidden locally


        // Blank is going one index past the proposition to be deleted
        // apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + '].propositions[' + (payload.proposition.position+1).toString() + ']';
        // apply.propositionDestination = eval(apply.propositionPath);

        // REWRITE FOR PROPOSITIONS THAT GET MOVED
        // for (var i = payload.paragraphPosition; i < apply.nodeDestination.paragraphs.length-1; i++) {
        //   if ($scope.selectedProposition.author !== $scope.userId && $scope.selectedProposition.id === payload.proposition.id){
        //


        for (var i = 0; i < apply.paragraphDestination.propositions.length; i++) {
          if (apply.paragraphDestination.propositions[i].type === 'assertion' &&
            apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {
            apply.propositionPath = apply.paragraphPath + '.propositions[' + i.toString() + ']';
            apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;
            console.log('assertion path updated to ', apply.paragraphDestination.propositions[i].assertionPath);
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


      $scope.prepProposition = function(input, paragraph) {

        // console.log('Has Of: ', $scope.selectedProposition.of)
        // console.log('Of author is you: ', $scope.selectedProposition.of.author === $scope.userId)
        // console.log('Selected Proposition is negation: ', $scope.selectedProposition.type === 'negation');
        // console.log('Not a question: ', !$scope.selectedProposition.question);

        $scope.selectedParagraph.highlightAll = false;
        $scope.selectedParagraph.markAll = false;
        apply = {};
        // Define characters at the beginning and end of the input
        prep.firstChar = input.charAt(0);
        prep.lastChar = input.charAt(input.length - 1);

        // Bounce bad inputs:
        // Those on nodes with no paragraphs
        // Those that are blank

        // if (!$scope.selectedNode.paragraphs || input.length === 0 ||
        //   ((prep.lastChar !== '.' && prep.lastChar !== '?' && prep.lastChar !== ':'))) {
        //   console.log('Returning');
        //   $scope.inputs.proposition = '';
        //   return;
        // }


        // Sort propositions into types and calculate things


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
          console.log('Node path: ', prep.nodePath);
          console.log('Address: ', prep.address);
          prep.assertionPath = prep.nodePath + '.paragraphs[' + prep.paragraphPosition.toString() + '].propositions[' + prep.position.toString() + ']';    //   INITIAL ASSERTION PATH


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


          // Console logs
          console.log('Old node path: ', prep.oldNodePath);
          console.log('New node path: ', prep.nodePath);
          console.log('Topic: ', prep.topic);
        }




        // Negations


        // If the selected proposition is not your own
        // and it's an assertion or rejoinder (not a blank)
        // Or if it's a continuation of another negation
        // it's a negation
        else if ((($scope.selectedProposition.type === 'assertion' || $scope.selectedProposition.type === 'rejoinder') &&
          $scope.selectedProposition.author !== $scope.userId) || ($scope.selectedProposition.type === 'negation' && $scope.selectedProposition.author === $scope.userId)) {

          if (prep.lastChar === '?') {
            prep.topic = input;
            prep.question = prep.topic;
          }

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
          console.log('assertion path before: ', prep.assertionPath);


// calculates the of and assertion path wrong


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
          }                                                                         // needs to be rewritten, assumes all non-rejoinder negations
          // are first negations

          console.log('assertion path after: ', prep.assertionPath);

          console.log('Path to assertion: ', prep.assertionPath);
          console.log('New remark address: ', prep.remarkAddress);              //    CONSOLE LOGS
          console.log('Node position: ', prep.nodePath);
          console.log('Question/Topic: ', prep.topic);
          console.log('Destination: ', prep.class);
        } else if ($scope.selectedProposition.of &&                                                //   REJOINDER
          $scope.selectedProposition.of.author === $scope.userId &&
          $scope.selectedProposition.type === 'negation' &&
          !$scope.selectedProposition.question) {
          prep.topic = $scope.selectedNode.topic;
          prep.type = 'rejoinder';                              //    IF ITS AN EXCLAMATION AND THE SELECTED PROPOSITION IS A REMARK ON ONE'S OWN PROPOSITION
          //   IN THE FORM OF A NEGATION, IT'S A REJOINDER

          prep.adjustedText = input.substring(0, input.length - 1) + '.';
          prep.assertionId = $scope.selectedProposition.assertionId;
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
              console.log('gets own proposition');
              break;
            }
          }
          if (!prep.position) {
            prep.position = $scope.selectedParagraph.propositions.length;                                 //    IF THE NEGATION MUST BE PUT AT THE END OF THE PARAGRAPH
            prep.getsOwnProposition = true;
            console.log('gets own place');
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
            console.log('selected proposition remark address is: ', $scope.selectedProposition.remarkAddress);
            for (var i = 0; i < $scope.selectedProposition.remarkAddress.length; i++) {                    // calculate the path to the selectedProposition's remark location

              start = start + '.remarks[' + $scope.selectedProposition.remarkAddress[i].toString() + ']';
              console.log('start is now: ', start, ' and i is now: ', i);
            }

            console.log('Calculated start value: ', start);


            prep.remarkAddress = angular.copy($scope.selectedProposition.remarkAddress);    //  the new remark address will be based on the selectedProposition's remark address array
            prep.check = eval(start);                                         //  check the selectedProposition's remark location
            start = '';
            if (prep.check && prep.check.remarks.length > 0) {                              //  if the remark has remarks
              prep.remarkAddress.push(prep.check.remarks.length);             //  make a new index
              console.log('pushed onto last index of the remark address array array: ', prep.check.remarks.length);
            } else {
              prep.remarkAddress.push(0);                                     //  otherwise the index is 0
              console.log('pushed a 0 onto the last index of the remark address array');


              prep.remarkPath = prep.assertionPath;
              for (var i = 0; i < prep.remarkAddress.length; i++) {                            // calculate the path to the selectedProposition's remark location
                prep.remarkPath = prep.remarkPath + '.remarks[' + prep.remarkAddress[i].toString() + ']';
              }
            }
          } else {
            prep.remarkAddress = $scope.selectedProposition.remarkAddress;          // shouldn't trigger
            prep.remarkAddress.push(0);
            prep.remarkPath = prep.assertionPath + '.remarks[0]';
            console.log('just pushed a zero');
          }

        } else if ($scope.selectedProposition.question) {
          prep.type = 'assertion';
          prep.adjustedText = input;
          prep.position = 0;
          prep.paragraphPosition = 0;
          prep.getsOwnNode = true;
          prep.answeredQuestion = $scope.selectedProposition.question;

          console.log('Selected Node: ', $scope.selectedNode);
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
          console.log('It\'s an everyday assertion');
        }


        if ($scope.selectedProposition.type === 'blank' && prep.type !== 'topic') {
          if ($scope.selectedProposition.isPlaceholder) {
            prep.paragraphPosition = $scope.selectedParagraph.position;                                                   //   OTHERWISE IF YOU'RE WORKING FROM A BLANK
            prep.position = $scope.selectedProposition.position;
            prep.replacesBlankAndMoves = true;
          } else {
            prep.paragraphPosition = $scope.selectedParagraph.position;                                                   //   OTHERWISE IF YOU'RE WORKING FROM A BLANK
            prep.position = $scope.selectedProposition.position;                                                          //   YOU'RE WORKING FROM A BLANK
            prep.replacesBlank = true;
            console.log('Replaces blank');
          }
        } else if (!prep.answeredQuestion && prep.type !== 'topic') {
          if (paragraph.topAdd) {
            prep.paragraphPosition = $scope.selectedParagraph.position;
            prep.position = 0;
            prep.insertsAbove = true;
            console.log('Going to add above');
          } else if (paragraph.bottomAdd) {
            prep.paragraphPosition = $scope.selectedParagraph.position + 1;
            prep.position = 0;
            prep.insertsBelow = true;
            console.log('Going to add below');
          } else if (paragraph.leftAdd) {
            prep.paragraphPosition = $scope.selectedParagraph.position;
            prep.position = $scope.selectedProposition.position;
            prep.insertsLeft = true;
          } else {
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


        if (prep.type !== 'topic' && prep.type !== 'negation' && !prep.answeredQuestion) {
          prep.nodePath = '$scope.data';
          prep.address = $scope.selectedNode.address;

          for (var i = 0; i < prep.address.length; i++) {                                          //    CALCULATES PATH TO THE NODE
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }
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


        console.log('Author: ', $scope.userId);
        console.log('Type: ', prep.type);                                                     //    CONSOLE LOGS
        console.log('Paragraph Position: ', prep.paragraphPosition);
        console.log('Position: ', prep.position);
        console.log('Text: ', prep.adjustedText);
        prep.payload = {
          topic: prep.topic,
          address: prep.address,
          paragraphPosition: prep.paragraphPosition,
          blankId: IdFactory.next(),
          textSide: $scope.selectedProposition.textSide,
          class: (prep.newClass ? prep.newClass : prep.class),
          nodePath: (prep.nodePath ? prep.nodePath : undefined),
          oldNodePath: (prep.oldNodePath ? prep.oldNodePath : undefined),                          //    COMPOSITION OF THE PAYLOAD
          question: (prep.question ? prep.question : undefined),
          paragraphId: IdFactory.next(),
          proposition: {
            id: IdFactory.next(),
            question: (prep.question ? prep.question : undefined),
            answeredQuestion: (prep.answeredQuestion ? prep.answeredQuestion : undefined),
            getsOwnNode: (prep.getsOwnNode === true ? prep.getsOwnNode : undefined),
            getsOwnParagraph: (prep.getsOwnParagraph === true ? prep.getsOwnParagraph : undefined),
            getsOwnPlace: (prep.getsOwnPlace === true ? prep.getsOwnPlace : undefined),
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

        paragraph.topAdd = false;
        paragraph.bottomAdd = false;
        paragraph.leftAdd = false;
        paragraph.leftMouseOver = false;
        paragraph.topMouseOver = false;
        paragraph.bottomMouseOver = false;
      };


      $scope.$on('socket:broadcastProposition', function(event, payload) {
        $timeout(function() {
          $scope.$apply(function() {

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
                  console.log('Node destination: ', apply.nodeDestination);
                  $scope.selectedParagraph = apply.paragraphDestination;
                  console.log('Paragraph destination: ', apply.paragraphDestination);
                  $scope.selectedProposition = apply.propositionDestination;
                  console.log('Proposition destination: ', apply.propositionDestination);
                  $scope.selectedProposition.textSide = true;
                  console.log('Selected Proposition Id: ', $scope.selectedProposition.id);
                  console.log('Placed your own: ', payload.proposition.author === $scope.userId);
                  console.log('Textside: ', $scope.selectedProposition.textSide === true);
                  focusFactory($scope.selectedProposition.id);
                  console.log('Triggering the click');
                  var query = 'proposition' + $scope.selectedProposition.id;
                  $(query).trigger('click');
                  query = '';
                }
              }

              // Answered questions

              if (payload.proposition.answeredQuestion) {

                console.log('Old node destination: ', apply.oldNodeDestination);
                for (var i = 0; i < apply.oldNodeDestination.paragraphs.length; i++) {
                  for (var j = 0; j < apply.oldNodeDestination.paragraphs[i].propositions.length; j++) {
                    if (payload.proposition.of.id === apply.oldNodeDestination.paragraphs[i].propositions[j].id) {
                      apply.oldNodeDestination.paragraphs[i].propositions[j][$scope.userId] = 'hidden';
                      apply.oldNodeDestination.paragraphs[i].propositions[j].rejoined = true;
                      console.log('Found: ', i, ' ', j);
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
                  console.log('Node destination: ', apply.nodeDestination);
                  $scope.selectedParagraph = apply.paragraphDestination;
                  console.log('Paragraph destination: ', apply.paragraphDestination);
                  $scope.selectedProposition = apply.propositionDestination;
                  console.log('Proposition destination: ', apply.propositionDestination);
                  $scope.selectedProposition.textSide = true;
                  console.log('Selected Proposition Id: ', $scope.selectedProposition.id);
                  console.log('Placed your own: ', payload.proposition.author === $scope.userId);
                  console.log('Textside: ', $scope.selectedProposition.textSide === true);
                  focusFactory($scope.selectedProposition.id);
                  console.log('Triggering the click');
                  var query = 'proposition' + $scope.selectedProposition.id;
                  $(query).trigger('click');
                  query = '';
                }
              }


            } else if (payload.proposition.getsOwnPlace) {
              apply.nodeDestination = eval(payload.nodePath);
              apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position] = payload.proposition;
              console.log('Gets own place');
            } else if (payload.proposition.replacesBlankAndMoves) {
              apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.nodePath = payload.nodePath;
              apply.nodeDestination = eval(payload.nodePath);
              console.log('Trying to hide ', apply.paragraphPath);
              if ($scope.userId === payload.proposition.author) {
                apply.paragraphDestination[$scope.userId] = 'hidden';
              }
              console.log('State of the hiding: ', apply.paragraphDestination[$scope.userId]);


              for (var i = apply.nodeDestination.paragraphs.length - 1; i > payload.paragraphPosition - 1; i--) {
                apply.nodeDestination.paragraphs[i].position++;
                if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id) {
                  $scope.selectedParagraph.position = angular.copy(apply.nodeDestination.paragraphs[i].position);
                }

                apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];
                for (var j = 0; j < apply.nodeDestination.paragraphs[i + 1].propositions.length; j++) {
                  if (apply.nodeDestination.paragraphs[i + 1].propositions[j].type === 'assertion') {
                    apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + j.toString() + ']';
                  }
                  for (var k = 0; k < apply.nodeDestination.paragraphs[i + 1].propositions.length; k++) {
                    if (apply.nodeDestination.paragraphs[i + 1].propositions[k].type === 'assertion' &&
                      apply.nodeDestination.paragraphs[i + 1].propositions[k].assertionId === payload.proposition.assertionId) {
                      apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + k.toString() + ']';
                    }
                  }
                }

                for (var i = 0; i < $scope.propositions.length; i++) {
                  if ($scope.propositions[i].assertionId === payload.proposition.assertionId) {
                    $scope.propositions[i].assertionPath = payload.proposition.assertionPath;
                  }
                }
              }
              apply.nodeDestination.paragraphs[payload.paragraphPosition] = {
                paragraphId: payload.paragraphId,
                position: payload.paragraphPosition,
                propositions: [payload.proposition]
              };


              // if (apply.paragraphDestination[$scope.userId] === 'hidden'){
              //   apply.paragraphDestination[$scope.userId] = '';
              // }


              if (payload.proposition.author === $scope.userId) {
                $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                $($scope.selectedProposition.id).trigger('click');

              }
            } else if (payload.proposition.replacesBlank) {
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
              console.log('Gets own proposition');

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
              apply.paragraphDestination = eval(apply.paragraphPath);
              apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
              apply.propositionDestination = eval(apply.propositionPath);


              for (var i = apply.nodeDestination.paragraphs.length - 1; i > payload.paragraphPosition - 1; i--) {
                apply.nodeDestination.paragraphs[i].position++;
                if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id) {
                  $scope.selectedParagraph.position = angular.copy(apply.nodeDestination.paragraphs[i].position);
                }

                apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];
                for (var j = 0; j < apply.nodeDestination.paragraphs[i + 1].propositions.length; j++) {
                  if (apply.nodeDestination.paragraphs[i + 1].propositions[j].type === 'assertion') {
                    apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + j.toString() + ']';
                  }
                  for (var k = 0; k < apply.nodeDestination.paragraphs[i + 1].propositions.length; k++) {
                    if (apply.nodeDestination.paragraphs[i + 1].propositions[k].type === 'assertion' &&
                      apply.nodeDestination.paragraphs[i + 1].propositions[k].assertionId === apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionId) {
                      console.log('Found: ', apply.nodeDestination.paragraphs[i + 1].propositions[k].assertionId);
                      apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + k.toString() + ']';
                    }
                  }
                }

                // it's searching for the incoming assertion id in order to get its current position, but it won't find it because the assertion id is


                for (var i = 0; i < $scope.propositions.length; i++) {
                  if ($scope.propositions[i].assertionId === payload.proposition.assertionId) {
                    $scope.propositions[i].assertionPath = payload.proposition.assertionPath;
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
                  console.log('Paragraph destination: ', apply.paragraphDestination);
                  console.log('Proposition destination: ', apply.propositionDestination);
                  $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                  $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                  $scope.selectedProposition.textSide = true;
                  console.log('Selected paragraph: ', $scope.selectedParagraph);
                  console.log('Selected proposition: ', $scope.selectedProposition);
                  focusFactory($scope.selectedProposition.id);
                  $($scope.selectedProposition.id).trigger('click');
                }, 30);


              }

            } else if (payload.proposition.insertsBelow) {
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
                for (var i = apply.nodeDestination.paragraphs.length - 1; i > payload.paragraphPosition - 1; i--) {
                  apply.nodeDestination.paragraphs[i].position++;
                  if ($scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].id) {
                    $scope.selectedParagraph.position = angular.copy(apply.nodeDestination.paragraphs[i].position);
                  }

                  apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];
                  for (var j = 0; j < apply.nodeDestination.paragraphs[i + 1].propositions.length; j++) {
                    if (apply.nodeDestination.paragraphs[i + 1].propositions[j].type === 'assertion') {
                      apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + j.toString() + ']';
                    }
                    for (var k = 0; k < apply.nodeDestination.paragraphs[i + 1].propositions.length; k++) {
                      if (apply.nodeDestination.paragraphs[i + 1].propositions[k].type === 'assertion' &&
                        apply.nodeDestination.paragraphs[i + 1].propositions[k].assertionId === apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionId) {
                        apply.nodeDestination.paragraphs[i + 1].propositions[j].assertionPath = payload.nodePath + '.paragraphs[' + (i + 1).toString() + '].propositions[' + k.toString() + ']';
                      }
                    }
                  }


                  for (var i = 0; i < $scope.propositions.length; i++) {
                    if ($scope.propositions[i].assertionId === payload.proposition.assertionId) {
                      $scope.propositions[i].assertionPath = payload.proposition.assertionPath;
                    }
                  }
                }
                apply.nodeDestination.paragraphs[payload.paragraphPosition] =
                  {
                    paragraphId: payload.paragraphId,
                    position: payload.paragraphPosition,
                    propositions: [payload.proposition]
                  };
              }

              apply.paragraphDestination = eval(apply.paragraphPath);


              if (payload.proposition.author === $scope.userId && payload.textSide === true) {


                $timeout(function() {
                  console.log('Paragraph destination: ', apply.paragraphDestination);
                  console.log('Proposition destination: ', apply.propositionDestination);
                  $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
                  $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
                  $scope.selectedProposition.textSide = true;
                  console.log('Selected paragraph: ', $scope.selectedParagraph);
                  console.log('Selected proposition: ', $scope.selectedProposition);
                  focusFactory($scope.selectedProposition.id);
                  $($scope.selectedProposition.id).trigger('click');
                }, 30);


              }
            } else if (payload.proposition.insertsLeft) {
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
            } else {
//              console.log('placing at end of paragraph');
              apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;
              console.log('Placed at the end of the paragraph');
              console.log('Selected Proposition Id: ', $scope.selectedProposition.id);
              console.log('Placed your own: ', payload.proposition.author === $scope.userId);
              console.log('Textside: ', $scope.selectedProposition.textSide === true);
              if (payload.proposition.author === $scope.userId && $scope.selectedProposition.textSide === true) {
                $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id);
                console.log('Triggering the click');
                $($scope.selectedProposition.id).trigger('click');
              }
            }


            if (payload.proposition.type === 'rejoinder' || payload.proposition.answeredQuestion) {
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
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0].text = apply.nodeDestination.topic;
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
                  console.log('assertion path updated to ', apply.paragraphDestination.propositions[i].assertionPath);
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


              temp.remarkPath = apply.propositionPath;          // the path to the assertion is the starting basis for the remark path
              temp.remarkDestination = eval(temp.remarkPath);


              for (var i = 0; i < payload.proposition.remarkAddress.length - 1; i++) {
                temp.remarkPath = temp.remarkPath + '.remarks[' + temp.remarkAddress[i].toString() + ']';   // navigate to the place to put the remark
              }


              temp.remarkDestination = eval(temp.remarkPath);
              if (temp.remarkDestination && temp.remarkDestination.remarks) {
                temp.remarkDestination.remarks[temp.remarkDestination.remarks.length] = payload.proposition;
              } else {
                console.log('Remark destination: ', temp.remarkDestination);
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
                console.log('focusing on ', query);
                $(query).expanding();
                $(query).focus();
              }, 0);
            }

            console.log('Propositions: ', $scope.propositions);
            // applyRemark = {};   //     CLEARS THINGS
            // notification = {};
            temp = {};

            $scope.scroll = {};

            $scope.propositions.push(payload.proposition);  // PUSHES THE PROPOSITION TO THE PROPOSITIONS ARRAY

            apiService.updateBook($scope.bookId, JSON.parse(angular.toJson($scope.data[0])));
            apiService.updatePropositions($scope.bookId, JSON.parse(angular.toJson($scope.propositions)));
            profileService.setSelectedBook($scope.data[0]);
          });
        }, 30);                                             // HAS A TIMEOUT


        $scope.initialize();

        scrollMessagesToBottom;

      });

      $scope.selectThread = function(thread) {
        console.log('Thread\'s first remark assertionId: ', thread.remarks[0].assertionId);
        if (!thread.remarks[0].assertionId) {
          console.log('Returning from selectThread');
          return;
        }
        $scope.selectedThread = thread;
      };

      $scope.selectPropositionById = function(id) {


        // insert left changes assertion paths

        console.log('Selecting Proposition by Id');
        console.log('Id is: ', id);

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
        console.log('Assertion path: ', temp.assertionPath);
        $scope.mark = {};
        $scope.highlight = {};
        // console.log('Has own property assertion path: ', temp.hasOwnProperty('assertionPath'));
        // console.log('Assertion path not undefined: ', temp.assertionPath !== undefined);
        if (temp.hasOwnProperty('assertionPath') && temp.assertionPath !== undefined) {
          temp.sliceStartingAt = temp.assertionPath.indexOf('.propositions');
          temp.paragraphPath = temp.assertionPath.slice(0, temp.sliceStartingAt);
          temp.paragraphDestination = eval(temp.paragraphPath);

          $scope.selectedParagraph = temp.paragraphDestination;
          for (var i = 0; i < temp.paragraphDestination.propositions.length; i++) {
            if (temp.paragraphDestination.propositions[i].id === id) {
              if ($scope.selectedProposition) {
                console.log('First expanding destroy')
                console.log('Jquery picking up?' + JSON.stringify($('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)));
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId).expanding('destroy');
                $scope.selectedProposition = temp.paragraphDestination.propositions[i];
                console.log('First make expanding')
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                  .expanding();
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                  .expanding();
              } else {
                console.log('First expanding destroy else')
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                  .expanding('destroy');
                $scope.selectedProposition = temp.paragraphDestination.propositions[i];
                console.log('First make expanding else')
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                  .expanding();
                $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
                  .expanding();
              }

              $scope.selectedProposition.dialogueSide = true;
              //get the remark to satisfy the ng-if so the form appears
              break;
            }
          }

        }

        console.log('selected Proposition:', $scope.selectedProposition);

        console.log('trying to focus on chatinput');


        setTimeout(function() {
          var destination = document.getElementById('proposition' + $scope.selectedProposition.id);
          if (destination) {
            destination.scrollIntoView({ behavior: 'smooth' });
          }
          var query = '#' + $scope.selectedProposition.id + $scope.selectedThread.threadId;
          console.log(query);
          $scope.$apply(function() {
            $(query).parent().show();
            $(query).expanding();
            $(query).focus();
            console.log('Query has expanding class: ', $(query)
              .expanding('active'));
          });
        }, 10);
        temp = {};
      };

      $scope.clearExpandingClass = function(remark) {
        if (!remark.assertionPath) {
          console.log('No assertion path');
          return;
        }
        console.log('trying to hide ', '#' + $scope.selectedProposition.id + $scope.selectedThread.threadId);
        $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId)
          .parent().hide();
        $scope.selectedProposition = {};
      };


      $scope.selectNodeByClass = function(thread) {
        if (!thread.remarks[0].assertionId) {
          console.log('No actual remarks, returning');
          return;
        }
        temp.nodeDestination = eval(thread.nodePath);
        $scope.selectedNode = temp.nodeDestination;
        console.log('selected node: ', $scope.selectedNode);
        $scope.selectedProposition.dialogueSide = true;

        temp = {};
      };


      /*
      var treeData = [
        {
          'name': 'A',
          'children': [
            {
              'name': 'B1',
              'children': [
                {
                  'name': 'C1',
                },
                {
                  'name': 'C2',
                }
              ]
            },
            {
              'name': 'B2',
            }
          ]

        }
      ];
      */

// ************** Generate the tree diagram  *****************

      $scope.initialize = function() {

        // var initialize = {};

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
        // .on('click', click);

        nodeEnter.append('circle')
          .attr('r', 1e-6)
          .style('fill', function(d) {
            return d._children ? 'rgb(30,135,193)' : 'rgb(30,135,193)';
          });

        // nodeEnter.append('text')
        //   .attr('x', function(d) { return d.children || d._children ? -13 : 13; })
        //   .attr('dy', '-3em')
        //   .attr('text-anchor', function(d) { return d.children || d._children ? 'end' : 'start'; })
        //   .text(function(d) { return d.topic; })
        //   .style('fill-opacity', 1)
        //   .style('fill', 'white')

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
        }, 50); // Need to wait for binding to update before scrolling :(
      };

      var updateDialogue = function(payload, callback) {
        if (payload.blanksParagraphForDeleter && payload.hidesOthersProp && $scope.userId === payload.deleter) {
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
          $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0].text = '- Paragraph deleted -';
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
        callback();
      };
    } // end mainLoop

  }



  angular.module('ndApp')
    .controller('EditorController', EditorController);

})();
