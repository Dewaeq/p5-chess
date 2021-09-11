importScripts(["../ai/search.js",]);
importScripts("../ai/move_generator.js");
importScripts("../ai/evaluation.js");
importScripts("../ai/precomputed_data.js");
importScripts("../ai/move_ordering.js");
importScripts("../ai/values.js");
importScripts("../core/piece_list.js");
importScripts("../core/move.js");
importScripts("../core/board.js");
importScripts("../core/constants.js");
importScripts("../core/piece.js");
importScripts("../other/random.js");
importScripts("../core/zobrist.js");
importScripts("../core/board_representation.js");
importScripts("../other/utils.js");

onmessage = (message) => {
    PrecomputedData.Init();
    Zobrist.Init();

    const searchSettings = message.data;
    const board = new Board();
    board.init()

    mapPieceList(searchSettings.board.pawns, board.pawns);
    mapPieceList(searchSettings.board.knights, board.knights);
    mapPieceList(searchSettings.board.bishops, board.bishops);
    mapPieceList(searchSettings.board.rooks, board.rooks);
    mapPieceList(searchSettings.board.queens, board.queens);

    const emptyList = new PieceList(0);

    board.allPieceLists = [
        emptyList,
        emptyList,
        board.pawns[WHITE_INDEX],
        board.knights[WHITE_INDEX],
        emptyList,
        board.bishops[WHITE_INDEX],
        board.rooks[WHITE_INDEX],
        board.queens[WHITE_INDEX],
        // Black pieces
        emptyList,
        emptyList,
        board.pawns[BLACK_INDEX],
        board.knights[BLACK_INDEX],
        emptyList,
        board.bishops[BLACK_INDEX],
        board.rooks[BLACK_INDEX],
        board.queens[BLACK_INDEX],
    ];

    board.kingSquares = searchSettings.board.kingSquares;
    board.squares = searchSettings.board.squares;
    board.zobristKey = searchSettings.board.zobristKey;

    board.colourToMove = searchSettings.board.colourToMove;
    board.colourToMoveIndex = searchSettings.board.colourToMoveIndex;
    board.opponentColour = searchSettings.board.opponentColour;
    board.currentGameState = searchSettings.board.currentGameState;
    board.gameStateIndex = searchSettings.board.gameStateIndex;
    board.gameStateHistory = searchSettings.board.gameStateHistory;

    const search = new Search(board, function () { });
    search.searchQuiescencent = searchSettings.searchQuiescencent;
    search.orderMoves = searchSettings.orderMoves;
    search.bestEvalThisIteration = searchSettings.bestEvalThisIteration;
    search.bestMoveThisIteration = searchSettings.bestMoveThisIteration;

    search.startSearch(searchSettings.depth);

    const result = new SearchWorkerResult(
        search.bestMove.moveValue,
        search.bestEval,
        search.numNodes,
        search.numQNodes,
        search.numCutOffs,
        searchSettings.depth,
    );

    postMessage(result)
}


const mapPieceList = (fromList, toList) => {
    for (let i = 0; i < 2; i++) {
        toList[i].numPieces = fromList[i].numPieces;
        toList[i].map = fromList[i].map;
        toList[i].occupiedSquares = fromList[i].occupiedSquares;
    }
}