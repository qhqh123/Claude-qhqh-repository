// ゲーム状態・帳簿・ターン進行
G.newGame = () => {
  G.S = {
    version: G.VERSION,
    turn: 1,
    money: G.C.startMoney,
    loan: G.C.startLoan,
    careLeft: G.C.carePerTurn,
    cattleSlots: G.C.startCattleSlots,
    horseSlots: 0,
    pastures: G.defaultPastures(),
    animals: {},
    nextSeq: 1,
    ledger: [],
    records: {},
    readTexts: {},
    notices: [],
    nextNotice: 1,
    storage: { cap: G.C.storageCap, items: [], next: 1 },
    wood: 0,
    formsIn: [],
    market: [],
    straws: [],
    strawCatalog: [],
    tools: { burdizzo: false },
    staff: { girl: { name: 'ミナミ', pasture: 'p1' }, boy: { name: 'ソウスケ', pasture: 'p1' } },
    pendingCourses: [],
    milkSlots: Array.from({ length: G.C.startMilkSlots }, () => ({ aid: null })),
    fields: Array.from({ length: G.FIELD_SLOTS }, () => ({ open: false, use: 'pasture', horse: null })),
    stallions: [],
    raceCard: [],
    raceEntries: [],
    yearSales: 0,
    lastSummary: null,
    devMode: false,
    player: { x: 1000, y: 880 },
  };
  G.setupHerd();
  G.refreshMarket();
  G.refreshCatalog();
  G.refreshStallions();
  G.race.makeCard();
};

G.defaultPastures = () => {
  const out = {};
  for (const pid of Object.keys(G.MAP.pastures)) out[pid] = { open: pid === 'p1' };
  return out;
};
G.herdCount = (sp) => G.alive().filter((a) => (a.species || 'cattle') === sp).reduce((s, a) => s + G.formOf(a).slot, 0);
G.slotsOf = (sp) => (sp === 'horse' ? G.S.horseSlots : G.S.cattleSlots);
// 飼育枠の合計は放牧地ごとの上限から計算し直す（開拓・拡張・読み込みのたび）
G.recalcSlots = () => {
  const S = G.S;
  S.cattleSlots = G.openPastures('cattle').reduce((s, p) => s + G.pastureCap(p), 0);
  S.horseSlots = G.openPastures('horse').reduce((s, p) => s + G.pastureCap(p), 0);
};
// 放牧地ごとの上限（第1放牧地は最初の飼育枠、開拓した牛の放牧地・馬の放牧地はそれぞれの枠）
// 牛・馬とも同じ（第1放牧地は最初の飼育枠、開拓した放牧地は同じ頭数）。拡張1段階ごとに増える
G.pastureCap = (pid) => (pid === 'p1' ? G.C.startCattleSlots : G.C.pastureOpenSlots) + G.C.pastureExpandSlots * ((G.S.pastures[pid] || {}).stage || 0);
G.pastureStage = (pid) => (G.S.pastures[pid] || {}).stage || 0;
G.expandCost = (pid) => {
  const base = G.C.pastureExpandCost[G.pastureStage(pid)];
  return base === undefined ? undefined : G.woodCost(base, 'pasture');
};
G.pastureOpenCost = () => G.woodCost(G.C.pastureOpenCost, 'pasture');
G.expandPasture = (pid) => {
  const S = G.S, cost = G.expandCost(pid);
  if (!S.pastures[pid].open || cost === undefined || !G.canPayCost(cost)) return false;
  S.pastures[pid].stage = G.pastureStage(pid) + 1;
  G.recalcSlots();
  G.payCost(cost, `放牧地 拡張　${G.MAP_LABEL[pid]}　段階${S.pastures[pid].stage}　飼育枠 +${G.C.pastureExpandSlots}`);
  return true;
};
G.pastureCount = (pid) => G.alive().filter((a) => a.pasture === pid).reduce((s, a) => s + G.formOf(a).slot, 0);
G.pastureExcess = (pid) => Math.max(0, G.pastureCount(pid) - G.pastureCap(pid));
G.openPastures = (sp) => Object.keys(G.S.pastures).filter((p) => G.S.pastures[p].open && (!sp || G.pastureSpecies(p) === sp));
G.totalExcess = () => G.openPastures().reduce((s, p) => s + G.pastureExcess(p), 0);
G.crowdMult = () => 1 + G.C.crowdUpkeepPerHead * G.totalExcess();
G.hasRoom = (sp) => !!G.pastureWithRoom(sp);
// 過密になったら1回だけ警告する
G.checkCrowding = () => {
  const S = G.S;
  S.crowdWarned = S.crowdWarned || {};
  for (const p of G.openPastures()) {
    const ex = G.pastureExcess(p);
    if (ex > 0 && !S.crowdWarned[p]) { S.crowdWarned[p] = true; G.notify('crowd', null, `⚠ ${G.MAP_LABEL[p]}が過密です（${G.pastureCount(p)}/${G.pastureCap(p)}）`, { pid: p }); }
    if (!ex) S.crowdWarned[p] = false;
  }
};

