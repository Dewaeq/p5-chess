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

const TEST_DEPTH = 5;
const USE_CUST_DEPTH = true;

const TEST_POSITIONS = [
    /* {
        pos: "2r1k2r/pp1b1ppp/5n2/8/1Q6/2qBPN2/P4PPP/R3K2R w KQk - 0 18",
        depth: 6,
        isWhite: true,
    }, */
    {
        pos: "5k1r/4bp2/3pbp2/qpr5/1N2P2p/P2RQ3/2P1B1PP/1K1R4 b - - 3 25",
        depth: 6,
        isWhite: false,
    },
    /* {
        pos: "r1b1qrk1/ppp3bp/n2p2p1/3PppBn/2P1P3/2N2P2/PP1QN1PP/R2BK2R b KQ - 0 11",
        depth: 6,
        isWhite: false,
    }, */
    {
        pos: "n2N4/P2k4/1P1p4/3Pb1KR/6P1/Q1pBBP2/q7/4r3 w - - 0 1",
        depth: 2,
        isWhite: true,
    },
    /* {
        pos: "r1bq2k1/pppp1ppp/3n1b2/8/3P1B2/8/PPP2PPP/RN1QrBK1 w - - 0 12",
        depth: 6,
        isWhite: true,
    }, */
    {
        pos: "r3k2r/1ppQbppp/p4n2/4R1B1/8/2P5/PP3PPP/RN4K1 b kq - 0 14",
        depth: 6,
        isWhite: false,
    },
]