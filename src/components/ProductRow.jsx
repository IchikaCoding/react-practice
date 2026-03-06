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
 * @param {(value: boolean) => void} props.setDraftStocked
 * @param {(saveBtnId: string, nameInputEl: HTMLInputElement | null, priceInputEl: HTMLInputElement | null)=>void} props.handleSaveButton
 * @param {(value: string)=>void} props.handleCancelButton
 * @param {string} props.draftName
 * @param {string} props.draftPrice
 * @param {boolean} props.draftStocked
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
  setDraftStocked,
  handleSaveButton,
  handleCancelButton,
  draftName,
  draftPrice,
  draftStocked,
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
  // カテゴリ別で色を指定したオブジェクトを用意する
  // それのproductのカテゴリに一致する色を変数に入れて置く
  const categoryClassMap = {
    Fruits: "text-bg-warning",
    Vegetables: "text-bg-success",
    Snacks: "text-bg-danger",
  };
  const badgeTextBg = categoryClassMap[product.category] ?? "text-bg-secondary";

  if (editingId === product.id) {
    return (
      <>
        <tr>
          <td>
            <input
              type="checkbox"
              id={`is-stocked-${product.id}`}
              checked={draftStocked}
              onChange={(e) => setDraftStocked(e.target.checked)}
            />
            <label htmlFor={`is-stocked-${product.id}`}>In stock?</label>
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
        <td>
          {/* TODO: このバッジかわいくない。。。 */}
          {/* d-flex flex-columnの意味を調べる */}
          {/* flex-columnは子要素を縦並びにする */}
          <div className="d-inline-flex flex-column">
            {/* align-self-start = 「この子だけ横に伸ばさず、カテゴリの文字の分だけの幅にして左寄せで置く」 */}
            {/* バッジの色を変数に入れて、それをクラス名として使用する */}
            <span
              className={`badge rounded-pill align-self-start ${badgeTextBg}`}
            >
              {product.category}
            </span>
            <span>{name}</span>
          </div>
        </td>

        <td>{`$${product.price}`}</td>
        <td className="text-start">
          <button
            onClick={() => handleEditButton(product.id)}
            className="btn btn-primary w-100"
          >
            Edit
          </button>
        </td>
        <td className="text-start">
          <button
            onClick={() => handleDeleteButton(product.id)}
            className="btn btn-danger w-100"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
}