G.setupHerd = () => {
  const mk = G.makeAnimal;
  const cow = (name, age, length, depth, traits) => mk({ name, sex: 'F', age, genes: { length, depth, traits } });
  const c1 = cow('ハナコ', 12, 2, 1, []);
  const c2 = cow('サクラ', 9, 1, 2, [{ k: 'meat', r: 1 }]);
  const c3 = cow('モカ', 14, 1, 1, [{ k: 'milk', r: 1 }]);
  const c4 = cow('チョコ', 10, 2, 1, [{ k: 'milkq', r: 2 }]);
  const bull = mk({ name: 'ゴンタ', sex: 'M', age: 11, genes: { length: 1, depth: 1, traits: [{ k: 'meat', r: 1 }, { k: 'temper', r: 1 }] } });
  bull.personality = '頑固';
  const child = (name, sex, dam, age) => {
    const a = mk({ name, sex, age, genes: G.inherit(bull.genes, dam.genes), sire: { id: bull.id }, dam: dam.id });
    a.motherBond = { id: dam.id, v: G.ri(2, 3) };
    dam.children.push(a.id); bull.children.push(a.id);
    dam.childBonds = dam.childBonds || [];
    dam.childBonds.push({ id: a.id, v: G.ri(1, 3) });
    return a;
  };
  // 肥育中の去勢牛（標準去勢済み）
  for (const [name, dam] of [['クロ', c1], ['マメ', c3]]) {
    const s = child(name, 'M', dam, 5);
    s.castrated = true;
    s.castration = { period: 'standard', method: 'burdizzo', mode: 'outsource', turn: G.S.turn - 4 };
    s.castBonus = 0.5;
    s.breedInterest = 0;
    s.weight = 35;
    for (let i = 0; i < 5; i++) G.growWeight(s, true);
    G.addHistory(s, '去勢（去勢鉗子・委託）');
  }
  child('ゴロウ', 'M', c3, 0);
  child('タロウ', 'M', c4, 0);
  child('ミルク', 'F', c1, 0);
  c2.pregnancy = { sire: { id: bull.id }, due: G.S.turn + 2, conceived: G.S.turn - 1 };
  // 仔牛を産んだばかりの母牛は泌乳1ターン目
  for (const m of [c1, c3, c4]) m.lactation = { start: G.S.turn };
  G.S.milkSlots[0].aid = c3.id;
  for (const a of G.alive()) if (G.isMature(a)) G.assignRelations(a);
  for (const a of G.alive()) a.origin = 'initial';
};

// ---------- 帳簿 ----------
G.ledger = (lines, amount, cat) => {
  if (typeof lines === 'string') lines = [lines];
  const e = { turn: G.S.turn, lines, amount: amount || 0, cat: cat || (amount > 0 ? 'income' : amount < 0 ? 'expense' : 'note') };
  G.S.ledger.push(e);
  return e;
};

