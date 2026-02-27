import AddProductForm from "../components/AddProductForm";

// 価格は1〜100000で入力してくださいと表示するための条件分岐を書く
// priceが1より小さい、10万より大きい、数値じゃないならエラー
// エラーメッセージをセットして、フォーム送信を早期リターンさせる

export default function validationPrice(productPrice) {
  const price = Number(productPrice);
  if (!Number.isFinite(price) || price < 1 || price > 100000) {
    setErrorMessage("価格は1〜100000で入力してください");
    return;
  }
}
