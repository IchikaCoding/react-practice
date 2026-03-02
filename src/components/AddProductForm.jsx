import { useState } from "react";
import {
  validationPrice,
  validationTrimmedName,
} from "../validation/validation";

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
    const validationError = validationPrice(productPrice);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    // 商品名の空白を削除する
    const trimmedName = productName.trim();
    const nameError = validationTrimmedName(trimmedName);
    if (nameError) {
      setErrorMessage(nameError);
      return;
    }
    setErrorMessage(null);
    const newProduct = {
      id: crypto.randomUUID(),
      category: productCategory,
      price: Number(productPrice),
      stocked: isProductStock,
      name: trimmedName,
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
        <div className="mb-3">
          {/* ラベルにもclassName="form-label"があるとラベルとinputの隙間が整う */}
          <label htmlFor="category-select" className="form-label">
            Category
          </label>
          <select
            name="category"
            id="category-select"
            value={productCategory}
            onChange={(e) => {
              onProductCategoryChange(e.target.value);
            }}
            required
            className="form-select"
          >
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Snacks">Snacks</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="product-price" className="form-label">
            Product Price
          </label>
          <input
            type="number"
            value={productPrice}
            onChange={(e) => {
              onProductPriceChange(e.target.value);
            }}
            max={100000}
            min={1}
            required
            className="form-control"
            id="product-price"
          />
        </div>
        <div className="form-check mb-3">
          <input
            type="checkbox"
            checked={isProductStock}
            onChange={(e) => {
              onIsProductStockChange(e.target.checked);
            }}
            className="form-check-input"
            id="add-stock-checkbox"
          />
          {/* チェックボックスのときのラベルはform-check-label */}
          <label htmlFor="add-stock-checkbox" className="form-check-label">
            Do you have these items in stock?
          </label>
        </div>
        <div className="mb-3">
          <label htmlFor="product-name" className="form-label">
            Product name
          </label>
          <input
            type="text"
            placeholder="Add..."
            value={productName}
            onChange={(e) => {
              onProductNameChange(e.target.value);
            }}
            maxLength={30}
            minLength={1}
            required
            className="form-control"
            id="product-name"
          ></input>
        </div>
        <p className="error-message text-danger">{errorMessage}</p>
        <button type="submit" className="btn btn-primary mb-3">
          add product
        </button>
      </form>
    </>
  );
}
