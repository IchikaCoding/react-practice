import { useState, useEffect } from "react";

// ローカルストレージのキー名の定義
const PRODUCTS_KEY = "productsKey";
// モックデータ
const PRODUCTS = [
  { id: "p1", category: "Fruits", price: "$1", stocked: true, name: "Apple" },
  {
    id: "p2",
    category: "Fruits",
    price: "$1",
    stocked: true,
    name: "DragonFruit",
  },
  {
    id: "p3",
    category: "Fruits",
    price: "$2",
    stocked: false,
    name: "PassionFruit",
  },
  {
    id: "p4",
    category: "Vegetables",
    price: "$2",
    stocked: true,
    name: "Spinach",
  },
  {
    id: "p5",
    category: "Vegetables",
    price: "$4",
    stocked: false,
    name: "Pumpkin",
  },
  {
    id: "p6",
    category: "Vegetables",
    price: "$1",
    stocked: true,
    name: "Peas",
  },
];

/**
 * FilterableProductTableがトップレベルのコンポーネント
 * propsとして{PRODUCTS}を渡している
 * @returns
 */
export default function App() {
  // JSXの中でJSを書くために｛｝で囲む
  return <FilterableProductTable />;
}

/**
 * 検索テキストとチェックボックスの親コンポーネントだからstateはここで管理する
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} category
 * @property {string} price
 * @property {boolean} stocked
 * @property {string} name
 * @param {Product[]} products
 * @returns
 */
function FilterableProductTable() {
  // TODO: このisModalOpen変数は使わなくてもOK？
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteBtnId, setDeleteBtnId] = useState(null);
  // productsをstateにして、更新もここで行われる
  // リロードされると、またモックデータで初期化される
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

  function handleDeleteButton(deleteBtnId) {
    setIsModalOpen(true);
    setDeleteBtnId(deleteBtnId);
  }
  // モーダル画面のOKボタンが押されたときの処理
  function handleModalOkBtn() {
    // deleteBtnIdがnullのときは削除を実行しないというガード
    if (!deleteBtnId) {
      // 安全のため、deleteBtnIdがnullのときは閉じる
      setIsModalOpen(false);
      return;
    }
    // productsのコピーをprevとして作成。その配列から1つずつ要素を取得する
    // その要素のIDとdeleteBtnIdが一致していたら削除できる
    setProducts((prev) => prev.filter((product) => product.id !== deleteBtnId));
    setIsModalOpen(false);
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
    <div>
      {/* チェックされたかどうか、フィルターするときのテキストを受け取るためのprops */}
      {/* 関数を渡したのは入力値をもらって、その値でstateを更新したいから */}
      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        onFilterTextChange={setFilterText}
        onInStockOnlyChange={setInStockOnly}
      />
      <AddProductForm products={products} onProductsChange={setProducts} />
      {/* 商品情報、チェックされたかどうか、フィルターするときのテキストを受け取るためのprops */}
      {/* 更新された値を使えばいいだけだからstateを更新する関数は不要 */}
      <ProductTable
        products={products}
        inStockOnly={inStockOnly}
        filterText={filterText}
        filterCategory={filterCategory}
        handleDeleteButton={handleDeleteButton}
      />
      <Modal
        isModalOpen={isModalOpen}
        onConfirm={handleModalOkBtn}
        onCancel={handleModalCancelBtn}
      />
    </div>
  );
}

/**
 * 入力するフォーム部分を描画するためのコンポーネント
 * @returns
 */
function SearchBar({
  filterText,
  inStockOnly,
  filterCategory,
  onFilterCategoryChange,
  onFilterTextChange,
  onInStockOnlyChange,
}) {
  return (
    <>
      <form>
        <input
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={(e) => {
            onFilterTextChange(e.target.value);
          }}
        />
        <label>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              onInStockOnlyChange(e.target.checked);
            }}
          />{" "}
          Only show products in stock
        </label>
        {/* カテゴリのセレクト要素を入れたい */}
        {/* valueでfilterCategoryというstateを代入しているから初期値はstateの初期値が採用される。selectedで初期値をしても意味なし！ */}
        {/* 入力値はここで取得 */}
        <select
          name="filterCategory"
          id="filter-category-select"
          value={filterCategory}
          onChange={(e) => {
            onFilterCategoryChange(e.target.value);
          }}
        >
          <option value="All">All</option>
          <option value="Fruits">Fruits</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Snacks">Snacks</option>
        </select>
      </form>
    </>
  );
}

// ここでinputされた情報を受け取る必要がある！
/**
 * 商品追加フォームの作成、入力値を受け取る処理（UI担当）
 * @param {*} param0
 * @returns
 */
