import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App-v2";
// import App from "./App";

// 最終的な成果物（Appとかスタイルとか全部込みの完成形）をindex.html のid=rootに入れる処理
// index.htmlのidがroot要素を取得してrootを作成
// 👉️そのrootのレンダーメソッドを使用して、コンポーネントさんを呼び出す（レンダーする）
const root = createRoot(document.getElementById("root"));
root.render(
  // React は各コンポーネントの関数を 2 回呼び出すことで純粋でない関数が引き起こす間違いに気づきやすくしてくれる
  <StrictMode>
    <App />
  </StrictMode>,
);
