#!/usr/bin/env python3
"""文章の執筆用の台帳（docs/文章台帳.md）を作る。

python3 tools/text-sheet.py
イベントごとの表示順・条件・確率と、全文章IDの一覧を書き出す。
本文を書いたら tools/check-text.py でチェックし、tools/build-text.py で js/text-data.js を作り直す。
"""
import importlib.util, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('check', os.path.join(ROOT, 'tools', 'check-text.py'))
chk = importlib.util.module_from_spec(spec); spec.loader.exec_module(chk)
data, errors, dummy = chk.check()

SPEAKER = {'narration': '地の文', 'staff_girl': '厩務員ガール', 'staff_boy': '厩務員ボーイ', 'animal': '家畜', 'senior': '先輩牧場主'}

# イベントの表示順（コードの組み立てと同じ）。(文章ID or 接頭辞*, いつ・条件)
EVENTS = [
    ('去勢（直接対応）', '術式 <m> = ring / burdizzo / surgical / traditional、種 <sp> = cattle / horse。末尾に帳簿行が付く', [
        ('cas.head', '見出し。{date}{name}{species}{sex}{age} を差し込む'),
        ('cas.<m>.pre_*', '処置前の観察。性格で候補が分かれ、1つをランダム'),
        ('cas.<m>.tool', '器具の準備'),
        ('cas.<m>.locate', '対象の確認'),
        ('cas.<sp>.function_sperm', '機能の説明1（種で分かれる）'),
        ('cas.<sp>.function_hormone', '機能の説明2'),
        ('cas.<m>.act', '処置の実施'),
        ('cas.<m>.mismatch_*', '時期に合わない術式を選んだときだけ'),
        ('cas.<m>.react_*', '反応。性格で候補が分かれ、1つをランダム。全候補を読むとスキップで止まらない'),
        ('cas.react_projection_*', '語り手の一文（50%）'),
        ('cas.staff_<girl/boy>_*', '担当厩務員の主観（30%）。担当放牧地の厩務員'),
        ('cas.<m>.after', '直後'),
        ('cas.keep_testes_*', '成熟した雄を観血法・旧来手法で去勢し、成功したときだけ'),
    ]),
    ('去勢の経過日誌（次のターン）', '直接対応のときだけ届く', [
        ('cas.<m>.course_*', '経過日誌'),
        ('cas.course_incomplete_*', '去勢が不完全だったとき'),
        ('cas.course_infection_*', '感染したとき'),
    ]),
    ('人工授精（牛）', '末尾に帳簿行（受胎／不受胎）', [
        ('breed.ai.head', '見出し'),
        ('breed.ai.estrus_*', '発情の確認'),
        ('breed.ai.partner_near_*', '同じ放牧地に、雌が好意を持つ未去勢の成熟雄がいるとき'),
        ('breed.ai.staff_*', '同上'),
        ('breed.ai.act', '人工授精の実施'),
        ('breed.ai.after_partner_*', '同上の条件のとき'),
    ]),
    ('自然交配（牧場内の雄）', '{partner} = 相手の名前', [
        ('breed.natural.head', '見出し'),
        ('breed.natural.act_*', 'cond partner_liked で、雌が相手に好意を持つかどうかで分かれる'),
        ('breed.natural.after_*', '直後'),
    ]),
    ('外部種牡馬との交配（馬）', '{partner} = 種牡馬の名前', [
        ('breed.stallion.head', '見出し'),
        ('breed.teaser.act_*', '当て馬を使ったときだけ'),
        ('breed.teaser.after_*', '同上'),
        ('breed.stallion.act_*', '交配'),
        ('breed.stallion.after_*', '直後'),
    ]),
    ('出荷', '立ち絵のあと、商品ラベルの前', [
        ('ship.farewell_*', '見送りの一言、またはトラックが出ていく1〜2行（ランダム）'),
        ('ship.buyer_marbling_*', '肉質 A+ 以上のとき（cond meat_grade_min: 4）'),
    ]),
    ('メモリアルアイテム', 'アーカイブで「残す」を選んだとき', [
        ('memo.nameplate_*', 'ネームプレート'),
        ('memo.horseshoe_*', '蹄鉄（馬）'),
    ]),
    ('獣医アドバイス（町）', 'ボタンごとに1段落', [
        ('vet.advice.*', '時期（early / standard / late / mature）、術式（ring / burdizzo / surgical / traditional）、馬'),
    ]),
    ('短い文章', '吹き出しや小さな表示。1〜3行', [
        ('care.<brush/pet/exercise>_*', 'お世話への反応（性格で分かれる）'),
        ('daily.animal_*', 'ターン開始時の家畜の仕草'),
        ('daily.staff_<girl/boy>_*', '厩務員に話しかけたとき'),
        ('staff.match_<girl/boy>_*', '担当放牧地に相性の良い個体がいるとき（40%）。{name} はその個体'),
        ('rel.*', '関係タブの内訳の一文。{partner} は相手の名前'),
        ('senior.advice_*', '町の先輩牧場主に「話を聞く」'),
        ('senior.rescue_*', '再建支援を受けたとき。{partner} は母牛の名前'),
    ]),
]


def cond_text(c):
    if not c: return ''
    out = []
    for k, v in c.items():
        if isinstance(v, list): v = '・'.join(v)
        out.append(f'{k}: {v}')
    return '　'.join(out)


lines = ['# 文章台帳', '',
         'このファイルは `python3 tools/text-sheet.py` で自動生成しています。直接編集しないでください。', '',
         '## 書き方', '',
         '- 本文は `text/*.json` の各IDの `"text"` に書きます。ダミーは `［ID｜役割］` の形です。',
         '- 使えるプレースホルダー：' + '　'.join('{' + p + '}' for p in sorted(chk.PLACEHOLDERS)),
         '- 同じ条件で候補を増やすときは、IDの末尾を `_01`, `_02`… と増やします（ゲームがランダムに選びます）。',
         '- 書いたら `python3 tools/check-text.py` でチェックし、`python3 tools/build-text.py` で file:// 用のデータを作り直します。',
         '- ゲーム内では、開発者モードの「文章データを読み込む」で、JSONを差し替えてすぐ確かめられます。',
         '', f'現在：{len(data)} ID（ダミーのまま {dummy}、本文あり {len(data) - dummy}）', '',
         '## イベントごとの表示順', '']
for title, note, rows in EVENTS:
    lines += [f'### {title}', '', note, '', '| 順 | 文章ID | いつ・条件 |', '|---|---|---|']
    for i, (pid, when) in enumerate(rows, 1):
        lines.append(f'| {i} | `{pid}` | {when} |')
    lines.append('')

lines += ['## 全文章ID', '']
by_file = {}
for k, (f, v) in data.items(): by_file.setdefault(f, []).append((k, v))
for f in sorted(by_file):
    lines += [f'### {f}', '', '| 文章ID | 役割 | 話し手 | 条件 | 状態 |', '|---|---|---|---|---|']
    for k, v in sorted(by_file[f]):
        t = v.get('text', '')
        m = re.match(r'^［[^｜］]*｜([^］]*)］', t)
        role = m.group(1) if m else ''
        state = 'ダミー' if chk.is_dummy(t) else '本文あり'
        lines.append(f'| `{k}` | {role} | {SPEAKER.get(v.get("speaker", "narration"), "")} | {cond_text(v.get("cond"))} | {state} |')
    lines.append('')

out = os.path.join(ROOT, 'docs', '文章台帳.md')
open(out, 'w', encoding='utf-8').write('\n'.join(lines))
print('wrote', out)
