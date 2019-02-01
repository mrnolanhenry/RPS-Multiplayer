$(document).ready(function () {

    let choices = ['r', 'p', 's'];
    let choicesLong = ['rock', 'paper', 'scissors'];

    let images = {
        left: ['assets/images/rps-r-left-210.png', 'assets/images/rps-p-left-210.png', 'assets/images/rps-s-left-210.png'],
        right: ['assets/images/rps-r-right-210.png', 'assets/images/rps-p-right-210.png', 'assets/images/rps-s-right-210.png']
    }

    let score = {
        player1Wins: 0,
        player2Wins: 0,
        ties: 0
    }

    let player1 = {
        name: 'Player 1',
        id: 'player1',
        currentChoice: null,
        currentChoiceLong: null,
        currentIndex: null,
        currentImg: null
    }

    let player2 = {
        name: 'Player 2',
        id: 'player2',
        currentChoice: null,
        currentChoiceLong: null,
        currentIndex: null,
        currentImg: null
    }

    let players = [player1, player2]
    let numCheckedIn = 0;
    let newRound = false;

    var config = {
        apiKey: "AIzaSyBagC44uS0SlZXznaRgFHHgGmooXxsQzPs",
        authDomain: "rps-multiplayer-c4da2.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-c4da2.firebaseio.com",
        projectId: "rps-multiplayer-c4da2",
        storageBucket: "rps-multiplayer-c4da2.appspot.com",
        messagingSenderId: "829850759826"
    };
    firebase.initializeApp(config);

    let database = firebase.database();
    let connectionsRef = database.ref('/connections');
    let playersRef = database.ref('/players');
    var checkInRef = database.ref('/checkedIn')
    var isConnectedRef = database.ref(".info/connected");
    let newRoundRef = database.ref('/newRound');


    checkInRef.onDisconnect().remove();
    playersRef.onDisconnect().remove();
    newRoundRef.onDisconnect().remove();

    $('#wait-message').hide();
    $('.player-input-form').hide();
    $('.row-hands').hide();
    $('.nextRoundBtn').hide();

    isConnectedRef.on('value',
        function (snapshot) {
            if (snapshot.val()) {
                var thoseConnected = connectionsRef.push(true);
                thoseConnected.onDisconnect().remove();
            }
        })

    // Number of online users is the number of objects in the presence list.
    // When first loaded or when the connections list changes...
    connectionsRef.on("value", function (snapshot) {
        // The number of online users is the number of children in the connections list.
        $('.players-online').html(snapshot.numChildren() + ' players online');
    });


    playersRef.on("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {

            let currentPlayer = identifyPlayer(childSnapshot.val().id);
            currentPlayer.name = childSnapshot.val().name;
            currentPlayer.id = childSnapshot.val().id;
            currentPlayer.currentChoice = childSnapshot.val().currentChoice;
            currentPlayer.currentIndex = childSnapshot.val().currentIndex;
            currentPlayer.currentChoiceLong = childSnapshot.val().currentChoiceLong;
        });

        if (isRoundComplete()) {
            $('#wait-message').hide();
            $('.row-hands').show();
            if (areInputsValid()) {
                displayHands();
                determineWinner();
                updateScoreboard();
            }
            $('.player-input-form').hide();
            $('.nextRoundBtn').show();
        }


        // clear input entered
        $('.player-input-form').find('.player-input').val('');

    });

    database.ref('/checkedIn/checkIns').on("value", function (snapshot) {
        numCheckedIn = snapshot.val();
    });

    database.ref('/newRound/newRound').on("value", function (snapshot) {
        newRound = snapshot.val();
        if (newRound) {
            resetPlayerChoices();
            consoleLogPlayerData();
            $('.row-hands').hide();
            $('.player-input-form').show();
            $('.nextRoundBtn').hide();
        }
        newRound = false;
        newRoundRef.set({
            newRound: newRound
        })
    });

    $(document).on('click', '.nextRoundBtn', function () {
        newRound = true;
        newRoundRef.set({
            newRound: newRound
        })
    });

    $(document).on('click', '.checkInBtn', function () {
        event.preventDefault();
        numCheckedIn++;
        checkInRef.set({
            checkIns: numCheckedIn
        })

        let playerName = $('.name-input-form').find('.name-input').val();

        if (numCheckedIn === 1) {
            var currentPlayer = player1;
        }
        else if (numCheckedIn === 2) {
            var currentPlayer = player2;
        }

        currentPlayer.name = playerName;
        $('.player-input-form').find('.shootBtn').attr('id', currentPlayer.id);

        $('.name-input-form').hide();
        $('.player-input-form').show();

    });

    $(document).on('click', '.shootBtn', function () {
        event.preventDefault();
        $('#wait-message').show();
        
        let currentPlayer = identifyPlayer($(this).attr('id'));
        let currentInput = $(this).parent('form').find('.player-input').val().toLowerCase();

        updatePlayerChoice(currentPlayer, currentInput);
    });

    function identifyPlayer(playerID) {
        let playerIdentified;
        players.forEach(function (player) {
            if (playerID === player.id) {
                playerIdentified = player;
            }
        })
        return playerIdentified;
    }

    function updatePlayerChoice(player, choice) {
        player.currentChoice = choice;
        player.currentIndex = choices.indexOf(choice);
        player.currentChoiceLong = choicesLong[player.currentIndex];

        database.ref("/players/" + player.id).set({
            name: player.name,
            id: player.id,
            currentChoice: player.currentChoice,
            currentIndex: player.currentIndex,
            currentChoiceLong: player.currentChoiceLong
        })
    }

    function consoleLogPlayerData() {
        players.forEach(function (player) {
            console.log(player);
        })
    }

    function isRoundComplete() {
        let isComplete = true;
        players.forEach(function (player) {
            if (player.currentChoice === null || player.currentChoice === undefined) {
                isComplete = false;
            }
        })
        return isComplete;
    }

    // checks if both players entered correct input
    // IF NOT: also displays which players entered invalid input
    function areInputsValid() {
        let mistakenPlayers = [];
        let areInputsValid = true;
        players.forEach(function (player) {
            if (player.currentIndex === -1) {
                areInputsValid = false;
                mistakenPlayers.push(player);
                $('.col-results').empty();
            }
        })
        for (let i = 0; i < mistakenPlayers.length; i++) {
            $('.col-results').append(mistakenPlayers[i].name + ' entered ' + mistakenPlayers[i].currentChoice + '. ');
        }
        return areInputsValid;
    }

    function resetPlayerChoices() {
        players.forEach(function (player) {
            player.currentChoice = null;
            player.currentChoiceLong = null;
            player.currentIndex = null;
            player.currentImg = null;

            database.ref("/players/" + player.id).set({
                name: player.name,
                id: player.id,
                currentChoice: player.currentChoice,
                currentIndex: player.currentIndex,
                currentChoiceLong: player.currentChoiceLong
            })
        })
    }

    function displayHands() {
        players.forEach(function (player) {
            if (player.id === 'player1') {
                var column = $('.col-left-hand');
                var imgArray = images.left;
            }
            else if (player.id === 'player2') {
                var column = $('.col-right-hand');
                var imgArray = images.right;
            }
            let newImage = $('<img>');
            newImage.attr('src', imgArray[player.currentIndex]);
            column.html(newImage);
        })
    }

    function updateScoreboard() {
        $('.col-scoreboard').html(player1.name + ' Wins: ' + score.player1Wins + '<br />' +
            player2.name + ' Wins: ' + score.player2Wins + '<br />' +
            'Ties: ' + score.ties)
    }

    function determineWinner() {
        if (player1.currentIndex - player2.currentIndex === 2) {
            player2.currentIndex += 3;
        }
        if (player2.currentIndex - player1.currentIndex === 2) {
            player1.currentIndex += 3;
        }

        if (player1.currentIndex < player2.currentIndex) {
            $('.col-results').html(player1.name + ' selected ' + player1.currentChoiceLong + '. <br/>' + player2.name + ' selected ' + player2.currentChoiceLong + '. <br/>' + player2.name + ' wins!')
            score.player2Wins++;
        }
        else if (player1.currentIndex === player2.currentIndex) {
            $('.col-results').html(player1.name + ' selected ' + player1.currentChoiceLong + '. <br/>' + player2.name + ' selected ' + player2.currentChoiceLong + '. <br/>Tie!')
            score.ties++;
        }
        else {
            $('.col-results').html(player1.name + ' selected ' + player1.currentChoiceLong + '. <br/>' + player2.name + ' selected ' + player2.currentChoiceLong + '. <br/>' + player1.name + ' wins!')
            score.player1Wins++;
        }
    }

});