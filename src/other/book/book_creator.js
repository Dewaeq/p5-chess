const createBook = async () => {
    const book = new Book();
    const board = new Board();
    const MIN_MOVE_COUNT = 20;
    const MIN_TIMES_PLAYED = 10;

    const file = await requestFile();
    const data = await file.text();

    const lines = data.split("\n");

    for (const line of lines) {
        if (line.split(" ").length < MIN_MOVE_COUNT) {
            continue;
        }
        board.fenToBoard(fenStartString);
        const moves = PGNLoader.MovesFromPGN(line, MAX_BOOK_MOVES);

        for (const move of moves) {
            book.add(board.zobristKey[0], board.zobristKey[1], move);
            board.makeMove(move);
        }
    }

    console.log("parsed ", book.bookPositions.size, "positions");

    let bookString = "";

    book.bookPositions.forEach((bookPosition, key) => {
        let line = key + ":";

        let isFirstMoveEntry = true;
        bookPosition.moves.forEach((moveCount, moveValue) => {
            // Positions needs to occur at least x times to be included in the book
            if (moveCount >= MIN_TIMES_PLAYED) {
                if (isFirstMoveEntry) {
                    isFirstMoveEntry = false;
                } else {
                    line += ",";
                }
                line += ` ${moveValue} (${moveCount})`;
            }
        });
        if (!isFirstMoveEntry) {
            bookString += (line + "\n");
        }
    });
    download("book.txt", bookString);
}

const loadBookFromFile = async () => {
    const response = await fetch("../../../assets/books/book1.txt");
    const data = await response.text();

    const lines = data.replaceAll("(", "").replaceAll(")", "").split("\n");

    for (const line of lines) {
        if (isEmptyString(line)) {
            break;
        }

        const keys = line.split(":")[0].split("|");
        const lowKey = parseInt(keys[0]);
        const highKey = parseInt(keys[1]);

        const moves = line.split(":")[1].split(",");
        for (const move of moves) {
            let [moveValue, numTimesPlayed] = move.trim().split(" ").map(e => parseInt(e));
            gameManager.book.add(lowKey, highKey, new Move(moveValue), numTimesPlayed);
        }
    }
}