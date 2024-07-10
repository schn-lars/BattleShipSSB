package nz.scuttlebutt.tremolavossbol.tssb.games.battleships

enum class GameState(val string: String) {
    STOPPED ("STOPPED"),
    INVITED ("INVITED"),
    WAITING ("WAITING"),
    WON ("WON"),
    LOST ("LOST"),
    RUNNING ("RUNNING");

    override fun toString(): String {
        return this.string
    }
}