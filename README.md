# mnemo-key
edit mnemo board by keyboard

https://akouryy.github.io/mnemo-key/

## 操作方法
* [MNEMO](https://mnemo.pro) のローカルストレージの `boardData` の内容(最初と最後の引用符除く)を、 `localStorage.boardData` と書かれている欄にコピー&ペーストする **(この内容はどこかにバックアップすることを推奨する)** 。
* ステージを選択するとセーブデータ一覧が表示されるので、編集したいセーブデータを選択する。
* 上下左右キーで移動、スペースキーで回転、BackspaceまたはDeleteキーで削除。
* 新たなブロックを配置したい場合は、右側のブロック一覧に表示されているショートカットキーを用いる。
* Saveボタンを押すと下の `new boardData` の欄にデータが出力される。これを前述の `localStorage` にペーストして、MNEMOで読み込む。

## 借用したソースコード
* TSGが制作しているプログラミング風パズルゲーム [tsg-ut/mnemo](https://github.com/tsg-ut/mnemo) (MIT License) の、
    * [/stages/](https://github.com/tsg-ut/mnemo/tree/master/stages) 以下の全ファイルのステージデータ。
    * [/lib/block-configs.js](https://github.com/tsg-ut/mnemo/blob/master/lib/block-configs.js)。ただし `key` および `preceding` 属性を追加している。
