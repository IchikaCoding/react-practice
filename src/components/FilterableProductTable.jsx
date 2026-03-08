import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import SearchBar from "./SearchBar";
import ProductTable from "./ProductTable";
import AddProductForm from "./AddProductForm";
import { PRODUCTS, PRODUCTS_KEY } from "../data/products";
import {
  validationPrice,
  validationTrimmedName,
} from "../validation/validation";

/**
 * PRODUCTSの要素一つ分の型
 * どのパスのファイルなのかと、その中のどの型をインポートするのかを{}の中に書く
 * {}のうしろには、このファイル内で使用したい型名を書く
 * @typedef {import("../data/products").Product} Product
 * */

/**
 * @returns {JSX.Element}
 */
export default function FilterableProductTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastFocusedRef = useRef(null);
  const [deleteBtnId, setDeleteBtnId] = useState(null);
  // 編集中かどうかを管理するためのState変数。IDで管理する
  const [editingId, setEditingId] = useState(null);
  // 編集中の商品名と価格は下書きstate変数に入れておく
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftStocked, setDraftStocked] = useState(false);
  // 商品の値段が空欄だったときに表示するためのエラーメッセージstate
  const [errorMessage, setErrorMessage] = useState("");

  // productsをstateにして、更新もここで行われる
  // リロードされると、またモックデータで初期化される
  // TODO: これ合っている？
  /** @type {[Product[], Function]} */
  const [products, setProducts] = useState(() => {
    try {
      // 初回表示時にlocalStorageを確認する
      const storageProducts = localStorage.getItem(PRODUCTS_KEY);
      const parsedStorageProducts = JSON.parse(storageProducts);
      // ローカルストレージの中身がなかったらモックデータをいれる
      if (parsedStorageProducts === null) {
        return PRODUCTS;
      }

      // 配列じゃないとき、もしくは要素がゼロのときはモックデータを返す
      if (
        !Array.isArray(parsedStorageProducts) ||
        parsedStorageProducts.length === 0
      ) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
        return PRODUCTS;
      }
      // ローカルストレージにデータがあった場合、productsのstate変数にそのデータをいれる
      // ちなみに、nullのときは早期リターンだからelseにしなくてもOK
      return parsedStorageProducts;
    } catch (error) {
      // もし上の処理中にエラーが出た場合、モックデータをstateに保存しつつ、ローカルストレージに保存し直す
      console.error(error);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
      return PRODUCTS;
    }
  });

  /**
   * 編集開始の準備だけをする処理
   * @param {*} editBtnId
   */
  function handleEditButton(editBtnId) {
    // 編集中のIDをセットする
    setEditingId(editBtnId);

    // Products配列からproductの要素を取得
    // そのデータを表示する
    const searchProduct = products.find((product) => {
      // ! IDセットした直後に使用してるからstateより引数を使用する
      if (editBtnId === product.id) {
        return product;
      }
    });
    if (!searchProduct) return;
    setDraftName(searchProduct.name);
    // TODO: ＄をなくす処理を入れるべき？
    setDraftPrice(searchProduct.price.toString());
    setDraftStocked(searchProduct.stocked);
    console.log("draftPrice", Number.isFinite(draftPrice));
    console.log("searchProduct", searchProduct);
  }

  // ここでデータの更新がうまくいっていない！→商品の値段がしっかりできていません
  function handleSaveButton(saveBtnId, nameInputEl, priceInputEl) {
    console.log("saveBtnId", saveBtnId);
    // ! input要素が取得出来なかった場合、reportValidity()の前にnullのガードを入れておくと安心
    if (!nameInputEl || !priceInputEl) {
      setErrorMessage("入力欄のHTML要素が取得出来ませんでした");
      return;
    }
    // DOM要素に対してreportValidity()を実行する→falseならエラーってこと！
    // validationPrice()を実行してエラーの結果を変数に入れておく
    // reportValidity()がfalseのとき、もしくはvalidationPrice()でエラーメッセージがあったとき、
    // エラーがあったらそれをsetErrorMessage()で更新、早期リターン
    const isNameInputEl = nameInputEl.reportValidity();
    const isPriceInputEl = priceInputEl.reportValidity();
    const validationError = validationPrice(draftPrice);
    // ! バリデーションチェック→NGならブラウザのエラー表示を出す→結果を true/false で返す
    if (!isNameInputEl || !isPriceInputEl || validationError) {
      // TODO: validationErrorがあるならそれ表示、空文字なら表示しない
      setErrorMessage(validationError);
      return;
    }

    // 商品名の空白を削除する
    const trimmedName = draftName.trim();
    // エラーメッセージがあったらそれを変数に追加
    const nameError = validationTrimmedName(trimmedName);
    if (nameError) {
      setErrorMessage(nameError);
      return;
    }
    setErrorMessage(null);
    // 下書きからProducts自体を更新する
    // TODO: 新しく配列を作成→それで更新しないとReactが再描画してくれないかも？
    setProducts((prev) =>
      prev.map((item) => {
        // オブジェクトでスプレッド構文を使用した理由は？
        // 値を更新したものだけが変更されて、それ以外はそのまま展開される。順番はもとのまま
        // mapして新しい配列を作成したいなら、その要素をreturnしないといけない！
        return item.id === saveBtnId
          ? {
              ...item,
              name: trimmedName,
              price: Number(draftPrice),
              stocked: draftStocked,
            }
          : item;
      }),
    );
    // IDのリセットのためになにもないよと意味でnullを入れる
    setEditingId(null);
  }
  function handleCancelButton(cancelBtnId) {
    console.log("cancelBtnId", cancelBtnId);
    setEditingId(null);
    // 一回編集ボタンを押したあとにキャンセルしたらエラーメッセージはリセット
    setErrorMessage(null);
  }

  function handleDeleteButton(deleteBtnId) {
    // delete押す直前にフォーカスが当たっているHTML要素を代入してそれを保存しておく
    lastFocusedRef.current = document.activeElement;
    console.log("lastFocusedRef", lastFocusedRef);
    setIsModalOpen(true);
    setDeleteBtnId(deleteBtnId);
  }
  // モーダル画面のdeleteボタンが押されたときの処理
  // TODO: Okはややこしいかも？
  function handleModalOkBtn() {
    // deleteBtnIdがnullのときは削除を実行しないというガード
    if (!deleteBtnId) {
      // 安全のため、deleteBtnIdがnullのときは閉じる
      setIsModalOpen(false);
      return;
    }
    // TODO: productsの中身を調べて、currentProductIndexがあっているのか確認する
    console.log("products", products);
    // TODO: フォーカスを次の行へ移動
    // deleteBtnIdから商品のインデックスを取得する方法
    const currentProductIndex = products.findIndex(
      (product) => product.id === deleteBtnId,
    );
    console.log("currentProductIndex", currentProductIndex);
    // productsのコピーをprevとして作成。その配列から1つずつ要素を取得する
    // その要素のIDとdeleteBtnIdが一致していたら削除できる
    setProducts((prev) => prev.filter((product) => product.id !== deleteBtnId));
    setIsModalOpen(false);
    // Deleteボタンの
    // deleteした後はDeleteボタンのIDはリセットしたいからnullをいれる
    setDeleteBtnId(null);
  }
  function handleModalCancelBtn() {
    setIsModalOpen(false);
    setDeleteBtnId(null);
  }

  useEffect(() => {
    // stateとローカルストレージが違っていたらstateに合わせてローカルストレージを更新する
    //  [products]は依存配列として指定している
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  // 検索テキストのstate変数の初期値
  const [filterText, setFilterText] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  console.log("filterCategory", filterCategory);
  return (
    <div className="container">
      <div>
        <h1>Product inventory management app</h1>
      </div>
      {/* チェックされたかどうか、フィルターするときのテキストを受け取るためのprops */}
      {/* 関数を渡したのは入力値をもらって、その値でstateを更新したいから */}

      <div className="mb-4 card">
        <div className="card-body">
          <h3 className="card-title mb-3">Search for products</h3>
          <SearchBar
            filterText={filterText}
            inStockOnly={inStockOnly}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            onFilterTextChange={setFilterText}
            onInStockOnlyChange={setInStockOnly}
          />
        </div>
      </div>

      {/* 商品情報、チェックされたかどうか、フィルターするときのテキストを受け取るためのprops */}
      {/* 更新された値を使えばいいだけだからstateを更新する関数は不要 */}
      <div className="mb-4 card">
        <div className="card-body">
          <h3 className="card-title mb-3">Product table</h3>
          <ProductTable
            products={products}
            inStockOnly={inStockOnly}
            filterText={filterText}
            filterCategory={filterCategory}
            handleDeleteButton={handleDeleteButton}
            editingId={editingId}
            handleEditButton={handleEditButton}
            handleSaveButton={handleSaveButton}
            handleCancelButton={handleCancelButton}
            draftName={draftName}
            draftPrice={draftPrice}
            draftStocked={draftStocked}
            setDraftName={setDraftName}
            setDraftPrice={setDraftPrice}
            setDraftStocked={setDraftStocked}
            errorMessage={errorMessage}
          />
        </div>
      </div>
      {/* ここから、Form周りのJSXを書く。AddProductFormコンポーネントはFormだけ描画にしておく */}
      <div className="mb-4 card">
        <div className="card-body">
          <h3 className="card-title mb-3">Product addition form</h3>
          <AddProductForm products={products} onProductsChange={setProducts} />
        </div>
      </div>
      <Modal
        isModalOpen={isModalOpen}
        onConfirm={handleModalOkBtn}
        onCancel={handleModalCancelBtn}
        lastFocusedRef={lastFocusedRef}
      />
    </div>
  );
}
