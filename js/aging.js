// 後天バッジ（老化をデフォルメした印）と、生産の状態
// 後天バッジは遺伝しない。年齢・性別・種から決まる（保存しない）。
//  ・繁殖のバッジ：2段階。雌は「受胎率低下→受胎不可」、未去勢の雄は「繁殖力低下→繁殖不能」
//  ・ランク付きのバッジ：付いた年がC、そこから1年（4ターン）ごとに1ランク上がる（最大A。A+・Sは良い意味のランクなので使わない）

G.AGING = {
  cattle: {
    fert: { F: [24, 32], M: [28, 36] },
    ranked: [['milkDecline', 16, 'F'], ['meatDecline', 16], ['injuryProne', 32]],
  },
  horse: {
    fert: { F: [60, 72], M: [72, 88] },
    ranked: [['speedDecline', 28], ['meatDecline', 32], ['workDecline', 60], ['injuryProne', 72]],
  },
};

// 今の後天バッジ [{ k, r }]
G.acqList = (a) => {
  const A = G.AGING[a.species || 'cattle'];
  const out = [];
  const fertile = a.sex === 'F' || !a.castrated;
  if (fertile && G.isMature(a)) {
    const [half, none] = A.fert[a.sex];
    if (a.age >= none) out.push({ k: a.sex === 'F' ? 'infertileF' : 'infertileM', r: 1 });
    else if (a.age >= half) out.push({ k: a.sex === 'F' ? 'fertDownF' : 'fertDownM', r: 1 });
  }
  for (const [k, start, sex] of A.ranked) {
    if (sex && a.sex !== sex) continue;
    if (a.age >= start) out.push({ k, r: Math.min(G.C.acqRankMax, 1 + Math.floor((a.age - start) / 4)) });
  }
  return out;
};
G.acqRank = (a, k) => { const x = G.acqList(a).find((t) => t.k === k); return x ? x.r : 0; };
G.hasAcq = (a, k) => G.acqRank(a, k) > 0;

// 受胎率・繁殖力の倍率
G.fertMult = (a) => {
  if (!a) return 1;
  if (G.hasAcq(a, 'infertileF') || G.hasAcq(a, 'infertileM')) return 0;
  if (G.hasAcq(a, 'fertDownF') || G.hasAcq(a, 'fertDownM')) return G.C.fertDownMult;
  return 1;
};
// けが・事故の倍率
G.injuryMult = (a) => 1 + G.acqRank(a, 'injuryProne');

// ターン終了時（年齢更新後）：新しく付いたバッジを通知する
G.applyAging = (a) => {
  a.flags.acqSeen = a.flags.acqSeen || {};
  for (const t of G.acqList(a)) {
    if (a.flags.acqSeen[t.k]) continue;
    a.flags.acqSeen[t.k] = true;
    const name = G.TRAITS[t.k].name;
    G.addHistory(a, `「${name}」が付く`);
    G.notify('aging', a.id, `${G.spIcon(a)} ${a.name}に「${name}」が付きました`);
  }
};

// けが（【けがしやすい】のランクに応じて起きる）
G.rollInjury = (a) => {
  const r = G.acqRank(a, 'injuryProne');
  if (!r || !G.chance(G.C.injuryRate * r)) return;
  a.health = Math.max(20, a.health - 25);
  a.stress = Math.min(100, a.stress + 15);
  G.pay(G.C.injuryCost, `けがの治療　${a.name}　${G.yen(G.C.injuryCost)}`);
  G.addHistory(a, 'けがの治療');
};

// ---------- 生産の状態 ----------
G.upkeepOf = (a) => {
  const units = G.isMature(a) ? G.C.feedUnitsAdult : G.C.feedUnitsYoung;
  return Math.round(units * G.C.feedUnitPrice * G.C.feedSeason[(G.S.turn - 1) % 4]);
};
G.nextShipValue = (a) => {
  const b = JSON.parse(JSON.stringify(a));
  b.age++;
  G.growWeight(b, true);
  if (b.castrated) { b.intactPenalty = Math.max(0, b.intactPenalty - 0.05); if (b.castration.period === 'mature') b.castBonus = Math.min(0.1, b.castBonus + 0.15); }
  else if (b.sex === 'M') b.intactPenalty = Math.min(G.C.intactPenaltyMax, b.intactPenalty + G.C.intactPenaltyPerTurn);
  return G.shipValue(b).sales;
};
G.valueTrend = (a) => {
  const now = G.shipValue(a).sales, next = G.nextShipValue(a);
  return next > now + 5000 ? 1 : next < now - 5000 ? -1 : 0;
};
G.productive = (a) => {
  const S = G.S;
  if (!G.isMature(a)) return true;
  if (a.pregnancy) return true;
  if (!a.castrated && G.fertMult(a) > 0) return true;
  if (G.milk.slotOf(a) >= 0 && G.milk.calc(a).income > 0) return true;
  if (S.fields.some((f) => f.open && f.horse === a.id)) return true;
  if ((a.races || []).some((r) => r.turn >= S.turn - 4) || (G.race && G.race.entryOf(a))) return true;
  return false;
};
// 'prod' | 'rising' | 'peak'（肉としての価値だけ。もう伸びない）| 'idle'（生産が止まった）
G.prodState = (a) => {
  if (G.productive(a)) return 'prod';
  if (G.valueTrend(a) > 0) return 'rising';
  const meatOnly = a.castrated && !a.lactation && !(a.races || []).length && a.species === 'cattle';
  return meatOnly ? 'peak' : 'idle';
};
G.checkProdState = (a) => {
  const st = G.prodState(a);
  const prev = a.flags.prodState;
  a.flags.prodState = st;
  if (st === prev || (st !== 'idle' && st !== 'peak')) return;
  if (st === 'idle') G.notify('idle', a.id, `${G.spIcon(a)} ${a.name}の生産が止まりました`);
  else G.notify('peak', a.id, `${G.spIcon(a)} ${a.name}の見込み売上が伸びなくなりました`);
};
