// 標準スキン：馬（マップと立ち絵）。見た目情報（G.look）だけで描く。
G.std.horseSprite = (ctx, look, x, y, st, t) => {
  const s = G.STAGE_SIZE[look.stage];
  const c = G.std.coat(look);
  const dir = st.facing < 0 ? -1 : 1;
  const walking = st.mode === 'walk';
  const graze = st.mode === 'graze';
  const bob = walking ? Math.sin(t * 11 + c.seed) * 1.5 : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  ctx.fillStyle = 'rgba(60,80,40,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 2, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
  const legs = [-16, -8, 10, 18];
  legs.forEach((lx, i) => {
    const off = walking ? Math.sin(t * 11 + i * Math.PI / 2 + c.seed) * 4 : 0;
    ctx.fillStyle = c.base;
    G.roundRect(ctx, lx - 2.5 + off, -22, 5.5, 22, 2.5); ctx.fill();
    ctx.fillStyle = c.mane;
    ctx.fillRect(lx - 2.5 + off, -3, 5.5, 3);
  });
  ctx.strokeStyle = c.mane; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const tw = Math.sin(t * 3 + c.seed) * 5;
  ctx.beginPath(); ctx.moveTo(-24, -34 + bob); ctx.quadraticCurveTo(-36, -26 + tw, -32, -12); ctx.stroke();
  ctx.fillStyle = c.base; ctx.strokeStyle = 'rgba(60,40,30,0.35)'; ctx.lineWidth = 1.5;
  const pg = look.pregnant ? 2 : 0;
  ctx.beginPath(); ctx.ellipse(0, -32 + bob + pg, 25, 12 + pg, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  const hx = graze ? 30 : 24, hy = graze ? -14 : -54 + bob;
  ctx.fillStyle = c.base;
  ctx.beginPath(); ctx.moveTo(14, -40 + bob); ctx.quadraticCurveTo(hx - 4, hy + 4, hx, hy); ctx.lineTo(hx + 8, hy + 6); ctx.quadraticCurveTo(24, -30 + bob, 20, -26 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c.mane;
  ctx.beginPath(); ctx.moveTo(12, -42 + bob); ctx.quadraticCurveTo(hx - 8, hy - 2, hx - 2, hy - 8); ctx.lineTo(hx - 6, hy + 2); ctx.quadraticCurveTo(16, -36 + bob, 12, -36 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c.base;
  ctx.save(); ctx.translate(hx + 4, hy + 4); ctx.rotate(graze ? 0.9 : 0.35);
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = c.muzzle; ctx.beginPath(); ctx.ellipse(0, 9, 6.5, 5, 0, 0, Math.PI * 2); ctx.fill();
  if (c.blaze) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -3, 2, 7, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = c.base;
  ctx.beginPath(); ctx.ellipse(hx - 2, hy - 9, 2.5, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 4, hy - 10, 2.5, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  if (!graze) {
    ctx.fillStyle = c.base === '#3a2f2c' ? '#fff' : '#2b2220';
    ctx.beginPath(); ctx.arc(hx + 4, hy, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,140,160,0.4)'; ctx.beginPath(); ctx.arc(hx + 7, hy + 5, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

G.std.horsePortraitLayer = (ctx, look, layer) => {
  const c = G.std.coat(look);
  ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(60,40,30,0.45)';
  if (layer === 'horns') return;
  if (layer === 'base') {
    ctx.fillStyle = c.base;
    ctx.beginPath(); ctx.moveTo(60, 200); ctx.quadraticCurveTo(70, 120, 100, 110); ctx.quadraticCurveTo(140, 130, 150, 200); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.mane;
    ctx.beginPath(); ctx.moveTo(70, 40); ctx.quadraticCurveTo(100, 20, 128, 40); ctx.quadraticCurveTo(110, 50, 100, 62); ctx.quadraticCurveTo(88, 50, 70, 40); ctx.fill();
    ctx.fillStyle = c.base;
    ctx.beginPath(); ctx.ellipse(72, 38, 9, 20, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(128, 38, 9, 20, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffc9d2';
    ctx.beginPath(); ctx.ellipse(73, 40, 4, 11, -0.35, 0, Math.PI * 2); ctx.ellipse(127, 40, 4, 11, 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.base;
    ctx.beginPath(); ctx.ellipse(100, 100, 42, 62, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (c.blaze) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(100, 92, 8, 34, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = c.mane;
    ctx.beginPath(); ctx.moveTo(84, 44); ctx.quadraticCurveTo(100, 36, 116, 44); ctx.quadraticCurveTo(104, 66, 98, 70); ctx.quadraticCurveTo(92, 60, 84, 44); ctx.fill();
    ctx.fillStyle = c.muzzle;
    ctx.beginPath(); ctx.ellipse(100, 142, 30, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(110,60,60,0.55)';
    ctx.beginPath(); ctx.ellipse(88, 140, 4, 6, 0.2, 0, Math.PI * 2); ctx.ellipse(112, 140, 4, 6, -0.2, 0, Math.PI * 2); ctx.fill();
    return;
  }
  const p = look.expr;
  ctx.strokeStyle = 'rgba(110,60,60,0.7)'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (p === 'lively') ctx.arc(100, 150, 8, 0.1, Math.PI - 0.1);
  else if (p === 'stubborn') { ctx.moveTo(92, 156); ctx.lineTo(108, 156); }
  else ctx.arc(100, 149, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();
  G.std.eyes(ctx, p, c.base === '#3a2f2c' ? '#fff' : '#2b2220', [74, 126], 92, 8);
  ctx.fillStyle = p === 'sweet' ? 'rgba(255,120,150,0.55)' : 'rgba(255,140,160,0.35)';
  ctx.beginPath(); ctx.ellipse(66, 116, 8, 5, 0, 0, Math.PI * 2); ctx.ellipse(134, 116, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
};
