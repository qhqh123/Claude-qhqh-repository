# 命のふれあい牧場

ブラウザで動く見下ろし2Dの牧場経営ゲーム。仕様は `docs/仕様書.txt`。

## 遊び方

`index.html` をブラウザで開く（ダブルクリックで可。サーバー不要）。

- 移動：WASD / 矢印キー、Shift でダッシュ（スマホは左下のスティックと 💨）
- 調べる：E / Space / Enter、または対象をクリック
- 案内看板・ミニマップのクリックで移動

## 文章データ

文章イベントの本文は `text/*.json`。編集したら次を実行して、file:// 用の `js/text-data.js` を作り直す。

```
python3 tools/build-text.py
```

ゲーム内では、メニューで開発者モードを入れると、文章IDの表示・コピーと、文章JSONの読み込み（差し替え）ができる。

## 構成

| ファイル | 内容 |
| --- | --- |
| `js/consts.js` | 定数（付録C） |
| `js/animals.js` | 個体・遺伝・成長・食肉評価 |
| `js/game.js` | 状態・帳簿・市場・ターン進行・年次決算 |
| `js/events.js` | 去勢・交配・出荷・売買 |
| `js/production.js` / `js/ui-production.js` | 搾乳施設・畑と牧草・飼料の自給・農耕馬・レース画面 |
| `js/race.js` | レースの出走登録と判定 |
| `js/draw-horse.js` | 馬の描画 |
| `js/text.js` / `js/novel.js` | 文章JSON・ノベル表示・既読スキップ・出荷画面 |
| `js/map.js` / `js/draw.js` | マップ・カメラ・ミニマップ・描画 |
| `js/ui.js` | 事務所・町・個体詳細・通知などの画面 |
| `js/save.js` | 自動セーブ・JSON書き出し/読み込み |
