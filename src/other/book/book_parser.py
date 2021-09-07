import glob
import os
import sys
import time
from threading import Thread


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


def add_games_to_source_map(files_dir):
    data = ""

    def open_and_parse_file(file_dir):
        with open(file_dir) as sourcefile:
            nonlocal data
            data += remove_comments(sourcefile.read())

    sourcefiles = glob.glob(files_dir + "/*.pgn")
    threads = []

    for f in sourcefiles:
        if "games-source.pgn" in f or "games-parsed.pgn" in f:
            continue
        thread = Thread(target=open_and_parse_file, args=(f, ))
        threads.append(thread)

    print(f"{len(threads)} threads are running")

    for thread in threads:
        thread.start()
        thread.join()

    total_size = 0
    with open(files_dir + "/games-source.pgn", "w") as destfile:
        destfile.write(data)
    
    total_size = os.path.getsize(files_dir + "/games-source.pgn") / (1024 ** 2)

    print(f"Wrote {total_size:.2f} MB to {files_dir}/games-source.pgn")


def create_book(files_dir):
    with open(files_dir + "/games-source.pgn") as book:
        output = ""
        source = book.read()
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

        with open(files_dir + "/games-parsed.pgn", "w") as output_book:
            print(f"Total num of parsed games: {len(output.splitlines())}")
            result = set([x.lstrip() for x in output.splitlines()])
            result = sorted(result, key=str.lower)
            output_book.write("\n".join(result))

            print(f"Wrote {len(result)} games to {files_dir}/games-parsed.pgn")


if __name__ == "__main__":
    start = time.time()
    files_dir = sys.argv[1]
    add_games_to_source_map(files_dir)
    create_book(files_dir)
    end = time.time()

    print(f"Operations took {end - start:.2f} seconds")
