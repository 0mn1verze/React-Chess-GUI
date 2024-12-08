import { useState, useEffect } from "react";
import { validateFen } from "chess.js";

function NewGameBtn({
  game,
  updateGame,
  setStartFen,
  setCanMakeMove,
  setSearchInfo,
}) {
  function onClick(e) {
    game.reset();
    updateGame(game);
    setStartFen(game.fen());
    setCanMakeMove(true);
    setSearchInfo({
      score: 0,
      depth: 0,
      time: 0,
      nodes: 0,
      knps: 0,
      pv: "",
    });
  }
  return (
    <button className="btn btn-outline-secondary" onClick={onClick}>
      New Game
    </button>
  );
}

function MakeMoveBtn({
  moveTime,
  depth,
  makeBestMove,
  canMakeMove,
  setCanMakeMove,
  setStatus,
}) {
  async function onClick(e) {
    setCanMakeMove(false);
    setStatus("Thinking...");
    if (moveTime) {
      const result = await makeBestMove("time", moveTime);
      if (!result) return;
    } else if (depth) {
      const result = await makeBestMove("depth", depth);
      if (!result) return;
    }
    setStatus("Playing");
    setCanMakeMove(true);
  }

  return (
    <button
      className="btn btn-outline-secondary"
      onClick={onClick}
      disabled={!canMakeMove}
    >
      Make Move
    </button>
  );
}

function FlipBoardBtn({ orientation, setOrientation }) {
  function onClick() {
    setOrientation(orientation === "white" ? "black" : "white");
  }
  return (
    <button className="btn btn-outline-secondary" onClick={onClick}>
      Flip Board
    </button>
  );
}

function TakeBackBtn({ game, updateGame, setCanMakeMove, setSearchInfo }) {
  function onClick(e) {
    game.undo();
    updateGame(game);
    setCanMakeMove(true);
    setSearchInfo({
      score: 0,
      depth: 0,
      time: 0,
      nodes: 0,
      knps: 0,
      pv: "",
    });
  }
  return (
    <button className="btn btn-outline-secondary" onClick={onClick}>
      Take Back
    </button>
  );
}

function FenInput({ game, updateGame, setStartFen, setCanMakeMove }) {
  const [fen, setFen] = useState(game.fen());

  function onChange(e) {
    const fen = e.target.value;
    setFen(fen);
  }

  function onClick(e) {
    const validation = validateFen(fen);
    console.log(validation);
    if (validation.ok) {
      game.load(fen);
      updateGame(game);
      setFen(fen);
      setStartFen(fen);
      setCanMakeMove(true);
    } else {
      alert("Invalid FEN: " + validation.error);
    }
  }

  return (
    <>
      <input
        type="text"
        className="form-control"
        value={fen}
        onChange={onChange}
      />
      <div className="input-group-append">
        <button className="btn btn-outline-success" onClick={onClick}>
          Set Position
        </button>
      </div>
    </>
  );
}

function GameStatus({ game, setCanMakeMove, status, setStatus }) {
  useEffect(() => {
    setCanMakeMove(false);
    setStatus("Playing");
    if (game.isCheckmate()) {
      setStatus("Checkmate");
    } else if (game.isDraw()) {
      setStatus("Draw");
    } else if (game.isStalemate()) {
      setStatus("Stalemate");
    } else if (game.isThreefoldRepetition()) {
      setStatus("Threefold Repetition");
    } else if (game.isInsufficientMaterial()) {
      setStatus("Insufficient Material");
    } else if (game.isGameOver()) {
      setStatus("Game Over");
    } else if (game.inCheck()) {
      setStatus("Check");
      setCanMakeMove(true);
    } else {
      setCanMakeMove(true);
    }
  }, [game]);
  return (
    <div className="container d-inline-flex justify-content-around">
      <strong>{status}</strong>
    </div>
  );
}

export function DropDown({
  options,
  placeholder,
  placeholderValue,
  selected,
  setSelected,
  resetOther,
}) {
  function onChange(e) {
    const value = e.target.value;
    if (value !== placeholder) {
      setSelected(value);
      resetOther();
    } else {
      setSelected(false);
    }
  }

  return (
    <select className="form-control ml-2" value={selected} onChange={onChange}>
      <option value={placeholderValue}>{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function ControlPanel({
  game,
  moveTime,
  setMoveTime,
  depth,
  setDepth,
  setStartFen,
  updateGame,
  makeBestMove,
  orientation,
  setOrientation,
  canMakeMove,
  setCanMakeMove,
  setSearchInfo,
}) {
  const [status, setStatus] = useState("Playing");

  const MOVETIME_OPTIONS = [0.2, 0.3, 0.4, 0.5, 1, 3, 5, 10, 15, 20, 30];
  const DEPTH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20];

  return (
    <div>
      <div className="container mb-2">
        <GameStatus
          game={game}
          setCanMakeMove={setCanMakeMove}
          status={status}
          setStatus={setStatus}
        />
      </div>
      <div className="input-group mb-2">
        <FenInput
          game={game}
          updateGame={updateGame}
          setStartFen={setStartFen}
          setCanMakeMove={setCanMakeMove}
        />
      </div>
      <div className="input-group mb-2">
        <DropDown
          options={MOVETIME_OPTIONS}
          placeholder={"Move Time"}
          placeholderValue={0.2}
          selected={moveTime}
          setSelected={setMoveTime}
          resetOther={() => setDepth(false)}
        />
        <DropDown
          options={DEPTH_OPTIONS}
          placeholder={"Depth"}
          placeholderValue={1}
          selected={depth}
          setSelected={setDepth}
          resetOther={() => setMoveTime(false)}
        />
      </div>
      <div className="container btn-group">
        <NewGameBtn
          game={game}
          updateGame={updateGame}
          setCanMakeMove={setCanMakeMove}
          setStartFen={setStartFen}
          setSearchInfo={setSearchInfo}
        />
        <MakeMoveBtn
          moveTime={moveTime}
          depth={depth}
          makeBestMove={makeBestMove}
          canMakeMove={canMakeMove}
          setCanMakeMove={setCanMakeMove}
          setStatus={setStatus}
        />
        <FlipBoardBtn
          orientation={orientation}
          setOrientation={setOrientation}
        />
        <TakeBackBtn
          game={game}
          updateGame={updateGame}
          setCanMakeMove={setCanMakeMove}
          setSearchInfo={setSearchInfo}
        />
      </div>
    </div>
  );
}
