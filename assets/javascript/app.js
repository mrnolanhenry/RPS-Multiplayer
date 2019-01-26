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

    $(document).on('click', '.shootBtn', function () {
        event.preventDefault();
        let currentPlayer = identifyPlayer($(this));
        let currentInput = $(this).parent('form').find('.player-input').val().toLowerCase();
        updatePlayerChoice(currentPlayer, currentInput);
        if (isRoundComplete()) {
            if (areInputsValid()) {
                displayHands();
                determineWinner();
                updateScoreboard();
                resetPlayerChoices();
            }
            else {
                resetPlayerChoices();
            }
        }

        // clear input entered
        $(this).parent('form').find('.player-input').val('');
        // consoleLogPlayerData();
    });

    function identifyPlayer(button) {
        let playerIdentified;
        let playerID = button.attr('id');
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
    }

    function consoleLogPlayerData() {
        players.forEach(function (player) {
            console.log(player);
        })
    }

    function isRoundComplete() {
        let isComplete = true;
        players.forEach(function (player) {
            if (player.currentChoice === null) {
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