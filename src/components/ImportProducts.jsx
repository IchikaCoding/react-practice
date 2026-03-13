import { useState, useRef } from "react";
import { read, utils } from "xlsx";

/**
 * @typedef {import("../data/products").Product} Product
 */

// CSVやExcelで使えるカテゴリの一覧
const VALID_CATEGORIES = ["Fruits", "Vegetables", "Snacks"];

// TODO: ここの関数からデータの変換とエラー処理を学ぶ
/**
 * 1行分のデータをバリデーションして、Productオブジェクトに変換する
 * @param {Object} row - ファイルから読み取った1行分のデータ
 * @param {number} rowIndex - 行番号（エラーメッセージ用）
 * @returns {{ product: Product | null, error: string | null }}
 */
function parseRow(row, rowIndex) {
  // categoryを文字列にしつつ、スペースを削除
  const category = String(row.category ?? "").trim();
  const name = String(row.name ?? "").trim();
  // TODO: どうしてNumberにしないの？
  // 変数のRawは仮のデータとして保存していることをわかりやすくするため？
  const priceRaw = row.price;
  const stockedRaw = row.stocked;

  // カテゴリのチェック
  // categoryにVALID_CATEGORIES配列に含まれないカテゴリが入っていたらエラー
  if (!VALID_CATEGORIES.includes(category)) {
    // TODO: エラーとproductをプロパティにしてエラーならproduct側をnullにするのってよくやるやり方？
    return {
      product: null,
      // rowIndexは引数でもらう。VALID_CATEGORIESの配列から,とスペース区切りでくっつけた有効なカテゴリを示す。
      error: `Row ${rowIndex}: category "${category}" is invalid. Use: ${VALID_CATEGORIES.join(", ")}`,
    };
  }

  // 商品名のチェック（1～30文字以内じゃないときにエラー）
  if (name.length === 0 || name.length > 30) {
    return {
      product: null,
      error: `Row ${rowIndex}: name must be 1–30 characters`,
    };
  }

  // 価格のチェック
  // TODO: priceRawを数値に変える👉️数値にならなかった場合はどういうものが入っているの？
  const price = Number(priceRaw);
  // TODO: ここの数値はどんな値が入っているのか確認する
  console.log("price", price);
  // 「有限数じゃないときとか、NaNとかInfinityのとき」か、priceが1未満、10万以上ならエラー
  if (!Number.isFinite(price) || price < 1 || price > 100000) {
    return {
      product: null,
      error: `Row ${rowIndex}: price must be a number between 1 and 100000`,
    };
  }

  // 在庫のチェック（true/false/"TRUE"/"FALSE"/1/0 を許容）
  let stocked;
  // 在庫一時データが真偽値か確認して、真偽値だったらstockedに代入
  if (typeof stockedRaw === "boolean") {
    stocked = stockedRaw;
  } else {
    // stockedが真偽値じゃないときの処理
    // stockedRawがあったらそれを文字列にして、スペース消す、小文字にしてsに代入。なかったら空文字をいれる。
    // toLowerCase()は日本語なら何も変化なし
    const s = String(stockedRaw ?? "")
      .trim()
      .toLowerCase();
    // sが"true" か1ならstockedにtrueを代入する
    if (s === "true" || s === "1") {
      stocked = true;
      //  sが"false" か0ならstockedにfalseを代入する
    } else if (s === "false" || s === "0") {
      stocked = false;
    } else {
      return {
        product: null,
        error: `Row ${rowIndex}: stocked must be true or false`,
      };
    }
  }
  // Math.floorって何？👉️同じか、小さい方を返す関数
  return {
    product: {
      id: crypto.randomUUID(),
      category,
      name,
      price: Math.floor(price),
      stocked,
    },
    error: null,
  };
}

// TODO: errors / successMessageで画面表示を切り替える処理を確認する
/**
 * CSV/Excelファイルから商品データをインポートするコンポーネント
 * @param {Object} props
 * @param {Product[]} props.products - 現在の商品リスト
 * @param {(value: Product[]) => void} props.onProductsChange - 商品リストを更新する関数
 * @returns {JSX.Element}
 */
