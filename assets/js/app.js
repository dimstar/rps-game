var database = firebase.database();

var RPS = {
    init: function(){
        
        RPS.foldUp();
    },
    playHand: function(  ){

    },
    playersLocal: {
        player0: false,
        player1: false
    },
    makePlayer: function( playerName ){
        // Set player key, either playerA or playerB
        var newPlayerKey = ( !this.playersLocal.player0 ) ? 'player0' : ( !this.playersLocal.player1 )  ?  'player1' : false ;
        this.playersLocal[newPlayerKey] = true;

        if(newPlayerKey){
            firebase.database().ref('players/' + newPlayerKey).set({
                name: playerName
              });
        }else{
            RPS.alertUi(`Sorry ${playerName} too many players!`);
        }
    },
    foldUp: function(){
        $( ".rps-control" ).slideToggle( "slow", function() {
            // Animation complete.
          });
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
    }
}

RPS.init();

/** EVENTS */

$('#addPlayer').on('click', function(){
    var name = $('#playerNameInput');
    RPS.makePlayer(name.val());
    name.val('');
});