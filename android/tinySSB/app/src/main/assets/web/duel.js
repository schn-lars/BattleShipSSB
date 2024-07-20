"use strict";

var battleships_turn = false
var battleships_horizontal = true
var battleships_ship_positions = ""
var battleship_ship_lengths = [2] // [2, 3, 3, 4 ,5]
var battleship_status = "stopped"

var owner = ""
var peer = ""
var game = ""



function duel_openDuels() {
    closeOverlay(); // Schließe andere Overlays

    var duelInviteContainer = document.getElementById('duelInviteContainer');
    if (duelInviteContainer) {
        duelInviteContainer.style.display = 'block'; // Overlay sichtbar machen
    } else {
        console.error('Duel-Invite-Container not found!');
    }
}

// Beispielhafte Funktionen für Duell-Interaktionen
function inviteForDuel(gameType) {
    // Logik für den Start eines Duells
    closeDuelOverlay();
    //var stringToEncode = "GAM_BSH_INV_" + myId;
    var stringToEncode = "BSH INV " + myId;
    console.log('Invited battleship', JSON.stringify(stringToEncode))
    //var encodedString = btoa(stringToEncode);
    //backend("publ:post [] "+ encodedString + " null");
    backend("games "+ stringToEncode);
}

function closeDuelOverlay() {
    var duelInviteContainer = document.getElementById('duelInviteContainer');
    if (duelInviteContainer) {
        //duelInviteContainer.parentNode.removeChild(duelInviteContainer);
        duelInviteContainer.style.display = 'none';
    }
}

// ---------- GAME-SCREEN -----------

function update_game_gui() {
    console.log("BSH updating GUI ...")
    if (window.GamesHandler && typeof window.GamesHandler.getInstanceDescriptorFromFids === 'function') {
        var instanceDescriptor = window.GamesHandler.getInstanceDescriptorFromFids(game, owner, peer)
        console.log("BSH update_gui ", JSON.stringify(instanceDescriptor))
        var instanceList = instanceDescriptor.split(" ")
        if (instanceList.length < 6) { return }
        var playerTurn = instanceList[5]
        if (playerTurn == "1") {
            battleships(true, instanceList[6])
        } else {
            battleships(false, instanceList[6])
        }
    }
}


// The main function that launches the game GUI
function battleships(turn, ships_fired_recv) {
    var args = ships_fired_recv.split("^");
    battleships_turn = turn;
    console.log("Called BSH GUI:", JSON.stringify(ships_fired_recv));

    closeOverlay();
    setScenario("battleships")

    var c = document.getElementById("conversationTitle");
    c.style.display = null;
    c.innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>Battleships</strong></font></div>";

    battleships_load_config(battleship_status, args[0], args[1], args[2]);
    //battleships_show_turn()
}

/**
*   This function is called if a user wants to quit the game.
*/
function quit_bsh() {// TODO add owner and peer
    backend("games BSH DUELQUIT " + owner + " " + peer);
}


// Gets called when the user clicks on a square of the bottom field
function battleship_bottom_field_click(i) {
    console.log("BSH registered Shot: ", JSON.stringify(i))
    var square = document.getElementById("battleships:bottom" + i)
    // Do nothing if it is not our turn
    if (!battleships_turn) {
        return
    } else {
        backend("games BSH SHOT " + owner + " " + peer + " " + (((i % 10) + 9) % 10) + "" + Math.floor((i - 1) / 10))
        battleships_set_turn(false)
    }
    square.childNodes[0].className = "hole field_clicked"
    setTimeout(function () {
            square.childNodes[0].className = "hole"
        }, 500);
}

