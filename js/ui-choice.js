// 選択カード（ラジオボタンの代わり）と、それを使う去勢・交配の画面
G.ICONS = {
  ring: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="13" fill="none" stroke="#ff9fbd" stroke-width="8"/><circle cx="24" cy="24" r="13" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 7" opacity=".8"/></svg>',
  burdizzo: '<svg viewBox="0 0 48 48"><path d="M14 40 L24 22 M34 40 L24 22" stroke="#8fb8e8" stroke-width="6" stroke-linecap="round" fill="none"/><rect x="16" y="8" width="16" height="10" rx="4" fill="#b9d6f5"/><circle cx="24" cy="22" r="4" fill="#fff" stroke="#8fb8e8" stroke-width="2"/></svg>',
  surgical: '<svg viewBox="0 0 48 48"><path d="M10 38 L30 18" stroke="#c9b6ff" stroke-width="7" stroke-linecap="round"/><path d="M30 18 Q40 6 42 8 Q40 16 33 21 Z" fill="#e9e3ff" stroke="#c9b6ff" stroke-width="2"/></svg>',
  traditional: '<svg viewBox="0 0 48 48"><path d="M10 40 L26 24" stroke="#d9a66b" stroke-width="7" stroke-linecap="round"/><path d="M26 24 L40 10 L38 22 Z" fill="#f3ead9" stroke="#d9a66b" stroke-width="2"/><path d="M36 40 q-6 -6 0 -12 q6 6 0 12z" fill="#ffc46b"/></svg>',
  direct: '<svg viewBox="0 0 48 48"><path d="M14 40 V22 a3 3 0 0 1 6 0 V14 a3 3 0 0 1 6 0 V12 a3 3 0 0 1 6 0 V16 a3 3 0 0 1 6 0 V30 q0 10 -10 10 Z" fill="#ffe3cf" stroke="#f0a989" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  outsource: '<svg viewBox="0 0 48 48"><path d="M8 22 L24 9 L40 22 V40 H8 Z" fill="#dff1ff" stroke="#8fb8e8" stroke-width="2.5" stroke-linejoin="round"/><rect x="20" y="28" width="8" height="12" rx="2" fill="#8fb8e8"/><circle cx="24" cy="20" r="4" fill="#ff9fbd"/></svg>',
  bull: '🐂', straw: '🧪', stallion: '🐎', teaser: '🐴',
};

