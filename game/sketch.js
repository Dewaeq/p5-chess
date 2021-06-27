import { Engine } from "../engine/engine.js";
import { Board } from "./board.js";

export let tileSize = 90;
export let engineDepth = 3;
export const maxEngineDepth = 15;
export const engine = new Engine();
const fenStartString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

export let images = {};
export let mainBoard;
export let isMovingPiece = false;
export let movingPiece = null;
export let gameOver = false;
export let moves;

let posCount = 0;
let calcTime = 0;


const sketch = new p5(function (p5) {
    p5.preload = function () {
        if (p5.displayWidth >= p5.displayHeight) tileSize = (p5.displayHeight * 0.6) / 8;
        else tileSize = (p5.displayWidth * 0.6) / 8;

        let fileExt = ".png";

        for (let i = 0; i < 2; i++) {
            let pieceColor = i === 0 ? "white" : "black";
            images[`${pieceColor}-king`] = p5.loadImage(
                `../assets/images/${pieceColor}/${pieceColor}-king${fileExt}`
            );
            images[`${pieceColor}-queen`] = p5.loadImage(
                `../assets/images/${pieceColor}/${pieceColor}-queen${fileExt}`
            );
            images[`${pieceColor}-rook`] = p5.loadImage(
                `../assets/images/${pieceColor}/${pieceColor}-rook${fileExt}`
            );
            images[`${pieceColor}-bishop`] = p5.loadImage(
                `../assets/images/${pieceColor}/${pieceColor}-bishop${fileExt}`
            );
            images[`${pieceColor}-knight`] = p5.loadImage(
                `../assets/images/${pieceColor}/${pieceColor}-knight${fileExt}`
            );
            images[`${pieceColor}-pawn`] = p5.loadImage(
                `../assets/images/${pieceColor}/${pieceColor}-pawn${fileExt}`
            );
        }
    }

    p5.setup = function () {
        initUI(p5);

        mainBoard = new Board(p5);

        mainBoard.fenToBoard(fenStartString);
    }

    p5.draw = async function () {
        if (gameOver) return;
        if (mainBoard.whitesTurn) return;

        mainBoard.whitesTurn = true;
        await delay(0.1);
        aiMove();
    }

    p5.mousePressed = function () {
        let x = p5.floor(p5.mouseX / tileSize);
        let y = p5.floor(p5.mouseY / tileSize);

        if (x > 7 || x < 0) return;
        if (y > 7 || y < 0) return;

        if (gameOver) {
            mainBoard.show();

            let pieceIndex = mainBoard.getIndexOfPieceAt(x, y);
            if (pieceIndex < 0) {
                return;
            }

            moves = mainBoard.pieces[pieceIndex].getPossibleMoves(mainBoard);
            mainBoard.highLightMoves(moves.allowedMoves, [10, 160, 50, 120]);
            mainBoard.highLightMoves(moves.unAllowedMoves, [140, 0, 20, 120]);
            return;
        }

        if (!mainBoard.whitesTurn) return;

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

        const pieceIndex = mainBoard.getIndexOfPieceAt(x, y);
        if (pieceIndex === undefined) {
            console.log(x, y);
        }
        if (pieceIndex < 0 || mainBoard.pieces[pieceIndex].isWhite !== mainBoard.whitesTurn) {
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
});


function aiMove() {
    if (gameOver) return;

    const [bestMove, moveValue, newPosCount, newCalcTime] = engine.makeBestMove(
        mainBoard,
        engineDepth,
        false
    );

    if (bestMove === null || bestMove === undefined) {
        // alert("Mate or error, idk and i really need to fix this");
        // window.location.reload();
        gameOver = true;
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

function initUI(p5) {
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
        gameOver = false;
        mainBoard.whitesTurn = true;
        isMovingPiece = false;
        movingPiece = null;
        moves = [];
        mainBoard.fenToBoard(fenString);
    });

    const canvas = p5.createCanvas(tileSize * 8, tileSize * 8);
    canvas.parent("#canvas");

    p5.background(220);
}
