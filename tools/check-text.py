#!/usr/bin/env python3
"""文章JSON（text/*.json）のチェック。

python3 tools/check-text.py
・JSONとして読めるか、ファイル間で文章IDが重複していないか
・speaker / cond のキーと値、プレースホルダーが使えるものか
・ゲームが使う文章IDがそろっているか（ランダム選択の候補が1つ以上あるか）
・性格で分かれる段落が、6つの性格すべてをカバーしているか
問題があれば一覧を出して終了コード1で終わる。ダミーのままの本文の数も数える。
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEAKERS = {'narration', 'staff_girl', 'staff_boy', 'animal', 'senior'}
COND_KEYS = {'species', 'method', 'personality', 'partner_in_pasture', 'partner_liked', 'meat_grade_min', 'locomotion'}
LOCOMOTION = ['quad', 'biped']
PLACEHOLDERS = {'name', 'sex', 'age', 'species', 'staff', 'partner', 'date', 'id_number'}
PERSONALITIES = ['おっとり', '甘えん坊', '活発', '好奇心旺盛', 'マイペース', '頑固']
METHODS = ['ring', 'burdizzo', 'surgical', 'traditional']
SPECIES = ['cattle', 'horse']

# ゲームが必ず使う文章ID（ID そのもの、または「接頭辞*」= ランダム選択の候補）
REQUIRED = ['cas.head', 'cas.react_projection_*', 'cas.staff_girl_*', 'cas.staff_boy_*',
            'cas.course_incomplete_*', 'cas.course_infection_*', 'cas.keep_testes_*']
for sp in SPECIES:
    REQUIRED += [f'cas.{sp}.function_sperm', f'cas.{sp}.function_hormone']
for m in METHODS:
    REQUIRED += [f'cas.{m}.pre_*', f'cas.{m}.tool', f'cas.{m}.locate', f'cas.{m}.act', f'cas.{m}.mismatch_*',
                 f'cas.{m}.react_*', f'cas.{m}.after', f'cas.{m}.course_*']
REQUIRED += ['breed.ai.head', 'breed.ai.estrus_*', 'breed.ai.partner_near_*', 'breed.ai.staff_*', 'breed.ai.act',
             'breed.ai.after_partner_*', 'breed.natural.head', 'breed.natural.act_*', 'breed.natural.after_*',
             'breed.stallion.head', 'breed.stallion.act_*', 'breed.stallion.after_*', 'breed.teaser.act_*', 'breed.teaser.after_*',
             'ship.farewell_*', 'ship.buyer_marbling_*', 'memo.nameplate_*', 'memo.horseshoe_*',
             'rel.mother_01', 'rel.child_01', 'rel.like_01', 'rel.like_02', 'rel.dislike_01', 'rel.match_01',
             'daily.staff_girl_*', 'daily.staff_boy_*', 'daily.animal_*', 'staff.match_girl_*', 'staff.match_boy_*',
             'senior.advice_*', 'senior.rescue_*']
for k in ['early', 'standard', 'late', 'mature', 'ring', 'burdizzo', 'surgical', 'traditional', 'horse']:
    REQUIRED.append(f'vet.advice.{k}')
for c in ['brush', 'pet', 'exercise']:
    REQUIRED.append(f'care.{c}_*')
# 声のステップ（No.24）：性格キー × 術式 × 場面
PERS_KEYS = ['calm', 'sweet', 'lively', 'curious', 'easy', 'stubborn']
for m in METHODS:
    for sc in ['pre', 'act', 'react', 'after', 'course']:
        for pk in PERS_KEYS:
            REQUIRED.append(f'cas.voice.{m}.{sc}.{pk}_*')
for sc in ['pre', 'act', 'after']:
    for pk in PERS_KEYS:
        REQUIRED.append(f'breed.voice.{sc}.{pk}_*')
for pk in PERS_KEYS:
    REQUIRED += [f'ship.voice.farewell.{pk}_*', f'daily.voice.{pk}_*']
# 体の文の二足版（No.24）と腕の文
for m in METHODS:
    REQUIRED += [f'cas.{m}.locate.biped', f'cas.{m}.act.biped', f'cas.{m}.react_biped_*']
REQUIRED += ['breed.ai.act.biped', 'breed.ai.estrus_biped_*', 'breed.natural.act_biped_*', 'breed.teaser.act_biped_*', 'breed.stallion.act_biped_*',
             'cas.arms.locate_*', 'cas.arms.act_*', 'cas.arms.react_*']
# 性格ごとに必ず候補があるべきもの
PERSONALITY_COVER = [f'cas.{m}.react_biped_' for m in METHODS] + [f'cas.{m}.react_' for m in METHODS] + [f'cas.{m}.pre_' for m in METHODS] + [f'care.{c}_' for c in ['brush', 'pet', 'exercise']]


def load():
    data, errors = {}, []
    for path in sorted(glob.glob(os.path.join(ROOT, 'text', '*.json'))):
        name = os.path.basename(path)
        try:
            obj = json.load(open(path, encoding='utf-8'))
        except Exception as e:
            errors.append(f'{name}: JSONとして読めません（{e}）')
            continue
        for k, v in obj.items():
            if k in data:
                errors.append(f'{k}: {data[k][0]} と {name} で重複')
            data[k] = (name, v)
    return data, errors


def is_dummy(text):
    return bool(re.match(r'^［[^］]*］', text or ''))


def check():
    data, errors = load()
    for k, (f, v) in data.items():
        if not isinstance(v, dict) or 'text' not in v:
            errors.append(f'{k}: "text" がありません'); continue
        extra = set(v) - {'text', 'speaker', 'cond'}
        if extra: errors.append(f'{k}: 使えないキー {sorted(extra)}')
        if v.get('speaker', 'narration') not in SPEAKERS: errors.append(f'{k}: speaker "{v.get("speaker")}" は使えません')
        for ph in re.findall(r'\{(\w+)\}', v['text']):
            if ph not in PLACEHOLDERS: errors.append(f'{k}: プレースホルダー {{{ph}}} は使えません')
        cond = v.get('cond') or {}
        for ck, cv in cond.items():
            if ck not in COND_KEYS: errors.append(f'{k}: cond のキー "{ck}" は使えません')
            if ck == 'personality':
                for p in (cv if isinstance(cv, list) else [cv]):
                    if p not in PERSONALITIES: errors.append(f'{k}: 性格 "{p}" はありません')
            if ck == 'method' and cv not in METHODS: errors.append(f'{k}: method "{cv}" はありません')
            if ck == 'species' and cv not in SPECIES: errors.append(f'{k}: species "{cv}" はありません')
            if ck == 'locomotion' and cv not in LOCOMOTION: errors.append(f'{k}: locomotion "{cv}" はありません')
    ids = set(data)
    for r in REQUIRED:
        if r.endswith('*'):
            if not any(i.startswith(r[:-1]) for i in ids): errors.append(f'{r}: 候補が1つもありません')
        elif r not in ids:
            errors.append(f'{r}: ありません')
    for pre in PERSONALITY_COVER:
        cands = [data[i][1] for i in ids if i.startswith(pre)]
        for p in PERSONALITIES:
            if cands and not any(not (c.get('cond') or {}).get('personality') or p in c['cond']['personality'] for c in cands):
                errors.append(f'{pre}*: 性格「{p}」の候補がありません')
    dummy = sum(1 for _, v in data.values() if is_dummy(v.get('text')))
    return data, errors, dummy


if __name__ == '__main__':
    data, errors, dummy = check()
    for e in errors: print('✗', e)
    print(f'{len(data)} ID　ダミーのまま {dummy}　本文あり {len(data) - dummy}　問題 {len(errors)}')
    sys.exit(1 if errors else 0)
