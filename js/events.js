// 去勢・交配・出荷・売買
const WORK_MIN = { ring: 10, burdizzo: 15, surgical: 40 };
const GAIN_PRED = { early: 0.2, standard: 0.4, late: 0.6, mature: 0.8 };
const CAST_BONUS = { early: 0.6, standard: 0.5, late: 0.2, mature: -0.5 };
const OUTSOURCE_METHOD = { early: 'ring', standard: 'burdizzo', late: 'surgical', mature: 'surgical' };

G.castMethods = (a) => (G.isHorse(a) ? ['surgical'] : ['ring', 'burdizzo', 'surgical']);
G.castCost = (a, method, mode) => {
  const period = G.castPeriod(a);
  if (G.isHorse(a)) method = 'surgical';
  if (mode === 'outsource') {
    const m = G.isHorse(a) ? 'surgical' : OUTSOURCE_METHOD[period];
    return { method: m, cost: G.C.castOutsource[m], tool: 0 };
  }
  const tool = method === 'burdizzo' && !G.S.tools.burdizzo ? G.C.burdizzoToolCost : 0;
  return { method, cost: G.C.castDirect[method], tool };
};

// 戻り値: 直接対応なら文章イベント { paras, vars, ledger }
G.castrate = (a, methodSel, mode) => {
  const S = G.S;
  const period = G.castPeriod(a);
  const { method, cost, tool } = G.castCost(a, methodSel, mode);
  const [pInc, pInf, extra] = G.C.castRisk[method][period];
  const incomplete = G.chance(pInc);
  const infection = G.chance(pInf);
  const suitable = G.C.castSuitable[period].includes(method);

  if (tool) {
    S.tools.burdizzo = true;
    G.pay(tool, `器具 購入　去勢鉗子　${G.yen(tool)}`);
  }
  a.stress = G.clamp(a.stress + G.C.castStress[period] + extra + G.traitRank(a, 'frail') * 5, 0, 100);
  a.weight *= 1 - G.C.castWeightLoss[period];
  a.castrated = true;
  a.breedInterest = 0;
  a.castration = { period, method, mode, turn: S.turn };
  a.castBonus = CAST_BONUS[period];
  if (period === 'early' && !extra) a.flags.earlyCast = true;

  const short = G.METHOD_SHORT[method];
  const modeName = mode === 'outsource' ? '委託' : '直接';
  const costName = mode === 'outsource' ? '委託費' : (method === 'surgical' ? '獣医' : '資材費');
  const line1 = `去勢（${short}・${modeName}）　${a.name}　${costName} ${G.yen(cost)}` + (mode === 'direct' ? `　作業 ${WORK_MIN[method]}分` : '');
  const line2 = `　増体予測 −${GAIN_PRED[period]}kg/日（1ターン）${period !== 'early' ? '※月齢による' : ''}　格付予測 肉質 ${period === 'mature' ? '→' : '↑'}`;
  G.pay(cost, [line1, line2]);
  G.addHistory(a, `去勢（${short}・${modeName}）　${G.PERIOD_NAMES[period]}`);
  S.pendingCourses.push({ aid: a.id, method, mode, incomplete, infection, turn: S.turn });

  if (mode !== 'direct') return null;
  const ctx = { species: a.species, method, personality: a.personality };
  const staff = G.staffFor(a);
  const steps = [
    'cas.head',
    { pick: `cas.${method}.pre_` },
    `cas.${method}.tool`,
    `cas.${method}.locate`,
    `cas.${a.species}.function_sperm`,
    `cas.${a.species}.function_hormone`,
    `cas.${method}.act`,
  ];
  if (!suitable) steps.push({ pick: `cas.${method}.mismatch_` });
  steps.push(
    { pick: `cas.${method}.react_` },
    { pick: 'cas.react_projection_', p: 0.5 },
    { pick: `cas.staff_${staff}_`, p: 0.3 },
    `cas.${method}.after`,
  );
  const vars = G.textVars(a);
  const ev = { title: '去勢', paras: G.buildParas(steps, ctx), vars, ledger: [line1, line2], aid: a.id };
  G.storeDiary(a, ev);
  return ev;
};

G.storeDiary = (a, ev) => {
  a.diaries.push({ turn: G.S.turn, title: ev.title, paras: ev.paras, vars: ev.vars, ledger: ev.ledger || null });
};

