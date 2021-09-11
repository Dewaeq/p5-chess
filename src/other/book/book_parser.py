import glob
import os
import sys
import time
from multiprocessing import Pool as ThreadPool


def remove_comments(data: str):
    is_comment = False
    is_game_info = False
    new_data = ""
    for char in data:
        if char == "{":
            is_comment = True
            continue
        elif char == "[":
            is_game_info = True
            continue

        if not is_comment and not is_game_info:
            new_data += char

        if char == "}":
            is_comment = False
        elif char == "]":
            is_game_info = False

    new_data = new_data.replace("\n", " ")
    new_data = new_data.replace("`", "")
    new_data = new_data.replace("1-0", "END\n")
    new_data = new_data.replace("0-1", "END\n")
    new_data = new_data.replace("0-1", "END\n")
    new_data = new_data.replace("1/2-1/2`", "END\n")
    new_data = new_data.replace("1/2-1/2", "END\n")
    new_data = new_data.replace("*", "END\n")

    new_data = new_data.replace(". ", ".")
    new_data = new_data.replace("...", "")
    new_data = new_data.replace("  ", " ")
    new_data = new_data.replace("  ", " ")
    new_data = new_data.replace("  ", " ")

    return new_data


def open_and_parse_file(file_dir):
    start = time.time()
    with open(file_dir) as sourcefile:
        data = remove_comments(sourcefile.read())
        data = create_book(data)
        end = time.time()
        print(f"Parsed ({end - start:.2f}s): {file_dir}")
        return data


def add_games_to_source_map(files_dir):

    files = glob.glob(files_dir + "/*.pgn")
    pool = ThreadPool(os.cpu_count() - 4)
    files = [x for x in files if not "games-source.pgn" in x]
    results = pool.map(open_and_parse_file, files)
    results = "".join(results).splitlines()
    results = sorted(set(results), key=str.lower)

    with open(files_dir + "/games-source.pgn", "w") as destfile:
        destfile.write("\n".join(results))


def create_book(data: str):
    output = ""
    lines = data.splitlines()

    for line in lines:
        if "[" in line or line.isspace():
            continue
        line = line.replace("+", "")
        line = line.replace("#", "")

        moves = line.split(" ")
        for move in moves:
            if "." in move:
                new_move = " " + move.split(".")[-1] + " "
                line = line.replace(move, new_move)

        output += line.lstrip() + "\n"

    output = output.replace("  ", " ")
    output = output.replace("  ", " ")
    return output


if __name__ == "__main__":
    start = time.time()
    files_dir = sys.argv[1]

    add_games_to_source_map(files_dir)

    total_size = os.path.getsize(files_dir + "/games-source.pgn") / (1024 ** 2)

    print(f"Wrote {total_size:.2f} MB to {files_dir}/games-source.pgn")

    end = time.time()

    print(f"Operations took {end - start:.2f} seconds")
