import { useState } from "react";

// モックデータ
const PRODUCTS = [
  { category: "Fruits", price: "$1", stocked: true, name: "Apple" },
  { category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
  { category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
  { category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
  { category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
  { category: "Vegetables", price: "$1", stocked: true, name: "Peas" },
];

/**
 * FilterableProductTableがトップレベルのコンポーネント
 * propsとして{PRODUCTS}を渡している
 * @returns
 */
export default function App() {
  // JSXの中でJSを書くために｛｝で囲む
  return <FilterableProductTable products={PRODUCTS} />;
}

/**
 * 検索テキストとチェックボックスの親コンポーネントだからstateはここで管理する
 * @typedef {Object} Product
 * @property {string} category
 * @property {string} price
 * @property {boolean} stocked
 * @property {string} name
 * @param {Product[]} products
 * @returns
 */
function FilterableProductTable({ products }) {
  // 検索テキストのstate変数の初期値
  const [filterText, setFilterText] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <div>
      {/* チェックされたかどうか、フィルターするときのテキストを受け取るためのprops */}
      {/* 関数を渡したのは入力値をもらって、その値でstateを更新したいから */}
      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly}
        onFilterTextChange={setFilterText}
        onInStockOnlyChange={setInStockOnly}
      />
      {/* 商品情報、チェックされたかどうか、フィルターするときのテキストを受け取るためのprops */}
      {/* 更新された値を使えばいいだけだからstateを更新する関数は不要 */}
      <ProductTable
        products={products}
        inStockOnly={inStockOnly}
        filterText={filterText}
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
  onFilterTextChange,
  onInStockOnlyChange,
}) {
  return (
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
    </form>
  );
}

/**
 * 商品を表示する部分の描画を担当しているコンポーネント
 * @typedef {Object} Product
 * @property {string} category
 * @property {string} price
 * @property {boolean} stocked
 * @property {string} name
 * @param {Product[]} products
 * @returns
 */
function ProductTable({ products, filterText, inStockOnly }) {
  // カテゴリと商品の情報をいれるための配列
  const rows = [];
  // カテゴリが変わったことを判定するための変数
  let lastCategory = null;
  // forEachは配列の要素一つずつに指定した処理をするメソッド
  products.forEach((product) => {
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
    rows.push(<ProductRow product={product} key={product.name} />);
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
      <th colSpan="2">{category}</th>
    </tr>
  );
}
/**
 * 商品を一つずつ表示しているコンポーネント
 * @param {Object} product Products配列が持っている一つずつのオブジェクト
 * @returns
 */
function ProductRow({ product }) {
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
    </tr>
  );
}
