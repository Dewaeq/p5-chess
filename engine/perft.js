class PerfTest {

    static RunTests() {
        let results = [];
        TEST_POSITIONS.forEach((pos) => {
            const { count, time } = PerfTest.TestPosition(pos);

            results.push({
                speed: (count / time * 1000).toFixed(4) + " moves/sec",
                depth: pos.depth,
                time: time,
                count: count,
                position: pos.pos,
            });
        });

        console.table(results);
    }

    /**
     * 
     * @param {{pos: string, depth: number, isWhite: boolean}} pos
     * @returns {{count: number, time: number}}
     */
    static TestPosition(pos) {
        console.log(`Testing position ${pos.pos} at depth ${pos.depth} for ${pos.isWhite ? "white" : "black"}`);

        const board = new Board();
        board.fenToBoard(pos.pos);

        const [_, __, posCount, calcTime] = Engine.makeBestMove(board, pos.depth, pos.isWhite);
        return { count: posCount, time: calcTime };
    }
}

const TEST_POSITIONS = [
    {
        pos: "1B1NN2K/3prB2/3R2P1/3p4/7p/1k1p1q2/n3PPP1/8 w - - 0 1",
        depth: 2,
        isWhite: true,
    },
    {
        pos: "n4B1K/P2P2np/2k1p3/8/4R3/1BP2b2/4rp1p/4bQ2 w - - 0 1",
        depth: 2,
        isWhite: false,
    },
    {
        pos: "n2N4/P2k4/1P1p4/3Pb1KR/6P1/Q1pBBP2/q7/4r3 w - - 0 1",
        depth: 2,
        isWhite: true,
    },
]