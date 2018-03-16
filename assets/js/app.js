var database = firebase.database();

var RPS = {
    init: function(){

    },
    submitChoice: function(  ){

    },
    createPlayer: function( playerName ){

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
    }
}

RPS.init();

/** EVENTS */
