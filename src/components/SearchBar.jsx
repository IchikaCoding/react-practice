/**
 * 入力するフォーム部分を描画するためのコンポーネント
 * @param {Object} props
 * @param {string} props.filterText
 * @param {boolean} props.inStockOnly
 * @param {string} props.filterCategory
 * @param {(value: string) => void} props.onFilterCategoryChange
 * @param {(value: string) => void} props.onFilterTextChange
 * @param {(value: boolean) => void} props.onInStockOnlyChange
 * @returns {JSX.Element} 検索画面を表示
 */
export default function SearchBar({
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