function AddProductForm({ products, onProductsChange }) {
  // ローカルのstateを作成する
  const [productCategory, onProductCategoryChange] = useState("Fruits");
  const [productPrice, onProductPriceChange] = useState("");
  const [isProductStock, onIsProductStockChange] = useState(false);
  const [productName, onProductNameChange] = useState("");

  // フォームを送信するときに実行する処理
  function handleSubmit(e) {
    // 再描画を防ぐ
    e.preventDefault();
    const newProduct = {
      id: crypto.randomUUID(),
      category: productCategory,
      price: `$${productPrice}`,
      stocked: isProductStock,
      name: productName,
    };

    // FilterableProductTableにわたすための一時データ
    const newProducts = [...products, newProduct];
    onProductsChange(newProducts);
  }
  // onProductsChange(newProducts);
  return (
    <form onSubmit={handleSubmit}>
      {/* セレクトはどうやって入力を受け取る？ */}
      <select
        name="category"
        id="category-select"
        value={productCategory}
        onChange={(e) => {
          onProductCategoryChange(e.target.value);
        }}
      >
        <option value="Fruits">Fruits</option>
        <option value="Vegetables">Vegetables</option>
        <option value="Snacks">Snacks</option>
      </select>
      <input
        type="number"
        value={productPrice}
        onChange={(e) => {
          onProductPriceChange(e.target.value);
        }}
      />
      <input
        type="checkbox"
        checked={isProductStock}
        onChange={(e) => {
          onIsProductStockChange(e.target.checked);
        }}
      />
      <input
        type="text"
        placeholder="Add..."
        value={productName}
        onChange={(e) => {
          onProductNameChange(e.target.value);
        }}
      ></input>
      <button type="submit">add product</button>
    </form>
  );
}

/**
 * 商品を表示する部分の描画を担当しているコンポーネント
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} category
 * @property {string} price
 * @property {boolean} stocked
 * @property {string} name
 * @param {Product[]} products
 * @returns
 */
function ProductTable({
  products,
  filterText,
  inStockOnly,
  filterCategory,
  handleDeleteButton,
}) {
  // カテゴリと商品の情報をいれるための配列
  const rows = [];
  // カテゴリが変わったことを判定するための変数
  let lastCategory = null;
  // TODO: productsの手前でカテゴリ順に並び替えること
  const sortProducts = products.toSorted((a, b) =>
    a.category.localeCompare(b.category),
  );
  console.log("sortProducts", sortProducts);
  //nullなら全部合格。カテゴリが一致するものがあったら一致のカテゴリだけ合格
  const filterCategoryProducts = sortProducts.filter((product) => {
    return filterCategory === "All" || filterCategory === product.category;
  });
  console.log("filterCategoryProducts", filterCategoryProducts);

  // forEachは配列の要素一つずつに指定した処理をするメソッド
  filterCategoryProducts.forEach((product) => {
    // 商品の名前を全部小文字にしたものと、検索したい文字として入力された小文字文字列が一致しない場合はリターンする処理
    // indexOf()は文字列と検索したい文字列が一致しなかったら-1を返すメソッド
    if (product.name.toLowerCase().indexOf(filterText.toLowerCase()) === -1) {
      return;
    }
    //! 「ストックがあるものだけ表示するがチェックされているとき」かつ「ストックがないとき」はリターンする
    if (inStockOnly && !product.stocked) {
      return;
    }

    if (product.category !== lastCategory) {
      // カテゴリーが変わったことを判定するための条件分岐
      rows.push(
        // カテゴリが変わったら、カテゴリ表示のためのコンポーネントを追加する
        // ! 更新を速く・正しくするためにkeyが必要
        // propsとしてカテゴリを渡している
        <ProductCategoryRow
          category={product.category}
          key={product.category}
        />,
      );
    }
    // 商品を表示するためのコンポーネントを配列に追加
    rows.push(
      <ProductRow
        product={product}
        key={product.id}
        handleDeleteButton={handleDeleteButton}
      />,
    );
    lastCategory = product.category;
    console.log("lastCategory", lastCategory);
  });

  console.log("rows", rows);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Delete</th>
        </tr>
      </thead>
      {/* JSXの要素の配列はReactが展開して、順番に表示してくれるらしい！！ */}
      <tbody>{rows}</tbody>
    </table>
  );
}

/**
 * カテゴリを一つずつ表示するコンポーネント
 *
 * @param {string} category
 * @returns
 */
function ProductCategoryRow({ category }) {
  return (
    <tr>
      {/* colSpanは、列を横向きに結合できるもの。今回でいうと、2列を一つのセルとして結合している */}
      <th colSpan="3">{category}</th>
    </tr>
  );
}
/**
 * 商品を一つずつ表示しているコンポーネント
 * @param {Object} product Products配列が持っている一つずつのオブジェクト
 * @returns
 */
function ProductRow({ product, handleDeleteButton }) {
  // 在庫があるなら商品の名前を代入、ないなら表品名が赤文字になるようにspan要素を代入している
  const name = product.stocked ? (
    product.name
  ) : (
    <span style={{ color: "red" }}>{product.name}</span>
  );

  return (
    // 1行に2列を表示する
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
      <td>
        <button onClick={() => handleDeleteButton(product.id)}>削除</button>
      </td>
    </tr>
  );
}

function Modal({ isModalOpen, onConfirm, onCancel }) {
  if (!isModalOpen) {
    // React のコンポーネントの return なら null を返す
    return null;
  }
  // returnされるもの
  return (
    // モーダル画面をだしているときに暗くなる背景の部分。ここをクリックするとキャンセルされる
    <div className="modal-overlay" onClick={onCancel}>
      {/* モーダル画面本体。e.stopPropagation()によって
      ダイアログがクリックされても背景までクリックされたことが伝わらない！
      だから、ダイアログを押してもダイアログが閉じることがなくなる！
      */}
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        // モーダルってことをアクセシビリティ情報として追加。
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
      >
        <p>Are you sure you want to delete?</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>OK</button>
      </div>
    </div>
  );
}