// Generates the HTML of the playing field
function battleships_setup() {
    console.log("BSH_setup()", JSON.stringify(battleship_status));
    battleships_hide_controls()
    var board = document.getElementById("battleships:board")
    var topgrid = document.getElementById("battleships:topgrid")
    topgrid.innerHTML = ""
    topgrid.insertAdjacentHTML("beforeend", "<span class='battleshipsTopRow zero'></span>")
    for (var i = 1; i < 11; i++) {
        topgrid.insertAdjacentHTML("beforeend", "<span class='battleshipsTopRow'>" + i + "</span>")
    }
    var counter = 1;
    for (var i = 12; i <= 121; i++) {
        if ((i % 11) - 1 == 0) {
            topgrid.insertAdjacentHTML("beforeend", "<span class='battleshipsLeftRow'>" + String.fromCharCode(64 + (i - 1) / 11).toUpperCase() + "</span>")
        } else {
            topgrid.insertAdjacentHTML("beforeend", "<li id='battleships:top" + counter + "'class='field' onclick='battleship_top_field_click(" + counter + ")'><span class='hole'></span></li>")
            counter++
        }
    }
    var bottomgrid = document.getElementById("battleships:bottomgrid")
    bottomgrid.innerHTML = ""
    bottomgrid.insertAdjacentHTML("beforeend", "<span class='battleshipsTopRow zero'></span>")
    for (var i = 1; i < 11; i++) {
        bottomgrid.insertAdjacentHTML("beforeend", "<span class='battleshipsTopRow'>" + i + "</span>")
    }
    var counter = 1;
    for (var i = 12; i <= 121; i++) {
        if ((i % 11) - 1 == 0) {
            bottomgrid.insertAdjacentHTML("beforeend", "<span class='battleshipsLeftRow'>" + String.fromCharCode(64 + (i - 1) / 11).toUpperCase() + "</span>")
        } else {
            bottomgrid.insertAdjacentHTML("beforeend", "<li id='battleships:bottom" + counter + "'class='field' onclick='battleship_bottom_field_click(" + counter + ")'><span class='hole'></span></li>")
            counter++
        }
    }
}

function battleships_set_turn(is_turn) {
    battleships_turn = is_turn
}

// Hides everything below the two grids
function battleships_hide_controls() {
    document.getElementById("battleships:invite").style.display = "none"
    document.getElementById("battleships:invited").style.display = "none"
    document.getElementById("battleships:waiting").style.display = "none"
    document.getElementById("battleships:placer").style.display = "none"
    document.getElementById("battleships:turn").style.display = "none"
}

// Shows the invite button below the grid
function battleships_show_invite_button() {
    battleships_hide_controls()
    document.getElementById("battleships:invite").style.display = null
}

// Shows the accept button below the grid
function battleships_show_invited_button() {
    battleships_hide_controls()
    document.getElementById("battleships:invited").style.display = null
}

// Shows the waiting text field below the grid
function battleships_show_waiting() {
    battleships_hide_controls()
    document.getElementById("battleships:waiting").style.display = null
}

// Shows the turn indicator below the grid
function battleships_show_turn() {
    console.log("BSH Showing Turn...")
    battleships_hide_controls()
    var peerId = myId;
    //if (battleships_turn == null && battleship_status != "INVITED") { return; }
    var turn = document.getElementById("battleships:turn")
    turn.style.display = null

    console.log("BSH Determining what to display as turn ...")
    turn.className = ''; // Reset classes
    if (peerId == owner || peerId == peer) {
        if (battleship_status == "WON") {
            turn.innerHTML = "You Won!";
            turn.classList.add('turn-won');
        } else if (battleship_status == "LOST") {
            turn.innerHTML = "You Lost!";
            turn.classList.add('turn-lost');
        } else if (battleship_status == "STOPPED") {
            turn.innerHTML = "The game is stopped!";
            turn.classList.add('turn-default');
        } else if (battleship_status == "INVITED") {
            console.log("BSH invite-button init ...")
            turn.innerHTML = "Waiting for other!"
            turn.classList.add('turn-default');
        } else if (battleship_status == "WAITING") {
            if (peerId == "-") {
                turn.innerHTML = "Waiting ...";
                turn.classList.add('turn-default');
            }
        } else if (battleship_status == "RUNNING") {
            if (battleships_turn) {
                turn.innerHTML = "Your Turn";
                turn.classList.add('turn-default');
            } else {
                turn.innerHTML = "Enemy Turn";
                turn.classList.add('turn-default');
            }
        }
    } else {
        if (battleship_status == "WON") {
            if (battleships_turn) {
                turn.innerHTML = "Owner has Won!";
            } else {
                turn.innerHTML = "Peer has Won!";
            }
            turn.classList.add('turn-won');
        } else if (battleship_status == "LOST") {
            if (battleships_turn) {
                turn.innerHTML = "Owner has Lost!";
            } else {
                turn.innerHTML = "Peer has Lost!";
            }
            turn.classList.add('turn-lost');
        } else {
            if (battleships_turn) {
                turn.innerHTML = "Owner's Turn!";
            } else {
                turn.innerHTML = "Peer's Turn!";
            }
            turn.classList.add('turn-default');
        }
    }
}


