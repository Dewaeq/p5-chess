/**
 * It's possible that your browser runs out of memory when creating the book.
 * To circumvent this behaviour, add --js-flags="--max_old_space_size=8192" to
 * your chrome launch target
 */
const createBook = async () => {
    const file = await requestFile();
    const data = await file.text();
    const lines = data.split("\n");

    const step = Math.ceil(lines.length / CPU_CORES * 2);
    const workers = new Array(CPU_CORES / 2);
    let finishedWorkers = 0;

    let books = [];

    for (let i = 0; i < workers.length; i++) {
        const workerLines = lines.slice(i * step, (i + 1) * step);
        workers[i] = new Worker("../src/other/book/book_worker.js");

        workers[i].onmessage = (message) => {
            books.push(message.data);

            finishedWorkers++;
            if (finishedWorkers === workers.length) {

                workers.forEach(worker => worker.terminate());
                const book = onWorkersFinished(books);
                bookToFile(book);
            }
        }
        workers[i].postMessage(workerLines);
    }
}

/**
 * Merge all the books from the workers into one book
 * @param {Book[]} workerBooks 
 * @returns {Book}
 */
const onWorkersFinished = (workerBooks) => {
    const book = new Book();

    for (const workerBook of workerBooks) {
        const bookPositions = workerBook.bookPositions;

        bookPositions.forEach((bookPosition, key) => {
            if (!book.bookPositions.has(key)) {
                book.bookPositions.set(key, new BookPosition());
            }

            bookPosition.moves.forEach((moveCount, moveValue) => {
                if (book.bookPositions.get(key).moves.has(moveValue)) {
                    const oldMoveCount = book.bookPositions.get(key).moves.get(moveValue);
                    book.bookPositions.get(key).moves.set(moveValue, oldMoveCount + moveCount);
                } else {
                    book.bookPositions.get(key).moves.set(moveValue, moveCount);
                }
            });
        });
    }
    return book;
}

/**
 * Convert this book to a text file and download it
 * @param {Book} book 
 */
const bookToFile = (book) => {
    console.log("parsed ", book.bookPositions.size, "positions");

    let lines = [];

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
            lines.push(line + "\n");
        }
    });

    // This isn't necessary, but sorting the lines makes it way
    // easier to quickly compare different books
    lines.sort();

    download("book.txt", lines.join(""));
}

/**
 * Load a book from a text file
 */
const loadBookFromFile = async () => {
    gameManager.gui.showBookModal(true);
    
    const data = await loadFile("../../assets/books/book1.txt", (e) => {
        const percentage = Math.round((e.loaded / e.total) * 100);
        gameManager.gui.updateBookModalStats(percentage);
    });

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
    setTimeout(() => {
        gameManager.gui.showBookModal(false);
    }, 1000);
}