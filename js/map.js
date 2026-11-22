// 見下ろし2Dマップ（No.17）
G.MAP = {
  W: 4100, H: 2700,
  office: { x: 300, y: 620, w: 240, h: 190 },
  town: { x: 30, y: 1330, w: 130, h: 130 },
  pond: { x: 400, y: 1180, rx: 120, ry: 70 },
  // species: 放牧地の動物種。開拓前は丘として描く
  pastures: {
    p1: { species: 'cattle', x: 760, y: 330, w: 620, h: 430, gate: 'bottom', barn: { x: 1170, y: 160, w: 180, h: 150 } },
    p2: { species: 'cattle', x: 1640, y: 330, w: 600, h: 430, gate: 'bottom', barn: { x: 2030, y: 160, w: 180, h: 150 } },
    p3: { species: 'cattle', x: 760, y: 1090, w: 620, h: 430, gate: 'top', barn: { x: 1410, y: 1360, w: 170, h: 150 } },
    p4: { species: 'cattle', x: 760, y: 1880, w: 620, h: 430, gate: 'top', barn: { x: 1410, y: 2150, w: 170, h: 150 } },
    p5: { species: 'cattle', x: 2520, y: 1880, w: 620, h: 430, gate: 'top', barn: { x: 3170, y: 2150, w: 170, h: 150 } },
    h1: { species: 'horse', x: 2520, y: 330, w: 620, h: 430, gate: 'bottom', barn: { x: 2930, y: 160, w: 180, h: 150 } },
    h2: { species: 'horse', x: 3400, y: 330, w: 600, h: 430, gate: 'bottom', barn: { x: 3790, y: 160, w: 180, h: 150 } },
  },
  // 荒れ地（1ブロック3区画）
  fieldBlocks: [
    { x: 1640, y: 1090, w: 600, h: 430 },
    { x: 2520, y: 1090, w: 620, h: 430 },
    { x: 3400, y: 1090, w: 600, h: 430 },
    { x: 1640, y: 1880, w: 600, h: 430 },
    { x: 3400, y: 1880, w: 600, h: 430 },
  ],
  milk: { x: 560, y: 1050, w: 180, h: 170 },
  signs: [
    { x: 600, y: 880 }, { x: 1500, y: 900 }, { x: 1500, y: 1700 }, { x: 260, y: 1250 }, { x: 1500, y: 250 },
    { x: 2380, y: 880 }, { x: 3260, y: 880 }, { x: 2380, y: 1700 }, { x: 3260, y: 1700 }, { x: 600, y: 1700 },
  ],
};
G.FIELD_SLOTS = G.MAP.fieldBlocks.length * 3;
G.MAP_LABEL = { p1: '第1放牧地', p2: '第2放牧地', p3: '第3放牧地', p4: '第4放牧地', p5: '第5放牧地', h1: '馬の放牧地1', h2: '馬の放牧地2' };
G.HILL_LABEL = { p2: '丘（北）', p3: '丘（西）', p4: '丘（南西）', p5: '丘（南）', h1: '丘（北東）', h2: '丘（東）' };
G.fieldRect = (i) => {
  const b = G.MAP.fieldBlocks[Math.floor(i / 3)], w = b.w / 3;
  return { x: b.x + (i % 3) * w, y: b.y, w, h: b.h };
};
G.pastureLabel = (pid) => (G.S.pastures[pid].open ? G.MAP_LABEL[pid] : G.HILL_LABEL[pid]);
G.pastureSpecies = (pid) => G.MAP.pastures[pid].species;

G.gateOf = (pid) => {
  const p = G.MAP.pastures[pid];
  const gx = p.x + p.w / 2;
  return p.gate === 'bottom' ? { x1: gx - 45, x2: gx + 45, y: p.y + p.h, out: { x: gx, y: p.y + p.h + 50 } } : { x1: gx - 45, x2: gx + 45, y: p.y, out: { x: gx, y: p.y - 40 } };
};

