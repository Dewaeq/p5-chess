class Piece {
    constructor(x, y, isWhite, type, taken = false, hasMoved = false) {
        this.x = x;
        this.y = y;
        this.isWhite = isWhite;
        this.type = type.toUpperCase();
        this.taken = taken;
        this.hasMoved = hasMoved;
        this.pic = this.typeToPic();
    }

    show() {
        if (this.taken) return;

        fill(this.isWhite ? "#F8F8F8" : "#565352");
        image(
            this.pic,
            this.x * tileSize,
            this.y * tileSize,
            tileSize,
            tileSize
        );
    }

    moveTo(x, y) {
        if (!this.hasMoved) this.hasMoved = true;

        this.x = x;
        this.y = y;
    }


    /**
     * Set the pieces position to the first 2 values of the given array [x, y]
     * @param {Array<number>} position 
     */
    setPiecePosition(position) {
        if (position.length < 2) return;

        this.x = position[0];
        this.y = position[1];
    }

    /**
     * This function is piece-specific
     * @param {Board} board 
     * @param {boolean} [validate] 
     * @returns {MoveModel}
     */
    getPossibleMoves(board, validate = true) {
        return new MoveModel();
    }

    // Straight moves
    // ------------------------------------------------------------------
    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getStraightUpMoves(board) {
        let moves = [];
        let moveX = this.x;

        for (let i = 1; i < this.y + 1; i++) {
            let moveY = this.y - i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getStraightRightMoves(board) {
        let moves = [];
        let moveY = this.y;

        for (let i = 1; i < 7 - this.x + 1; i++) {
            let moveX = this.x + i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getStraightDownMoves(board) {
        let moves = [];
        let moveX = this.x;

        for (let i = 1; i < 7 - this.y + 1; i++) {
            let moveY = this.y + i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getStraightLeftMoves(board) {
        let moves = [];
        let moveY = this.y;

        for (let i = 1; i < this.x + 1; i++) {
            let moveX = this.x - i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    // Diagonal moves
    // --------------------------------------------------------------

    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getDiagonalRightUpMoves(board) {
        let moves = [];
        for (let i = 1; i < 7 - this.x + 1; i++) {
            let moveX = this.x + i;
            let moveY = this.y - i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getDiagonalRightDownMoves(board) {
        let moves = [];
        for (let i = 1; i < 7 - this.x + 1; i++) {
            let moveX = this.x + i;
            let moveY = this.y + i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getDiagonalLeftDownMoves(board) {
        let moves = [];
        for (let i = 1; i < this.x + 1; i++) {
            let moveX = this.x - i;
            let moveY = this.y + i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    /**
     * 
     * @param {Board} board 
     * @returns {Array<Array<number>>}
     */
    getDiagonalLeftUpMoves(board) {
        let moves = [];
        for (let i = 1; i < this.x + 1; i++) {
            let moveX = this.x - i;
            let moveY = this.y - i;

            if (board.isSquareFree(moveX, moveY)) {
                moves.push([moveX, moveY]);
            } else {
                if (this.canTake(board, moveX, moveY))
                    moves.push([moveX, moveY]);

                return moves;
            }
        }
        return moves;
    }

    /// Static-ish functions, no data is modified
    //-----------------------------------------------------------------------------------------------

    /**
     * Check if piece A can take piece B
     * @param {Piece} pieceA 
     * @param {Piece} pieceB 
     * @returns {boolean}
     */
    canTakePiece(pieceA, pieceB) {
        return (pieceA.isWhite !== pieceB.isWhite && !pieceA.taken && !pieceB.taken);
    }

    /**
     * Check if there is a piece we can take at
       the provided coordinates
     * @param {Board} board 
     * @param {number} takeX 
     * @param {number} takeY 
     * @returns {boolean}
     */
    canTake(board, takeX, takeY) {
        if (!this.withinBounds(takeX, takeY)) return false;

        // Is there a piece at that square?
        let pieceIndex = board.getIndexOfPieceAt(takeX, takeY);
        if (pieceIndex >= 0) {
            // Can we take the piece?
            if (this.canTakePiece(this, board.pieces[pieceIndex])) {
                return true;
            }
        }
        return false;
    }

    
    /**
     * Can we go to this square whether it is by taking
       or if the square if free
     * @param {Board} board 
     * @param {number} toX 
     * @param {number} toY 
     * @returns 
     */
    canMoveTo(board, toX, toY) {
        return this.canTake(board, toX, toY) || board.isSquareFree(toX, toY);
    }

    withinBounds(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    typeToPic() {
        const pieceColor = this.isWhite ? "white" : "black";
        let imgPath = `/images/${pieceColor}/`;
        switch (this.type) {
            case "K":
                return images[`${pieceColor}-king`];
            case "Q":
                return images[`${pieceColor}-queen`];
            case "R":
                return images[`${pieceColor}-rook`];
            case "B":
                return images[`${pieceColor}-bishop`];
            case "N":
                return images[`${pieceColor}-knight`];
            case "P":
                return images[`${pieceColor}-pawn`];
        }
        return loadImage(imgPath + ".svg");
    }

    getPiecePosition() {
        if (this.taken) return null;

        return [this.x, this.y];
    }
}

/// The pieces themselves
///-----------------------------------------------------------------------

class King extends Piece {
    constructor(x, y, isWhite, type, taken = false, hasMoved = false) {
        super(x, y, isWhite, type, taken, hasMoved);
    }

    getPossibleMoves(board, validate = true) {
        let moves = [];

        // canCastle calls board.isSquareAttacked, which in turn
        // calls king.getPossibleMoves.
        // We would be stuck in an infinite loop without this check.
        if (validate) {
            if (this.canCastleLeft(board)) moves.push([this.x - 2, this.y]);

            if (this.canCastleRight(board)) moves.push([this.x + 2, this.y]);
        }

        // Square straight above the king
        if (this.canGoToSquare(board, this.x, this.y - 1))
            moves.push([this.x, this.y - 1]);
        // Right up diagonal
        if (this.canGoToSquare(board, this.x + 1, this.y - 1))
            moves.push([this.x + 1, this.y - 1]);
        // Right straight
        if (this.canGoToSquare(board, this.x + 1, this.y))
            moves.push([this.x + 1, this.y]);
        // Right down diagonal
        if (this.canGoToSquare(board, this.x + 1, this.y + 1))
            moves.push([this.x + 1, this.y + 1]);
        // Down straight
        if (this.canGoToSquare(board, this.x, this.y + 1))
            moves.push([this.x, this.y + 1]);
        // Left down diagonal
        if (this.canGoToSquare(board, this.x - 1, this.y + 1))
            moves.push([this.x - 1, this.y + 1]);
        // Left straight
        if (this.canGoToSquare(board, this.x - 1, this.y))
            moves.push([this.x - 1, this.y]);
        // Left up diagonal
        if (this.canGoToSquare(board, this.x - 1, this.y - 1))
            moves.push([this.x - 1, this.y - 1]);

        if (validate) return board.validateMoves(this, moves);

        return new MoveModel(moves);
    }

    canCastleLeft(board) {
        if (this.hasMoved) return false;

        // Check if the rook has moved
        // We know the king hasnt moved so its safe to
        // use his coordinates
        let rookIndex = board.getIndexOfPieceAt(0, this.y);

        if (rookIndex < 0) return false;
        if (board.pieces[rookIndex].type.toUpperCase() !== "R") return false;
        if (board.pieces[rookIndex].isWhite !== this.isWhite) return false;
        if (board.pieces[rookIndex].hasMoved) return false;

        // Check if there are pieces in between
        if (board.getIndexOfPieceAt(1, this.y) >= 0) return false;
        if (board.getIndexOfPieceAt(2, this.y) >= 0) return false;
        if (board.getIndexOfPieceAt(3, this.y) >= 0) return false;

        // Check if any of the passing squares is attacked
        if (board.isSquareAttacked(1, this.y, !this.isWhite, false))
            return false;
        if (board.isSquareAttacked(2, this.y, !this.isWhite, false))
            return false;
        if (board.isSquareAttacked(3, this.y, !this.isWhite, false))
            return false;

        // Youre not allowed to castle when in check
        if (board.isKingInCheck(this.isWhite)) return false;

        return true;
    }

    canCastleRight(board) {
        if (this.hasMoved) return false;

        // Check if the rook has moved
        // We know the king hasnt moved so its safe to
        // use his coordinates
        let rookIndex = board.getIndexOfPieceAt(7, this.y);

        if (rookIndex < 0) return false;
        if (board.pieces[rookIndex].type.toUpperCase() !== "R") return false;
        if (board.pieces[rookIndex].isWhite !== this.isWhite) return false;
        if (board.pieces[rookIndex].hasMoved) return false;

        // Check if there are pieces in between
        if (board.getIndexOfPieceAt(6, this.y) >= 0) return false;
        if (board.getIndexOfPieceAt(5, this.y) >= 0) return false;

        // Check if any of the passing squares is attacked
        if (board.isSquareAttacked(6, this.y, !this.isWhite, false))
            return false;
        if (board.isSquareAttacked(5, this.y, !this.isWhite, false))
            return false;

        // Youre not allowed to castle when in check
        if (board.isKingInCheck(this.isWhite)) return false;

        return true;
    }

    canGoToSquare(board, moveX, moveY) {
        if (this.canTake(board, moveX, moveY)) return true;

        if (board.isSquareFree(moveX, moveY)) return true;

        return false;
    }
}

class Queen extends Piece {
    constructor(x, y, isWhite, type, taken = false, hasMoved = false) {
        super(x, y, isWhite, type, taken, hasMoved);
    }

    getPossibleMoves(board, validate = true) {
        let moves = [];

        // Straight moves
        moves.push(...this.getStraightUpMoves(board));
        moves.push(...this.getStraightRightMoves(board));
        moves.push(...this.getStraightDownMoves(board));
        moves.push(...this.getStraightLeftMoves(board));

        // Diagonal moves
        moves.push(...this.getDiagonalRightUpMoves(board));
        moves.push(...this.getDiagonalLeftUpMoves(board));
        moves.push(...this.getDiagonalRightDownMoves(board));
        moves.push(...this.getDiagonalLeftDownMoves(board));

        if (validate) return board.validateMoves(this, moves);

        return new MoveModel(moves);
    }
}

class Rook extends Piece {
    constructor(x, y, isWhite, type, taken = false, hasMoved = false) {
        super(x, y, isWhite, type, taken, hasMoved);
    }

    getPossibleMoves(board, validate = true) {
        let moves = [];

        moves.push(...this.getStraightUpMoves(board));
        moves.push(...this.getStraightRightMoves(board));
        moves.push(...this.getStraightDownMoves(board));
        moves.push(...this.getStraightLeftMoves(board));

        if (validate) return board.validateMoves(this, moves);

        return new MoveModel(moves);
    }
}

class Bishop extends Piece {
    constructor(x, y, isWhite, type, taken = false, hasMoved = false) {
        super(x, y, isWhite, type, taken, hasMoved);
    }

    getPossibleMoves(board, validate = true) {
        let moves = [];

        moves.push(...this.getDiagonalRightUpMoves(board));
        moves.push(...this.getDiagonalLeftUpMoves(board));
        moves.push(...this.getDiagonalRightDownMoves(board));
        moves.push(...this.getDiagonalLeftDownMoves(board));

        if (validate) return board.validateMoves(this, moves);

        return new MoveModel(moves);
    }
}

class Knight extends Piece {
    constructor(x, y, isWhite, type, taken = false, hasMoved = false) {
        super(x, y, isWhite, type, taken, hasMoved);
    }

    getPossibleMoves(board, validate = true) {
        let moves = [];

        // Right up
        if (this.canMoveTo(board, this.x + 1, this.y - 2)) {
            moves.push([this.x + 1, this.y - 2]);
        }
        // Middle right up
        if (this.canMoveTo(board, this.x + 2, this.y - 1)) {
            moves.push([this.x + 2, this.y - 1]);
        }
        // Middle right down
        if (this.canMoveTo(board, this.x + 2, this.y + 1)) {
            moves.push([this.x + 2, this.y + 1]);
        }
        // Right down
        if (this.canMoveTo(board, this.x + 1, this.y + 2)) {
            moves.push([this.x + 1, this.y + 2]);
        }
        // Left down
        if (this.canMoveTo(board, this.x - 1, this.y + 2)) {
            moves.push([this.x - 1, this.y + 2]);
        }
        // Middle left down
        if (this.canMoveTo(board, this.x - 2, this.y + 1)) {
            moves.push([this.x - 2, this.y + 1]);
        }
        // Middle left up
        if (this.canMoveTo(board, this.x - 2, this.y - 1)) {
            moves.push([this.x - 2, this.y - 1]);
        }
        // Left up
        if (this.canMoveTo(board, this.x - 1, this.y - 2)) {
            moves.push([this.x - 1, this.y - 2]);
        }

        if (validate) return board.validateMoves(this, moves);

        return new MoveModel(moves);
    }
}

class Pawn extends Piece {
    constructor(x, y, isWhite, type, taken = false, hasMoved = false) {
        super(x, y, isWhite, type, taken, hasMoved);
    }

    getPossibleMoves(board, validate = true) {
        let moves = [];
        const direction = this.getPawnDirection();

        // Check if there's a piece in front of us
        if (this.canForward(board)) moves.push([this.x, this.y + direction]);

        // Check if we can go 2 squares forward
        if (this.canDoubleForward(board))
            moves.push([this.x, this.y + direction * 2]);

        // Check if we can take a piece
        // if yes, add the returned move to the list
        if (this.canTake(board, this.x + 1, this.y + direction))
            moves.push([this.x + 1, this.y + direction]);
        if (this.canTake(board, this.x - 1, this.y + direction))
            moves.push([this.x - 1, this.y + direction]);

        // Can we en passant capture?
        if (board.canEnPassant(this, this.x - 1, this.y + direction))
            moves.push([this.x - 1, this.y + direction]);
        if (board.canEnPassant(this, this.x + 1, this.y + direction))
            moves.push([this.x + 1, this.y + direction]);

        if (validate) return board.validateMoves(this, moves);

        return new MoveModel(moves);
    }

    canForward(board) {
        let direction = this.getPawnDirection();
        return board.getIndexOfPieceAt(this.x, this.y + direction) < 0;
    }

    canDoubleForward(board) {
        const inStartPos = this.isWhite ? this.y === 6 : this.y === 1;
        const direction = this.getPawnDirection();
        const onePlaceAhead = this.canForward(board);
        const twoPlacesAhead = board.isSquareFree(
            this.x,
            this.y + direction * 2
        );

        return inStartPos && onePlaceAhead && twoPlacesAhead;
    }

    getPawnDirection() {
        return this.isWhite ? -1 : 1;
    }
}
