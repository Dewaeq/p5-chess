function isNumeric(str) {
    return /^\d+$/.test(str);
}

function isUppercase(str) {
    return str === str.toUpperCase();
}

function arrayEquals(arrayA, arrayB) {
    if (arrayA === undefined || arrayA === null) return false;
    if (arrayB === undefined || arrayB === null) return false;

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
