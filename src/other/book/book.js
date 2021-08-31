class Book {
    constructor() {
        /**@type {Map<string, BookPosition>} */
        this.bookPositions = new Map();
    }

    static KeysToPosKey = (lowKey, highKey) => `${lowKey}|${highKey}`;

    add(lowKey, highKey, move, numTimesPlayed) {
        const posKey = Book.KeysToPosKey(lowKey, highKey);
        if (!this.bookPositions.has(posKey)) {
            this.bookPositions.set(posKey, new BookPosition());
        } else {
            // console.log("hi");
        }

        this.bookPositions.get(posKey).addMove(move, numTimesPlayed);
    }

    hasPosition(lowKey, highKey) {
        const posKey = Book.KeysToPosKey(lowKey, highKey);
        return this.bookPositions.has(posKey);
    }

    getRandomBookMove(lowKey, highKey) {
        const posKey = Book.KeysToPosKey(lowKey, highKey);
        const position = this.bookPositions.get(posKey);

        const prng = new Random.Random();
        const index = prng.integer(0, position.moves.size - 1);
        const keys = Array.from(position.moves.keys());
        return new Move(keys[index]);
    }

}

class BookPosition {
    constructor() {
        /**
         * @type {Map<number, number>}
         */
        this.moves = new Map();
    }

    /**
     * @param {Move} move 
     * @param {number} numTimesPlayed 
     */
    addMove(move, numTimesPlayed = 1) {
        const moveValue = move.moveValue;

        if (this.moves.has(moveValue)) {
            this.moves.set(moveValue, this.moves.get(moveValue) + 1);
        } else {
            this.moves.set(moveValue, numTimesPlayed);
        }
    }
}