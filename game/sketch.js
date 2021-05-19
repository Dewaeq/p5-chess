let tileSize = 90;
let engineDepth = 3;
const maxEngineDepth = 5;
const fenStartString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

let images = {};
let mainBoard;
let isMovingPiece = false;
let movingPiece = null;
let moves;
let engine;

let posCount = 0;
let calcTime = 0;

function preload() {
    if (displayWidth >= displayHeight) tileSize = (displayHeight * 0.6) / 8;
    else tileSize = (displayWidth * 0.6) / 8;

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
    initUI();
    background(220);

    mainBoard = new Board();
    engine = new Engine();

    mainBoard.fenToBoard(fenStartString);
}

async function draw() {
    if (mainBoard.whitesTurn) return;

    mainBoard.whitesTurn = true;
    await delay(0.1);
    aiMove();
}

function mousePressed() {
    if (!mainBoard.whitesTurn) return;

    let x = floor(mouseX / tileSize);
    let y = floor(mouseY / tileSize);

    if (isMovingPiece && arrayContainsArray(moves.allowedMoves, [x, y], 2)) {
        let pieceIndex = mainBoard.getIndexOfPieceAt(
            movingPiece.x,
            movingPiece.y
        );

        mainBoard.whitesTurn = !mainBoard.whitesTurn;
        isMovingPiece = false;
        movingPiece = null;
        moves = null;

        mainBoard.movePiece(pieceIndex, x, y);

        mainBoard.show();
        setStatus();

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
    const [bestMove, moveValue, newPosCount, newCalcTime] = engine.makeBestMove(
        mainBoard,
        engineDepth,
        false
    );

    if (bestMove === null || bestMove === undefined) {
        alert("Mate or error, idk and i really need to fix this");
        // window.location.reload();
        return;
    }

    posCount = newPosCount;
    calcTime = newCalcTime;

    console.log(`Engines move: ${bestMove}`, `with value: ${moveValue}`);
    console.log(
        `Calculated ${newPosCount} moves`,
        `in: ${newCalcTime / 1000} seconds`
    );
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

    $("#posCountNumber").text(posCount);
    $("#calcTimeNumber").text((calcTime / 1000).toFixed(4));
    $("#calcSpeedNumber").text(((posCount / calcTime) * 1000).toFixed(4));

    if (globalSum > 0) {
        $("#advantageColor").text("White");
        $("#advantageNumber").text(globalSum);
    } else if (globalSum < 0) {
        $("#advantageColor").text("Black");
        $("#advantageNumber").text(-globalSum);
    } else {
        $("#advantageColor").text("Neither side");
        $("#advantageNumber").text(globalSum);
    }
}

function initUI() {
    $("#engine-depth-input").on("input", function () {
        const lastDepth = engineDepth ?? 3;
        try {
            let newDepth = parseInt($(this).val());

            if (newDepth > maxEngineDepth || newDepth <= 0) {
                newDepth =
                    newDepth > maxEngineDepth
                        ? maxEngineDepth
                        : newDepth <= 0
                        ? 1
                        : 3;
                $(this).val(newDepth);
            }

            engineDepth = newDepth;
        } catch {
            engineDepth = lastDepth;
        }
    });

    $("#fen-string-input").val(fenStartString);

    $("#fen-string-input").bind("input", function () {
        const fenString = $(this).val();

        mainBoard.fenToBoard(fenString);
    });

    const canvas = createCanvas(tileSize * 8, tileSize * 8);
    canvas.parent("#canvas");
}