G.deliverCourse = (c) => {
  const a = G.S.animals[c.aid];
  if (!a || a.status !== 'alive') return;
  const ctx = { species: a.species, method: c.method, personality: a.personality };
  if (c.infection) {
    a.infection = G.C.infectionTurns;
    a.health = Math.max(30, a.health - 30);
    a.stress = Math.min(100, a.stress + G.C.infectionStress);
    G.pay(G.C.infectionCost, `感染症 治療　${a.name}　${G.yen(G.C.infectionCost)}　増体予測 低下（${G.C.infectionTurns}ターン）`);
    G.addHistory(a, '感染症 治療');
  }
  if (c.incomplete) {
    a.castrated = false;
    a.castration = null;
    a.castBonus = 0;
    a.flags.earlyCast = false;
    if (G.isMature(a)) a.breedInterest = G.ri(1, 3);
    G.ledger(`去勢 不完全　${a.name}`, 0, 'note');
    G.addHistory(a, '去勢 不完全');
    G.notify('castrate', a.id, `🐮 ${a.name}の去勢が不完全でした`);
  }
  if (c.mode === 'direct') {
    const steps = [{ pick: `cas.${c.method}.course_` }];
    if (c.incomplete) steps.push({ pick: 'cas.course_incomplete_' });
    if (c.infection) steps.push({ pick: 'cas.course_infection_' });
    const ev = { title: '経過日誌', paras: G.buildParas(steps, ctx), vars: G.textVars(a), ledger: null };
    G.storeDiary(a, ev);
    G.notify('diary', a.id, `📔 ${a.name}の経過日誌が届きました`, { diary: a.diaries.length - 1 });
  }
};

// ---------- 交配 ----------
G.canBreed = (a) => a.status === 'alive' && a.sex === 'F' && G.isMature(a) && !a.pregnancy && a.bredTurn !== G.S.turn;

G.partnerNear = (dam) => G.alive().some((b) => G.isIntactMature(b) && b.species === dam.species && b.pasture === dam.pasture && G.likesAnimal(dam, b));
// 当て馬に使える牡馬
G.teasers = () => G.alive().filter((b) => G.isHorse(b) && G.isIntactMature(b));

// partner: { type:'bull', id } | { type:'straw', index }
G.breed = (dam, partner) => {
  const S = G.S;
  dam.bredTurn = S.turn;
  const season = (S.turn - 1) % 4;
  const feed = Math.round(G.C.feedUnitsAdult * G.C.feedUnitPrice * G.C.feedSeason[(season + 1) % 4]);
  let sire, ok, line, ev;
  const vars = G.textVars(dam);
  if (partner.type === 'bull') {
    const bull = S.animals[partner.id];
    sire = { id: bull.id };
    ok = G.chance(G.C.naturalConception);
    line = `自然交配　${dam.name} × ${bull.name}　${ok ? '受胎' : `不受胎　空胎 +1ターン　飼料費 ${G.yen(feed)}`}`;
    vars.partner = bull.name;
    const ctx = { species: dam.species, personality: dam.personality, partner_liked: G.likesAnimal(dam, bull) };
    ev = { title: '交配', paras: G.buildParas(['breed.natural.head', { pick: 'breed.natural.act_' }, { pick: 'breed.natural.after_' }], ctx), vars, aid: dam.id };
    G.addHistory(dam, `自然交配　${bull.name}　${ok ? '受胎' : '不受胎'}`);
    G.addHistory(bull, `自然交配　${dam.name}　${ok ? '受胎' : '不受胎'}`);
  } else if (partner.type === 'stallion') {
    const st = S.stallions[partner.index];
    const teaser = partner.teaser && S.animals[partner.teaser];
    sire = { external: true, name: st.name, genes: st.genes };
    ok = G.chance(G.C.naturalConception + (teaser ? G.C.teaserBonus : 0));
    G.pay(st.fee, `種付け料　${st.name}（外部）　${G.yen(st.fee)}`);
    line = `種付け　${dam.name} × ${st.name}（外部）${teaser ? `　当て馬 ${teaser.name}` : ''}　${ok ? '受胎' : `不受胎　空胎 +1ターン　飼料費 ${G.yen(feed)}`}`;
    vars.partner = st.name;
    const ctx = { species: dam.species, personality: dam.personality };
    const steps = ['breed.stallion.head'];
    if (teaser) steps.push({ pick: 'breed.teaser.act_' }, { pick: 'breed.teaser.after_' });
    steps.push({ pick: 'breed.stallion.act_' }, { pick: 'breed.stallion.after_' });
    ev = { title: '種付け', paras: G.buildParas(steps, ctx), vars, aid: dam.id };
    G.addHistory(dam, `種付け　${st.name}（外部）　${ok ? '受胎' : '不受胎'}`);
    if (teaser) {
      G.addHistory(teaser, `当て馬　${dam.name}`);
      G.storeDiary(teaser, { title: '当て馬', paras: ev.paras.filter((p) => p.startsWith('breed.teaser') || p === 'breed.stallion.head'), vars: G.textVars(teaser, { partner: dam.name }), ledger: null });
    }
  } else {
    const straw = S.straws.splice(partner.index, 1)[0];
    sire = { external: true, name: straw.name, genes: straw.genes };
    ok = G.chance(G.C.aiConception);
    line = `人工授精　${dam.name}　精液ストロー ${straw.name}（${G.TRAITS[straw.main].name}期待${G.rankName(straw.rank)}）${G.yen(straw.price)}　${ok ? '受胎' : `不受胎　空胎 +1ターン　飼料費 ${G.yen(feed)}`}`;
    const near = G.partnerNear(dam);
    const ctx = { species: dam.species, personality: dam.personality, partner_in_pasture: near };
    ev = { title: '人工授精', paras: G.buildParas(['breed.ai.head', { pick: 'breed.ai.estrus_' }, { pick: 'breed.ai.partner_near_' }, { pick: 'breed.ai.staff_' }, 'breed.ai.act', { pick: 'breed.ai.after_partner_' }], ctx), vars, aid: dam.id };
    G.addHistory(dam, `人工授精　${straw.name}　${ok ? '受胎' : '不受胎'}`);
  }
  if (ok) {
    dam.pregnancy = { sire, due: S.turn + G.ri(G.C.gestationMin, G.C.gestationMax), conceived: S.turn };
    dam.openTurns = 0;
  }
  G.ledger(line, 0, 'note');
  ev.ledger = [line];
  G.storeDiary(dam, ev);
  return { ok, ev };
};

