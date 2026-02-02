function MyButton() {
  return <button className="button-san">私はボタンさん。33歳。よろしく</button>;
}

// `export default`はファイル内のメインコンポーネントを指定
// 実行方法はどうするの？
export default function MyApp() {
  return (
    <div>
      <h1>Welcome to my App</h1>
      <MyButton />
      <AboutPage />
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <p>
        こんにちは
        <br />
        お天気いいですよね☺️
      </p>
    </div>
  );
}

// function isLoggedInFanc() {
//   let content;
//   let isLoggedIn = false;
//   if (isLoggedIn) {
//     content = <AdminPanel />;
//   } else {
//     content = <LoginForm />;
//   }
//   return <div>{content}</div>;
// }

// // 条件？演算子を使用したバージョン
// <div>{isLoggedIn ? <AdminPanel /> : <LoginForm />}</div>;

// // elseがいらないバージョン
// <div>
//   isLoggedIn && <AdminPanel />
// </div>;