G.map = {
  canvas: null, ctx: null, mini: null, mctx: null,
  cam: { x: 0, y: 0 }, keys: {}, dash: false, t: 0, last: 0,
  st: {}, // 個体ごとの描画状態
  staff: { girl: { x: 0, y: 0, tx: 0, ty: 0, facing: 1, walk: false, wait: 0 }, boy: { x: 0, y: 0, tx: 0, ty: 0, facing: 1, walk: false, wait: 0 } },
  particles: [], fx: [], bubbles: [],
  deco: null, blocks: [], paused: false, joy: null, facing: 1, walking: false,

  init() {
    this.canvas = document.getElementById('map');
    this.ctx = this.canvas.getContext('2d');
    this.mini = document.getElementById('minimap');
    this.mctx = this.mini.getContext('2d');
    this.makeDeco();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'Shift') this.keys.shift = true;
      if ((e.key === 'e' || e.key === ' ' || e.key === 'Enter') && !G.ui.modalOpen()) { this.interact(); e.preventDefault(); }
      if (e.key.startsWith('Arrow') && !G.ui.modalOpen()) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; if (e.key === 'Shift') this.keys.shift = false; });
    window.addEventListener('blur', () => { this.keys = {}; });
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.onHover(e));
    this.mini.addEventListener('click', (e) => this.onMini(e));
    this.setupTouch();
    requestAnimationFrame((ts) => this.loop(ts));
  },

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.vw = window.innerWidth; this.vh = window.innerHeight;
    this.canvas.width = this.vw * dpr; this.canvas.height = this.vh * dpr;
    this.canvas.style.width = this.vw + 'px'; this.canvas.style.height = this.vh + 'px';
    const mw = this.vw < 600 ? 150 : 230;
    const mh = mw * G.MAP.H / G.MAP.W;
    this.mini.width = mw * dpr; this.mini.height = mh * dpr;
    this.mini.style.width = mw + 'px'; this.mini.style.height = mh + 'px';
  },

  makeDeco() {
    const M = G.MAP;
    let seed = 12345;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const inside = (x, y, pad) => {
      const r = [M.office, M.town, M.milk].concat(M.fieldBlocks).concat(Object.values(M.pastures)).concat(Object.values(M.pastures).map((p) => p.barn));
      if (r.some((b) => x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad)) return true;
      const dx = (x - M.pond.x) / (M.pond.rx + pad), dy = (y - M.pond.y) / (M.pond.ry + pad);
      if (dx * dx + dy * dy < 1) return true;
      return this.onPath(x, y, pad);
    };
    const trees = [];
    for (let i = 0; i < 1200 && trees.length < 150; i++) {
      const edge = rnd() < 0.6;
      let x, y;
      if (edge) {
        const side = Math.floor(rnd() * 4);
        x = side < 2 ? rnd() * M.W : (side === 2 ? rnd() * 90 : M.W - rnd() * 90);
        y = side >= 2 ? rnd() * M.H : (side === 0 ? rnd() * 100 : M.H - rnd() * 90);
      } else { x = rnd() * M.W; y = rnd() * M.H; }
      if (inside(x, y, 50)) continue;
      if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 60)) continue;
      trees.push({ x, y, r: 26 + rnd() * 14, kind: rnd() < 0.3 ? 1 : 0 });
    }
    const tufts = [];
    for (let i = 0; i < 2000; i++) tufts.push({ x: rnd() * M.W, y: rnd() * M.H, k: rnd() });
    const flowers = [];
    for (let i = 0; i < 600; i++) {
      const x = rnd() * M.W, y = rnd() * M.H;
      if (inside(x, y, 6)) continue;
      flowers.push({ x, y, c: Math.floor(rnd() * 4) });
    }
    const hillDeco = {};
    for (const pid of Object.keys(M.pastures)) {
      const p = M.pastures[pid];
      hillDeco[pid] = { rocks: [], weeds: [] };
      for (let i = 0; i < 8; i++) hillDeco[pid].rocks.push({ x: p.x + 40 + rnd() * (p.w - 80), y: p.y + 40 + rnd() * (p.h - 80), r: 8 + rnd() * 14 });
      for (let i = 0; i < 40; i++) hillDeco[pid].weeds.push({ x: p.x + 20 + rnd() * (p.w - 40), y: p.y + 20 + rnd() * (p.h - 40), c: Math.floor(rnd() * 4) });
    }
    const cracks = [];
    for (let i = 0; i < 26 * M.fieldBlocks.length; i++) {
      const f = M.fieldBlocks[i % M.fieldBlocks.length];
      const x = f.x + 30 + rnd() * (f.w - 60), y = f.y + 30 + rnd() * (f.h - 60);
      const pts = [[x, y]];
      for (let j = 0; j < 3; j++) pts.push([pts[j][0] + (rnd() - 0.5) * 50, pts[j][1] + (rnd() - 0.5) * 30]);
      cracks.push(pts);
    }
    const weeds = [];
    for (let i = 0; i < 50 * M.fieldBlocks.length; i++) { const f = M.fieldBlocks[i % M.fieldBlocks.length]; weeds.push({ x: f.x + 20 + rnd() * (f.w - 40), y: f.y + 20 + rnd() * (f.h - 40) }); }
    this.deco = { trees, tufts, flowers, hillDeco, cracks, weeds };
  },

  paths: [
    [[420, 810], [420, 900], [3700, 900]],
    [[1070, 900], [1070, 760]],
    [[1940, 900], [1940, 760]],
    [[2830, 900], [2830, 760]],
    [[3700, 900], [3700, 760]],
    [[1070, 900], [1070, 1090]],
    [[1500, 900], [1500, 250], [1260, 250]],
    [[420, 900], [420, 1000], [250, 1000], [250, 1400], [160, 1400]],
    [[250, 1290], [650, 1290], [650, 1220]],
    [[1500, 900], [1500, 1700]],
    [[250, 1400], [250, 1700], [3700, 1700]],
    [[1070, 1700], [1070, 1880]],
    [[2830, 1700], [2830, 1880]],
    [[2380, 900], [2380, 1700]],
    [[3260, 900], [3260, 1700]],
  ],
  onPath(x, y, pad) {
    for (const p of this.paths) {
      for (let i = 0; i < p.length - 1; i++) {
        const [x1, y1] = p[i], [x2, y2] = p[i + 1];
        const minx = Math.min(x1, x2) - 30 - pad, maxx = Math.max(x1, x2) + 30 + pad;
        const miny = Math.min(y1, y2) - 30 - pad, maxy = Math.max(y1, y2) + 30 + pad;
        if (x > minx && x < maxx && y > miny && y < maxy) return true;
      }
    }
    return false;
  },

  // 当たり判定用の矩形
  buildBlocks() {
    const M = G.MAP, B = [];
    const o = M.office;
    B.push({ x: o.x, y: o.y + 40, w: o.w, h: o.h - 40 });
    B.push({ x: M.milk.x, y: M.milk.y + 50, w: M.milk.w, h: M.milk.h - 50 });
    B.push({ x: M.town.x, y: M.town.y + 60, w: 22, h: 70 }, { x: M.town.x + M.town.w - 22, y: M.town.y + 60, w: 22, h: 70 });
    for (const pid of Object.keys(M.pastures)) {
      const p = M.pastures[pid];
      if (!G.S.pastures[pid].open) continue;
      const g = G.gateOf(pid);
      const th = 8;
      B.push({ x: p.barn.x, y: p.barn.y + 40, w: p.barn.w, h: p.barn.h - 40 });
      const top = { x: p.x, y: p.y - th / 2, w: p.w, h: th }, bot = { x: p.x, y: p.y + p.h - th / 2, w: p.w, h: th };
      const gateSide = p.gate === 'bottom' ? bot : top;
      const other = p.gate === 'bottom' ? top : bot;
      B.push(other);
      B.push({ x: gateSide.x, y: gateSide.y, w: g.x1 - p.x, h: th }, { x: g.x2, y: gateSide.y, w: p.x + p.w - g.x2, h: th });
      B.push({ x: p.x - th / 2, y: p.y, w: th, h: p.h }, { x: p.x + p.w - th / 2, y: p.y, w: th, h: p.h });
    }
    this.blocks = B;
  },
  blocked(x, y, r) {
    const M = G.MAP;
    if (x < r || y < r || x > M.W - r || y > M.H - r) return true;
    for (const b of this.blocks) if (x + r > b.x && x - r < b.x + b.w && y + r * 0.5 > b.y && y - r * 0.5 < b.y + b.h) return true;
    const dx = (x - M.pond.x) / (M.pond.rx + r * 0.5), dy = (y - M.pond.y) / (M.pond.ry + r * 0.5);
    return dx * dx + dy * dy < 1;
  },
  freeSpot(x, y) {
    for (let r = 0; r < 400; r += 12) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        if (!this.blocked(px, py, 14)) return { x: px, y: py };
        if (r === 0) break;
      }
    }
    return { x: 560, y: 980 };
  },

  // ---------- 家畜の動き ----------
  bounds(pid) {
    const p = G.MAP.pastures[pid];
    return { x1: p.x + 40, y1: p.y + 50, x2: p.x + p.w - 40, y2: p.y + p.h - 20 };
  },
  stOf(a) {
    let s = this.st[a.id];
    const b = this.bounds(a.pasture);
    if (!s || s.pasture !== a.pasture) {
      s = { x: b.x1 + Math.random() * (b.x2 - b.x1), y: b.y1 + Math.random() * (b.y2 - b.y1), tx: 0, ty: 0, mode: 'idle', timer: Math.random() * 3, facing: Math.random() < 0.5 ? -1 : 1, pasture: a.pasture, bubble: null, bubbleT: 0, nextBubble: 4 + Math.random() * 12 };
      this.st[a.id] = s;
    }
    s.x = G.clamp(s.x, b.x1, b.x2); s.y = G.clamp(s.y, b.y1, b.y2);
    return s;
  },
  updateAnimals(dt) {
    for (const a of G.alive()) {
      const s = this.stOf(a);
      const b = this.bounds(a.pasture);
      s.timer -= dt;
      if (s.mode === 'walk') {
        const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
        const sp = (a.age < 2 ? 46 : 34) * (a.personality === '活発' ? 1.3 : a.personality === 'おっとり' ? 0.8 : 1);
        if (d < 3 || s.timer < 0) { s.mode = Math.random() < 0.5 ? 'graze' : 'idle'; s.timer = 2 + Math.random() * 4; }
        else { s.x += dx / d * sp * dt; s.y += dy / d * sp * dt; if (Math.abs(dx) > 2) s.facing = dx > 0 ? 1 : -1; }
      } else if (s.timer < 0) {
        s.mode = 'walk';
        // 好きな相手の近くへ寄ることがある
        let tx = b.x1 + Math.random() * (b.x2 - b.x1), ty = b.y1 + Math.random() * (b.y2 - b.y1);
        const liked = G.alive().filter((o) => o.pasture === a.pasture && G.likesAnimal(a, o));
        if (liked.length && Math.random() < 0.35) { const o = this.stOf(G.pick(liked)); tx = o.x + (Math.random() - 0.5) * 80; ty = o.y + (Math.random() - 0.5) * 50; }
        s.tx = G.clamp(tx, b.x1, b.x2); s.ty = G.clamp(ty, b.y1, b.y2);
        s.timer = 8;
      }
      s.x = G.clamp(s.x, b.x1, b.x2); s.y = G.clamp(s.y, b.y1, b.y2);
      // 絵文字の吹き出し
      s.nextBubble -= dt;
      if (s.bubble) { s.bubbleT -= dt; if (s.bubbleT < 0) s.bubble = null; }
      if (s.nextBubble < 0) {
        s.nextBubble = 8 + Math.random() * 14;
        let e = '♪';
        if (a.stress > 55 || (G.traitRank(a, 'temper') && !a.castrated && a.sex === 'M' && Math.random() < 0.3)) e = '💢';
        else if (s.mode === 'idle' && (a.personality === 'おっとり' || a.personality === 'マイペース' || Math.random() < 0.25)) e = '💤';
        else if (a.happiness > 60 || Math.random() < 0.3) e = Math.random() < 0.5 ? '❤' : '♪';
        s.bubble = e; s.bubbleT = 2.5;
      }
    }
  },
  updateStaff(dt) {
    for (const k of ['girl', 'boy']) {
      const s = this.staff[k];
      const pid = G.S.staff[k].pasture;
      const g = G.gateOf(pid);
      const home = { x: g.out.x + (k === 'girl' ? -90 : 90), y: g.out.y + (G.MAP.pastures[pid].gate === 'bottom' ? 10 : -10) };
      if (!s.init || s.pid !== pid) { const f = this.freeSpot(home.x, home.y); s.x = f.x; s.y = f.y; s.tx = s.x; s.ty = s.y; s.init = true; s.pid = pid; }
      s.wait -= dt;
      const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
      if (d > 3) {
        const nx = s.x + dx / d * 50 * dt, ny = s.y + dy / d * 50 * dt;
        if (!this.blocked(nx, ny, 12)) { s.x = nx; s.y = ny; s.walk = true; s.facing = dx > 0 ? 1 : -1; } else { s.tx = s.x; s.ty = s.y; }
      } else {
        s.walk = false;
        if (s.wait < 0) { s.tx = home.x + (Math.random() - 0.5) * 140; s.ty = home.y + (Math.random() - 0.5) * 60; s.wait = 3 + Math.random() * 5; }
      }
      if (s.say) { s.sayT -= dt; if (s.sayT < 0) s.say = null; }
    }
  },

  // ---------- プレイヤー ----------
  updatePlayer(dt) {
    const P = G.S.player;
    let dx = 0, dy = 0;
    if (!G.ui.modalOpen()) {
      const k = this.keys;
      if (k.arrowleft || k.a) dx -= 1;
      if (k.arrowright || k.d) dx += 1;
      if (k.arrowup || k.w) dy -= 1;
      if (k.arrowdown || k.s) dy += 1;
      if (this.joy && this.joy.active) { dx = this.joy.dx; dy = this.joy.dy; }
    }
    const len = Math.hypot(dx, dy);
    this.walking = len > 0.1;
    if (this.walking) {
      const dash = this.keys.shift || this.dash;
      const sp = (dash ? 400 : 230) * dt * Math.min(1, len) / len;
      const nx = P.x + dx * sp, ny = P.y + dy * sp;
      if (!this.blocked(nx, P.y, 14)) P.x = nx;
      if (!this.blocked(P.x, ny, 14)) P.y = ny;
      if (Math.abs(dx) > 0.2) this.facing = dx > 0 ? 1 : -1;
    }
    // カメラ
    const tx = P.x - this.vw / 2, ty = P.y - this.vh / 2 + 20;
    const k = Math.min(1, dt * 6);
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * k;
    this.cam.x = G.clamp(this.cam.x, 0, Math.max(0, G.MAP.W - this.vw));
    this.cam.y = G.clamp(this.cam.y, 0, Math.max(0, G.MAP.H - this.vh));
    // 近くの家畜の名前と操作ボタン
    const near = this.nearest(110);
    G.ui.setNear(near);
  },
  snapCamera() {
    const P = G.S.player;
    this.cam.x = G.clamp(P.x - this.vw / 2, 0, Math.max(0, G.MAP.W - this.vw));
    this.cam.y = G.clamp(P.y - this.vh / 2, 0, Math.max(0, G.MAP.H - this.vh));
  },
  warp(x, y) {
    const f = this.freeSpot(x, y);
    G.S.player.x = f.x; G.S.player.y = f.y;
    this.snapCamera();
    this.burst(f.x, f.y - 20, ['✨', '✨', '⭐'], 6);
  },

  // ---------- 操作 ----------
  targets() {
    const M = G.MAP, list = [];
    const P = G.S.player;
    list.push({ kind: 'office', x: M.office.x + M.office.w / 2, y: M.office.y + M.office.h, rect: M.office });
    list.push({ kind: 'town', x: M.town.x + M.town.w / 2, y: M.town.y + M.town.h, rect: M.town });
    for (const pid of Object.keys(M.pastures)) {
      const p = M.pastures[pid];
      if (G.S.pastures[pid].open) list.push({ kind: 'barn', pid, x: p.barn.x + p.barn.w / 2, y: p.barn.y + p.barn.h, rect: p.barn });
      else list.push({ kind: 'hill', pid, x: p.x + p.w / 2, y: p.y + p.h / 2, rect: p });
    }
    G.S.fields.forEach((f, i) => { const r = G.fieldRect(i); list.push({ kind: 'field', i, x: r.x + r.w / 2, y: r.y + r.h / 2, rect: r }); });
    list.push({ kind: 'milk', x: M.milk.x + M.milk.w / 2, y: M.milk.y + M.milk.h, rect: M.milk });
    M.signs.forEach((s, i) => list.push({ kind: 'sign', i, x: s.x, y: s.y, rect: { x: s.x - 22, y: s.y - 56, w: 44, h: 60 } }));
    for (const k of ['girl', 'boy']) { const s = this.staff[k]; list.push({ kind: 'staff', who: k, x: s.x, y: s.y, rect: { x: s.x - 14, y: s.y - 56, w: 28, h: 60 } }); }
    for (const a of G.alive()) { const s = this.stOf(a); const sz = G.sizeOf(a); list.push({ kind: 'animal', a, x: s.x, y: s.y, rect: { x: s.x - 40 * sz, y: s.y - 52 * sz, w: 80 * sz, h: 58 * sz } }); }
    list.forEach((t) => { t.d = Math.hypot(t.x - P.x, t.y - P.y); });
    return list;
  },
  nearest(range) {
    const list = this.targets().filter((t) => t.kind === 'animal' || t.kind === 'staff');
    let best = null;
    for (const t of list) if (t.d < range && (!best || t.d < best.d)) best = t;
    return best;
  },
  interact() {
    const t = this.targets();
    const near = t.filter((x) => x.kind === 'animal' || x.kind === 'staff').filter((x) => x.d < 110).sort((a, b) => a.d - b.d)[0];
    if (near) return this.activate(near);
    const bld = t.filter((x) => x.kind !== 'animal' && x.kind !== 'staff' && x.d < 140).sort((a, b) => a.d - b.d)[0];
    if (bld) this.activate(bld);
  },
  activate(t) {
    G.audio.sfx('click');
    switch (t.kind) {
      case 'animal': G.ui.animalMenu(t.a, t.d < 120); break;
      case 'office': G.ui.openOffice(); break;
      case 'town': G.ui.openTown(); break;
      case 'barn': G.ui.openOffice('list', t.pid); break;
      case 'hill': G.ui.openExpand(t.pid); break;
      case 'field': G.ui.openField(t.i); break;
      case 'milk': G.ui.openMilk(); break;
      case 'sign': G.ui.openWarp(); break;
      case 'staff': this.staffTalk(t.who); break;
      default: break;
    }
  },
  staffTalk(who) {
    const s = this.staff[who];
    const id = G.text.pick(`daily.staff_${who}_`, {});
    if (!id) return;
    const e = G.text.get(id);
    s.say = G.text.fill(e.text, { staff: G.S.staff[who].name });
    s.sayId = id;
    s.sayT = 4;
    G.S.readTexts[id] = true;
  },
  screenToWorld(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left + this.cam.x, y: e.clientY - r.top + this.cam.y };
  },
  hit(w) {
    const list = this.targets();
    // 手前（y が大きい）ものを優先
    const order = ['animal', 'staff', 'sign', 'office', 'milk', 'barn', 'town', 'hill', 'field'];
    const hits = list.filter((t) => w.x >= t.rect.x && w.x <= t.rect.x + t.rect.w && w.y >= t.rect.y && w.y <= t.rect.y + t.rect.h);
    hits.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || b.y - a.y);
    return hits[0];
  },
  onClick(e) {
    if (G.ui.modalOpen()) return;
    const w = this.screenToWorld(e);
    const t = this.hit(w);
    if (t) this.activate(t);
  },
  onHover(e) {
    const w = this.screenToWorld(e);
    const t = this.hit(w);
    this.canvas.style.cursor = t ? 'pointer' : 'default';
  },
  onMini(e) {
    const r = this.mini.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * G.MAP.W, y = (e.clientY - r.top) / r.height * G.MAP.H;
    G.audio.sfx('click');
    this.warp(x, y);
  },
  setupTouch() {
    const pad = document.getElementById('joy');
    const knob = document.getElementById('joy-knob');
    if (!pad) return;
    const J = this.joy = { active: false, dx: 0, dy: 0, id: null };
    const center = () => { const r = pad.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, rad: r.width / 2 }; };
    const move = (t) => {
      const c = center();
      let dx = t.clientX - c.x, dy = t.clientY - c.y;
      const d = Math.hypot(dx, dy), m = c.rad * 0.8;
      if (d > m) { dx = dx / d * m; dy = dy / d * m; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      J.dx = dx / m; J.dy = dy / m;
    };
    pad.addEventListener('touchstart', (e) => { const t = e.changedTouches[0]; J.id = t.identifier; J.active = true; move(t); e.preventDefault(); }, { passive: false });
    pad.addEventListener('touchmove', (e) => { for (const t of e.changedTouches) if (t.identifier === J.id) move(t); e.preventDefault(); }, { passive: false });
    const end = (e) => { for (const t of e.changedTouches) if (t.identifier === J.id) { J.active = false; J.dx = J.dy = 0; knob.style.transform = ''; } };
    pad.addEventListener('touchend', end); pad.addEventListener('touchcancel', end);
  },

  // ---------- エフェクト ----------
  burst(x, y, chars, n) {
    for (let i = 0; i < n; i++) this.fx.push({ x, y, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 90, life: 1.2, c: G.pick(chars), s: 14 + Math.random() * 10 });
  },
  updateFx(dt) {
    for (const f of this.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 60 * dt; f.life -= dt; }
    this.fx = this.fx.filter((f) => f.life > 0);
    // 季節の粒子
    const season = (G.S.turn - 1) % 4;
    const want = [40, 18, 40, 70][season];
    while (this.particles.length < want) this.particles.push(this.newParticle(season, true));
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.ph += dt;
      if (p.y > this.vh + 20 || p.x < -20 || p.x > this.vw + 20 || p.season !== season) Object.assign(p, this.newParticle(season, false));
    }
    if (this.particles.length > want) this.particles.length = want;
  },
  newParticle(season, anywhere) {
    const p = { season, x: Math.random() * this.vw, y: anywhere ? Math.random() * this.vh : -10, ph: Math.random() * 6 };
    if (season === 0) Object.assign(p, { vx: 15 + Math.random() * 20, vy: 25 + Math.random() * 20, c: '#ffc4d6', r: 4 });
    if (season === 1) Object.assign(p, { vx: (Math.random() - 0.5) * 10, vy: 6 + Math.random() * 6, c: 'rgba(255,250,180,0.9)', r: 2.5 });
    if (season === 2) Object.assign(p, { vx: 20 + Math.random() * 25, vy: 30 + Math.random() * 20, c: G.pick(['#f4a259', '#e76f51', '#e9c46a']), r: 5 });
    if (season === 3) Object.assign(p, { vx: (Math.random() - 0.5) * 15, vy: 30 + Math.random() * 25, c: '#ffffff', r: 2 + Math.random() * 2.5 });
    return p;
  },

  // ---------- 描画 ----------
  palette() {
    return [
      { ground: '#b9e8a4', ground2: '#a6dd8f', past: '#c8f0b0', path: '#ead9b0', tree: '#7cc47a', tree2: '#ffc0d9', hill: '#bfe3a0', sky: '#fff' },
      { ground: '#9fdc86', ground2: '#8fd27a', past: '#b4ec98', path: '#e8d6a6', tree: '#4fae5c', tree2: '#5fbf6a', hill: '#a6d98a' },
      { ground: '#d7d58c', ground2: '#cbc97c', past: '#e3e1a0', path: '#e2c99a', tree: '#e9a24f', tree2: '#e0764e', hill: '#d8cf8e' },
      { ground: '#eef5f7', ground2: '#e2edf1', past: '#f6fbfc', path: '#dcd3c8', tree: '#9cc3b2', tree2: '#ffffff', hill: '#e8f1f2' },
    ][(G.S.turn - 1) % 4];
  },
  render() {
    const ctx = this.ctx, M = G.MAP, pal = this.palette(), t = this.t;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, 0, this.vw, this.vh);
    ctx.save();
    ctx.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));
    const vis = (x, y, m) => x > this.cam.x - m && x < this.cam.x + this.vw + m && y > this.cam.y - m && y < this.cam.y + this.vh + m;
    // 草
    ctx.fillStyle = pal.ground2;
    for (const tf of this.deco.tufts) if (vis(tf.x, tf.y, 10)) { ctx.beginPath(); ctx.ellipse(tf.x, tf.y, 6 + tf.k * 6, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    // 道
    ctx.strokeStyle = pal.path; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const p of this.paths) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 30;
    for (const p of this.paths) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    // 池
    const season = (G.S.turn - 1) % 4;
    ctx.fillStyle = season === 3 ? '#d6eef7' : '#8fd3f4';
    ctx.beginPath(); ctx.ellipse(M.pond.x, M.pond.y, M.pond.rx, M.pond.ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(M.pond.x - 20, M.pond.y - 15, 40, 12, 0, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
    // 花
    const fc = ['#ff9ec4', '#fff27a', '#ffffff', '#b9a6ff'];
    if (season !== 3) for (const f of this.deco.flowers) if (vis(f.x, f.y, 10)) { ctx.fillStyle = fc[f.c]; ctx.beginPath(); ctx.arc(f.x, f.y, 3, 0, Math.PI * 2); ctx.fill(); }
    // 放牧地・丘
    for (const pid of Object.keys(M.pastures)) this.drawPasture(pid, pal, t);
    this.drawField(pal);
    // 奥から順に描く
    const items = [];
    items.push({ y: M.office.y + M.office.h, f: () => this.drawOffice() });
    items.push({ y: M.town.y + M.town.h, f: () => this.drawTown() });
    items.push({ y: M.milk.y + M.milk.h, f: () => this.drawMilk() });
    for (const pid of Object.keys(M.pastures)) if (G.S.pastures[pid].open) { const b = M.pastures[pid].barn; const sp = M.pastures[pid].species; items.push({ y: b.y + b.h, f: () => this.drawBarn(b, sp) }); }
    M.signs.forEach((s) => items.push({ y: s.y, f: () => this.drawSign(s.x, s.y) }));
    for (const tr of this.deco.trees) if (vis(tr.x, tr.y, 60)) items.push({ y: tr.y, f: () => this.drawTree(tr, pal) });
    for (const a of G.alive()) {
      const s = this.stOf(a);
      if (!vis(s.x, s.y, 80)) continue;
      items.push({ y: s.y, f: () => { (a.species === 'horse' ? G.draw.horse : G.draw.cow)(ctx, a, s.x, s.y, s, t); this.drawAnimalExtras(a, s); } });
    }
    for (const k of ['girl', 'boy']) { const s = this.staff[k]; items.push({ y: s.y, f: () => { G.draw.person(ctx, s.x, s.y, k, s.facing, s.walk, t); this.drawSay(s); } }); }
    const P = G.S.player;
    items.push({ y: P.y, f: () => G.draw.person(ctx, P.x, P.y, 'player', this.facing, this.walking, t) });
    items.sort((a, b) => a.y - b.y).forEach((i) => i.f());
    // エフェクト
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of this.fx) { ctx.globalAlpha = Math.min(1, f.life); ctx.font = `${f.s}px sans-serif`; ctx.fillText(f.c, f.x, f.y); }
    ctx.globalAlpha = 1;
    ctx.restore();
    // 季節の粒子（画面座標）
    for (const p of this.particles) {
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.season === 1 ? 0.5 + Math.sin(p.ph * 3) * 0.4 : 0.9;
      ctx.beginPath();
      if (p.season === 0 || p.season === 2) ctx.ellipse(p.x + Math.sin(p.ph * 2) * 8, p.y, p.r, p.r * 0.6, p.ph, 0, Math.PI * 2);
      else ctx.arc(p.x + Math.sin(p.ph) * 6, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.renderMini();
  },
  drawPasture(pid, pal, t) {
    const ctx = this.ctx, p = G.MAP.pastures[pid], open = G.S.pastures[pid].open;
    if (!open) {
      // 放牧地候補の丘
      ctx.fillStyle = pal.hill;
      ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 1.85, p.h / 1.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2 - 10, p.w / 2.3, p.h / 2.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.ellipse(p.x + p.w / 2 - 60, p.y + p.h / 2 - 40, p.w / 3.5, p.h / 5, -0.2, 0, Math.PI * 2); ctx.fill();
      const d = this.deco.hillDeco[pid];
      for (const r of d.rocks) {
        ctx.fillStyle = '#b8b2a7'; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d6d0c6'; ctx.beginPath(); ctx.ellipse(r.x - r.r * 0.3, r.y - r.r * 0.25, r.r * 0.45, r.r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      }
      const wc = ['#7fb069', '#a1c181', '#ffd6e0', '#fff1a8'];
      for (const w of d.weeds) { ctx.fillStyle = wc[w.c]; ctx.beginPath(); ctx.arc(w.x, w.y, w.c > 1 ? 3 : 5, 0, Math.PI * 2); ctx.fill(); }
      // 境界杭
      ctx.fillStyle = '#a0764f';
      const stakes = [[p.x, p.y], [p.x + p.w, p.y], [p.x, p.y + p.h], [p.x + p.w, p.y + p.h], [p.x + p.w / 2, p.y], [p.x + p.w / 2, p.y + p.h], [p.x, p.y + p.h / 2], [p.x + p.w, p.y + p.h / 2]];
      for (const [x, y] of stakes) { G.roundRect(ctx, x - 4, y - 20, 8, 22, 2); ctx.fill(); ctx.fillStyle = '#ff8fab'; ctx.fillRect(x - 4, y - 20, 8, 5); ctx.fillStyle = '#a0764f'; }
      return;
    }
    ctx.fillStyle = pal.past;
    G.roundRect(ctx, p.x, p.y, p.w, p.h, 18); ctx.fill();
    // 水飲み場
    const wx = p.x + 50, wy = p.y + 60;
    ctx.fillStyle = '#9c7a5b'; G.roundRect(ctx, wx - 6, wy - 6, 92, 34, 10); ctx.fill();
    ctx.fillStyle = (G.S.turn - 1) % 4 === 3 ? '#dff3fa' : '#7ccbf0'; G.roundRect(ctx, wx, wy, 80, 22, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(wx + 10, wy + 5, 30, 3);
    // 干し草
    ctx.fillStyle = '#f2d27a';
    ctx.beginPath(); ctx.ellipse(p.x + p.w - 80, p.y + 70, 30, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9b14f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x + p.w - 100, p.y + 64); ctx.lineTo(p.x + p.w - 60, p.y + 66); ctx.moveTo(p.x + p.w - 98, p.y + 76); ctx.lineTo(p.x + p.w - 62, p.y + 78); ctx.stroke();
    // 柵
    const g = G.gateOf(pid);
    ctx.strokeStyle = '#b98b5e'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const rail = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1 - 14); ctx.lineTo(x2, y2 - 14); ctx.moveTo(x1, y1 - 4); ctx.lineTo(x2, y2 - 4); ctx.stroke(); };
    const gy = p.gate === 'bottom' ? p.y + p.h : p.y;
    const oy = p.gate === 'bottom' ? p.y : p.y + p.h;
    rail(p.x, oy, p.x + p.w, oy);
    rail(p.x, gy, g.x1, gy); rail(g.x2, gy, p.x + p.w, gy);
    rail(p.x, p.y, p.x, p.y + p.h); rail(p.x + p.w, p.y, p.x + p.w, p.y + p.h);
    ctx.fillStyle = '#8e6440';
    const post = (x, y) => { G.roundRect(ctx, x - 4, y - 22, 8, 24, 3); ctx.fill(); };
    for (let x = p.x; x <= p.x + p.w; x += 62) { post(x, oy); if (x < g.x1 - 10 || x > g.x2 + 10) post(x, gy); }
    for (let y = p.y; y <= p.y + p.h; y += 54) { post(p.x, y); post(p.x + p.w, y); }
    post(g.x1, gy); post(g.x2, gy);
    // ゲート
    ctx.fillStyle = '#ffb4c8'; G.roundRect(ctx, g.x1 - 6, gy - 34, 12, 12, 6); ctx.fill(); G.roundRect(ctx, g.x2 - 6, gy - 34, 12, 12, 6); ctx.fill();
  },
  drawField(pal) {
    const ctx = this.ctx;
    const season = (G.S.turn - 1) % 4;
    G.S.fields.forEach((fd, i) => {
      const f = G.fieldRect(i);
      const inSlot = (x, y) => x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h;
      if (!fd.open) {
        // 畑候補の荒れ地
        ctx.fillStyle = season === 3 ? '#e6e2dc' : '#d9c39a';
        G.roundRect(ctx, f.x + 6, f.y, f.w - 12, f.h, 26); ctx.fill();
        ctx.strokeStyle = 'rgba(140,110,70,0.5)'; ctx.lineWidth = 2;
        for (const c of this.deco.cracks) if (inSlot(c[0][0], c[0][1])) { ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); for (const q of c.slice(1)) ctx.lineTo(G.clamp(q[0], f.x + 10, f.x + f.w - 10), q[1]); ctx.stroke(); }
        ctx.fillStyle = '#8fae5d';
        for (const w of this.deco.weeds) if (inSlot(w.x, w.y)) { ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x - 5, w.y - 10); ctx.lineTo(w.x, w.y - 4); ctx.lineTo(w.x + 5, w.y - 11); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = '#a0764f';
        for (const [x, y] of [[f.x + 16, f.y + 14], [f.x + f.w - 16, f.y + 14], [f.x + 16, f.y + f.h - 8], [f.x + f.w - 16, f.y + f.h - 8]]) { G.roundRect(ctx, x - 4, y - 20, 8, 22, 2); ctx.fill(); }
      } else {
        // 畝の並んだ畑
        ctx.fillStyle = season === 3 ? '#e9e4de' : '#b98d62';
        G.roundRect(ctx, f.x + 6, f.y, f.w - 12, f.h, 22); ctx.fill();
        for (let y = f.y + 30; y < f.y + f.h - 20; y += 34) {
          ctx.fillStyle = season === 3 ? '#f7f4f0' : '#a17650';
          G.roundRect(ctx, f.x + 22, y, f.w - 44, 16, 8); ctx.fill();
          if (season === 3) continue;
          if (fd.use === 'pasture') {
            ctx.fillStyle = season === 2 ? '#c9c56b' : '#7ccf6a';
            for (let x = f.x + 30; x < f.x + f.w - 30; x += 14) { ctx.beginPath(); ctx.moveTo(x - 5, y + 10); ctx.lineTo(x, y - 8 - ((x + y) % 5)); ctx.lineTo(x + 5, y + 10); ctx.fill(); }
          } else if (G.field.produce(fd).money > 0) {
            ctx.fillStyle = season === 2 ? '#f2c94c' : '#5fbf6a';
            for (let x = f.x + 34; x < f.x + f.w - 30; x += 22) { ctx.beginPath(); ctx.arc(x, y + 4, 6, 0, Math.PI * 2); ctx.fill(); }
          }
        }
      }
      // 区画の看板
      const sx = f.x + f.w / 2, sy = f.y + f.h - 6;
      ctx.fillStyle = '#8e6440'; ctx.fillRect(sx - 3, sy - 30, 6, 32);
      ctx.fillStyle = '#fff3d6'; G.roundRect(ctx, sx - 18, sy - 50, 36, 26, 8); ctx.fill();
      ctx.strokeStyle = '#b98b5e'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#8e6440'; ctx.font = 'bold 15px "M PLUS Rounded 1c", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(G.field.label(i), sx, sy - 37);
    });
  },
  drawMilk() {
    const ctx = this.ctx, b = G.MAP.milk;
    ctx.fillStyle = 'rgba(60,80,40,0.15)'; ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y + b.h, b.w / 1.8, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4fbff'; G.roundRect(ctx, b.x + 8, b.y + 54, b.w - 16, b.h - 54, 12); ctx.fill();
    ctx.strokeStyle = '#bfdcef'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#7cc3ec';
    ctx.beginPath(); ctx.moveTo(b.x - 6, b.y + 62); ctx.quadraticCurveTo(b.x + b.w / 2, b.y - 6, b.x + b.w + 6, b.y + 62); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(b.x + 50, b.y + 36, 26, 8, -0.4, 0, Math.PI * 2); ctx.fill();
    // 牛乳缶
    const cx = b.x + b.w / 2, cy = b.y + 34;
    ctx.fillStyle = '#ffffff'; G.roundRect(ctx, cx - 12, cy - 14, 24, 30, 8); ctx.fill();
    ctx.fillStyle = '#ff9fbd'; ctx.fillRect(cx - 12, cy - 2, 24, 6);
    ctx.fillStyle = '#ffffff'; G.roundRect(ctx, cx - 7, cy - 20, 14, 8, 3); ctx.fill();
    // 扉・窓
    ctx.fillStyle = '#9fd3f2'; G.roundRect(ctx, cx - 22, b.y + b.h - 56, 44, 56, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 1, b.y + b.h - 54, 2, 54);
    ctx.fillStyle = '#d8f0ff'; G.roundRect(ctx, b.x + 20, b.y + 76, 30, 26, 6); ctx.fill(); G.roundRect(ctx, b.x + b.w - 50, b.y + 76, 30, 26, 6); ctx.fill();
  },
  drawSignBoard(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = '#8e6440'; ctx.fillRect(x - 3, y - 30, 6, 32);
    ctx.fillStyle = '#e9c891'; G.roundRect(ctx, x - 22, y - 46, 44, 24, 6); ctx.fill();
    ctx.strokeStyle = '#b98b5e'; ctx.lineWidth = 2; ctx.stroke();
  },
  drawOffice() {
    const ctx = this.ctx, o = G.MAP.office;
    ctx.fillStyle = 'rgba(60,80,40,0.15)'; ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, o.y + o.h, o.w / 1.8, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff6e6'; G.roundRect(ctx, o.x + 10, o.y + 60, o.w - 20, o.h - 60, 12); ctx.fill();
    ctx.strokeStyle = '#e0c9a6'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#ff9a8b';
    ctx.beginPath(); ctx.moveTo(o.x - 10, o.y + 70); ctx.lineTo(o.x + o.w / 2, o.y); ctx.lineTo(o.x + o.w + 10, o.y + 70); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.moveTo(o.x + 20, o.y + 62); ctx.lineTo(o.x + o.w / 2, o.y + 12); ctx.lineTo(o.x + o.w / 2, o.y + 30); ctx.lineTo(o.x + 40, o.y + 62); ctx.fill();
    // 窓・扉
    ctx.fillStyle = '#aee3ff'; G.roundRect(ctx, o.x + 30, o.y + 90, 46, 40, 8); ctx.fill(); G.roundRect(ctx, o.x + o.w - 76, o.y + 90, 46, 40, 8); ctx.fill();
    ctx.fillStyle = '#c58b5a'; G.roundRect(ctx, o.x + o.w / 2 - 24, o.y + o.h - 66, 48, 66, 10); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(o.x + o.w / 2 + 12, o.y + o.h - 32, 3, 0, Math.PI * 2); ctx.fill();
    // 看板
    ctx.fillStyle = '#fff'; G.roundRect(ctx, o.x + o.w / 2 - 44, o.y + 64, 88, 24, 10); ctx.fill();
    ctx.fillStyle = '#c0607a'; ctx.font = 'bold 14px "M PLUS Rounded 1c", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('事務所', o.x + o.w / 2, o.y + 77);
    // 花壇
    ctx.fillStyle = '#7cc47a'; G.roundRect(ctx, o.x + 14, o.y + o.h - 12, 60, 12, 6); ctx.fill(); G.roundRect(ctx, o.x + o.w - 74, o.y + o.h - 12, 60, 12, 6); ctx.fill();
    ['#ff8fab', '#ffd166', '#ff8fab', '#b9a6ff'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(o.x + 24 + i * 14, o.y + o.h - 12, 4, 0, Math.PI * 2); ctx.arc(o.x + o.w - 64 + i * 14, o.y + o.h - 12, 4, 0, Math.PI * 2); ctx.fill(); });
  },
  drawBarn(b, sp) {
    const ctx = this.ctx;
    if (sp === 'horse') { this.drawStable(b); return; }
    ctx.fillStyle = 'rgba(60,80,40,0.15)'; ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y + b.h, b.w / 1.8, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8766e'; G.roundRect(ctx, b.x + 8, b.y + 50, b.w - 16, b.h - 50, 10); ctx.fill();
    ctx.fillStyle = '#fff5ee';
    ctx.beginPath(); ctx.moveTo(b.x - 6, b.y + 58); ctx.lineTo(b.x + b.w / 2, b.y + 6); ctx.lineTo(b.x + b.w + 6, b.y + 58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c95b5b';
    ctx.beginPath(); ctx.moveTo(b.x + 6, b.y + 54); ctx.lineTo(b.x + b.w / 2, b.y + 16); ctx.lineTo(b.x + b.w - 6, b.y + 54); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff5ee'; G.roundRect(ctx, b.x + b.w / 2 - 30, b.y + b.h - 60, 60, 60, 6); ctx.fill();
    ctx.strokeStyle = '#e8766e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(b.x + b.w / 2 - 26, b.y + b.h - 56); ctx.lineTo(b.x + b.w / 2 + 26, b.y + b.h - 4); ctx.moveTo(b.x + b.w / 2 + 26, b.y + b.h - 56); ctx.lineTo(b.x + b.w / 2 - 26, b.y + b.h - 4); ctx.stroke();
    ctx.fillStyle = '#fff5ee'; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 40, 9, 0, Math.PI * 2); ctx.fill();
  },
  drawStable(b) {
    // 馬房
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(60,80,40,0.15)'; ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y + b.h, b.w / 1.8, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9a66b'; G.roundRect(ctx, b.x + 6, b.y + 50, b.w - 12, b.h - 50, 10); ctx.fill();
    ctx.fillStyle = '#7d9b5b';
    ctx.beginPath(); ctx.moveTo(b.x - 8, b.y + 58); ctx.lineTo(b.x + 20, b.y + 14); ctx.lineTo(b.x + b.w - 20, b.y + 14); ctx.lineTo(b.x + b.w + 8, b.y + 58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(b.x + 24, b.y + 22, b.w - 48, 6);
    for (let i = 0; i < 3; i++) {
      const dx = b.x + 18 + i * ((b.w - 36) / 3);
      ctx.fillStyle = '#8a5a3c'; G.roundRect(ctx, dx + 4, b.y + 76, (b.w - 36) / 3 - 8, b.h - 76, 6); ctx.fill();
      ctx.fillStyle = '#b77b4f'; ctx.fillRect(dx + 4, b.y + 76 + (b.h - 76) / 2, (b.w - 36) / 3 - 8, 4);
    }
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 36, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b98b5e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 39, 6, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  },
  drawTown() {
    const ctx = this.ctx, t = G.MAP.town;
    ctx.fillStyle = '#b98b5e';
    G.roundRect(ctx, t.x, t.y + 40, 22, t.h - 40, 6); ctx.fill(); G.roundRect(ctx, t.x + t.w - 22, t.y + 40, 22, t.h - 40, 6); ctx.fill();
    ctx.fillStyle = '#ff9a8b'; G.roundRect(ctx, t.x - 10, t.y + 20, t.w + 20, 34, 14); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px "M PLUS Rounded 1c", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('町', t.x + t.w / 2, t.y + 38);
    ctx.fillStyle = '#ffd6e0'; ctx.beginPath(); ctx.arc(t.x + 10, t.y + 20, 8, 0, Math.PI * 2); ctx.arc(t.x + t.w - 10, t.y + 20, 8, 0, Math.PI * 2); ctx.fill();
  },
  drawSign(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(60,80,40,0.18)'; ctx.beginPath(); ctx.ellipse(x, y, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8e6440'; G.roundRect(ctx, x - 3, y - 44, 6, 46, 2); ctx.fill();
    ctx.fillStyle = '#ffe08a';
    ctx.beginPath(); ctx.moveTo(x - 20, y - 52); ctx.lineTo(x + 14, y - 52); ctx.lineTo(x + 22, y - 44); ctx.lineTo(x + 14, y - 36); ctx.lineTo(x - 20, y - 36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b9e3ff';
    ctx.beginPath(); ctx.moveTo(x + 18, y - 32); ctx.lineTo(x - 14, y - 32); ctx.lineTo(x - 22, y - 24); ctx.lineTo(x - 14, y - 16); ctx.lineTo(x + 18, y - 16); ctx.closePath(); ctx.fill();
  },
  drawTree(tr, pal) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(60,80,40,0.18)'; ctx.beginPath(); ctx.ellipse(tr.x, tr.y, tr.r * 0.8, tr.r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9c6b4a'; G.roundRect(ctx, tr.x - 6, tr.y - tr.r, 12, tr.r, 4); ctx.fill();
    ctx.fillStyle = tr.kind ? pal.tree2 : pal.tree;
    ctx.beginPath(); ctx.arc(tr.x, tr.y - tr.r * 1.4, tr.r, 0, Math.PI * 2); ctx.arc(tr.x - tr.r * 0.6, tr.y - tr.r * 1.1, tr.r * 0.7, 0, Math.PI * 2); ctx.arc(tr.x + tr.r * 0.6, tr.y - tr.r * 1.1, tr.r * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(tr.x - tr.r * 0.3, tr.y - tr.r * 1.7, tr.r * 0.35, 0, Math.PI * 2); ctx.fill();
    if ((G.S.turn - 1) % 4 === 3) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(tr.x, tr.y - tr.r * 2.2, tr.r * 0.7, tr.r * 0.3, 0, 0, Math.PI * 2); ctx.fill(); }
  },
  drawAnimalExtras(a, s) {
    const ctx = this.ctx, sz = G.sizeOf(a);
    const P = G.S.player;
    const near = Math.hypot(P.x - s.x, P.y - s.y) < 130;
    if (near || this.hoverId === a.id) {
      ctx.font = 'bold 12px "M PLUS Rounded 1c", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(a.name).width + 14;
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; G.roundRect(ctx, s.x - w / 2, s.y - 62 * sz - 16, w, 18, 9); ctx.fill();
      ctx.fillStyle = '#6b4a5a'; ctx.fillText(a.name, s.x, s.y - 62 * sz - 7);
    }
    if (s.bubble) {
      const by = s.y - 62 * sz - (near ? 36 : 18);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x + 18, by, 13, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s.x + 10, by + 8); ctx.lineTo(s.x + 6, by + 18); ctx.lineTo(s.x + 18, by + 10); ctx.fill();
      ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = s.bubble === '♪' ? '#f08bb4' : '#000';
      ctx.fillText(s.bubble, s.x + 18, by + 1);
    }
  },
  drawSay(s) {
    if (!s.say) return;
    const ctx = this.ctx;
    ctx.font = '13px "M PLUS Rounded 1c", sans-serif';
    const lines = this.wrap(s.say, 200);
    const w = Math.min(220, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20), h = lines.length * 18 + 12;
    const x = s.x - w / 2, y = s.y - 70 - h;
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; G.roundRect(ctx, x, y, w, h, 12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s.x - 6, y + h); ctx.lineTo(s.x, y + h + 8); ctx.lineTo(s.x + 6, y + h); ctx.fill();
    ctx.fillStyle = '#6b4a5a'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, x + 10, y + 7 + i * 18));
    if (G.S.devMode && s.sayId) { ctx.fillStyle = '#7a6cff'; ctx.font = '10px monospace'; ctx.fillText(s.sayId, x + 6, y - 12); }
  },
  wrap(text, w) {
    const ctx = this.ctx, out = [];
    let cur = '';
    for (const ch of text) { if (ctx.measureText(cur + ch).width > w) { out.push(cur); cur = ch; } else cur += ch; }
    if (cur) out.push(cur);
    return out;
  },
  renderMini() {
    const c = this.mctx, M = G.MAP, W = this.mini.width, H = this.mini.height;
    const sx = W / M.W, sy = H / M.H;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = this.palette().ground; c.fillRect(0, 0, W, H);
    c.strokeStyle = this.palette().path; c.lineWidth = 3 * this.dpr;
    for (const p of this.paths) { c.beginPath(); c.moveTo(p[0][0] * sx, p[0][1] * sy); for (const q of p.slice(1)) c.lineTo(q[0] * sx, q[1] * sy); c.stroke(); }
    for (const pid of Object.keys(M.pastures)) {
      const p = M.pastures[pid];
      c.fillStyle = G.S.pastures[pid].open ? '#e9fbd8' : '#cfe7b5';
      c.fillRect(p.x * sx, p.y * sy, p.w * sx, p.h * sy);
      if (G.S.pastures[pid].open) { c.strokeStyle = '#b98b5e'; c.lineWidth = 1.5 * this.dpr; c.strokeRect(p.x * sx, p.y * sy, p.w * sx, p.h * sy); c.fillStyle = '#e8766e'; c.fillRect(p.barn.x * sx, p.barn.y * sy, p.barn.w * sx, p.barn.h * sy); }
    }
    G.S.fields.forEach((f, i) => { const r = G.fieldRect(i); c.fillStyle = f.open ? '#b98d62' : '#d9c39a'; c.fillRect((r.x + 3) * sx, r.y * sy, (r.w - 6) * sx, r.h * sy); });
    c.fillStyle = '#7cc3ec'; c.fillRect(M.milk.x * sx, M.milk.y * sy, M.milk.w * sx, M.milk.h * sy);
    c.fillStyle = '#ff9a8b'; c.fillRect(M.office.x * sx, M.office.y * sy, M.office.w * sx, M.office.h * sy);
    c.fillStyle = '#ffb4c8'; c.fillRect(M.town.x * sx, M.town.y * sy, M.town.w * sx, M.town.h * sy);
    c.fillStyle = '#8fd3f4'; c.beginPath(); c.ellipse(M.pond.x * sx, M.pond.y * sy, M.pond.rx * sx, M.pond.ry * sy, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7a5c4a';
    for (const a of G.alive()) { const s = this.stOf(a); c.fillRect(s.x * sx - 1, s.y * sy - 1, 2 * this.dpr, 2 * this.dpr); }
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.5 * this.dpr;
    c.strokeRect(this.cam.x * sx, this.cam.y * sy, this.vw * sx, this.vh * sy);
    const P = G.S.player;
    c.fillStyle = '#ff5c8a'; c.beginPath(); c.arc(P.x * sx, P.y * sy, 3.5 * this.dpr, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 1.5 * this.dpr; c.stroke();
  },

  loop(ts) {
    const dt = Math.min(0.05, (ts - (this.last || ts)) / 1000);
    this.last = ts;
    if (G.S && !this.paused) {
      this.t += dt;
      this.updatePlayer(dt);
      this.updateAnimals(dt);
      this.updateStaff(dt);
      this.updateFx(dt);
      this.render();
    }
    requestAnimationFrame((t) => this.loop(t));
  },
};
