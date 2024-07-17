package nz.scuttlebutt.tremolavossbol.tssb.games

import android.util.Log
import nz.scuttlebutt.tremolavossbol.crypto.SSBid
import nz.scuttlebutt.tremolavossbol.games.Game
import nz.scuttlebutt.tremolavossbol.games.battleShips.BattleshipGame
import nz.scuttlebutt.tremolavossbol.tssb.games.battleships.GameStates

/**
 * This class represents a Instance of a Battleship game. The peerfid is the ID of the opponent.
 * The state marks the progress in the game. STOPPED is the default state.
 */
class GameInstance(gameType: String, fid: String, identity: SSBid, time: Long) {
    var myId: SSBid = identity
    var game : Game? = null
    var participantFid : String = "-"
    var ownerFid : String = "-"
    var startTime : Long = 0
    var state : GameStates = GameStates.STOPPED

    init {
        ownerFid = fid
        startTime = time
        game = createGameInstance(gameType)
        if (game == null) {
            Log.d("GameInstance", "Unknown Game.");
        }
    }

    /**
     * This method creates the instance of the desired game.
     */
    private fun createGameInstance(gameType: String): Game? {
        return when (gameType) {
            "BSH" -> BattleshipGame()
            else -> null
        }
    }

    override fun toString(): String {
        return game.toString()
    }

    fun isActive(): Boolean {
        return state.isActive()
    }
}

