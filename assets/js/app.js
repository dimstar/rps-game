var database = firebase.database();

var RPS = {
    playersLocal: {
        player0: false,
        player1: false
    },
    currentRound: 0,
    currentPlayer: false,
    whosTurn: false,
    currentOpponent: false,
    roundResult: {
        winner: false,
        loser: false
    },
    playersLocalObj: {},
    init: function(){
        
        RPS.foldUp();
        RPS.setupInputs();
        RPS.disconnectPlayer();

        var rpsPlayers = firebase.database().ref('players');
        // var rpsPlayerExists = firebase.database().ref(`players/${RPS.currentPlayer}`);
        var rpsTurn = firebase.database().ref('gamestate');
        // firebase.database().ref('turns').set(RPS.currentRound);

        /** EVENTS */
        // When user clicks add player button
        $('#addPlayer').on('click', function(){
            var name = $('#playerNameInput');
            RPS.makePlayer(name.val());
            name.val('');
        });

        // when a players state changes firebase...
        rpsPlayers.on('value', function(snapshot) {
            RPS.playersLocalObj = snapshot.val();
            console.log('rpsPlayers Output...');
            // console.log(RPS.playersLocalObj);
            RPS.setPlayersLocal( RPS.playersLocalObj );
            // RPS.setLocalChoice(snapshot.val() );
            RPS.startRound( RPS.playersLocalObj );
        });

        rpsTurn.on('child_changed', function(snapshot) {
            console.log( 'rpsTurn Output...' );
            console.log( snapshot.val() );
            // RPS.checkRoundWinner( snapshot.val() );
            // RPS.startRound( snapshot.val() );
        });

        rpsTurn.on('child_removed', function(snapshot){
            // destroy the players
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
        // debugger;
        // bail if we already have him.
        if(RPS.currentOpponent) return;
        // copy the local players object
        var whoIsOpponent = RPS.playersLocal;
        // remove the current player
        delete whoIsOpponent[playerKey];
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
        // Set player key, either playerA or player1
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
    checkRoundWinner: function( playerA, playerB){
        var rndWinner = '';
        if(playerA === playerB){
            // tie
            console.log("this is a tie");
            // no winner/loser
        }else if (playerA === "r"){
            if(playerB === "p"){
                console.log("player1 wins");
                RPS.roundResult.winner = 'player1';
                RPS.roundResult.loser = 'player0';
            }else{
                console.log("player0 wins");
                rndWinner = 'player0';
                RPS.roundResult.winner = 'player0';
                RPS.roundResult.loser = 'player1';
            }
        }else if(playerA === "p"){
            if(playerB === "r"){
                console.log("player0 wins");
                rndWinner = 'player0';
                RPS.roundResult.winner = 'player0';
                RPS.roundResult.loser = 'player1';
            }else{
                console.log("player1 wins");
                rndWinner = 'player1';
                RPS.roundResult.winner = 'player1';
                RPS.roundResult.loser = 'player0';
            }
        }else{
            if(playerB == "r"){
                console.log("player1 wins");
                rndWinner = 'player1';
                RPS.roundResult.winner = 'player1';
                RPS.roundResult.loser = 'player0';
            }else{
                console.log("player0 wins");
                rndWinner = 'player0';
                RPS.roundResult.winner = 'player1';
                RPS.roundResult.loser = 'player0';
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
    startRound: function(players){
        // set whos turn it is

        $.each(RPS.playersLocalObj, function( playerKey, propVals){
            console.log(RPS.playersLocalObj[playerKey]);
            console.log(RPS.playersLocalObj[playerKey].choice);
        });

        if(RPS.playersLocal.player0 && RPS.playersLocal.player1){
            // who is your opponenet?
            RPS.setCurrentOpponent( RPS.currentPlayer );
            RPS.getWhosTurn();

            console.log('RPS.startRound() calling RPS.playerTurnStart()');
            // otherwise, start the turns!
            RPS.playerTurnStart(players);
        
        }

        
    },
    playerTurnStart: function(snapshotVal){
        // debugger;
        // check if we have what we need, if not BAIL!!!
        if(snapshotVal === null) return false;

        // default player0, this should be dynamic
        // var whosTurn = RPS.currentPlayer;

        // check if you're the curent player
        if(RPS.currentPlayer === RPS.whosTurn){
            $( "#" + RPS.whosTurn + " .rps-control" ).slideToggle( "slow", function() {});
        }

    },
    getWhosTurn: function (){
        if( RPS.currentPlayer === RPS.whosTurn ){
            RPS.whosTurn = RPS.currentOpponent;
        }else{
            RPS.whosTurn = RPS.currentPlayer;
        }
    },
    playHand: function( $this){
        var playerKey = $this.attr('data-player');
        var inputChoice = $this.attr('data-choice');
        // set the firebase
        // RPS.playerChoicesLocal[playerKey] = inputChoice;
        firebase.database().ref('players/' + playerKey ).update({choice: inputChoice});
        // Check if we're on the laster player in the turn
        RPS.foldUp();
    },
    endRound: function(){
        // advance the round
        RPS.currentRound++;

        database.ref('/players').once('value').then(function(snapshot){
            var players = snapshot.val();
            // transforms the turnResults
            RPS.checkRoundWinner(players.player0.choice, players.player1.choice);
            if( players.player0.wins || players.player1.wins ){
                firebase.database().ref('players/' + RPS.roundResult.winner ).update({ 
                    wins: players[RPS.roundResult.winner].wins++
                });
                firebase.database().ref('players/' + RPS.roundResult.loser ).update({ 
                    losses: players[RPS.roundResult.loser].losses++
                });
            }
        });
        firebase.database().ref('gamestate/turns').set(RPS.currentRound);
        RPS.roundResult.winner = false;
        RPS.roundResult.loser = false;
    }
    
}

RPS.init();


