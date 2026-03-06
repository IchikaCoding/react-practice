import { useEffect } from "react";

/**
 * 削除ボタンを押したときのモーダル表示処理
 * @param {Object} props
 * @param {boolean} props.isModalOpen - モーダルを開くかどうか
 * @param {() => void} props.onConfirm - OK時の処理
 * @param {() => void} props.onCancel - キャンセル時の処理
 * @returns {JSX.Element | null} モーダルUI（非表示時はnull）
 */
export default function Modal({ isModalOpen, onConfirm, onCancel }) {
  // イベントリスナー登録したい！これは画面描画以外👉️useEffectの出番！
  // TODO: これって最後に処理される？
  useEffect(() => {
    // モーダルが閉じていたら早期リターンしてイベント登録しない
    if (!isModalOpen) return;
    // エスケープキーのハンドラ
    function handleEscapeKeyDown(e) {
      if (e.key === "Escape") {
        return onCancel();
      }
    }
    document.addEventListener("keydown", handleEscapeKeyDown);
    // イベントの処理が終わったらreturnのうしろにイベントの解除の処理を書く！
    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown);
    };
    // useEffect内で使ったから書いた
  }, [isModalOpen, onCancel]);

  if (!isModalOpen) {
    // React のコンポーネントの return なら null を返す
    return null;
  }
  // returnされるもの
  return (
    <>
      {/* .modal自体の標準はdisplay: none;（非表示寄り）。だからd-blockは表示するやつをつける*/}
      <div
        // fade: アニメーション用の「初期状態」（透明 or ずらし）
        // show: 表示状態にするクラス（fade とセットで使う）
        className="modal d-block fade show"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        // これつけることで、ダイアログの外側をクリックしたら閉じる
        onClick={onCancel}
        // modal-titleのidと同じ名前をつけておくとアクセシビリティ的にGoodなの？
        aria-labelledby="ModalLabel"
      >
        {/* モーダル画面をだしているときに暗くなる背景の部分。ここをクリックするとキャンセルされる */}
        {/* e.stopPropagation()でダイアログ画面の内側のクリックを外側に伝えないようにしている */}
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          {/* モーダル画面本体。e.stopPropagation()によって
      ダイアログがクリックされても背景までクリックされたことが伝わらない！
      だから、ダイアログを押してもダイアログが閉じることがなくなる！
      */}
          <div className="modal-content">
            <div className="modal-header">
              {/* ページ本文でh1使っている場合、見出しの階層を壊しにくくするためにh2~3くらいにするのがよいらしい */}
              <h2 className="modal-title" id="ModalLabel">
                Confirm delete
              </h2>
              <button
                aria-label="closeButton"
                type="button"
                className="btn-close"
                onClick={onCancel}
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                aria-label="close"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* fadeはアニメーションの仕組みを担当。モーダルにshowをつけると、表示状態のスタイル（背景色とか濃さとか）などを調整してくれる */}
      {/* これはモーダル開いたときに暗くする背景レイヤー。モーダルの要素とは別でdiv要素を作成している */}
      <div className="modal-backdrop show"></div>
    </>
  );
}