export default function ImportProducts({ products, onProductsChange }) {
  // TODO: 空の配列で初期化？エラーは配列で管理するとやりやすいのかしら？
  // このコンポーネント内で表示非表示を管理するから、ここでstateを宣言している
  // stateにしてエラーと成功したときのメッセージを表示できるようにしている
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  // TODO: これはなんだろう？input要素を取得している
  const fileInputRef = useRef(null);

  /**
   * ファイルが選択されたときの処理
   * TODO: Reactのイベントってなに？JSと同じ？
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleFileChange(e) {
    console.log("e", e);
    console.log("e.target.files", e.target.files);
    // TODO: どうしてイベントにファイルが入っているの？
    // input要素自体がfile型を指定されているから、自分でもファイルを指定しているから？
    // TODO: 複数ファイルを選択できるようにするには👉️multiple 属性を input 要素に付けると複数可能になる
    // TODO: 0は最初に選択されたファイルにアクセスするの意味？
    const file = e.target.files?.[0];
    // TODO: どういうときに早期リターンするの？
    if (!file) return;

    // ーーーーーー↑2026-03-12ここまでーーーーーー
    // 拡張子チェック
    // fileは配列？ドットの位置で区切って配列として返す👉️popで最後の拡張子の部分があるなら小文字にして返す
    const ext = file.name.split(".").pop()?.toLowerCase();
    // もし拡張子が"csv", "xlsx", "xls"でもなかったらエラーを返す
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setErrors(["Please select a CSV or Excel (.xlsx, .xls) file."]);
      // TODO: nullじゃないのはどうして？nullのときと空文字のときの使い分けがわからない。
      setSuccessMessage("");
      return;
    }
    // TODO: xlsxの処理はここから読む
    // FileReaderオブジェクトを使用するとファイルを非同期に読み取ることができます
    const reader = new FileReader();
    // TODO: onloadメソッドって何？
    reader.onload = (event) => {
      try {
        // TODO: event.target.resultの内容を確認する
        console.log("event.target.result", event.target.result);
        // TODO: Uint8Arrayはなに？
        const data = new Uint8Array(event.target.result);
        // xlsxのライブラリのreadメソッドです
        // TODO: dataを配列型で読むよ、と意味かどうかを確認する
        const workbook = read(data, { type: "array" });
        console.log("workbook", workbook);
        // 最初のシートを取得
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // -------------ここまで2026-03-13----------------
        // シートをJSON配列に変換（ヘッダー行をキーとして使う）
        const rows = utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          setErrors(["The file is empty or has no data rows."]);
          setSuccessMessage("");
          return;
        }

        // TODO: 一つでもエラーがあったら追加しない安全なデータ取り込みを学ぶ
        const newProducts = [];
        const parseErrors = [];

        for (let i = 0; i < rows.length; i++) {
          const { product, error } = parseRow(rows[i], i + 2); // +2: ヘッダー行 + 0-indexed
          if (error) {
            parseErrors.push(error);
          } else {
            newProducts.push(product);
          }
        }

        if (parseErrors.length > 0) {
          setErrors(parseErrors);
          setSuccessMessage("");
          return;
        }

        // TODO: 商品のstateを書き換える処理
        // バリデーション成功→商品を追加
        onProductsChange([...products, ...newProducts]);
        setErrors([]);
        setSuccessMessage(
          `${newProducts.length} product(s) imported successfully!`,
        );
      } catch {
        setErrors(["Failed to read the file. Please check the file format."]);
        setSuccessMessage("");
      }

      // TODO: fileInputRef.current.value = "";はよくでてくるらしいからチェック
      // ファイル入力をリセット（同じファイルを再選択可能にする）
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <>
      <div className="mb-3">
        <label htmlFor="import-file" className="form-label">
          Import from CSV / Excel
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="import-file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="form-control"
        />
        <div className="form-text">
          Columns: <code>category</code>, <code>name</code>, <code>price</code>,{" "}
          <code>stocked</code>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <strong>Import errors:</strong>
          <ul className="mb-0 mt-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