// ---------- 出荷・売買 ----------
G.ship = (a) => {
  const S = G.S;
  const v = G.shipValue(a);
  a.status = 'shipped';
  a.endTurn = S.turn;
  G.removeFromSlots(a);
  a.shipped = { turn: S.turn, carcass: v.carcass, q: v.q, yieldRank: v.yieldRank, sales: v.sales };
  G.addHistory(a, '出荷');
  G.earn(v.sales, `出荷　個体識別番号 ${a.idNo}　枝肉 ${v.carcass}kg　肉量 ${G.rankName(v.yieldRank)}　肉質 ${G.rankName(v.q)}　売上 ${G.yen(v.sales)}`);
  G.record('firstShip');
  if (v.q >= 3) G.record('meatA');
  return v;
};

G.sellPrice = (a) => Math.round(G.marketValue(a) * G.C.marketSellRate / 10000) * 10000;

G.sell = (a) => {
  const price = G.sellPrice(a);
  a.status = 'sold';
  a.endTurn = G.S.turn;
  G.removeFromSlots(a);
  a.soldPrice = price;
  G.addHistory(a, '売却');
  G.earn(price, `売却　${a.name}　個体識別番号 ${a.idNo}　${G.yen(price)}`);
  return price;
};

G.buy = (m) => {
  const S = G.S;
  const sp = m.species || 'cattle';
  if (S.money < m.price || !G.hasRoom(sp)) return null;
  const pasture = G.pastureWithRoom(sp);
  if (!pasture) return null;
  const a = G.makeAnimal({ species: sp, sex: m.sex, age: m.age, genes: m.genes, personality: m.personality, origin: 'market', pasture });
  if (G.isMature(a)) G.assignRelations(a);
  S.market = S.market.filter((x) => x !== m);
  G.addHistory(a, '購入');
  G.pay(m.price, `購入　${a.name}　個体識別番号 ${a.idNo}　${G.yen(m.price)}`);
  if (a.sex === 'M' && !G.isMature(a)) G.notify('castrate', a.id, `${G.spIcon(a)} ${a.name}が去勢を検討できる時期になりました！`);
  return a;
};

G.buyStraw = (s) => {
  const S = G.S;
  if (S.money < s.price) return false;
  S.strawCatalog = S.strawCatalog.filter((x) => x !== s);
  S.straws.push(s);
  G.pay(s.price, `精液ストロー 購入　${s.name}（${G.TRAITS[s.main].name}期待${G.rankName(s.rank)}）　${G.yen(s.price)}`);
  return true;
};

G.pastureWithRoom = (sp) => {
  const open = Object.keys(G.S.pastures).filter((p) => G.S.pastures[p].open && G.pastureSpecies(p) === (sp || 'cattle'));
  if (!open.length) return null;
  let best = open[0], min = 1e9;
  for (const p of open) {
    const n = G.alive().filter((a) => a.pasture === p).length;
    if (n < min) { min = n; best = p; }
  }
  return best;
};

// S ランク個体の作出（出生時）
G.checkRankS = (a) => {
  if (a.genes.length >= 5 || a.genes.depth >= 5 || a.genes.traits.some((t) => t.r >= 5 && !G.TRAITS[t.k].demerit)) G.record('rankS');
};
