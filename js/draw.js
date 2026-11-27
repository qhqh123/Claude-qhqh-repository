// 標準スキン：プログラムで描く絵（牛・人物・立ち絵）
// ゲームの処理からは直接呼ばない。js/skin.js の G.skin を通して使う。
// 受け取るのは「見た目情報」（js/look.js の G.look）だけ。
G.draw = G.draw || {};
G.std = G.std || {};

G.COATS = {
  cattle: [
    { base: '#3b3433', patch: null, muzzle: '#f2b8b8' },          // 黒
    { base: '#fffaf3', patch: '#3b3433', muzzle: '#f7c6c6' },     // 白黒
    { base: '#c98a55', patch: '#fff3e6', muzzle: '#f4c2b0' },     // 茶白
    { base: '#8a5a3c', patch: null, muzzle: '#f0b9a8' },          // 茶
    { base: '#fffaf3', patch: '#b5774d', muzzle: '#f7c6c6' },     // 白茶
  ],
  horse: [
    { base: '#a8693f', mane: '#4a2c1d', muzzle: '#e8b9a0' },      // 栗毛
    { base: '#6b4a3a', mane: '#2b1d17', muzzle: '#d9a892' },      // 鹿毛
    { base: '#3a2f2c', mane: '#1d1715', muzzle: '#b98e82' },      // 青毛
    { base: '#d9d5d0', mane: '#9a948e', muzzle: '#f2c6c6' },      // 芦毛
    { base: '#e3b77a', mane: '#fff3dc', muzzle: '#f4c9b0' },      // 月毛
  ],
};
G.STAGE_SIZE = { calf: 0.62, young: 0.8, adult: 1 };
G.sizeOf = (a) => G.STAGE_SIZE[G.stageOf(a)];

G.roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

G.std.coat = (look) => {
  const list = G.COATS[look.species] || G.COATS.cattle;
  const c = Object.assign({ seed: look.seed }, list[look.coat % list.length]);
  if (look.species === 'horse') c.blaze = look.seed % 3 === 0;
  return c;
};

