import glob
import os


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

    new_data = new_data.replace(". ", ".")
    new_data = new_data.replace("...", "")

    return new_data


def add_games_to_source_map():
    sourcefiles = glob.glob("./sourceFiles/*.pgn")
    total_size = 0
    data = ""

    for f in sourcefiles:
        with open(f) as sourcefile:
            data += sourcefile.read()
            total_size += os.path.getsize(f)

    with open("./games-source.pgn", "w") as destfile:
        destfile.write(data)

    total_size = total_size // (1024 ** 2)
    print(f"Wrote {total_size} MB to games-source.pgn")


def create_book():
    with open("./games-source.pgn") as book:
        output = ""
        source = remove_comments(book.read())
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
            print(f"Total num of parsed games: {len(output.splitlines())}")
            result = set([x.lstrip() for x in output.splitlines()])
            result = sorted(result, key=str.lower)
            output_book.write("\n".join(result))

            print(f"Wrote {len(result)} games to games-parsed.pgn")


if __name__ == "__main__":
    add_games_to_source_map()
    create_book()
