package nz.scuttlebutt.tremolavossbol.games.battleShips

/**
 * Simple enum to define directions on the playing field
 */
enum class Direction(val string: String) {
    UP("UP"),
    DOWN("DOWN"),
    RIGHT("RIGHT"),
    LEFT("LEFT");

    override fun toString(): String {
        when (this.string) {
            "UP" -> {
                return "U";
            }
            "DOWN" -> {
                return "D";
            }
            "LEFT" -> {
                return "L"
            }
            "RIGHT" -> {
                return "R"
            }
        }
        return ""
    }
}