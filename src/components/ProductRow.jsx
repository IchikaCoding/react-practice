/**
 * @typedef {Object} Product
 * @property {string} category
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {boolean} stocked
 */

/**
 * 商品を一つずつ表示しているコンポーネント
 * @param {Object} props
 * @param {Product} props.product Products配列が持っている一つずつのオブジェクト
 * @param {(deleteBtnId: string) => void} props.handleDeleteButton
 * @param {string | null} props.editingId
 * @param {(editingBtnId: string) => void} props.handleEditButton
 * @param {(value: string) => void} props.setDraftName
 * @param {(value: string) => void} props.setDraftPrice
 * @param {(value: string)=>void} props.handleSaveButton
 * @param {(value: string)=>void} props.handleCancelButton
 * @param {string} props.draftName
 * @param {string} props.draftPrice
 * @param {string | null} props.errorMessage
 * @returns {JSX.Element}
 */
export default function ProductRow({
  product,
  handleDeleteButton,
  editingId,
  handleEditButton,
  setDraftName,
  setDraftPrice,
  handleSaveButton,
  handleCancelButton,
  draftName,
  draftPrice,
  errorMessage,
}) {
  // 在庫があるなら商品の名前を代入、ないなら表品名が赤文字になるようにspan要素を代入している
  const name = product.stocked ? (
    product.name
  ) : (
    <span style={{ color: "red" }}>{product.name}</span>
  );

  if (editingId === product.id) {
    return (
      <>
        <tr>
          <td>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
            />
          </td>
          <td>
            <span>$</span>
            <input
              type="number"
              value={draftPrice}
              onChange={(e) => setDraftPrice(e.target.value)}
            />
          </td>
          <td>
            <button onClick={() => handleSaveButton(product.id)} type="button">
              Save
            </button>
          </td>
          <td>
            <button onClick={() => handleCancelButton(product.id)}>
              Cancel
            </button>
          </td>
        </tr>
        <tr>
          <td className="error-message">
            {/* 空文字だけのときに限定しないでエラーメッセージがtruthyだったら表示するほうがいい */}
            {errorMessage ? errorMessage : null}
          </td>
        </tr>
      </>
    );
  } else {
    return (
      // 1行に2列を表示する
      <tr>
        <td>{name}</td>
        <td>{`$${product.price}`}</td>
        <td>
          <button onClick={() => handleEditButton(product.id)}>Edit</button>
        </td>

        <td>
          <button onClick={() => handleDeleteButton(product.id)}>Delete</button>
        </td>
      </tr>
    );
  }
}