G.pay = (amount, lines) => {
  G.S.money -= amount;
  G.ledger(lines, -amount, 'expense');
  G.ui && G.ui.refreshHud();
};

G.earn = (amount, lines, opt) => {
  G.S.money += amount;
  G.S.yearSales += amount;
  G.ledger(lines, amount, 'income');
  if (G.fx && !(opt && opt.silent)) G.fx.moneyPop(amount);
  G.ui && G.ui.refreshHud();
  G.checkRecords();
};

// ---------- 通知 ----------
G.notify = (type, aid, text, extra) => {
  const n = Object.assign({ id: G.S.nextNotice++, turn: G.S.noticeTurn || G.S.turn, type, aid, text, done: false }, extra || {});
  G.S.notices.push(n);
  if (G.ui) G.ui.queueNotice(n);
  return n;
};

// ---------- 牧場の記録 ----------
G.RECORDS = [
  ['firstShip', '初出荷'],
  ['sales100', '年間売上100万円'],
  ['sales500', '年間売上500万円'],
  ['sales1000', '年間売上1000万円'],
  ['meatA', '初めての肉質A評価'],
  ['rankS', '初めてのSランク個体作出'],
  ['loanPaid', '借入完済'],
  ['herd20', '飼育頭数20頭'],
  ['herd50', '飼育頭数50頭'],
];
G.record = (key) => {
  if (G.S.records[key]) return;
  G.S.records[key] = { turn: G.S.turn };
  const def = G.RECORDS.find((r) => r[0] === key);
  if (G.ui && def) G.ui.toast('📒 ' + def[1]);
};
G.checkRecords = () => {
  const S = G.S;
  if (S.yearSales >= 1000000) G.record('sales100');
  if (S.yearSales >= 5000000) G.record('sales500');
  if (S.yearSales >= 10000000) G.record('sales1000');
  if (S.loan <= 0) G.record('loanPaid');
  const n = G.alive().length;
  if (n >= 20) G.record('herd20');
  if (n >= 50) G.record('herd50');
};

