// 搾乳施設（No.11）と畑・牧草（No.04）
G.FIELD_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ---------- 搾乳 ----------
G.milk = {
  lactTurn(a) { return a.lactation ? G.S.turn - a.lactation.start + 1 : 0; },
  lactMult(a) {
    const k = this.lactTurn(a);
    if (k < 1) return 0;
    return G.C.lactation[Math.min(k, G.C.lactation.length) - 1];
  },
  // 出産予定の直前1ターンは乾乳
  isDry(a) { return !!(a.pregnancy && a.pregnancy.due === G.S.turn + 1); },
  ageMult(a) {
    return Math.max(0, 1 - G.C.milkDeclinePerRank * G.acqRank(a, 'milkDecline'));
  },
  depthMult(a) { return 1 + (a.genes.depth | 0) * G.C.milkDepthPerRank; },
  calc(a) {
    const C = G.C;
    const season = (G.S.turn - 1) % 4;
    const geneM = G.traitRank(a, 'milk');
    const base = C.milkBase[geneM];
    const depth = this.depthMult(a);
    const potential = base * depth;
    const dilution = potential > C.milkDilute2 ? 2 : potential > C.milkDilute1 ? 1 : 0;
    const geneQ = G.traitRank(a, 'milkq');
    const q = Math.max(0, geneQ - dilution);
    const dry = this.isDry(a);
    const lact = dry ? 0 : this.lactMult(a);
    const sm = C.milkSeason[season];
    const age = this.ageMult(a);
    const cond = G.condition(a);
    const liters = Math.round(base * depth * lact * sm * age * cond);
    return { liters, base, depth, lact, season: sm, age, cond, geneM, geneQ, dilution, q, price: C.milkPrice[q], income: liters * C.milkPrice[q], dry, lactTurn: this.lactTurn(a) };
  },
  slotOf(a) { return G.S.milkSlots.findIndex((s) => s.aid === a.id); },
  canPlace(a) { return a && a.status === 'alive' && a.species !== 'horse' && a.sex === 'F' && G.isMature(a) && this.slotOf(a) < 0; },
  place(i, a) {
    const s = G.S.milkSlots[i];
    if (!s || s.aid || !this.canPlace(a)) return false;
    s.aid = a.id;
    G.addHistory(a, `搾乳施設に配置　スロット${i + 1}`);
    return true;
  },
  remove(i) {
    const s = G.S.milkSlots[i];
    if (!s || !s.aid) return;
    const a = G.S.animals[s.aid];
    s.aid = null;
    if (a) G.addHistory(a, '搾乳施設から外す');
  },
  addSlot() {
    const S = G.S;
    if (S.money < G.C.milkSlotCost) return false;
    S.milkSlots.push({ aid: null });
    G.pay(G.C.milkSlotCost, `搾乳施設 増設　スロット${S.milkSlots.length}　${G.yen(G.C.milkSlotCost)}`);
    return true;
  },
};

// 出荷・売却・死亡で施設の配置を外す
G.removeFromSlots = (a) => {
  for (const s of G.S.milkSlots) if (s.aid === a.id) s.aid = null;
  for (const f of G.S.fields) if (f.horse === a.id) f.horse = null;
};

// ---------- 畑 ----------
G.field = {
  label(i) { return G.FIELD_KEYS[i] || String(i + 1); },
  // 担当馬の能力（フェーズ3で馬が入る。いまは常に未配置）
  horseKey(f) {
    const h = f.horse && G.S.animals[f.horse];
    if (!h || h.status !== 'alive') return 'none';
    if (f.refusedTurn === G.S.turn) return 'none';
    return G.fieldHorseAbility(h);
  },
  mult(f) {
    const [crop, pasture] = G.C.fieldMult[this.horseKey(f)];
    return { crop, pasture };
  },
  produce(f) {
    if (!f.open) return { units: 0, money: 0, blocked: false };
    const m = this.mult(f);
    if (f.use === 'crop') {
      if (m.crop === null) return { units: 0, money: 0, blocked: true, mult: null };
      return { units: 0, money: Math.round(G.C.fieldCropBase * m.crop), blocked: false, mult: m.crop };
    }
    return { units: Math.round(G.C.fieldPastureBase * m.pasture), money: 0, blocked: false, mult: m.pasture };
  },
  open(i) {
    const S = G.S, f = S.fields[i];
    if (!f || f.open || S.money < G.C.fieldOpenCost) return false;
    f.open = true;
    G.pay(G.C.fieldOpenCost, `畑 開拓　区画${this.label(i)}　${G.yen(G.C.fieldOpenCost)}`);
    return true;
  },
  setUse(i, use) {
    const f = G.S.fields[i];
    if (!f || !f.open || (use !== 'crop' && use !== 'pasture')) return;
    if (f.use !== use) { f.use = use; G.ledger(`畑 用途変更　区画${this.label(i)}　${use === 'crop' ? '商業作物' : '牧草'}`, 0, 'note'); }
  },
};

