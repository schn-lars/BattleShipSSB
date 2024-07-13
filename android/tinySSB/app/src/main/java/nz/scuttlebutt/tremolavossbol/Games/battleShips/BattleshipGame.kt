package nz.scuttlebutt.tremolavossbol.games.battleShips

import nz.scuttlebutt.tremolavossbol.games.Game

/**
 * The main class of the game. Everything can be managed through this class (hopefully). It is a
 * simple battleships implementation working asymmetrically without the enemy field.
 * The coordinate field looks as follows:
 *
 *          X-Axis  0   1   2   3   4   5   6   7   8   9
 *      Y-Axis
 *      0           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      1           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      2           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      3           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      4           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      5           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      6           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      7           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      8           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 *      9           ~   ~   ~   ~   ~   ~   ~   ~   ~   ~
 */
class BattleshipGame : Game {
    private val DEFAULT_CONFIG =
        arrayOf(
            2,
            3,
            3,
            4,
            5
        )
    private var gameState: GameState? = null
    override var state: nz.scuttlebutt.tremolavossbol.tssb.games.battleships.GameStates = nz.scuttlebutt.tremolavossbol.tssb.games.battleships.GameStates.STOPPED
    override var isRunning: Boolean = false

    /**
     * This method defines the ships that will be used in the game. It takes an array of integers,
     * where each integer represents one ship of that length. By default, the classic rules will be used:
     * 2, 3, 3, 4, 5
     *
     * Will do nothing if the game has already started
     *
     * @param turn True if it is your turn, false if not
     * @param ships An array of integers containing the ship lengths, has a default configuration
     * of 2 3 3 4 5
     *
     */
    fun setupGame(
        turn: Boolean,
        ships: Array<Int> = DEFAULT_CONFIG
    ) {
        if (isRunning) return
        gameState =
            GameState(
                turn,
                ships
            )
        isRunning = true;
    }

    /**
     * Checks if the enemy has won the game. Returns false if the game has not started yet.
     *
     * @return True if the enemy has won
     */
    fun enemyHasWon(): Boolean {
        if (!isRunning) return false
        return gameState!!.enemyHasWon()
    }

    /**
     * Ends the currently running game deleting all information about it
     */
    fun endGame() {
        isRunning = false;
        gameState = null
    }

    /**
     * Tries to place a ship on your own battlefield
     *
     * @return true if the ship was placed, false if the placement was invalid
     */
    fun placeShip(
        index: Int,
        x: Int,
        y: Int,
        direction: Direction
    ): Boolean {
        if (!isRunning) return false
        return gameState!!.placeShip(
            index,
            x,
            y,
            direction
        )
    }

    /**
     * Shoots a shot to the enemy while checking its validity. Duplicates are invalid
     * @param x The x coordinate of the shot
     * @param y The y coordinate of the shot
     *
     * @return true if the shot is valid, false if the shot is not
     */
    fun shoot(
        x: Int,
        y: Int
    ): Boolean {
        if (!isRunning) return false
        return gameState!!.shoot(
            x,
            y
        )
    }

    /**
     * Receive a shot from the enemy.
     *
     * @param x The x coordinate of the shot
     * @param y The y coordinate of the shot
     *
     * @return A ShotOutcome describing what happened (HIT/MISS/SUNKEN)
     *
     * @throws IllegalStateException If the game has not yet started
     */
    fun receiveShot(
        x: Int,
        y: Int
    ): ShotOutcome {
        if (!isRunning) throw IllegalStateException("Game has not yet started")
        return gameState!!.receiveShot(
            x,
            y
        )
    }

    /**
     * Receive the outcome of your shot from the enemy. If there are multiple outcomes for the
     * same coordinates, it will save the latest
     *
     * @param x The x coordinate of the shot
     * @param y The y coordinate of the shot
     * @param shotOutcome The outcome of the shot
     */
    fun shotOutcome(x: Int, y: Int, shotOutcome: ShotOutcome) {
        if (!isRunning) return
        gameState!!.shotOutcome(x, y, shotOutcome)
    }

    /**
     * Serializes the game state to send it to the frontend.
     * Format:
     * ShipPosition^ShotsFired^ShotsReceived^Turn
     * Example:
     * 28UP~73RIGHT^43MISS~15HIT^85SUNKEN~24MISS^true
     *
     * @return Empty string if the game is not running, the serialized state otherwise
     */
    fun serialize(): String {
        if (!isRunning) return ""
        return gameState!!.serialize()
    }

    /**
     * Returns position of ships in following format:
     * 28UP~83RIGHT~21UP~73RIGHT
     *
     * @return Empty string if the game is not running
     */
    fun getShipPosition(): String {
        if (!isRunning) return ""
        return gameState!!.getShipPosition()
    }

    /**
     * Setter for the hash of enemy positions
     */
    fun setEnemyHash(hash: String) {
        gameState!!.setEnemyHash(hash)
    }

    /**
     * Getter for the hash of enemy positions
     */
    fun getEnemyHash(): String? {
        return gameState!!.getEnemyHash()
    }

    /**
     * Returns an array of all ship positions of the ship which has a tile on position x, y.
     * Returns an empty array if there is no ship with a tile on that position.
     */
    fun getShipAtPosition(x: Int, y: Int): Array<Position2D> {
        return gameState!!.getShipAtPosition(x, y)
    }

    /**
     * Returns the shots you fired along with the outcomes in a list
     */
    fun shotsFiredWithOutcome(): MutableList<Pair<Position2D, ShotOutcome>> {
        return gameState!!.shotsFiredWithOutcome()
    }


    // Overwritten functions defined from interface.

    override fun toString(): String {
        return "BSH"
    }
}