// ---------- 市場とカタログ ----------
G.randomTraitRank = () => {
  const r = Math.random(), d = G.C.marketTraitDist;
  return r < d[0] ? 0 : r < d[0] + d[1] ? 1 : 2;
};
G.randomMarketGenes = (sp) => {
  const genes = { length: G.ri(0, 2), depth: G.ri(0, 2), traits: [] };
  for (const k of G.shuffle(G.freeTraits(sp)).slice(0, 3)) {
    const r = G.randomTraitRank();
    if (r) genes.traits.push({ k, r });
  }
  if (G.chance(G.C.marketDemeritRate)) genes.traits.push({ k: G.pick(G.demerits(sp)), r: G.ri(1, 2) });
  genes.traits = genes.traits.slice(0, 4);
  if (sp === 'horse' && G.chance(0.25)) genes.traits.push({ k: 'racer', r: 1 });
  return genes;
};
// 新しいフォームの入荷（年数で。初めて並んだときだけ通知）
G.checkFormArrival = () => {
  const S = G.S;
  S.formsIn = S.formsIn || [];
  const year = Math.floor((S.turn - 1) / 4) + 1;
  let fresh = false;
  for (const f of G.FORM_KEYS) {
    const y = G.C.formArrival[f];
    if (y && year >= y && !S.formsIn.includes(f)) { S.formsIn.push(f); fresh = true; }
  }
  if (fresh) G.notify('newform', null, '家畜市場に新しい品種が入りました');
};
G.refreshMarket = () => {
  G.checkFormArrival();
  const list = [];
  const n = G.ri(3, 4) + 2;
  for (let i = 0; i < n; i++) {
    const species = i < n - 2 ? 'cattle' : 'horse';
    const sex = G.chance(0.5) ? 'M' : 'F';
    const mat = G.SPECIES[species].mature;
    const age = G.chance(0.5) ? G.ri(0, 2) : G.ri(mat, mat + 8);
    list.push({ key: 'm' + G.S.turn + '_' + i, species, sex, age, genes: G.randomMarketGenes(species), personality: G.pick(G.PERSONALITIES) });
  }
  for (const m of list) {
    const tmp = { genes: m.genes, age: m.age, species: m.species };
    m.price = G.marketValue(tmp);
    if (G.S.formsIn.length && G.chance(G.C.formMarketRate)) m.form = G.pick(G.S.formsIn);
  }
  // 基礎的な若い雌牛（特筆は肉質・伸び/骨格・深み/肉付きのどれか1つだけ。安い）
  const nb = G.ri(1, 2);
  for (let i = 0; i < nb; i++) {
    const genes = { length: 0, depth: 0, traits: [] };
    const k = G.pick(['meat', 'length', 'depth']);
    const r = G.chance(0.7) ? 1 : 2;
    if (k === 'meat') genes.traits.push({ k, r }); else genes[k] = r;
    const [lo, hi] = G.C.marketBasic;
    list.push({ key: 'b' + G.S.turn + '_' + i, species: 'cattle', sex: 'F', age: G.ri(1, 3), genes, personality: G.pick(G.PERSONALITIES), price: Math.round((lo + (hi - lo) * (r - 1)) / 10000) * 10000, basic: true });
  }
  G.S.market = list;
};
G.makeStraw = (rank, i) => {
  const main = G.pick(G.STRAW_MAIN);
  const traits = [{ k: main, r: rank }];
  const others = G.shuffle(G.CATTLE_FREE_TRAITS.filter((k) => k !== main)).slice(0, G.ri(0, 2));
  for (const k of others) traits.push({ k, r: G.ri(1, rank === 4 ? 3 : 2) });
  if (G.chance(G.C.strawDemeritRate[rank])) {
    traits.push({ k: G.pick(G.CATTLE_DEMERITS), r: rank === 4 ? G.ri(2, 3) : G.ri(1, 2) });
  }
  return {
    key: 's' + G.S.turn + '_' + i,
    name: G.pick(G.STRAW_NAMES),
    rank, main,
    price: G.C.strawPrice[rank],
    genes: { length: G.ri(rank - 1, rank), depth: G.ri(rank - 1, rank), traits: traits.slice(0, 4) },
  };
};
// 外部種牡馬（競走向けはデメリットが多い。Sは出さない）
G.makeStallion = (type, rank, i) => {
  const traits = [];
  if (type === 'farm') {
    traits.push({ k: 'stamina', r: rank });
    if (G.chance(0.5)) traits.push({ k: G.pick(['growth', 'meat', 'charm']), r: G.ri(1, 2) });
    if (G.chance(0.3)) traits.push({ k: G.pick(G.HORSE_DEMERITS), r: G.ri(1, 2) });
  } else {
    const main = G.pick(['speed', 'stamina']);
    traits.push({ k: main, r: rank });
    traits.push({ k: main === 'speed' ? 'stamina' : 'speed', r: G.ri(rank - 2, rank - 1) });
    const nDem = rank === 4 ? 2 : G.ri(1, 2);
    for (const k of G.shuffle(G.HORSE_DEMERITS).slice(0, nDem)) traits.push({ k, r: rank === 4 ? G.ri(2, 3) : G.ri(1, 2) });
    traits.splice(4);
    traits.push({ k: 'racer', r: 1 });
  }
  const key = type === 'farm' ? 'farm3' : rank === 4 ? 'race4' : 'race3';
  return {
    key: 'h' + G.S.turn + '_' + i,
    name: G.pick(G.STALLION_NAMES),
    type, rank,
    main: type === 'farm' ? 'stamina' : traits[0].k,
    fee: G.C.stallionFee[key],
    genes: { length: G.ri(rank - 1, rank), depth: type === 'farm' ? G.ri(rank - 1, rank) : G.ri(1, 2), traits },
  };
};
// 外部の種雄（精液ストロー・外部種牡馬）のフォーム：入荷済みのフォームから
G.extForm = () => (G.S.formsIn && G.S.formsIn.length && G.chance(G.C.formMarketRate) ? G.pick(G.S.formsIn) : undefined);
G.refreshStallions = () => {
  G.S.stallions = [G.makeStallion('farm', 3, 0), G.makeStallion('farm', 3, 1), G.makeStallion('race', 3, 2), G.makeStallion('race', 4, 3)];
  for (const s of G.S.stallions) { const f = G.extForm(); if (f) s.form = f; }
};

