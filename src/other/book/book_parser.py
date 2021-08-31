with open("./games-source.pgn") as book:
    output = ""
    lines = book.readlines()

    for line in lines:
        if "[" in line or line.isspace():
            continue
        line = line.replace("+", "")
        line = line.replace("#", "")
        line = line.replace("\n", "")

        moves = line.split(" ")
        for move in moves:
            if "." in move:
                new_move = move.split(".")[-1]
                if move.split(".")[0] != "1":
                    new_move = " " + new_move
                line = line.replace(move, new_move)

        if line.endswith("1/2-1/2") or line.endswith("0-1") or line.endswith("1-0"):
            line += "\n"

        line = line.replace("  ", " ")
        output += line

    with open("./games-parsed.pgn", "w") as output_book:
        output_book.write(output)
