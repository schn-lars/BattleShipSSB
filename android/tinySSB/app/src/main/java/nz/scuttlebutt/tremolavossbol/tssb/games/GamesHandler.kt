package nz.scuttlebutt.tremolavossbol.tssb.games

import android.util.Log
import android.webkit.JavascriptInterface
import nz.scuttlebutt.tremolavossbol.tssb.games.battleships.BattleshipHandler
import android.util.Base64
import nz.scuttlebutt.tremolavossbol.crypto.SSBid

/**
 * This class distributes all requests regarding any games.
 */
class GamesHandler(identity: SSBid) {
    var myId: SSBid = identity
    var count = 0
    private val instances: MutableList<GameInstance> = mutableListOf()
    // Currently selected game. Each client can only have one active at a time.
    private var activeInstance: GameInstance? = null
    private var battleshipHandler: BattleshipHandler? = null

    /**
     * This function verifies, if a participant can add a new game with the given parameters.
     * Since we want to use it in public channel, we need to make sure, that there does not
     * exist any other active game (with the same gametype) between the same players.
     */
    fun canCreateNewGame(gameType: String, ownerFid: String, participantFid: String) : Boolean {
        for (game in instances) {
            if (participantFid == game.ownerFid && ownerFid == game.ownerFid && gameType == game.toString() && game.isActive() ||
                participantFid == game.participantFid && ownerFid == game.participantFid && gameType == game.toString() && game.isActive()) {
                // You have already created a running game with the same player in the same gamemode.
                return false
            }
        }
        return true
    }

    /**
     * This method returns the list of games used to display the current games in GUI.
     */
    @JavascriptInterface
    fun getListOfGames(): Array<String> {
        val array = Array(instances.size) { "" }
        for ((index, game) in instances.withIndex()) {
            array[index] = getInstanceDescriptor(game)
        }
        return array
    }

    /**
     * This method reacts to incoming (from peers) game commands.
     */
    @JavascriptInterface
    fun onGameBackendEvent(s: String): String {
        Log.d("GamesHandler Recv", s);
        val decodedBytes = Base64.decode(s, Base64.DEFAULT);
        val decodedString = String(decodedBytes)
        Log.d("GamesHandler Recv", decodedString);
        val args = decodedString.split(" ")
        when (args[0]) {
            "BSH" -> {
                if (battleshipHandler == null) {
                    battleshipHandler = BattleshipHandler(this)
                }
                battleshipHandler!!.handleRequest(decodedString.substring(4), activeInstance)
            }
            else -> {
                Log.d("GamesHandler", "Unknown Game")
            }
        }
        return ""
    }

    private fun getInstanceDescriptor(i: GameInstance): String {
        return "$i ${i.ownerFid} ${i.participantFid} ${i.startTime} ${i.state}"
    }

    /**
     * Adds a new gameinstance to the list. Returns the index of the created instance.
     * You can always create a new game. Limitation only kicks in on participant's side.
     */
    fun addOwnGame(gameType: String, ownerFid: String): Int {
        addInstanceToList(GameInstance(gameType, ownerFid, myId))
        count++
        return instances.size
    }

    /**
     * This method delivers the list of all current games to the frontend on request.
     */
    @JavascriptInterface
    fun createInstanceList(): String {
        return instances.joinToString(separator = "$") { getInstanceDescriptor(it) }
        // TODO read out log to retrieve all games
    }

    fun deleteInstanceFromList(instance: GameInstance) {
        instances.remove(instance)
    }

    private fun addInstanceToList(instance: GameInstance) {
        instances.add(instance)
    }

    /**
     * This method is responsible for transmitting the given parameter to the correct game.
     */
    fun processGameRequest(s: String) {
        val args = s.split(" ")
        when (args[0]) {
            "BSH" -> {
                if (battleshipHandler == null) {
                    battleshipHandler = BattleshipHandler(this)
                }
                battleshipHandler!!.handleRequest(s.substring(4), activeInstance)
            }
            else -> {
                Log.d("GamesHandler", "Unknown Game")
            }
        }
    }
}