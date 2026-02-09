/**
 * カテゴリを一つずつ表示するコンポーネント
 * @param {string} category
 * @returns
 */
function ProductCategoryRow({ category }) {
  return (
    <tr>
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
  // 在庫があるなら普通に表示、ないなら赤文字で表示する
  const name = product.stocked ? (
    product.name
  ) : (
    <span style={{ color: "red" }}>{product.name}</span>
  );

  return (
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
    </tr>
  );
}

/**
 *
 * @param {*} param0
 * @returns
 */
function ProductTable({ products }) {
  const rows = [];
  let lastCategory = null;
  // forEachは配列の要素一つずつに指定した処理をするメソッド
  products.forEach((product) => {
    // カテゴリーが変わったことを判定するための条件分岐
    if (product.category !== lastCategory) {
      //   TODO: rowsはなぜ必要なの？なぜpushしているの？
      rows.push(
        // カテゴリが変わったら、カテゴリ表示のためのコンポーネントを追加する
        // ! 更新を速く・正しくするためにkeyが必要
        <ProductCategoryRow
          category={product.category}
          key={product.category}
        />,
      );
    }
    // 商品を表示するためのコンポーネントを追加
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

function SearchBar() {
  return (
    <form>
      <input type="text" placeholder="Search..." />
      <label>
        <input type="checkbox" /> Only show products in stock
      </label>
    </form>
  );
}

/**
 * @typedef {Object} Product
 * @property {string} category
 * @property {string} price
 * @property {boolean} stocked
 * @property {string} name
 */
/**
 * @param {Product[]} products
 * @returns
 */
function FilterableProductTable({ products }) {
  return (
    <div>
      <SearchBar />
      <ProductTable products={products} />
    </div>
  );
}

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
 *
 * @returns
 */
export default function App() {
  // JSXの中でJSを書くために｛｝で囲む
  return <FilterableProductTable products={PRODUCTS} />;
}
