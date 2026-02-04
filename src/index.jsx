import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";

// 最終的な成果物（Appとかスタイルとか全部込みの完成形）をindex.html のid=rootに入れる処理
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
