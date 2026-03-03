import { useRef } from "react";
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
  const priceInputRef = useRef(null);
  const nameInputRef = useRef(null);

  if (editingId === product.id) {
    return (
      <>
        <tr>
          <td>
            <input
              ref={nameInputRef}
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              minLength={1}
              maxLength={30}
              required
              className="form-control"
            />
          </td>
          {/* w-30にすると編集時だけ価格のセルの横幅を大きくできる */}
          <td className="w-30">
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                // inputのDOM要素を取得するためのもの（入力内容はReactが自動更新してくれる）
                ref={priceInputRef}
                type="number"
                value={draftPrice}
                onChange={(e) => setDraftPrice(e.target.value)}
                min={1}
                max={100000}
                // 空欄もNGにしたいならこれをいれる↓
                required
                className="form-control"
              />
            </div>
          </td>
          <td>
            <button
              onClick={() =>
                handleSaveButton(
                  product.id,
                  nameInputRef.current,
                  priceInputRef.current,
                )
              }
              type="button"
              className="btn btn-success"
            >
              Save
            </button>
          </td>
          <td>
            <button
              onClick={() => handleCancelButton(product.id)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </td>
        </tr>
        {/* エラーメッセージがtruthyだったら表示する(空文字だけのときに限定しないようにした) */}
        {errorMessage ? (
          <tr>
            {/* colspanをつけてセル4つ分を使用するようにしました */}
            <td className="error-message text-danger" colSpan={4}>
              {errorMessage}
            </td>
          </tr>
        ) : null}
      </>
    );
  } else {
    return (
      // 1行に2列を表示する
      <tr>
        <td>{name}</td>
        <td>{`$${product.price}`}</td>
        <td>
          <button
            onClick={() => handleEditButton(product.id)}
            className="btn btn-primary"
          >
            Edit
          </button>
        </td>

        <td>
          <button
            onClick={() => handleDeleteButton(product.id)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
}
