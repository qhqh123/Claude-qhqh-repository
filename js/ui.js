// 画面（ウィンドウ・通知・HUD）
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

G.ui = {
  modals: [],
  noticeQueue: [],
  holdNotices: false,
  detailStack: [],
  nearTarget: null,

  modalOpen() {
    return this.modals.length > 0 || G.novel.active || G.shipScreen.active || !!$('#title:not(.hidden)') || !!$('#warning:not(.hidden)');
  },

  // ---------- モーダル ----------
  open(html, opt) {
    opt = opt || {};
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap' + (opt.cls ? ' ' + opt.cls : '');
    wrap.innerHTML = `<div class="modal ${opt.size || ''}"><button class="close" aria-label="閉じる">×</button>${html}</div>`;
    document.getElementById('modals').appendChild(wrap);
    this.modals.push(wrap);
    $('.close', wrap).onclick = () => { G.audio.sfx('close'); this.close(wrap); };
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap && !opt.sticky) { G.audio.sfx('close'); this.close(wrap); } });
    if (!opt.silent) G.audio.sfx('open');
    wrap.onClose = opt.onClose;
    return wrap;
  },
  close(wrap) {
    wrap = wrap || this.modals[this.modals.length - 1];
    if (!wrap) return;
    this.modals = this.modals.filter((m) => m !== wrap);
    wrap.classList.add('closing');
    setTimeout(() => wrap.remove(), 160);
    if (wrap.onClose) wrap.onClose();
    this.hideTip();
    this.flushNotices();
  },
  closeAll() { while (this.modals.length) this.close(this.modals[0]); },

  toast(text, ms) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    $('#toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), ms || 2600);
    setTimeout(() => el.remove(), (ms || 2600) + 400);
  },

  confirm(title, body, okLabel, onOk) {
    const w = this.open(`<h2>${G.esc(title)}</h2><div class="confirm-body">${body || ''}</div>
      <div class="actions"><button class="btn primary ok">${G.esc(okLabel)}</button><button class="btn cancel">やめる</button></div>`, { size: 'small' });
    $('.ok', w).onclick = () => { this.close(w); onOk(); };
    $('.cancel', w).onclick = () => this.close(w);
  },

  // ---------- HUD ----------
  initHud() {
    $('#btn-office').onclick = () => { G.audio.sfx('click'); this.openOffice(); };
    $('#btn-town').onclick = () => { G.audio.sfx('click'); this.openTown(); };
    $('#btn-end').onclick = () => { G.audio.sfx('click'); this.confirmEndTurn(); };
    $('#btn-menu').onclick = () => { G.audio.sfx('click'); this.openMenu(); };
    $('#btn-sound').onclick = () => { G.audio.setMuted(!G.audio.muted); this.refreshHud(); };
    $('#btn-dash').onclick = () => { G.map.dash = !G.map.dash; $('#btn-dash').classList.toggle('on', G.map.dash); };
    $('#btn-act').onclick = () => { if (!this.modalOpen()) G.map.interact(); };
    $('#near-panel').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || !this.nearTarget) return;
      const t = this.nearTarget;
      if (t.kind !== 'animal') return;
      if (b.dataset.care) this.care(t.a, b.dataset.care);
      if (b.dataset.detail) this.openDetail(t.a.id);
    });
  },
  refreshHud() {
    const S = G.S;
    if (!S) return;
    $('#hud-date').textContent = G.dateText(S.turn);
    $('#hud-season').className = 'season-icon s' + ((S.turn - 1) % 4);
    if (!this.countingMoney) $('#hud-money').textContent = G.yen(S.money);
    $('#hud-loan').textContent = G.yen(S.loan);
    $('#hud-care').textContent = S.careLeft;
    $('#hud-wood').textContent = S.wood || 0;
    const n = G.herdCount('cattle');
    $('#hud-herd').textContent = `${n}/${S.cattleSlots}`;
    $('#hud-herd').parentElement.classList.toggle('over', n > S.cattleSlots);
    const nh = G.herdCount('horse');
    $('#hud-horse').textContent = `${nh}/${S.horseSlots}`;
    $('#hud-horse').parentElement.classList.toggle('hidden', !S.horseSlots && !nh);
    $('#hud-horse').parentElement.classList.toggle('over', nh > S.horseSlots);
    const pending = S.notices.filter((x) => !x.done).length;
    $('#btn-town').classList.toggle('alert', G.senior.needed());
    const badge = $('#office-badge');
    badge.textContent = pending; badge.classList.toggle('hidden', !pending);
    $('#btn-sound').textContent = G.audio.muted ? '🔇' : '🔊';
    document.body.classList.toggle('dev', !!S.devMode);
    this.setNear(this.nearTarget, true);
  },
  setNear(t, force) {
    const key = t ? (t.kind === 'animal' ? t.a.id : t.kind + (t.who || '')) : '';
    if (!force && key === this.nearKey) return;
    this.nearKey = key;
    this.nearTarget = t;
    const p = $('#near-panel');
    if (!t || t.kind !== 'animal') { p.classList.add('hidden'); return; }
    const a = t.a;
    const dis = G.S.careLeft <= 0 ? 'disabled' : '';
    p.innerHTML = `<span class="near-name">${G.esc(a.name)} <small>${a.sex === 'M' ? '♂' : '♀'}</small></span>
      <button class="chip" data-care="brush" ${dis}>🪮 ブラッシング</button><button class="chip" data-care="pet" ${dis}>🤲 ふれあい</button><button class="chip" data-care="exercise" ${dis}>🏃 運動</button><button class="chip" data-detail="1">📋 詳細</button>`;
    p.classList.remove('hidden');
  },

  // ---------- お世話 ----------
  care(a, kind) {
    const S = G.S;
    if (S.careLeft <= 0 || a.status !== 'alive') return;
    S.careLeft--;
    const fav = a.favorite === kind ? 1.5 : 1;
    const e = { brush: [-12, 4, 4], pet: [-4, 8, 6], exercise: [-6, 4, 3] }[kind];
    a.stress = G.clamp(a.stress + e[0] * fav, 0, 100);
    a.happiness = G.clamp(a.happiness + e[1] * fav, 0, 100);
    a.affinity.player = G.clamp(a.affinity.player + e[2] * fav, 0, 100);
    if (kind === 'exercise') a.health = Math.min(100, a.health + 3);
    if (G.isHorse(a)) a.trained = Math.min(G.C.trainMax, (a.trained || 0) + G.C.trainCare[kind] * fav);
    const st = G.map.stOf(a);
    G.map.burst(st.x, st.y - 40, kind === 'pet' ? ['💗', '💕', '✨'] : ['✨', '💗', '⭐'], fav > 1 ? 10 : 7);
    st.bubble = '❤'; st.bubbleT = 2.5; st.mode = 'idle'; st.timer = 2;
    G.audio.sfx('care');
    if (Math.random() < 0.5) setTimeout(() => G.audio.sfx('moo'), 300);
    const id = G.text.pick(`care.${kind}_`, { personality: a.personality });
    if (id) {
      st.say = G.text.fill(G.text.get(id).text, G.textVars(a));
      st.sayId = id; st.sayT = 3;
      S.readTexts[id] = true;
    }
    this.refreshHud();
    this.setNear(this.nearTarget, true);
  },

  animalMenu(a, near) {
    if (!near) { this.openDetail(a.id); return; }
    const dis = G.S.careLeft <= 0 ? 'disabled' : '';
    const w = this.open(`<h2>${G.esc(a.name)} <small>${a.sex === 'M' ? '♂' : '♀'}　${G.ageText(a.age)}</small></h2>
      <div class="care-grid">
        <button class="btn" data-k="brush" ${dis}>🪮 ブラッシング</button>
        <button class="btn" data-k="pet" ${dis}>🤲 ふれあい</button>
        <button class="btn" data-k="exercise" ${dis}>🏃 運動</button>
        <button class="btn" data-k="detail">📋 詳細</button>
      </div><div class="care-left">お世話 ${G.S.careLeft}</div>`, { size: 'small' });
    $$('button[data-k]', w).forEach((b) => b.onclick = () => {
      this.close(w);
      if (b.dataset.k === 'detail') this.openDetail(a.id); else this.care(a, b.dataset.k);
    });
  },

  // ---------- バッジ ----------
  badge(a, k, r, small) {
    const def = G.TRAITS[k];
    if (!def) return '';
    const rk = r && !def.noRank ? G.rankName(r) : '';
    const reason = a ? G.traitInactiveReason(a, k) : null;
    let tip = r ? (def.noRank ? `${def.name}　${def.tip}` : `${def.name} ${rk}　${def.tip}`) : '';
    if (reason && tip) tip += '\n' + reason;
    const cls = ['badge', 'r' + (r | 0), def.demerit ? 'demerit' : '', def.frame ? 'frame' : '', reason ? 'off' : '', small ? 'sm' : ''].join(' ');
    return `<span class="${cls}" ${tip ? `data-tip="${G.esc(tip)}"` : ''}>${G.esc(def.name)}${rk ? `<b>${rk}</b>` : ''}</span>`;
  },
  badgesFrame(a, genes, small) {
    genes = genes || a.genes;
    return this.badge(a, 'length', genes.length, small) + this.badge(a, 'depth', genes.depth, small);
  },
  badgesAcq(a, small) {
    return a && a.species ? G.acqList(a).map((t) => this.badge(a, t.k, t.r, small)).join('') : '';
  },
  badgesTraits(a, genes, small) {
    genes = genes || a.genes;
    const t = (genes.traits || []).filter((x) => x.r > 0);
    return t.length ? t.map((x) => this.badge(a, x.k, x.r, small)).join('') : '<span class="muted">—</span>';
  },

  bar(label, v, cls) {
    return `<div class="stat"><span>${label}</span><div class="bar ${cls || ''}"><i style="width:${G.clamp(v, 0, 100)}%"></i></div><em>${Math.round(v)}</em></div>`;
  },

  breedStatus(a) {
    if (a.status !== 'alive') return { shipped: '出荷済み', sold: '売却済み', dead: '死亡' }[a.status];
    if (a.sex === 'F') {
      if (a.pregnancy) return `妊娠中（出産予定 ${Math.max(1, a.pregnancy.due - G.S.turn)}ターン後）`;
      if (!G.isMature(a)) return '未成熟';
      return a.bredTurn === G.S.turn ? '交配済み' : '交配可能';
    }
    if (a.castrated) return `去勢済み（${G.PERIOD_NAMES[a.castration.period]}・${G.METHOD_SHORT[a.castration.method]}）`;
    return G.isMature(a) ? '未去勢・繁殖可能' : '未去勢';
  },

  // ---------- 個体詳細 ----------
  openDetail(id, opts) {
    opts = opts || {};
    const a = G.S.animals[id];
    if (!a) return;
    const existing = this.modals.find((m) => m.dataset.detail);
    if (existing && !opts.replace) {
      // 詳細から詳細へ移るときは履歴に積む
      this.detailStack.push({ id: existing.dataset.detail, tab: existing.dataset.tab });
      this.renderDetail(existing, a, opts.tab || 'basic');
      return;
    }
    if (!existing) this.detailStack = [];
    const w = existing || this.open('<div class="detail"></div>', { size: 'large', onClose: () => { this.detailStack = []; } });
    this.renderDetail(w, a, opts.tab || 'basic');
  },
  renderDetail(w, a, tab) {
    w.dataset.detail = a.id;
    w.dataset.tab = tab;
    const box = $('.detail', w);
    const back = this.detailStack.length ? '<button class="btn back">← 戻る</button>' : '';
    const tabs = [['basic', '基本'], ['rel', '関係'], ['family', '家系図'], ['history', '履歴']];
    box.innerHTML = `<div class="detail-head">${back}<h2>${G.esc(a.name)} <small>${a.sex === 'M' ? '♂' : '♀'}　${G.spName(a)}　${G.ageText(a.age)}</small></h2></div>
      <div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
      <div class="tab-body"></div>`;
    $$('.tab', box).forEach((b) => b.onclick = () => { G.audio.sfx('page'); this.renderDetail(w, a, b.dataset.tab); });
    const bb = $('.back', box);
    if (bb) bb.onclick = () => {
      G.audio.sfx('page');
      const prev = this.detailStack.pop();
      const pa = G.S.animals[prev.id];
      if (pa) this.renderDetail(w, pa, prev.tab || 'basic');
    };
    const body = $('.tab-body', box);
    if (tab === 'basic') this.detailBasic(body, a, w);
    if (tab === 'rel') this.detailRelations(body, a, w);
    if (tab === 'family') this.detailFamily(body, a, w);
    if (tab === 'history') this.detailHistory(body, a, w);
  },
  detailBasic(body, a, w) {
    const alive = a.status === 'alive';
    const v = G.shipValue(a);
    const pastures = Object.keys(G.S.pastures).filter((p) => G.S.pastures[p].open && G.pastureSpecies(p) === a.species);
    const fieldIdx = G.S.fields.findIndex((f) => f.horse === a.id);
    const rec = G.isHorse(a) ? G.race.record(a) : null;
    const archive = !alive ? `<div class="kv"><span>個体識別番号</span><b>${a.idNo}</b></div>
      <div class="kv"><span>状態</span><b>${this.breedStatus(a)}　${G.dateText(a.endTurn || G.S.turn)}</b></div>
      ${a.shipped ? `<div class="kv"><span>売上</span><b>${G.yen(a.shipped.sales)}</b></div>` : ''}
      ${a.soldPrice ? `<div class="kv"><span>売上</span><b>${G.yen(a.soldPrice)}</b></div>` : ''}
      ${G.store.keepable(a).length ? `<div class="keep-row"><span class="sec-label">残す</span>${G.store.keepable(a).map((k) => `<button class="btn small keep" data-keep="${k}" ${G.store.full() ? 'disabled' : ''}>${G.ICONS[G.ITEMS[k].icon]}${G.ITEMS[k].name}</button>`).join('')}</div>` : ''}
      ${a.memorials && Object.keys(a.memorials).length ? `<div class="kv"><span>保管</span><b>${Object.keys(a.memorials).map((k) => G.ITEMS[k].name).join('・')}</b></div>` : ''}` : '';
    body.innerHTML = `<div class="basic">
      <div class="portrait-col"><canvas class="portrait" width="240" height="240"></canvas>
        ${alive ? '<button class="btn small rename">✏ 名前</button>' : ''}</div>
      <div class="info-col">
        ${archive}
        ${alive ? `<div class="kv"><span>個体識別番号</span><b>${a.idNo}</b></div>` : ''}
        <div class="kv"><span>品種</span><b>${G.formOf(a).name}</b></div>
        <div class="kv"><span>性格</span><b>${a.personality}</b></div>
        <div class="kv"><span>好きなお世話</span><b>${G.ACTIVITY_NAMES[a.favorite]}</b></div>
        ${alive ? this.bar('健康', a.health, 'health') + this.bar('幸福度', a.happiness, 'happy') + this.bar('ストレス', a.stress, 'stress') + this.bar('なつき度', a.affinity.player, 'aff') + (G.isHorse(a) ? this.bar('当代能力', a.trained || 0, 'train') : '') : ''}
        <div class="badge-row"><span class="lbl">体格</span>${this.badgesFrame(a)}</div>
        <div class="badge-row"><span class="lbl">特性</span>${this.badgesTraits(a)}</div>
        ${a.status === 'alive' && G.acqList(a).length ? `<div class="badge-row"><span class="lbl">後天</span>${this.badgesAcq(a)}</div>` : ''}
        <div class="kv"><span>繁殖状態</span><b>${this.breedStatus(a)}</b></div>
        ${rec ? `<div class="kv"><span>レース</span><b>${rec.n}戦 ${rec.win}勝 入賞${rec.place}</b></div>` : ''}
        ${alive && G.isHorse(a) ? `<div class="kv"><span>畑</span><b>${fieldIdx >= 0 ? `畑スロット${G.field.label(fieldIdx)}` : '—'}</b></div>` : ''}
        ${alive && a.lactation ? `<div class="kv"><span>泌乳</span><b>${G.milk.isDry(a) ? '乾乳' : `${G.milk.lactTurn(a)}ターン目　${Math.round(G.milk.lactMult(a) * 100)}%`}</b></div>
        <div class="kv"><span>搾乳施設</span><b>${G.milk.slotOf(a) >= 0 ? `スロット${G.milk.slotOf(a) + 1}` : '—'}</b></div>` : ''}
        ${alive ? `<div class="kv"><span>体重</span><b>${Math.round(a.weight)}kg</b></div>
        <div class="kv"><span>枝肉（予測）</span><b>${v.carcass}kg　肉量 ${G.rankName(v.yieldRank)}　肉質 ${G.rankName(v.q)}</b></div>
        <div class="kv"><span>売上（予測）</span><b>${G.yen(v.sales)}${v.pen > 0 ? `　<small>未去勢 −${Math.round(v.pen * 100)}%</small>` : ''}</b></div>
        <div class="kv"><span>見込み売上（次のターン）</span><b>${G.yen(G.nextShipValue(a))} ${['↓', '→', '↑'][G.valueTrend(a) + 1]}</b></div>
        <div class="kv"><span>維持費（1ターン）</span><b>${G.yen(G.upkeepOf(a))}</b></div>
        <div class="kv"><span>放牧地</span><b>${pastures.length > 1 ? '' : G.MAP_LABEL[a.pasture]}</b></div>${pastures.length > 1 ? this.pickChips(pastures.map((p) => ({ value: p, label: `${G.MAP_LABEL[p]} ${G.pastureCount(p)}/${G.pastureCap(p)}`, on: p === a.pasture, disabled: p !== a.pasture && G.pastureCount(p) >= G.pastureCap(p) })), 'data-move') : ''}` : ''}
      </div></div>
      ${alive ? `<div class="actions">
        ${G.canBreed(a) ? '<button class="btn primary" data-act="breed">💞 交配</button>' : ''}
        ${a.sex === 'M' && !a.castrated ? '<button class="btn" data-act="castrate">✂ 去勢</button>' : ''}
        <button class="btn" data-act="ship">🚚 出荷</button>
        <button class="btn" data-act="sell">🏷 売却</button>
      </div>` : ''}`;
    G.draw.portrait($('.portrait', body), a);
    $$('[data-keep]', body).forEach((b) => b.onclick = () => {
      const r = G.store.keep(a, b.dataset.keep);
      if (!r) return;
      G.audio.sfx('care');
      this.renderDetail(w, a, 'basic');
      G.novel.play(r.ev);
    });
    const rn = $('.rename', body);
    if (rn) rn.onclick = () => this.rename(a, () => this.renderDetail(w, a, 'basic'));
    $$('[data-move]', body).forEach((b) => b.onclick = () => {
      const p = b.getAttribute('data-move');
      if (p === a.pasture) return;
      a.pasture = p; G.addHistory(a, `移動　${G.MAP_LABEL[p]}`); G.audio.sfx('click');
      this.renderDetail(w, a, 'basic');
    });
    $$('[data-act]', body).forEach((b) => b.onclick = () => {
      const act = b.dataset.act;
      if (act === 'breed') this.openBreed(a);
      if (act === 'castrate') this.openCastrate(a);
      if (act === 'ship') this.confirmShip(a);
      if (act === 'sell') this.confirmSell(a);
    });
  },
  rename(a, done) {
    const w = this.open(`<h2>名前</h2><input class="text-input" maxlength="12" value="${G.esc(a.name)}"><div class="actions"><button class="btn primary ok">決定</button><button class="btn cancel">やめる</button></div>`, { size: 'small' });
    const inp = $('input', w); inp.focus(); inp.select();
    const ok = () => { const v = inp.value.trim(); if (v) { G.addHistory(a, `名前変更　${a.name} → ${v}`); a.name = v; } this.close(w); done && done(); };
    $('.ok', w).onclick = ok;
    inp.onkeydown = (e) => { if (e.key === 'Enter') ok(); };
    $('.cancel', w).onclick = () => this.close(w);
  },
  pedBox(ref, role) {
    // ref: { id } | { external, name, genes } | null
    if (!ref) return `<div class="ped empty"><div class="role">${role}</div><div class="nm">—</div></div>`;
    if (ref.external) {
      return `<div class="ped ext"><div class="role">${role}<span class="tag">外部</span></div><div class="nm">${G.esc(ref.name)}</div>
        <div class="bs">${this.badgesFrame(null, ref.genes, true)}${this.badgesTraits(null, ref.genes, true)}</div></div>`;
    }
    const a = G.S.animals[ref.id];
    if (!a) return `<div class="ped empty"><div class="role">${role}</div><div class="nm">—</div></div>`;
    const mainT = (a.genes.traits || []).filter((t) => t.r > 0).sort((x, y) => y.r - x.r).slice(0, 2);
    return `<div class="ped ${a.status !== 'alive' ? 'gone' : ''}"><div class="role">${role}</div><a class="nm link" data-id="${a.id}">${G.esc(a.name)}</a>
      <div class="bs">${this.badgesFrame(a, null, true)}${mainT.map((t) => this.badge(a, t.k, t.r, true)).join('')}</div></div>`;
  },
  parentsOf(ref) {
    if (!ref || ref.external) return [null, null];
    const a = G.S.animals[ref.id];
    if (!a) return [null, null];
    return [a.sire, a.dam ? { id: a.dam } : null];
  },
  detailFamily(body, a, w) {
    const sire = a.sire, dam = a.dam ? { id: a.dam } : null;
    const [ss, sd] = this.parentsOf(sire);
    const [ds, dd] = this.parentsOf(dam);
    const kids = a.children.map((id) => G.S.animals[id]).filter(Boolean);
    body.innerHTML = `<div class="pedigree">
      <div class="col">${this.pedBox({ id: a.id }, '本人')}</div>
      <div class="col">${this.pedBox(sire, '父')}${this.pedBox(dam, '母')}</div>
      <div class="col">${this.pedBox(ss, '父父')}${this.pedBox(sd, '父母')}${this.pedBox(ds, '母父')}${this.pedBox(dd, '母母')}</div>
    </div>
    <h3>産子・後代</h3>
    <div class="kids">${kids.length ? kids.map((k) => `<a class="kid link ${k.status !== 'alive' ? 'gone' : ''}" data-id="${k.id}">${G.esc(k.name)} <small>${k.sex === 'M' ? '♂' : '♀'}</small></a>`).join('') : '<span class="muted">—</span>'}</div>`;
    $$('.link', body).forEach((l) => l.onclick = () => {
      if (l.dataset.id === a.id) return;
      G.audio.sfx('page');
      this.openDetail(l.dataset.id, { tab: 'basic' });
    });
  },
  detailRelations(body, a) {
    const r = G.rel.compute(a);
    const dev = G.S.devMode;
    const line = (l) => {
      const e = G.text.get(l.id);
      const txt = e ? G.text.fill(e.text, G.textVars(a, { partner: l.b.name })) : `［${l.id}］`;
      G.S.readTexts[l.id] = true;
      return `<li><span class="rel-txt">${G.esc(txt)}</span><span class="rel-v">${G.esc(l.b.name)}への好感 ${l.v > 0 ? '+' : '−'}${Math.abs(l.v)}</span>${dev ? `<code>${l.id}</code>` : ''}</li>`;
    };
    const hearts = (m) => {
      if (m.total < 0) return `<span class="x">✕</span> −${Math.abs(m.total)}`;
      return `<span class="h1">${'♡'.repeat(Math.max(0, Math.min(10, m.like)))}</span><span class="h2">${'♥'.repeat(m.interest)}</span> +${m.total}`;
    };
    body.innerHTML = a.status !== 'alive' ? '<div class="muted">—</div>' : `<div class="rel-box">
      <div class="rel-label">💞 関係値（推定）</div>
      <h4>${G.esc(a.name)}の関係の内訳</h4>
      <ul class="rel-lines">${r.lines.map(line).join('') || '<li class="muted">—</li>'}</ul>
      ${r.interest ? `<h4>繁殖関心</h4><div class="rel-int"><span class="h2">${'♥'.repeat(r.interest)}</span> +${r.interest}</div>` : ''}
      <h4>${G.esc(a.name)}の関係（合計）</h4>
      <ul class="rel-totals">${r.totals.map((m) => `<li><a class="link" data-id="${m.b.id}">${G.esc(m.b.name)}</a><small>（${G.rel.category(m.b)}）</small><b>${hearts(m)}</b></li>`).join('')}
      ${r.others ? `<li><span>その他の成熟雌</span><b><span class="h2">${'♥'.repeat(r.others)}</span> +${r.others}</b></li>` : ''}
      ${!r.totals.length && !r.others ? '<li class="muted">—</li>' : ''}</ul></div>`;
    $$('.link', body).forEach((l) => l.onclick = () => { G.audio.sfx('page'); this.openDetail(l.dataset.id, { tab: 'rel' }); });
  },
  detailHistory(body, a) {
    const hist = a.history.slice().reverse();
    body.innerHTML = `<h3>日誌</h3><div class="diaries">${a.diaries.length ? a.diaries.map((d, i) => `<button class="btn small diary" data-i="${i}">📔 ${G.dateText(d.turn)}　${G.esc(d.title)}</button>`).join('') : '<span class="muted">—</span>'}</div>
      <h3>履歴</h3><ul class="history">${hist.map((h) => `<li><span>${G.dateText(h.turn)}</span>${G.esc(h.text)}</li>`).join('') || '<li class="muted">—</li>'}</ul>`;
    $$('.diary', body).forEach((b) => b.onclick = () => {
      const d = a.diaries[+b.dataset.i];
      G.novel.play({ paras: d.paras, vars: d.vars, ledger: d.ledger, aid: a.id });
    });
  },

  // 去勢・交配の画面は ui-choice.js

  // 人物の1行（窓の中に出す）
  npcLineHtml(person) {
    const id = G.npcLine(person);
    if (!id) return '';
    G.S.readTexts[id] = true;
    return `<div class="npc-line"><b>${G.NPC_NAMES[person]}</b><span>${G.esc(G.text.fill(G.text.get(id).text, { date: G.dateText(G.S.turn) }))}</span>${G.S.devMode ? `<code>${id}</code>` : ''}</div>`;
  },

  // ---------- 出荷・売却 ----------
  confirmShip(a) {
    const v = G.shipValue(a);
    const w = this.open(`<h2>出荷</h2><div class="ship-confirm"><canvas class="portrait" width="160" height="160"></canvas>
      <div><div class="big-name">${G.esc(a.name)}</div>
      <div class="kv"><span>枝肉（予測）</span><b>${v.carcass}kg</b></div>
      <div class="kv"><span>肉量</span><b>${G.rankName(v.yieldRank)}</b></div><div class="kv"><span>肉質</span><b>${G.rankName(v.q)}</b></div>
      <div class="kv"><span>売上（予測）</span><b>${G.yen(v.sales)}</b></div></div></div>
      ${a.form === 'taur' ? `<div class="sheet-sec"><div class="sec-label">上半身</div>${this.pickChips([{ value: 'petfood', label: 'ペットフード原料' }, { value: 'burial', label: '埋葬' }], 'data-upper')}</div>` : ''}
      <div class="actions"><button class="btn primary ok" ${a.form === 'taur' ? 'disabled' : ''}>出荷する</button><button class="btn cancel">やめる</button></div>`, { size: 'medium' });
    G.draw.portrait($('canvas', w), a);
    let upper = null;
    $$('[data-upper]', w).forEach((b) => b.onclick = () => {
      upper = b.dataset.upper;
      $$('[data-upper]', w).forEach((x) => x.classList.toggle('on', x === b));
      $('.ok', w).disabled = false;
    });
    $('.cancel', w).onclick = () => this.close(w);
    $('.ok', w).onclick = () => {
      this.closeAll();
      G.shipScreen.start(a, { upper });
    };
  },
  confirmSell(a) {
    const price = G.sellPrice(a);
    this.confirm('売却', `<div class="kv"><span>${G.esc(a.name)}</span><b>${G.yen(price)}</b></div>`, '売却する', () => {
      G.sell(a);
      this.markNoticesDone(null, a.id);
      this.closeAll();
      this.refreshHud();
    });
  },
  refreshOpenDetail() {
    const w = this.modals.find((m) => m.dataset.detail);
    if (w) { const a = G.S.animals[w.dataset.detail]; if (a) this.renderDetail(w, a, w.dataset.tab || 'basic'); }
    const mk = this.modals.find((m) => m.dataset.milk);
    if (mk) this.renderMilk(mk);
    const o = this.modals.find((m) => m.dataset.office);
    if (o) this.renderOffice(o, o.dataset.office, o.dataset.pid);
  },

  // ---------- 事務所 ----------
  openOffice(tab, pid) {
    const w = this.open('<h2>🏠 事務所</h2><div class="office-layout"><nav class="office-nav"></nav><div class="tab-body office-body"></div></div>', { size: 'large', cls: 'office' });
    this.renderOffice(w, tab || 'notice', pid);
  },
  renderOffice(w, tab, pid) {
    w.dataset.office = tab;
    w.dataset.pid = pid || '';
    const pending = G.S.notices.filter((n) => !n.done).length;
    const tabs = [['notice', '🔔', '通知', pending], ['list', '🐮', '個体一覧'], ['breed', '💞', '繁殖'], ['race', '🏇', 'レース'], ['ledger', '📒', '帳簿'], ['money', '💰', '収支'], ['facility', '🏡', '施設'], ['staff', '🧑‍🌾', '厩務員'], ['storage', '📦', '倉庫'], ['archive', '📚', 'アーカイブ'], ['records', '🏅', '牧場の記録']];
    $('.office-nav', w).innerHTML = tabs.map(([k, ic, n, c]) => `<button class="nav-item ${k === tab ? 'on' : ''}" data-tab="${k}"><span class="ni">${ic}</span><span class="nt">${n}</span>${c ? `<i class="nb">${c}</i>` : ''}</button>`).join('');
    $$('.office-nav .nav-item', w).forEach((b) => b.onclick = () => { G.audio.sfx('page'); this.renderOffice(w, b.dataset.tab); });
    const on = $('.office-nav .nav-item.on', w);
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const body = $('.office-body', w);
    const S = G.S;
    if (tab === 'notice') {
      const list = S.notices.slice().reverse();
      body.innerHTML = list.length ? `<ul class="notice-list">${list.map((n) => `<li class="${n.done ? 'done' : 'new'}">${n.aid && G.S.animals[n.aid] ? `<canvas class="a-face sm" data-face="${n.aid}" width="72" height="72"></canvas>` : ''}<div class="txt"><span class="date">${G.dateText(n.turn)}</span>${n.title ? `<b>${G.esc(n.title)}</b> ` : ''}${G.esc(n.text)}</div>${this.noticeAction(n) ? `<button class="btn small ${n.done ? '' : 'primary'}" data-n="${n.id}">${this.noticeAction(n)}</button>` : ''}</li>`).join('')}</ul>` : '<div class="muted">—</div>';
      this.drawFaces(body);
      $$('[data-n]', body).forEach((b) => b.onclick = () => this.doNotice(S.notices.find((n) => n.id === +b.dataset.n)));
    }
    if (tab === 'list') {
      const ps = Object.keys(S.pastures).filter((p) => S.pastures[p].open);
      const filt = pid && S.pastures[pid] ? pid : '';
      const idleOnly = pid === 'idle';
      const list = G.alive().filter((a) => (idleOnly ? ['idle', 'peak'].includes(G.prodState(a)) : (!filt || a.pasture === filt))).sort((x, y) => x.pasture.localeCompare(y.pasture) || y.age - x.age);
      body.innerHTML = `<div class="filter">${['', ...ps].map((p) => `<button class="chip ${p === filt && !idleOnly ? 'on' : ''} ${p && G.pastureExcess(p) ? 'crowd' : ''}" data-p="${p}">${p ? `${G.MAP_LABEL[p]} ${G.pastureCount(p)}/${G.pastureCap(p)}` : 'すべて'}</button>`).join('')}<button class="chip ${idleOnly ? 'on' : ''}" data-p="idle">生産なし</button><span class="count">🐮 ${G.herdCount('cattle')}/${S.cattleSlots}${S.horseSlots ? `　🐴 ${G.herdCount('horse')}/${S.horseSlots}` : ''}</span></div>
        <div class="a-list">${list.map((a) => { const ps = G.prodState(a); return this.animalRow(a, `<span class="st">${this.breedStatus(a)}</span><span class="row-pills">${ps === 'idle' || ps === 'peak' ? '<span class="pill idle">生産なし</span>' : ''}${!G.isHorse(a) && a.age >= G.C.cattleShipAgeMin ? '<span class="pill">出荷適期</span>' : ''}<span class="trend t${G.valueTrend(a)}">見込み ${['↓', '→', '↑'][G.valueTrend(a) + 1]}</span></span>`); }).join('') || '<div class="muted">—</div>'}</div>`;
      this.drawFaces(body);
      $$('.a-row', body).forEach((r) => r.onclick = () => this.openDetail(r.dataset.id));
      $$('[data-p]', body).forEach((b) => b.onclick = () => this.renderOffice(w, 'list', b.dataset.p));
    }
    if (tab === 'breed') {
      const fem = G.alive().filter((a) => a.sex === 'F' && G.isMature(a));
      body.innerHTML = `<div class="a-list">${fem.map((a) => this.animalRow(a, `<span class="st">${this.breedStatus(a)}${a.openTurns > 1 && !a.pregnancy ? `<br>空胎 ${a.openTurns}ターン` : ''}</span>${G.canBreed(a) ? `<button class="btn small primary" data-b="${a.id}">💞 交配</button>` : ''}`)).join('') || '<div class="muted">—</div>'}</div>
        <h3>精液ストロー（在庫）</h3>
        <div class="straws">${S.straws.length ? S.straws.map((s) => `<div class="straw"><b>${G.esc(s.name)}</b> <small>${G.TRAITS[s.main].name}期待${G.rankName(s.rank)}</small><div class="bs">${this.badgesFrame(null, s.genes, true)}${this.badgesTraits(null, s.genes, true)}</div></div>`).join('') : '<span class="muted">—</span>'}</div>`;
      this.drawFaces(body);
      $$('[data-b]', body).forEach((b) => b.onclick = (e) => { e.stopPropagation(); this.openBreed(S.animals[b.dataset.b]); });
      $$('.a-row', body).forEach((r) => r.onclick = () => this.openDetail(r.dataset.id));
    }
    if (tab === 'race') this.renderRaceTab(w, body);
    if (tab === 'ledger') {
      const groups = {};
      for (const e of S.ledger) (groups[e.turn] = groups[e.turn] || []).push(e);
      const turns = Object.keys(groups).map(Number).sort((a, b) => b - a);
      body.innerHTML = turns.length ? turns.map((t) => `<div class="ledger-group"><h4>${G.dateText(t)}</h4>${groups[t].slice().reverse().map((e) => `<div class="ledger-line ${e.amount > 0 ? 'in' : e.amount < 0 ? 'out' : ''}">${e.lines.map((l) => `<div>${G.esc(l)}</div>`).join('')}</div>`).join('')}</div>`).join('') : '<div class="muted">—</div>';
    }
    if (tab === 'money') {
      const fb = G.feedBalance();
      const cm = G.crowdMult();
      const feed = Math.round(fb.cost * cm);
      const up = G.upkeepBreakdown();
      up.total = Math.round(up.total * cm);
      const milkInc = S.milkSlots.reduce((s, x) => s + (x.aid && S.animals[x.aid] ? G.milk.calc(S.animals[x.aid]).income : 0), 0);
      const cropInc = S.fields.reduce((s, f) => s + G.field.produce(f).money, 0);
      const thisTurn = S.ledger.filter((e) => e.turn === S.turn);
      const inc = thisTurn.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
      const exp = -thisTurn.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0);
      body.innerHTML = `<div class="stat-strip big"><div><span>所持金</span><b>${G.yen(S.money)}</b></div><div><span>借入金</span><b>${G.yen(S.loan)}</b></div><div><span>年次返済（冬）</span><b>${G.yen(Math.min(G.C.yearlyRepay, S.loan))}</b></div><div><span>今年の売上</span><b>${G.yen(S.yearSales)}</b></div></div>
        <div class="summary">
          <div class="sum-col in"><div class="sum-title">今季の生産（見込み）</div>
            <div class="sum-row in"><span class="si">🥛</span><span class="sn">搾乳</span><b>${G.yen(milkInc)}</b></div>
            <div class="sum-row in"><span class="si">🌾</span><span class="sn">畑</span><b>${G.yen(cropInc)}</b></div>
            ${fb.surplusIncome ? `<div class="sum-row in"><span class="si">🌱</span><span class="sn">飼料 売却</span><b>${G.yen(fb.surplusIncome)}</b></div>` : ''}
            <div class="sum-row in total"><span class="si">✨</span><span class="sn">今季の収入（現在）</span><b>${G.yen(inc)}</b></div></div>
          <div class="sum-col out"><div class="sum-title">今季の維持費（見込み）<b>${G.yen(feed + up.total + G.C.staffWage)}</b></div>
            <div class="sum-row out"><span class="si">🌾</span><span class="sn">飼料費<small>必要 ${fb.need}・自給 ${fb.self}単位</small></span><b>${G.yen(feed)}</b></div>
            <div class="sum-row out"><span class="si">🏡</span><span class="sn">施設維持費</span><b>${G.yen(up.total)}</b></div>
            <div class="sum-row out"><span class="si">🧑‍🌾</span><span class="sn">人件費</span><b>${G.yen(G.C.staffWage)}</b></div>
            <div class="sum-row out total"><span class="si">📒</span><span class="sn">今季の支出（現在）</span><b>${G.yen(exp)}</b></div></div>
        </div>`;
    }
    if (tab === 'facility') {
      body.innerHTML = `<div class="kv"><span>飼育枠（牛）</span><b>${G.herdCount('cattle')}/${S.cattleSlots}</b></div>
        <div class="kv"><span>飼育枠（馬）</span><b>${G.herdCount('horse')}/${S.horseSlots}</b></div>
        <h3>放牧地・畜舎</h3>
        <ul class="facility">${Object.keys(S.pastures).map((p) => `<li><b>${G.pastureLabel(p)}</b>${S.pastures[p].open ? `<span class="${G.pastureExcess(p) ? 'crowd-text' : ''}">${G.pastureCount(p)}/${G.pastureCap(p)}頭　段階${G.pastureStage(p)}${G.pastureExcess(p) ? '　過密' : ''}</span><button class="btn small" data-open="${p}">${G.expandCost(p) !== undefined ? '拡張' : '開く'}</button>` : `<span>${G.costText(G.pastureOpenCost())}　飼育枠 +${G.C.pastureOpenSlots}</span><button class="btn small primary" data-open="${p}">開拓</button>`}</li>`).join('')}</ul>
        <h3>搾乳施設</h3>
        <div class="kv"><span>スロット</span><b>${S.milkSlots.filter((x) => x.aid).length}/${S.milkSlots.length}　<button class="btn small" data-go="milk">開く</button></b></div>
        <h3>畑</h3>
        <ul class="facility">${S.fields.map((f, i) => `<li><b>畑スロット${G.field.label(i)}</b><span>${f.open ? (f.use === 'crop' ? '商業作物' : '牧草') : '荒れ地'}</span><button class="btn small" data-field="${i}">開く</button></li>`).join('')}</ul>`;
      $$('[data-open]', body).forEach((b) => b.onclick = () => this.openExpand(b.dataset.open));
      $$('[data-go]', body).forEach((b) => b.onclick = () => this.openMilk());
      $$('[data-field]', body).forEach((b) => b.onclick = () => this.openField(+b.dataset.field));
    }
    if (tab === 'staff') {
      const ps = Object.keys(S.pastures).filter((p) => S.pastures[p].open);
      body.innerHTML = ['girl', 'boy'].map((k) => `<div class="staff-card ${k}"><canvas class="staff-avatar" data-person="${k}" width="120" height="120"></canvas>
        <div class="staff-main"><input class="text-input" data-name="${k}" maxlength="10" value="${G.esc(S.staff[k].name)}">
        <div class="sec-label">担当放牧地</div>${this.pickChips(ps.map((p) => ({ value: `${k}|${p}`, label: G.MAP_LABEL[p], on: S.staff[k].pasture === p })), 'data-sp')}</div></div>`).join('');
      $$('canvas[data-person]', body).forEach((c) => G.skin.personPortrait(c, c.dataset.person));
      $$('[data-name]', body).forEach((i) => i.onchange = () => { const v = i.value.trim(); if (v) S.staff[i.dataset.name].name = v; });
      $$('[data-sp]', body).forEach((b) => b.onclick = () => { const [k, p] = b.getAttribute('data-sp').split('|'); S.staff[k].pasture = p; G.audio.sfx('click'); this.renderOffice(w, 'staff'); });
    }
    if (tab === 'storage') this.renderStorage(w, body);
    if (tab === 'archive') {
      const list = Object.values(S.animals).filter((a) => a.status !== 'alive').sort((x, y) => (y.endTurn || 0) - (x.endTurn || 0));
      body.innerHTML = `<div class="a-list">${list.map((a) => this.animalRow(a, `<span class="st">${this.breedStatus(a)}　${G.dateText(a.endTurn)}</span><small>${a.idNo}　${a.castration ? `${G.PERIOD_NAMES[a.castration.period]}・${G.METHOD_SHORT[a.castration.method]}` : '—'}</small><b>${a.shipped ? G.yen(a.shipped.sales) : a.soldPrice ? G.yen(a.soldPrice) : ''}</b>`)).join('') || '<div class="muted">—</div>'}</div>`;
      this.drawFaces(body);
      $$('.a-row', body).forEach((r) => r.onclick = () => this.openDetail(r.dataset.id));
    }
    if (tab === 'records') {
      body.innerHTML = `<ul class="records">${G.RECORDS.map(([k, n]) => `<li class="${S.records[k] ? 'got' : ''}"><span class="medal">${S.records[k] ? '🏅' : '・'}</span>${S.records[k] ? n : '？？？'}<small>${S.records[k] ? G.dateText(S.records[k].turn) : ''}</small></li>`).join('')}</ul>`;
    }
  },
  // 拡張ボタン：木材だけ足りないときは、不足分を買ってそのまま拡張できる
  costBtn(cost, label, cls, attr = '') {
    if (G.canPayCost(cost)) return `<button class="btn primary ${cls}" ${attr}>${label}</button>`;
    if (G.canBuyAndPay(cost)) {
      const n = G.woodShort(cost);
      return `<button class="btn primary ${cls} buywood" ${attr} data-buywood="1">🪵${n}を買って${label}<small>${G.yen(n * G.C.woodBuyPrice)}</small></button>`;
    }
    return `<button class="btn primary ${cls}" ${attr} disabled>${label}</button>`;
  },
  // 木材を買う選択だったら、先に不足分を買う
  payPrep(btn, cost) { return !btn.dataset.buywood || G.buyShortWood(cost); },
  openExpand(pid) {
    const S = G.S;
    if (S.pastures[pid].open) { this.openPasture(pid); return; }
    const horse = G.pastureSpecies(pid) === 'horse';
    const cost = G.pastureOpenCost();
    const w = this.open(`<h2>⛰ ${G.HILL_LABEL[pid]}</h2>
      <div class="kv"><span>開拓</span><b>${G.costText(cost)}</b></div>
      <div class="kv"><span>${horse ? '飼育枠（馬）' : '飼育枠（牛）'}</span><b>+${G.C.pastureOpenSlots}</b></div>
      <div class="kv"><span>維持費</span><b>+${G.yen(G.C.pastureUpkeep)}／ターン</b></div>
      <div class="actions">${this.costBtn(cost, '開拓する', 'ok')}<button class="btn cancel">やめる</button></div>`, { size: 'small' });
    $('.cancel', w).onclick = () => this.close(w);
    $('.ok', w).onclick = (e) => {
      if (!this.payPrep(e.currentTarget, cost) || !G.openPasture(pid)) return;
      this.closeAll();
      G.map.buildBlocks();
      const p = G.MAP.pastures[pid];
      for (let i = 0; i < 5; i++) setTimeout(() => G.map.burst(p.x + Math.random() * p.w, p.y + Math.random() * p.h, ['🌱', '✨', '🌼'], 8), i * 120);
      G.audio.sfx('fanfare');
      this.refreshHud();
    };
  },

  // 木こり小屋：お世話の回数を木材に
  openLumber() {
    const w = this.open('<div class="lumber-body"></div>', { size: 'small' });
    const render = () => {
      const S = G.S, left = S.careLeft, per = G.C.woodPerCare;
      $('.lumber-body', w).innerHTML = `<h2>🪓 木こり小屋</h2>
        <div class="stat-strip"><div><span>お世話の残り</span><b>${left}</b></div><div><span>木材</span><b>🪵${S.wood || 0}</b></div></div>
        <div class="work-btns">${[1, 2, 3, 4, 5].filter((n) => n <= left).map((n) => `<button class="btn ${n === left ? 'primary' : ''}" data-lw="${n}">${n}回　🪵+${n * per}</button>`).join('') || '<span class="muted">—</span>'}</div>`;
      $$('[data-lw]', w).forEach((b) => b.onclick = () => {
        if (!G.lumberWork(+b.dataset.lw)) return;
        G.audio.sfx('coin');
        const h = G.MAP.lumber;
        G.map.burst(h.x + h.w / 2, h.y + h.h / 2, ['🪵', '✨'], 8);
        render(); this.refreshHud();
      });
    };
    render();
  },

  // 開拓済みの放牧地：頭数・段階・拡張
  openPasture(pid) {
    const S = G.S;
    const w = this.open('<div class="pasture-body"></div>', { size: 'small' });
    const render = () => {
      const cost = G.expandCost(pid);
      const body = $('.pasture-body', w);
      body.innerHTML = `<h2>${G.pastureSpecies(pid) === 'horse' ? '🐴' : '🐮'} ${G.MAP_LABEL[pid]}</h2>
        <div class="stat-strip"><div><span>頭数</span><b class="${G.pastureExcess(pid) ? 'crowd-text' : ''}">${G.pastureCount(pid)}/${G.pastureCap(pid)}</b></div><div><span>段階</span><b>${G.pastureStage(pid)}/${G.C.pastureExpandCost.length}</b></div></div>
        ${cost !== undefined ? `<div class="kv"><span>拡張</span><b>${G.costText(cost)}</b></div>
        <div class="kv"><span>飼育枠</span><b>+${G.C.pastureExpandSlots}</b></div>
        <div class="kv"><span>維持費</span><b>+${G.yen(G.C.pastureUpkeepPerStage)}／ターン</b></div>` : ''}
        <div class="actions">${cost !== undefined ? `${this.costBtn(cost, '拡張する', 'ok')}` : ''}<button class="btn list">個体一覧</button></div>`;
      const ok = $('.ok', body);
      if (ok) ok.onclick = () => {
        if (!this.payPrep(ok, cost) || !G.expandPasture(pid)) return;
        const p = G.MAP.pastures[pid];
        for (let i = 0; i < 4; i++) setTimeout(() => G.map.burst(p.barn.x + Math.random() * p.barn.w, p.barn.y + Math.random() * p.barn.h, ['✨', '🌾', '⭐'], 8), i * 120);
        G.audio.sfx('fanfare');
        render(); this.refreshHud(); this.refreshOpenDetail();
      };
      $('.list', body).onclick = () => { this.close(w); this.openOffice('list', pid); };
    };
    render();
  },

  // ---------- 町 ----------
  openTown(tab) {
    const w = this.open('<h2>🏪 町</h2><div class="tabs town-tabs"></div><div class="tab-body town-body"></div>', { size: 'large' });
    this.renderTown(w, tab || 'market');
  },
  renderTown(w, tab) {
    const S = G.S;
    const tabs = [['market', '家畜市場'], ['straw', '精液ストロー'], ['stallion', '外部種牡馬'], ['vet', '獣医'], ['work', '手伝い'], ['wood', '木材'], ['senior', '先輩牧場主' + (G.senior.needed() ? ' ❗' : '')]];
    $('.town-tabs', w).innerHTML = tabs.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''} ${k === 'senior' && G.senior.needed() ? 'alert' : ''}" data-tab="${k}">${n}</button>`).join('');
    $$('.town-tabs .tab', w).forEach((b) => b.onclick = () => { G.audio.sfx('page'); this.renderTown(w, b.dataset.tab); });
    const body = $('.town-body', w);
    if (tab === 'market') {
      if (!w.dataset.dealer) w.dataset.dealer = this.npcLineHtml('dealer') || ' ';
      body.innerHTML = `${w.dataset.dealer.trim()}<div class="kv"><span>飼育枠</span><b>🐮 ${G.herdCount('cattle')}/${S.cattleSlots}　🐴 ${G.herdCount('horse')}/${S.horseSlots}</b></div>
        <div class="cards">${S.market.map((m, i) => `<div class="card market"><canvas class="a-face" data-mk="${i}" width="96" height="96"></canvas><div class="card-h"><b>${G.SPECIES[m.species || 'cattle'].icon} ${m.sex === 'M' ? '♂' : '♀'} ${G.SPECIES[m.species || 'cattle'].name}</b><small>${m.form && m.form !== 'normal' ? G.FORMS[m.form].name + '　' : ''}${G.ageText(m.age)}　${m.personality}</small></div>
        <div class="badge-row"><span class="lbl">体格</span>${this.badgesFrame({ sex: m.sex, castrated: false }, m.genes, true)}</div>
        <div class="badge-row"><span class="lbl">特性</span>${this.badgesTraits({ sex: m.sex, castrated: false }, m.genes, true)}</div>
        <div class="card-f"><b>${G.yen(m.price)}</b><button class="btn small primary" data-buy="${i}" ${S.money < m.price || (G.FORMS[m.form || 'normal'].slot ? !G.pastureWithRoom(m.species || 'cattle') : !G.openPastures(m.species || 'cattle').length) ? 'disabled' : ''}>購入</button></div></div>`).join('') || '<div class="muted">—</div>'}</div>`;
      $$('canvas[data-mk]', body).forEach((c) => { const m = S.market[+c.dataset.mk]; G.draw.portrait(c, { id: m.key, idNo: '', species: m.species || 'cattle', form: m.form, sex: m.sex, age: m.age, castrated: false, personality: m.personality }); });
      $$('[data-buy]', body).forEach((b) => b.onclick = () => {
        const a = G.buy(S.market[+b.dataset.buy]);
        if (a) { G.audio.sfx('coin'); this.renderTown(w, 'market'); this.refreshHud(); }
      });
    }
    if (tab === 'straw') {
      body.innerHTML = `<div class="cards">${S.strawCatalog.map((s, i) => `<div class="card ${s.rank === 4 ? 'premium' : ''}"><div class="card-h"><b>${G.esc(s.name)}</b><small>${G.TRAITS[s.main].name}期待${G.rankName(s.rank)}</small></div>
        <div class="badge-row"><span class="lbl">体格</span>${this.badgesFrame(null, s.genes, true)}</div>
        <div class="badge-row"><span class="lbl">特性</span>${this.badgesTraits(null, s.genes, true)}</div>
        <div class="card-f"><b>${G.yen(s.price)}</b><button class="btn small primary" data-s="${i}" ${S.money < s.price ? 'disabled' : ''}>購入</button></div></div>`).join('') || '<div class="muted">—</div>'}</div>
        <h3>在庫</h3><div class="straws">${S.straws.length ? S.straws.map((s) => `<span class="pill">${G.esc(s.name)}（${G.TRAITS[s.main].name}期待${G.rankName(s.rank)}）</span>`).join('') : '<span class="muted">—</span>'}</div>`;
      $$('[data-s]', body).forEach((b) => b.onclick = () => {
        if (G.buyStraw(S.strawCatalog[+b.dataset.s])) { G.audio.sfx('coin'); this.renderTown(w, 'straw'); this.refreshHud(); }
      });
    }
    if (tab === 'stallion') {
      body.innerHTML = `<div class="cards">${S.stallions.map((s) => `<div class="card ${s.rank === 4 ? 'premium' : ''}"><div class="card-h"><b>${G.esc(s.name)}</b><small>${s.type === 'farm' ? '農耕' : '競走'}　${G.TRAITS[s.main].name}${G.rankName(s.rank)}</small></div>
        <div class="badge-row"><span class="lbl">体格</span>${this.badgesFrame(null, s.genes, true)}</div>
        <div class="badge-row"><span class="lbl">特性</span>${this.badgesTraits(null, s.genes, true)}</div>
        <div class="card-f"><span class="muted">種付け料</span><b>${G.yen(s.fee)}</b></div></div>`).join('')}</div>`;
    }
    if (tab === 'work') {
      const left = S.careLeft;
      body.innerHTML = `<div class="work"><div class="work-icon">🧺</div><div class="work-main"><div class="work-title">他の牧場の手伝い</div>
        <div class="mini-stats"><div><span>お世話の残り</span><b>${left}</b></div><div class="big"><span>1回あたり</span><b>${G.yen(G.C.sideWorkWage)}</b></div></div>
        <div class="work-btns">${[1, 2, 3, 4, 5].filter((n) => n <= left).map((n) => `<button class="btn ${n === left ? 'primary' : ''}" data-work="${n}">${n}回　${G.yen(n * G.C.sideWorkWage)}</button>`).join('') || '<span class="muted">—</span>'}</div></div></div>`;
      $$('[data-work]', body).forEach((b) => b.onclick = () => { if (G.sideWork(+b.dataset.work)) { this.renderTown(w, 'work'); this.refreshHud(); } });
    }
    if (tab === 'wood') {
      const have = S.wood || 0;
      const row = (k, ns, price, ok) => ns.map((n) => `<button class="btn" data-${k}="${n}" ${ok(n) ? '' : 'disabled'}>${n}　${G.yen(n * price)}</button>`).join('');
      body.innerHTML = `<div class="work"><div class="work-icon">🪵</div><div class="work-main"><div class="work-title">木材</div>
        <div class="mini-stats"><div class="big"><span>在庫</span><b>${have}</b></div><div><span>買う（1）</span><b>${G.yen(G.C.woodBuyPrice)}</b></div><div><span>売る（1）</span><b>${G.yen(G.C.woodSellPrice)}</b></div></div>
        <div class="work-sub">買う</div><div class="work-btns">${row('buy', [5, 10, 50, 100], G.C.woodBuyPrice, (n) => S.money >= n * G.C.woodBuyPrice)}</div>
        <div class="work-sub">売る</div><div class="work-btns">${row('sell', [5, 10, 50], G.C.woodSellPrice, (n) => have >= n)}${have && ![5, 10, 50].includes(have) ? `<button class="btn" data-sell="${have}">${have}　${G.yen(have * G.C.woodSellPrice)}</button>` : ''}</div></div></div>`;
      $$('[data-buy]', body).forEach((b) => b.onclick = () => { if (G.buyWood(+b.dataset.buy)) { G.audio.sfx('coin'); this.renderTown(w, 'wood'); this.refreshHud(); } });
      $$('[data-sell]', body).forEach((b) => b.onclick = () => { if (G.sellWood(+b.dataset.sell)) { G.audio.sfx('coin'); this.renderTown(w, 'wood'); this.refreshHud(); } });
    }
    if (tab === 'senior') {
      const need = G.senior.needed();
      body.innerHTML = `<div class="senior ${need ? 'alert' : ''}"><canvas class="senior-avatar" data-person="senior" width="172" height="172"></canvas>
        <div class="senior-main"><div class="senior-name">先輩牧場主</div>
        <div class="senior-btns"><button class="btn" data-sr="advice">💬 話を聞く</button>
        ${need ? '<button class="btn primary rescue" data-sr="rescue">❗ 再建を手伝ってもらう</button>' : ''}</div></div></div>`;
      $$('canvas[data-person]', body).forEach((c) => G.skin.personPortrait(c, c.dataset.person));
      $$('[data-sr]', body).forEach((b) => b.onclick = () => {
        if (b.dataset.sr === 'advice') { const ev = G.senior.advice(); if (ev.paras.length) G.novel.play(ev); return; }
        const ev = G.senior.rescue();
        if (!ev) return;
        G.audio.sfx('fanfare');
        this.renderTown(w, 'senior');
        this.refreshHud();
        G.novel.play(ev);
      });
    }
    if (tab === 'vet') {
      const items = [['early', '早期'], ['standard', '標準'], ['late', '晩期'], ['mature', '高齢'], ['ring', 'ゴムリング法'], ['burdizzo', '去勢鉗子法'], ['surgical', '観血法'], ['traditional', '旧来手法'], ['horse', '馬']];
      body.innerHTML = `<div class="vet"><div class="vet-icon">🩺</div><div class="vet-list">${items.map(([k, n]) => `<button class="btn" data-v="${k}">${n}</button>`).join('')}</div></div>`;
      $$('[data-v]', body).forEach((b) => b.onclick = () => {
        const id = 'vet.advice.' + b.dataset.v;
        if (G.text.get(id)) G.novel.play({ paras: [id], vars: { date: G.dateText(S.turn) }, ledger: null });
      });
    }
  },

  // ---------- 案内看板 ----------
  openWarp() {
    const M = G.MAP;
    const dests = [
      ['🏠 事務所', M.office.x + M.office.w / 2, M.office.y + M.office.h + 40],
      ...Object.keys(M.pastures).map((p) => [`${G.S.pastures[p].open ? '🐮' : '⛰'} ${G.pastureLabel(p)}`, G.gateOf(p).out.x, G.gateOf(p).out.y]),
      ['🥛 搾乳施設', M.milk.x + M.milk.w / 2, M.milk.y + M.milk.h + 40],
      [G.S.fields.some((f) => f.open) ? '🌾 畑' : '🌾 荒れ地', M.fieldBlocks[0].x - 40, M.fieldBlocks[0].y + M.fieldBlocks[0].h / 2],
      ['🪓 木こり小屋', M.lumber.x + M.lumber.w / 2, M.lumber.y + M.lumber.h + 40],
      ['🏪 町への道', M.townExit.x, M.townExit.y],
    ];
    const w = this.open(`<h2>🪧 案内看板</h2><div class="warp">${dests.map((d, i) => `<button class="btn" data-w="${i}">${d[0]}</button>`).join('')}</div>`, { size: 'small' });
    $$('[data-w]', w).forEach((b) => b.onclick = () => { const d = dests[+b.dataset.w]; this.close(w); G.map.warp(d[1], d[2]); });
  },

  // 開発者モード：フォームの個体を作る（子・空きのある放牧地へ）
  openDevForm() {
    const st = { species: 'cattle', form: 'telepathy', sex: 'F' };
    const w = this.open('<h2>フォームの個体を作る</h2><div class="dev-form"></div>', { size: 'small' });
    const render = () => {
      const chips = (k, list) => `<div class="chips">${list.map(([v, l]) => `<button class="chip ${st[k] === v ? 'on' : ''}" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
      $('.dev-form', w).innerHTML = chips('species', [['cattle', G.SPECIES.cattle.name], ['horse', G.SPECIES.horse.name]])
        + chips('form', G.FORM_KEYS.map((f) => [f, G.FORMS[f].name]))
        + chips('sex', [['F', '♀'], ['M', '♂']])
        + '<div class="actions"><button class="btn primary ok">作る</button></div>';
      $$('[data-k]', w).forEach((b) => b.onclick = () => { st[b.dataset.k] = b.dataset.v; render(); });
      $('.ok', w).onclick = () => {
        const pid = G.pastureWithRoom(st.species) || G.openPastures(st.species)[0];
        if (!pid) return;
        const a = G.makeAnimal({ species: st.species, form: st.form, sex: st.sex, age: 0, genes: G.randomGenes ? G.randomGenes(0) : { length: 1, depth: 1, traits: [] }, pasture: pid });
        G.addHistory(a, '開発者モードで作成');
        this.close(w); this.refreshHud(); this.openDetail(a.id);
      };
    };
    render();
  },
  // ---------- メニュー ----------
  openMenu() {
    const dev = G.S.devMode;
    const w = this.open(`<h2>メニュー</h2><div class="menu">
      <button class="btn" data-m="back">ゲームに戻る</button>
      <button class="btn" data-m="export">セーブデータを書き出す</button>
      <button class="btn" data-m="import">セーブデータを読み込む</button>
      <button class="btn" data-m="title">タイトル画面に戻る</button>
      <button class="btn ${dev ? 'on' : ''}" data-m="dev">開発者モードの切り替え</button>
      ${dev ? `<button class="btn dev-only" data-m="text">文章データを読み込む</button><button class="btn dev-only" data-m="reload">文章データを再読み込み</button><button class="btn dev-only" data-m="form">フォームの個体を作る</button><button class="btn dev-only" data-m="skin">スキン：${G.skin.label(G.skin.name)}</button>` : ''}
      </div>`, { size: 'small' });
    $$('[data-m]', w).forEach((b) => b.onclick = async () => {
      const m = b.dataset.m;
      if (m === 'back') this.close(w);
      if (m === 'export') { G.save.exportFile(); }
      if (m === 'import') this.pickFile('.json,application/json', async (f) => {
        const err = await G.save.importFile(f);
        if (err) this.error(err); else { this.closeAll(); G.main.startLoaded(); }
      });
      if (m === 'title') { G.save.auto(); this.closeAll(); G.main.showTitle(); }
      if (m === 'dev') { G.S.devMode = !G.S.devMode; this.close(w); this.refreshHud(); this.openMenu(); }
      if (m === 'text') this.pickFile('.json,application/json', async (f) => {
        try { const n = await G.text.importFile(f); this.toast(`${f.name}　${n}`); } catch (e) { this.error('文章データを読み込めませんでした'); }
      });
      if (m === 'form') { this.close(w); this.openDevForm(); }
      if (m === 'reload') { await G.text.load(); this.toast('文章データ ' + Object.keys(G.text.data).length); }
      if (m === 'skin') {
        const ns = G.skin.names();
        await G.skin.use(ns[(ns.indexOf(G.skin.name) + 1) % ns.length]);
        this.close(w); this.openMenu();
      }
    });
  },
  pickFile(accept, cb) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept;
    inp.onchange = () => { if (inp.files[0]) cb(inp.files[0]); };
    inp.click();
  },
  error(msg) {
    this.open(`<h2>⚠ エラー</h2><div class="confirm-body">${G.esc(msg)}</div><div class="actions"><button class="btn primary ok">OK</button></div>`, { size: 'small' });
    const w = this.modals[this.modals.length - 1];
    $('.ok', w).onclick = () => this.close(w);
  },

  // ---------- 通知 ----------
  noticeAction(n) {
    if (n.done) return n.type === 'diary' ? '読む' : (n.aid && G.S.animals[n.aid] ? '詳細' : '');
    if (n.type === 'rescue') return n.done ? '' : '町へ';
    if (n.type === 'crowd') return '個体一覧';
    if (n.type === 'newform') return n.done ? '' : '家畜市場';
    return { castrate: '今すぐ決める', breedable: '交配する', ship: '詳細', birth: '詳細', diary: '読む', death: '詳細', milkable: '搾乳施設', milklow: '再種付け', idle: '詳細', peak: '詳細', aging: '詳細' }[n.type] || '';
  },
  // 同じ種類が2頭以上なら1枚にまとめる種類
  DIGEST: {
    breedable: { label: '交配できる', act: '繁殖', tab: 'breed' },
    ship: { label: '出荷適期', act: '個体一覧', tab: 'list' },
    aging: { act: '個体一覧', tab: 'list' },
    idle: { label: '生産が止まった', act: '個体一覧', tab: 'list', pid: 'idle' },
    peak: { label: '見込み売上が伸びない', act: '個体一覧', tab: 'list', pid: 'idle' },
  },
  noticeDone(n) { return n.items ? n.items.every((i) => i.done) : n.done; },
  // 季節の始めの通知の並び（カードを出さない記録は除き、まとめられるものはまとめる）
  buildNoticeQueue() {
    const S = G.S;
    const pending = S.notices.filter((n) => !n.done && n.turn === S.turn && n.card !== false);
    const groups = {};
    for (const n of pending) if (this.DIGEST[n.type]) (groups[n.type] = groups[n.type] || []).push(n);
    const out = [];
    for (const n of pending) {
      const g = groups[n.type];
      if (!g || g.length < 2) out.push(n);
      else if (g[0] === n) out.push(this.makeDigest(n.type, g));
    }
    this.noticeQueue = out;
    this.flushNotices();
  },
  makeDigest(kind, items) {
    const names = items.map((n) => (G.S.animals[n.aid] || {}).name).filter(Boolean).join('・');
    let label = this.DIGEST[kind].label;
    if (kind === 'aging') {
      const b = items[0].badge || '';
      label = `「${b}」${items.every((n) => n.badge === b) ? '' : 'など'}が付いた`;
    }
    return { type: 'digest', kind, items, text: `${label}：${names}` };
  },
  queueNotice(n) {
    if (n.card === false) return;
    this.noticeQueue.push(n);
    if (!this.holdNotices) this.flushNotices();
  },
  flushNotices() {
    if (this.holdNotices) return;
    const box = $('#notices');
    while (this.noticeQueue.length && box.children.length < 3) {
      const n = this.noticeQueue.shift();
      if (this.noticeDone(n)) continue;
      this.showNoticeCard(n);
    }
  },
  showNoticeCard(n) {
    const box = $('#notices');
    const el = document.createElement('div');
    el.className = 'notice ' + n.type + (n.kind ? ' ' + n.kind : '');
    if (n.type === 'birth') return this.showBirthCard(n, el);
    const act = n.type === 'digest' ? this.DIGEST[n.kind].act : this.noticeAction(n);
    const second = n.type === 'birth' || n.type === 'death' ? 'OK' : 'あとで';
    const extra = n.type === 'milklow' ? '<button class="btn small c">外す</button>' : '';
    const secondLabel = n.type === 'milklow' ? 'このまま' : second;
    el.innerHTML = `${n.title ? `<div class="n-title">${G.esc(n.title)}</div>` : ''}<div class="n-text">${G.esc(n.text)}</div>
      <div class="n-btns">${act && n.type !== 'death' ? `<button class="btn small primary a">${act}</button>` : ''}${extra}<button class="btn small b">${secondLabel}</button></div>`;
    box.appendChild(el);
    if (n.type === 'birth') G.audio.sfx('fanfare'); else G.audio.sfx('notice');
    const remove = () => { el.classList.add('out'); setTimeout(() => { el.remove(); this.flushNotices(); }, 250); };
    const a = $('.a', el);
    if (a) a.onclick = () => { remove(); this.doNotice(n); };
    $('.b', el).onclick = () => { if (n.type === 'birth' || n.type === 'death' || n.type === 'milklow') n.done = true; remove(); this.refreshHud(); };
    const c = $('.c', el);
    if (c) c.onclick = () => {
      n.done = true;
      const a = G.S.animals[n.aid];
      const i = a ? G.milk.slotOf(a) : -1;
      if (i >= 0) G.milk.remove(i);
      remove(); this.refreshHud();
    };
  },
  // 出産：去勢・搾乳もこの1枚から
  showBirthCard(n, el) {
    const S = G.S, calf = S.animals[n.aid], dam = S.animals[n.dam];
    const btns = [];
    if (calf && calf.status === 'alive' && S.notices.some((x) => x.type === 'castrate' && x.aid === calf.id && !x.done)) btns.push(['castrate', '去勢を決める']);
    if (dam && G.milk.canPlace(dam)) btns.push(['milk', '搾乳施設']);
    if (calf) btns.push(['detail', '詳細']);
    el.innerHTML = `${n.title ? `<div class="n-title">${G.esc(n.title)}</div>` : ''}<div class="n-text">${G.esc(n.text)}</div>
      <div class="n-btns">${btns.map(([k, l]) => `<button class="btn small primary" data-k="${k}">${l}</button>`).join('')}<button class="btn small b">OK</button></div>`;
    $('#notices').appendChild(el);
    G.audio.sfx('fanfare');
    const remove = () => { n.done = true; el.classList.add('out'); setTimeout(() => { el.remove(); this.flushNotices(); }, 250); };
    $$('[data-k]', el).forEach((b) => b.onclick = () => {
      remove();
      if (b.dataset.k === 'castrate') this.openCastrate(calf);
      else if (b.dataset.k === 'milk') this.openMilk();
      else this.openDetail(calf.id);
      this.refreshHud();
      this.refreshOpenDetail();
    });
    $('.b', el).onclick = () => { remove(); this.refreshHud(); };
  },
  doNotice(n) {
    if (!n) return;
    if (n.type === 'digest') {
      const d = this.DIGEST[n.kind];
      if (n.kind !== 'breedable') n.items.forEach((i) => { i.done = true; });
      this.openOffice(d.tab, d.pid);
      this.refreshHud();
      return;
    }
    const a = G.S.animals[n.aid];
    if (n.type === 'diary') {
      n.done = true;
      const d = a && a.diaries[n.diary];
      if (d) G.novel.play({ paras: d.paras, vars: d.vars, ledger: d.ledger, aid: a.id });
    } else if (n.type === 'castrate' && !n.done && a && a.status === 'alive' && !a.castrated) {
      this.openCastrate(a);
    } else if (n.type === 'breedable' && !n.done && a && G.canBreed(a)) {
      this.openBreed(a);
    } else if (n.type === 'rescue') {
      this.openTown('senior');
    } else if (n.type === 'newform') {
      n.done = true;
      this.openTown('market');
    } else if (n.type === 'crowd') {
      n.done = true;
      this.openOffice('list', n.pid);
    } else if (n.type === 'milkable' && !n.done) {
      this.openMilk();
    } else if (n.type === 'milklow' && !n.done && a && G.canBreed(a)) {
      n.done = true;
      this.openBreed(a);
    } else if (a) {
      n.done = n.done || ['ship', 'birth', 'death', 'idle', 'peak', 'aging'].includes(n.type);
      this.openDetail(a.id);
    }
    this.refreshHud();
    this.refreshOpenDetail();
  },
  markNoticesDone(type, aid) {
    for (const n of G.S.notices) if (n.aid === aid && (!type || n.type === type)) n.done = true;
    $$('#notices .notice').forEach((el) => el.remove());
    this.buildNoticeQueue();
  },

  // ---------- ターン ----------
  confirmEndTurn() {
    if (this.modalOpen()) return;
    const S = G.S;
    const next = S.turn + 1;
    this.confirm('ターン終了', `<div class="kv"><span>${G.dateText(S.turn)}</span><b>→ ${G.dateText(next)}</b></div><div class="kv"><span>お世話</span><b>${S.careLeft}</b></div>`, 'ターン終了', () => this.endTurn());
  },
  endTurn() {
    this.holdNotices = true;
    $$('#notices .notice').forEach((el) => el.remove());
    this.noticeQueue = [];
    const sum = G.endTurn();
    G.map.buildBlocks();
    this.refreshHud();
    this.showSummary(sum);
  },
  summaryCat(line, inc) {
    const cats = inc ? [['出荷', '🚚', '出荷'], ['搾乳', '🥛', '搾乳'], ['畑', '🌾', '畑'], ['レース', '🏇', 'レース'], ['売却', '🏷', '売却'], ['飼料 売却', '🌱', '飼料 売却'], ['出走取消', '🏇', 'レース'], ['手伝い', '🧺', '手伝い'], ['木材 売却', '🪵', '木材'], ['副産物', '🦴', '副産物']]
      : [['飼料費', '🌾', '飼料'], ['施設維持費', '🏡', '施設維持費'], ['人件費', '🧑‍🌾', '人件費'], ['去勢', '✂', '去勢'], ['感染症', '🩹', '治療'], ['精液ストロー', '💞', '繁殖'], ['種付け料', '💞', '繁殖'], ['購入', '🐮', '購入'], ['出走登録', '🏇', 'レース'], ['開拓', '⛏', '開拓・増設'], ['放牧地 開拓', '⛏', '開拓・増設'], ['畑 開拓', '⛏', '開拓・増設'], ['搾乳施設 増設', '⛏', '開拓・増設'], ['倉庫 増設', '⛏', '開拓・増設'], ['けがの治療', '🩹', '治療'], ['木材 購入', '🪵', '木材'], ['埋葬費', '🕯', '埋葬費']];
    let best = null;
    for (const c of cats) if (line.startsWith(c[0]) && (!best || c[0].length > best[0].length)) best = c;
    return best ? { icon: best[1], name: best[2] } : { icon: '📒', name: 'その他' };
  },
  summaryGroups(entries, inc) {
    const g = {};
    for (const e of entries) {
      const c = this.summaryCat(e.lines[0], inc);
      const k = c.name;
      (g[k] = g[k] || { icon: c.icon, name: k, sum: 0, n: 0 });
      g[k].sum += Math.abs(e.amount); g[k].n++;
    }
    return Object.values(g).sort((a, b) => b.sum - a.sum);
  },
  showSummary(sum) {
    const inc = sum.entries.filter((e) => e.amount > 0), exp = sum.entries.filter((e) => e.amount < 0);
    const st = sum.settlement;
    const net = sum.income - sum.expense;
    const rows = (list, cls) => list.map((r) => `<div class="sum-row ${cls}"><span class="si">${r.icon}</span><span class="sn">${r.name}${r.n > 1 ? `<small>×${r.n}</small>` : ''}</span><b>${G.yen(r.sum)}</b></div>`).join('') || '<div class="muted">—</div>';
    const w = this.open(`<div class="sum-head"><div class="sum-date">${G.dateText(sum.turn)}</div><h2>📒 季節の収支</h2>
        <div class="sum-net ${net >= 0 ? 'plus' : 'minus'}"><span>収支</span><b>${net >= 0 ? '+' : '−'}${G.yen(Math.abs(net)).replace('¥', '¥')}</b></div></div>
      <div class="summary">
        <div class="sum-col in"><div class="sum-title">収入<b>${G.yen(sum.income)}</b></div>${rows(this.summaryGroups(inc, true), 'in')}</div>
        <div class="sum-col out"><div class="sum-title">支出<b>${G.yen(sum.expense)}</b></div>${rows(this.summaryGroups(exp, false), 'out')}</div>
      </div>
      <details class="sum-detail"><summary>明細</summary>${sum.entries.map((e) => `<div class="ledger-line ${e.amount > 0 ? 'in' : 'out'}">${e.lines.map((l) => `<div>${G.esc(l)}</div>`).join('')}</div>`).join('')}</details>
      ${st ? `<div class="settle"><div class="sum-title">🧾 年次決算</div>
        <div class="mini-stats"><div><span>年間売上</span><b>${G.yen(st.sales)}</b></div><div><span>返済</span><b>${G.yen(st.paid)}</b></div>
        ${st.unpaid ? `<div><span>返済不足</span><b>${G.yen(st.unpaid)}</b></div><div><span>利息</span><b>${G.yen(st.interest)}</b></div>` : ''}
        <div class="big"><span>借入金残高</span><b>${G.yen(st.loan)}</b></div></div></div>` : ''}
      <div class="sum-foot">${sum.borrowed ? `<div class="kv"><span>借入金 振替</span><b>${G.yen(sum.borrowed)}</b></div>` : ''}
        <div class="sum-money"><span>所持金</span><b>${G.yen(sum.money)}</b></div>
        <button class="btn primary ok">OK</button></div>`, { size: 'medium', sticky: true, cls: 'sum', onClose: () => this.seasonChange() });
    $('.ok', w).onclick = () => this.close(w);
  },
  seasonChange() {
    const S = G.S;
    const season = (S.turn - 1) % 4;
    const ov = $('#season-overlay');
    ov.className = 's' + season;
    ov.innerHTML = `<div class="season-card"><div class="season-emoji">${['🌸', '🌻', '🍁', '⛄'][season]}</div><div class="season-text">${G.dateText(S.turn)}</div></div>`;
    G.audio.sfx('season');
    setTimeout(() => { ov.className = 'hidden'; this.holdNotices = false; this.buildNoticeQueue(); this.dailyEvent(); }, 2200);
  },
  dailyEvent() {
    const list = G.alive();
    if (!list.length) return;
    const a = G.pick(list);
    const id = G.text.pick('daily.animal_', { personality: a.personality });
    if (!id) return;
    G.S.readTexts[id] = true;
    const vs = G.voiceStep(a, 'daily.voice', '');
    const vid = vs ? G.text.pick(`daily.voice.${G.PERS_KEY[a.personality]}_`, {}) : null;
    if (vid) G.S.readTexts[vid] = true;
    const el = document.createElement('div');
    el.className = 'daily';
    el.innerHTML = `<b>${G.spIcon(a)} ${G.esc(a.name)}</b><span>${G.esc(G.text.fill(G.text.get(id).text, G.textVars(a)))}</span>${G.S.devMode ? `<code>${id}</code>` : ''}${vid ? `<span class="voice">${G.esc(G.text.fill(G.text.get(vid).text, G.textVars(a)))}</span>${G.S.devMode ? `<code>${vid}</code>` : ''}` : ''}`;
    $('#toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), 5000);
    setTimeout(() => el.remove(), 5500);
  },

  // ---------- ツールチップ ----------
  initTip() {
    const tip = $('#tip');
    document.addEventListener('mousemove', (e) => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (!t) { tip.classList.add('hidden'); return; }
      tip.textContent = t.dataset.tip;
      tip.classList.remove('hidden');
      const x = Math.min(e.clientX + 16, window.innerWidth - tip.offsetWidth - 8);
      const y = Math.min(e.clientY + 18, window.innerHeight - tip.offsetHeight - 8);
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    });
    document.addEventListener('touchstart', (e) => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (!t) { tip.classList.add('hidden'); return; }
      const r = t.getBoundingClientRect();
      tip.textContent = t.dataset.tip;
      tip.classList.remove('hidden');
      tip.style.left = Math.min(r.left, window.innerWidth - tip.offsetWidth - 8) + 'px';
      tip.style.top = (r.bottom + 8) + 'px';
      clearTimeout(this.tipTimer);
      this.tipTimer = setTimeout(() => tip.classList.add('hidden'), 2500);
    }, { passive: true });
  },
  hideTip() { $('#tip').classList.add('hidden'); },
};

// ---------- 所持金の演出 ----------
G.fx = {
  moneyPop(amount) {
    if (amount <= 0) return;
    G.audio.sfx('coin');
    const el = document.createElement('div');
    el.className = 'money-pop';
    el.textContent = '+' + G.yen(amount);
    document.body.appendChild(el);
    const target = $('#hud-money').getBoundingClientRect();
    requestAnimationFrame(() => el.classList.add('bounce'));
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${target.left + target.width / 2 - (r.left + r.width / 2)}px, ${target.top + target.height / 2 - (r.top + r.height / 2)}px) scale(0.3)`;
      el.style.opacity = '0.2';
    }, 900);
    setTimeout(() => {
      el.remove();
      this.countUp(G.S.money - amount, G.S.money);
    }, 1500);
  },
  countUp(from, to) {
    const elm = $('#hud-money');
    G.ui.countingMoney = true;
    const t0 = performance.now();
    elm.parentElement.classList.add('glow');
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 700);
      elm.textContent = G.yen(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(step);
      else { G.ui.countingMoney = false; elm.parentElement.classList.remove('glow'); G.ui.refreshHud(); }
    };
    requestAnimationFrame(step);
    G.audio.sfx('coin');
  },
};
