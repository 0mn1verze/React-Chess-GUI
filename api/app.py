# Web based GUI for Maestro Chess Engine

# import libraries
import chess
from flask import Flask, request
import chess.engine
import chess.polyglot

app = Flask(__name__, static_folder='../build', static_url_path='/')

# make move API


@app.route("/api/make_move", methods=['POST'])
def make_move():
    # extract pgn string from HTTP POST request body
    fen = request.json.get('startFen')

    # extract search query type
    searchType = request.json.get('searchType')

    # extract search query value
    searchValue = request.json.get('searchValue')

    # extract history
    moves = request.json.get('moves')

    print(request.json)

    # init python-chess board object
    board = chess.Board(fen)

    # make moves
    for move in moves:
        board.push(chess.Move.from_uci(move))

    # check if game is over, if so return game over
    if (board.is_game_over()):
        return {
            "game_over": True,
        }



    # init Maestro engine
    engine = chess.engine.SimpleEngine.popen_uci(
        "../engine/Maestro.exe", debug=False)

    # search for best move
    if (searchType == "depth"):
        info = engine.analyse(
            board, chess.engine.Limit(depth=float(searchValue)))

    elif (searchType == "time"):
        info = engine.analyse(
            board, chess.engine.Limit(time=float(searchValue)))

    # close engine
    engine.quit()

    def parseScore(score):
        if score.is_mate():
            return str(score.white())
        else:
            return str(score.white().score() / 100)

    return {
        "best_move": str(info.get('pv')[0]) if info else None,
        "score": str(parseScore(info.get('score'))) if info else None,
        "depth": str(info.get('depth')) if info else None,
        "time": str(info.get('time')) if info else None,
        "nodes": str(info.get('nodes')) if info else None,
        "nps": str(info.get('nps')) if info else None,
        "pv": " ".join([move.uci() for move in info.get("pv")]) if info else None,
    }


if __name__ == "__main__":
    app.run(debug=True, threaded=True)
