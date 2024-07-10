"use strict";

function duel_openDuels() {
    closeOverlay(); // Schließe andere Overlays

    // Erstelle das Duell-Element
    var duelContainer = document.createElement('div');
    duelContainer.id = 'duelContainer';
    duelContainer.style.position = 'fixed';
    duelContainer.style.top = '50px'; // Beispielhafte Positionierung
    duelContainer.style.left = '50px'; // Beispielhafte Positionierung
    duelContainer.style.backgroundColor = '#ffffff';
    duelContainer.style.padding = '20px';
    duelContainer.style.border = '2px solid #000000';
    duelContainer.style.zIndex = '1000'; // Beispielhafte Z-Index

    // Füge einen Titel hinzu
    var title = document.createElement('h2');
    title.textContent = 'Duell starten';
    duelContainer.appendChild(title);

    // Erstelle das Scroll-Container-Element
    var scrollContainer = document.createElement('div');
    scrollContainer.style.maxHeight = '200px'; // Beispielhafte maximale Höhe für das Scrollfeld
    scrollContainer.style.overflowY = 'auto'; // Scrollen nur vertikal

    // Füge einige Quadrate (Bilder) hinzu
    var numberOfSquares = 10; // Anzahl der Quadrate
    for (let i = 0; i < numberOfSquares; i++) {
        var square = document.createElement('div');
        square.className = 'square';
        square.style.width = '100px'; // Beispielhafte Breite
        square.style.height = '100px'; // Beispielhafte Höhe
        square.style.backgroundColor = '#f0f0f0'; // Beispielhafte Hintergrundfarbe
        square.style.marginBottom = '10px'; // Abstand zwischen den Quadraten
        scrollContainer.appendChild(square);
    }

    duelContainer.appendChild(scrollContainer);

    var startButton = document.createElement('button');
    startButton.textContent = 'Cancel';
    startButton.style.padding = '10px';
    startButton.style.marginTop = '10px'; // Abstand zum vorherigen Inhalt
    startButton.style.backgroundColor = '#008000';
    startButton.style.color = '#ff0000';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.onclick = inviteForDuel;

    duelContainer.appendChild(startButton);

    // Füge das Duell-Element zum Body hinzu
    document.body.appendChild(duelContainer);
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
        duelContainer.parentNode.removeChild(duelContainer);
    }
}
