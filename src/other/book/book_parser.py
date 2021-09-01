import glob


def remove_comments(data: str):
    is_comment = False
    is_game_info = False
    new_data = ""
    for char in data:
        if char == "{":
            is_comment = True
        elif char == "[":
            is_game_info = True
        if not is_comment and not is_game_info:
            new_data += char

        if char == "}":
            is_comment = False
        elif char == "]":
            is_game_info = False

    return new_data


def add_games_to_source_map():
    sourcefiles = glob.glob("./sourceFiles/*.pgn")
    data = ""

    for f in sourcefiles:
        with open(f) as sourcefile:
            data += sourcefile.read()

    with open("./games-source.pgn", "w") as destfile:
        destfile.write(data)

def create_book():
    with open("./games-source.pgn") as book:
        output = ""
        source = remove_comments(book.read())
        source = source.replace(". ", ".")
        lines = source.splitlines()

        for line in lines:
            if "[" in line or line.isspace():
                continue
            line = line.replace("+", "")
            line = line.replace("#", "")
            line = line.replace("\n", "")
            line = line.lstrip()

            moves = line.split(" ")
            for move in moves:
                if "." in move:
                    new_move = " " + move.split(".")[-1] + " "
                    line = line.replace(move, new_move)

            if line.endswith("1/2-1/2") or line.endswith("0-1") or line.endswith("1-0"):
                line += "\n"

            output += line

        output = output.replace("  ", " ")
        output = output.replace("  ", " ")

        with open("./games-parsed.pgn", "w") as output_book:
            result = set([x.lstrip() for x in output.splitlines()])
            output_book.write("\n".join(result))

if __name__ == "__main__":
    add_games_to_source_map()
    create_book()