class MoveModel {
    constructor(allowedMoves = [], unAllowedMoves = [], playerIsMated = false) {
        this.allowedMoves = allowedMoves;
        this.unAllowedMoves = unAllowedMoves;
        this.playerIsMated = playerIsMated;
    }
}