importScripts(["../ai/search.js", ]);
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

onmessage = (e) => {
    PrecomputedData.Init();
    Zobrist.Init();
    const [sourceBoard, depth, searchQuiescencent, orderMoves] = e.data;

    const board = new Board();
    board.init()

    mapPieceList(sourceBoard.pawns, board.pawns);
    mapPieceList(sourceBoard.knights, board.knights);
    mapPieceList(sourceBoard.bishops, board.bishops);
    mapPieceList(sourceBoard.rooks, board.rooks);
    mapPieceList(sourceBoard.queens, board.queens);

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

    board.kingSquares = sourceBoard.kingSquares;
    board.squares = sourceBoard.squares;
    board.zobristKey = sourceBoard.zobristKey;

    board.colourToMove = sourceBoard.colourToMove;
    board.colourToMoveIndex = sourceBoard.colourToMoveIndex;
    board.opponentColour = sourceBoard.opponentColour;
    board.currentGameState = sourceBoard.currentGameState;
    board.gameStateIndex = sourceBoard.gameStateIndex;
    board.gameStateHistory = sourceBoard.gameStateHistory;

    const search = new Search(board, function () { });
    search.searchQuiescencent = searchQuiescencent;
    search.orderMoves = orderMoves;

    search.startSearch(depth);

    const result = new SearchWorkerResult(
        search.bestMove.moveValue,
        search.bestEval,
        search.numNodes,
        search.numQNodes,
        search.numCutOffs,
        depth,
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