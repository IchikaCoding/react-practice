import { useState } from "react";

// ここでinputされた情報を受け取る必要がある！

/**
 * @typedef {Object} Product
 * @property {string} category
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {boolean} stocked
 */

/**
 * 商品追加フォームの作成、入力値を受け取る処理（UI担当）
 * @param {Object} props
 * @param {Product[]} props.products
 * @param {(value: Product[])=> void} props.onProductsChange
 * @returns {JSX.Element}
 */
export default function AddProductForm({ products, onProductsChange }) {
  // ローカルのstateを作成する
  const [productCategory, onProductCategoryChange] = useState("Fruits");
  // ! この子はe.target.valueでもらってくるから、文字列がよろしい
  const [productPrice, onProductPriceChange] = useState("");
  const [isProductStock, onIsProductStockChange] = useState(false);
  const [productName, onProductNameChange] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // フォームを送信するときに実行する処理
  function handleSubmit(e) {
    // 再描画を防ぐ
    e.preventDefault();
    if (productPrice === "") {
      setErrorMessage("Please enter the price");
      return;
    }
    setErrorMessage(null);
    const newProduct = {
      id: crypto.randomUUID(),
      category: productCategory,
      price: Number(productPrice),
      stocked: isProductStock,
      name: productName,
    };

    // FilterableProductTableにわたすための一時データ
    const newProducts = [...products, newProduct];
    onProductsChange(newProducts);
  }
  // onProductsChange(newProducts);
  return (
    <>
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
      <p className="error-message">{errorMessage}</p>
    </>
  );
}
