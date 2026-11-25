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

| コマンド | 内容 |
| --- | --- |
| `python3 tools/check-text.py` | 文章JSONのチェック（ID・条件・プレースホルダー・抜け） |
| `python3 tools/text-sheet.py` | 執筆用の台帳 `docs/文章台帳.md` を作り直す |
| `node tools/sim.js [回数] [年数]` | 自動プレーでのバランス検証（結果は `docs/バランス検証.md`） 拡張する方針は、余ったお世話の使い方（使わない／木こり小屋で木材／手伝い＋木材購入）を3通り試す。`ONLY='農耕'` で方針を絞れる |
| `node tools/export-skin.js` | 標準の絵を下絵の画像（`assets/skins/template/`）に書き出す |
| `node tools/skin-files.js` | スキンの画像を足したり消したりしたあと、置いた画像の一覧を作り直す |
| `python3 tools/build-artifact.py 出力.html` | 1つのHTMLにまとめる（共有ページ用） |

## 資料

- `docs/仕様書.txt`：仕様のすべて
- `docs/文章台帳.md`：文章イベントの表示順と全文章ID
- `docs/バランス検証.md`：自動プレーの結果と調整案
- `docs/仕様との突き合わせ.md`：仕様の各項目の実装状態

## 構成

| ファイル | 内容 |
| --- | --- |
| `js/consts.js` | 定数（付録C） |
| `js/animals.js` | 個体・遺伝・成長・食肉評価 |
| `js/game.js` | 状態・帳簿・市場・ターン進行・年次決算 |
| `js/events.js` | 去勢・交配・出荷・売買 |
| `js/production.js` / `js/ui-production.js` | 搾乳施設・畑と牧草・飼料の自給・農耕馬・レース画面 |
| `js/race.js` | レースの出走登録と判定 |
| `js/relations.js` | 個体関係（親密度）と厩務員の性格相性 |
| `js/senior.js` | 先輩牧場主（再建支援） |
| `js/storage.js` | 倉庫とメモリアルアイテム（ネームプレート・蹄鉄・精巣） |
| `js/ui-choice.js` | 選択カード・一覧の行・去勢と交配・倉庫の画面 |
| `js/draw-horse.js` | 馬の描画 |
| `js/text.js` / `js/novel.js` | 文章JSON・ノベル表示・既読スキップ・出荷画面 |
| `js/map.js` | マップ・カメラ・ミニマップ |
| `js/look.js` / `js/skin.js` | 見た目情報と、絵の差し替え（スキン）。説明は `assets/skins/README.md` |
| `js/draw.js` / `js/draw-horse.js` | 標準スキン（プログラムで描く絵） |
| `js/ui.js` | 事務所・町・個体詳細・通知などの画面 |
| `js/save.js` | 自動セーブ・JSON書き出し/読み込み |
