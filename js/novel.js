// ノベル形式の文章イベント（No.15）
G.novel = {
  active: false,
  paras: [], idx: 0, vars: {}, skipping: false, holdSkip: false, typing: false, onEnd: null,

  init() {
    const root = document.getElementById('novel');
    this.root = root;
    this.win = root.querySelector('.novel-win');
    this.textEl = root.querySelector('.ntext');
    this.speakerEl = root.querySelector('.speaker');
    this.idEl = root.querySelector('.nid');
    this.skipBtn = root.querySelector('.skip');
    this.win.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      if (this.suppressClick) { this.suppressClick = false; return; }
      this.advance();
    });
    this.skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.skipping = !this.skipping;
      this.skipBtn.classList.toggle('on', this.skipping);
      if (this.skipping) this.advance();
    });
    root.querySelector('.copy').addEventListener('click', (e) => {
      e.stopPropagation();
      const id = this.idEl.dataset.id;
      if (navigator.clipboard) navigator.clipboard.writeText(id).catch(() => {});
      G.ui.toast('コピー　' + id, 1200);
    });
    // 長押しでスキップ
    let timer = null;
    this.win.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      timer = setTimeout(() => { this.holdSkip = true; this.skipping = true; this.skipBtn.classList.add('on'); this.suppressClick = true; this.advance(); }, 450);
    });
    const up = () => { clearTimeout(timer); if (this.holdSkip) { this.holdSkip = false; this.skipping = false; this.skipBtn.classList.remove('on'); } };
    this.win.addEventListener('pointerup', up);
    this.win.addEventListener('pointerleave', up);
    window.addEventListener('keydown', (e) => {
      if (!this.active) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e') { e.preventDefault(); e.stopPropagation(); this.advance(); }
      if (e.key === 'Control') { this.skipping = true; this.skipBtn.classList.add('on'); this.advance(); }
    }, true);
    window.addEventListener('keyup', (e) => { if (e.key === 'Control' && this.active) { this.skipping = false; this.skipBtn.classList.remove('on'); } });
  },

  // ev: { paras:[id], vars, ledger:[lines]|null, aid }
  play(ev, onEnd) {
    this.paras = ev.paras.map((id) => ({ id })).concat(ev.ledger ? [{ ledger: ev.ledger }] : []);
    if (!this.paras.length) { onEnd && onEnd(); return; }
    this.vars = ev.vars || {};
    this.aid = ev.aid;
    this.onEnd = onEnd;
    this.idx = -1;
    this.active = true;
    this.skipping = false;
    this.skipBtn.classList.remove('on');
    this.root.classList.remove('hidden');
    G.audio.duck(true);
    G.ui.hideTip();
    this.next();
  },
  isRead(p) { return p.ledger ? true : !!G.S.readTexts[p.id]; },
  advance() {
    if (this.typing) { this.finishType(); return; }
    this.next();
  },
  next() {
    clearTimeout(this.skipTimer);
    this.idx++;
    if (this.idx >= this.paras.length) { this.end(); return; }
    const p = this.paras[this.idx];
    if (this.skipping && !this.isRead(p)) {
      // 未読の段落でスキップを止める
      this.skipping = false; this.holdSkip = false;
      this.skipBtn.classList.remove('on');
    }
    this.show(p, this.skipping);
    if (this.skipping && this.idx < this.paras.length - 1) this.skipTimer = setTimeout(() => { if (this.skipping) this.next(); }, 70);
  },
  show(p, instant) {
    this.win.classList.toggle('ledger-mode', !!p.ledger);
    if (p.ledger) {
      this.speakerEl.textContent = '帳簿';
      this.speakerEl.classList.remove('hidden');
      this.textEl.innerHTML = p.ledger.map((l) => `<div>${G.esc(l)}</div>`).join('');
      this.idEl.classList.add('hidden');
      this.root.querySelector('.copy').classList.add('hidden');
      this.typing = false;
      return;
    }
    const e = G.text.get(p.id) || { text: `［${p.id}］`, speaker: 'narration' };
    const sp = e.speaker || 'narration';
    let name = '';
    if (sp === 'staff_girl') name = G.S.staff.girl.name;
    if (sp === 'staff_boy') name = G.S.staff.boy.name;
    if (sp === 'senior') name = G.senior.NAME;
    if (sp === 'animal') name = this.vars.name || '';
    this.speakerEl.textContent = name;
    this.speakerEl.classList.toggle('hidden', !name);
    this.speakerEl.className = 'speaker ' + sp + (name ? '' : ' hidden');
    const text = G.text.fill(e.text, this.vars);
    G.S.readTexts[p.id] = true;
    this.idEl.textContent = p.id;
    this.idEl.dataset.id = p.id;
    const dev = !!G.S.devMode;
    this.idEl.classList.toggle('hidden', !dev);
    this.root.querySelector('.copy').classList.toggle('hidden', !dev);
    G.audio.sfx('page');
    if (instant) { this.textEl.textContent = text; this.typing = false; return; }
    this.full = text;
    this.textEl.textContent = '';
    this.typing = true;
    let i = 0;
    const tick = () => {
      if (!this.typing) return;
      i += 2;
      this.textEl.textContent = text.slice(0, i);
      if (i >= text.length) { this.typing = false; return; }
      this.typeTimer = setTimeout(tick, 16);
    };
    tick();
  },
  finishType() {
    clearTimeout(this.typeTimer);
    this.typing = false;
    this.textEl.textContent = this.full;
  },
  end() {
    clearTimeout(this.skipTimer);
    this.active = false;
    this.skipping = false;
    this.root.classList.add('hidden');
    G.audio.duck(false);
    const cb = this.onEnd; this.onEnd = null;
    if (cb) cb();
    G.ui.flushNotices();
  },
};

