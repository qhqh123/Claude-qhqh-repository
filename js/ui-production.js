// 搾乳施設と畑の画面
Object.assign(G.ui, {
  openMilk() {
    const w = this.open('<h2>🥛 搾乳施設</h2><div class="milk-body"></div>', { size: 'large' });
    w.dataset.milk = '1';
    this.renderMilk(w);
  },
  milkRows(a) {
    const r = G.milk.calc(a);
    const lact = r.dry ? '乾乳' : r.lactTurn > 0 ? `${r.lactTurn}ターン目　${Math.round(r.lact * 100)}%` : '—';
    return `<div class="kv"><span>泌乳</span><b>${lact}</b></div>
      <div class="kv"><span>季節</span><b>×${r.season}</b></div>
      ${r.age < 1 ? `<div class="kv"><span>年齢</span><b>×${r.age.toFixed(2)}</b></div>` : ''}
      <div class="kv"><span>乳量（予測）</span><b>${r.liters.toLocaleString('ja-JP')}L</b></div>
      <div class="kv"><span>乳質</span><b>遺伝 ${G.rankName(r.geneQ)}　発現 ${G.rankName(r.q)}${r.dilution ? `　希釈 −${r.dilution}` : ''}</b></div>
      <div class="kv"><span>売上（予測）</span><b>${G.yen(r.income)}</b></div>`;
  },
  renderMilk(w) {
    const S = G.S;
    const body = $('.milk-body', w);
    const cands = G.alive().filter((a) => G.milk.canPlace(a)).sort((x, y) => G.milk.lactMult(y) - G.milk.lactMult(x));
    body.innerHTML = `<div class="cards">${S.milkSlots.map((s, i) => {
      const a = s.aid && S.animals[s.aid];
      if (a) {
        return `<div class="card slot"><div class="card-h"><b>スロット${i + 1}</b><a class="link" data-id="${a.id}">${G.esc(a.name)}</a></div>
          <div class="badge-row">${this.badge(a, 'milk', G.traitRank(a, 'milk'), true)}${this.badge(a, 'milkq', G.traitRank(a, 'milkq'), true)}${this.badge(a, 'depth', a.genes.depth, true)}</div>
          ${this.milkRows(a)}
          <div class="card-f"><span></span><button class="btn small" data-out="${i}">外す</button></div></div>`;
      }
      return `<div class="card slot empty"><div class="card-h"><b>スロット${i + 1}</b><small>空き</small></div>
        ${cands.length ? `<select data-sel="${i}">${cands.map((c) => `<option value="${c.id}">${G.esc(c.name)}　${G.milk.lactTurn(c) > 0 ? `泌乳${G.milk.lactTurn(c)}ターン目` : '—'}</option>`).join('')}</select>
        <div class="card-f"><span></span><button class="btn small primary" data-in="${i}">配置</button></div>` : '<div class="muted">—</div>'}</div>`;
    }).join('')}</div>
    <div class="actions"><span class="muted">${G.yen(G.C.milkSlotCost)}　維持費 +${G.yen(G.C.milkSlotUpkeep)}／ターン</span><button class="btn primary add" ${S.money < G.C.milkSlotCost ? 'disabled' : ''}>スロット増設</button></div>`;
    $$('[data-out]', body).forEach((b) => b.onclick = () => { G.milk.remove(+b.dataset.out); G.audio.sfx('click'); this.renderMilk(w); });
    $$('[data-in]', body).forEach((b) => b.onclick = () => {
      const i = +b.dataset.in;
      const id = $(`[data-sel="${i}"]`, body).value;
      if (G.milk.place(i, S.animals[id])) {
        G.audio.sfx('care');
        this.markNoticesDone('milkable', id);
        this.renderMilk(w);
      }
    });
    $$('.link', body).forEach((l) => l.onclick = () => this.openDetail(l.dataset.id));
    $('.add', body).onclick = () => {
      if (G.milk.addSlot()) { G.audio.sfx('fanfare'); this.renderMilk(w); this.refreshHud(); }
    };
  },

  renderRaceTab(w, body) {
    const S = G.S;
    const horses = G.alive().filter((a) => G.isHorse(a) && G.isMature(a));
    body.innerHTML = `<div class="cards">${S.raceCard.map((r) => {
      const R = G.C.races[r.grade];
      const ents = S.raceEntries.filter((e) => e.key === r.key).map((e) => S.animals[e.aid]).filter(Boolean);
      const cand = horses.filter((h) => G.race.canEnter(h, r));
      return `<div class="card race ${r.grade}"><div class="card-h"><b>${R.name}</b><small>${G.DIST_NAMES[r.dist]}</small></div>
        <div class="kv"><span>出走料</span><b>${G.yen(R.fee)}</b></div>
        <div class="kv"><span>賞金</span><b>入賞 ${G.yen(R.prize[0])}　優勝 ${G.yen(R.prize[1])}</b></div>
        ${ents.map((h) => `<div class="entry">🐴 ${G.esc(h.name)} <button class="btn small" data-cancel="${h.id}">取消</button></div>`).join('')}
        ${cand.length ? `<select data-rsel="${r.key}">${cand.map((h) => `<option value="${h.id}">${G.esc(h.name)}</option>`).join('')}</select>
        <div class="card-f"><span></span><button class="btn small primary" data-enter="${r.key}">出走登録</button></div>` : ''}</div>`;
    }).join('')}</div>
    <h3>戦績</h3>
    <table class="tbl"><thead><tr><th>名前</th><th>スピード</th><th>スタミナ</th><th>当代能力</th><th>戦績</th></tr></thead><tbody>
    ${horses.map((h) => { const rc = G.race.record(h); return `<tr data-id="${h.id}"><td><b>${G.esc(h.name)}</b></td><td>${G.rankName(G.traitRank(h, 'speed'))}</td><td>${G.rankName(G.traitRank(h, 'stamina'))}</td><td>${Math.round(h.trained || 0)}</td><td>${rc.n}戦 ${rc.win}勝 入賞${rc.place}</td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">—</td></tr>'}
    </tbody></table>`;
    $$('[data-enter]', body).forEach((b) => b.onclick = () => {
      const key = b.dataset.enter;
      const id = $(`[data-rsel="${key}"]`, body).value;
      if (G.race.enter(S.animals[id], key)) { G.audio.sfx('coin'); this.renderOffice(w, 'race'); this.refreshHud(); }
    });
    $$('[data-cancel]', body).forEach((b) => b.onclick = () => { G.race.cancel(S.animals[b.dataset.cancel]); this.renderOffice(w, 'race'); this.refreshHud(); });
    $$('tr[data-id]', body).forEach((r) => r.onclick = () => this.openDetail(r.dataset.id));
  },

  openField(focus) {
    const w = this.open('<h2>🌾 畑</h2><div class="field-body"></div>', { size: 'large' });
    w.dataset.field = '1';
    this.renderField(w, focus);
  },
  fieldLine(f) {
    const m = G.field.mult(f);
    const r = G.field.produce(f);
    const h = f.horse && G.S.animals[f.horse];
    const horse = h ? G.esc(h.name) : 'なし';
    if (f.use === 'crop') {
      return `<div class="kv"><span>担当馬</span><b>${horse}${m.crop === null ? '（配置不可）' : `（${m.crop}倍）`}</b></div>
        <div class="kv"><span>季節収益</span><b>${r.blocked ? '—' : G.yen(r.money)}</b></div>`;
    }
    return `<div class="kv"><span>担当馬</span><b>${horse}（${m.pasture}倍）</b></div>
      <div class="kv"><span>季節生産</span><b>飼料${r.units}単位</b></div>`;
  },
  renderField(w, focus) {
    const S = G.S;
    const body = $('.field-body', w);
    const fb = G.feedBalance();
    body.innerHTML = `<div class="cards">${S.fields.map((f, i) => {
      const lab = G.field.label(i);
      if (!f.open) {
        return `<div class="card slot ${focus === i ? 'focus' : ''}"><div class="card-h"><b>畑スロット${lab}</b><small>荒れ地</small></div>
          <div class="kv"><span>開拓</span><b>${G.yen(G.C.fieldOpenCost)}</b></div>
          <div class="kv"><span>維持費</span><b>+${G.yen(G.C.fieldUpkeep)}／ターン</b></div>
          <div class="card-f"><span></span><button class="btn small primary" data-open="${i}" ${S.money < G.C.fieldOpenCost ? 'disabled' : ''}>開拓する</button></div></div>`;
      }
      return `<div class="card slot ${focus === i ? 'focus' : ''}"><div class="card-h"><b>畑スロット${lab}</b></div>
        <div class="opt-row"><label class="radio"><input type="radio" name="use${i}" value="crop" ${f.use === 'crop' ? 'checked' : ''}> 商業作物</label>
        <label class="radio"><input type="radio" name="use${i}" value="pasture" ${f.use === 'pasture' ? 'checked' : ''}> 牧草</label></div>
        ${this.fieldLine(f)}
        ${(() => {
          const cands = G.alive().filter((h) => G.isHorse(h) && G.isMature(h) && (h.id === f.horse || G.field.canAssign(h)));
          return cands.length ? `<select data-horse="${i}"><option value="">担当馬なし</option>${cands.map((h) => `<option value="${h.id}" ${h.id === f.horse ? 'selected' : ''}>${G.esc(h.name)}　${G.FIELD_ABILITY_NAMES[G.fieldHorseAbility(h)]}</option>`).join('')}</select>` : '';
        })()}</div>`;
    }).join('')}</div>
    <h3>飼料</h3>
    <div class="kv"><span>必要</span><b>${fb.need}単位</b></div>
    <div class="kv"><span>自給</span><b>${fb.self}単位</b></div>
    <div class="kv"><span>購入</span><b>${fb.buy}単位　${G.yen(fb.cost)}</b></div>
    ${fb.surplus ? `<div class="kv"><span>売却</span><b>${fb.surplus}単位　${G.yen(fb.surplusIncome)}</b></div>` : ''}`;
    $$('[data-open]', body).forEach((b) => b.onclick = () => {
      const i = +b.dataset.open;
      if (!G.field.open(i)) return;
      const r = G.fieldRect(i);
      for (let k = 0; k < 4; k++) setTimeout(() => G.map.burst(r.x + Math.random() * r.w, r.y + Math.random() * r.h, ['🌱', '✨', '🌾'], 8), k * 120);
      G.audio.sfx('fanfare');
      this.renderField(w, i);
      this.refreshHud();
    });
    $$('[data-horse]', body).forEach((sel) => sel.onchange = () => {
      const i = +sel.dataset.horse;
      G.field.assign(i, sel.value ? S.animals[sel.value] : null);
      G.audio.sfx('click');
      this.renderField(w, i);
    });
    $$('input[type=radio]', body).forEach((inp) => inp.onchange = () => {
      const i = +inp.name.slice(3);
      G.field.setUse(i, inp.value);
      G.audio.sfx('click');
      this.renderField(w, i);
    });
  },
});
