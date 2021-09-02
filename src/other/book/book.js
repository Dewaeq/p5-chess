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
        const moveValue = Array.from(position.moves.keys())[index];
        return new Move(moveValue);
    }

    getRandomBookMoveWeighted(lowKey, highKey) {
        const getRandomWeightedValue = (choices) => {
            let sum = 0;
            choices.forEach(([_, weight]) => sum += weight);
            const chance = new Random.Random().integer(0, sum);
            let upto = 0;
            for (const [moveValue, weight] of choices) {
                if (upto + weight >= chance) {
                    return [moveValue, weight];
                }
                upto += weight
            };
        }

        const posKey = Book.KeysToPosKey(lowKey, highKey);
        const position = this.bookPositions.get(posKey);

        const moveValues = Array.from(position.moves.keys());
        const moveWeights = Array.from(position.moves.values());

        let sum = 0;
        for (let i = 0; i < moveWeights.length; i++) {
            sum += moveWeights[i];
        }
        const avg = sum / moveWeights.length;
        for (let i = 0; i < moveWeights.length; i++) {
            const avgOffset = avg - moveWeights[i];
            moveWeights[i] += avgOffset * 0.4;
        }

        const max = Math.max(...moveWeights);
        const moveProbabilities = Array(moveWeights.length);
        for (let i = 0; i < moveWeights.length; i++) {
            moveProbabilities[i] = Math.floor(moveWeights[i] / max * 1000);
        }

        const choices = [];
        for (let i = 0; i < moveValues.length; i++) {
            choices.push([moveValues[i], moveProbabilities[i]]);

        }
        const [moveValue, _] = getRandomWeightedValue(choices);
        return new Move(moveValue);
    }

    getBestBookMove(lowKey, highKey) {
        const posKey = Book.KeysToPosKey(lowKey, highKey);
        const position = this.bookPositions.get(posKey);

        const moveValue = Array.from(position.moves.keys()).sort().slice(-1)[0];
        return new Move(moveValue);
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