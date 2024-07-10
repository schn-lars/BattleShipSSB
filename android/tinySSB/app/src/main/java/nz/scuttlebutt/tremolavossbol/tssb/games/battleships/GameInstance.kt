package nz.scuttlebutt.tremolavossbol.tssb.games.battleships

import nz.scuttlebutt.tremolavossbol.games.battleShips.BattleshipGame
import nz.scuttlebutt.tremolavossbol.tssb.games.battleships.GameState

/**
 * This class represents a Instance of a Battleship game. The peerfid is the ID of the opponent.
 * The state marks the progress in the game. STOPPED is the default state.
 */
class GameInstance() {
    var game : BattleshipGame = BattleshipGame()
    var peerFid : String? = null
    var state : GameState = GameState.STOPPED

    @JvmName("setState1")
    fun setState(state: GameState) {
        this.state = state
    }

    @JvmName("getState1")
    fun getState() : GameState {
        return state
    }

    fun setFid(fid : String) {
        peerFid = fid
    }

    fun getFid() : String? {
        return peerFid
    }

}

