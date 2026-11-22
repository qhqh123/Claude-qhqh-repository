// 個体・遺伝・成長・食肉評価
G.combineRank = (a, b) => {
  a = a | 0; b = b | 0;
  if (a === b) return a === 0 ? 0 : Math.min(a + 1, 5);
  return Math.max(a, b);
};

G.mergeTraits = (list) => {
  const map = {};
  for (const t of list) {
    if (!t || !t.r) continue;
    if (t.k === 'racer') { map.racer = 1; continue; }
    map[t.k] = map[t.k] === undefined ? t.r : G.combineRank(map[t.k], t.r);
  }
  return Object.keys(map).map((k) => ({ k, r: map[k] }));
};

G.inherit = (sireGenes, damGenes) => {
  const genes = {
    length: G.combineRank(sireGenes.length, damGenes.length),
    depth: G.combineRank(sireGenes.depth, damGenes.depth),
  };
  // 【競走馬】は父母ともに持てば自由4枠の外で確定継承
  const has = (g) => (g.traits || []).some((t) => t.k === 'racer');
  const both = has(sireGenes) && has(damGenes);
  const pool = (g) => (g.traits || []).filter((t) => !(both && t.k === 'racer'));
  const k = G.ri(1, 3);
  const fromS = G.shuffle(pool(sireGenes)).slice(0, k);
  const fromD = G.shuffle(pool(damGenes)).slice(0, 4 - fromS.length);
  genes.traits = G.mergeTraits(fromS.concat(fromD)).slice(0, 4);
  if (both) genes.traits.push({ k: 'racer', r: 1 });
  return genes;
};

// 産子の予想（体格は確定、自由特性は継承しうるもの）
G.previewGenes = (sireGenes, damGenes) => {
  const map = {};
  for (const t of (sireGenes.traits || [])) map[t.k] = { k: t.k, r: t.r };
  for (const t of (damGenes.traits || [])) {
    if (t.k === 'racer') { map.racer = { k: 'racer', r: 1 }; continue; }
    map[t.k] = map[t.k] ? { k: t.k, r: G.combineRank(map[t.k].r, t.r) } : { k: t.k, r: t.r };
  }
  return {
    length: G.combineRank(sireGenes.length, damGenes.length),
    depth: G.combineRank(sireGenes.depth, damGenes.depth),
    traits: Object.values(map),
  };
};

G.traitRank = (a, k) => {
  if (k === 'length' || k === 'depth') return a.genes[k] | 0;
  const t = (a.genes.traits || []).find((x) => x.k === k);
  return t ? t.r : 0;
};

// 非発現の理由（発現していれば null）
G.traitInactiveReason = (a, k) => {
  const def = G.TRAITS[k];
  if (!def) return null;
  if (def.femaleOnly && a.sex === 'M') return 'オスのため非発現';
  if (def.intactMaleOnly) {
    if (a.sex === 'F') return 'メスのため非発現';
    if (a.castrated) return '去勢により非発現';
  }
  return null;
};

G.makeAnimal = (o) => {
  const S = G.S;
  const id = 'a' + (S.nextSeq++);
  const sp = o.species || 'cattle';
  const SP = G.SPECIES[sp];
  const a = {
    id,
    idNo: '',
    name: o.name || G.pickName(o.sex, sp),
    species: sp,
    sex: o.sex,
    age: o.age || 0,
    bornTurn: S.turn - (o.age || 0),
    status: 'alive',
    health: 100,
    happiness: G.ri(45, 65),
    stress: 10,
    personality: o.personality || G.pick(G.PERSONALITIES),
    favorite: G.pick(G.ACTIVITIES),
    affinity: { player: G.ri(5, 20), girl: G.ri(10, 30), boy: G.ri(10, 30) },
    likes: [], dislikes: [], motherBond: null,
    breedInterest: 0,
    genes: o.genes,
    sire: o.sire || null, // { id } または { external:true, name, genes }
    dam: o.dam || null,   // id
    children: [],
    castrated: false,
    castration: null,
    pregnancy: null,
    bredTurn: -1,
    openTurns: 0,
    weight: 35,
    castBonus: 0,
    intactPenalty: 0,
    infection: 0,
    lifespan: G.ri(SP.lifeMin, SP.lifeMax),
    trained: 0,
    races: [],
    pasture: o.pasture || 'p1',
    history: [],
    diaries: [],
    flags: {},
    origin: o.origin || 'born',
    x: 0, y: 0,
  };
  S.animals[id] = a;
  a.idNo = G.newIdNumber();
  // 年齢に合わせて体重を進める
  for (let i = 0; i < a.age; i++) G.growWeight(a, true);
  if (G.isMature(a) && a.sex === 'M') a.breedInterest = G.ri(1, 3);
  return a;
};

G.alive = () => Object.values(G.S.animals).filter((a) => a.status === 'alive');
G.isMature = (a) => a.age >= G.SPECIES[a.species || 'cattle'].mature;
G.isHorse = (a) => a && a.species === 'horse';
G.spName = (a) => G.SPECIES[a.species || 'cattle'].name;
G.spIcon = (a) => G.SPECIES[a.species || 'cattle'].icon;
G.isIntactMature = (a) => a.sex === 'M' && !a.castrated && G.isMature(a) && a.status === 'alive';

G.castPeriod = (a) => {
  if (G.isMature(a)) return 'mature';
  if (a.age === 0) return 'early';
  if (a.age <= 2) return 'standard';
  return 'late';
};

G.condition = (a) => {
  const c = 1 + (a.happiness - 50) / 250 - Math.max(0, a.stress - 40) / 150 - (100 - a.health) / 200;
  return G.clamp(c, 0.6, 1.15);
};

