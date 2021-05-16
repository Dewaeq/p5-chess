const tileSize = 90;
const fenStartString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

let images = {};
let mainBoard;
let isMovingPiece = false;
let movingPiece = null;
let moves;
let engine;

function preload() {
    let fileExt = ".png";

    for (let i = 0; i < 2; i++) {
        let pieceColor = i === 0 ? "white" : "black";
        images[`${pieceColor}-king`] = loadImage(
            `../assets/images/${pieceColor}/${pieceColor}-king${fileExt}`
        );
        images[`${pieceColor}-queen`] = loadImage(
            `../assets/images/${pieceColor}/${pieceColor}-queen${fileExt}`
        );
        images[`${pieceColor}-rook`] = loadImage(
            `../assets/images/${pieceColor}/${pieceColor}-rook${fileExt}`
        );
        images[`${pieceColor}-bishop`] = loadImage(
            `../assets/images/${pieceColor}/${pieceColor}-bishop${fileExt}`
        );
        images[`${pieceColor}-knight`] = loadImage(
            `../assets/images/${pieceColor}/${pieceColor}-knight${fileExt}`
        );
        images[`${pieceColor}-pawn`] = loadImage(
            `../assets/images/${pieceColor}/${pieceColor}-pawn${fileExt}`
        );
    }
}

function setup() {
    const canvas = createCanvas(tileSize * 8, tileSize * 8);
    canvas.parent("#canvas");
    background(220);

    mainBoard = new Board();
    engine = new Engine();

    mainBoard.fenToBoard(fenStartString);

    /* let input = createInput(fenStartString);
    input.position((windowWidth - width * 0.85) / 2, windowHeight - 60);
    input.size(width * 0.85);

    input.changed(() => {
        let fenString =
            input.value().length > 0 ? input.value() : fenStartString;
        mainBoard.fenToBoard(fenString);
    }); */
}

function mousePressed() {
    /* if (!mainBoard.whitesTurn) {
        aiMove();
    } */

    let x = floor(mouseX / tileSize);
    let y = floor(mouseY / tileSize);

    if (isMovingPiece && arrayContainsArray(moves.allowedMoves, [x, y], 2)) {
        let pieceIndex = mainBoard.getIndexOfPieceAt(
            movingPiece.x,
            movingPiece.y
        );
        mainBoard.movePiece(pieceIndex, x, y);

        mainBoard.whitesTurn = !mainBoard.whitesTurn;
        isMovingPiece = false;
        movingPiece = null;
        moves = null;

        mainBoard.show();
        setStatus();

        aiMove();
        return;
    }

    mainBoard.show();

    let pieceIndex = mainBoard.getIndexOfPieceAt(x, y);
    if (
        pieceIndex < 0 ||
        mainBoard.pieces[pieceIndex].isWhite !== mainBoard.whitesTurn
    ) {
        isMovingPiece = false;
        setStatus();
        return;
    }

    movingPiece = mainBoard.pieces[pieceIndex];
    isMovingPiece = true;

    moves = mainBoard.pieces[pieceIndex].getPossibleMoves(mainBoard);
    mainBoard.highLightMoves(moves.allowedMoves, [10, 160, 50, 120]);
    mainBoard.highLightMoves(moves.unAllowedMoves, [140, 0, 20, 120]);
    setStatus();
}

function aiMove() {
    if (mainBoard.whitesTurn) return;

    const [bestMove, moveValue] = engine.makeBestMove(mainBoard, 2, false);

    if (bestMove === null || bestMove === undefined) {
        alert("Mate or error, idk and i really need to fix this");
        // window.location.reload();
        return;
    }

    console.log("Engines move: ", bestMove, "with value: ", moveValue);
    mainBoard.movePiece(bestMove[2], bestMove[0], bestMove[1]);

    mainBoard.whitesTurn = true;
    setStatus();
}

function setStatus() {
    const globalSum = engine.evaluateBoard(mainBoard);
    const fillWidth =
        globalSum === 0 ? 50 : mapToRange(globalSum, -4000, 4000, 0, 100);

    $("#advantageBar").attr({
        "aria-valuenow": `${globalSum}`,
        style: `width: ${fillWidth}%`,
    });
}
