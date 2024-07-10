package nz.scuttlebutt.tremolavossbol.tssb.games.battleships

import android.util.Log
import nz.scuttlebutt.tremolavossbol.games.battleShips.Direction
import nz.scuttlebutt.tremolavossbol.games.battleShips.Position2D
import nz.scuttlebutt.tremolavossbol.games.battleShips.ShotOutcome
import nz.scuttlebutt.tremolavossbol.crypto.SodiumAPI.Companion.sha256
import kotlin.js.ExperimentalJsExport

/**
 * Represents the set of all Battleship games. Games are managed in a list of GameInstances.
 * Instances can be addressed with the fid and the getInstanceFromFid function.
 */
class BattleshipHandler() {

    private val instances: MutableList<GameInstance> = mutableListOf()

    /**
     * Returns the GameInstance with the specified fid. GameInstance is null if no game found.
     */
    fun getInstanceFromFid(fid: String): GameInstance? {
        var instance: GameInstance? = null
        for (game in instances) {
            if (fid == game.getFid()) {
                instance = game
            }
        }
        return instance
    }

    // BattleShip Extension
    @ExperimentalJsExport
    fun getListOfGames(): Array<Array<String>> {
        val array = Array(instances.size) { arrayOf<String>() }
        for ((index, game) in instances.withIndex()) {
            array[index] = arrayOf("${game.getFid()} ${game.getState()}")
        }
        return array
    }


    /**
     * Add game with the specified fid to instance list.
     *
     * @return Returns true if new game is added to list.
     *         Returns false if new game could not be added because game already exists.
     */
    fun addGame(fid: String): Boolean {
        if (getInstanceFromFid(fid) != null) {
            Log.d("Battleship Game Creation", "Game with user already created")
            return false
        }
        val gameInstance = GameInstance()
        gameInstance.setFid(fid)
        instances.add(gameInstance)
        return true
    }

