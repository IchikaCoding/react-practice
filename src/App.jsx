// この波括弧は分割代入ではない！
// react が exports している useState という名前のものを取り出して読み込むための{}
import { useState } from "react";
// valueはpropsのvalueプロパティの値を使うための分割代入したやつ
function Square({ value, onSquareClick, colorInfo }) {
  // console.log("Squareが呼び出されました");
  return (
    // onClickはReact が解釈する「props名」
    // {handleClick}は、JSの関数handleClickをクリックしたときに React が呼び出すために値として渡せるように書いている
    // {}はJSXのなかでJSを書くため
    // classNameもReactが解釈するためのprop名
    <button
      className="square"
      onClick={onSquareClick}
      style={{ backgroundColor: colorInfo }}
    >
      {/* JSのSquare関数の引数valueをJSX内で使うために{}でvalueを囲んでいる */}
      {value}
    </button>
  );
}

//コンポーネントとは UI の部品を表す再利用可能なコードのこと
// 子コンポーネントの独立したstateたちからデータを収集したいときは、親のコンポーネントさんに知らせる
function Board({ xIsNext, squares, onPlay }) {
  const { winner, line } = calculateWinner(squares);
  console.log("squares:", squares);
  console.log("BoardがReactに呼び出されました");
  console.log("line", line);
  // JSはクロージャをサポートしているからsquaresたち（Board関数で定義された変数）を参照することができる
  /**
   * Boardのマス目の配列を更新する処理→あとからhandlePlayに更新させた値を渡す
   * @param {number} i マス目のindex
   * @returns
   */
  function handleClick(i) {
    // 勝者がいるか、マス目に入力があったら早期リターンする
    // calculateWinner(squares)で判定すると勝者いなくてもオブジェクト返ってきて常にtruthyになるから気をつけて
    if (winner || squares[i]) {
      return;
    }
    // squares.slice()で新しい配列を作成
    // 新しい配列で更新してからその配列をsquaresにいれるという流れで直接squaresを更新することを避けれた！
    const nextSquares = squares.slice();
    // xIsNextがtrueだったらクリックしたマス目に✘、falseだったら◯をいれる
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    //
    // TODO: なぜonPlay関数を使用するの？→Board は「クリックされた」という事実を onPlay で親に通知したいらしい（これがわからない）
    // setSquaresでsquaresがnextSquaresの値に更新することを知らせる→Bordコンポーネントが再レンダーされる
    onPlay(nextSquares);
  }

  let status;

  // winnerがいるならそれをstatusに表示する
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (squares.includes(null)) {
    // そうじゃないならNextPlayerをstatusに表示する
    status = `Next Player: ${xIsNext ? "X" : "O"}`;
  } else {
    status = "引き分け";
  }
  return (
    <>
      <div className="status">{status}</div>
      {/* 行の列の作成 */}
      {[0, 1, 2].map((row) => {
        return (
          // 行を作成する
          <div className="board-row" key={row}>
            {/* 1行できた中に列を作成する */}
            {[0, 1, 2].map((column) => {
              const index = row * 3 + column;
              return (
                <Square
                  value={squares[index]}
                  key={index}
                  onSquareClick={() => handleClick(index)}
                  // TODO: lineがnullのときはどうある？
                  colorInfo={line?.includes(index) ? "skyblue" : null}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

// export defaultによって、index.jsxがこのGameコンポーネントをトップレベルとして使用する
export default function Game() {
  // 着手の履歴を確認するためのstate
  // ! historyは盤面の履歴全てが配列の中に残っている。初期値はインデックス0になる→最初はインデックス0のみの配列
  const [history, setHistory] = useState([Array(9).fill(null)]);
  // 現在のターンを確認するためのstate変数
  const [currentMove, setCurrentMove] = useState(0);
  // 昇順と降順を管理するためのstate変数
  const [orderIsNext, setOrderIsNext] = useState(false);
  // currentMoveが偶数か奇数かによってターンを決定できる→その判定の真偽値でターン決めする
  const xIsNext = currentMove % 2 === 0;
  // state変数としてsquaresを用意。
  // 変更されるたびにUIを更新するものを管理するときに使う
  // currentMoveのインデックスで履歴を指定することで、移動した先のBoardを表示できる！
  const currentSquares = history[currentMove];
  console.log("history", history);
  // 盤面の履歴とターンを更新するための処理
  function handlePlay(nextSquares) {
    // 現在の盤面までの配列に新しい盤面の配列（nextHistory）を末尾に追加
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    // その配列で新しい履歴として更新する
    setHistory(nextHistory);
    // ターンの数はnextHistory配列の要素数からインデックスを計算して算出
    setCurrentMove(nextHistory.length - 1);
  }
  // nextMoveは戻りたい盤面の配列のインデックス
  // 初期値が0なだけで、nextMoveに0が入ることもある
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // history配列から一つずつ要素を取得してsquaresに渡す。その時のインデックスはmoveにわたす
  // moves配列を作成してボタンを作成する
  // squaresは必要？→第2引数を設定したくて、第一引数は必須で書く必要があるから
  const moves = history.map((squares, move) => {
    let description;
    // 配列のインデックスが0より大きかったら移動する場所を渡す
    if (move > 0) {
      squares.map((element, i) => {
        if (element) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          description = `# (${row},${col}) に移動してね`;
        }
      });
    } else {
      // その他（初期値）だったら「ゲームスタートに行く」を表示する
      description = `ゲームスタートに行く`;
    }
    return (
      // 配列でli要素を作成した時は一意に識別する文字列または数値のkeyが必要
      <li key={move}>
        {/* 条件分岐を三項演算子で書いてみる */}
        {move === currentMove ? (
          <span>{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
        {/* ボタンの背景色はデフォルトだった */}
      </li>
    );
  });
  // historyをリバースさせて、一つずつの要素ごとに処理をして reversedMoves に代入する
  // moveはリバースさせた配列のインデックス→中身とインデックスはズレた状態
  const reversedMoves = history.toReversed().map((squares, move) => {
    let description;
    // インデックス最大値-move をすることで、中身とズレたインデックスを修正する
    // この計算をすることによって、条件分岐の処理を変えなくてもOKになった
    const newMove = history.length - 1 - move;
    // 配列のインデックスが0より大きかったら移動する場所を渡す
    if (newMove > 0) {
      description = `# ${newMove} に移動してね`;
    } else {
      // その他（初期値はインデックス0）だったら「ゲームスタートに行く」を表示する
      description = `ゲームスタートに行く`;
    }
    return (
      // 配列でli要素を作成した時は一意に識別する文字列または数値のkeyが必要
      <li key={newMove}>
        {/* 条件分岐を三項演算子で書いてみる */}
        {newMove === currentMove ? (
          <span>{description}</span>
        ) : (
          <button onClick={() => jumpTo(newMove)}>{description}</button>
        )}
        {/* ボタンの背景色はデフォルトだった */}
      </li>
    );
  });
  console.log("moves ", moves);
  console.log("reversedMoves ", reversedMoves);

  return (
    <div className="game">
      {/* game-board */}
      <div className="game-board">
        {/* Boardをレンダーしている */}
        {/* currentSquaresを渡す理由は？→状態管理しているGameのstateが更新されたら盤面描画専用のBoardコンポーネントさんに渡したいから！ */}
        {/* handlePlayの引数はなぜ渡さないの？→ 関数の定義を渡したいだけだから。実行するときには引数をつけて呼べるよん */}
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      {/* game-infoを表示する */}
      <div className="game-info">
        <button
          onClick={() => {
            setOrderIsNext(!orderIsNext);
            // console.log(orderIsNext);
          }}
        >
          並べ替えボタン
        </button>
        {orderIsNext ? <ol>{moves}</ol> : <ol reversed>{reversedMoves}</ol>}
      </div>
    </div>
  );
}

/**
 * 勝者がいるかどうかを確認するための処理
 * @param {Array} squares
 * @returns
 */
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
      // 配列のインデックスを返す
      // lineはどのマスなのかを知らせるため
      // winnerは◯なのか✘なのかを知らせるため
      return { line: [a, b, c], winner: squares[a] };
    }
  }
  // 勝者がいなかった場合は、nullを返す
  return { line: null, winner: null };
}
