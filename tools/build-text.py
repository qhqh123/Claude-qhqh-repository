#!/usr/bin/env python3
"""text/*.json を読み込み、file:// でも使える js/text-data.js を生成する。"""
import json, glob, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data, seen = {}, {}
for path in sorted(glob.glob(os.path.join(root, 'text', '*.json'))):
    name = os.path.basename(path)
    with open(path, encoding='utf-8') as f:
        obj = json.load(f)
    for k in obj:
        if k in seen:
            sys.exit(f'文章IDの重複: {k} ({seen[k]} / {name})')
        seen[k] = name
    data[name] = obj
out = os.path.join(root, 'js', 'text-data.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write('// 自動生成: python3 tools/build-text.py\n')
    f.write('window.TEXT_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print('wrote', out, sum(len(v) for v in data.values()), 'ids')