Object.assign(G.ui, {
  // items: [{ value, icon, title, sub, extra, disabled }]
  choiceGrid(name, items, cls) {
    return `<div class="choice-grid ${cls || ''}" data-name="${name}">${items.map((it) => `
      <button type="button" class="choice" data-value="${G.esc(it.value)}" ${it.disabled ? 'disabled' : ''}>
        <span class="check">✓</span>
        ${it.icon ? `<span class="ch-icon">${it.icon}</span>` : ''}
        <span class="ch-title">${it.title}</span>
        ${it.sub ? `<span class="ch-sub">${it.sub}</span>` : ''}
        ${it.extra ? `<span class="ch-extra">${it.extra}</span>` : ''}
      </button>`).join('')}</div>`;
  },
  bindChoice(root, name, onChange) {
    const grid = $(`.choice-grid[data-name="${name}"]`, root);
    if (!grid) return;
    $$('.choice', grid).forEach((b) => b.onclick = () => {
      if (b.disabled) return;
      $$('.choice', grid).forEach((x) => x.classList.toggle('on', x === b));
      G.audio.sfx('click');
      onChange(b.dataset.value);
    });
  },

  // ---------- 去勢 ----------
  openCastrate(a) {
    if (a.castrated || a.status !== 'alive') return;
    const period = G.castPeriod(a);
    const methods = G.castMethods(a);
    const out = G.castCost(a, null, 'outsource');
    const st = { mode: null, method: null };
    const w = this.open(`
      <div class="sheet-head">
        <canvas class="mini-portrait" width="120" height="120"></canvas>
        <div><h2>去勢</h2><div class="who">${G.esc(a.name)}<small>${G.spName(a)} ♂　生後${G.ageText(a.age)}</small><span class="period-pill">${G.PERIOD_NAMES[period]}</span></div></div>
      </div>
      <div class="sheet-sec"><div class="sec-label">対応</div>
        ${this.choiceGrid('mode', [
          { value: 'direct', icon: G.ICONS.direct, title: '直接対応' },
          { value: 'outsource', icon: G.ICONS.outsource, title: '外部委託', sub: `委託費 ${G.yen(out.cost)}` },
        ], 'two')}
      </div>
      <div class="sheet-sec methods collapsed"><div class="sec-label">術式</div>
        ${this.choiceGrid('method', methods.map((m) => {
          const c = G.castCost(a, m, 'direct');
          return { value: m, icon: G.ICONS[m], title: G.METHOD_NAMES[m], sub: `資材費 ${G.yen(c.cost)}`, extra: c.tool ? `器具 ${G.yen(c.tool)}` : '' };
        }), 'four')}
      </div>
      <div class="sheet-foot"><div class="total"><span>合計</span><b class="sum">—</b></div>
        <div class="actions"><button class="btn cancel">やめる</button><button class="btn primary ok" disabled>決定</button></div></div>`, { size: 'medium', cls: 'sheet' });
    G.draw.portrait($('.mini-portrait', w), a);
    const upd = () => {
      $('.methods', w).classList.toggle('collapsed', st.mode !== 'direct');
      let cost = null;
      if (st.mode === 'outsource') cost = out.cost;
      if (st.mode === 'direct' && st.method) { const c = G.castCost(a, st.method, 'direct'); cost = c.cost + c.tool; }
      $('.sum', w).textContent = cost === null ? '—' : G.yen(cost);
      $('.ok', w).disabled = cost === null || G.S.money < 0;
    };
    this.bindChoice(w, 'mode', (v) => { st.mode = v; upd(); });
    this.bindChoice(w, 'method', (v) => { st.method = v; upd(); });
    $('.cancel', w).onclick = () => this.close(w);
    $('.ok', w).onclick = () => {
      this.close(w);
      const ev = G.castrate(a, st.method, st.mode);
      this.markNoticesDone('castrate', a.id);
      this.refreshOpenDetail();
      if (ev) G.novel.play(ev);
      this.refreshHud();
    };
  },

  // ---------- 交配 ----------
  openBreed(dam) {
    if (!G.canBreed(dam)) return;
    const S = G.S;
    const horse = G.isHorse(dam);
    const bulls = G.alive().filter((b) => G.isIntactMature(b) && b.species === dam.species);
    const opts = bulls.map((b) => ({ key: 'b' + b.id, type: 'bull', label: b.name, tag: '牧場', genes: b.genes, partner: { type: 'bull', id: b.id }, a: b, fee: 0 }))
      .concat((horse ? [] : S.straws).map((s, i) => ({ key: 's' + i, type: 'straw', label: s.name, tag: '精液ストロー', sub: `${G.TRAITS[s.main].name}期待${G.rankName(s.rank)}`, genes: s.genes, partner: { type: 'straw', index: i }, a: null, fee: 0 })))
      .concat((horse ? S.stallions : []).map((s, i) => ({ key: 'h' + i, type: 'stallion', label: s.name, tag: '外部種牡馬', sub: s.type === 'farm' ? '農耕' : '競走', genes: s.genes, partner: { type: 'stallion', index: i }, a: null, fee: s.fee })));
    const teasers = horse ? G.teasers() : [];
    const st = { key: null, teaser: '' };
    const card = (o) => ({
      value: o.key,
      icon: `<span class="emoji">${G.ICONS[o.type]}</span>`,
      title: `${G.esc(o.label)}`,
      sub: `<span class="tag t-${o.type}">${o.tag}</span>${o.sub ? ` ${o.sub}` : ''}${o.fee ? `　${G.yen(o.fee)}` : ''}`,
      extra: `<span class="bs">${this.badgesFrame(o.a, o.genes, true)}${this.badgesTraits(o.a, o.genes, true)}</span>`,
      disabled: o.fee && S.money < o.fee,
    });
    const w = this.open(`
      <div class="sheet-head">
        <canvas class="mini-portrait" width="120" height="120"></canvas>
        <div><h2>交配</h2><div class="who">${G.esc(dam.name)}<small>${G.spName(dam)} ♀　${G.ageText(dam.age)}</small></div>
        <div class="bs">${this.badgesFrame(dam, null, true)}${this.badgesTraits(dam, null, true)}</div></div>
      </div>
      <div class="sheet-sec"><div class="sec-label">相手</div>
        ${opts.length ? this.choiceGrid('partner', opts.map(card), 'list') : '<div class="muted">—</div>'}
      </div>
      ${teasers.length ? `<div class="sheet-sec teaser collapsed"><div class="sec-label">当て馬</div>
        ${this.choiceGrid('teaser', [{ value: '', title: 'なし' }].concat(teasers.map((t) => ({ value: t.id, icon: `<span class="emoji">${G.ICONS.teaser}</span>`, title: G.esc(t.name) }))), 'chips')}</div>` : ''}
      <div class="sheet-sec pv-sec collapsed"><div class="sec-label">産子の予想</div><div class="pv"></div></div>
      <div class="sheet-foot"><div class="total"><span>合計</span><b class="sum">—</b></div>
        <div class="actions">${horse ? '' : '<button class="btn go-town">🏪 精液ストローを買う</button>'}<button class="btn cancel">やめる</button><button class="btn primary ok" disabled>交配する</button></div></div>`, { size: 'medium', cls: 'sheet' });
    G.draw.portrait($('.mini-portrait', w), dam);
    const tz = $('.teaser', w);
    if (tz) { const first = $('.choice-grid[data-name="teaser"] .choice', tz); if (first) first.classList.add('on'); }
    this.bindChoice(w, 'partner', (v) => {
      st.key = v;
      const o = opts.find((x) => x.key === v);
      const pv = G.previewGenes(o.genes, dam.genes);
      $('.pv-sec', w).classList.remove('collapsed');
      $('.pv', w).innerHTML = `<div class="badge-row"><span class="lbl">体格</span>${this.badgesFrame(null, pv, true)}</div><div class="badge-row"><span class="lbl">特性</span>${this.badgesTraits(null, pv, true)}</div>`;
      if (tz) tz.classList.toggle('collapsed', o.type !== 'stallion');
      $('.sum', w).textContent = o.fee ? G.yen(o.fee) : '—';
      $('.ok', w).disabled = false;
    });
    this.bindChoice(w, 'teaser', (v) => { st.teaser = v; });
    $('.cancel', w).onclick = () => this.close(w);
    const gt = $('.go-town', w);
    if (gt) gt.onclick = () => { this.close(w); this.openTown('straw'); };
    $('.ok', w).onclick = () => {
      const o = opts.find((x) => x.key === st.key);
      if (!o) return;
      const partner = Object.assign({}, o.partner);
      if (o.type === 'stallion' && st.teaser) partner.teaser = st.teaser;
      this.close(w);
      const r = G.breed(dam, partner);
      this.markNoticesDone('breedable', dam.id);
      this.refreshOpenDetail();
      G.novel.play(r.ev);
      this.refreshHud();
    };
  },
});
