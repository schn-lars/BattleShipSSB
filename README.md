# tinySSB - the LoRa descendant of Secure Scuttlebutt

![tinySSB logo](doc/_img/tinySSB-banner.png)

## Overview

### Tutorial for first build under Windows
#### Prerequisites
- CMake version 3.18.1 or higher, with the folder added to the PATH environment variable
  - [Download CMake](https://cmake.org/download/)
- gcc
    - [Download MinGW](https://sourceforge.net/projects/mingw-w64/)
- ninja-build with the folder added to the PATH environment variable
    - [Download ninja-build](https://github.com/ninja-build/ninja/releases)

#### Steps
1. Clone the repository
2. **Don't** open the project in Android Studio yet
3. In the folder android/tinySSB, create a new file named "local.properties" and add the following line:
```sdk.dir=C\:\\Users\\<your-username>\\AppData\\Local\\Android\\Sdk```
4. Import the project in Android Studio (File -> Open -> select the file build.gradle in the android/tinySSB folder)

---

## Project Distributed Programming & Internet Architecture FS2024
### Battleships
For our project in the DPI course we implemented the game Battleships into the Tremola app for Android.
The game can be played via the public chat. Battleship is a 1vs1 guessing game where each player has his field with his ships on it. Each turn one player can guess a cell on the opponents field to attack. The goal of the game is to sink all opponent's ships and win the battle.

#### How to play?
1. Open the Tremola app
2. Go to the public chat
3. Click on the clip icon in the bottom right corner
4. Select the game you want to play (only Battleship available for now). This will send an invite to all peers in the public chat
5. When a player accepts the invite you can play. For that go to the public chat
6. Click on the button in the upper right corner
7. Click on Duels
8. Select the game instance you want to play

#### How to play Battleship?
1. The game will automatically place your ships ransomly for you
2. At the bottom of the screen you can see who's turn it is
3. When it's your turn you can click on a cell on the bottom field (your enemy's field)
4. The cell will turn blue if you missed your shot
5. If you manage to hit a part of the enemy's ship the cell will turn orange and you can shoot again
6. When you hit all cells of a ship it will turn red
7. When all enemy's ships are sunk you win!


If there are problems with the game, check if both players have the same version of Tremola. If this is the case try wiping the logs to start fresh (go to Settings -> WIPE EVERYTHING IMMEDIATELY)
