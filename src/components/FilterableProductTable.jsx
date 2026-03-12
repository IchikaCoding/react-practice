import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import SearchBar from "./SearchBar";
import ProductTable from "./ProductTable";
import AddProductForm from "./AddProductForm";
import ImportProducts from "./ImportProducts";
import { PRODUCTS, PRODUCTS_KEY } from "../data/products";
import {
  validationPrice,
  validationTrimmedName,
} from "../validation/validation";
import { createPortal } from "react-dom";

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
  // 次にフォーカスを当てたい商品のIDを保管するRef
  const productFocusedIDRef = useRef(null);
  // ProductRowのDeleteボタンの要素をIDで取得したものを持っておくRef
  const deleteBtnRefs = useRef(new Map());
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
  /**
   * 編集モードをCancelしたときの処理
   * @param {*} cancelBtnId
   */
  function handleCancelButton(cancelBtnId) {
    console.log("cancelBtnId", cancelBtnId);
    setEditingId(null);
    // 一回編集ボタンを押したあとにキャンセルしたらエラーメッセージはリセット
    setErrorMessage(null);
  }
  /**
   * 削除ボタンを押してモーダルが開く処理
   * @param {*} deleteBtnId
   */
  function handleDeleteButton(deleteBtnId) {
    // delete押す直前にフォーカスが当たっているHTML要素を代入してそれを保存しておく
    lastFocusedRef.current = document.activeElement;

    console.log("lastFocusedRef", lastFocusedRef);
    setIsModalOpen(true);
    setDeleteBtnId(deleteBtnId);
  }
  // モーダル画面のdeleteボタンが押されたときの処理
  // TODO: Okはややこしいかも？
  /**
   * モーダルの削除ボタンを押したときの処理
   * @returns
   */
  function handleModalOkBtn() {
    // deleteBtnIdがnullのときは削除を実行しないというガード
    if (!deleteBtnId) {
      // 安全のため、deleteBtnIdがnullのときは閉じる
      setIsModalOpen(false);
      return;
    }

    // TODO: productsの中身を調べて、currentProductIndexがあっているのか確認する
    console.log("products", products);
    const sortedProducts = getVisibleProducts(products, filterCategory);
    // TODO: フォーカスを次の行へ移動
    // deleteBtnIdから商品のインデックスを取得する方法
    const currentProductIndex = sortedProducts.findIndex(
      (product) => product.id === deleteBtnId,
    );
    // 下の行のインデックスがあるならそのIDを取得
    // それがないなら上の行のインデックスのIDを取得
    // TODO: null合体演算子じゃなくて論理和のほうがいいのでは？
    // id が null/undefined のときだけ次候補にしたい」なら ??
    const nextFocusedId =
      sortedProducts[currentProductIndex + 1]?.id ??
      sortedProducts[currentProductIndex - 1]?.id ??
      null;
    // pendingFocusIdRefで次のDeleteがある要素のIDを取得
    // TODO: nullが入った場合どうする？
    productFocusedIDRef.current = nextFocusedId;
    console.log("nextFocusedId", nextFocusedId);
    console.log("currentProductIndex", currentProductIndex);

    // productsのコピーをprevとして作成。その配列から1つずつ要素を取得する
    // その要素のIDとdeleteBtnIdが一致していたら削除できる
    setProducts((prev) => prev.filter((product) => product.id !== deleteBtnId));
    setIsModalOpen(false);
    // deleteした後はDeleteボタンのIDはリセットしたいからnullをいれる
    setDeleteBtnId(null);
    // フォーカスをnextFocusedIdの要素に当てる
  }
  /**
   * モーダルを閉じるときの処理
   */
  function handleModalCancelBtn() {
    setIsModalOpen(false);
    setDeleteBtnId(null);
    lastFocusedRef.current?.focus();
  }
  // 画面表示の配列を作成する関数を作成する
  // categoryでフィルターしたProductsたちを返す
  // 引数は汎用関数にしたいから、FilterableProductTable.jsx内でstateとして宣言されているものは引数にしておく
  // 👉️他のコンポーネントでも使いやすいかも
  function getVisibleProducts(products, filterCategory) {
    // TODO: productsの手前でカテゴリ順に並び替えること
    const sortProducts = products.toSorted((a, b) =>
      a.category.localeCompare(b.category),
    );
    //nullなら全部合格。カテゴリが一致するものがあったら一致のカテゴリだけ合格
    const filterCategoryProducts = sortProducts.filter((product) => {
      return filterCategory === "All" || filterCategory === product.category;
    });
    console.log("filterCategoryProducts", filterCategoryProducts);
    return filterCategoryProducts;
  }
  useEffect(() => {
    // stateとローカルストレージが違っていたらstateに合わせてローカルストレージを更新する
    //  [products]は依存配列として指定している
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  // TODO: Map()を使ってボタン要素を取得してみよう！

  // Deleteボタンの要素を取得してフォーカス当てる
  // 依存配列に入れた変数が変化したときだけその useEffect が実行される👉️productsが削除されたときに実行したいuseEffectだからproductsを依存配列とする
  useEffect(() => {
    console.log("deleteBtnRefs", deleteBtnRefs);
    const id = productFocusedIDRef.current;
    if (!id) return;
    // Mapを使用して要素をゲットしてfocusを当てる
    // どうしてcurrentの後ろにオプショナルチェーン演算子を入れないの？👉️useRef(new Map())をしているからcurrentは常にmapになるので書かなくて大丈夫！
    // もしundefinedになったときはfocusどうなる？
    // TODO: current?.にしたらNGなのか？
    deleteBtnRefs.current.get(id)?.focus();
    // なぜIDをリセットするの？
    // 👉️IDはモーダルを閉じるときだけの一時メモ。IDを残すと次回の更新時に意図しない再フォーカスが起きます。
    productFocusedIDRef.current = null;
    // ここでどうしてdeleteBtnRefs.current.delete(id)をしないの？
    // 👉️このuseEffectでやることは、次のボタン要素にfocusを当てること。
    // ProductRowが再描画された瞬間に削除されたボタンとかはidでdeleteされる👉️ここでやる必要ない！
  }, [products]);
  // 検索テキストのstate変数の初期値
  const [filterText, setFilterText] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  const visibleProducts = getVisibleProducts(products, filterCategory);
  // ? Portalで描画する場所を分けるために、index.htmlのmodal-rootを作成して取得
  const modalRoot = document.getElementById("modal-root");
  console.log("filterCategory", filterCategory);
  return (
    <div className="container">
      {/* モーダル以外をapp-contentに設定。理由は、背景をラップしてモーダル以外にfocusとかを当てないため */}
      <div id="app-content">
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
              visibleProducts={visibleProducts}
              deleteBtnRefs={deleteBtnRefs}
            />
          </div>
        </div>
        {/* ここから、Form周りのJSXを書く。AddProductFormコンポーネントはFormだけ描画にしておく */}
        <div className="mb-4 card">
          <div className="card-body">
            <h3 className="card-title mb-3">Product addition form</h3>
            <AddProductForm
              products={products}
              onProductsChange={setProducts}
            />
          </div>
        </div>
      </div>
      <div>
        {/* TODO: Portalを使用して、document.bodyのなかにModalのDOMを移動させる？？ */}
        {modalRoot
          ? createPortal(
              <Modal
                isModalOpen={isModalOpen}
                onConfirm={handleModalOkBtn}
                onCancel={handleModalCancelBtn}
              />,
              modalRoot,
            )
          : null}
      </div>
      <div className="mb-4 card">
        <div className="card-body">
          <h3 className="card-title mb-3">Import products</h3>
          <ImportProducts
            products={products}
            onProductsChange={setProducts}
          />
        </div>
      </div>
    </div>
  );
}
