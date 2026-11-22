// 馬の描画
G.horseCoat = (a) => {
  const h = G.hash(a.id + a.idNo + 'h');
  const coats = [
    { base: '#a8693f', mane: '#4a2c1d', muzzle: '#e8b9a0' }, // 栗毛
    { base: '#6b4a3a', mane: '#2b1d17', muzzle: '#d9a892' }, // 鹿毛
    { base: '#3a2f2c', mane: '#1d1715', muzzle: '#b98e82' }, // 青毛
    { base: '#d9d5d0', mane: '#9a948e', muzzle: '#f2c6c6' }, // 芦毛
    { base: '#e3b77a', mane: '#fff3dc', muzzle: '#f4c9b0' }, // 月毛
  ];
  return Object.assign({ seed: h, blaze: h % 3 === 0 }, coats[h % coats.length]);
};

G.draw.horse = (ctx, a, x, y, st, t) => {
  const s = G.sizeOf(a);
  const c = G.horseCoat(a);
  const dir = st.facing < 0 ? -1 : 1;
  const walking = st.mode === 'walk';
  const graze = st.mode === 'graze';
  const bob = walking ? Math.sin(t * 11 + c.seed) * 1.5 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  ctx.fillStyle = 'rgba(60,80,40,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 2, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
  // 脚（細く長い）
  const legs = [-16, -8, 10, 18];
  legs.forEach((lx, i) => {
    const off = walking ? Math.sin(t * 11 + i * Math.PI / 2 + c.seed) * 4 : 0;
    ctx.fillStyle = c.base;
    G.roundRect(ctx, lx - 2.5 + off, -22, 5.5, 22, 2.5); ctx.fill();
    ctx.fillStyle = c.mane;
    ctx.fillRect(lx - 2.5 + off, -3, 5.5, 3);
  });
  // しっぽ
  ctx.strokeStyle = c.mane; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const tw = Math.sin(t * 3 + c.seed) * 5;
  ctx.beginPath(); ctx.moveTo(-24, -34 + bob); ctx.quadraticCurveTo(-36, -26 + tw, -32, -12); ctx.stroke();
  // 胴
  ctx.fillStyle = c.base; ctx.strokeStyle = 'rgba(60,40,30,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, -32 + bob + (a.pregnancy ? 2 : 0), 25, 12 + (a.pregnancy ? 2 : 0), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 首と頭
  const hx = graze ? 30 : 24, hy = graze ? -14 : -54 + bob;
  ctx.fillStyle = c.base;
  ctx.beginPath(); ctx.moveTo(14, -40 + bob); ctx.quadraticCurveTo(hx - 4, hy + 4, hx, hy); ctx.lineTo(hx + 8, hy + 6); ctx.quadraticCurveTo(24, -30 + bob, 20, -26 + bob); ctx.closePath(); ctx.fill();
  // たてがみ
  ctx.fillStyle = c.mane;
  ctx.beginPath(); ctx.moveTo(12, -42 + bob); ctx.quadraticCurveTo(hx - 8, hy - 2, hx - 2, hy - 8); ctx.lineTo(hx - 6, hy + 2); ctx.quadraticCurveTo(16, -36 + bob, 12, -36 + bob); ctx.closePath(); ctx.fill();
  // 顔（面長）
  ctx.fillStyle = c.base;
  ctx.save(); ctx.translate(hx + 4, hy + 4); ctx.rotate(graze ? 0.9 : 0.35);
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = c.muzzle; ctx.beginPath(); ctx.ellipse(0, 9, 6.5, 5, 0, 0, Math.PI * 2); ctx.fill();
  if (c.blaze) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -3, 2, 7, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // 耳
  ctx.fillStyle = c.base;
  ctx.beginPath(); ctx.ellipse(hx - 2, hy - 9, 2.5, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 4, hy - 10, 2.5, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  // 目
  if (!graze) {
    ctx.fillStyle = c.base === '#3a2f2c' ? '#fff' : '#2b2220';
    ctx.beginPath(); ctx.arc(hx + 4, hy, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,140,160,0.4)'; ctx.beginPath(); ctx.arc(hx + 7, hy + 5, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

G.draw.horsePortrait = (canvas, a) => {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const c = G.horseCoat(a);
  ctx.save();
  ctx.scale(W / 200, H / 200);
  const bg = ctx.createRadialGradient(100, 110, 20, 100, 110, 110);
  bg.addColorStop(0, '#fffaf0'); bg.addColorStop(1, '#e8f3ff');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 200, 200);
  ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(60,40,30,0.45)';
  // 首
  ctx.fillStyle = c.base;
  ctx.beginPath(); ctx.moveTo(60, 200); ctx.quadraticCurveTo(70, 120, 100, 110); ctx.quadraticCurveTo(140, 130, 150, 200); ctx.closePath(); ctx.fill(); ctx.stroke();
  // たてがみ
  ctx.fillStyle = c.mane;
  ctx.beginPath(); ctx.moveTo(70, 40); ctx.quadraticCurveTo(100, 20, 128, 40); ctx.quadraticCurveTo(110, 50, 100, 62); ctx.quadraticCurveTo(88, 50, 70, 40); ctx.fill();
  // 耳
  ctx.fillStyle = c.base;
  ctx.beginPath(); ctx.ellipse(72, 38, 9, 20, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(128, 38, 9, 20, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffc9d2';
  ctx.beginPath(); ctx.ellipse(73, 40, 4, 11, -0.35, 0, Math.PI * 2); ctx.ellipse(127, 40, 4, 11, 0.35, 0, Math.PI * 2); ctx.fill();
  // 顔（面長）
  ctx.fillStyle = c.base;
  ctx.beginPath(); ctx.ellipse(100, 100, 42, 62, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (c.blaze) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(100, 92, 8, 34, 0, 0, Math.PI * 2); ctx.fill(); }
  // 前髪
  ctx.fillStyle = c.mane;
  ctx.beginPath(); ctx.moveTo(84, 44); ctx.quadraticCurveTo(100, 36, 116, 44); ctx.quadraticCurveTo(104, 66, 98, 70); ctx.quadraticCurveTo(92, 60, 84, 44); ctx.fill();
  // 鼻
  ctx.fillStyle = c.muzzle;
  ctx.beginPath(); ctx.ellipse(100, 142, 30, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(110,60,60,0.55)';
  ctx.beginPath(); ctx.ellipse(88, 140, 4, 6, 0.2, 0, Math.PI * 2); ctx.ellipse(112, 140, 4, 6, -0.2, 0, Math.PI * 2); ctx.fill();
  // 口
  const p = a.personality;
  ctx.strokeStyle = 'rgba(110,60,60,0.7)'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (p === '活発') ctx.arc(100, 150, 8, 0.1, Math.PI - 0.1);
  else if (p === '頑固') { ctx.moveTo(92, 156); ctx.lineTo(108, 156); }
  else ctx.arc(100, 149, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();
  // 目
  const eyeC = c.base === '#3a2f2c' ? '#fff' : '#2b2220';
  ctx.fillStyle = eyeC; ctx.strokeStyle = eyeC; ctx.lineWidth = 3;
  [74, 126].forEach((x, i) => {
    const ey = 92;
    ctx.beginPath();
    if (p === 'おっとり') { ctx.arc(x, ey + 2, 7, Math.PI + 0.3, -0.3); ctx.stroke(); }
    else if (p === 'マイペース') { ctx.arc(x, ey, 4, 0, Math.PI * 2); ctx.fill(); }
    else {
      const r = p === '甘えん坊' || p === '好奇心旺盛' ? 8 : 6;
      ctx.arc(x, ey, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 2, ey - 3, r / 2.6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = eyeC;
    }
    if (p === '頑固') {
      ctx.beginPath();
      if (i === 0) { ctx.moveTo(x - 9, ey - 14); ctx.lineTo(x + 6, ey - 10); } else { ctx.moveTo(x + 9, ey - 14); ctx.lineTo(x - 6, ey - 10); }
      ctx.stroke();
    }
  });
  ctx.fillStyle = p === '甘えん坊' ? 'rgba(255,120,150,0.55)' : 'rgba(255,140,160,0.35)';
  ctx.beginPath(); ctx.ellipse(66, 116, 8, 5, 0, 0, Math.PI * 2); ctx.ellipse(134, 116, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
