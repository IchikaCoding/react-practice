// ローカルストレージのキー名の定義
export const PRODUCTS_KEY = "productsKey";
// モックデータ
/**
 * PRODUCTSの要素一つ分の型
 * @typedef {Object} Product
 * @property {string} category
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {boolean} stocked
 */
/**
 * PRODUCTS変数はProduct の配列ですというJSDoc
 * @type {Product[]}
 */
export const PRODUCTS = [
  { id: "p1", category: "Fruits", price: 1, stocked: true, name: "Apple" },
  {
    id: "p2",
    category: "Fruits",
    price: 1,
    stocked: true,
    name: "DragonFruit",
  },
  {
    id: "p3",
    category: "Fruits",
    price: 2,
    stocked: false,
    name: "PassionFruit",
  },
  {
    id: "p4",
    category: "Vegetables",
    price: 2,
    stocked: true,
    name: "Spinach",
  },
  {
    id: "p5",
    category: "Vegetables",
    price: 4,
    stocked: false,
    name: "Pumpkin",
  },
  {
    id: "p6",
    category: "Vegetables",
    price: 1,
    stocked: true,
    name: "Peas",
  },
];
