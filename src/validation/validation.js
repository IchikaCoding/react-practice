// 価格は1〜100000で入力してくださいと表示するための条件分岐を書く
// priceが1より小さい、10万より大きい、数値じゃないならエラー
// エラーメッセージをセットして、フォーム送信を早期リターンさせる

export function validationPrice(productPrice) {
  // TODO: 空文字のときのエラーを表示する処理追加する
  // これもとからproductPriceは文字列だからString()は必要？
  if (String(productPrice).trim() === "") {
    return "Please enter the price";
  }
  const price = Number(productPrice);
  // ここは空文字の時もこの条件を満たす
  if (!Number.isFinite(price) || price < 1 || price > 100000) {
    return "価格は1〜100000ドルで入力してください";
  }
  return "";
}
