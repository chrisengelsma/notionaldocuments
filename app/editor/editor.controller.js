(function() {
  'use strict';

  EditorController.$inject = [
    '$log', '$state', '$rootScope', '$scope', 'chatSocket',
    'messageFormatter', 'focusFactory', 'Notification', '$document', '$timeout',
    'profileService', 'libraryService', 'propositions', 'apiService', 'IdFactory' ];

  function EditorController(
    $log, $state, $rootScope, $scope, chatSocket,
    messageFormatter, focusFactory, Notification, $document, $timeout,
    profileService, libraryService, propositions, apiService, IdFactory )
  {

    $scope.options = {
      highlightOwned: false,
      dimNotOwned: false
    };

    $scope.data = profileService.getSelectedBook();
    if ($scope.data === null) {
      $state.go('app.profile');
      return;
    }

    $scope.profile = profileService.getProfile();
    $scope.title = $scope.data[0].topic;
    $scope.userId = $rootScope.uid;

    $scope.propositions = propositions;

    if (!$scope.data[0].hasOwnProperty('dialogue')) {
      $scope.data[0].dialogue = [];
    }

    $scope.logout = function() {
      apiService.signOut().then(() => {
        profileService.clear();
        libraryService.clear();
        $state.go('login');
      });
    };

    $scope.goToProfile = function() {
      $state.go('app.profile');
    };


    $scope.openNav = function () {
      document.getElementById("myNav").style.height = "100%";
    };

    $scope.closeNav = function () {
      document.getElementById("myNav").style.height = "0%";
    };

    $scope.treeOptions = {};

    $scope.mousedOverProposition = {};

    $scope.mouseOver = function (proposition) {
      $scope.mousedOverProposition = proposition;
      $scope.mousedOverProposition.mouseOver = true;
    };

    $scope.mouseLeave = function (/*proposition*/) {
      $scope.mousedOverProposition = {};
    };

    $scope.clearSelectedProposition = function () {
      $scope.selectedProposition = null;
      $scope.selectedParagraph = null;
    };

    $scope.readBookLevel = function(address){
      angular.copy(address, $scope.copyOfAddress);


      $scope.compilationPath = $scope.buildNodePath(address);


      $scope.compilationTarget = eval($scope.compilationPath);

      $scope.bookBeingCompiled = $scope.bookBeingCompiled + $scope.compilationTarget.topic + "\r\n\r\n";
      console.log("Compilation Target Topic: ", $scope.compilationTarget.topic)
                       // if it has paragraphs
      for(var j = 0; j < $scope.compilationTarget.paragraphs.length; j++){                  // if it has propositions
        for(var k = 0; k < $scope.compilationTarget.paragraphs[j].propositions.length; k++){
          if($scope.compilationTarget.paragraphs[j].propositions[k].type !== "negation" && 
            $scope.compilationTarget.paragraphs[j].propositions[k][$scope.userId] !== "hidden"){
            $scope.bookBeingCompiled = $scope.bookBeingCompiled +  $scope.compilationTarget.paragraphs[j].propositions[k].text + ' '; 
          }
        }
        $scope.bookBeingCompiled = $scope.bookBeingCompiled + "\r\n";
      }
        
      address.push(0);
      
      $scope.compilationPath = $scope.buildNodePath(address);

      $scope.compilationCandidate = '$scope.data[0]';
      if (address === [0]){
        $scope.compilationCandidate = '$scope.data[0]';
      } else if (address === [1]){
        $scope.returnAddress = [1];
        return;
      } else {
          for(let i = 1; i < address.length-1; i++){
            $scope.compilationCandidate = $scope.compilationCandidate + '.children[' + address[i] + ']' 
          }
          $scope.compilationCandidate = $scope.compilationCandidate + '.children';
        }
      if (eval($scope.compilationCandidate)){
        if (eval($scope.compilationPath)){
        $scope.returnAddress = address;
        console.log("Found under the rug")
        console.log("Return address is ", $scope.returnAddress )

        return;
        
      } else {
        address.pop();
        address[address.length-1]++;
        $scope.compilationPath = $scope.buildNodePath(address);
        if(eval($scope.compilationPath)){
          console.log("Found in the next room")
          $scope.returnAddress = address;
          console.log("Return address is ", $scope.returnAddress )
          return;
        } else {
          address.pop();
          
            
            address[address.length-1]++;
            $scope.compilationPath = $scope.buildNodePath(address);
            if (eval($scope.compilationPath)){
              $scope.returnAddress = address;
              console.log("Found in a corner in the attic")
              console.log("Return address is ", $scope.returnAddress )
              return;
            } else {
              console.log('Didnt find')
              console.log("Return address is ", $scope.returnAddress )
              $scope.returnAddress = [0];
              return;
            }
          
        }
      }
      address = {};
      } else {

        address.pop();
        address[address.length-1]++;
        $scope.compilationPath = $scope.buildNodePath(address);
        if(eval($scope.compilationPath)){
          console.log("Found in the next room")
          $scope.returnAddress = address;
          console.log("Return address is ", $scope.returnAddress )
          return;
        } else {
          address.pop();
          
            
            address[address.length-1]++;
            console.log("Address trying to cash out:", address);
            if (address === [1]){
              $scope.returnAddress = [1];
              return;
              console.log("Hit the end");
              debugger;
            }
            $scope.compilationPath = $scope.buildNodePath(address);
            if (eval($scope.compilationPath)){
              $scope.returnAddress = address;
              console.log("Compilation Destination: ", eval($scope.compilationPath))
              console.log("Found in a corner in the attic")
              console.log("Return address is ", $scope.returnAddress )
              return;
            } else {
              console.log('Didnt find')
              console.log("Return address is ", $scope.returnAddress )
              $scope.returnAddress = [0];
              return;
            }
          
        }
      }

      
    }

    $scope.buildNodePath = function (location){
      $scope.compilationPath = '$scope.data[0]';
      if (location === [0]){
        return $scope.compilationPath;
      } else if (location === [1]){
        return '$scope.data[1]';
      } else{

        for(let i = 1; i < location.length; i++){
          $scope.compilationPath = $scope.compilationPath + '.children[' + location[i] + ']' 
        }

        return $scope.compilationPath;
      }
    }
    


    $scope.makeTextFile = function () {

      // Build the book into a text string

      $scope.bookBeingCompiled = '';

      $scope.readBookLevel([0]);

      if ($scope.returnAddress !== [0] || [1]){
        console.log("Return address: ", $scope.returnAddress)
        $scope.readBookLevel($scope.returnAddress);
      }

      if ($scope.returnAddress !== [0] || [1]){
        console.log("Return address: ", $scope.returnAddress)
        $scope.readBookLevel($scope.returnAddress);
      }

      if ($scope.returnAddress !== [0] || [1]){
        console.log("Return address: ", $scope.returnAddress)
        $scope.readBookLevel($scope.returnAddress);
      }

      var data = new Blob([$scope.bookBeingCompiled], {type: 'text/plain'});


      if ($scope.textFile !== null) {
        window.URL.revokeObjectURL($scope.textFile);
      }

      $scope.textFile = window.URL.createObjectURL(data);




      return $scope.textFile;
    }


    let create = document.getElementById('downloadlink');
    $scope.textFile = $scope.data[0];
    //works

    create.addEventListener('click', function () {
      var link = document.getElementById('downloadlink');
      link.href = $scope.makeTextFile();
      console.log("Link HREF: ", link.href)
    }, false);


    // var textFile = $scope.data[0];




    $scope.topics = [{}];
    $scope.scroll = {};
    $scope.keyword = {};



    $scope.messageLog = '';
    $scope.inputs = {};

    if (!$scope.data[0].paragraphs[0].propositions[0].author){
      $scope.selectedNode = $scope.data[0];
      $scope.selectedParagraph = $scope.data[0].paragraphs[0];
      $scope.selectedProposition = $scope.data[0].paragraphs[0].propositions[0];
      $scope.selectedProposition.textSide = true;
    }

    $scope.selectedThread = {};
    $scope.preselectedProposition = {};
    $scope.selectedRemark = {};
    $scope.of = {};
    let prep = {};
    let apply = {};
    let applyRemark = {};
    let notification = {};
    let temp = {};
    let type = {};
    $scope.highlight = {};
    $scope.mark = {};

    if ($scope.selectedProposition) {
      focusFactory($scope.selectedProposition.id);
    }


    $scope.selectNode = function (node) {

      $scope.selectedNode = node;

    };

    $scope.selectParagraph = function (paragraph) {

      $scope.selectedParagraph = paragraph;

      paragraph.cursor = false;
      if (paragraph.propositions.length === 1) {
        $scope.selectProposition($scope.selectedParagraph.propositions[0]);
      }
      let x = event.clientX;
      let y = event.clientY,
        elementMouseIsOver = document.elementFromPoint(x, y);

    };

    $scope.selectProposition = function (proposition) {
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

    $scope.clearPropositionInput = function () {
      $scope.inputs.proposition = '';
      $scope.highlight.id = '';
      console.log('Proposition input cleared');
    };

    $scope.highlightProposition = function (proposition) {
      if ($scope.highlight.id !== proposition.id) {
        $scope.highlight.id = proposition.id;
        $scope.highlight.highlit = true;
        console.log('highlit');
      }
    };

    $scope.markProposition = function (proposition) {
      $scope.mark.id = proposition.id;
      $scope.mark.marked = true;
      console.log('marked');
    };


    $scope.deleteProposition = function () {
      prep.address = $scope.selectedNode.address;
      prep.nodePath = '$scope.data';

      //make the nodes part of the address
      for (let i = 0; i < prep.address.length; i++) {
        if (i < prep.address.length - 1) {
          prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
        } else {
          prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
        }
      }

      // contingency for blanking when it's just negations left


      if ($scope.selectedParagraph.propositions.length === 1) {
        prep.blanksParagraph = true;
      } else {
        prep.blanksProposition = true;
      }


      prep.payload = {
        class:              $scope.selectedNode.class,
        topic:              $scope.selectedNode.topic,
        paragraphPosition:  $scope.selectedParagraph.position,
        address:            $scope.selectedNode.address,
        nodePath:           prep.nodePath,
        proposition:        $scope.selectedProposition,
        id:                 $scope.selectedProposition.id,
        blanksProposition:  (prep.blanksProposition ? prep.blanksProposition : undefined),
        blanksParagraph:    (prep.blanksParagraph ? prep.blanksParagraph : undefined),
        paragraphId:        $scope.selectedParagraph.paragraphId
      };

      console.log("Payload to be deleted: ", prep.payload);

      chatSocket.emit('deletion', $scope.userId, prep.payload);
      prep = {};

      apiService.updateBook($scope.profile.lastEditedBook, JSON.parse(angular.toJson($scope.data[0])));
      apiService.updatePropositions($scope.profile.lastEditedBook, JSON.parse(angular.toJson($scope.propositions)));
      profileService.setSelectedBook($scope.data[0]);
    };

    $scope.$on('socket:broadcastDeletion', function (event, payload) {
      apply.nodeDestination = eval(payload.nodePath);
      apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
      apply.paragraphDestination = eval(apply.paragraphPath);
      apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + '].propositions[' + payload.proposition.position.toString() + ']';
      apply.propositionDestination = eval(apply.propositionPath);


      if (payload.blanksParagraph) {
        console.log('blanks paragraph');
        apply.paragraphDestination[$scope.userId] = 'hidden';
        for (let i = payload.paragraphPosition; i < apply.nodeDestination.paragraphs.length-1; i++) {
          if ($scope.selectedProposition.id === payload.proposition.id && $scope.selectedParagraph.paragraphId === apply.nodeDestination.paragraphs[i].paragraphId){
            $scope.selectedParagraph = {};
            $scope.selectedProposition = {};                      // Deletions to ones being worked on just drop the discussion
            $scope.inputs.proposition = '';
          } else if (apply.nodeDestination.paragraphs[i].paragraphId === $scope.selectedParagraph.paragraphId){
            $scope.selectedParagraph = apply.nodeDestination.paragraphs[i];
            focusFactory(apply.nodeDestination.paragraphs[i].propositions[$scope.selectedProposition.position].id)        //If it moves the paragraph you are editing
            apply.propositionInputCopy = $scope.inputs.proposition;
            $scope.inputs.proposition = '';
            $scope.inputs.proposition = apply.propositionInputCopy;
          }

                      /*
            focus
            copy value                      // must be rewritten to hide the paragraph rather than deleting it
            blank input
            paste value
            */

        }
      }



      if (payload.blanksProposition) {
          apply.propositionDestination[$scope.userId] = 'hidden';
          console.log("Hid proposition: ", apply.propositionDestination);

          if ($scope.selectedProposition.id === payload.proposition.id && payload.proposition.author !== $scope.userId){
            $scope.selectedParagraph = {};
            $scope.selectedProposition = {};                      // Deletions to ones being worked on just drop the discussion
            $scope.inputs.proposition = '';
          } else if ($scope.selectedProposition.id === apply.propositionDestination.id){
            focusFactory(apply.paragraphDestination.propositions[$scope.selectedProposition.position].id);        //If it moves the proposition you are editing
            apply.propositionInputCopy = $scope.inputs.proposition;
            $scope.inputs.proposition = '';
            $scope.inputs.proposition = apply.propositionInputCopy;
          }
      }


      // for (let i = 0; i < $scope.propositions.length; i++) {
      //   if ($scope.propositions[i].id === payload.proposition.id) {
      //     $scope.propositions[i] = {
      //           id: 'Ngmyk1lP1KfffhSAw333',
      //           type: 'blank',
      //           author: '',
      //           text: '',                                            // Don't blank propositions in the propositions array
      //           position: 0,
      //           of: {},
      //           remarks: [],
      //           dialogueSide: false
      //         };
      //     break;
      //   }
      // }


            for (let i = 0; i < apply.paragraphDestination.propositions.length; i++) {
              if (apply.paragraphDestination.propositions[i].type === 'assertion' &&                                 //    FIND WHERE TEH ASSERTION IS NOW
                apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {           //    UPDATE ITS PATH
                apply.propositionPath = apply.paragraphPath + '.propositions[' + i.toString() + ']';
                apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;
                console.log('assertion path updated to ', apply.paragraphDestination.propositions[i].assertionPath)
              }
            }


            for (let i = 0; i < apply.paragraphDestination.propositions.length; i++) {
              if (apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {                   //    UPDATES THE ASSERTIONPATH FOR ALL THE PROPOSITIONS
                apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;                               //    IN THE PARAGRAPH AS APPROPRIATE
              }
            }

            for (let i = 0; i < $scope.propositions.length; i++) {
              if ($scope.propositions[i].assertionId === payload.proposition.assertionId) { // UPDATES THE ASSERTIONPATH FOR THE PROPOSITIONS
                $scope.propositions[i].assertionPath = apply.propositionPath;               // IN THE PROPOSITIONS ARRAY
              }
            }




      $scope.scroll.threadId = IdFactory.next();

      updateDialogue(payload, scrollMessagesToBottom);

      apply = {};
      notification = {};
      $scope.scroll = {};

      apiService.updateBook($scope.profile.lastEditedBook, JSON.parse(angular.toJson($scope.data[0])));
      apiService.updatePropositions($scope.profile.lastEditedBook, JSON.parse(angular.toJson($scope.propositions)));
      profileService.setSelectedBook($scope.data[0]);
    });

    $scope.getRemarkLocation = function (address, assertionId) {
      let temp = {};
      temp.location = eval(assertionPath);
      for (let i = 0; i < $scope.propositions.length; i++) {
        if ($scope.propositions[i].id === assertionId) {
          break;
        }
      }
    };


    $scope.prepProposition = function (input) {

      //    FILTER
      prep.firstChar = input.charAt(0);
      prep.lastChar = input.charAt(input.length - 1);

      if (!$scope.selectedNode.paragraphs || input.length === 0 ||                                               //IF SELECTED NODE DOESN'T HAVE PARAGRAPHS AND THERE'S NOTHING IN THE INPUT,
        ((prep.lastChar !== '.' && prep.lastChar !== '!' && prep.lastChar !== '?' && prep.lastChar !== ':') ||// OR LAST CHAR ISN'T A ! OR  . OR ? OR :
        (prep.lastChar === '!' && $scope.selectedProposition.author === $scope.userId))) {                   // OR ONE IS !ING THEIR OWN PROOSITION
        console.log('returning');
        $scope.inputs.proposition = '';                                                                            // SEND IT BACK
        return;
      }
      console.log('Last character: ', prep.lastChar);

      //   LASTCHAR SORT -            ?               :

      if (prep.lastChar === ':' || prep.lastChar === '?') {
        console.log("Where is passes: ", (prep.lastChar === '?' && input.substring(0, 8) == "Where is"));
        console.log("Who is passes: ", (prep.lastChar === '?' && input.substring(0, 6) == "Who is"));
        console.log("Who was passes: ", (prep.lastChar === '?' && input.substring(0, 7) == "Who was")); 
        if (prep.lastChar === ':') {                                  // CHOPS OFF COLON IN CASE OF A TOPIC
          prep.topic = input.substring(0, input.length - 1);
        }
        else if (prep.lastChar === '?' && input.substring(0, 8) == "Where is") {     // Where is... --> Location of...
          prep.topic = "Location of " + input.substring(8, input.length-1);
        } 
        else if (prep.lastChar === '?' && input.substring(0, 6) == "Who is"){
          prep.topic = "Who " + input.substring(6, input.length-1) + " is";
        } 
        else if (prep.lastChar === '?' && input.substring(0, 7) == "Who was"){
          prep.topic = "Who " + input.substring(7, input.length-1) + " was";
        } 
        else if (prep.lastChar === '?' && input.substring(0, 10) == "What makes"){
          prep.topic = input.substring(0, input.length-1);
        }else if (prep.lastChar === '?'){
            prep.topic = input;                                       // SETS PREP TOPIC TO THE QUESTION WITH PUNCTUATION
            prep.question = prep.topic;                               // COPIES IT AS A QUESTION TO PUT ON THE PREP OBJECT
        }

        prep.type = 'topic';
        prep.adjustedText = '';                                             //      GIVES CHARACTERISTICS OF A TOPIC
        prep.position = 0;                                                  // WILL BE IN FIRST PROPOSITION AND PARAGRAPH POSITION
        prep.paragraphPosition = 0;                                         // AND GET ITS OWN NODE
        prep.getsOwnNode = true;

        console.log('Selected Node: ', $scope.selectedNode)
        if (!$scope.selectedNode.children){
          prep.classBasis = 0;
        } else {
          prep.classBasis = $scope.selectedNode.children.length;
        }
                                       //      CALCULATE CLASS CODE
        prep.newClass = $scope.selectedNode.class;                                             //      FOR THE NEW CLASS
        if (prep.classBasis > 99) {
          prep.newClass = prep.newClass.toString() + prep.classBasis.toString();
        } else if (prep.classBasis > 9) {
          prep.newClass = prep.newClass.toString() + '.0' + prep.classBasis.toString();
        } else {
          prep.newClass = prep.newClass.toString() + '.00' + prep.classBasis.toString();
        }


        prep.oldNodePath = '$scope.data';                                                           //    BUILD PATH TO THE OLD NODE FROM ITS ADDRESS
        prep.address = angular.copy($scope.selectedNode.address);
        for (let i = 0; i < prep.address.length; i++) {
          if (i < prep.address.length - 1) {
            prep.oldNodePath = prep.oldNodePath + '[' + prep.address[i].toString() + '].children';
          } else {
            prep.oldNodePath = prep.oldNodePath + '[' + prep.address[i].toString() + ']';
          }
        }


        prep.nodePath = '$scope.data';                                                              //     ADD LAST COMPONENT OF THE ADDRESS FOR THE NEW NODE
        if (prep.type === 'topic' && !$scope.selectedNode.children) {
          prep.address.push(0)
        } else if (prep.type === 'topic') {
          prep.address.push($scope.selectedNode.children.length);
        }


        for (let i = 0; i < prep.address.length; i++) {                                              // BUILD PATH TO THE NEW NODE
          if (i < prep.address.length - 1) {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
          } else {
            prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
          }
        }

        if (!$scope.selectedProposition.text) {                                                          //   SWITCHING SELECTEDPROPOSITION TO THE BLANK TO COLLECT 'OF'
          $scope.selectedProposition = eval(prep.oldNodePath + '.paragraphs[0].propositions[0]');
        }


        prep.of = {
          id:     $scope.selectedProposition.id,                                            //   CALCULATING 'OF'
          type:   $scope.selectedProposition.type,
          author: $scope.selectedProposition.author,
          text:   $scope.selectedProposition.text,
        };


        console.log('Node position: ', prep.nodePath);
        console.log('Old node path: ', prep.oldNodePath);
        console.log('Question/Topic: ', prep.topic);                                              //   CONSOLE LOGS
        console.log('Destination: ', prep.newClass);
      }

      //     !

      if (prep.lastChar === '!') {                                  //    LASTCHAR SORT:      !

                                                                                                                              //  NEGATION
         console.log("Exclamation")                                                                                                                     
         console.log("Selected Proposition type assertion: ", $scope.selectedProposition.type === "assertion"," Rejoinder: ", $scope.selectedProposition.type === "rejoinder")                                                                                                                     
         console.log("Selected proposition author not userid: ",  $scope.selectedProposition.author !== $scope.userId)                                                                                                                     

        if (($scope.selectedProposition.type === 'assertion' || $scope.selectedProposition.type === 'rejoinder') &&
          $scope.selectedProposition.author !== $scope.userId) {                                                            //   IF THE USER HAS SELECTED AN ASSERTION OR REJOINDER NOT OF THE
          prep.topic = $scope.selectedNode.topic;                                                                  //   USER'S AUTHORING, IT'S A NEGATION
          prep.type = 'negation';
          prep.assertionId = $scope.selectedProposition.assertionId;
          prep.adjustedText = input.substring(0, input.length - 1) + '.';
          prep.paragraphPosition = $scope.selectedParagraph.position;
          for (let i = 0; i < $scope.selectedParagraph.propositions.length; i++) {
            if ($scope.selectedParagraph.propositions[i].id === $scope.selectedProposition.id){
              prep.preliminaryPosition = i;
              break;
            }
          }
          for (let i = prep.preliminaryPosition; i < $scope.selectedParagraph.propositions.length; i++){
            if ($scope.selectedParagraph.propositions[i+1] && $scope.selectedParagraph.propositions[i+1].type !== 'negation'){
                prep.position = i+1;
                prep.getsOwnProposition = true;
                console.log('gets own proposition');
                break;
            }
          }
          if (!prep.position) {
            prep.position = $scope.selectedParagraph.propositions.length;                                 //    IF THE NEGATION MUST BE PUT AT THE END OF THE PARAGRAPH
            prep.getsOwnProposition = true;
            console.log('gets own place');
          }

          prep.of = {
            id:     $scope.selectedProposition.id,
            type:   $scope.selectedProposition.type,
            author: $scope.selectedProposition.author,                                        //   CALCULATIONS FOR A NEGATION
            text:   $scope.selectedProposition.text,
          };
          prep.class = $scope.selectedNode.class;
          prep.nodePath = '$scope.data';
          prep.address = $scope.selectedNode.address;


          for (let i = 0; i < prep.address.length; i++) {                                          //     BUILDS THE ADDRESS TO THE NODE WHERE THE PROPOSITION GOES
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }

          prep.assertionPath = $scope.selectedProposition.assertionPath;                                   // CALCULATES PATH TO THE ASSERTION

          console.log("Selected proposition remark address: ", $scope.selectedProposition.remarkAddress)

          if ($scope.selectedProposition.remarkAddress) {      // only if it's a negation of a rejoinder
            let start = prep.assertionPath; // start with the path taking you to the assertion
            for (let i = 0; i < $scope.selectedProposition.remarkAddress.length; i++) { // calculate the path to the selectedProposition's remark location
              start = start + '.remarks[' + $scope.selectedProposition.remarkAddress[i].toString() + ']';
            }

            console.log("start calculated as: ", start)
            // start calculates the first index of the level to put it at, not the level itself

            console.log("Start calculated as: ", start)

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
            for (let i = 0; i < prep.remarkAddress.length; i++) { // calculate the path to the selectedProposition's remark location
              prep.remarkPath = prep.remarkPath + '.remarks[' + prep.remarkAddress[i].toString() + ']';
            }
          } else {
            let start = prep.assertionPath;
            prep.check = eval(start);
            if (prep.check.remarks){
              prep.remarkAddress = [prep.check.remarks.length];
              prep.remarkPath = prep.assertionPath + ".remarks[" + prep.check.remarks.length-1 + "]";
            } else {
            prep.remarkAddress = [0];                     //   otherwise it's a first negation
            prep.remarkPath = prep.assertionPath + '.remarks[0]';
            }
          }                                                                         // needs to be rewritten, assumes all non-rejoinder negations
                                                                                    // are first negations


          console.log('Path to assertion: ', prep.assertionPath);
          console.log('New remark address: ', prep.remarkAddress);              //    CONSOLE LOGS
          console.log('Node position: ', prep.nodePath);
          console.log('Question/Topic: ', prep.topic);
          console.log('Destination: ', prep.class);
        }


        if ($scope.selectedProposition.of &&                                                //   REJOINDER
            $scope.selectedProposition.of.author === $scope.userId &&
            $scope.selectedProposition.type === 'negation')
        {
          prep.topic = $scope.selectedNode.topic;
          prep.type = 'rejoinder';                              //    IF ITS AN EXCLAMATION AND THE SELECTED PROPOSITION IS A REMARK ON ONE'S OWN PROPOSITION
          console.log('exclamation rejoinder');                                                               //   IN THE FORM OF A NEGATION, IT'S A REJOINDER

          prep.adjustedText = input.substring(0, input.length - 1) + '.';
          prep.assertionId = $scope.selectedProposition.assertionId;
          prep.paragraphPosition = $scope.selectedParagraph.position;

          for (let i = 0; i < $scope.selectedParagraph.propositions.length; i++) {
            if ($scope.selectedParagraph.propositions[i].id === $scope.selectedProposition.id){
              prep.preliminaryPosition = i;
              break;
            }
          }
          for (let i = prep.preliminaryPosition; i < $scope.selectedParagraph.propositions.length; i++){
            if ($scope.selectedParagraph.propositions[i] && $scope.selectedParagraph.propositions[i].type !== 'negation'){
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

          for (let i = 0; i < prep.address.length; i++) {                                          //    FOLLOW THE SELECTEDPROPOSITION'S ADDRESS TO GET TO THE NODE
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }

          prep.assertionPath = $scope.selectedProposition.assertionPath;                    //  IT WILL HAVE THE SAME ASSERTION PATH AS SELECTEDPROPOSITION

          if ($scope.selectedProposition.remarkAddress.length > 0) {                       //      IF SELECTED PROPOSITION IS A NEGATION OF A REJOINDER
            let start = $scope.selectedProposition.assertionPath;                               // start with the path taking you to the assertion
            console.log("selected proposition remark address is: ", $scope.selectedProposition.remarkAddress);
            for (let i = 0; i < $scope.selectedProposition.remarkAddress.length; i++) {                    // calculate the path to the selectedProposition's remark location

              start = start + '.remarks[' + $scope.selectedProposition.remarkAddress[i].toString() + ']';
              console.log("start is now: ", start, " and i is now: ", i)
            }

            console.log("Calculated start value: ", start)


            prep.remarkAddress = angular.copy($scope.selectedProposition.remarkAddress);    //  the new remark address will be based on the selectedProposition's remark address array
            prep.check = eval(start);                                         //  check the selectedProposition's remark location
            start = '';
            if (prep.check.remarks.length > 0) {                              //  if the remark has remarks
              prep.remarkAddress.push(prep.check.remarks.length);             //  make a new index
              console.log("pushed onto last index of the remark address array array: ", prep.check.remarks.length)
            } else {
              prep.remarkAddress.push(0);                                     //  otherwise the index is 0
              console.log("pushed a 0 onto the last index of the remark address array");


              prep.remarkPath = prep.assertionPath;
              for (let i = 0; i < prep.remarkAddress.length; i++) {                            // calculate the path to the selectedProposition's remark location
                prep.remarkPath = prep.remarkPath + '.remarks[' + prep.remarkAddress[i].toString() + ']';
              }
            }
          } else {
            prep.remarkAddress = $scope.selectedProposition.remarkAddress;          // shouldn't trigger
            prep.remarkAddress.push(0);                                                     
            prep.remarkPath = prep.assertionPath + '.remarks[0]';
            console.log("just pushed a zero")
          }

        }
      }


      if (prep.lastChar === '.') {                                                                                        //        LASTCHAR - .




        if ($scope.selectedProposition.of &&
            $scope.selectedProposition.of.author === $scope.userId &&
            $scope.selectedProposition.type === 'negation' &&
            $scope.selectedProposition.cowsComeHome) {

        } else {

          if (prep.firstChar === '>' || prep.firstChar === '<') {

          } else {

            prep.topic = $scope.selectedNode.topic;
            prep.class = $scope.selectedNode.class;
            prep.type = 'assertion';                     //       OTHERWISE IT'S AN ASSERTION
            prep.adjustedText = input;
          }


          if ((($scope.selectedProposition.type == 'assertion' || $scope.selectedProposition.type == 'rejoinder') && $scope.userId !== $scope.selectedProposition.author) || ($scope.userId === $scope.selectedProposition.author && $scope.selectedProposition.type === 'negation')) {         //   IF NOT WORKING FROM A BLANK PROPOSITION
            prep.paragraphPosition = $scope.selectedParagraph.position + 1;                                               //   AND NOT WORKING WITH YOUR OWN PROPOSITION,
            prep.getsOwnParagraph = true;                                                                                 //   IT GETS ITS OWN PARAGRAPH
            prep.position = 0;            //for assertions in another's paragraph
            console.log('Assertion to another authors paragraph');
          } else if ($scope.selectedProposition.type === 'blank') {
            prep.paragraphPosition = $scope.selectedParagraph.position;                                                   //   OTHERWISE IF YOU'RE WORKING FROM A BLANK
            prep.position = $scope.selectedProposition.position;                                                          //   YOU'RE WORKING FROM A BLANK
            prep.replacesBlank = true;
            console.log('Starting paragraph from blank');
          } else if (!$scope.selectedParagraph.propositions) {                                                            //    OTHERWISE IF WORKING FROM A TOTALLY EMPTY PARAGRAPH
            prep.paragraphPosition = $scope.selectedNode.paragraphs.length - 1;                                             //    STARTS FROM BLANK (SHOULDN'T TRIGGER)
            prep.position = 0;
            prep.replacesBlank = true;
            console.log('Starting paragraph from blank');
          } else {
            console.log('Adding to existing paragraph');
            for (let i = $scope.selectedProposition.position; i < $scope.selectedParagraph.propositions.length; i++) {                 //     OTHERWISE ITS WITHIN AN EXISTING PARAGRAPH
              if ($scope.selectedParagraph.propositions[i + 1] &&
                  $scope.selectedParagraph.propositions[i + 1].type !== 'negation' &&
                  $scope.selectedParagraph.propositions[i + 1].hidden !== true)
              {
                prep.paragraphPosition = $scope.selectedParagraph.position;
                prep.position = i + 1;
                prep.getsOwnProposition = true;
                console.log('breaks out of function');
                break;
              }
            }
            if (!prep.position) {
              console.log('not prep position');
              prep.paragraphPosition = $scope.selectedParagraph.position;                //    IF NO POSITION HAS BEEN CALCULATED, GETS OWN PROPOSITION WITH POSITION ON THE END
              prep.position = $scope.selectedParagraph.propositions.length;
              prep.getsOwnProposition = true;
            }
          }


          prep.nodePath = '$scope.data';
          prep.address = $scope.selectedNode.address;

          for (let i = 0; i < prep.address.length; i++) {                                          //    CALCULATES PATH TO THE NODE
            if (i < prep.address.length - 1) {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + '].children';
            } else {
              prep.nodePath = prep.nodePath + '[' + prep.address[i].toString() + ']';
            }
          }

          prep.assertionPath = prep.nodePath + '.paragraphs[' + prep.paragraphPosition.toString() + '].propositions[' + prep.position.toString() + ']';    //   INITIAL ASSERTION PATH
          prep.assertionDestination = eval(prep.assertionPath);

          if (prep.assertionDestination) {
            $scope.selectedProposition = eval(prep.assertionPath);   //   SET SELECTEDPROPOSITION EQUAL TO THE PLACE IT IS BEING PUT
          }

          prep.of = {
            id:     $scope.selectedProposition.id,     //    THE OF WILL BE WHAT'S AT THE PLACE WHERE IT'S PUT
            type:   $scope.selectedProposition.type,
            author: $scope.selectedProposition.author,
            text:   $scope.selectedProposition.text,
          };

          $scope.selectedProposition = {};  //   THEN IT'S BLANKED



        }
      }


      console.log('Author: ', $scope.userId);
      console.log('Type: ', prep.type);                                                     //    CONSOLE LOGS
      console.log('Paragraph Position: ', prep.paragraphPosition);
      console.log('Position: ', prep.position);
      console.log('Text: ', prep.adjustedText);
      prep.payload = {
        topic:                  prep.topic,
        address:                prep.address,
        paragraphPosition:      prep.paragraphPosition,
        blankId:                IdFactory.next(),
        textSide:               $scope.selectedProposition.textSide,
        class:                ( prep.newClass                   ? prep.newClass           : prep.class ),
        nodePath:             ( prep.nodePath                   ? prep.nodePath           : undefined ),
        oldNodePath:          ( prep.oldNodePath                ? prep.oldNodePath        : undefined ),                          //    COMPOSITION OF THE PAYLOAD
        question:             ( prep.question                   ? prep.question           : undefined ),
        paragraphId:            IdFactory.next(),
        proposition: {
          id:                 IdFactory.next(),
          getsOwnNode:        (prep.getsOwnNode === true        ? prep.getsOwnNode        : undefined),
          getsOwnParagraph:   (prep.getsOwnParagraph === true   ? prep.getsOwnParagraph   : undefined),
          getsOwnPlace:       (prep.getsOwnPlace === true       ? prep.getsOwnPlace       : undefined),
          getsOwnProposition: (prep.getsOwnProposition === true ? prep.getsOwnProposition : undefined),
          replacesBlank:      (prep.replacesBlank === true      ? prep.replacesBlank      : undefined),
          assertionPath:      (prep.assertionPath               ? prep.assertionPath      : undefined),
          assertionId:        (prep.assertionId                 ? prep.assertionId        : undefined),
          remarkAddress:      (prep.remarkAddress               ? prep.remarkAddress      : undefined),
          remarkPath:         (prep.remarkPath                  ? prep.remarkPath         : undefined),
          isAntecedent:       (prep.isAntecedent                ? prep.isAntecedent       : undefined),
          isConsequent:       (prep.isConsequent                ? prep.isConsequent       : undefined),
          author:             $scope.userId,
          text:               prep.adjustedText,
          type:               prep.type,
          of:                 (prep.of ? prep.of : undefined),
          position:           prep.position,
          remarks:            []
        }
      };
      if (prep.payload.proposition.type === 'assertion') {
        prep.payload.proposition.assertionId = prep.payload.proposition.id;            //     DEFINES ASSERTIONID FOR NEW ASSERTIONS
      }




      $scope.inputs.proposition = '';
      $scope.inputs.chatProposition = '';                                             //      CLEARS THINGS AND EMITS THE PAYLOAD
      chatSocket.emit('proposition', $scope.userId, prep.payload);
      prep = {};


    };


    $scope.$on('socket:broadcastProposition', function (event, payload) {

      $timeout(function () {

        $scope.$apply(function () {                                                            //     APPLIES THINGS TO THE SCOPE

          if (payload.proposition.getsOwnNode) {                                                           // FOR NEW NODES COMING IN...
            apply.oldNodeDestination = eval(payload.oldNodePath);
            if (!apply.oldNodeDestination.children){
              apply.oldNodeDestination.children = [];
            }
            apply.oldNodeDestination.children.push({                                                   //      MAKES NEW NODE OBJECT
              class: payload.class,                                                      //     IT'S PUSHED TO THE CHILDREN OF THE OLD NODE DESTINATION
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

            if (payload.proposition.author === $scope.userId) {                                                       //IF IT WAS YOUR OWN PROPOSITION...
              $scope.selectedNode = apply.oldNodeDestination.children[apply.oldNodeDestination.children.length - 1];
              //     SELECTED NODE BECOMES LAST CHILD OF OLD NODE, WHICH SHOULD BE THE NEW NODE
              $scope.selectedParagraph = apply.oldNodeDestination.children[apply.oldNodeDestination.children.length - 1].paragraphs[0];
                //   THE SELECTED PARAGRAPH BECOMES THE FIRST PARAGRAPH OF THE NEW NODE
              $scope.selectedProposition = apply.oldNodeDestination.children[apply.oldNodeDestination.children.length - 1].paragraphs[0].propositions[0];
              //    SELECTEDPROPOSITION BECOMES THE NEW PARAGRAPH'S FIRST PROPOSITION
              if (payload.textSide === true) {
                $scope.selectedProposition.textSide = true;
              }
              focusFactory($scope.selectedProposition.id);
            }                                                                                               //   FOCUSES ON THAT BLANK
          }

          if (payload.proposition.getsOwnParagraph) {
            apply.nodeDestination = eval(payload.nodePath);
            if (apply.nodeDestination.paragraphs[payload.paragraphPosition]) {
              for (let i = apply.nodeDestination.paragraphs.length - 1; i > payload.paragraphPosition - 1; i--) {
                apply.nodeDestination.paragraphs[i].position++;                                                         //    MAKE ROOM FOR NEW PARAGRAPH AND FIX POSITIONS
                apply.nodeDestination.paragraphs[i + 1] = apply.nodeDestination.paragraphs[i];
                if ($scope.selectedParagraph.paragraphId ===  apply.nodeDestination.paragraphs[i].paragraphId){
                  $scope.selectedParagraph.position = apply.nodeDestination.paragraphs[i].position;
                }
              }
              apply.nodeDestination.paragraphs[payload.paragraphPosition] = {                                          //    DROP IN THE NEW PARAGRAPH
                paragraphId: payload.paragraphId,
                position: payload.paragraphPosition,
                propositions: [payload.proposition]
              };
            }
            if (payload.proposition.author === $scope.userId) {
              $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];
              if (payload.textSide === true) {
                $scope.selectedProposition.textSide = true;           //IF YOU AUTHORED THE PROPOSITION WITHIN THE DOCUMENT, SELECTED PROPOSITION IS WHERE
                                                                                    // IT WAS CALCULATED TO BE WHEN IT WAS EMITTED TO THE SERVER
              }
              focusFactory($scope.selectedProposition.id);                                                                                                   //    WILL FOCUS ON THE NEW PARAGRAPH
            }
          }

          if (payload.proposition.getsOwnPlace) {                                                      //    IF IT GETS A NEW PLACE IN THE PARAGRAPH, PUT IT THERE
            apply.nodeDestination = eval(payload.nodePath);                                             // SHOULDN'T TRIGGER
            apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position] = payload.proposition;
          }

          if (payload.proposition.replacesBlank) {
            apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
            apply.paragraphDestination = eval(apply.paragraphPath);                                                       //    IF IT REPLACES A BLANK, REPLACE THE BLANK
            apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;
            apply.nodeDestination = eval(payload.nodePath);
            apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position] = payload.proposition;
            apply.nodeDestination.paragraphs[payload.paragraphPosition + 1] =
              {
                paragraphId: payload.paragraphId,
                position: payload.paragraphPosition + 1,
                propositions: [
                  {                                                 //   PUT IN A NEW BLANK PARAGRAPH AFTER
                    id: payload.blankId,
                    type: 'blank',
                    text: '',
                    position: payload.proposition.position
                  }
                ]
              };
            if (apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position].id === $scope.selectedProposition.id){
              $scope.selectedParagraph = apply.nodeDestination.paragraphs[payload.paragraphPosition];
              $scope.selectedProposition  = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[0];
              focusFactory($scope.selectedProposition.id);
            }

            if (payload.proposition.author === $scope.userId) {
              $scope.selectedProposition = apply.nodeDestination.paragraphs[payload.paragraphPosition].propositions[payload.proposition.position];      //    FOCUS ON THE PROPOSITION ENTERED
              if (payload.textSide === true) {
                $scope.selectedProposition.textSide = true;
              }
              focusFactory($scope.selectedProposition.id);
            }
          }


          if (payload.proposition.getsOwnProposition) {
            // console.log('gets own proposition');                                        //     IF IT GETS ITS OWN PROPOSITION,
            apply.nodeDestination = eval(payload.nodePath);
            apply.paragraphPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']';
            apply.paragraphDestination = eval(apply.paragraphPath);
            apply.propositionPath = payload.nodePath + '.paragraphs[' + payload.paragraphPosition.toString() + ']' + '.propositions[' + payload.proposition.position.toString() + ']';
            apply.propositionDestination = eval(apply.propositionPath);

            if (apply.propositionDestination) {
              for (let i = apply.paragraphDestination.propositions.length - 1; i > payload.proposition.position - 1; i--) {
                apply.paragraphDestination.propositions[i].position++;                                                                                   //       MAKE ROOM FOR IT
                apply.paragraphDestination.propositions[i + 1] = apply.paragraphDestination.propositions[i];
              }
              apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;                    //    PUT IT IN ITS PLACE
              if (payload.proposition.author === $scope.userId && payload.textSide === true){
                $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id)
              }
            } else {
//              console.log('placing at end of paragraph');
              apply.paragraphDestination.propositions[payload.proposition.position] = payload.proposition;                  //    OR PUT IT AT THE END OF THE PARAGRAPH
              if (payload.proposition.author === $scope.userId && payload.textSide === true){
                $scope.selectedProposition = apply.paragraphDestination.propositions[payload.proposition.position];
                $scope.selectedProposition.textSide = true;
                focusFactory($scope.selectedProposition.id)
              }
            }
          }


          if (payload.proposition.type === 'rejoinder') {
            for (let i = 0; i < apply.paragraphDestination.propositions.length; i++) {
              if (payload.proposition.of.id === apply.paragraphDestination.propositions[i].id) {                     //   REJOINDERS SET NEGATIONS TO 'REJOINED' STATUS
                apply.paragraphDestination.propositions[i].rejoined = true;
                apply.paragraphDestination.propositions[i][$scope.userId] = 'hidden';
              }
            }
          }

          $scope.scroll.threadId = IdFactory.next();
//          console.log('Scroll threadId: ', $scope.scroll.threadId);


          //       DIALOGUE PRINTER



          if (payload.proposition.type === 'topic') {

            temp.oldNodePath = eval(payload.oldNodePath);
            apply.nodeDestination = eval(payload.nodePath);           //  TOPICS AND THE COMPOSITION OF THREADS

            $scope.data[0].dialogue.push({
              class:                temp.oldNodePath.class,
              topic:                temp.oldNodePath.topic,
              address:              payload.address,
              paragraphPosition:    payload.paragraphPosition,
              nodePath:           ( payload.nodePath    ? payload.nodePath    : undefined),  // MAKES THE NODE THE FIRST PART OF THE THREAD
              oldNodePath:        ( payload.oldNodePath ? payload.oldNodePath : undefined),
              question:           ( payload.question    ? payload.question    : undefined)
            });
            $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks = [];                        // MAKES A THREAD FROM A TOPIC
            $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0] = payload.proposition;
            $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0].text = apply.nodeDestination.topic;
            $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].threadId = $scope.scroll.threadId;

          } else if (payload.proposition.type === 'assertion') {        // assertions dont need remarks to be tacked on when they are created
            temp.assertionPath = payload.proposition.assertionPath;
            temp.assertionDestination = eval(payload.proposition.assertionPath);
            $scope.data[0].dialogue.push({
              class: payload.class,
              topic: payload.topic,
              address: payload.address,
              nodePath: (payload.nodePath ? payload.nodePath : undefined),
              oldNodePath: (payload.oldNodePath ? payload.oldNodePath : undefined),              //   MAKES A NEW THREAD WITH THE PROPOSITION AT THE BEGINNING
              paragraphPosition: payload.paragraphPosition,
              question: (payload.question ? payload.question : undefined),
              threadId: $scope.scroll.threadId,
              remarks: [payload.proposition]
            });

          } else { // theres a remarkPath

            temp.remarkAddress = payload.proposition.remarkAddress;
                                                                                       //    NOT A TOPIC OR ASSERTION, MUST BE NEGATION OR REJOINDER

            console.log("There's a remark path. Apply paragraph destination: ", apply.paragraphDestination)
            for (let i = 0; i < apply.paragraphDestination.propositions.length; i++) {
              if (apply.paragraphDestination.propositions[i].type === 'assertion' &&                                 //    FIND WHERE TEH ASSERTION IS NOW
                apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {           //    UPDATE ITS PATH
                apply.propositionPath = apply.paragraphPath + '.propositions[' + i.toString() + ']';
                apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;
                console.log('assertion path updated to ', apply.paragraphDestination.propositions[i].assertionPath)
              }
            }


            for (let i = 0; i < apply.paragraphDestination.propositions.length; i++) {
              if (apply.paragraphDestination.propositions[i].assertionId === payload.proposition.assertionId) {                   //    UPDATES THE ASSERTIONPATH FOR ALL THE PROPOSITIONS
                apply.paragraphDestination.propositions[i].assertionPath = apply.propositionPath;                               //    IN THE PARAGRAPH AS APPROPRIATE
              }
            }

            for (let i = 0; i < $scope.propositions.length; i++) {
              if ($scope.propositions[i].assertionId === payload.proposition.assertionId) { // UPDATES THE ASSERTIONPATH FOR THE PROPOSITIONS
                $scope.propositions[i].assertionPath = apply.propositionPath;               // IN THE PROPOSITIONS ARRAY
              }
            }

            temp.remarkPath = apply.propositionPath;          // the path to the assertion is the starting basis for the remark path
            temp.remarkDestination = eval(temp.remarkPath);

            console.log("Payload proposition remark address: ", payload.proposition.remarkAddress)


              console.log("Temp remark path before loop: ", temp.remarkPath)
              for (let i = 0; i < payload.proposition.remarkAddress.length-1; i++) {
                temp.remarkPath = temp.remarkPath + '.remarks[' + temp.remarkAddress[i].toString() + ']';   // navigate to the place to put the remark
              }

              console.log("Temp remark path after loop: ", temp.remarkPath)

              temp.remarkDestination = eval(temp.remarkPath);                                                                     
              if (temp.remarkDestination && temp.remarkDestination.remarks) {
                temp.remarkDestination.remarks[temp.remarkDestination.remarks.length] = payload.proposition;
              } else {
                console.log ("Remark destination: ", temp.remarkDestination)
                temp.remarkDestination.remarks;                                                                                                      //   OTHER POSSIBILITIES
                temp.remarkDestination.remarks = [];
                temp.remarkDestination.remarks[temp.remarkDestination.remarks.length] = payload.proposition;                                                              // If what's coming in is a first rejoinder
              }
            


            $scope.data[0].dialogue.push({
              class:                payload.class,
              topic:                payload.topic,
              address:              payload.address,
              paragraphPosition:    payload.paragraphPosition,
              nodePath:           ( payload.nodePath                ? payload.nodePath                : undefined),                          //   PUSH THE SUBSTANCE OF THE NODE TO THE DIALOGUE
              oldNodePath:        ( payload.oldNodePath             ? payload.oldNodePath             : undefined),
              question:           ( payload.question                ? payload.question                : undefined),
              assertionId:        ( payload.proposition.assertionId ? payload.proposition.assertionId : undefined),
              threadId:             $scope.scroll.threadId,
              remarks:              []
            });  // new thread topic is node topic

            temp.propositionPath = apply.propositionPath;

            temp.assertionDestination = eval(temp.propositionPath);
            $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[0] = temp.assertionDestination;  // new thread's first remark object is the assertion

            console.log('working with remark address: ', payload.proposition.remarkAddress);

            for (let i = 0; i < payload.proposition.remarkAddress.length; i++) {
              temp.propositionPath = temp.propositionPath + '.remarks[' + payload.proposition.remarkAddress[i].toString() + ']'; // calculate path to the parent remark for the new remark

              temp.propositionDestination = eval(temp.propositionPath);
               //     PUSH PROPOSITIONS TO THE THREAD ACCORDING TO THE ADDRESS
              $scope.data[0].dialogue[$scope.data[0].dialogue.length - 1].remarks[ i + 1] = temp.propositionDestination; // the last thread's last remark is where the loop is pointing
              
              // the last thread's last remark is where proposition destination is pointing

              console.log('pushed to thread: ', temp.propositionDestination);
            }


            // LOOP FOR HIDING THREADS
            // loop through threads
            // if assertionid matches payload assertionid and has one remark or assertionid matches payload assertionid, thread has more than one remark,
            // and last remark id matches second to last remark, hide the thread

            for (let i = 0; i < $scope.data[0].dialogue.length-1; i++){
                if ( $scope.data[0].dialogue[i].remarks[0].assertionId === payload.proposition.assertionId && $scope.data[0].dialogue[i].remarks.length > 1 &&
                     $scope.data[0].dialogue[i].remarks[$scope.data[0].dialogue[i].remarks.length-1].remarkAddress ===
                     $scope.data[0].dialogue[$scope.data[0].dialogue.length-1].remarks[$scope.data[0].dialogue[$scope.data[0].dialogue.length-1].remarks.length-2].remarkAddress){
                  $scope.data[0].dialogue[i].hidden = true;
                }
              
            }

          }

          $scope.inputs.remarkselected = false;

          if (payload.proposition.author === $scope.userId && $scope.selectedProposition.dialogueSide === true){
            $timeout(() => {
              let query = '#' + payload.proposition.id + $scope.scroll.threadId;
              console.log('focusing on ', query);
              $(query).expanding();
              $(query).focus();
            }, 0);
          }

          apply = {};
          applyRemark = {};   //     CLEARS THINGS
          notification = {};
          temp = {};

          $scope.scroll = {};

          $scope.propositions.push(payload.proposition);  // PUSHES THE PROPOSITION TO THE PROPOSITIONS ARRAY

          apiService.updateBook($scope.profile.lastEditedBook, JSON.parse(angular.toJson($scope.data[0])));
          apiService.updatePropositions($scope.profile.lastEditedBook, JSON.parse(angular.toJson($scope.propositions)));
          profileService.setSelectedBook($scope.data[0]);
        });
      }, 30);                                             // HAS A TIMEOUT



      $scope.initialize();

      scrollMessagesToBottom();

    });

    $scope.selectThread = (thread) => {
      $scope.selectedThread = thread;
    };

    $scope.selectPropositionById = function (id) {
      console.log('Selecting Proposition by Id');
      console.log('Id is: ', id)
      console.log('Propositions: ', $scope.propositions);
      for (let i = 0; i < $scope.propositions.length; i++) {
        if ($scope.propositions[i].id === id) {
          temp.assertionPath = $scope.propositions[i].assertionPath;
          break;
        }
      }
      console.log('Assertion path: ', temp.assertionPath);
      $scope.mark = {};
      $scope.highlight = {};
      console.log("Has own property assertion path: ", temp.hasOwnProperty('assertionPath'));
      console.log("Assertion path not undefined: ", temp.assertionPath !== undefined)
      if (temp.hasOwnProperty('assertionPath') && temp.assertionPath !== undefined) {
        temp.sliceStartingAt = temp.assertionPath.indexOf('.propositions');
        temp.paragraphPath = temp.assertionPath.slice(0, temp.sliceStartingAt);
        temp.paragraphDestination = eval(temp.paragraphPath);

        $scope.selectedParagraph = temp.paragraphDestination;
        for (let i = 0; i < temp.paragraphDestination.propositions.length; i++) {
          if (temp.paragraphDestination.propositions[i].id === id) {
            console.log('Id found in paragraph: ', temp.paragraphDestination.propositions[i].id);
            console.log('Selected Proposition: ', $scope.selectedProposition)
            if ($scope.selectedProposition){
              $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId).expanding('destroy');
            } else {
            $scope.selectedProposition = temp.paragraphDestination.propositions[i];
            console.log('Selected Proposition: ', $scope.selectedProposition);
            }
            console.log('Id found in paragraph: ', temp.paragraphDestination.propositions[i].id);

            $scope.selectedProposition = temp.paragraphDestination.propositions[i];
            console.log("Selected Proposition now: ", $scope.selectedProposition)
            $scope.selectedProposition.dialogueSide = true;
              //get the remark to satisfy the ng-if so the form appears
            break;
          }
        }

      }

      console.log('selected Proposition:', $scope.selectedProposition);

      console.log('trying to focus on chatinput');
      setTimeout(() => {

        let destination = document.getElementById($scope.selectedProposition.id);
        if (destination) {
          destination.scrollIntoView({ behavior: 'smooth' });
        }
        let query = '#' + $scope.selectedProposition.id + $scope.selectedThread.threadId;
        console.log(query);
        $(query).expanding();
        $(query).focus();
      }, 0);
      temp = {};
    };

    $scope.clearExpandingClass = function (/*id*/) {

      console.log('trying to hide ', '#' + $scope.selectedProposition.id + $scope.selectedThread.threadId);
      $('#' + $scope.selectedProposition.id + $scope.selectedThread.threadId).parent().hide();

    };


    $scope.selectNodeByClass = (thread) => {
      temp.nodeDestination = eval(thread.nodePath);
      $scope.selectedNode = temp.nodeDestination;
      console.log('selected node: ', $scope.selectedNode);
      $scope.selectedProposition.dialogueSide = true;

      temp = {};
    };


    let treeData = [
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

// ************** Generate the tree diagram  *****************

    $scope.initialize = function () {

      let initialize = {};

      let margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 1200 - margin.right - margin.left,
        height = 550 - margin.top - margin.bottom;

      let i = 0,
        duration = 750;

      /*
       * [CE] d3.layout.tree() is now d3.tree() (d3 v4+)
       *
       * Removed:
       * let tree = d3.layout.tree()
       */
      let tree = d3.tree()
        .size([height, width]);

      /*
       * [CE] d3.svg.diagonal permanently removed (d3 v4+)
       * This is Mike Bostok's recommended replacement.
       *
       * Removed:
       * let diagonal = d3.svg.diagonal()
       *   .projection(function(d) { return [d.y, d.x]; });
      */
      function diagonal(d) {
        return 'M' + d.source.y + ',' + d.source.x +
          'C' + (d.source.y + d.target.y) / 2 + ',' + d.source.x +
          ' ' + (d.source.y + d.target.y) / 2 + ',' + d.target.x +
          ' ' + d.target.y + ',' + d.target.x;
      }

      d3.select('svg').remove();

      let svg = d3.select('.modal-body').append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      let root = {};
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
       * let nodes = tree.nodes(root).reverse(),
       */
      root.children = null;
      root = d3.hierarchy(root);
      let nodes = tree(root),
        links = root.links();


      // Normalize for fixed-depth.
      nodes.each(function (d) {
        d.y = d.depth * 90;
      });

      // Update the nodes…
      let node = svg.selectAll('g.node')
        .data(nodes, function (d) {
          return d.id || (d.id = ++i);
        });

      // Enter any new nodes at the parent's previous position.
      let nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
          return 'translate(' + root.y0 + ',' + root.x0 + ')';
        })
      // .on('click', click);

      nodeEnter.append('circle')
        .attr('r', 1e-6)
        .style('fill', function (d) {
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
        .text(function (d) {
          return d.topic;
        });

      // Transition nodes to their new position.
      let nodeUpdate = node.transition()
        .duration(duration)
        .attr('transform', function (d) {
          return 'translate(' + d.y + ',' + d.x + ')';
        });

      nodeUpdate.select('circle')
        .attr('r', 22)
        .style('fill', function (d) {
          return d._children ? 'lightsteelblue' : '#fff';
        });

      nodeUpdate.select('text')
        .style('color', 'rgb(255,255,255) !important')

      // Transition exiting nodes to the parent's new position.
      let nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', function (d) {
          return 'translate(' + root.y + ',' + root.x + ')';
        })
        .remove();

      nodeExit.select('circle')
        .attr('r', 22);

      nodeExit.select('text')
        .style('color', 'white');

      // Update the links…
      let link = svg.selectAll('path.link')
        .data(links, function (d) {
          return d.target.id;
        });

      // Enter any new links at the parent's previous position.
      link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function (d) {
          let o = {x: root.x0, y: root.y0};
          return diagonal({source: o, target: o});
        });

      // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr('d', diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr('d', function (d) {
          let o = {x: root.x, y: root.y};
          return diagonal({root: o, target: o});
        })
        .remove();

      // Stash the old positions for transition.
      nodes.each(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

    };

    function scrollMessagesToBottom() {
      $timeout(() => {
        let pane = document.getElementById('dialoguelist');
        pane.scrollTop = pane.scrollHeight;
      }, 100); // Need to wait for binding to update before scrolling :(
    }

    function updateDialogue(payload, callback) {
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

      callback();
    }
  }


  angular.module('notionalApp')
    .controller('EditorController', EditorController);

})();
