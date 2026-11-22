// 搾乳施設・畑・レースの画面
Object.assign(G.ui, {
  // ---------- 搾乳施設 ----------
  openMilk() {
    const w = this.open('<h2>🥛 搾乳施設</h2><div class="milk-body"></div>', { size: 'large' });
    w.dataset.milk = '1';
    this.renderMilk(w);
  },
  milkRows(a) {
    const r = G.milk.calc(a);
    const lact = r.dry ? '乾乳' : r.lactTurn > 0 ? `${r.lactTurn}ターン目` : '—';
    return `<div class="lact"><div class="lact-bar"><i style="width:${Math.round(r.lact * 100)}%"></i></div><span>${lact}　${Math.round(r.lact * 100)}%</span></div>
      <div class="mini-stats">
        <div><span>乳量（予測）</span><b>${r.liters.toLocaleString('ja-JP')}L</b></div>
        <div><span>乳質</span><b>${G.rankName(r.q)}</b><small>遺伝 ${G.rankName(r.geneQ)}${r.dilution ? `　希釈 −${r.dilution}` : ''}</small></div>
        <div><span>季節</span><b>×${r.season}</b>${r.age < 1 ? `<small>年齢 ×${r.age.toFixed(2)}</small>` : ''}</div>
        <div class="big"><span>売上（予測）</span><b>${G.yen(r.income)}</b></div>
      </div>`;
  },
  renderMilk(w) {
    const S = G.S;
    const body = $('.milk-body', w);
    const cands = G.alive().filter((a) => G.milk.canPlace(a)).sort((x, y) => G.milk.lactMult(y) - G.milk.lactMult(x));
    const total = S.milkSlots.reduce((s, x) => s + (x.aid && S.animals[x.aid] ? G.milk.calc(S.animals[x.aid]).income : 0), 0);
    body.innerHTML = `<div class="stat-strip"><div><span>スロット</span><b>${S.milkSlots.filter((x) => x.aid).length}/${S.milkSlots.length}</b></div><div><span>今季の売上（予測）</span><b>${G.yen(total)}</b></div></div>
    <div class="slot-grid">${S.milkSlots.map((s, i) => {
      const a = s.aid && S.animals[s.aid];
      if (a) {
        return `<div class="slot-card"><div class="slot-no">${i + 1}</div>
          <div class="slot-head"><canvas class="a-face" data-face="${a.id}" width="96" height="96"></canvas>
            <div><a class="link name" data-id="${a.id}">${G.esc(a.name)}</a><div class="bs">${this.badge(a, 'milk', G.traitRank(a, 'milk'), true)}${this.badge(a, 'milkq', G.traitRank(a, 'milkq'), true)}${this.badge(a, 'depth', a.genes.depth, true)}</div></div>
            <button class="btn small out" data-out="${i}">外す</button></div>
          ${this.milkRows(a)}</div>`;
      }
      return `<div class="slot-card empty"><div class="slot-no">${i + 1}</div><div class="empty-title">空き</div>
        ${cands.length ? this.pickChips(cands.map((c) => ({ value: c.id, label: G.esc(c.name), face: c.id, sub: G.milk.lactTurn(c) > 0 ? `泌乳${G.milk.lactTurn(c)}` : '—' })), `data-in${i}`) : '<div class="muted">—</div>'}</div>`;
    }).join('')}
      <button class="slot-card add" ${S.money < G.C.milkSlotCost ? 'disabled' : ''}><span class="plus">＋</span><b>スロット増設</b><small>${G.yen(G.C.milkSlotCost)}　維持費 +${G.yen(G.C.milkSlotUpkeep)}／ターン</small></button>
    </div>`;
    this.drawFaces(body);
    $$('[data-out]', body).forEach((b) => b.onclick = () => { G.milk.remove(+b.dataset.out); G.audio.sfx('click'); this.renderMilk(w); });
    S.milkSlots.forEach((s, i) => $$(`[data-in${i}]`, body).forEach((b) => b.onclick = () => {
      const id = b.getAttribute(`data-in${i}`);
      if (G.milk.place(i, S.animals[id])) { G.audio.sfx('care'); this.markNoticesDone('milkable', id); this.renderMilk(w); }
    }));
    $$('.link', body).forEach((l) => l.onclick = () => this.openDetail(l.dataset.id));
    $('.add', body).onclick = () => { if (G.milk.addSlot()) { G.audio.sfx('fanfare'); this.renderMilk(w); this.refreshHud(); } };
  },

  // ---------- 畑 ----------
  openField(focus) {
    const w = this.open('<h2>🌾 畑</h2><div class="field-body"></div>', { size: 'large' });
    w.dataset.field = '1';
    this.renderField(w, typeof focus === 'number' ? focus : 0);
  },
  fieldState(f) {
    if (!f.open) return { icon: '🪨', label: '荒れ地', cls: 'waste' };
    const r = G.field.produce(f);
    if (f.use === 'crop') return { icon: '🌾', label: r.blocked ? '商業作物　—' : `商業作物　${G.yen(r.money)}`, cls: 'crop' };
    return { icon: '🌱', label: `牧草　${r.units}単位`, cls: 'pasture' };
  },
  renderField(w, focus) {
    const S = G.S, M = G.MAP;
    const body = $('.field-body', w);
    const fb = G.feedBalance();
    const cols = [...new Set(M.fieldBlocks.map((b) => b.x))].sort((a, b) => a - b);
    const rows = [...new Set(M.fieldBlocks.map((b) => b.y))].sort((a, b) => a - b);
    const blocks = M.fieldBlocks.map((b, bi) => `<div class="f-block" style="grid-column:${cols.indexOf(b.x) + 1};grid-row:${rows.indexOf(b.y) + 1}">
      ${[0, 1, 2].map((k) => { const i = bi * 3 + k, f = S.fields[i], st = this.fieldState(f); return `<button class="f-tile ${st.cls} ${i === focus ? 'on' : ''}" data-i="${i}"><b>${G.field.label(i)}</b><span class="ico">${st.icon}</span>${f.horse && S.animals[f.horse] ? '<span class="hz">🐴</span>' : ''}</button>`; }).join('')}
    </div>`).join('');
    const f = S.fields[focus];
    const lab = G.field.label(focus);
    let detail;
    if (!f.open) {
      detail = `<div class="f-detail waste"><div class="f-title">畑スロット${lab}<small>荒れ地</small></div>
        <div class="mini-stats"><div><span>開拓</span><b>${G.yen(G.C.fieldOpenCost)}</b></div><div><span>維持費</span><b>+${G.yen(G.C.fieldUpkeep)}／ターン</b></div></div>
        <div class="actions"><button class="btn primary open" ${S.money < G.C.fieldOpenCost ? 'disabled' : ''}>開拓する</button></div></div>`;
    } else {
      const m = G.field.mult(f), r = G.field.produce(f);
      const cands = G.alive().filter((h) => G.isHorse(h) && G.isMature(h) && (h.id === f.horse || G.field.canAssign(h)));
      detail = `<div class="f-detail"><div class="f-title">畑スロット${lab}</div>
        ${this.choiceGrid('use', [{ value: 'crop', icon: '<span class="emoji">🌾</span>', title: '商業作物' }, { value: 'pasture', icon: '<span class="emoji">🌱</span>', title: '牧草' }], 'slim')}
        <div class="sec-label">担当馬</div>
        ${this.pickChips([{ value: '', label: 'なし', on: !f.horse }].concat(cands.map((h) => ({ value: h.id, label: G.esc(h.name), face: h.id, sub: G.FIELD_ABILITY_NAMES[G.fieldHorseAbility(h)], on: h.id === f.horse }))), 'data-horse')}
        <div class="mini-stats">
          ${f.use === 'crop' ? `<div><span>倍率</span><b>${m.crop === null ? '配置不可' : `${m.crop}倍`}</b></div><div class="big"><span>季節収益</span><b>${r.blocked ? '—' : G.yen(r.money)}</b></div>`
            : `<div><span>倍率</span><b>${m.pasture}倍</b></div><div class="big"><span>季節生産</span><b>飼料${r.units}単位</b></div>`}
        </div></div>`;
    }
    body.innerHTML = `<div class="stat-strip"><div><span>必要</span><b>${fb.need}単位</b></div><div><span>自給</span><b>${fb.self}単位</b></div><div><span>購入</span><b>${fb.buy}単位　${G.yen(fb.cost)}</b></div>${fb.surplus ? `<div><span>売却</span><b>${fb.surplus}単位</b></div>` : ''}</div>
      <div class="field-wrap"><div class="f-map" style="grid-template-columns:repeat(${cols.length},minmax(0,1fr))">${blocks}</div>${detail}</div>`;
    this.drawFaces(body);
    const grid = $('.choice-grid[data-name="use"]', body);
    if (grid) $$('.choice', grid).forEach((c) => c.classList.toggle('on', c.dataset.value === f.use));
    $$('.f-tile', body).forEach((t) => t.onclick = () => { G.audio.sfx('page'); this.renderField(w, +t.dataset.i); });
    const ob = $('.open', body);
    if (ob) ob.onclick = () => {
      if (!G.field.open(focus)) return;
      const rr = G.fieldRect(focus);
      for (let k = 0; k < 4; k++) setTimeout(() => G.map.burst(rr.x + Math.random() * rr.w, rr.y + Math.random() * rr.h, ['🌱', '✨', '🌾'], 8), k * 120);
      G.audio.sfx('fanfare');
      this.renderField(w, focus);
      this.refreshHud();
    };
    this.bindChoice(body, 'use', (v) => { G.field.setUse(focus, v); this.renderField(w, focus); });
    $$('[data-horse]', body).forEach((b) => b.onclick = () => {
      const id = b.getAttribute('data-horse');
      G.field.assign(focus, id ? S.animals[id] : null);
      G.audio.sfx('click');
      this.renderField(w, focus);
    });
  },

  // ---------- レース ----------
  renderRaceTab(w, body) {
    const S = G.S;
    const horses = G.alive().filter((a) => G.isHorse(a) && G.isMature(a));
    body.innerHTML = `<div class="race-grid">${S.raceCard.map((r) => {
      const R = G.C.races[r.grade];
      const ents = S.raceEntries.filter((e) => e.key === r.key).map((e) => S.animals[e.aid]).filter(Boolean);
      const cand = horses.filter((h) => G.race.canEnter(h, r));
      return `<div class="race-card ${r.grade}"><div class="race-head"><span class="grade">${R.name}</span><span class="dist">${G.DIST_NAMES[r.dist]}</span></div>
        <div class="mini-stats"><div><span>出走料</span><b>${G.yen(R.fee)}</b></div><div><span>入賞</span><b>${G.yen(R.prize[0])}</b></div><div class="big"><span>優勝</span><b>${G.yen(R.prize[1])}</b></div></div>
        ${ents.length ? `<div class="entries">${ents.map((h) => `<span class="entry-pill">🐴 ${G.esc(h.name)}<button data-cancel="${h.id}">×</button></span>`).join('')}</div>` : ''}
        ${cand.length ? `<div class="sec-label">出走登録</div>${this.pickChips(cand.map((h) => ({ value: `${r.key}|${h.id}`, label: G.esc(h.name), face: h.id })), 'data-enter')}` : ''}</div>`;
    }).join('')}</div>
    <h3>戦績</h3>
    <div class="a-list">${horses.map((h) => { const rc = G.race.record(h); return this.animalRow(h, `<div class="rec"><b>${rc.n}戦 ${rc.win}勝</b><small>入賞${rc.place}　当代能力 ${Math.round(h.trained || 0)}</small></div>`); }).join('') || '<div class="muted">—</div>'}</div>`;
    this.drawFaces(body);
    $$('[data-enter]', body).forEach((b) => b.onclick = () => {
      const [key, id] = b.getAttribute('data-enter').split('|');
      if (G.race.enter(S.animals[id], key)) { G.audio.sfx('coin'); this.renderOffice(w, 'race'); this.refreshHud(); }
    });
    $$('[data-cancel]', body).forEach((b) => b.onclick = () => { G.race.cancel(S.animals[b.dataset.cancel]); this.renderOffice(w, 'race'); this.refreshHud(); });
    $$('.a-row', body).forEach((r) => r.onclick = () => this.openDetail(r.dataset.id));
  },
});