G.refreshCatalog = () => {
  const list = [];
  for (let i = 0; i < 3; i++) list.push(G.makeStraw(3, i));
  list.push(G.makeStraw(4, 3));
  for (const s of list) { const f = G.extForm(); if (f) s.form = f; }
  G.S.strawCatalog = list;
};

// ---------- 他の牧場の手伝い ----------
G.sideWork = (n) => {
  const S = G.S;
  n = Math.min(n, S.careLeft);
  if (n <= 0) return 0;
  S.careLeft -= n;
  const wage = n * G.C.sideWorkWage;
  G.earn(wage, `手伝い　他の牧場　お世話 ${n}回分　${G.yen(wage)}`);
  return wage;
};

// ---------- 施設 ----------
G.openPasture = (pid) => {
  const S = G.S;
  const horse = G.pastureSpecies(pid) === 'horse';
  const cost = G.pastureOpenCost();
  if (S.pastures[pid].open || !G.canPayCost(cost)) return false;
  S.pastures[pid].open = true;
  S.pastures[pid].stage = 0;
  G.recalcSlots();
  G.payCost(cost, `放牧地 開拓　${G.MAP_LABEL[pid]}　飼育枠（${horse ? '馬' : '牛'}） +${G.C.pastureOpenSlots}`);
  return true;
};

