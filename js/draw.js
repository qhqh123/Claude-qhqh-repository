// 牛・人物・立ち絵の描画
G.draw = {};

G.coatOf = (a) => {
  const h = G.hash(a.id + a.idNo);
  const coats = [
    { base: '#3b3433', patch: null, muzzle: '#f2b8b8' },          // 黒
    { base: '#fffaf3', patch: '#3b3433', muzzle: '#f7c6c6' },     // 白黒
    { base: '#c98a55', patch: '#fff3e6', muzzle: '#f4c2b0' },     // 茶白
    { base: '#8a5a3c', patch: null, muzzle: '#f0b9a8' },          // 茶
    { base: '#fffaf3', patch: '#b5774d', muzzle: '#f7c6c6' },     // 白茶
  ];
  return Object.assign({ seed: h }, coats[h % coats.length]);
};

G.sizeOf = (a) => (a.age < 2 ? 0.62 : a.age < G.C.cattleMatureAge ? 0.8 : 1);

G.roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// 見下ろし用の牛（x,y は足元の中心）
G.draw.cow = (ctx, a, x, y, st, t) => {
  const s = G.sizeOf(a);
  const coat = G.coatOf(a);
  const dir = st.facing < 0 ? -1 : 1;
  const walking = st.mode === 'walk';
  const graze = st.mode === 'graze';
  const bob = walking ? Math.sin(t * 10 + coat.seed) * 1.5 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  // 影
  ctx.fillStyle = 'rgba(60,80,40,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 2, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  // 脚
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
  // 胴
  const belly = a.pregnancy ? 3 : 0;
  ctx.fillStyle = coat.base;
  ctx.strokeStyle = 'rgba(80,60,50,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, -22 + bob, 27, 16 + belly, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 模様
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
  // しっぽ
  ctx.strokeStyle = coat.base === '#fffaf3' ? '#d8c8b8' : coat.base;
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  const tw = Math.sin(t * 3 + coat.seed) * 4;
  ctx.beginPath(); ctx.moveTo(-26, -26 + bob); ctx.quadraticCurveTo(-34, -20 + tw, -32, -10); ctx.stroke();
  // 頭
  const hx = 27, hy = graze ? -10 : -32 + bob;
  ctx.fillStyle = coat.base;
  ctx.strokeStyle = 'rgba(80,60,50,0.35)';
  // 耳
  ctx.beginPath(); ctx.ellipse(hx - 9, hy - 9, 7, 4, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(hx + 11, hy - 10, 7, 4, 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 角（成熟した未去勢雄は少し大きい）
  if (a.age >= 2) {
    ctx.fillStyle = '#f3e3bf';
    const hr = (a.sex === 'M' && !a.castrated && a.age >= G.C.cattleMatureAge) ? 5 : 3;
    ctx.beginPath(); ctx.ellipse(hx - 4, hy - 14, 2.5, hr, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx + 6, hy - 14, 2.5, hr, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = coat.base;
  ctx.beginPath(); ctx.ellipse(hx, hy, 14, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 鼻
  ctx.fillStyle = coat.muzzle;
  ctx.beginPath(); ctx.ellipse(hx + 4, hy + 7, 10, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(120,60,60,0.5)';
  ctx.beginPath(); ctx.arc(hx + 1, hy + 7, 1.4, 0, Math.PI * 2); ctx.arc(hx + 8, hy + 7, 1.4, 0, Math.PI * 2); ctx.fill();
  // 目
  ctx.fillStyle = coat.base === '#3b3433' ? '#fff' : '#2b2220';
  const blink = (Math.floor(t * 10 + coat.seed) % 40) === 0;
  if (blink || graze) {
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(hx - 6, hy - 2); ctx.lineTo(hx - 2, hy - 2); ctx.moveTo(hx + 5, hy - 2); ctx.lineTo(hx + 9, hy - 2); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(hx - 4, hy - 2, 2.2, 0, Math.PI * 2); ctx.arc(hx + 7, hy - 2, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  // ほっぺ
  ctx.fillStyle = 'rgba(255,140,160,0.35)';
  ctx.beginPath(); ctx.arc(hx - 9, hy + 3, 3, 0, Math.PI * 2); ctx.arc(hx + 13, hy + 3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 人物（プレイヤー・厩務員）
G.draw.person = (ctx, x, y, kind, facing, walking, t) => {
  const pal = {
    player: { shirt: '#ffd166', pants: '#6c9bd2', hat: '#f2d28b', hair: '#6b4a3a' },
    boy: { shirt: '#5b8def', pants: '#3e5e9c', hat: null, hair: '#3a2a22' },
    girl: { shirt: '#ef6b6b', pants: '#b44b5c', hat: null, hair: '#8a4b2a' },
  }[kind];
  const bob = walking ? Math.abs(Math.sin(t * 12)) * 2 : 0;
  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(60,80,40,0.2)';
  ctx.beginPath(); ctx.ellipse(0, 1, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  // 脚
  ctx.fillStyle = pal.pants;
  const lo = walking ? Math.sin(t * 12) * 3 : 0;
  G.roundRect(ctx, -6 + lo, -12, 5, 12, 2); ctx.fill();
  G.roundRect(ctx, 1 - lo, -12, 5, 12, 2); ctx.fill();
  // 胴
  ctx.fillStyle = pal.shirt;
  G.roundRect(ctx, -9, -28 - bob, 18, 18, 7); ctx.fill();
  // 頭
  ctx.fillStyle = '#ffe0c7';
  ctx.beginPath(); ctx.arc(0, -38 - bob, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pal.hair;
  ctx.beginPath(); ctx.arc(0, -41 - bob, 10, Math.PI, Math.PI * 2); ctx.fill();
  if (kind === 'girl') { ctx.beginPath(); ctx.ellipse(-9, -36 - bob, 4, 7, 0.3, 0, Math.PI * 2); ctx.fill(); }
  if (pal.hat) {
    ctx.fillStyle = pal.hat;
    ctx.beginPath(); ctx.ellipse(0, -45 - bob, 15, 4, 0, 0, Math.PI * 2); ctx.fill();
    G.roundRect(ctx, -7, -54 - bob, 14, 9, 4); ctx.fill();
    ctx.fillStyle = '#e76f51'; ctx.fillRect(-7, -48 - bob, 14, 2);
  }
  if (kind === 'boy') { ctx.fillStyle = pal.shirt; ctx.beginPath(); ctx.ellipse(1, -47 - bob, 11, 4, 0, Math.PI, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#2b2220';
  ctx.beginPath(); ctx.arc(4, -38 - bob, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,140,160,0.45)';
  ctx.beginPath(); ctx.arc(7, -34 - bob, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// 立ち絵（性格で表情が少し違う）
G.draw.portrait = (canvas, a) => {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const coat = G.coatOf(a);
  const s = W / 200;
  ctx.save();
  ctx.scale(s, s);
  // 背景
  const bg = ctx.createRadialGradient(100, 110, 20, 100, 110, 110);
  bg.addColorStop(0, '#fff7fb'); bg.addColorStop(1, '#ffe3ef');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc((coat.seed >> i) % 200, (coat.seed >> (i + 3)) % 200, 4 + i % 3, 0, Math.PI * 2); ctx.fill(); }
  const lineC = 'rgba(80,60,50,0.45)';
  ctx.lineWidth = 2.5; ctx.strokeStyle = lineC;
  // 首・体
  ctx.fillStyle = coat.base;
  ctx.beginPath(); ctx.ellipse(100, 205, 70, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 耳
  ctx.beginPath(); ctx.ellipse(42, 78, 24, 12, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(158, 78, 24, 12, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffc9d2';
  ctx.beginPath(); ctx.ellipse(44, 79, 14, 6, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(156, 79, 14, 6, 0.4, 0, Math.PI * 2); ctx.fill();
  // 角
  if (a.age >= 2) {
    ctx.fillStyle = '#f3e3bf';
    const big = a.sex === 'M' && !a.castrated && a.age >= G.C.cattleMatureAge;
    ctx.beginPath(); ctx.ellipse(70, 48, 7, big ? 16 : 10, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(130, 48, 7, big ? 16 : 10, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // 顔
  ctx.fillStyle = coat.base;
  ctx.beginPath(); ctx.ellipse(100, 100, 52, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (coat.patch) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(100, 100, 52, 50, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = coat.patch;
    ctx.beginPath(); ctx.ellipse(70 + (coat.seed % 20), 70, 22, 18, 0.5, 0, Math.PI * 2); ctx.fill();
    if (coat.seed % 2) { ctx.beginPath(); ctx.ellipse(140, 95, 16, 22, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // 前髪
  ctx.fillStyle = coat.patch && coat.seed % 3 === 0 ? coat.patch : coat.base;
  ctx.beginPath(); ctx.ellipse(100, 56, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
  // 鼻
  ctx.fillStyle = coat.muzzle;
  ctx.beginPath(); ctx.ellipse(100, 128, 36, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(120,60,60,0.55)';
  ctx.beginPath(); ctx.ellipse(86, 126, 4, 5, 0, 0, Math.PI * 2); ctx.ellipse(114, 126, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  // 口
  ctx.strokeStyle = 'rgba(120,60,60,0.7)'; ctx.lineWidth = 2.5;
  const p = a.personality;
  ctx.beginPath();
  if (p === '活発') { ctx.arc(100, 136, 9, 0.1, Math.PI - 0.1); }
  else if (p === '頑固') { ctx.moveTo(92, 142); ctx.lineTo(108, 142); }
  else { ctx.arc(100, 134, 6, 0.3, Math.PI - 0.3); }
  ctx.stroke();
  // 目
  const eyeC = coat.base === '#3b3433' ? '#fff' : '#2b2220';
  ctx.fillStyle = eyeC; ctx.strokeStyle = eyeC; ctx.lineWidth = 3;
  const ex = [76, 124], ey = 92;
  ex.forEach((x, i) => {
    ctx.beginPath();
    if (p === 'おっとり') { ctx.arc(x, ey + 2, 7, Math.PI + 0.3, -0.3); ctx.stroke(); }
    else if (p === 'マイペース') { ctx.arc(x, ey, 4, 0, Math.PI * 2); ctx.fill(); }
    else if (p === '甘えん坊') {
      ctx.arc(x, ey, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 3, ey - 3, 3, 0, Math.PI * 2); ctx.arc(x - 3, ey + 3, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = eyeC;
    } else if (p === '好奇心旺盛') {
      ctx.arc(x, ey, 8.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 2, ey - 3, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = eyeC;
    } else {
      ctx.arc(x, ey, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 2, ey - 2, 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = eyeC;
    }
    if (p === '頑固') {
      ctx.beginPath(); ctx.lineWidth = 3;
      if (i === 0) { ctx.moveTo(x - 9, ey - 14); ctx.lineTo(x + 6, ey - 10); } else { ctx.moveTo(x + 9, ey - 14); ctx.lineTo(x - 6, ey - 10); }
      ctx.stroke();
    }
  });
  // ほっぺ
  ctx.fillStyle = p === '甘えん坊' ? 'rgba(255,120,150,0.55)' : 'rgba(255,140,160,0.35)';
  ctx.beginPath(); ctx.ellipse(62, 112, 9, 6, 0, 0, Math.PI * 2); ctx.ellipse(138, 112, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
  // 好奇心旺盛は小さな「？」ではなく首をかしげる
  ctx.restore();
  if (p === '好奇心旺盛') {
    const img = ctx.getImageData(0, 0, W, H);
    ctx.clearRect(0, 0, W, H);
    const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
    tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.12); ctx.drawImage(tmp, -W / 2, -H / 2); ctx.restore();
  }
};
