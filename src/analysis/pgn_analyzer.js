class PGNAnalyzer {
    static ActiveBtnColor = "rgb(54, 146, 231)";
    static InActiveBtnColor = "rgb(38, 36, 33)";

    constructor() {
        this.pgnMoveIndex = -1;
        this.previousIndex = -1;
        this.pgnString = null;
        this.pgnMoves = [];
    }

    init() {
        $("#pgn-string-input").on("change", function () {
            const pgn = $(this).val();
            if (isEmptyString(pgn)) {
                pgnAnalyzer.pgnString = null;
                $("#pgn-input-display").children().remove();
                gameManager.board.fenToBoard(fenStartString);
            }
            try {
                const parsed = PGNLoader.RefactorPGN(pgn);
                const moves = PGNLoader.MovesFromPGN(parsed);
            } catch (e) {
                console.error(e);
                alert("Failed to parse PGN string!");
                $(this).val("");
                return;
            }
            pgnAnalyzer.showPGNString(pgn);
        });
    }

    showPGNString(pgn) {
        // Remove the old event listeners
        $(".move-button").off("click");

        pgn = PGNLoader.RemoveExtraData(pgn);
        
        const parsed = PGNLoader.RefactorPGN(pgn);
        const moves = PGNLoader.MovesFromPGN(parsed);
        this.pgnString = pgn;
        this.pgnMoves = moves;

        let moveIndex = 0;
        for (let move of pgn.split(" ")) {
            if (isEmptyString(move)) continue;

            const filter = move.replace(".", "").replace("-", "").replace("/", "");
            if (isNumeric(filter)) {
                $("#pgn-input-display").append(`<span> ${move}</span>`);
                continue;
            }

            $("#pgn-input-display").append(`<button class="move-button" index=${moveIndex}> ${move}</button>`);
            moveIndex++;
        }

        $(".move-button").on("click", function () {
            const index = parseInt($(this)[0].attributes.getNamedItem("index").value);
            pgnAnalyzer.previousIndex = index;
            pgnAnalyzer.goToPgnMove(index);
        });

        // Might be useful after some polishing
        /* $(".move-button").hover(function () {
            const index = parseInt($(this)[0].attributes.getNamedItem("index").value);
            pgnAnalyzer.previousIndex = pgnAnalyzer.pgnMoveIndex;
            pgnAnalyzer.goToPgnMove(index);
        }, function () {
            if (pgnAnalyzer.previousIndex < 0) {
                $(`[index=${pgnAnalyzer.pgnMoveIndex}]`).css("background-color", "white");
                pgnAnalyzer.pgnMoveIndex = -1;
                gameManager.board.fenToBoard(fenStartString);
                gameManager.gui.show();
                gameManager.gui.lastMove = null;
                startEvaluation();
            } else {
                pgnAnalyzer.goToPgnMove(pgnAnalyzer.previousIndex);
            }
        }); */
    }

    getNextPgnMove() {
        if (this.pgnMoveIndex >= this.pgnMoves.length - 1) return null;
        return this.pgnMoves[this.pgnMoveIndex + 1];
    }

    goToPgnMove(index) {
        if (index < 0 || index > this.pgnMoves.length - 1) return;

        $(`[index=${this.pgnMoveIndex}]`).css("background-color", PGNAnalyzer.InActiveBtnColor);
        $(`[index=${index}]`).css("background-color", PGNAnalyzer.ActiveBtnColor);
        $("#undo-move").prop("disabled", true);

        this.pgnMoveIndex = index;
        gameManager.board.fenToBoard(fenStartString);
        gameManager.moveHistory = [];
        gameManager.gui.lastMove = this.pgnMoves[index];

        for (let i = 0; i <= index; i++) {
            // Only start evaluation for the last move
            gameManager.makeMove(this.pgnMoves[i], false, i === index);
        }
    }

    goToNextMove() {
        if (this.pgnMoveIndex >= this.pgnMoves.length - 1) return;
        this.goToPgnMove(this.pgnMoveIndex + 1);
    }

    goToPreviousMove() {
        if (this.pgnMoveIndex < 0) return;
        this.goToPgnMove(this.pgnMoveIndex - 1);
    }
}