// Displays the config given from the backend. The format of the config is
// well described in the backend.
function battleships_load_config(state, ships, deliv, recv) {
    document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>Battleships</strong></font></div>";
    battleships_ship_positions = ""
    console.log("BSH_load_config", JSON.stringify(state + " " + ships + " " + recv + " " + deliv));
    if (state === "STOPPED") {
        document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Red;'><font size=+2><strong>Stopped Game!</strong></font></div>";
        battleships_setup()
        battleships_show_turn()
    } else if (state === "INVITED") {
        battleships_setup()
        battleships_show_turn()
        //return
    } else if (state === "WON") {
        document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>You Won!</strong></font></div>";
        battleships_setup()
        battleships_show_turn()
    } else if (state === "LOST") {
        document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>You Lost!</strong></font></div>";
        battleships_setup()
        battleships_show_turn()
    } else if (state === "RUNNING") {
        battleships_setup()
        battleships_show_turn()
    }

    console.log("BSH chunking ships now ...", JSON.stringify(ships))
    var shipPositions = splitIntoChunks(ships, 3)
    console.log("BSH chunky ships: ", JSON.stringify(shipPositions))
    for (var i = 0; i < shipPositions.length; i++) {
        console.log("BSH Processing Ship: ", shipPositions[i])
        var ship = shipPositions[i]
        var x = parseInt(ship.charAt(0))
        var y = parseInt(ship.charAt(1))
        if (x != -1) {
            battleships_ship_positions = battleships_ship_positions + "" + ship
        }
        var direction = ship.slice(2, 100)
        for (var j = 0; j < battleship_ship_lengths[i]; j++) {
            var position = y * 10 + x + 1
            if (direction === "U") {
                position = position - 10 * j
            } else if (direction === "D") {
                position = position + 10 * j
            } else if (direction === "L") {
                position = position - j
            } else if (direction === "R") {
                position = position + j
            }
            var field = document.getElementById("battleships:top" + position)
            field.className = "ship"
            field.innerHTML = ""
            field.onclick = null
        }
    }
    console.log("BSH parsing shotsFired ", JSON.stringify(deliv))
    var shots_fired = splitIntoChunks(deliv, 3)
    for (var i = 0; i < shots_fired.length; i++) {
        var shot = shots_fired[i]
        if (shot === "") {
            continue
        }
        var x = parseInt(shot.charAt(0))
        var y = parseInt(shot.charAt(1))
        var outcome = shot.slice(2, 100)
        var position = y * 10 + x + 1
        var field = document.getElementById("battleships:bottom" + position)
        if (outcome === "M") {
            field.className = "miss"
        } else if (outcome === "H") {
            field.className = "hit"
        } else if (outcome === "S") {
            field.className = "sunken"
        }
        field.innerHTML = ""
        field.onclick = null
    }
    console.log("BSH Parsing Shots Received ", JSON.stringify(recv))
    var shots_received = splitIntoChunks(recv, 3)
    for (var i = 0; i < shots_received.length; i++) {
        var shot = shots_received[i]
        if (shot === "") {
            continue
        }
        var x = parseInt(shot.charAt(0))
        var y = parseInt(shot.charAt(1))
        var outcome = shot.slice(2, 100)
        var position = y * 10 + x + 1
        var field = document.getElementById("battleships:top" + position)
        if (outcome === "M") {
            field.className = "miss"
        } else if (outcome === "H") {
            field.className = "hit"
        } else if (outcome === "S") {
            field.className = "sunken"
        }
        field.innerHTML = ""
        field.onclick = null
    }
    if (state === "WAITING") {
        battleships_show_turn()
        return
    }
    //battleships_set_turn(config_split[4] === "true")
    battleships_show_turn()
}

/*
*   This method parses the ships into readable format.
*/
function splitIntoChunks(str, chunkSize) {
    const chunks = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        chunks.push(str.substring(i, i + chunkSize));
    }
    return chunks;
}

function reset_battleship_mode() {
    battleships_turn = null
    battleships_ship_positions = ""
    battleship_status = "STOPPED"
    game = ""

    owner = ""
    peer = ""
}
