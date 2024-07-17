"use strict";

let battleships_turn = false
let battleships_placed_ships = 0
let battleships_horizontal = true
let battleships_ship_positions = ""
let battleship_ship_lengths = [2, 3, 3, 4 ,5]
let battleship_status = "stopped"


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
    var encodedString = btoa(stringToEncode);
    //backend("publ:post [] "+ encodedString + " null");
    backend("games "+ encodedString);
}

function closeDuelOverlay() {
    var duelInviteContainer = document.getElementById('duelInviteContainer');
    if (duelInviteContainer) {
        //duelInviteContainer.parentNode.removeChild(duelInviteContainer);
        duelInviteContainer.style.display = 'none';
    }
}

// ---------- GAME-SCREEN -----------

// The main function that launches the GUI
function battleships() {
    closeOverlay();
    setScenario("battleships")
    document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>Battleships</strong></font></div>";
    // You can only play of there are 2 participants in the chat
    //if (curr_chat.split("@").length != 3) {
    //    launch_snackbar("Battleships is not available in this chat")
    //    return
    //}
    battleships_setup()
    //var other
    //if (curr_chat.split("@")[1] + ".ed25519" === myId.substring(1)) {
    //    other = curr_chat.split("@")[2]
    //} else {
    //    other = curr_chat.split("@")[1]
    //}
}

// Gets called whenever the user clicks on a square of the top field
function battleship_top_field_click(i) {
    if (battleships_placed_ships === 5 || battleship_status == "invited") {
        return
    }
    battleships_place_ship(i, battleship_ship_lengths[battleships_placed_ships])
}

// Tests if the ship placement is valid and places it if it is
function battleships_place_ship(pos, length) {
    var x = (((pos % 10) + 9) % 10)
    var y = Math.floor((pos - 1) / 10)
    if (battleships_horizontal) {
        if (x + length > 10 || battleships_intersect(x, y)) {
            return
        }
        battleships_ship_positions = battleships_ship_positions + "~" + x + "" + y + "RIGHT"
        battleships_placed_ships++
        for (var i = 0; i < length; i++) {
            var field = document.getElementById("battleships:top" + (pos + i))
            field.className = "ship"
            field.innerHTML = ""
            field.onclick = null
        }
    } else {
        if (y + length > 10 || battleships_intersect(x, y)) {
            return
        }
        battleships_ship_positions = battleships_ship_positions + "~" + x + "" + y + "DOWN"
        battleships_placed_ships++
        for (var i = 0; i < length; i++) {
           var field = document.getElementById("battleships:top" + (pos + i * 10))
           field.className = "ship"
           field.innerHTML = ""
           field.onclick = null
        }
    }
    if (battleships_placed_ships === 1) {
        battleships_ship_positions = battleships_ship_positions.substring(1)
    }
    battleships_show_ship_placer()
}

// Really shitty test if the placed ship overlaps any existing ships
// since using the backend game logic would be even more spaghetti
function battleships_intersect(x, y) {
    var positions = battleships_ship_positions.split("~")
    // Go through all existing ships
    for (var i = 0; i < positions.length; i++) {
        var ship = positions[i]
        var ship_x = parseInt(ship.charAt(0))
        var ship_y = parseInt(ship.charAt(1))
        var direction = ship.substring(2)
        // Go through the length of the current ship
        for (var j = 0; j < battleship_ship_lengths[i]; j++) {
            var current_x = ship_x
            var current_y = ship_y
            if (direction === "RIGHT") {
                current_x = ship_x + j
            } else {
                current_y = ship_y + j
            }
            // Go through the placed ship and compare positions
            for (var k = 0; k < battleship_ship_lengths[battleships_placed_ships]; k++) {
                if (battleships_horizontal && current_x === x + k && current_y === y) {
                    return true
                }
                if (!battleships_horizontal && current_x === x && current_y === y + k) {
                   return true
                }
            }
        }
    }
    return false
}

// Gets called when the user clicks on a square of the bottom field
function battleship_bottom_field_click(i) {
    var square = document.getElementById("battleships:bottom" + i)
    // Do nothing if it is not our turn
    if (!battleships_turn) {
        return
    } else {
        var other
        if (curr_chat.split("@")[1] + ".ed25519" === myId.substring(1)) {
            other = curr_chat.split("@")[2]
        } else {
            other = curr_chat.split("@")[1]
        }
        backend("battleship shoot " + other + ".ed25519 " + (((i % 10) + 9) % 10) + "" + Math.floor((i - 1) / 10))
        battleships_set_turn(false)
    }
    square.childNodes[0].className = "hole field_clicked"
    setTimeout(function () {
            square.childNodes[0].className = "hole"
        }, 500);
}