// ---------- マップの牛（x,y は足元の中心） ----------
G.std.cowSprite = (ctx, look, x, y, st, t) => {
  const s = G.STAGE_SIZE[look.stage];
  const coat = G.std.coat(look);
  const dir = st.facing < 0 ? -1 : 1;
  const walking = st.mode === 'walk';
  const graze = st.mode === 'graze';
  const bob = walking ? Math.sin(t * 10 + coat.seed) * 1.5 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  ctx.fillStyle = 'rgba(60,80,40,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 2, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = coat.base === '#fffaf3' ? '#e9ddd0' : coat.base;
  const legs = [-17, -8, 9, 18];
  legs.forEach((lx, i) => {
    const off = walking ? Math.sin(t * 10 + i * Math.PI / 2 + coat.seed) * 3 : 0;
    G.roundRect(ctx, lx - 3 + off, -12, 7, 13, 3); ctx.fill();
  });
  ctx.fillStyle = '#5a4a42';
  legs.forEach((lx, i) => {
    const off = walking ? Math.sin(t * 10 + i * Math.PI / 2 + coat.seed) * 3 : 0;
    ctx.fillRect(lx - 3 + off, -2, 7, 3);
  });
  const belly = look.pregnant ? 3 : 0;
  ctx.fillStyle = coat.base;
  ctx.strokeStyle = 'rgba(80,60,50,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, -22 + bob, 27, 16 + belly, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (coat.patch) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, -22 + bob, 27, 16 + belly, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = coat.patch;
    const sd = coat.seed;
    for (let i = 0; i < 3; i++) {
      const px = ((sd >> (i * 5)) % 40) - 20, py = ((sd >> (i * 7 + 3)) % 16) - 30;
      ctx.beginPath(); ctx.ellipse(px, py + bob, 8 + (sd >> i) % 6, 6 + (sd >> (i + 2)) % 4, 0.3 * i, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  ctx.strokeStyle = coat.base === '#fffaf3' ? '#d8c8b8' : coat.base;
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  const tw = Math.sin(t * 3 + coat.seed) * 4;
  ctx.beginPath(); ctx.moveTo(-26, -26 + bob); ctx.quadraticCurveTo(-34, -20 + tw, -32, -10); ctx.stroke();
  const hx = 27, hy = graze ? -10 : -32 + bob;
  ctx.fillStyle = coat.base;
  ctx.strokeStyle = 'rgba(80,60,50,0.35)';
  ctx.beginPath(); ctx.ellipse(hx - 9, hy - 9, 7, 4, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(hx + 11, hy - 10, 7, 4, 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (look.horns !== 'none') {
    ctx.fillStyle = '#f3e3bf';
    const hr = look.horns === 'big' ? 5 : 3;
    ctx.beginPath(); ctx.ellipse(hx - 4, hy - 14, 2.5, hr, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx + 6, hy - 14, 2.5, hr, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = coat.base;
  ctx.beginPath(); ctx.ellipse(hx, hy, 14, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = coat.muzzle;
  ctx.beginPath(); ctx.ellipse(hx + 4, hy + 7, 10, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(120,60,60,0.5)';
  ctx.beginPath(); ctx.arc(hx + 1, hy + 7, 1.4, 0, Math.PI * 2); ctx.arc(hx + 8, hy + 7, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = coat.base === '#3b3433' ? '#fff' : '#2b2220';
  const blink = (Math.floor(t * 10 + coat.seed) % 40) === 0;
  if (blink || graze) {
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(hx - 6, hy - 2); ctx.lineTo(hx - 2, hy - 2); ctx.moveTo(hx + 5, hy - 2); ctx.lineTo(hx + 9, hy - 2); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(hx - 4, hy - 2, 2.2, 0, Math.PI * 2); ctx.arc(hx + 7, hy - 2, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,140,160,0.35)';
  ctx.beginPath(); ctx.arc(hx - 9, hy + 3, 3, 0, Math.PI * 2); ctx.arc(hx + 13, hy + 3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// ---------- 人物（プレイヤー・厩務員・先輩牧場主） ----------
G.std.PEOPLE = {
  player: { shirt: '#ffd166', pants: '#6c9bd2', hat: '#f2d28b', hair: '#6b4a3a' },
  boy: { shirt: '#5b8def', pants: '#3e5e9c', hat: null, hair: '#3a2a22' },
  girl: { shirt: '#ef6b6b', pants: '#b44b5c', hat: null, hair: '#8a4b2a' },
  senior: { shirt: '#9c7a5b', pants: '#6b5a4a', hat: '#c9a66b', hair: '#d6d2cc' },
};
G.std.personSprite = (ctx, kind, x, y, facing, walking, t) => {
  const pal = G.std.PEOPLE[kind] || G.std.PEOPLE.player;
  const bob = walking ? Math.abs(Math.sin(t * 12)) * 2 : 0;
  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(60,80,40,0.2)';
  ctx.beginPath(); ctx.ellipse(0, 1, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pal.pants;
  const lo = walking ? Math.sin(t * 12) * 3 : 0;
  G.roundRect(ctx, -6 + lo, -12, 5, 12, 2); ctx.fill();
  G.roundRect(ctx, 1 - lo, -12, 5, 12, 2); ctx.fill();
  ctx.fillStyle = pal.shirt;
  G.roundRect(ctx, -9, -28 - bob, 18, 18, 7); ctx.fill();
  ctx.fillStyle = '#ffe0c7';
  ctx.beginPath(); ctx.arc(0, -38 - bob, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pal.hair;
  ctx.beginPath(); ctx.arc(0, -41 - bob, 10, Math.PI, Math.PI * 2); ctx.fill();
  if (kind === 'girl') { ctx.beginPath(); ctx.ellipse(-9, -36 - bob, 4, 7, 0.3, 0, Math.PI * 2); ctx.fill(); }
  if (pal.hat) {
    ctx.fillStyle = pal.hat;
    ctx.beginPath(); ctx.ellipse(0, -45 - bob, 15, 4, 0, 0, Math.PI * 2); ctx.fill();
    G.roundRect(ctx, -7, -54 - bob, 14, 9, 4); ctx.fill();
    ctx.fillStyle = kind === 'senior' ? '#6b5a4a' : '#e76f51'; ctx.fillRect(-7, -48 - bob, 14, 2);
  }
  if (kind === 'boy') { ctx.fillStyle = pal.shirt; ctx.beginPath(); ctx.ellipse(1, -47 - bob, 11, 4, 0, Math.PI, Math.PI * 2); ctx.fill(); }
  if (kind === 'senior') { ctx.fillStyle = pal.hair; ctx.beginPath(); ctx.ellipse(3, -33 - bob, 5, 3, 0, 0, Math.PI); ctx.fill(); }
  ctx.fillStyle = '#2b2220';
  ctx.beginPath(); ctx.arc(4, -38 - bob, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,140,160,0.45)';
  ctx.beginPath(); ctx.arc(7, -34 - bob, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
G.std.personPortrait = (canvas, kind) => {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W / 2, H * 0.55, W * 0.1, W / 2, H * 0.55, W * 0.6);
  bg.addColorStop(0, '#fffaf2'); bg.addColorStop(1, '#ffe9d6');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // 胸から上を大きく描く
  ctx.save();
  ctx.translate(W / 2, H * 1.15);
  ctx.scale(W / 48, H / 48);
  G.std.personSprite(ctx, kind, 0, 0, 1, false, 0);
  ctx.restore();
};

// ---------- 立ち絵（重ね合わせ：角 → 顔と体 → 表情） ----------
// 座標は 200×200 の単位。背景は G.std.portraitBg。
G.std.PORTRAIT_LAYERS = ['horns', 'base', 'expr'];
G.std.portraitBg = (ctx, look) => {
  const bg = ctx.createRadialGradient(100, 110, 20, 100, 110, 110);
  if (look.species === 'horse') { bg.addColorStop(0, '#fffaf0'); bg.addColorStop(1, '#e8f3ff'); }
  else { bg.addColorStop(0, '#fff7fb'); bg.addColorStop(1, '#ffe3ef'); }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc((look.seed >> i) % 200, (look.seed >> (i + 3)) % 200, 4 + i % 3, 0, Math.PI * 2); ctx.fill(); }
};
G.std.portraitLayer = (ctx, look, layer) => {
  if (look.species === 'horse') { G.std.horsePortraitLayer(ctx, look, layer); return; }
  const coat = G.std.coat(look);
  const lineC = 'rgba(80,60,50,0.45)';
  ctx.lineWidth = 2.5; ctx.strokeStyle = lineC;
  if (layer === 'horns') {
    if (look.horns === 'none') return;
    ctx.fillStyle = '#f3e3bf';
    const big = look.horns === 'big';
    ctx.beginPath(); ctx.ellipse(70, 48, 7, big ? 16 : 10, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(130, 48, 7, big ? 16 : 10, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    return;
  }
  if (layer === 'base') {
    ctx.fillStyle = coat.base;
    ctx.beginPath(); ctx.ellipse(100, 205, 70, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(42, 78, 24, 12, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(158, 78, 24, 12, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffc9d2';
    ctx.beginPath(); ctx.ellipse(44, 79, 14, 6, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(156, 79, 14, 6, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = coat.base;
    ctx.beginPath(); ctx.ellipse(100, 100, 52, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (coat.patch) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(100, 100, 52, 50, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = coat.patch;
      ctx.beginPath(); ctx.ellipse(70 + (coat.seed % 20), 70, 22, 18, 0.5, 0, Math.PI * 2); ctx.fill();
      if (coat.seed % 2) { ctx.beginPath(); ctx.ellipse(140, 95, 16, 22, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.fillStyle = coat.patch && coat.seed % 3 === 0 ? coat.patch : coat.base;
    ctx.beginPath(); ctx.ellipse(100, 56, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = coat.muzzle;
    ctx.beginPath(); ctx.ellipse(100, 128, 36, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(120,60,60,0.55)';
    ctx.beginPath(); ctx.ellipse(86, 126, 4, 5, 0, 0, Math.PI * 2); ctx.ellipse(114, 126, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    return;
  }
  // 表情
  const p = look.expr;
  ctx.strokeStyle = 'rgba(120,60,60,0.7)'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (p === 'lively') ctx.arc(100, 136, 9, 0.1, Math.PI - 0.1);
  else if (p === 'stubborn') { ctx.moveTo(92, 142); ctx.lineTo(108, 142); }
  else ctx.arc(100, 134, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();
  const eyeC = coat.base === '#3b3433' ? '#fff' : '#2b2220';
  G.std.eyes(ctx, p, eyeC, [76, 124], 92, 8.5);
  ctx.fillStyle = p === 'sweet' ? 'rgba(255,120,150,0.55)' : 'rgba(255,140,160,0.35)';
  ctx.beginPath(); ctx.ellipse(62, 112, 9, 6, 0, 0, Math.PI * 2); ctx.ellipse(138, 112, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
};
// 性格ごとの目（牛・馬共通）
G.std.eyes = (ctx, p, eyeC, xs, ey, big) => {
  ctx.fillStyle = eyeC; ctx.strokeStyle = eyeC; ctx.lineWidth = 3;
  xs.forEach((x, i) => {
    ctx.beginPath();
    if (p === 'calm') { ctx.arc(x, ey + 2, 7, Math.PI + 0.3, -0.3); ctx.stroke(); }
    else if (p === 'easy') { ctx.arc(x, ey, 4, 0, Math.PI * 2); ctx.fill(); }
    else {
      const r = p === 'curious' ? big : p === 'sweet' ? 8 : 6;
      ctx.arc(x, ey, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 2.5, ey - 3, r / 2.6, 0, Math.PI * 2); ctx.fill();
      if (p === 'sweet') { ctx.beginPath(); ctx.arc(x - 3, ey + 3, 1.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = eyeC;
    }
    if (p === 'stubborn') {
      ctx.beginPath(); ctx.lineWidth = 3;
      if (i === 0) { ctx.moveTo(x - 9, ey - 14); ctx.lineTo(x + 6, ey - 10); } else { ctx.moveTo(x + 9, ey - 14); ctx.lineTo(x - 6, ey - 10); }
      ctx.stroke();
    }
  });
};
// 立ち絵をまとめて描く（背景つき）
G.std.portrait = (canvas, look) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width / 200, canvas.height / 200);
  G.std.portraitBg(ctx, look);
  for (const layer of G.std.PORTRAIT_LAYERS) G.std.portraitLayer(ctx, look, layer);
  ctx.restore();
};