// ---------- ターン終了 ----------
G.endTurn = () => {
  const S = G.S;
  const season = (S.turn - 1) % 4;
  const births = [];
  S.noticeTurn = S.turn + 1;

  // 生産とレース（今季の状態で計算）
  G.runProduction();
  G.race.resolve();

  for (const a of G.alive()) {
    a.age++;
    // 感染
    if (a.infection > 0) { a.infection--; a.health = Math.min(100, a.health + 15); }
    else a.health = Math.min(100, a.health + 5);
    // ストレス回復
    const likedHere = G.alive().some((b) => b.pasture === a.pasture && G.likesAnimal(a, b));
    const dislikedHere = G.alive().some((b) => b.pasture === a.pasture && a.dislikes.some((d) => d.id === b.id));
    const staffMatch = G.staffMatches(a);
    let rec = 20 - G.traitRank(a, 'frail') * 3 + (likedHere ? 5 : 0) + (staffMatch ? 5 : 0);
    if (a.flags.earlyCast) { rec = 100; a.flags.earlyCast = false; }
    if (a.flags.linger > 0) { rec = Math.round(rec / 2); a.flags.linger--; }
    if (G.pastureExcess(a.pasture) > 0) rec = 0; // 過密の放牧地では自然には回復しない（ストレスは下で少しずつ加わる）
    a.stress = G.clamp(a.stress - rec + (dislikedHere ? 3 : 0), 0, 100);
    if (G.traitRank(a, 'temper') && !a.castrated && a.sex === 'M' && G.chance(0.1 * G.traitRank(a, 'temper'))) a.stress = Math.min(100, a.stress + 10);
    // 幸福度
    const target = 50 + (likedHere ? 8 : 0) - (dislikedHere ? 6 : 0) + (staffMatch ? 3 : 0) + (a.affinity.player + a.affinity.girl + a.affinity.boy) / 30;
    if (staffMatch) { const sk = G.STAFF_FOR_PERSONALITY[a.personality]; a.affinity[sk] = Math.min(100, a.affinity[sk] + 2); }
    a.happiness = G.clamp(a.happiness + (target - a.happiness) * 0.3, 0, 100);
    // 成長
    G.growWeight(a);
    // 去勢による補正の推移
    if (a.castrated) {
      a.intactPenalty = Math.max(0, a.intactPenalty - 0.05);
      if (a.castration.period === 'mature') a.castBonus = Math.min(0.1, a.castBonus + 0.15);
    } else if (a.sex === 'M') {
      a.intactPenalty = Math.min(G.C.intactPenaltyMax, a.intactPenalty + G.C.intactPenaltyPerTurn);
    }
    // 空胎
    if (a.sex === 'F' && G.isMature(a) && !a.pregnancy) a.openTurns++;
    // 成熟
    G.applyAging(a);
    if (G.pastureExcess(a.pasture) > 0) a.stress = Math.min(100, a.stress + G.C.crowdStress);
    G.rollInjury(a);
    // 当代能力は少しずつ落ちる
    if (a.trained) a.trained = Math.max(0, a.trained - G.C.trainDecay);
    if (a.age === G.SPECIES[a.species || 'cattle'].mature) {
      G.assignRelations(a);
      if (a.sex === 'M' && !a.castrated) a.breedInterest = G.ri(1, 3);
      if (a.sex === 'F') G.notify('breedable', a.id, `${G.spIcon(a)} ${a.name}が交配できるようになりました！`);
    }
    // 出荷適期
    if (a.species !== 'horse' && a.age === G.C.cattleShipAgeMin) G.notify('ship', a.id, `🐮 ${a.name}が出荷適期になりました！`);
    // 出産
    if (a.pregnancy && a.pregnancy.due <= S.turn + 1) births.push(a);
    // 泌乳の低下（次のターンの状態で判定）
    if (a.lactation && G.milk.slotOf(a) >= 0) {
      const k = S.turn + 1 - a.lactation.start + 1;
      if (k === G.C.milkLowAt && !a.pregnancy) G.notify('milklow', a.id, `🐮 ${a.name}の乳量が下がってきました`);
    }
    else if (a.flags.postpartum) { a.flags.postpartum = false; G.notify('breedable', a.id, `${G.spIcon(a)} ${a.name}が交配できるようになりました！`); }
  }

  // 出産（年齢更新後）
  const newborns = [];
  for (const dam of births) {
    const calf = G.birth(dam);
    calf.bornTurn = S.turn + 1;
    newborns.push(calf);
    dam.lactation = { start: S.turn + 1 };
    if (G.milk.slotOf(dam) < 0) G.notify('milkable', dam.id, `🐮 ${dam.name}が搾乳できるようになりました！`, { card: false });
  }

  // 死亡
  for (const a of G.alive()) {
    if (newborns.includes(a)) continue;
    let dead = false;
    if (a.age > a.lifespan && G.chance(G.C.oldAgeDeathRate)) dead = 'old';
    else if (G.chance(G.C.accidentRate * G.injuryMult(a))) dead = 'accident';
    if (dead) {
      a.status = 'dead';
      a.endTurn = S.turn + 1;
      G.removeFromSlots(a);
      G.addHistory(a, '死亡');
      G.ledger(`死亡　${a.name}　個体識別番号 ${a.idNo}`, 0, 'note');
      G.notify('death', a.id, `${G.spIcon(a)} ${a.name}が死亡しました`);
    }
  }

  // 維持費
  // 生まれたばかりの仔は今季の飼料に数えない
  for (const c of newborns) c.status = 'newborn';
  const fb = G.feedBalance();
  for (const c of newborns) c.status = 'alive';
  const cm = G.crowdMult();
  const crowdNote = cm > 1 ? `　過密 +${Math.round((cm - 1) * 100)}%` : '';
  fb.cost = Math.round(fb.cost * cm);
  if (fb.cost) G.pay(fb.cost, `飼料費　必要 ${fb.need}単位　自給 ${fb.self}単位　購入 ${fb.buy}単位${crowdNote}　${G.yen(fb.cost)}`);
  else G.ledger(`飼料　必要 ${fb.need}単位　自給 ${fb.self}単位`, 0, 'note');
  if (fb.surplusIncome) G.earn(fb.surplusIncome, `飼料 売却　${fb.surplus}単位　${G.yen(fb.surplusIncome)}`, { silent: true });
  const up = G.upkeepBreakdown();
  up.total = Math.round(up.total * cm);
  G.pay(up.total, `施設維持費　放牧地・畜舎 ${up.pastures}区画　搾乳 ${up.milk}枠${up.fields ? `　畑 ${up.fields}区画` : ''}${crowdNote}　${G.yen(up.total)}`);
  G.pay(G.C.staffWage, `人件費　厩務員 2名　${G.yen(G.C.staffWage)}`);

  // 季節の収支
  const allThisTurn = S.ledger.filter((e) => e.turn === S.turn);
  const income = allThisTurn.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const expense = -allThisTurn.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0);
  const summary = { turn: S.turn, income, expense, entries: allThisTurn.filter((e) => e.amount !== 0), settlement: null };

  // 年次決算（冬）
  if (season === 3) {
    const due = Math.min(G.C.yearlyRepay, S.loan);
    const paid = Math.max(0, Math.min(due, S.money));
    const unpaid = due - paid;
    if (paid > 0) {
      S.money -= paid; S.loan -= paid;
      G.ledger(`借入金 返済　${G.yen(paid)}　残高 ${G.yen(S.loan)}`, -paid, 'repay');
    }
    let interest = 0;
    if (unpaid > 0) {
      interest = Math.round(unpaid * G.C.loanRate);
      S.loan += interest;
      G.ledger(`借入金 返済不足　${G.yen(unpaid)}　利息 ${G.yen(interest)}　残高 ${G.yen(S.loan)}`, 0, 'note');
    }
    summary.settlement = { sales: S.yearSales, due, paid, unpaid, interest, loan: S.loan };
    S.yearSales = 0;
  }

  // 資金不足
  if (S.money < 0) {
    const short = -S.money;
    S.loan += short;
    S.money = 0;
    G.ledger(`借入金 振替　${G.yen(short)}`, 0, 'note');
    summary.borrowed = short;
  }
  summary.money = S.money;
  summary.loan = S.loan;

  // 次のターンへ
  S.turn++;
  S.noticeTurn = null;
  S.careLeft = G.C.carePerTurn;
  for (const a of newborns) {
    const dam = S.animals[a.dam];
    G.notify('birth', a.id, `${a.name}（${a.sex === 'M' ? '♂' : '♀'}）${dam ? `　母 ${dam.name}` : ''}`, { title: '新しい家族が生まれました！', dam: a.dam });
    if (a.sex === 'M') G.notify('castrate', a.id, `${G.spIcon(a)} ${a.name}が去勢を検討できる時期になりました！`, { card: false });
  }
  // 経過日誌
  const due = S.pendingCourses.filter((c) => c.turn < S.turn);
  S.pendingCourses = S.pendingCourses.filter((c) => c.turn >= S.turn);
  for (const c of due) G.deliverCourse(c);
  G.refreshMarket();
  G.refreshCatalog();
  G.refreshStallions();
  G.race.makeCard();
  for (const a of G.alive()) G.checkProdState(a);
  G.checkCrowding();
  G.checkRecords();
  G.senior.check();
  S.lastSummary = summary;
  G.save.auto();
  return summary;
};
