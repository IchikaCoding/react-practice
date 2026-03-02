/**
 * カテゴリを一つずつ表示するコンポーネント
 *
 * @param {string} category
 * @returns {JSX.Element} カテゴリのタイトルを表示
 */
export default function ProductCategoryRow({ category }) {
  return (
    <tr className="table table-secondary py-2 border-top border-2">
      {/* colSpanは、列を横向きに結合できるもの。今回でいうと、2列を一つのセルとして結合している */}
      {/* py-2は、paddingをトップとボトムの両方につけるもの？ */}
      <th colSpan="4" className="fw-bold text-start">
        {category}
      </th>
    </tr>
  );
}
