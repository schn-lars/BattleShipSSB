package nz.scuttlebutt.tremolavossbol.games.battleShips

/**
 * Enum to describe the outcome of a shot in the game
 */
enum class ShotOutcome(val string: String) {
    MISS("MISS"),
    HIT("HIT"),
    SUNKEN("SUNKEN");

    override fun toString(): String {
        return this.string
    }
}