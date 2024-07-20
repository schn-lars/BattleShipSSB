package nz.scuttlebutt.tremolavossbol.tssb.games

import android.util.Log
import android.webkit.JavascriptInterface
import nz.scuttlebutt.tremolavossbol.tssb.games.battleships.BattleshipHandler
import android.util.Base64
import nz.scuttlebutt.tremolavossbol.crypto.SSBid
import nz.scuttlebutt.tremolavossbol.games.battleShips.BattleshipGame
import nz.scuttlebutt.tremolavossbol.tssb.games.battleships.GameStates
import java.text.SimpleDateFormat
import java.util.Date


/**
 * This class distributes all requests regarding any games.
 */
class GamesHandler(identity: SSBid) {
    var myId: SSBid = identity
    var count = 0
    private val instances: MutableList<GameInstance> = mutableListOf()
    // Currently selected game. Each client can only have one active at a time.
    private var activeInstance: GameInstance? = null
    private var battleshipHandler: BattleshipHandler = BattleshipHandler(this)


    /**
     * This method returns the number of pending invites for a specified gamemode.
     */
    fun getInviteCount(gameType: String): Int {
        when (gameType) {
            "BSH" -> {
                return battleshipHandler.inviteCounter
            }
        }
        return -1
    }

    fun decInviteCount(gameType: String): Boolean {
        when (gameType) {
            "BSH" -> {
                if (battleshipHandler.inviteCounter == 1) {
                    battleshipHandler.inviteCounter--
                    return true
                }
                return false
            }
        }
        return false
    }

    fun incInviteCount(gameType: String): Boolean {
        when (gameType) {
            "BSH" -> {
                if (battleshipHandler.inviteCounter == 0) {
                    battleshipHandler.inviteCounter++
                    return true
                }
                return false
            }
        }
        return false
    }

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
     * Returns an instance of a game (if exist) for given parameters.
     */
    fun getInstanceFromFids(gameType: String, oID: String, pID: String): GameInstance? {
        for (game in instances) {
            if (game.ownerFid == oID && game.participantFid == pID && game.game.toString() == gameType) {
                return game
            }
        }
        return null
    }

    /**
     * This method is used to get an instance after receiving an invite.
     */
    fun getInstanceFromFid(gameType: String, oID: String): GameInstance? {
        for (game in instances) {
            if (game.ownerFid == oID && game.game.toString() == gameType && game.participantFid == "-") {
                return game
            }
        }
        return null
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
                return battleshipHandler!!.handleRequest(decodedString.substring(4), activeInstance)
            }
            else -> {
                Log.d("GamesHandler", "Unknown Game")
                return ""
            }
        }
    }

    /**
     * This method is used to react to incoming messages regarding updating the GUI.
     */
    @JavascriptInterface
    fun getInstanceDescriptorFromFids(gameType: String, oID: String, pID: String): String {
        val instance: GameInstance? = getInstanceFromFids(gameType, oID, pID)
        if (instance == null) {
            return ""
        } else {
            return getInstanceDescriptor(instance)
        }
    }

    /**
     * This method gets called, as soon as you want to open the Game-GUI.
     */
    // TODO change depending on game mode
    private fun getInstanceDescriptor(i: GameInstance): String {
        var myTurn: String = "0"

        if ((i.game as BattleshipGame).gameState == null) {
            return "$i ${i.ownerFid} ${i.participantFid} ${i.startTime} ${i.state}"
        }
        if ((i.game as BattleshipGame).gameState?.isMyTurn() == true) {
            myTurn = "1";
        }
        val serialized = (i.game as BattleshipGame).serialize()
        //val recv = (i.game as BattleshipGame).gameState!!.shotsReceivedWithOutcomeToString()
        //val deliv = (i.game as BattleshipGame).gameState!!.shotsFiredWithOutcomeToString()
        return "$i ${i.ownerFid} ${i.participantFid} ${i.startTime} ${i.state} $myTurn $serialized"
    }

    /**
     * Adds a new gameinstance to the list. Returns the index of the created instance.
     * You can always create a new game. Limitation only kicks in on participant's side.
     */
    fun addOwnGame(gameType: String, ownerFid: String, initialState: GameStates): Int {
        val currentTime = System.currentTimeMillis()
        addInstanceToList(GameInstance(gameType, ownerFid, currentTime, initialState))
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

    fun answerPeerRequest(s: String) {
        //public_post_game_request(s)
    }

    fun isIdEqualToMine(id: String): Boolean {
        Log.d("BSH isEqualToMine", myId.toRef() + " " + id)
        return myId.toRef() == id
    }


}