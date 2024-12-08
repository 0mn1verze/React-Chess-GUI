function GameInfoHeader() {
  return (
    <thead>
      <tr>
        <th className="col-1">Score</th>
        <th className="col-1">Depth</th>
        <th className="col-1">Time</th>
        <th className="col-1">Nodes</th>
        <th className="col-1">Knps</th>
        <th className="col-5">PV</th>
      </tr>
    </thead>
  );
}

function GameInfoTable({ searchInfo }) {
  return (
    <tbody>
      <tr>
        <td className="col-1">
          <strong id="score" className="text-danger">
            {searchInfo.score}
          </strong>
        </td>
        <td className="col-1">{searchInfo.depth}</td>
        <td className="col-1">{searchInfo.time}</td>
        <td className="col-1">{searchInfo.nodes}</td>
        <td className="col-1">{searchInfo.knps}</td>
        <td className="col-5 text-truncate" style={{ maxWidth: "150px" }}>
          {searchInfo.pv}
        </td>
      </tr>
    </tbody>
  );
}

function PGN({ game }) {
  return (
    <div className="card">
      <div
        className="card-header text-center"
        style={{ background: "#202777" }}
      >
        <h5 style={{ color: "white" }}>PGN</h5>
      </div>
      <div className="card-body">
        <pre>{game.pgn()}</pre>
      </div>
    </div>
  );
}

function PGNDownloadBtn({ game }) {
  function downloadPGN() {
    const whitePlayer = prompt("Who is playing white?", "White");
    const blackPlayer = prompt("Who is playing black?", "Black");

    const results = game.isCheckmate()
      ? game.turn() === "w"
        ? "0-1"
        : "1-0"
      : game.isGameOver()
      ? "1/2-1/2"
      : "*";

    game.header(
      "White",
      whitePlayer,
      "Black",
      blackPlayer,
      "Date",
      new Date().toDateString(),
      "Round",
      "1",
      "Result",
      results,
      "Site",
      "Localhost"
    );

    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game.pgn";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="btn btn-primary" onClick={downloadPGN}>
      Download PGN
    </button>
  );
}

export default function GameInfo({ game, searchInfo }) {
  return (
    <>
      <table className="table text-center mt-4">
        <GameInfoHeader />
        <GameInfoTable searchInfo={searchInfo} />
      </table>
      <PGN game={game} />
      <PGNDownloadBtn game={game} />
    </>
  );
}
