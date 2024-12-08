import { useState } from "react";
import { Chessboard } from "react-chessboard";

const LIGHT_SQUARE_OPTION_STYLE = {
  background: "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
  borderRadius: "50%",
};

const DARK_SQUARE_OPTION_STYLE = {
  background: "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)",
  borderRadius: "50%",
};

function GameTurn({ game }) {
  function getStyle(turn) {
    return {
      fontSize: "1rem",
      color: game.turn() === turn ? "light-gray" : "black",
      fontWeight: game.turn() === turn ? "bold" : "normal",
    };
  }

  return (
    <div className="container d-flex justify-content-around mb-2">
      <div style={getStyle("w")}>White to move</div>
      <p style={{ fontSize: "1rem", fontWeight: "bold" }}>|</p>
      <div style={getStyle("b")}>Black to move</div>
    </div>
  );
}

export default function Board({ game, makeMove, orientation, callBack }) {
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  // Helper functions

  function getOptionStyle(move, square) {
    // If the option square is the destination square, return the option style
    const sameColorSquare =
      game.get(move.to) && game.get(move.to).color !== game.get(square).color;
    return sameColorSquare
      ? DARK_SQUARE_OPTION_STYLE
      : LIGHT_SQUARE_OPTION_STYLE;
  }

  function getMoveOptions(square) {
    // Get all possible moves from the square
    const moves = game.moves({ square: square, verbose: true });
    // Create a list of option squares, assigning styles according to the colour of the source and option squares
    const optionSquares = {};
    moves.map((move) => {
      optionSquares[move.to] = getOptionStyle(move, square);
      return move;
    });
    // Highlight the source square
    optionSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    // Update the state of the option squares
    setOptionSquares(optionSquares);
    return true;
  }

  // Event Handlers
  function onDrop(sourceSquare, targetSquare, piece) {
    // Set moveTo square
    setMoveTo(targetSquare);
    // Make move
    const moveResult = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q",
    });
    // If invalid move, snapback
    if (moveResult === "snapback") return;
    // If the move is valid, make a random move
    setTimeout(callBack, 300);
    // Reset the moveFrom, moveTo and option squares
    setMoveFrom("");
    setMoveTo("");
    setOptionSquares({});
    setShowPromotionDialog(false);
    return true;
  }

  function onSquareClick(square) {
    // If the move from square is not set, set it and display move options
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // If the move to square is not set, set it and make the move if possible
    if (!moveTo) {
      // Get legal moves from the moveFrom square
      const moves = game.moves({ square: moveFrom, verbose: true });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );

      // Not a valid move, reset moveFrom based on the square clicked
      if (!foundMove) {
        // Check if new piece is clicked on
        const hasMoveOptions = getMoveOptions(square);
        // If new piece is clicked on, update moveFrom to the new square
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      // valid move
      setMoveTo(square);

      // if promotion move
      if (
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1")
      ) {
        setShowPromotionDialog(true);
        return;
      }
    }

    // Make the move
    const moveResult = makeMove({
      from: moveFrom,
      to: square,
      promotion: "q",
    });

    // if invalid, update the moveFrom square again if the square clicked has a new piece
    if (moveResult === "snapback") {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // Reset the moveFrom, moveTo and option squares
    setTimeout(callBack, 300);
    setMoveFrom("");
    setMoveTo("");
    setOptionSquares({});
    return;
  }

  function onPieceDragBegin(piece, sourceSquare) {
    onSquareClick(sourceSquare);
    return true;
  }

  function onPromotionPieceSelect(piece) {
    // If promotion piece selected, then make the move
    if (piece) {
      // Make the move
      const moveResult = makeMove({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase(),
      });
      // If valid move, make a random move
      if (moveResult !== "snapback") {
        setTimeout(callBack, 300);
      }
    }

    // Reset the moveFrom, moveTo and option squares
    setMoveFrom("");
    setMoveTo("");
    setOptionSquares({});
    setShowPromotionDialog(false);
    return true;
  }

  return (
    <div className="mx-auto">
      <Chessboard
        id="PlayVsRandom"
        position={game.fen()}
        boardOrientation={orientation}
        onPieceDrop={onDrop}
        onPieceDragBegin={onPieceDragBegin}
        onSquareClick={onSquareClick}
        onPromotionPieceSelect={onPromotionPieceSelect}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...optionSquares,
        }}
        promotionToSquare={moveTo}
        showPromotionDialog={showPromotionDialog}
      />
      <GameTurn game={game} />
    </div>
  );
}