G.weightCap = (a) => {
  let cap = G.isHorse(a) ? 440 + a.genes.length * 30 + a.genes.depth * 25 : 620 + a.genes.length * 40 + a.genes.depth * 25;
  if (a.sex === 'F') cap *= 0.9;
  else if (!a.castrated) cap *= 1.15;
  else cap *= ({ early: 1.0, standard: 1.04, late: 1.08, mature: 1.12 })[a.castration.period] || 1;
  return cap;
};

G.growWeight = (a, init) => {
  const growth = G.traitRank(a, 'growth');
  let mult = init ? 1 : G.condition(a);
  if (!init && a.stress > 60) mult *= 0.6;
  if (!init && a.infection > 0) mult *= 0.5;
  const rate = 0.26 * (1 + growth * 0.06) * mult;
  const cap = G.weightCap(a);
  if (a.weight < cap) a.weight += (cap - a.weight) * rate;
  if (!init && a.stress > 85) a.weight *= 0.97;
  // 加齢による痩せ
  if (a.age > G.SPECIES[a.species || 'cattle'].decline) a.weight *= 0.995;
};

// 出荷時の肉質評価（内部数値）
G.meatEval = (a) => {
  let v = G.traitRank(a, 'meat');
  if (a.sex === 'F') v += 0.2;
  if (a.castrated) v += a.castBonus;
  v += Math.min(0.6, Math.max(0, a.age - 2) * 0.15);
  if (a.age > 16) v -= Math.min(1.5, (a.age - 16) * 0.1);
  if (a.stress > 70) v -= 0.3;
  if (a.health < 60) v -= 0.3;
  return v;
};

G.shipValue = (a) => {
  const carcass = Math.round(a.weight * G.C.carcassRatio);
  const q = G.clamp(Math.floor(G.meatEval(a) + 1e-6), 0, 5);
  const yieldRank = G.clamp(a.genes.depth | 0, 0, 5);
  const unit = G.C.carcassUnit[q];
  const pen = a.sex === 'M' ? a.intactPenalty : 0;
  const sales = Math.round(carcass * unit * (1 - pen) / 1000) * 1000;
  return { carcass, q, yieldRank, unit, pen, sales };
};

G.marketValue = (a) => {
  // 生体の評価額（市場の購入価格の基準）
  const sum = a.genes.length + a.genes.depth + (a.genes.traits || []).reduce((s, t) => s + (G.TRAITS[t.k].demerit ? -t.r : t.r), 0);
  const horse = a.species === 'horse';
  const young = a.age < G.SPECIES[a.species || 'cattle'].mature;
  const [lo, hi] = horse ? (young ? G.C.marketFoal : G.C.marketHorse) : (young ? G.C.marketCalf : G.C.marketAdult);
  const base = lo + (hi - lo) * G.clamp(sum / 8, 0, 1);
  let v = base;
  if (a.age > 20) v *= Math.max(0.4, 1 - (a.age - 20) * 0.04);
  return Math.round(v / 10000) * 10000;
};

G.addHistory = (a, text) => {
  a.history.push({ turn: G.S.turn, text });
};

// 好き嫌いの決定（成熟時）
G.assignRelations = (a) => {
  const mates = G.alive().filter((b) => b.id !== a.id && b.pasture === a.pasture && b.species === a.species);
  const pool = G.shuffle(mates.filter((b) => b.id !== a.dam && !a.children.includes(b.id)));
  const nLike = 2 + G.traitRank(a, 'charm');
  const nDislike = 1 + (G.traitRank(a, 'temper') > 0 ? 1 : 0);
  a.likes = pool.slice(0, nLike).map((b) => ({ id: b.id, v: G.ri(1, 3) }));
  a.dislikes = pool.slice(nLike, nLike + nDislike).map((b) => ({ id: b.id, v: -1 }));
};

G.likesAnimal = (a, b) => a.likes.some((l) => l.id === b.id) || (a.motherBond && a.motherBond.id === b.id);

// 産子の登録
G.birth = (dam) => {
  const p = dam.pregnancy;
  const sireGenes = p.sire.external ? p.sire.genes : (G.S.animals[p.sire.id] || {}).genes || p.sire.genes;
  const sex = G.chance(0.5) ? 'M' : 'F';
  const genes = G.inherit(sireGenes, dam.genes);
  let personality = G.pick(G.PERSONALITIES);
  const r = Math.random();
  const sire = p.sire.external ? null : G.S.animals[p.sire.id];
  if (r < 0.25 && sire) personality = sire.personality;
  else if (r < 0.5) personality = dam.personality;
  const calf = G.makeAnimal({ species: dam.species, sex, genes, personality, sire: p.sire.external ? { external: true, name: p.sire.name, genes: p.sire.genes } : { id: p.sire.id }, dam: dam.id, pasture: dam.pasture });
  calf.motherBond = { id: dam.id, v: G.ri(2, 3) };
  G.checkRankS(calf);
  dam.children.push(calf.id);
  if (sire) sire.children.push(calf.id);
  dam.childBonds = dam.childBonds || [];
  dam.childBonds.push({ id: calf.id, v: G.ri(1, 3) });
  dam.pregnancy = null;
  dam.flags.postpartum = true;
  G.addHistory(dam, `出産　${calf.name}（${sex === 'M' ? '♂' : '♀'}）`);
  G.addHistory(calf, `出生　母 ${dam.name}　父 ${p.sire.external ? p.sire.name : (sire ? sire.name : '—')}`);
  return calf;
};
