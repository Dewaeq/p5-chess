importScripts(
    "../../core/board.js",
    "../../core/board_representation.js",
    "../../core/move.js",
    "../../core/constants.js",
    "../../core/piece_list.js",
    "../../core/piece.js",
    "../../core/zobrist.js",
    "../../ai/move_generator.js",
    "../../ai/precomputed_data.js",
    "../../other/utils.js",
    "../../other/book/book.js",
    "../../other/pgn_loader.js",
    "../../other/random.js",
);

onmessage = async (msg) => {
    await Zobrist.Init();
    PrecomputedData.Init();

    const lines = msg.data;
    const book = new Book();
    const board = new Board();

    for (const line of lines) {
        if (line.split(" ").length < MIN_MOVE_COUNT) {
            continue;
        }
        board.fenToBoard(fenStartString);
        const moves = PGNLoader.MovesFromPGN(line, MAX_BOOK_MOVES);

        for (const move of moves) {
            book.add(board.zobristKey[0], board.zobristKey[1], move);
            board.makeMove(move);
        }
    }

    postMessage(book);
};
