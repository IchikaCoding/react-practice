/**
 * カテゴリを一つずつ表示するコンポーネント
 *
 * @param {string} category
 * @returns {JSX.Element} カテゴリのタイトルを表示
 */
export default function ProductCategoryRow({ category }) {
  return (
    <tr>
      {/* colSpanは、列を横向きに結合できるもの。今回でいうと、2列を一つのセルとして結合している */}
      <th colSpan="4">{category}</th>
    </tr>
  );
}
