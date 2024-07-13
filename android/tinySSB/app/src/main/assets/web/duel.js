"use strict";

function duel_openDuels() {
    closeOverlay(); // Schließe andere Overlays

    var duelContainer = document.getElementById('duelContainer');
    if (duelContainer) {
            duelContainer.style.display = 'block'; // Overlay sichtbar machen
        } else {
            console.error('Duel-Container not found!');
        }
}

// Beispielhafte Funktionen für Duell-Interaktionen
function inviteForDuel() {
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
    var duelContainer = document.getElementById('duelContainer');
    if (duelContainer) {
        //duelContainer.parentNode.removeChild(duelContainer);
        duelContainer.style.display = 'none';
    }
}
