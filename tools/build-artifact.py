#!/usr/bin/env python3
"""index.html と css/js をまとめて、1つのHTMLにする（ブラウザ上で共有するページ用）。

使い方: python3 tools/build-artifact.py 出力先.html
・CSS と JS はすべてインラインにする
・フォントは同梱ファイルではなく Google Fonts から読み込む
・<html>/<head>/<body> は付けない（公開側で付く）
"""
import os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'dist', 'inochi-farm.html')
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()

title = re.search(r'<title>(.*?)</title>', html, re.S).group(1)
body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
css = open(os.path.join(root, 'css', 'style.css'), encoding='utf-8').read()


def inline_script(m):
    src = m.group(1)
    if src == 'assets/skins/index.js':
        # 共有ページでは画像を置けないので、標準スキンだけにする
        return "<script>window.SKINS = { active: 'standard', list: {} };</script>"
    if src == 'assets/skins/files.js':
        return "<script>window.SKIN_FILE_LIST = {};</script>"
    code = open(os.path.join(root, src), encoding='utf-8').read()
    if '</script' in code.lower():
        sys.exit(f'{src} に </script が含まれています')
    return f'<script>/* {src} */\n{code}\n</script>'


body = re.sub(r'<script src="([^"]+)"></script>', inline_script, body)
page = f'''<title>{title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800&display=swap">
<style>
{css}
</style>
{body}'''
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(page)
print('wrote', out, f'{len(page.encode("utf-8")) // 1024}KB')
