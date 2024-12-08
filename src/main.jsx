import Board from "./gui/board.jsx";
import { ControlPanel } from "./gui/controlPanel.jsx";
import GameInfo from "./gui/gameInfo.jsx";
import { Chess } from "chess.js";
import { useState, useEffect } from "react";

export default function Main() {
  const [game, setGame] = useState(new Chess());
  const [startFen, setStartFen] = useState(game.fen());
  const [searchInfo, setSearchInfo] = useState({
    score: 0,
    depth: 0,
    time: 0,
    nodes: 0,
    knps: 0,
    pv: "",
  });
  const [orientation, setOrientation] = useState("white");
  const [canMakeMove, setCanMakeMove] = useState(true);
  const [moveTime, setMoveTime] = useState(0.2);
  const [depth, setDepth] = useState(false);

  function getHistory() {
    const moves = game.history({ verbose: true });

    return moves.map((move) => {
      return move.from + move.to + (move.promotion ?? "");
    });
  }

  async function findBestMove(searchType, searchValue) {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startFen: startFen,
        moves: getHistory(),
        searchType: searchType,
        searchValue: searchValue,
      }),
    };
    try {
      return fetch("./api/make_move", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          return data;
        });
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  }

  function updateGame(game) {
    setGame(Object.assign(Object.create(Object.getPrototypeOf(game)), game));
  }

  function makeMove(move) {
    // Check if the move is legal
    try {
      // Make the move
      game.move(move);
      // Update the board
      updateGame(game);
      // Reset the can make move flag
      setCanMakeMove(true);
    } catch (error) {
      console.error(error);
      // If the move is illegal, snapback
      return "snapback";
    }
    return true;
  }

  async function makeBestMove() {
    let searchType = "depth";
    let searchValue = depth;

    if (moveTime) {
      searchType = "time";
      searchValue = moveTime;
    }

    const results = await findBestMove(searchType, searchValue);

    if (!results) {
      alert("Cannot fetch best move");
      return false;
    }

    if (results.game_over) {
      alert("Game Over");
      return false;
    }

    setSearchInfo({
      score: results.score,
      depth: results.depth,
      time: results.time,
      nodes: results.nodes,
      knps: results.nps / 1000,
      pv: results.pv,
    });

    makeMove(results.best_move);
    setCanMakeMove(true);

    return true;
  }

  return (
    <div className="card">
      <div className="header text-center mb-1">
        <h1>Maestro Chess Engine + SF NNUE</h1>
        <h6>A strong UCI chess engine by 0mn1verze</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-xs-12 col-sm-12 col-md-5 col-lg-3">
            <div className="row">
              <Board
                game={game}
                makeMove={makeMove}
                orientation={orientation}
                callBack={makeBestMove}
              />
            </div>
            <div className="row">
              <ControlPanel
                game={game}
                moveTime={moveTime}
                setMoveTime={setMoveTime}
                depth={depth}
                setDepth={setDepth}
                setStartFen={setStartFen}
                updateGame={updateGame}
                makeBestMove={makeBestMove}
                orientation={orientation}
                setOrientation={setOrientation}
                canMakeMove={canMakeMove}
                setCanMakeMove={setCanMakeMove}
                setSearchInfo={setSearchInfo}
              />
            </div>
          </div>
          <div className="col-xs-12 col-sm-12 col-md-7  col-lg-8">
            <GameInfo game={game} searchInfo={searchInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}
