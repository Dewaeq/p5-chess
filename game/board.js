class Board {
    constructor(
        whitesTurn = true,
        // Add a blank piece for type hinting
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
        this.squares = [
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
        ];
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
        background(0);
        noStroke();

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let isWhite = (i + j) % 2 === 0;

                fill(isWhite ? "#F1D7C1" : "#BC5448");
                rect(i * tileSize, j * tileSize, tileSize, tileSize);
            }
        }

        if (this.moveHistory.length > 0) {
            const [piecInd, fromX, fromY, toX, toY, takenPieceInd] =
                this.moveHistory[this.moveHistory.length - 1];
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
        if ((fromX - 2 === toX || fromX + 2 === toX) && (piecInd === this.whKingInd || piecInd === this.blKingInd)) {
            // Castle left
            if (fromX - 2 === toX) {
                const rookIndex = this.getIndexOfPieceAt(toX + 1, toY);
                this.pieces[rookIndex].setPiecePosition([0, toY]);
                this.pieces[rookIndex].hasMoved = false;

                this.squares[toY][toX] = -1;
                this.squares[toY][toX + 1] = -1;
                this.squares[toY][0] = rookIndex;
            }
            // Castle right
            else if (fromX + 2 === toX) {
                const rookIndex = this.getIndexOfPieceAt(toX - 1, toY);
                this.pieces[rookIndex].setPiecePosition([7, toY]);
                this.pieces[rookIndex].hasMoved = false;

                this.squares[toY][toX] = -1;
                this.squares[toY][toX - 1] = -1;
                this.squares[toY][7] = rookIndex;
            }
        }
        // Did this move take a piece?
        else if (takenPieceInd !== undefined && takenPieceInd !== null) {
            this.pieces[takenPieceInd].setPiecePosition([toX, toY]);
            this.pieces[takenPieceInd].taken = false;

            this.squares[toY][toX] = takenPieceInd;

            if (!this.didPieceMoveInHistory(takenPieceInd)) {
                this.pieces[takenPieceInd].hasMoved = false;
            }
        } else {
            this.squares[toY][toX] = -1;
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
        if (this.pieces[piecInd].type === "P" && arrayEquals([toX, toY], this.enPassantSquare.slice(1, 3))) {
            const takenPieceRank = this.pieces[piecInd].isWhite ? 3 : 4;
            const indPiecTaken = this.enPassantSquare[0];
            this.pieces[indPiecTaken].taken = false;
            this.pieces[indPiecTaken].setPiecePosition([toX, takenPieceRank]);

            this.squares[takenPieceRank][toX] = indPiecTaken;

            this.enPassantSquare = [
                indPiecTaken,
                toX,
                this.pieces[indPiecTaken].isWhite ? 5 : 2,
            ];
        }
        // Did this move create the ability to en passant?
        const enPassantRank = this.pieces[piecInd].isWhite ? 4 : 3;
        const pawnStart = this.pieces[piecInd].isWhite ? 6 : 1;
        if (this.pieces[piecInd].type === "P" && fromY === pawnStart && toY === enPassantRank) {
            this.enPassantSquare = [];
        }

        if (!this.didPieceMoveInHistory(piecInd)) {
            this.pieces[piecInd].hasMoved = false;
        }

        this.pieces[piecInd].setPiecePosition([fromX, fromY]);
        this.squares[fromY][fromX] = piecInd;
    }

    /**
     * Same as movePiece, except this doesnt show on the UI
     * @param {number} piecInd the index of the piece to move
     * @param {number} toX move to this x coord
     * @param {number} toY move to this y coord
     */
    testMove(piecInd, toX, toY) {
        if (piecInd < 0) {
            throw ("Negative piece index");
        }
        if (this.pieces[piecInd].taken) {
            throw ("Cant move a taken piece")
        }

        this.didPromote = false;
        const movingPiece = this.pieces[piecInd];
        const oldPos = movingPiece.getPiecePosition();

        let tookAPiece = false;
        let indPiecTaken;

        // Does this move remove the ability to en passant?
        if (
            this.enPassantSquare.length !== 0 &&
            (movingPiece.isWhite ===
                this.pieces[this.enPassantSquare[0]].isWhite ||
                !arrayEquals([toX, toY], this.enPassantSquare.slice(1, 3)))
        ) {
            this.enPassantSquare = [];
        }

        // Does this move take a piece?
        if (movingPiece.canTake(this, toX, toY)) {
            indPiecTaken = this.getIndexOfPieceAt(toX, toY);
            tookAPiece = true;

            if (indPiecTaken === this.blKingInd || indPiecTaken === this.whKingInd) {
                // TODO: this isnt allowed to happen...
            }
            this.pieces[indPiecTaken].taken = true;
            this.pieces[indPiecTaken].hasMoved = true;
            this.pieces[indPiecTaken].x = -1;
            this.pieces[indPiecTaken].y = -1;
            this.squares[toY][toX] = -1;
        }

        // Is this a castling move?
        if (piecInd === this.whKingInd || piecInd === this.blKingInd) {
            // Castle left
            if (toX === movingPiece.x - 2) {
                const rookIndex = this.getIndexOfPieceAt(0, movingPiece.y);
                this.pieces[rookIndex].moveTo(movingPiece.x - 1, movingPiece.y);

                this.squares[movingPiece.y][0] = -1;
                this.squares[movingPiece.y][movingPiece.x - 1] = rookIndex;
            }
            // Castle right
            else if (toX === movingPiece.x + 2) {
                const rookIndex = this.getIndexOfPieceAt(7, movingPiece.y);
                this.pieces[rookIndex].moveTo(movingPiece.x + 1, movingPiece.y);

                this.squares[movingPiece.y][7] = -1;
                this.squares[movingPiece.y][movingPiece.x + 1] = rookIndex;
            }
        }

        // Can this piece promote?
        // Is/leads this move to en passant?
        if (movingPiece.type === "P") {
            /// En passant
            if (arrayEquals([toX, toY], this.enPassantSquare.slice(1, 3))) {
                const indPiecTaken = this.enPassantSquare[0];
                this.pieces[indPiecTaken].taken = true;
                this.pieces[indPiecTaken].x = -1;
                this.pieces[indPiecTaken].y = -1;
            } else if (toY === oldPos[1] + 2 || toY === oldPos[1] - 2) {
                const pawnDir = movingPiece.isWhite ? -1 : 1;
                this.enPassantSquare = [piecInd, toX, toY - pawnDir];
            }

            /// Promotion
            const promoteRank = movingPiece.isWhite ? 0 : 7;
            this.didPromote = true;

            if (toY === promoteRank) {
                this.pieces[piecInd] = new Queen(
                    movingPiece.x,
                    movingPiece.y,
                    movingPiece.isWhite,
                    "Q",
                    false,
                    true
                );
            }
        }

        this.lastMove = [piecInd, movingPiece.x, movingPiece.y, toX, toY];
        if (tookAPiece) this.lastMove.push(indPiecTaken);

        this.pieces[piecInd].moveTo(toX, toY);

        this.squares[toY][toX] = piecInd;
        this.squares[oldPos[1]][oldPos[0]] = -1;

        // Did this move fix our check?
        /* if (this.playerInCheck === (movingPiece.isWhite ? 1 : -1) && !this.isKingInCheck(movingPiece.isWhite)) {
            this.playerInCheck = 0;
        } */
    }

    /**
     * This calls `testMove`, checks for (stale)mate and updates the UI
     * @param {number} piecInd the index of the piece to move
     * @param {number} toX move to this x coord
     * @param {number} toY move to this y coord
     */
    movePiece(piecInd, toX, toY) {
        this.testMove(piecInd, toX, toY);
        this.moveHistory.push(this.lastMove);
        this.show();

        // TODO: replace with more efficient check
        const isWhite = this.pieces[piecInd].isWhite;
        if (Engine.generateMoves(this, !isWhite).length === 0) {
            if (this.isKingInCheck(!isWhite)) {
                this.checkmate(isWhite);
            }
            else {
                this.stalemate();
            }
        }
    }

    fenToBoard(fenString) {
        this.pieces = [];
        this.squares = [
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1],
        ];
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

                const isWhite = isUppercase(char);
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
                this.squares[y][x] = i;
                this.pieces.push(piece);
                i++;
                x += 1;
            });
        }
        this.show();
    }

    boardToFen() {
        let fenString = "";
        for (let y = 0; y < 8; y++) {
            let i = 0;
            for (let x = 0; x < 8; x++) {
                if (this.squares[y][x] < 0) {
                    i++;
                    continue;
                }
                if (i > 0) {
                    fenString += i;
                    i = 0;
                }
                const piece = this.pieces[this.squares[y][x]];
                fenString += piece.isWhite ? piece.type : piece.type.toLowerCase();
            }
            if (i > 0)
                fenString += i;

            if (y < 7)
                fenString += "/";
        }

        if (this.whitesTurn)
            fenString += " w";
        else
            fenString += " b";

        fenString += " ";

        // Castling
        // "A move that temporarily prevents castling does not negate this notation."
        // TODO: this should be "-" when neither side can castle
        [this.pieces[this.whKingInd], this.pieces[this.blKingInd]].forEach(king => {
            if (king.hasMoved) {
                fenString += "--"
            }
            else {
                const rightRookInd = this.squares[king.isWhite ? 7 : 0][0];
                if (rightRookInd < 0)
                    fenString += "-";
                else if (this.pieces[rightRookInd].type !== "R")
                    fenString += "-";
                else if (this.pieces[rightRookInd].isWhite !== king.isWhite)
                    fenString += "-";
                else
                    fenString += `${king.isWhite ? "K" : "k"}`;

                const leftRookInd = this.squares[king.isWhite ? 7 : 0][7];
                if (leftRookInd < 0)
                    fenString += "-";
                else if (this.pieces[leftRookInd].type !== "R")
                    fenString += "-";
                else if (this.pieces[leftRookInd].isWhite !== king.isWhite)
                    fenString += "-";
                else
                    fenString += `${king.isWhite ? "Q" : "q"}`;
            }
        });

        // In FEN notation, the en-passant square is the square behind the pawn
        // Our en-passant square is the square the pawn is standing on
        if (this.enPassantSquare.length > 0) {
            const x = this.enPassantSquare[1];
            const y = this.enPassantSquare[2];

            const rank = String.fromCharCode(x + 97);
            const file = 8 - y;

            fenString += ` ${rank}${file}`;
        } else {
            fenString += " -";
        }

        return fenString;
    }

    /**
     * Highlight the provided moves
     * @param {Array<Array<number>>} moves moves to highlight
     * @param {Array<number>} [color] colour used for move highlighting
     * @returns 
     */
    highLightMoves(moves, color = [10]) {
        if (moves === undefined || moves.length === 0) return;
        moves.forEach((move) => {
            this.highLightMove(move[0], move[1], color);
        });
    }

    /**
     * Display a circle on the square `x, y` in the given colour
     * @param {number} x x coord of the square
     * @param {number} y y coord of the square
     * @param {Array<number>} [color] colour used for move highlighting
     */
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
        let result = new MoveModel();
        const piecInd = this.getIndexOfPieceAt(movingPiece.x, movingPiece.y);

        if (piecInd < 0) {
            console.trace();
            console.error("Negative piece index in validate moves!");
            console.log("board=", this);
            console.log("movingPiece=", movingPiece);

            throw ("Negative piece index error!");
        }

        for (let i = 0, n = moves.length; i < n; i++) {
            // Add the pieces index to the move array if it isnt there already
            if (moves[i].length < 3) {
                moves[i].push(piecInd);
            }
            const move = moves[i];
            const oldPos = [movingPiece.x, movingPiece.y];
            const toSquareOldIndex = this.squares[move[1]][move[0]];

            try {
                this.pieces[piecInd].setPiecePosition(move);
                this.squares[move[1]][move[0]] = piecInd;
                this.squares[oldPos[1]][oldPos[0]] = -1;
            } catch (e) {
                console.error(e);
                console.log("piece index=", piecInd);
                console.log("movingPiece=", movingPiece);
                console.log("move=", move);
                console.log("board pieces=", this.pieces);
                console.log("board squares=", this.squares);
            }

            if (this.isKingInCheck(movingPiece.isWhite)) {
                // 'Fakely' take the piece to check if it
                // fixes the check position
                if (movingPiece.canTake(this, move[0], move[1])) {
                    if (toSquareOldIndex > 0)
                        this.pieces[toSquareOldIndex].setPiecePosition([-1, -1]);

                    if (this.isKingInCheck(movingPiece.isWhite)) {
                        result.unAllowedMoves.push(move);
                    } else {
                        result.allowedMoves.push(move);
                    }
                    if (toSquareOldIndex > 0)
                        this.pieces[toSquareOldIndex].setPiecePosition(move);
                } else {
                    result.unAllowedMoves.push(move);
                }
            } else {
                result.allowedMoves.push(move);
            }
            this.pieces[piecInd].setPiecePosition(oldPos);
            this.squares[oldPos[1]][oldPos[0]] = piecInd;
            this.squares[move[1]][move[0]] = toSquareOldIndex;
        }
        return result;
    }

    /// Static-ish functions, no data is modified
    ///-----------------------------------------------------------------------------

    clone() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    didPieceMoveInHistory(piecInd) {
        if (piecInd < 0) return false;

        for (let i = 0, n = this.moveHistory.length; i < n; i++) {
            const movingPieceInd = this.moveHistory[i][0];

            if (piecInd === movingPieceInd) return true;
        }
        return false;
    }

    /**
     * Return the index of the piece at the given
       coordinates or -1 if there is no piece there
     * @param {number} x 
     * @param {number} y 
     * @returns {number}
     */
    getIndexOfPieceAt(x, y) {
        if (x > 7 || x < 0) return -1;
        if (y > 7 || y < 0) return -1;
        return this.squares[y][x];
    }

    /**
     * Provide a single number as pieceInd or an array of numbers.
       If an array is provided, the function returns true if one or
       more elements are of the required type
     * @param {number | Array<number>} piecInd 
     * @param {string} type 
     * @returns {boolean}
     */
    pieceWithIndexIsOfType(piecInd, type) {
        if (piecInd === undefined || piecInd === null) return false;
        if (type === undefined || type === null) return false;

        if (!Array.isArray(piecInd)) {
            return this.pieces[piecInd].type.toUpperCase() === type.toUpperCase();
        }
        for (let i = 0, n = piecInd.length; i < n; i++) {
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

        const pieceIndex = this.getIndexOfPieceAt(x, y);
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

    /**
     * Is the given square attacked by your opponent?
     * @param {number} x x coord
     * @param {number} y y coord
     * @param {boolean} isWhite true if the attacker is white
     * @returns {boolean} true if the given square is attacked by the opponent
     */
    isSquareAttacked(x, y, isWhite) {
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "P"))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "N"))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "B"))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "R"))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "Q"))
            return true;
        if (this.isSquareAttackedByPieceOfType(x, y, isWhite, "K"))
            return true;

        return false;
    }

    /**
     * Is the square attacked by a piece of the provided type?
     * @param {number} x x coord
     * @param {number} y y coord
     * @param {boolean} isWhite true if the attacker is white
     * @param {string} type the type of the attacking piece
     * @returns {boolean} true if the square is attacked by a piece of the provided type
     */
    isSquareAttackedByPieceOfType(x, y, isWhite, type) {
        switch (type) {
            case "P": {
                const upDir = isWhite ? 1 : -1;
                const dir = [[1, upDir], [-1, upDir]];

                for (let i = 0; i < dir.length; i++) {
                    const newX = x + dir[i][0];
                    const newY = y + dir[i][1];

                    if (newX > 7 || newX < 0) continue;
                    if (newY > 7 || newY < 0) continue;

                    const index = this.getIndexOfPieceAt(newX, newY);
                    if (index < 0)
                        continue;
                    if (this.pieces[index].isWhite !== isWhite)
                        continue;
                    if (this.pieces[index].type === type)
                        return true;
                }
                return false;
            }
            case "N": {
                const dir = [[1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2]];
                for (let i = 0; i < dir.length; i++) {
                    const newX = x + dir[i][0];
                    const newY = y + dir[i][1];

                    if (newX > 7 || newX < 0) continue;
                    if (newY > 7 || newY < 0) continue;

                    const index = this.getIndexOfPieceAt(newX, newY);
                    if (index < 0)
                        continue;
                    if (this.pieces[index].isWhite !== isWhite)
                        continue;
                    if (this.pieces[index].type === type)
                        return true;
                }
                return false;
            }
            case "B": {
                const dir = [[1, -1], [1, 1], [-1, 1], [-1, -1]];
                for (let i = 0; i < dir.length; i++) {
                    for (let j = 1; j < 9; j++) {
                        const newX = x + dir[i][0] * j;
                        const newY = y + dir[i][1] * j;

                        if (newX > 7 || newX < 0) break;
                        if (newY > 7 || newY < 0) break;

                        const index = this.getIndexOfPieceAt(newX, newY);
                        if (index < 0)
                            continue;
                        // Stop sliding if there's a piece in between
                        if (this.pieces[index].isWhite !== isWhite || this.pieces[index].type !== type)
                            break;
                        if (this.pieces[index].type === type)
                            return true;
                    }
                }
                return false;
            }
            case "R": {
                const dir = [[0, -1], [1, 0], [0, 1], [-1, 0]];
                for (let i = 0; i < dir.length; i++) {
                    for (let j = 1; j < 9; j++) {
                        const newX = x + dir[i][0] * j;
                        const newY = y + dir[i][1] * j;

                        if (newX > 7 || newX < 0) break;
                        if (newY > 7 || newY < 0) break;

                        const index = this.getIndexOfPieceAt(newX, newY);
                        if (index < 0)
                            continue;
                        if (this.pieces[index].isWhite !== isWhite || this.pieces[index].type !== type)
                            break;
                        if (this.pieces[index].type === type)
                            return true;

                    }
                }
                return false;
            }
            case "Q": {
                const dir = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
                for (let i = 0; i < dir.length; i++) {
                    for (let j = 1; j < 9; j++) {
                        const newX = x + dir[i][0] * j;
                        const newY = y + dir[i][1] * j;

                        if (newX > 7 || newX < 0) break;
                        if (newY > 7 || newY < 0) break;

                        const index = this.getIndexOfPieceAt(newX, newY);
                        if (index < 0)
                            continue;
                        if (this.pieces[index].isWhite !== isWhite || this.pieces[index].type !== type)
                            break;
                        if (this.pieces[index].type === type)
                            return true;
                    }
                }
                return false;
            }
            case "K": {
                const dir = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
                for (let i = 0; i < dir.length; i++) {
                    const newX = x + dir[i][0];
                    const newY = y + dir[i][1];

                    if (newX > 7 || newX < 0) continue;
                    if (newY > 7 || newY < 0) continue;

                    const index = this.getIndexOfPieceAt(newX, newY);
                    if (index < 0)
                        continue;
                    if (this.pieces[index].isWhite !== isWhite)
                        continue;
                    if (this.pieces[index].type === type)
                        return true;
                }
                return false;
            }
            default:
                return false;
        }
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

    /**
     * Return true if the king `isWhite` is in check.
     * @param {boolean} isWhite true if our king is white
     * @returns {boolean} true if the king of the given colour is in check
     */
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

        const defKing = this.pieces[isWhite ? this.whKingInd : this.blKingInd];
        return this.isSquareAttacked(defKing.x, defKing.y, !isWhite, false);
    }
}
