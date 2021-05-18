function isNumeric(str) {
    return /^\d+$/.test(str);
}

function isUppercase(str) {
    return str === str.toUpperCase();
}

function mapToRange(number, inMin, inMax, outMin, outMax) {
    return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}

function arrayEquals(arrayA, arrayB) {
    if (arrayA === undefined && arrayB !== undefined) return false;
    if (arrayA === null && arrayB !== null) return false;
    if (arrayB === null && arrayA !== null) return false;
    if (arrayB === undefined && arrayA !== undefined) return false;

    if (arrayA.length !== arrayB.length) return false;

    return arrayA.every((value, index) => value === arrayB[index]);
}

function arrayContainsArray(arrayA, arrayB, limit) {
    if (arrayA === undefined || arrayA === null) return false;
    if (arrayB === undefined || arrayB === null) return false;

    if (limit === undefined || limit === null) {
        limit = arrayA.length + 1;
    }

    for (let i = 0; i < arrayA.length; i++) {
        if (arrayEquals(arrayA[i].slice(0, limit), arrayB.slice(0, limit))) {
            return true;
        }
    }
    return false;
}

// Return all the moves that attack an opponents piece.
// All the moves provided in the input must be possible
// by the attacking piece
function getAttackingMoves(moves, board, piece) {
    if (moves === undefined || moves === null) return [];
    if (board === undefined || board === null) return [];
    if (piece === undefined || piece === null) return [];

    let attackers = [];

    for (let i = 0; i < moves.length; i++) {
        let moveX = moves[i][0];
        let moveY = moves[i][1];

        if (piece.canTake(moveX, moveY)) attackers.push(moves[i]);
    }
    return attackers;
}

// Return all the pieces that get attacked attack an opponents piece.
// All the moves provided in the input must be possible
function getAttackedPiecesIndices(moves, board, movingPiece) {
    if (moves === undefined || moves === null) return [];
    if (board === undefined || board === null) return [];
    if (movingPiece === undefined || movingPiece === null) return [];

    let attackers = [];

    for (let i = 0; i < moves.length; i++) {
        let moveX = moves[i][0];
        let moveY = moves[i][1];

        if (movingPiece.canTake(board, moveX, moveY)) {
            let pieceIndex = board.getIndexOfPieceAt(moveX, moveY);
            attackers.push(pieceIndex);
        }
    }
    return attackers;
}

// This doesnt check board.lastMove and piece.hasMoved
// TODO: add this in the future, but we need to change board.undoLastMove for that
// to work
function areBoardsEqual(boardA, boardB) {
    if (boardA.pieces.length !== boardB.pieces.length) {
        console.log("ff");
        return false;
    }
    if (boardA.whKingIndex !== boardB.whKingIndex) {
        console.log("ff");
        return false;
    }
    if (boardA.blKingIndex !== boardB.blKingIndex) {
        console.log("ff");
        return false;
    }
    /* if (!arrayEquals(boardA.lastMove, boardB.lastMove)) {
        console.log("ff");
        return false;
    } */
    if (boardA.whitesTurn !== boardB.whitesTurn) {
        console.log("ff");
        return false;
    }
    if (boardA.playerInCheck !== boardB.playerInCheck) {
        console.log("ff");
        return false;
    }

    for (let i = 0; i < boardA.pieces.length; i++) {
        const pieceA = boardA.pieces[i];
        const pieceB = boardB.pieces[i];

        if (pieceA.x !== pieceB.x) {
            console.log("f");
            console.log(pieceA);
            console.log(pieceB);
            return false;
        }
        if (pieceA.y !== pieceB.y) {
            console.log("f");
            return false;
        }
        if (pieceA.isWhite !== pieceB.isWhite) {
            console.log("f");
            return false;
        }
        if (pieceA.type !== pieceB.type) {
            console.log("f");
            return false;
        }
        if (pieceA.taken !== pieceB.taken) {
            console.log(pieceA);
            console.log(pieceB);
            console.log("f");
            return false;
        }
        /* if (pieceA.hasMoved !== pieceB.hasMoved) {
            console.log(pieceA);
            console.log(pieceB);
            console.log("f");
            return false;
        } */
    }

    return true;
}
