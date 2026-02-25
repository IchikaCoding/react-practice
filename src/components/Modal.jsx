import { useEffect } from "react";

export default function Modal({ isModalOpen, onConfirm, onCancel }) {
  // イベントリスナー登録したい！これは画面描画以外👉️useEffectの出番！
  // TODO: これって最後に処理される？
  useEffect(() => {
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
    // モーダル画面をだしているときに暗くなる背景の部分。ここをクリックするとキャンセルされる
    <div className="modal-overlay" onClick={onCancel}>
      {/* モーダル画面本体。e.stopPropagation()によって
      ダイアログがクリックされても背景までクリックされたことが伝わらない！
      だから、ダイアログを押してもダイアログが閉じることがなくなる！
      */}
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        // モーダルってことをアクセシビリティ情報として追加。
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
      >
        <p>Are you sure you want to delete?</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>OK</button>
      </div>
    </div>
  );
}
