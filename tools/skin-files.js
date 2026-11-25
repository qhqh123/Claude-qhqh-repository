// 置いた画像の一覧を作る：assets/skins/<名前>/*.png を調べて assets/skins/files.js に書き出す。
// 使い方: node tools/skin-files.js（画像を足したり消したりしたら実行する）
// ブラウザ（file://）はフォルダの中身を調べられないので、ゲームはこの一覧にある画像だけを読む。
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'skins');
const list = {};
for (const name of fs.readdirSync(dir).sort()) {
  const sub = path.join(dir, name);
  if (!fs.statSync(sub).isDirectory()) continue;
  list[name] = fs.readdirSync(sub).filter((f) => f.toLowerCase().endsWith('.png')).sort();
}
const body = '// 自動生成: node tools/skin-files.js\nwindow.SKIN_FILE_LIST = ' + JSON.stringify(list, null, 1) + ';\n';
fs.writeFileSync(path.join(dir, 'files.js'), body);
console.log('wrote assets/skins/files.js', Object.entries(list).map(([k, v]) => `${k}: ${v.length}`).join(', '));
