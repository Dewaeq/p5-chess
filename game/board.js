class Board {
    constructor(
        // Add a blank piece for type hinting
        whitesTurn = true,
        pieces = [new Piece(-1, -1, true, "P")],
        whKingIndex = 0,
        blKingIndex = 0,
        playerInCheck = 0,
        lastMove = [],
        moveHistory = [],
        enPassantSquare = [],
        didPromote = false
    ) {
        this.whitesTurn = whitesTurn;
        this.pieces = pieces;
        this.whKingInd = whKingIndex;
        this.blKingInd = blKingIndex;
        // -1 means black is in check, 1 means white is in check
        this.playerInCheck = playerInCheck;
        // Format is [piecInd, fromX, fromY, toX, toY, takenPieceInd?]
        this.lastMove = lastMove;
        this.moveHistory = moveHistory;
        // Format is [piecInd, x, y]
        this.enPassantSquare = enPassantSquare;
        this.didPromote = didPromote;
    }

    show() {
        // Very bad mate check
        if (this.pieces[this.blKingInd].taken) {
            console.trace();
            return this.checkmate(true);
        }
        if (this.pieces[this.whKingInd].taken) {
            console.trace();
            return this.checkmate(false);
        }

        background(0);
        noStroke();

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let isWhite = (i + j) % 2 === 0;

                fill(isWhite ? "#F1D7C1" : "#BC5448");
                rect(i * tileSize, j * tileSize, tileSize, tileSize);
            }
        }
        let moveDepthLimit = 0;
        if (this.moveHistory.length >= 2) {
            moveDepthLimit = 2;
        } else if (this.moveHistory.length > 0) {
            moveDepthLimit = 1;
        }

        for (let i = 0; i < moveDepthLimit; i++) {
            const [piecInd, fromX, fromY, toX, toY, takenPieceInd] =
                this.moveHistory[this.moveHistory.length - i - 1];
            if (piecInd !== undefined && piecInd !== null) {
                fill("#FFCE88");
                rect(fromX * tileSize, fromY * tileSize, tileSize, tileSize);

                fill("#DBA671");
                rect(toX * tileSize, toY * tileSize, tileSize, tileSize);
            }
        }

        this.pieces.forEach((piece) => {
            piece.show();
        });
    }

    undoLastMove() {
        if (this.lastMove.length === 0) {
            throw "Cant undo last move, there are no moves saved in memory";
        }

        const [piecInd, fromX, fromY, toX, toY, takenPieceInd] = this.lastMove;
        // Was it a castling move?
        if (
            (fromX - 2 === toX || fromX + 2 === toX) &&
            (piecInd === this.whKingInd || piecInd === this.blKingInd)
        ) {
            console.log("this was a castling move");
            // Castle left
            if (fromX - 2 === toX) {
                let rookIndex = this.getIndexOfPieceAt(toX + 1, toY);
                this.pieces[rookIndex].setPiecePosition([0, toY]);
                this.pieces[rookIndex].hasMoved = false;
            }
            // Castle right
            else if (fromX + 2 === toX) {
                let rookIndex = this.getIndexOfPieceAt(toX - 1, toY);
                this.pieces[rookIndex].setPiecePosition([7, toY]);
                this.pieces[rookIndex].hasMoved = false;
            }
        }
        // Did this move take a piece?
        else if (takenPieceInd !== undefined && takenPieceInd !== null) {
            this.pieces[takenPieceInd].setPiecePosition([toX, toY]);
            this.pieces[takenPieceInd].taken = false;

            if (!this.didPieceMoveInHistory(takenPieceInd))
                this.pieces[takenPieceInd].hasMoved = false;
        }
        // Was this move a promotion?
        if (this.didPromote) {
            const oldPiece = this.pieces[piecInd];
            this.pieces[piecInd] = new Pawn(
                fromX,
                fromY,
                oldPiece.isWhite,
                "P",
                false,
                true
            );
        }

        // Was this an en passant move?
        if (
            this.pieces[piecInd].type === "P" &&
            arrayEquals([toX, toY], this.enPassantSquare.slice(1, 3))
        ) {
            const takenPieceRank = this.pieces[piecInd].isWhite ? 3 : 4;
            const indPiecTaken = this.enPassantSquare[0];
            this.pieces[indPiecTaken].taken = false;
            this.pieces[indPiecTaken].setPiecePosition([toX, takenPieceRank]);

            this.enPassantSquare = [
                indPiecTaken,
                toX,
                this.pieces[indPiecTaken].isWhite ? 5 : 2,
            ];
        }
        // Did this move create the ability to en passant?
        const enPassantRank = this.pieces[piecInd].isWhite ? 4 : 3;
        const pawnStart = this.pieces[piecInd].isWhite ? 6 : 1;
        if (
            this.pieces[piecInd].type === "P" &&
            fromY === pawnStart &&
            toY === enPassantRank
        ) {
            this.enPassantSquare = [];
        }

        if (!this.didPieceMoveInHistory(piecInd))
            this.pieces[piecInd].hasMoved = false;
        this.pieces[piecInd].setPiecePosition([fromX, fromY]);
    }

    // Same as movePiece, except this doesnt show
    // on the UI.
    testMove(piecInd, toX, toY) {
        if (piecInd < 0) return false;
        if (this.pieces[piecInd].taken) return false;

        this.didPromote = false;

        let tookAPiece = false;
        let indPiecTaken;

        // Does this move remove the ability to en passant?
        if (
            this.enPassantSquare.length !== 0 &&
            (this.pieces[piecInd].isWhite ===
                this.pieces[this.enPassantSquare[0]].isWhite ||
                !arrayEquals([toX, toY], this.enPassantSquare.slice(1, 3)))
        ) {
            this.enPassantSquare = [];
        }

        // Does this move take a piece?
        if (this.pieces[piecInd].canTake(this, toX, toY)) {
            indPiecTaken = this.getIndexOfPieceAt(toX, toY);
            tookAPiece = true;

            if (
                indPiecTaken === this.blKingInd ||
                indPiecTaken === this.whKingInd
            ) {
                // TODO: this isnt allowed to happen...
            }
            this.pieces[indPiecTaken].taken = true;
            this.pieces[indPiecTaken].hasMoved = true;
            this.pieces[indPiecTaken].x = -1;
            this.pieces[indPiecTaken].y = -1;
        }

        // Is this a castling move?
        if (piecInd === this.whKingInd || piecInd === this.blKingInd) {
            let king = this.pieces[piecInd];

            // Castle left
            if (toX === king.x - 2) {
                let rookIndex = this.getIndexOfPieceAt(0, king.y);
                this.pieces[rookIndex].moveTo(king.x - 1, king.y);
            }
            // Castle right
            else if (toX === king.x + 2) {
                let rookIndex = this.getIndexOfPieceAt(7, king.y);
                this.pieces[rookIndex].moveTo(king.x + 1, king.y);
            }
        }

        // Can this piece promote?
        // Is/leads this move to en passant?
        if (this.pieces[piecInd].type.toUpperCase() === "P") {
            /// En passant
            if (arrayEquals([toX, toY], this.enPassantSquare.slice(1, 3))) {
                const indPiecTaken = this.enPassantSquare[0];
                this.pieces[indPiecTaken].taken = true;
                this.pieces[indPiecTaken].x = -1;
                this.pieces[indPiecTaken].y = -1;
            } else if (
                toY === this.pieces[piecInd].y + 2 ||
                toY === this.pieces[piecInd].y - 2
            ) {
                const pawnDir = this.pieces[piecInd].isWhite ? -1 : 1;
                this.enPassantSquare = [piecInd, toX, toY - pawnDir];
            }

            /// Promotion
            const promoteRank = this.pieces[piecInd].isWhite ? 0 : 7;
            this.didPromote = true;

            if (toY === promoteRank) {
                const oldPiece = this.pieces[piecInd];

                this.pieces[piecInd] = new Queen(
                    oldPiece.x,
                    oldPiece.y,
                    oldPiece.isWhite,
                    "Q",
                    false,
                    true
                );
            }
        }

        this.lastMove = [
            piecInd,
            this.pieces[piecInd].x,
            this.pieces[piecInd].y,
            toX,
            toY,
        ];
        if (tookAPiece) this.lastMove.push(indPiecTaken);

        this.pieces[piecInd].moveTo(toX, toY);

        // Did this move fix our check?
        if (
            this.playerInCheck === (this.pieces[piecInd].isWhite ? 1 : -1) &&
            !this.isKingInCheck(this.pieces[piecInd].isWhite)
        ) {
            this.playerInCheck = 0;
        }
    }

    async movePiece(piecInd, toX, toY) {
        this.testMove(piecInd, toX, toY);
        this.moveHistory.push(this.lastMove);
        this.show();

        // TODO: replace with more efficient check
        const isWhite = this.pieces[piecInd].isWhite;
        if (engine.generateMoves(this, !isWhite).length === 0) {
            if (this.isKingInCheck(!isWhite)) this.checkmate(isWhite);
            else this.stalemate();
        }
    }

    fenToBoard(fenString) {
        this.pieces = [];
        this.moveHistory = [];
        this.lastMove = [];

        /// Get rid of the extra data included in fen strings
        /// like if the player can castle of if an en-passsant
        /// is possible.
        /// TODO: Might want to add this functionality in the future
        let firstSpaceIndex = fenString.indexOf(" ");
        fenString = fenString.substring(
            0,
            firstSpaceIndex > 0 ? firstSpaceIndex : fenString.length
        );
        let fenRows = fenString.split("/");
        // This represents the total amount of pieces when the loop
        // is complete
        let i = 0;
        for (let y = 0; y < fenRows.length; y++) {
            let row = fenRows[y].split("");

            let x = 0;
            row.forEach((char) => {
                if (char === "8") return;

                if (isNumeric(char)) {
                    return (x += parseInt(char));
                }

                let isWhite = isUppercase(char);
                let piece = new Pawn(x, y, isWhite, "P");

                switch (char.toUpperCase()) {
                    case "K":
                        piece = new King(x, y, isWhite, char);

                        if (isWhite) this.whKingInd = i;
                        else this.blKingInd = i;
                        break;
                    case "Q":
                        piece = new Queen(x, y, isWhite, char);
                        break;
                    case "R":
                        piece = new Rook(x, y, isWhite, char);
                        break;
                    case "B":
                        piece = new Bishop(x, y, isWhite, char);
                        break;
                    case "N":
                        piece = new Knight(x, y, isWhite, char);
                        break;
                    case "P":
                        piece = new Pawn(x, y, isWhite, char);
                        break;
                }

                this.pieces.push(piece);
                i++;
                x += 1;
            });
        }
        this.show();
    }

    highLightMoves(moves, color = [10]) {
        if (moves === undefined || moves.length === 0) return;
        moves.forEach((move) => {
            this.highLightMove(move[0], move[1], color);
        });
    }

    highLightMove(x, y, color) {
        fill(...color);
        ellipse(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            tileSize / 2,
            tileSize / 2
        );
    }

    validateMoves(movingPiece, moves = []) {
        const piecInd = this.getIndexOfPieceAt(movingPiece.x, movingPiece.y);
        let result = new MoveModel();

        for (let i = 0; i < moves.length; i++) {
            // Add the pieces index to the move array if it isnt there already
            if (moves[i].length < 3) {
                moves[i].push(piecInd);
            }
            const move = moves[i];
            const oldPos = this.pieces[piecInd].getPiecePosition();
            this.pieces[piecInd].setPiecePosition(move);

            if (this.isKingInCheck(movingPiece.isWhite)) {
                // 'Fakely' take the piece to check if it
                // fixes the check position
                if (movingPiece.canTake(this, move[0], move[1])) {
                    const takenPieceIndex = this.getIndexOfPieceAt(
                        move[0],
                        move[1]
                    );
                    this.pieces[takenPieceIndex].setPiecePosition([-1, -1]);

                    if (this.isKingInCheck(movingPiece.isWhite)) {
                        result.unAllowedMoves.push(move);
                    } else result.allowedMoves.push(move);

                    this.pieces[takenPieceIndex].setPiecePosition(move);
                } else {
                    result.unAllowedMoves.push(move);
                }
            } else {
                result.allowedMoves.push(move);
            }
            this.pieces[piecInd].setPiecePosition(oldPos);
        }

        // We might be mated if there arent any allowed moves
        if (
            result.allowedMoves.length === 0 &&
            this.isKingInCheck(movingPiece.isWhite) &&
            this.playerInCheck !== (movingPiece.isWhite ? 1 : -1)
        ) {
            this.playerInCheck = movingPiece.isWhite ? 1 : -1;
            if (engine.generateMoves(this, movingPiece.isWhite).length === 0) {
                console.log("this should be mate/engine predicts mate ?????");
            }
        }

        return result;
    }

    /// Static-ish functions, no data is modified
    ///-------------------------------------------------------------------

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    didPieceMoveInHistory(piecInd) {
        if (piecInd < 0) return false;

        for (let i = 0; i < this.moveHistory.length; i++) {
            const movingPieceInd = this.moveHistory[i][0];

            if (piecInd === movingPieceInd) return true;
        }
        return false;
    }

    // Return the index of the piece at the given
    // coordinates or -1 if there is no piece there
    getIndexOfPieceAt(x, y) {
        for (let i = 0; i < this.pieces.length; i++) {
            let piece = this.pieces[i];

            let piecePosition = piece.getPiecePosition();

            if (arrayEquals([x, y], piecePosition) && !piece.taken) return i;
        }
        return -1;
    }

    // Provide a single number as pieceInd or an array or numbers.
    // If an array is provided, the function returns true if one or
    // more elements are of the required type
    pieceWithIndexIsOfType(piecInd, type) {
        if (piecInd === undefined || piecInd === null) return false;
        if (type === undefined || type === null) return false;

        if (!Array.isArray(piecInd)) {
            return (
                this.pieces[piecInd].type.toUpperCase() === type.toUpperCase()
            );
        }
        for (let i = 0; i < piecInd.length; i++) {
            let index = piecInd[i];

            if (this.pieces[index].type === type.toUpperCase()) {
                return true;
            }
        }

        return false;
    }

    isSquareFree(x, y) {
        if (x < 0) return false;
        if (x > 7) return false;
        if (y < 0) return false;
        if (y > 7) return false;

        let pieceIndex = mainBoard.getIndexOfPieceAt(x, y);
        return pieceIndex < 0;
    }

    canEnPassant(piece, x, y) {
        if (this.enPassantSquare.length === 0) return false;
        if (!arrayEquals([x, y], this.enPassantSquare.slice(1, 3)))
            return false;
        if (piece.isWhite === this.pieces[this.enPassantSquare[0]].isWhite)
            return false;

        return true;
    }

    // Is this square attacked?
    // `isWhite` represents the color of the defender.
    // use `validate` to add check detection
    isSquareAttacked(x, y, isWhite, validate = true) {
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "P", validate))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "N", validate))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "B", validate))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "R", validate))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "Q", validate))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "K", validate))
            return true;

        return false;
    }

    isSquareAttackedByPieceOfType(x, y, isWhite, type, validate) {
        let piece;

        if (type === "P") piece = new Pawn(x, y, isWhite, type);
        else if (type === "N") piece = new Knight(x, y, isWhite, type);
        else if (type === "B") piece = new Bishop(x, y, isWhite, type);
        else if (type === "R") piece = new Rook(x, y, isWhite, type);
        else if (type === "Q") piece = new Queen(x, y, isWhite, type);
        else if (type === "K") piece = new King(x, y, isWhite, type);
        else return false;

        let attackedPieces = getAttackedPiecesIndices(
            piece.getPossibleMoves(this, validate).allowedMoves,
            this,
            piece
        );

        if (this.pieceWithIndexIsOfType(attackedPieces, type)) {
            return true;
        }
        return false;
    }

    checkmate(isWhite) {
        alert("Checkmate: " + (isWhite ? "White won" : "Black won"));
        gameOver = true;
        // window.location.reload();
    }
    stalemate() {
        alert("Stalemate");
        gameOver = true;
    }

    // Return true if the king `isWhite` is in check.
    isKingInCheck(isWhite) {
        // Below code is inspired by an idea of reddit user 'Aswole'
        /*
         * "One technique that I found more performant than iterating through each
         * opposing piece and checking to see whether it can capture your king is
         * to flip the script: check to see if your king can capture an opposing
         * piece were it the same piece. So basically: search diagonals from your
         * king for an opposing bishop/queen, search horizontally/vertically for
         * rook/queen, and do the same for knights and pawns."
         * */

        let defKing = this.pieces[isWhite ? this.whKingInd : this.blKingInd];
        return this.isSquareAttacked(defKing.x, defKing.y, isWhite, false);
    }
}
