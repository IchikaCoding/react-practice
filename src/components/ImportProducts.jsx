import { useState, useRef } from "react";
import { read, utils } from "xlsx";

/**
 * @typedef {import("../data/products").Product} Product
 */

// CSVやExcelで使えるカテゴリの一覧
const VALID_CATEGORIES = ["Fruits", "Vegetables", "Snacks"];

// ここの関数からデータの変換とエラー処理を学ぶ
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
  // 一旦入力から来たそのままの値を取得してからNumberで変換する（2段階にしておく）
  // 変数のRawは仮のデータとして保存していることをわかりやすくするため
  const priceRaw = row.price;
  const stockedRaw = row.stocked;

  // カテゴリのチェック
  // categoryにVALID_CATEGORIES配列に含まれないカテゴリが入っていたらエラー
  if (!VALID_CATEGORIES.includes(category)) {
    // エラーとproductをプロパティにしてエラーならproduct側をnullにするのは、インポート処理とかで1行ずつチェックしたいときによく使われる
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
  const price = Number(priceRaw);
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

// errors / successMessageで画面表示を切り替える処理を確認する
/**
 * CSV/Excelファイルから商品データをインポートするコンポーネント
 * @param {Object} props
 * @param {Product[]} props.products - 現在の商品リスト
 * @param {(value: Product[]) => void} props.onProductsChange - 商品リストを更新する関数
 * @returns {JSX.Element}
 */
export default function ImportProducts({ products, onProductsChange }) {
  // 空の配列で初期化するとerrors.lengthとかが最初から使えるので安心！null だと、配列メソッドを使ったときにエラーになりやすいから注意！
  // このコンポーネント内で表示非表示を管理するから、ここでstateを宣言している
  // stateにしてエラーと成功したときのメッセージを表示できるようにしている
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * input要素から取得するRef
   * @type {import("react").RefObject<HTMLInputElement | null>}
   */
  const fileInputRef = useRef(null);

  /**
   * ファイルが選択されたときの処理
   * ReactのイベントとJSのイベントの違いは？👉️onChange などで受け取る SyntheticEvent（合成イベント）。JSのイベントはaddEventListenerで受け取る Event
   * HTMLInputElementから、Input要素のイベントの型ですよという説明書き
   * @param {React.ChangeEvent<HTMLInputElement>} e ブラウザのイベントみたいな感じで使える。ブラウザ差を吸収して、どの環境でも同じ書き方にしてくれるらしい。
   */
  function handleFileChange(e) {
    // input要素自体がfile型を指定されているから、自分でもファイルを指定しているから？
    // 複数ファイルを選択できるようにするには👉️multiple 属性を input 要素に付けると複数可能になる
    // 0は1つ目のファイルにアクセスするの意味
    // FileListに入っているのはメソッドたち？
    // fileはファイルのメタ情報が入っているけど、ファイル本文を読むには非同期処理でFileReaderを使用する
    const file = e.target.files?.[0];
    // どういうときに早期リターンするの？👉️外からデータをインポートしているから一旦確認する
    if (!file) return;
    // 拡張子チェック
    // fileは配列？ドットの位置で区切って配列として返す👉️popで最後の拡張子の部分があるなら小文字にして返す
    // ! splitで?.をやらないのは、文字列なら.がなくてもそのままの文字列が必ず返ってくるから。
    // file.name.split(".")で空の配列になった場合、pop()でundefinedになる→それを防ぐために?.を使う
    const ext = file.name.split(".").pop()?.toLowerCase();
    // もし拡張子が"csv", "xlsx", "xls"でもなかったらエラーを返す
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setErrors(["Please select a CSV or Excel (.xlsx, .xls) file."]);
      // nullじゃないのは、基本は後からセットするメッセージの型に揃えたいから
      setSuccessMessage("");
      return;
    }

    // xlsxの処理はここから読む
    // FileReaderオブジェクトを使用するとファイルを非同期に読み取ることができます
    const reader = new FileReader();
    // onloadメソッドって何？👉️fileを読み込む方法を登録する処理
    // readerは非同期だからawaitが必要なのでは？👉️FileReader()は古いAPIだから、Promiseを返さない👉️awaitは不要で、成功したときの処理はonloadでセットしておく
    // どうしてコールバック？関数の定義をしているだけ？readAsArrayBufferをするときにonloadを勝手につかって処理してくれる
    // ファイルを読み込んだあとの処理を先に登録しておかないとファイル読み込みが早く終わった場合に間に合わなくなるらしい！
    reader.onload = (event) => {
      try {
        // TODO: event.target.resultが取得出来ているのかを確認してエラー出す処理があってもいいかも？reader.onerrorでもOK
        // event.target.resultは、ArrayBuffer(5461)（生データの入れ物）
        // Uint8Arrayはなに？「5452バイトのデータを、1バイトずつ0〜255の数字」で見えるようにしたもの。バイナリを数値表示しただけのビュー」
        // dataには配列の中に数字の羅列があった
        const data = new Uint8Array(event.target.result);

        // xlsxのライブラリのreadメソッドです
        // TODO: dataを配列型で読むよ、と意味かどうかを確認する
        const workbook = read(data, { type: "array" });
        // 最初のシートを取得
        const sheetName = workbook.SheetNames[0];
        // workbook のSheetsというプロパティにセルのデータが入っていた
        const sheet = workbook.Sheets[sheetName];
        // -------------ここまで2026-03-13----------------
        // シートをJSON配列に変換（ヘッダー行をキーとして使う）
        const rows = utils.sheet_to_json(sheet);
        if (rows.length === 0) {
          setErrors(["The file is empty or has no data rows."]);
          setSuccessMessage("");
          return;
        }

        // 一つでもエラーがあったら追加しない安全なデータ取り込みを学ぶ
        const newProducts = [];
        // エラーが出ていても止めず全部のエラーを集めて一括で表示するために配列にしておく
        // throwだとエラーが出たときに止まっちゃうから細かい行エラーを出せない
        const parseErrors = [];

        for (let i = 0; i < rows.length; i++) {
          // どうしてrowIndex求めるときに＋2をするの？
          // →rows配列はインデックスが0スタート。Excel側では1行目がヘッダー。2行目から商品が入る。Excelと同じ行番号をいれるためには+2が必要
          const { product, error } = parseRow(rows[i], i + 2); // +2: ヘッダー行 + 0-indexed
          // エラーの処理を先にやるほうが読みやすいらしい
          if (error) {
            parseErrors.push(error);
          } else {
            newProducts.push(product);
          }
        }
        if (parseErrors.length > 0) {
          // エラーは配列としてsetErrorsにセットする
          setErrors(parseErrors);
          setSuccessMessage("");
          // 早期リターンしたらキャッチには入らないよ
          return;
        }

        // 商品のstateを書き換える処理
        // バリデーション成功→商品を追加
        // スプレッド構文ですでに登録されている商品と、newProductsの配列を展開してくっつける
        onProductsChange([...products, ...newProducts]);
        setErrors([]);
        setSuccessMessage(
          `${newProducts.length} product(s) imported successfully!`,
        );
      } catch {
        // 想定外なエラーがでたときだけここが動く
        setErrors(["Failed to read the file. Please check the file format."]);
        setSuccessMessage("");
      }
      // fileInputRef.current.valueにはファイル名が入っていた「C:\fakepath\productsData (1).xlsx」
      // ! fileInputRef.current.value = "";はよくでてくるらしいからチェック
      // ファイル入力をリセット（同じファイルを再選択可能にする）
      // リセットすると、onChange が発火しやすくなる
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // FileReader()のメソッドを使用して、実データ（生バイナリ）をゲットする👉️これはonloadの機能？
    // readAsArrayBuffer = 箱を開けて中身のバイト列を取り出す👉️これなら変数に代入していないからバイト列を取り出すのは嘘？
    // これはファイルを読み込むという合図なだけ？これをやって成功したらオンロードが実行されるってこと？

    // readAsArrayBufferで「読み込み開始の合図」
    // 読み込みが成功すると、あとで reader.onload に登録した関数が自動で呼ばれる
    // 読み込んだ結果のデータ本体は event.target.result に入る（実データ（生バイナリ））
    // 失敗時は reader.onerrorに登録されている処理を実行する
    reader.readAsArrayBuffer(file);
  }

  return (
    <>
      <div className="mb-3">
        {/* ラベルはFormの中じゃなくてもform-label */}
        {/* label要素のhtmlForとinputのid属性を一致させるとラベルをクリックしてinputが選ばれる */}
        <label htmlFor="import-file" className="form-label">
          Import from CSV / Excel
        </label>
        {/* 選択したファイルを取得するためにref属性をつけておく */}
        {/* accept属性で、選択できるファイルを指定できる */}
        {/* handleFileChangeはonChange属性で、イベントが引数になる。イベントのターゲットのファイルを指定してファイルを取得する */}
        <input
          ref={fileInputRef}
          type="file"
          id="import-file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="form-control"
        />
        <div className="form-text">
          {/* codeタグの色の指定はBootstrapでした--bs-code-color */}
          Columns: <code>category</code>, <code>name</code>, <code>price</code>,{" "}
          <code>stocked</code>
        </div>
      </div>
      {/* successMessageが空文字なら空文字が返る（Reactはfalsyな値（0は含まない）は画面に出さない値になる）。
      successMessageに0が入っていた場合、falsyではあるけど0が画面に出る
      文字列が入っていたら<div>が返る */}
      {/* successMessageが空文字ならnullを返すという三項演算子でもOK */}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <strong>Import errors:</strong>
          {/* ul要素に自動でつく余白を消すためにmb-0をしている */}
          <ul className="mb-0 mt-1">
            {/* mapは第1引数に値、第2引数にインデックスをもてる */}
            {errors.map((err, i) => (
              // key属性とは？React専用の目印。Reactが前回と今回で、どのliが同じ“データ”かを判別するために使う。DOMには出ないからCSSで指定するとかは出来ない
              // id属性はブラウザ側が使う目印で、HTMLの属性👉️CSSで使用するため？getElementByIDは要素取得のためだけにID属性つけるよね？
              // 並び順が変わる可能性があるなら、indexよりIDとかを使う方が良いらしい
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
