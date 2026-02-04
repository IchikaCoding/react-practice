// この波括弧は分割代入ではない！
// react が exports している useState という名前のものを取り出して読み込むための{}
import { useState } from "react";
// valueはpropsのvalueプロパティの値を使うための分割代入したやつ
function Square({ value, onSquareClick }) {
  // TODO: ボタンをクリックすると、時々2回このコンソールが実行される時があるのはなぜ？！
  console.log("Squareが呼び出されました");
  return (
    // onClickはReact が解釈する「props名」
    // {handleClick}は、JSの関数handleClickをクリックしたときに React が呼び出すために値として渡せるように書いている
    // {}はJSXのなかでJSを書くため
    // classNameもReactが解釈するためのprop名
    <button className="square" onClick={onSquareClick}>
      {/* JSのSquare関数の引数valueをJSX内で使うために{}でvalueを囲んでいる */}
      {value}
    </button>
  );
}

//コンポーネントとは UI の部品を表す再利用可能なコードのこと
// 子コンポーネントの独立したstateたちからデータを収集したいときは、親のコンポーネントさんに知らせる
function Board({ xIsNext, squares, onPlay }) {
  const [xIsNext, setXIsNext] = useState(true);
  // state変数としてsquaresを用意。
  // 変更されるたびにUIを更新するものを管理するときに使う
  const [squares, setSquares] = useState(Array(9).fill(null));
  console.log("squares:", squares);
  console.log("BoardがReactに呼び出されました");

  // JSはクロージャをサポートしているからsquaresたち（Board関数で定義された変数）を参照することができる
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    // squares.slice()で新しい配列を作成
    // 新しい配列で更新してからその配列をsquaresにいれるという流れで直接squaresを更新することを避けれた！
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    // setSquaresでsquaresがnextSquaresの値に更新することを知らせる→Bordコンポーネントが再レンダーされる
    setSquares(nextSquares);
    // xIsNextを反転させてfalseになる→次は相手の版になる
    setXIsNext(!xIsNext);
  }
  const winner = calculateWinner(squares);
  let status;
  // winnerがいるならそれをstatusに表示する
  if (winner) {
    status = `Winner: ${winner}`;
  } else {
    // そうじゃないならNextPlayerをstatusに表示する
    status = `Next Player: ${xIsNext ? "X" : "O"}`;
  }
  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        {/* BoardコンポーネントがSquareコンポーネントをレンダーしている */}
        {/* Squareコンポーネントの引数に2つの値を渡しているだけ */}
        {/* {handleClick}がonSquareClickに入る→Squareのボタンを押されたときの処理として{handleClick}がわたる！ */}
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

// export defaultによって、index.jsxがこのGameコンポーネントをトップレベルとして使用する
export default function Game() {
  // 手番の確認のためのstate
  const [xIsNext, setXIsNext] = useState(true);
  // 着手の履歴を確認するためのstate
  // ! historyは盤面の履歴全てが配列の中に残っている。初期値はインデックス0になる→最初はインデックス0のみの配列
  const [history, setHistory] = useState(Array(9).fill(null));
  const currentSquares = history[history.length - 1];
  //  TODO: これはどうしてやるのか？巻き戻し機能に必要なの？
  function handlePlay(nextSquares) {}
  return (
    <div className="game">
      {/* game-board */}
      <div className="game-board">
        {/* TODO: Boardを呼び出す？レンダーする？ */}
        {/* TODO: currentSquaresを渡す理由は？ */}
        {/* TODO: handlePlayの引数を渡さなきゃ！ */}
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      {/* game-infoを表示する */}
      <div className="game-info">
        <ol></ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  // 揃ったら勝ちになる配列のインデックス
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    // a, b, cはsquaresの配列のインデックスになるよ
    const [a, b, c] = lines[i];
    // このsquaresのインデックスの値が全部一緒だったらsquares[a]（ex. "X"など）が勝者になる
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  // 勝者がいなかった場合は、nullを返す
  return null;
}
