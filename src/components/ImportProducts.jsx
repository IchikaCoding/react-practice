import { useState, useRef } from "react";
import { read, utils } from "xlsx";

/**
 * @typedef {import("../data/products").Product} Product
 */

// CSVやExcelで使えるカテゴリの一覧
const VALID_CATEGORIES = ["Fruits", "Vegetables", "Snacks"];

/**
 * 1行分のデータをバリデーションして、Productオブジェクトに変換する
 * @param {Object} row - ファイルから読み取った1行分のデータ
 * @param {number} rowIndex - 行番号（エラーメッセージ用）
 * @returns {{ product: Product | null, error: string | null }}
 */
function parseRow(row, rowIndex) {
  const category = String(row.category ?? "").trim();
  const name = String(row.name ?? "").trim();
  const priceRaw = row.price;
  const stockedRaw = row.stocked;

  // カテゴリのチェック
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      product: null,
      error: `Row ${rowIndex}: category "${category}" is invalid. Use: ${VALID_CATEGORIES.join(", ")}`,
    };
  }

  // 商品名のチェック
  if (name.length === 0 || name.length > 30) {
    return {
      product: null,
      error: `Row ${rowIndex}: name must be 1–30 characters`,
    };
  }

  // 価格のチェック
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 1 || price > 100000) {
    return {
      product: null,
      error: `Row ${rowIndex}: price must be a number between 1 and 100000`,
    };
  }

  // 在庫のチェック（true/false/"TRUE"/"FALSE"/1/0 を許容）
  let stocked;
  if (typeof stockedRaw === "boolean") {
    stocked = stockedRaw;
  } else {
    const s = String(stockedRaw ?? "").trim().toLowerCase();
    if (s === "true" || s === "1") {
      stocked = true;
    } else if (s === "false" || s === "0") {
      stocked = false;
    } else {
      return {
        product: null,
        error: `Row ${rowIndex}: stocked must be true or false`,
      };
    }
  }

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

/**
 * CSV/Excelファイルから商品データをインポートするコンポーネント
 * @param {Object} props
 * @param {Product[]} props.products - 現在の商品リスト
 * @param {(value: Product[]) => void} props.onProductsChange - 商品リストを更新する関数
 * @returns {JSX.Element}
 */
export default function ImportProducts({ products, onProductsChange }) {
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  /**
   * ファイルが選択されたときの処理
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 拡張子チェック
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setErrors(["Please select a CSV or Excel (.xlsx, .xls) file."]);
      setSuccessMessage("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = read(data, { type: "array" });

        // 最初のシートを取得
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // シートをJSON配列に変換（ヘッダー行をキーとして使う）
        const rows = utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          setErrors(["The file is empty or has no data rows."]);
          setSuccessMessage("");
          return;
        }

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
          Columns: <code>category</code>, <code>name</code>,{" "}
          <code>price</code>, <code>stocked</code>
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
