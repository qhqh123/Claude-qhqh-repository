// スキン：絵の差し替え
// ・標準スキン（standard）：プログラムで描く今の絵（js/draw.js, js/draw-horse.js）
// ・画像スキン：assets/skins/<名前>/ に決まった名前のPNGを置き、assets/skins/index.js に登録する
// 画像がない組み合わせは、標準スキンで代わりに描く（一部だけ差し替えても動く）。

// ファイル名の決まり（assets/skins/README.md と tools/export-skin.js も同じ）
// <種> は 'cattle' / 'horse'。normal 以外のフォームは 'cattle-<フォーム>' のようになる（G.lookKey）
G.SKIN_FILES = {
  sprite: (look, action) => `${G.lookKey(look)}_${look.stage}_coat${look.coat}_${action}.png`,
  portraitBase: (look) => `${G.lookKey(look)}_coat${look.coat}_base.png`,
  portraitExprCoat: (look) => `${G.lookKey(look)}_coat${look.coat}_expr_${look.expr}.png`,
  portraitExpr: (look) => `${G.lookKey(look)}_expr_${look.expr}.png`,
  portraitHorns: (look) => `${G.lookKey(look)}_horns_${look.horns}.png`,
  person: (kind, action) => `person_${kind}_${action}.png`,
  personPortrait: (kind) => `person_${kind}_portrait.png`,
};
G.PERSON_KINDS = ['player', 'girl', 'boy', 'senior'];
G.SPRITE_ACTIONS = ['walk', 'idle', 'graze'];

G.skin = {
  name: 'standard',
  imgs: {},
  list() { return (window.SKINS && window.SKINS.list) || {}; },
  names() { return ['standard'].concat(Object.keys(this.list())); },
  label(n) { return n === 'standard' ? '標準' : (this.list()[n] && this.list()[n].label) || n; },
  manifest() { return this.name === 'standard' ? null : this.list()[this.name] || null; },

  init() {
    let n = (window.SKINS && window.SKINS.active) || 'standard';
    try { n = localStorage.getItem('inochi-farm-skin') || n; } catch (e) { /* */ }
    if (!this.names().includes(n)) n = 'standard';
    return this.use(n, false);
  },
  use(n, remember) {
    this.name = this.names().includes(n) ? n : 'standard';
    if (remember !== false) { try { localStorage.setItem('inochi-farm-skin', this.name); } catch (e) { /* */ } }
    return this.preload();
  },
  // 置いた画像の一覧（assets/skins/files.js。node tools/skin-files.js で作り直す）
  // 一覧にある画像だけを読む。一覧にない絵は、その種の標準の絵で描く
  fileList() { return ((window.SKIN_FILE_LIST || {})[this.name]) || []; },
  // 決まった名前の一覧（下絵の書き出しで使う）
  allFiles() {
    const F = G.SKIN_FILES, out = [];
    for (const species of ['cattle', 'horse']) {
      for (let coat = 0; coat < G.COAT_COUNT[species]; coat++) {
        for (const stage of G.STAGES) for (const act of G.SPRITE_ACTIONS) out.push(F.sprite({ species, stage, coat }, act));
        out.push(F.portraitBase({ species, coat }));
        for (const expr of G.EXPR_KEYS) out.push(F.portraitExprCoat({ species, coat, expr }));
      }
      for (const expr of G.EXPR_KEYS) out.push(F.portraitExpr({ species, expr }));
    }
    for (const horns of ['small', 'big']) out.push(F.portraitHorns({ species: 'cattle', horns }));
    for (const kind of G.PERSON_KINDS) { out.push(F.person(kind, 'walk'), F.person(kind, 'idle'), F.personPortrait(kind)); }
    return out;
  },
  preload() {
    const m = this.manifest();
    if (!m) return Promise.resolve();
    const jobs = this.fileList().map((f) => new Promise((res) => {
      const key = this.name + '/' + f;
      if (this.imgs[key] !== undefined) { res(); return; }
      const im = new Image();
      im.onload = () => { this.imgs[key] = im; res(); };
      im.onerror = () => { this.imgs[key] = null; res(); };
      im.src = m.dir + f;
    }));
    return Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, 5000))]);
  },
  img(f) {
    if (this.name === 'standard') return null;
    const im = this.imgs[this.name + '/' + f];
    return im && im.naturalWidth ? im : null;
  },
  frameOf(cfg, action, t, seed) {
    const n = (this.manifest().frames || {})[action] || 1;
    return action === 'walk' ? Math.floor(t * 8 + (seed % 4)) % n : 0;
  },

  // ---------- 描画 ----------
  animal(ctx, look, x, y, st, t) {
    const action = st.mode === 'walk' ? 'walk' : st.mode === 'graze' ? 'graze' : 'idle';
    const im = this.img(G.SKIN_FILES.sprite(look, action));
    if (!im) { (look.species === 'horse' ? G.std.horseSprite : G.std.cowSprite)(ctx, look, x, y, st, t); return; }
    this.drawFrame(ctx, im, this.manifest().sprite[look.species], action, x, y, st.facing, t, look.seed);
  },
  person(ctx, kind, x, y, facing, walking, t) {
    const action = walking ? 'walk' : 'idle';
    const im = this.img(G.SKIN_FILES.person(kind, action));
    if (!im) { G.std.personSprite(ctx, kind, x, y, facing, walking, t); return; }
    this.drawFrame(ctx, im, this.manifest().sprite.person, action, x, y, facing, t, 0);
  },
  drawFrame(ctx, im, cfg, action, x, y, facing, t, seed) {
    const m = this.manifest();
    const fi = this.frameOf(cfg, action, t, seed);
    const sc = m.scale;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(im, fi * cfg.w, 0, cfg.w, cfg.h, -cfg.ax * sc, -cfg.ay * sc, cfg.w * sc, cfg.h * sc);
    ctx.restore();
  },
  // 立ち絵：背景 → 角 → 顔と体 → 表情。層ごとに、画像が無ければ標準の絵
  portrait(canvas, look) {
    if (this.name === 'standard') { G.std.portrait(canvas, look); return; }
    const F = G.SKIN_FILES;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.scale(W / 200, H / 200); G.std.portraitBg(ctx, look); ctx.restore();
    const cands = {
      horns: look.horns !== 'none' ? [F.portraitHorns(look)] : null,
      base: [F.portraitBase(look)],
      expr: [F.portraitExprCoat(look), F.portraitExpr(look)],
    };
    for (const layer of G.std.PORTRAIT_LAYERS) {
      if (!cands[layer]) continue;
      const im = cands[layer].map((f) => this.img(f)).find(Boolean);
      if (im) ctx.drawImage(im, 0, 0, W, H);
      else { ctx.save(); ctx.scale(W / 200, H / 200); G.std.portraitLayer(ctx, look, layer); ctx.restore(); }
    }
  },
  personPortrait(canvas, kind) {
    const im = this.img(G.SKIN_FILES.personPortrait(kind));
    if (!im) { G.std.personPortrait(canvas, kind); return; }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  },
};

// 画面側からの呼び出し口（個体を渡す）
G.draw.portrait = (canvas, a) => G.skin.portrait(canvas, G.look(a));