    /**
     * Starts the Battleship game. Specified name is the opponent. Ship positions are specified in the following format:
     * 28UP~82DOWN~11RIGHT~99LEFT where the first part stands for the first ship index.
     */
    fun startGame(fid: String, shipPositions: String, shouldStart: Boolean): Boolean {
        var validPosition = true
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Game Start", "Game not found")
            return false
        }
        if (instance.game.isRunning()) {
            Log.d("Battleship Game Start", "Game to be started is already running")
            return false
        }
        instance.setState(GameState.RUNNING)
        instance.game.setupGame(shouldStart)
        val pos = shipPositions.split("~")
        for (i in pos.indices) {
            val xValue = pos[i][0].digitToInt()
            val yValue = pos[i][1].digitToInt()
            Log.d("Battleship place ships", "x: ${xValue} y: ${yValue} direction: ${pos[i].substring(2)}")
            when (pos[i].substring(2)) {
                "UP" -> {
                    if (!instance.game.placeShip(i, xValue, yValue, Direction.UP)) {
                        validPosition = false
                    }
                }
                "DOWN" -> {
                    if (!instance.game.placeShip(i, xValue, yValue, Direction.DOWN)) {
                        validPosition = false
                    }
                }
                "LEFT" -> {
                    if (!instance.game.placeShip(i, xValue, yValue, Direction.LEFT)) {
                        validPosition = false
                    }
                }
                "RIGHT" -> {
                    if (!instance.game.placeShip(i, xValue, yValue, Direction.RIGHT)) {
                        validPosition = false
                    }
                }
            }
            Log.d("Battleship valid position", validPosition.toString())
        }
        return validPosition
    }

    /**
     * Sets the enemyHash field in the corresponding Game State.
     */
    fun setHash(fid: String, hash: String) {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Set Hash", "Game not found")
            return
        }
        instance.game.setEnemyHash(hash)
    }

    /**
     * Returns the enemyHash field in the corresponding Game State.
     */
    fun getHash(fid: String): String? {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Get Hash", "Game not found")
            return null
        }
        return instance.game.getEnemyHash()
    }

    /**
     * Adds a shot to the Battleship game.
     *
     * @param fid The id of the game
     * @param position the position of the shot, a double digit number where x is the first
     * digit and y the second
     *
     * @return false if the shot is not valid in any way, true if it registered
     */
    fun shoot(fid: String, position: String): Boolean {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Shoot", "Game not found")
            return false
        }
        if (position.length != 2) {
            Log.d("Battleship Shoot", "Wrong number of coordinates in Shot Position")
            return false
        }
        return instance.game.shoot(position[0].digitToInt(), position[1].digitToInt())
    }

    /**
     * Adds a receiveShot to the Battleship game.
     *
     * @param fid The id of the game
     * @param position the position of the shot, a double digit number where x is the first
     * digit and y the second
     *
     * @return false if the shot is not valid in any way, true if it registered
     */
    fun receiveShot(fid: String, position: String): ShotOutcome {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Receive Shot", "Game not found")
            return ShotOutcome.MISS
        }
        if (position.length != 2) {
            Log.d("Battleship Receive Shot", "Wrong number of coordinates in Shot Position")
            return ShotOutcome.MISS
        }
        return instance.game.receiveShot(position[0].digitToInt(), position[1].digitToInt())
    }

    /**
     * Checks if enemy has sunken all ships.
     */
    fun checkEnemyHasWon(fid: String): Boolean {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Check Enemy Win", "Game not found")
            return false
        }
        return instance.game.enemyHasWon()
    }

    fun stopGame(fid: String) {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Stop Game", "Game not found")
            return
        }
        instance.game.endGame()
    }

    /**
     * Saves shot outcome in game logic.
     */
    fun saveShotOutcome(fid: String, msg: String) {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Save Shot Outcome", "Game not found")
            return
        }
        val xValue = msg[0].digitToInt()
        val yValue = msg[1].digitToInt()
        when (msg.substring(2)) {
            "MISS" -> {
                instance.game.shotOutcome(xValue, yValue, ShotOutcome.MISS)
            }
            "HIT" -> {
                instance.game.shotOutcome(xValue, yValue, ShotOutcome.HIT)
            }
            "SUNKEN" -> {
                instance.game.shotOutcome(xValue, yValue, ShotOutcome.SUNKEN)
            }
        }
    }

    /**
     *  Returns a String containing all information about a game. String format:
     *  State^ShipPosition^ShotsFired^ShotsReceived^Turn
     *  Example: RUNNING^28UP~82DOWN~11RIGHT~99LEFT^23MISS~45MISS~56HIT~57SUNKEN^73MISS~48MISS~11HIT~12SUNKEN^True
     */
    fun serialize(fid: String): String {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Get Game State", "Game not found")
            return "STOPPED"
        }
        return instance.getState().toString() + "^" + instance.game.serialize()
    }

    /**
     * Returns a String containing Ship positions in the following format:
     * 28UP~82DOWN~11RIGHT~99LEFT
     * It is used for the hash calculation and cheat detection.
     */
    fun getShipPosition(fid: String): String {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Get Ship Position", "Game not found")
            return ""
        }
        return instance.game.getShipPosition()
    }

    /**
     * Returns all positions of the ship that is at the given coordinates.
     * Returns an empty array if there is no ship at the given coordinates
     */
    fun getShipAtPosition(fid: String, position: String): Array<Position2D> {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Get Ship At Position", "Game not found")
            return arrayOf()
        }
        return instance.game.getShipAtPosition(position[0].digitToInt(), position[1].digitToInt())
    }

    /**
     * Compares the saved hash with the ship positions as well as the ship positions with the game history.
     * Used for possible cheat detection.
     *
     * @return Returns True if the hashes were equal and the ship positions match the game history.
     */
    fun checkPositions(fid: String, shipPos: String): Boolean {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Check Hash", "Game not found")
            return false
        }
        return (String(shipPos.encodeToByteArray().sha256()) == instance.game.getEnemyHash()
                && checkIfHitsLineUpWithEnemyPositions(
            instance.game.shotsFiredWithOutcome(),
            shipPos
        ))
    }

    /**
     * Sets the state of the game specified by the fid.
     */
    fun setState(fid: String, state: GameState) {
        val instance = getInstanceFromFid(fid)
        if (instance == null) {
            Log.d("Battleship Set State", "Game not found")
            return
        }
        instance.setState(state)
    }

    /**
     * Given the shots and the enemy ship positions, this function checks that all shots were
     * reported correctly from the enemy.
     *
     * @param shots Pairs of positions and shot outcomes of shots this player shot
     * @param enemyShips String describing the enemy ship positions, example 34DOWN~54UP~12RIGHT~53LEFT~97UP
     *
     * @return true if all shots are legit, false if there is a conflict
     */
    private fun checkIfHitsLineUpWithEnemyPositions(
        shots: MutableList<Pair<Position2D, ShotOutcome>>,
        enemyShips: String
    ): Boolean {
        val shipLengths = arrayOf(2, 3, 3, 4, 5)
        val enemyPositions = MutableList(0) { Position2D(0, 0) }
        val enemyShipsSplit = enemyShips.split("~")
        enemyShipsSplit.forEachIndexed { i, ship ->
            val x = ship[0].digitToInt()
            val y = ship[1].digitToInt()
            val direction = when (ship.substring(2)) {
                Direction.UP.string -> Direction.UP
                Direction.DOWN.string -> Direction.DOWN
                Direction.LEFT.string -> Direction.LEFT
                Direction.RIGHT.string -> Direction.RIGHT
                else -> {
                    return false
                }
            }
            for (j in 0 until shipLengths[i]) {
                enemyPositions.add(getPosition(x, y, j, direction))
            }
        }
        enemyPositions.forEach {
            Log.d(
                "Battleship Calculated enemy position",
                "(x, y): (${it.getXPosition()}, ${it.getYPosition()})"
            )
        }
        shots.forEach {
            if ((it.second == ShotOutcome.SUNKEN || it.second == ShotOutcome.HIT) && !enemyPositions.contains(
                    it.first
                )
            ) {
                Log.d(
                    "Battleship Incorrect Hit or Sunken",
                    "Detected cheat position: (${it.first.getXPosition()}, ${it.first.getYPosition()})"
                )
                return false
            }
            if (it.second == ShotOutcome.MISS && enemyPositions.contains(it.first)) {
                Log.d(
                    "Battleship Incorrect Miss",
                    "Detected cheat position: (${it.first.getXPosition()}, ${it.first.getYPosition()})"
                )
                return false
            }
        }
        return true
    }

    /**
     * Helper function, just a wrapped switch case to calculate the i-th position
     *
     * @param x The x coordinate of the anchor point
     * @param y The y coordinate of the anchor point
     * @param i The i-th position gets calculated
     * @param direction The direction the ship faces
     *
     * @return The i-th position of that ship
     */
    private fun getPosition(x: Int, y: Int, i: Int, direction: Direction): Position2D {
        return when (direction) {
            Direction.UP -> Position2D(x, y - i)
            Direction.DOWN -> Position2D(x, y + i)
            Direction.RIGHT -> Position2D(x + i, y)
            Direction.LEFT -> Position2D(x - i, y)
        }
    }
}