// 後天バッジ（老化をデフォルメした印）と、生産の状態
// 後天バッジは遺伝しない。genes ではなく a.acquired に持つ。

G.agingStage = (a) => {
  const ages = G.C.agingAge[a.species || 'cattle'];
  if (a.age >= ages[1]) return 2;
  if (a.age >= ages[0]) return 1;
  return 0;
};
G.hasAcq = (a, k) => (a.acquired || []).includes(k);
// 受胎率の倍率（雌雄どちらにも効く）
G.fertMult = (a) => (!a ? 1 : G.hasAcq(a, 'infertile') ? 0 : G.hasAcq(a, 'fertHalf') ? 0.5 : 1);
G.injuryMult = (a) => (G.hasAcq(a, 'infertile') ? 3 : G.hasAcq(a, 'fertHalf') ? 2 : 1);

// ターン終了時（年齢更新後）に後天バッジを付ける
G.applyAging = (a) => {
  const st = G.agingStage(a);
  a.acquired = a.acquired || [];
  const want = st === 2 ? 'infertile' : st === 1 ? 'fertHalf' : null;
  if (!want || G.hasAcq(a, want)) return;
  a.acquired = a.acquired.filter((k) => k !== 'fertHalf' && k !== 'infertile');
  a.acquired.push(want);
  G.addHistory(a, `「${G.TRAITS[want].name}」が付く`);
  G.notify('aging', a.id, `${G.spIcon(a)} ${a.name}に「${G.TRAITS[want].name}」が付きました`);
};

// けが（後天バッジがあると起きやすい）
G.rollInjury = (a) => {
  const m = G.injuryMult(a);
  if (m <= 1 || !G.chance(G.C.injuryRate * m)) return;
  a.health = Math.max(20, a.health - 25);
  a.stress = Math.min(100, a.stress + 15);
  G.pay(G.C.injuryCost, `けがの治療　${a.name}　${G.yen(G.C.injuryCost)}`);
  G.addHistory(a, 'けがの治療');
};

// ---------- 生産の状態 ----------
// 1ターンあたりの維持費（飼料）
G.upkeepOf = (a) => {
  const units = G.isMature(a) ? G.C.feedUnitsAdult : G.C.feedUnitsYoung;
  return Math.round(units * G.C.feedUnitPrice * G.C.feedSeason[(G.S.turn - 1) % 4]);
};
// 次のターンの見込み売上
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
// 今、価値を生む役目についているか
G.productive = (a) => {
  const S = G.S;
  if (!G.isMature(a)) return true;
  if (a.pregnancy) return true;
  if (!G.hasAcq(a, 'infertile') && !a.castrated) return true; // 繁殖に使える
  const mi = G.milk.slotOf(a);
  if (mi >= 0 && G.milk.calc(a).income > 0) return true;
  if (S.fields.some((f) => f.open && f.horse === a.id)) return true;
  if ((a.races || []).some((r) => r.turn >= S.turn - 4) || (G.race && G.race.entryOf(a))) return true;
  return false;
};
// 'prod' | 'rising' | 'peak'（肉としての価値だけ。もう伸びない）| 'idle'（生産が止まった）
G.prodState = (a) => {
  if (G.productive(a)) return 'prod';
  if (G.valueTrend(a) > 0) return 'rising';
  const meatOnly = a.castrated && !(a.lactation) && !(a.races || []).length && a.species === 'cattle';
  return meatOnly ? 'peak' : 'idle';
};
// ターン終了時：状態が変わったら1回だけ通知
G.checkProdState = (a) => {
  const st = G.prodState(a);
  const prev = a.flags.prodState;
  a.flags.prodState = st;
  if (st === prev || (st !== 'idle' && st !== 'peak')) return;
  if (st === 'idle') G.notify('idle', a.id, `${G.spIcon(a)} ${a.name}の生産が止まりました`);
  else G.notify('peak', a.id, `${G.spIcon(a)} ${a.name}の見込み売上が伸びなくなりました`);
};