// Generates the HTML of the playing field
function battleships_setup() {
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
    document.getElementById("battleships:accept").style.display = "none"
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
function battleships_show_accept_button() {
    battleships_hide_controls()
    document.getElementById("battleships:accept").style.display = null
}

// Shows the waiting text field below the grid
function battleships_show_waiting() {
    battleships_hide_controls()
    document.getElementById("battleships:waiting").style.display = null
}

// Shows the turn indicator below the grid
function battleships_show_turn() {
    battleships_hide_controls()
    var turn = document.getElementById("battleships:turn")
    turn.style.display = null
    if (battleships_turn) {
        turn.innerHTML = "Your Turn"
    } else {
        turn.innerHTML = "Enemy Turn"
    }
}

// Shows the ship placer tool below the grid
function battleships_show_ship_placer() {
    battleships_hide_controls()
    var placer = document.getElementById("battleships:placer")
    var length = document.getElementById("battleships:length")
    placer.style.display = null
    switch (battleships_placed_ships) {
        case 0:
            length.innerHTML = "Boat Length: 2"
            break
        case 1:
            length.innerHTML = "Boat Length: 3"
            break
        case 2:
            length.innerHTML = "Boat Length: 3"
            break
        case 3:
            length.innerHTML = "Boat Length: 4"
            break
        case 4:
            length.innerHTML = "Boat Length: 5"
            break
        case 5:
            if (battleship_status === "accepted") {
                battleships_accept()
                battleships_show_turn()
            } else {
                battleships_show_invite_button()
            }
            break
    }
}

// Flips the placement orientation
function battleships_flip() {
    var orientation_button = document.getElementById("battleships:orientation")
    if (battleships_horizontal) {
        orientation_button.innerHTML = "Vertical"
    } else {
        orientation_button.innerHTML =  "Horizontal"
    }
    battleships_horizontal = !battleships_horizontal
}

// Sends the ship positions to the backend and tells it to invite the other player
function battleships_invite() {
    var other
    if (curr_chat.split("@")[1] + ".ed25519" === myId.substring(1)) {
        other = curr_chat.split("@")[2]
    } else {
        other = curr_chat.split("@")[1]
    }
    backend("battleship invite " + other + ".ed25519 " + battleships_ship_positions)
    battleships_show_waiting()
}

function battleships_accept_button() {
    battleship_status = "accepted"
    battleships_show_ship_placer()
}

// Sends the ship positions to the backend and tells it to accept the invite
function battleships_accept() {
    var other
    if (curr_chat.split("@")[1] + ".ed25519" === myId.substring(1)) {
        other = curr_chat.split("@")[2]
    } else {
        other = curr_chat.split("@")[1]
    }
    backend("battleship accept " + other + ".ed25519 " + battleships_ship_positions)
}

// Calls the backend to reload the gui status. Does not generate the gui again.
function battleships_reload_gui() {
    var other
    if (curr_chat.split("@")[1] + ".ed25519" === myId.substring(1)) {
        other = curr_chat.split("@")[2]
    } else {
        other = curr_chat.split("@")[1]
    }
    backend("battleship serialize " + other + ".ed25519")
}

// Displays the config given from the backend. The format of the config is
// well described in the backend.
function battleships_load_config(config) {
    document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>Battleships</strong></font></div>";
    battleships_placed_ships = 0
    battleships_ship_positions = ""
    if (config === undefined) {
        launch_snackbar("Game not started yet")
        return
    }
    var config_split = config.split("^")
    if (config_split[0] === "STOPPED") {
        battleship_status = "stopped"
        battleships_setup()
        battleships_show_ship_placer()
        return
    } else if (config_split[0] === "INVITED") {
        battleship_status = "invited"
        battleships_setup()
        battleships_show_accept_button()
        return
    } else if (config_split[0] === "WON") {
        battleship_status = "stopped"
        document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>You Won!</strong></font></div>";
        battleships_setup()
        battleships_show_ship_placer()
        return
    } else if (config_split[0] === "LOST") {
        battleship_status = "stopped"
        document.getElementById("conversationTitle").innerHTML = "<div style='text-align: center; color: Blue;'><font size=+2><strong>You Lost!</strong></font></div>";
        battleships_setup()
        battleships_show_ship_placer()
        return
    }
    var ships = config_split[1].split("~")
    for (var i = 0; i < ships.length; i++) {
        var ship = ships[i]
        var x = parseInt(ship.charAt(0))
        var y = parseInt(ship.charAt(1))
        if (x != -1) {
            battleships_placed_ships++
            battleships_ship_positions = battleships_ship_positions + "~" + ship
        }
        var direction = ship.slice(2, 100)
        for (var j = 0; j < battleship_ship_lengths[i]; j++) {
            var position = y * 10 + x + 1
            if (direction === "UP") {
                position = position - 10 * j
            } else if (direction === "DOWN") {
                position = position + 10 * j
            } else if (direction === "LEFT") {
                position = position - j
            } else if (direction === "RIGHT") {
                position = position + j
            }
            var field = document.getElementById("battleships:top" + position)
            field.className = "ship"
            field.innerHTML = ""
            field.onclick = null
        }
    }
    var shots_fired = config_split[2].split("~")
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
        if (outcome === "MISS") {
            field.className = "miss"
        } else if (outcome === "HIT") {
            field.className = "hit"
        } else if (outcome === "SUNKEN") {
            field.className = "sunken"
        }
        field.innerHTML = ""
        field.onclick = null
    }
    var shots_received = config_split[3].split("~")
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
        if (outcome === "MISS") {
            field.className = "miss"
        } else if (outcome === "HIT") {
            field.className = "hit"
        } else if (outcome === "SUNKEN") {
            field.className = "sunken"
        }
        field.innerHTML = ""
        field.onclick = null
    }
    if (config_split[0] === "WAITING") {
        battleships_show_waiting()
        return
    }
    battleships_set_turn(config_split[4] === "true")
    battleships_show_turn()
}
