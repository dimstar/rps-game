var database = firebase.database();

var RPS = {
    playersLocal: {
        player0: false,
        player1: false
    },
    currentRound: 0,
    currentPlayer: false,
    currentPlayerChoice: false,
    whosTurn: false,
    currentOpponent: false,
    init: function(){
        
        RPS.foldUp();
        RPS.setupInputs();
        RPS.disconnectPlayer();

        var rpsPlayers = firebase.database().ref('players');
        // var rpsPlayerExists = firebase.database().ref(`players/${RPS.currentPlayer}`);
        var rpsTurn = firebase.database().ref('turn');
        firebase.database().ref('turns').set(RPS.currentRound);

        /** EVENTS */
        // When user clicks add player button
        $('#addPlayer').on('click', function(){
            var name = $('#playerNameInput');
            RPS.makePlayer(name.val());
            name.val('');
        });

        // when a players state changes firebase...
        rpsPlayers.on('value', function(snapshot) {
            console.log('rpsPlayers Output...');
            console.log(snapshot.val());
            RPS.setPlayersLocal( snapshot.val());
            // RPS.setLocalChoice(snapshot.val() );
            RPS.startRound( snapshot.val() );
        });

        // when the current player exists in firebase
        // rpsPlayerExists.on('value', function(snapshot){
        //     console.log('rpsPlayerExists Output...')
        //     console.log(snapshot.val());
        //     RPS.playerTurnStart( snapshot.val() );
        // });

        rpsTurn.on('value', function(snapshot) {
            console.log( 'rpsTurn Output...' );
            console.log( snapshot.val() );
            // RPS.endRound( snapshot.val() );
            RPS.startRound( snapshot.val() );
        });
    },
    disconnectPlayer: function(){
        // set the current player first, we just refreshed.
        this.getCurrentPlayer();
        // destroy the player
        firebase.database().ref('players/' + RPS.currentPlayer).remove();
        
        // kill the local storage and the rest
        if(RPS.currentPlayer){
            localStorage.removeItem(RPS.currentPlayer);
            RPS.currentPlayer = false;
            // send disconnect message
        }
    },
    setCurrentPlayer: function( playerKey, playerName){
        var playerMssg = $('<div>').attr('class', 'alert alert-success');
        playerMssg.text(`Hi ${playerName}, you're ${playerKey}`);
        $('#playerMssg').append(playerMssg);
        RPS.currentPlayer = playerKey;
        console.log('Current Player ' + RPS.currentPlayer);
        localStorage.setItem(playerKey, playerName);
    },
    getCurrentPlayer: function(){
        RPS.loopObject(RPS.playersLocal, RPS.returnStorage);
    },
    setCurrentOpponent: function(playerKey){
        // bail if we already have him.
        if(RPS.currentOpponent) return false;
        // copy the local players object
        var whoIsOpponent = RPS.playersLocal;
        // remove the current player
        delete whoIsOpponent.playerKey;
        // whoever is left is the opponenet
        RPS.currentOpponent = RPS.loopObject(whoIsOpponent, RPS.getCurrentOpponent);
    },
    getCurrentOpponent: function(key){
        return key;
    },
    returnStorage: function(key){
        var myName = localStorage.getItem(key);
        if(myName) RPS.currentPlayer = key;
    },
    makePlayer: function( playerName ){
        // debugger;
        // Set player key, either playerA or playerB
        var newPlayerKey = ( !this.playersLocal.player0 ) ? 'player0' : ( !this.playersLocal.player1 )  ?  'player1' : false ;
        this.playersLocal[newPlayerKey] = true;

        if(newPlayerKey){
            firebase.database().ref('players/' + newPlayerKey).set({
                name: playerName
              });
              // set the current player
              RPS.setCurrentPlayer(newPlayerKey, playerName);
        }else{
            RPS.alertUi(`Sorry ${playerName} too many players!`);
        }
    },
    foldUp: function(){
        $( ".rps-control" ).slideUp( "slow", function() {});
    },
    checkRndWinner: function( playerA, playerB){
        var rndWinner = '';
        if(playerA === playerB){
            // tie
            console.log("this is a tie");
            rndWinner = false;
            
        }else if (playerA === "r"){
            if(playerB === "p"){
                console.log("playerB wins");
                rndWinner = 'playerB';
            }else{
                console.log("playerA wins");
                rndWinner = 'playerA';
            }
        }else if(playerA === "p"){
            if(playerB === "r"){
                console.log("playerA wins");
                rndWinner = 'palyerA';
            }else{
                console.log("playerB wins");
                rndWinner = 'playerB';
            }
        }else{
            if(playerB == "r"){
                console.log("playerB wins");
                rndWinner = 'playerB';
            }else{
                console.log("playerA wins");
                rndWinner = 'playerA';
            }
        }

        return rndWinner;
    },
    alertUi: function(mssg){
        var alertWrapper = $('<div>').attr('class', 'alert alert-warning');
        alertWrapper.text(mssg);
        $('#alertMssg').append(alertWrapper);
        // kill alert
        setTimeout(function(){ 
            $('#alertMssg').children('div').remove();
         }, 3000);
    },
    setupInputs: function(){
        RPS.loopObject(RPS.playersLocal, RPS.bindControls);
        
        // bind events for clicking
        $('.rps-control li').on('click', function(){
            console.log('choice: ' + $(this).attr('data-choice') + ', player: ' + $(this).attr('data-player'));
            RPS.playHand( $(this) );
        });
    },
    setPlayersLocal: function( snapshotVal){
        RPS.loopObject(snapshotVal, false, RPS.setPlayer);
        
    },
    loopObject: function(theObject, callOnKey = false, callOnBoth = false, callOnElement = false){
        // Do crazy stuff :)
        // this really should be 
        for (var aKey in theObject) {
            if (theObject.hasOwnProperty(aKey)) {
                var element = theObject[aKey];
                if(callOnKey) callOnKey(aKey);
                if(callOnBoth) callOnBoth(aKey, element);
                if(callOnElement) callOnElement(element);
            }
        }
    },
    bindControls: function(playerKey){
        $('#' + playerKey).find('.rps-control li').each(function(){
            $(this).attr({
                'data-player': playerKey,
                'data-choice': $(this).text().toLowerCase()
            });
        });
    },
    setPlayer: function(playerKey, playerValues){
        $('#' + playerKey + ' .card-header').html(playerValues.name);
        RPS.playersLocal[playerKey] = true;
        // RPS.startRound();
    },
    startRound: function(snapshotVal){
        if(RPS.playersLocal.player0 && RPS.playersLocal.player1){
            RPS.setCurrentOpponent( RPS.currentPlayer );
            console.log('RPS.startRound() begin');
            RPS.playerTurnStart(snapshotVal);
            // @todo
        }
    },
    playerTurnStart: function(snapshotVal){
        // debugger;
        // check if we have what we need, if not BAIL!!!
        if(snapshotVal === null) return false;

        // default player0, this should be dynamic
        var whosTurn = RPS.currentPlayer;

        // check if you're the curent player
        if(RPS.currentPlayer === whosTurn){
            $( "#" + whosTurn + " .rps-control" ).slideToggle( "slow", function() {});
        }

    },
    getWhosTurn: function (){
        if( this.currentPlayer === this.whosTurn ){
            this.whosTurn === this.currentOpponent;
        }else{
            this.whosTurn === this.currentPlayer;
        }
    },
    playHand: function( $this){
        var playerKey = $this.attr('data-player');
        var inputChoice = $this.attr('data-choice');
        // set the firebase
        firebase.database().ref('players/' + playerKey ).update({choice: inputChoice});
        RPS.currentPlayerChoice = inputChoice;
        // var nextPlayer = (playerKey !== 'player0') ? 'player0' : 'player1';
    },
    endRound: function(){
        RPS.currentRound++;
        firebase.database().ref('turns').set(RPS.currentRound);
    }
    
}

RPS.init();


