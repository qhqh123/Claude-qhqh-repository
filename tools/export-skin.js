// 下絵の書き出し：標準スキン（プログラムで描く今の絵）を、画像スキンと同じ大きさ・名前のPNGに書き出す。
// 使い方: node tools/export-skin.js [出力先フォルダ=assets/skins/template]
// 書き出した画像をなぞる・描き直す → 別のフォルダに同じ名前で置く → assets/skins/index.js に登録、で新しいスキンになる。
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const outDir = path.resolve(process.argv[2] || path.join(root, 'assets', 'skins', 'template'));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(root, 'index.html'));
  await page.waitForFunction(() => window.G && G.std && G.skin && window.SKINS);
  const files = await page.evaluate(() => {
    const m = SKINS.list.template;
    const S = 1 / m.scale; // 画像のpx ÷ マップのpx
    const out = {};
    const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const seed = 5; // 模様の位置を固定
    // マップの家畜（横に並んだコマ）
    for (const species of ['cattle', 'horse']) {
      const cfg = m.sprite[species];
      for (let coat = 0; coat < G.COAT_COUNT[species]; coat++) {
        for (const stage of G.STAGES) {
          for (const action of G.SPRITE_ACTIONS) {
            const n = m.frames[action];
            const c = canvas(cfg.w * n, cfg.h);
            const ctx = c.getContext('2d');
            const look = { species, stage, coat, horns: species === 'cattle' && stage !== 'calf' ? 'small' : 'none', pregnant: false, seed, expr: 'easy' };
            for (let i = 0; i < n; i++) {
              ctx.save();
              ctx.translate(i * cfg.w + cfg.ax, cfg.ay);
              ctx.scale(S, S);
              const t = action === 'walk' ? i * Math.PI / 20 : 0.35;
              (species === 'horse' ? G.std.horseSprite : G.std.cowSprite)(ctx, look, 0, 0, { mode: action, facing: 1 }, t);
              ctx.restore();
            }
            out[G.SKIN_FILES.sprite(look, action)] = c.toDataURL('image/png');
          }
        }
        // 立ち絵の「顔と体」
        const size = 512;
        const c = canvas(size, size), ctx = c.getContext('2d');
        ctx.scale(size / 200, size / 200);
        G.std.portraitLayer(ctx, { species, coat, seed, horns: 'none', expr: 'easy' }, 'base');
        out[G.SKIN_FILES.portraitBase({ species, coat })] = c.toDataURL('image/png');
      }
      // 立ち絵の「表情」（種ごとに共通。毛色ごとに分けたいときは speciesN_coatN_expr_*.png を足す）
      for (const expr of G.EXPR_KEYS) {
        const c = canvas(512, 512), ctx = c.getContext('2d');
        ctx.scale(512 / 200, 512 / 200);
        G.std.portraitLayer(ctx, { species, coat: 1, seed, horns: 'none', expr }, 'expr');
        out[G.SKIN_FILES.portraitExpr({ species, expr })] = c.toDataURL('image/png');
      }
    }
    // 角（牛）
    for (const horns of ['small', 'big']) {
      const c = canvas(512, 512), ctx = c.getContext('2d');
      ctx.scale(512 / 200, 512 / 200);
      G.std.portraitLayer(ctx, { species: 'cattle', coat: 1, seed, horns, expr: 'easy' }, 'horns');
      out[G.SKIN_FILES.portraitHorns({ species: 'cattle', horns })] = c.toDataURL('image/png');
    }
    // 人物
    const pc = m.sprite.person;
    for (const kind of G.PERSON_KINDS) {
      for (const action of ['walk', 'idle']) {
        const n = m.frames[action];
        const c = canvas(pc.w * n, pc.h), ctx = c.getContext('2d');
        for (let i = 0; i < n; i++) {
          ctx.save(); ctx.translate(i * pc.w + pc.ax, pc.ay); ctx.scale(S, S);
          G.std.personSprite(ctx, kind, 0, 0, 1, action === 'walk', action === 'walk' ? i * Math.PI / 24 : 0);
          ctx.restore();
        }
        out[G.SKIN_FILES.person(kind, action)] = c.toDataURL('image/png');
      }
      const c = canvas(512, 512);
      G.std.personPortrait(c, kind);
      out[G.SKIN_FILES.personPortrait(kind)] = c.toDataURL('image/png');
    }
    return out;
  });
  fs.mkdirSync(outDir, { recursive: true });
  let bytes = 0;
  for (const [name, url] of Object.entries(files)) {
    const buf = Buffer.from(url.split(',')[1], 'base64');
    bytes += buf.length;
    fs.writeFileSync(path.join(outDir, name), buf);
  }
  console.log(`${Object.keys(files).length} files → ${outDir}（${Math.round(bytes / 1024)}KB）`);
  await browser.close();
})();
