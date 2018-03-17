var database = firebase.database();

var RPS = {
    init: function(){
        
        RPS.foldUp();

        /** EVENTS */
        RPS.disconnectPlayer();

        $('#addPlayer').on('click', function(){
            var name = $('#playerNameInput');
            RPS.makePlayer(name.val());
            name.val('');
        });

        var rpsPlayers = firebase.database().ref('players');
        rpsPlayers.on('value', function(snapshot) {
        console.log(snapshot.val());
        RPS.setPlayersLocal(snapshot.val());
        RPS.startRound();
        });
    },
    playHand: function(  ){

    },
    playersLocal: {
        player0: false,
        player1: false
    },
    currentPlayer: false,
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
        localStorage.setItem(playerKey, playerName);
    },
    getCurrentPlayer: function(){
        RPS.loopObect(RPS.playersLocal, RPS.returnStorage);
    },
    returnStorage: function(key){
        var myName = localStorage.getItem(key);
        if(myName) RPS.currentPlayer = key;
    },
    makePlayer: function( playerName ){
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
        $( ".rps-control" ).slideToggle( "slow", function() {});
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
        RPS.loopObect(RPS.playersLocal, RPS.bindControls);
        
        // bind events for clicking
        $('.rps-control li').on('click', function(){
            console.log('choice: ' + $(this).attr('data-choice') + ', player: ' + $(this).attr('data-player'));
        });
    },
    setPlayersLocal: function(snapshotVal){
        RPS.loopObect(snapshotVal, false, RPS.setPlayer);
    },
    loopObect: function(theObject, callOnKey = false, callOnBoth = false, callOnElement = false){
        // Do crazy stuff :)
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
    },
    startRound: function(){
        
    }
}

RPS.init();


