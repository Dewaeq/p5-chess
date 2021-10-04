class PrecomputedData {
	/**  First 4 are orthogonal, last 4 are diagonals (N, S, W, E, NW, SE, NE, SW) */
	static DirectionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];

	static AllKnightJumps = [15, 17, -15, -17, 10, -6, -10, 6];

	/**@type {number[][]} */
	static KingMoves = [];
	/**@type {number[][]} */
	static KnightMoves = [];
	/**@type {number[][]} */
	static BishopMoves = [];
	/**@type {number[][]} */
	static RookMoves = [];
	/**@type {number[][]} */
	static QueenMoves = [];

	// Pawn attacks for white (0) and black (1)
	// NW, NE; SW, SE
	static PawnAttackDirectionIndices = [
		[4, 6],
		[7, 5],
	];
	/**@type {number[][]} */
	static PawnAttacksWhite = [];
	/**@type {number[][]} */
	static PawnAttacksBlack = [];

	// static KingAttackBitboards = new BigUint64Array(64);
	// static KnightAttackBitboards = new BigUint64Array(64);
	// static PawnAttackBitboards = new Array(64).fill(null).map(_ => Array(2).fill(null).map(__ => new BigUint64Array(64)));

	/**@type {number[]} */
	static CentreManhattanDistance = [];
	/**@type {number[][]} */
	static OrthogonalDistance = [];
	/**@type {number[][]} */
	static SqToEdge = [];

	static NumRookMovesToSquare(startSquare, targetSquare) {
		return this.OrthogonalDistance[startSquare][targetSquare];
	}

	static Init() {
		// const emptyBitboard = BigInt.asUintN(64, 0n);

		for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
			const [x, y] = BoardRepresentation.IndexToCoord(squareIndex);

			const numNorth = 7 - y;
			const numSouth = y;
			const numWest = x;
			const numEast = 7 - x;
			const numNorthWest = Math.min(numNorth, numWest);
			const numSouthEast = Math.min(numSouth, numEast);
			const numNorthEast = Math.min(numNorth, numEast);
			const numSouthWest = Math.min(numSouth, numWest);

			this.SqToEdge[squareIndex] = [
				numNorth,
				numSouth,
				numWest,
				numEast,
				numNorthWest,
				numSouthEast,
				numNorthEast,
				numSouthWest,
			];

			// Pawn moves
			let pawnCapturesWhite = [];
			let pawnCapturesBlack = [];
			// let whitePawnBitboard = emptyBitboard;
			// let blackPawnBitboard = emptyBitboard;
			// this.PawnAttackBitboards[squareIndex] = Array(2);

			// Take west of pawn
			if (x > 0) {
				if (y < 7) {
					pawnCapturesWhite.push(squareIndex + 7);
					// whitePawnBitboard |= (1n << BigInt(squareIndex + 7));
				} if (y > 0) {
					pawnCapturesBlack.push(squareIndex - 9);
					// blackPawnBitboard |= (1n << BigInt(squareIndex - 9));
				}
			}
			// Take east of pawn
			if (x < 7) {
				if (y < 7) {
					pawnCapturesWhite.push(squareIndex + 9);
					// whitePawnBitboard |= (1n << BigInt(squareIndex + 9));
				} if (y > 0) {
					pawnCapturesBlack.push(squareIndex - 7);
					// blackPawnBitboard |= (1n << BigInt(squareIndex - 7));
				}
			}
			// this.PawnAttackBitboards[squareIndex][WHITE_INDEX] = whitePawnBitboard;
			// this.PawnAttackBitboards[squareIndex][BLACK_INDEX] = blackPawnBitboard;

			this.PawnAttacksWhite[squareIndex] = pawnCapturesWhite;
			this.PawnAttacksBlack[squareIndex] = pawnCapturesBlack;

			// King moves
			let kingMoves = [];
			// let kingBitboard = emptyBitboard;

			this.DirectionOffsets.forEach((moveDelta) => {
				const targetSquare = squareIndex + moveDelta;
				if (!BoardRepresentation.IsSquareInBoard(targetSquare)) return;

				const [kingX, kingY] = BoardRepresentation.IndexToCoord(targetSquare);
				// Ensure king has moved only one square on x/y-axis from start square
				const moveDist = Math.max(Math.abs(x - kingX), Math.abs(y - kingY));

				if (moveDist === 1) {
					kingMoves.push(targetSquare);
					// kingBitboard |= (1n << BigInt(targetSquare));
				}
			});
			this.KingMoves[squareIndex] = kingMoves;
			// this.KingAttackBitboards[squareIndex] = kingBitboard;

			// Knight moves
			let knightMoves = [];
			// let knightBitboard = emptyBitboard;

			this.AllKnightJumps.forEach((moveDelta) => {
				const targetSquare = squareIndex + moveDelta;
				if (!BoardRepresentation.IsSquareInBoard(targetSquare)) return;

				const [knightX, knightY] =
					BoardRepresentation.IndexToCoord(targetSquare);
				// Ensure knight has moved only two squares on x/y-axis from start square
				const moveDist = Math.max(Math.abs(x - knightX), Math.abs(y - knightY));

				if (moveDist === 2) {
					knightMoves.push(targetSquare);
					// knightBitboard |= (1n << BigInt(targetSquare));
				}
			});
			this.KnightMoves[squareIndex] = knightMoves;
			// this.KnightAttackBitboards[squareIndex] = knightBitboard;

			// Bishop moves
			let bishopMoves = [];
			for (let directionIndex = 4; directionIndex < 8; directionIndex++) {
				const curDirection = this.DirectionOffsets[directionIndex];
				for (let i = 0; i < this.SqToEdge[squareIndex][directionIndex]; i++) {
					const targetSquare = squareIndex + curDirection * (i + 1);
					bishopMoves.push(targetSquare);
				}
			}
			this.BishopMoves[squareIndex] = bishopMoves;

			// Rook moves
			let rookMoves = [];
			for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
				const curDirection = this.DirectionOffsets[directionIndex];
				for (let i = 0; i < this.SqToEdge[squareIndex][directionIndex]; i++) {
					const targetSquare = squareIndex + curDirection * (i + 1);
					rookMoves.push(targetSquare);
				}
			}
			this.RookMoves[squareIndex] = rookMoves;

			// Queen moves
			this.QueenMoves[squareIndex] = [...bishopMoves, ...rookMoves];
		}

		this.OrthogonalDistance = Array(64);
		this.CentreManhattanDistance = new Uint8Array(64);

		for (let squareA = 0; squareA < 64; squareA++) {
			const [fileA, rankA] = BoardRepresentation.CoordFromIndex(squareA);
			const fileDstFromCentre = Math.max(3 - fileA, fileA - 4);
			const rankDstFromCentre = Math.max(3 - rankA, rankA - 4);
			this.CentreManhattanDistance[squareA] = fileDstFromCentre + rankDstFromCentre;

			this.OrthogonalDistance[squareA] = new Uint8Array(64);

			for (let squareB = 0; squareB < 64; squareB++) {
				const [fileB, rankB] = BoardRepresentation.CoordFromIndex(squareB);
				const rankDst = Math.abs(rankA - rankB);
				const fileDst = Math.abs(fileA - fileB);
				this.OrthogonalDistance[squareA][squareB] = Math.max(rankDst, fileDst);
			}
		}
	}
}