// 農耕馬の能力（スタミナ・当代能力・コンディション）→ 倍率表のキー
G.fieldHorseAbility = (h) => {
  if (!G.isMature(h)) return 'none';
  const st = G.traitRank(h, 'stamina');
  let k = st <= 1 ? 0 : st === 2 ? 1 : st <= 4 ? 2 : 3;
  if ((h.trained || 0) >= 60) k++;
  if (G.condition(h) < 0.85) k--;
  const wd = G.acqRank(h, 'workDecline');
  if (wd) k -= wd >= 3 ? 2 : 1;
  return G.clamp(k, 0, 3);
};
G.FIELD_ABILITY_NAMES = { none: '未配置', 0: '平凡', 1: 'やや優秀', 2: '優秀', 3: '最高水準' };
// 【気性難】による就労不能（発現している場合のみ。去勢で軽減）
G.refuseChance = (h) => {
  const r = G.traitRank(h, 'temper');
  if (!r || G.traitInactiveReason(h, 'temper')) return 0;
  return 0.1 * r;
};
G.field.canAssign = (h) => h && h.status === 'alive' && G.isHorse(h) && G.isMature(h) && !G.S.fields.some((f) => f.horse === h.id);
G.field.assign = (i, h) => {
  const f = G.S.fields[i];
  if (!f || !f.open) return false;
  if (!h) { if (f.horse) { const o = G.S.animals[f.horse]; if (o) G.addHistory(o, `畑から外す　区画${G.field.label(i)}`); } f.horse = null; return true; }
  if (!G.field.canAssign(h)) return false;
  f.horse = h.id;
  G.addHistory(h, `畑に配置　区画${G.field.label(i)}`);
  return true;
};

// 飼料の必要量と自給量
G.feedBalance = () => {
  const herd = G.alive();
  const adults = herd.filter((a) => G.isMature(a)).length;
  const young = herd.length - adults;
  const need = adults * G.C.feedUnitsAdult + young * G.C.feedUnitsYoung;
  const self = G.S.fields.reduce((s, f) => s + G.field.produce(f).units, 0);
  const season = (G.S.turn - 1) % 4;
  const buy = Math.max(0, need - self);
  const surplus = Math.max(0, self - need);
  return { adults, young, need, self, buy, surplus, cost: Math.round(buy * G.C.feedUnitPrice * G.C.feedSeason[season]), surplusIncome: surplus * G.C.feedSurplusPrice };
};

G.upkeepBreakdown = () => {
  const S = G.S;
  const pastures = Object.values(S.pastures).filter((p) => p.open).length;
  const milk = S.milkSlots.length;
  const fields = S.fields.filter((f) => f.open).length;
  const stages = Object.keys(S.pastures).filter((p) => S.pastures[p].open).reduce((s, p) => s + G.pastureStage(p), 0);
  return { pastures, milk, fields, total: pastures * G.C.pastureUpkeep + stages * G.C.pastureUpkeepPerStage + milk * G.C.milkSlotUpkeep + fields * G.C.fieldUpkeep };
};

// ターン終了時の生産（年齢更新の前に、今季の状態で計算）
G.runProduction = () => {
  const S = G.S;
  for (let i = 0; i < S.milkSlots.length; i++) {
    const s = S.milkSlots[i];
    const a = s.aid && S.animals[s.aid];
    if (!a || a.status !== 'alive') { s.aid = null; continue; }
    const r = G.milk.calc(a);
    a.milkTotal = (a.milkTotal || 0) + r.liters;
    if (r.income > 0) G.earn(r.income, `搾乳　${a.name}　${r.liters.toLocaleString('ja-JP')}L　乳質 ${G.rankName(r.q)}　${G.yen(r.income)}`, { silent: true });
  }
  S.fields.forEach((f, i) => {
    const h = f.horse && S.animals[f.horse];
    if (f.open && h && h.status === 'alive' && G.chance(G.refuseChance(h))) {
      f.refusedTurn = S.turn;
      G.ledger(`就労不能　${h.name}　区画${G.field.label(i)}`, 0, 'note');
      G.addHistory(h, '就労不能');
    }
    const r = G.field.produce(f);
    if (r.money > 0) G.earn(r.money, `畑　区画${G.field.label(i)}　商業作物　${G.yen(r.money)}`, { silent: true });
  });
};