// 出荷画面（No.18）
G.shipScreen = {
  active: false,
  start(a) {
    this.a = a;
    this.active = true;
    const root = document.getElementById('ship');
    this.root = root;
    root.className = 'stage1';
    root.innerHTML = `<div class="ship-stage s1"><canvas class="portrait" width="300" height="300"></canvas><div class="ship-name">${G.esc(a.name)}</div><div class="ship-sub">${a.sex === 'M' ? '♂' : '♀'}　${G.spName(a)}　${G.ageText(a.age)}</div><div class="tap">▼</div></div>
      <div class="ship-text hidden"><div class="speaker"></div><div class="ntext"></div><div class="nid dev-only"></div></div>
      <div class="ship-label hidden"></div>`;
    G.draw.portrait(root.querySelector('canvas'), a);
    G.audio.duck(true);
    const v = G.shipValue(a);
    const ctx = { species: a.species, personality: a.personality, meat_grade: v.q };
    this.paras = G.buildParas([{ pick: 'ship.farewell_' }, G.voiceStep(a, 'ship.voice', 'farewell'), { pick: 'ship.buyer_marbling_' }], ctx);
    this.vars = G.textVars(a);
    this.i = -1;
    this.stage = 1;
    root.onclick = (e) => { if (!e.target.closest('button')) this.step(); };
  },
  step() {
    const root = this.root;
    if (this.stage === 1 || this.stage === 2) {
      this.stage = 2;
      root.querySelector('.s1 .tap').classList.add('hidden');
      this.i++;
      if (this.i < this.paras.length) {
        const id = this.paras[this.i];
        const e = G.text.get(id);
        const box = root.querySelector('.ship-text');
        box.classList.remove('hidden');
        const sp = e.speaker === 'staff_girl' ? G.S.staff.girl.name : e.speaker === 'staff_boy' ? G.S.staff.boy.name : e.speaker === 'animal' ? this.a.name : '';
        box.querySelector('.speaker').textContent = sp;
        box.querySelector('.speaker').classList.toggle('hidden', !sp);
        box.querySelector('.ntext').textContent = G.text.fill(e.text, this.vars);
        box.querySelector('.nid').textContent = id;
        G.S.readTexts[id] = true;
        G.audio.sfx('page');
        return;
      }
      // 商品ラベルへ切り替え
      this.stage = 3;
      root.className = 'fade';
      setTimeout(() => this.showLabel(), 700);
    }
  },
  showLabel() {
    const a = this.a, root = this.root;
    const v = G.ship(a);
    const line = G.S.ledger[G.S.ledger.length - 1].lines;
    G.storeDiary(a, { title: '出荷', paras: this.paras, vars: this.vars, ledger: line });
    root.className = 'stage3';
    root.querySelector('.s1').classList.add('hidden');
    root.querySelector('.ship-text').classList.add('hidden');
    const lab = root.querySelector('.ship-label');
    lab.classList.remove('hidden');
    lab.innerHTML = `<div class="label-card">
      <div class="lab-h">${G.isHorse(a) ? '馬肉　ロース' : '黒毛　ロース'}</div>
      <div class="lab-row"><span>枝肉重量</span><b>${v.carcass}kg</b></div>
      <div class="lab-row"><span>肉量</span><b>${G.rankName(v.yieldRank)}</b><span>肉質</span><b>${G.rankName(v.q)}</b></div>
      <div class="lab-row big"><span>売上</span><b>${G.yen(v.sales)}</b></div>
      <div class="lab-row"><span>個体識別番号</span><b class="mono">${a.idNo}</b></div>
      <div class="barcode">${Array.from({ length: 38 }, (_, i) => `<i style="width:${1 + (G.hash(a.idNo + i) % 3)}px"></i>`).join('')}</div>
    </div><button class="btn primary ok">OK</button>`;
    root.onclick = null;
    lab.querySelector('.ok').onclick = () => this.end();
  },
  end() {
    this.active = false;
    this.root.className = 'hidden';
    this.root.innerHTML = '';
    G.audio.duck(false);
    G.ui.markNoticesDone(null, this.a.id);
    G.ui.refreshHud();
  },
};
