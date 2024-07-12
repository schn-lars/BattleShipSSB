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
    console.log('Invited battleship')
    closeDuelOverlay();
    backend("battleship invite " + myId);
}

function closeDuelOverlay() {
    var duelContainer = document.getElementById('duelContainer');
    if (duelContainer) {
        //duelContainer.parentNode.removeChild(duelContainer);
        duelContainer.style.display = 'none';
    }
}
