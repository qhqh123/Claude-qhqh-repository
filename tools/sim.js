// 自動プレーによるバランス検証
// 使い方: node tools/sim.js [回数=200] [年数=10]
//   ONLY='農耕' で名前に含む方針だけ実行（軽い確認用）
//   SEED=123 で乱数の種を固定
// ゲームの計算部分（画面以外）をそのまま読み込み、方針の違うプレーヤーに遊ばせて集計する。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
global.window = global;
global.G = {};
// 乱数の種：SEED=123 node tools/sim.js で、同じ結果を再現できる
if (process.env.SEED) {
  let t = +process.env.SEED >>> 0;
  Math.random = () => { t = (t + 0x6D2B79F5) >>> 0; let x = t; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
const files = ['consts', 'util', 'text-data', 'text', 'look', 'animals', 'game', 'events', 'production', 'race', 'relations', 'storage', 'wood', 'senior', 'aging', 'save', 'map'];
for (const f of files) vm.runInThisContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), { filename: f + '.js' });
G.text.setFromBundle(window.TEXT_DATA);
// 調整案を試す: TUNE='{"staffWage":50000}' node tools/sim.js
if (process.env.TUNE) Object.assign(G.C, JSON.parse(process.env.TUNE));
if (process.env.ONLY_ECON) process.env.SKIP_CAST = '1';

const RUNS = +process.argv[2] || 200;
const YEARS = +process.argv[3] || 10;

// ---------- 方針 ----------
const shipReady = (a) => a.species === 'cattle' && a.castrated && a.age >= 6;
// 種牛が年を取ってきたら、雄の仔牛を1頭だけ後継ぎとして残す
const successor = () => {
  const bull = bullOf();
  if (bull && bull.age < G.AGING.cattle.fert.M[0] - 6) return null;
  const intactYoung = G.alive().filter((a) => a.species === 'cattle' && a.sex === 'M' && !a.castrated && !G.isMature(a));
  return intactYoung.sort((x, y) => x.age - y.age)[0] || null;
};
const castrateCalves = (method, mode) => {
  const keep = successor();
  for (const a of G.alive()) {
    if (a.species !== 'cattle' || a.sex !== 'M' || a.castrated || a === bullOf() || a === keep) continue;
    if (G.castPeriod(a) === 'standard') G.castrate(a, method, mode);
  }
};
const bullOf = () => G.alive().filter((a) => a.species === 'cattle' && G.isIntactMature(a) && G.fertMult(a) > 0).sort((x, y) => x.age - y.age)[0];
const fillMilk = () => {
  const S = G.S;
  for (let i = 0; i < S.milkSlots.length; i++) {
    const s = S.milkSlots[i];
    const cur = s.aid && S.animals[s.aid];
    const best = G.alive().filter((a) => G.milk.canPlace(a)).sort((x, y) => G.milk.calc(y).income - G.milk.calc(x).income)[0];
    if (!cur && best && G.milk.calc(best).income > 0) G.milk.place(i, best);
    else if (cur && best && G.milk.calc(best).income > G.milk.calc(cur).income * 1.5) { G.milk.remove(i); G.milk.place(i, best); }
  }
};
const breedNatural = () => {
  const bull = bullOf();
  if (!bull) return;
  for (const a of G.alive()) if (a.species === 'cattle' && G.canBreed(a)) G.breed(a, { type: 'bull', id: bull.id });
};
const breedAI = () => {
  const S = G.S;
  for (const a of G.alive()) {
    if (a.species !== 'cattle' || !G.canBreed(a)) continue;
    if (!S.straws.length) {
      const s = S.strawCatalog.filter((x) => x.rank === 3).sort((x, y) => strawScore(y) - strawScore(x))[0];
      if (s && S.money > 500000) G.buyStraw(s);
    }
    if (S.straws.length) G.breed(a, { type: 'straw', index: 0 });
    else if (bullOf()) G.breed(a, { type: 'bull', id: bullOf().id });
  }
};
const strawScore = (s) => s.genes.length + s.genes.depth + s.genes.traits.reduce((t, x) => t + (G.TRAITS[x.k].demerit ? -x.r : x.r), 0);
const shipAll = () => { for (const a of G.alive()) if (shipReady(a)) G.ship(a); };
const sellExtraBulls = () => {
  // 受胎できない種牛と、2頭目以降の種牛は出荷
  const best = bullOf();
  for (const b of G.alive().filter((a) => a.species === 'cattle' && G.isIntactMature(a))) if (b !== best) G.ship(b);
};
// 繁殖用の雌牛は5頭まで。余った若い雌は売る（普通のプレーヤーがすること）
const manageHerd = () => {
  const cows = G.alive().filter((a) => a.species === 'cattle' && a.sex === 'F');
  const score = (a) => a.genes.length + a.genes.depth + a.genes.traits.reduce((t, x) => t + (G.TRAITS[x.k].demerit ? -x.r : x.r), 0);
  const fertile = (a) => G.fertMult(a) > 0;
  const keep = cows.filter(fertile).sort((x, y) => score(y) - score(x) || x.age - y.age).slice(0, 6);
  for (const a of cows) if (!keep.includes(a) && a.age >= 2 && !a.flags.simHeifer && !a.pregnancy) G.sell(a);
};
// 「生産なし」の通知が出た個体は出荷する（牛）
const cullOldCows = () => { for (const a of G.alive()) if (a.species === 'cattle' && G.isMature(a) && ['idle', 'peak'].includes(G.prodState(a))) G.ship(a); };
const keepUnderCap = () => {
  const over = G.herdCount('cattle') - G.S.cattleSlots;
  if (over > 0) G.alive().filter((a) => a.species === 'cattle' && a.sex === 'M' && a.castrated).sort((x, y) => y.age - x.age).slice(0, over).forEach((a) => (a.age >= 3 ? G.ship(a) : G.sell(a)));
};

// ---------- 余ったお世話と木材 ----------
// CARE（方針ごとに切り替える）
//   none   : 余ったお世話を使わない。拡張の木材は全部町で買う
//   lumber : 木こり小屋で木材を貯める（WOOD_GOAL まで。超えたら手伝い）。木材は買わず、貯まるまで待つ
//   work   : 手伝いで現金を得て、拡張のときに不足分の木材を町で買う
let CARE = 'none';
const WOOD_GOAL = 250;
const spendCare = () => {
  const n = G.S.careLeft;
  if (!n || CARE === 'none') return;
  if (CARE === 'lumber' && (G.S.wood || 0) < WOOD_GOAL) SIM.woodGot += G.lumberWork(n); else G.sideWork(n);
};
// 拡張する。木材が足りなければ（lumber 以外は）不足分を買う。予備の現金 reserve を残せるときだけ
const build = (cost, fn, reserve) => {
  if (!cost) return false;
  const short = G.woodShort(cost);
  if (short && CARE === 'lumber') return false;
  if (G.S.money < cost.money + short * G.C.woodBuyPrice + reserve) return false;
  if (!G.buyShortWood(cost)) return false;
  return fn();
};
// 牛が上限に近づいたら、放牧地を拡張（安い段階から）→ なければ丘を開拓
const growPastures = (reserveExpand, reserveOpen) => {
  const S = G.S;
  if (G.herdCount('cattle') < S.cattleSlots - 1) return;
  const ps = G.openPastures('cattle').filter((p) => G.expandCost(p)).sort((a, b) => G.C.pastureExpandCost[G.pastureStage(a)] - G.C.pastureExpandCost[G.pastureStage(b)]);
  if (ps.length && build(G.expandCost(ps[0]), () => G.expandPasture(ps[0]), reserveExpand)) return;
  const hill = ['p2', 'p3', 'p4', 'p5'].find((p) => !S.pastures[p].open);
  if (hill) build(G.pastureOpenCost(), () => G.openPasture(hill), reserveOpen);
};

const STRATEGIES = {
  '何もしない': () => {},
  '基本（自然交配・標準去勢・出荷）': () => {
    castrateCalves('burdizzo', 'outsource'); breedNatural(); fillMilk(); shipAll(); sellExtraBulls(); cullOldCows(); manageHerd(); keepUnderCap();
  },
  '改良と搾乳（人工授精・増設）': () => {
    const S = G.S;
    castrateCalves('burdizzo', 'direct'); breedAI(); fillMilk(); shipAll(); sellExtraBulls(); cullOldCows(); manageHerd();
    const lact = G.alive().filter((a) => G.milk.canPlace(a) && G.milk.calc(a).income > 100000).length;
    if (lact > 0 && S.money > G.C.milkSlotCost + 1500000) G.milk.addSlot();
    const closed = S.fields.findIndex((f) => !f.open);
    if (closed >= 0) build(G.field.openCost(), () => G.field.open(closed), 2000000);
    growPastures(2000000, 3000000);
    keepUnderCap();
  },
  '育成牛を買って育てて売る': () => {
    const S = G.S;
    STRATEGIES['基本（自然交配・標準去勢・出荷）']();
    for (const m of S.market.filter((x) => x.basic)) {
      if (S.money > m.price + 800000 && G.hasRoom('cattle')) { const a = G.buy(m); if (a) { a.flags.simHeifer = m.price; SIM.heiferBought += m.price; SIM.heiferN++; } }
    }
    for (const a of G.alive()) if (a.flags.simHeifer && G.isMature(a)) { SIM.heiferSold += G.sell(a); SIM.heiferDone++; }
  },
  '農耕馬で商業作物': () => {
    const S = G.S;
    STRATEGIES['基本（自然交配・標準去勢・出荷）']();
    if (!S.pastures.h1.open) build(G.pastureOpenCost(), () => G.openPasture('h1'), 1000000);
    if (!S.pastures.h1.open) return;
    for (const m of S.market.filter((x) => x.species === 'horse' && x.age >= 6)) if (S.money > m.price + 800000 && G.hasRoom('horse') && G.herdCount('horse') < 3) G.buy(m);
    for (const h of G.alive().filter((a) => G.isHorse(a) && G.isMature(a))) {
      if (h.sex === 'M' && !h.castrated) G.castrate(h, 'surgical', 'direct');
      if (S.fields.some((f) => f.horse === h.id)) continue;
      let i = S.fields.findIndex((f) => f.open && !f.horse);
      if (i < 0) { const j = S.fields.findIndex((f) => !f.open); if (j >= 0 && build(G.field.openCost(), () => G.field.open(j), 500000)) i = j; }
      if (i >= 0 && S.fields[i].open) { G.field.setUse(i, 'crop'); G.field.assign(i, h); }
    }
  },
  '競馬（2年目から）': () => {
    const S = G.S;
    STRATEGIES['基本（自然交配・標準去勢・出荷）']();
    if (S.turn < 5) return;
    if (!S.pastures.h1.open) build(G.pastureOpenCost(), () => G.openPasture('h1'), 1000000);
    if (S.pastures.h1.open) {
      for (const m of S.market.filter((x) => x.species === 'horse' && x.sex === 'F' && x.age >= 6)) if (S.money > m.price + 1000000 && G.hasRoom('horse')) G.buy(m);
      for (const a of G.alive()) {
        if (!G.isHorse(a)) continue;
        if (G.canBreed(a)) { const i = S.stallions.findIndex((s) => s.type === 'race' && s.rank === 3); if (i >= 0 && S.money > S.stallions[i].fee + 500000) G.breed(a, { type: 'stallion', index: i }); }
        if (a.sex === 'M' && !a.castrated && G.castPeriod(a) === 'standard') G.castrate(a, null, 'outsource');
        if (G.isMature(a) && !G.race.entryOf(a)) {
          const exp = (G.traitRank(a, 'speed') + G.traitRank(a, 'stamina')) * 5 + 5 + (G.traitRank(a, 'racer') ? 5 : 0);
          const card = S.raceCard.slice().reverse().find((r) => G.C.races[r.grade].line[0] <= exp && G.race.canEnter(a, r));
          if (card) G.race.enter(a, card.key);
        }
        if (G.isMature(a)) { a.trained = Math.min(100, (a.trained || 0) + 8); }
      }
    }
  },
};

// ---------- 実行 ----------
const pct = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const man = (v) => (v / 10000).toFixed(0) + '万';
const results = {};
const SIM = { heiferBought: 0, heiferSold: 0, heiferN: 0, heiferDone: 0 };
const CARE_NAME = { none: 'お世話：使わない', lumber: '木こり小屋で木材', work: '手伝い＋木材購入' };
const BUILDERS = ['改良と搾乳（人工授精・増設）', '農耕馬で商業作物', '競馬（2年目から）'];
const PLAN = [];
for (const [name, play] of Object.entries(STRATEGIES)) {
  if (BUILDERS.includes(name)) for (const c of ['none', 'lumber', 'work']) PLAN.push([`${name}／${CARE_NAME[c]}`, play, c]);
  else PLAN.push([name, play, 'none']);
}
for (const [name, play, care] of PLAN) {
  if (process.env.ONLY && !name.includes(process.env.ONLY)) continue;
  CARE = care;
  const r = { woodGot: [], woodBuy: [], workInc: [], builds: [], cap: [], y1short: [], y1ok: 0, paidYear: [], money: [], loan: [], firstS: [], borrowed: [], herd: [], raceIncome: [], shipped: [], milkIncome: [], milkSlotTurns: 0, milkTotal: 0, cropTurns: 0, cropTotal: 0, horseTurns: 0 };
  Object.assign(SIM, { heiferBought: 0, heiferSold: 0, heiferN: 0, heiferDone: 0 });
  for (let run = 0; run < RUNS; run++) {
    G.newGame();
    let borrowed = 0, raceInc = 0, milkInc = 0, paid = null, woodBuy = 0, workInc = 0;
    SIM.woodGot = 0;
    for (let t = 0; t < YEARS * 4; t++) {
      play();
      spendCare();
      r.milkSlotTurns += G.S.milkSlots.filter((x) => x.aid).length;
      const cropF = G.S.fields.filter((f) => f.open && f.use === 'crop' && f.horse).length;
      r.cropTurns += cropF;
      const s = G.endTurn();
      for (const e of s.entries) { if (e.lines[0].startsWith('搾乳')) r.milkTotal += e.amount; if (e.lines[0].startsWith('畑')) r.cropTotal += e.amount; }
      borrowed += s.borrowed || 0;
      for (const e of s.entries) {
        const l = e.lines[0];
        if (l.startsWith('レース')) raceInc += e.amount;
        if (l.startsWith('搾乳')) milkInc += e.amount;
        if (l.startsWith('木材 購入')) woodBuy -= e.amount;
        if (l.startsWith('手伝い')) workInc += e.amount;
      }
      if (s.settlement && t === 3) { r.y1short.push(s.settlement.unpaid); if (!s.settlement.unpaid) r.y1ok++; }
      if (paid === null && G.S.loan <= 0) paid = Math.floor(t / 4) + 1;
    }
    r.paidYear.push(paid === null ? 99 : paid);
    r.money.push(G.S.money); r.loan.push(G.S.loan); r.borrowed.push(borrowed);
    r.firstS.push(G.S.records.rankS ? Math.floor((G.S.records.rankS.turn - 1) / 4) + 1 : 99);
    r.herd.push(G.alive().length); r.raceIncome.push(raceInc); r.milkIncome.push(milkInc);
    r.shipped.push(Object.values(G.S.animals).filter((a) => a.status === 'shipped').length);
    const S = G.S;
    r.woodGot.push(SIM.woodGot); r.woodBuy.push(woodBuy); r.workInc.push(workInc);
    r.builds.push(Object.keys(S.pastures).filter((p) => p !== 'p1' && S.pastures[p].open).length + Object.keys(S.pastures).reduce((t, p) => t + G.pastureStage(p), 0) + S.fields.filter((f) => f.open).length);
    r.cap.push(S.cattleSlots);
  }
  r.heifer = Object.assign({}, SIM);
  results[name] = r;
}

console.log(`# 自動プレー結果（${RUNS}回 × ${YEARS}年）\n`);
console.log('| 方針 | 1年目に全額返済 | 1年目の返済不足（中央値） | 完済した年（中央値） | 10年で完済した割合 | 最終の所持金（中央値） | 最終の借入金（中央値） | 自動借入の合計（中央値） | 出荷頭数（中央値） | 搾乳収入（累計中央値） | レース収支（累計中央値） | Sランク初作出（中央値） |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const [name, r] of Object.entries(results)) {
  const paidRate = r.paidYear.filter((y) => y <= YEARS).length / RUNS;
  const py = pct(r.paidYear, 0.5);
  const fs_ = pct(r.firstS, 0.5);
  console.log(`| ${name} | ${Math.round(r.y1ok / RUNS * 100)}% | ${man(pct(r.y1short, 0.5))} | ${py > YEARS ? '—' : py + '年目'} | ${Math.round(paidRate * 100)}% | ${man(pct(r.money, 0.5))} | ${man(pct(r.loan, 0.5))} | ${man(pct(r.borrowed, 0.5))} | ${pct(r.shipped, 0.5)} | ${man(pct(r.milkIncome, 0.5))} | ${man(pct(r.raceIncome, 0.5))} | ${fs_ > YEARS ? '—' : fs_ + '年目'} |`);
}

// ---------- 木材と拡張 ----------
console.log('\n# 余ったお世話・木材と拡張（累計の中央値）\n');
console.log('| 方針 | 木こり小屋で得た木材 | 木材の購入額 | 手伝いの収入 | 開拓・拡張の回数 | 最終の牛の上限 |');
console.log('|---|---|---|---|---|---|');
for (const [name, r] of Object.entries(results)) {
  console.log(`| ${name} | ${pct(r.woodGot, 0.5)} | ${man(pct(r.woodBuy, 0.5))} | ${man(pct(r.workInc, 0.5))} | ${pct(r.builds, 0.5)} | ${pct(r.cap, 0.5)} |`);
}

// ---------- 施設の元が取れるまで ----------
console.log('\n# 施設の収支（1枠・1ターンあたりの平均）\n');
const C = G.C;
for (const [name, r] of Object.entries(results)) {
  if (r.milkSlotTurns) {
    const per = r.milkTotal / r.milkSlotTurns;
    console.log(`- ${name}：搾乳1枠 ${man(per)}／ターン（維持費 ${man(C.milkSlotUpkeep)}）→ 増設費 ${man(C.milkSlotCost)} の回収 ${(C.milkSlotCost / Math.max(1, per - C.milkSlotUpkeep) / 4).toFixed(1)}年`);
  }
  if (r.cropTurns) {
    const per = r.cropTotal / r.cropTurns;
    const horseFeed = C.feedUnitsAdult * C.feedUnitPrice;
    console.log(`- ${name}：商業作物1区画 ${man(per)}／ターン（馬の飼料 ${man(horseFeed)}・維持費 ${man(C.fieldUpkeep)}）→ 差し引き ${man(per - horseFeed - C.fieldUpkeep)}／ターン`);
  }
  if (r.heifer.heiferDone) {
    const buy = r.heifer.heiferBought / r.heifer.heiferN, sell = r.heifer.heiferSold / r.heifer.heiferDone;
    console.log(`- ${name}：育成牛 平均購入 ${man(buy)} → 平均売却 ${man(sell)}（${r.heifer.heiferDone}頭。飼料は別）`);
  }
}
const pastureSave = C.fieldPastureBase * 0.5 * C.feedUnitPrice;
console.log(`- 畑（馬なしの牧草）：1区画 ${man(pastureSave)}／ターン分の飼料を自給、維持費 ${man(C.fieldUpkeep)} → 開拓費 ${man(C.fieldOpenCost)} の回収 ${(C.fieldOpenCost / Math.max(1, pastureSave - C.fieldUpkeep) / 4).toFixed(1)}年`);

// ---------- 去勢時期と出荷時期の比較 ----------
if (process.env.SKIP_CAST) process.exit(0);
console.log('\n# 去勢の時期ごとの損得（雄1頭。体格C・肉質C、外部委託、ストレス・健康は平常）\n');
console.log('| 去勢 | 出荷年齢 | 枝肉 | 肉質 | 売上 | 飼料費 | 去勢費 | 差し引き |');
console.log('|---|---|---|---|---|---|---|---|');
const periods = [['早期', 0], ['標準', 1], ['晩期', 3], ['高齢', 5], ['未去勢', -1]];
for (const shipAge of [6, 7, 8]) {
  for (const [label, castAge] of periods) {
    let sales = 0, feed = 0, ccost = 0, carcass = 0, q = 0;
    const N = 100;
    for (let i = 0; i < N; i++) {
      G.newGame();
      const a = G.makeAnimal({ sex: 'M', age: 0, genes: { length: 1, depth: 1, traits: [{ k: 'meat', r: 1 }] } });
      for (let t = 0; t < shipAge; t++) {
        if (t === castAge && !a.castrated) { const before = G.S.money; G.castrate(a, null, 'outsource'); ccost += before - G.S.money; a.stress = 10; }
        feed += (G.isMature(a) ? G.C.feedUnitsAdult : G.C.feedUnitsYoung) * G.C.feedUnitPrice;
        a.age++; a.stress = Math.max(0, a.stress - 20); a.happiness = 50; a.health = 100;
        G.growWeight(a);
        if (a.castrated) { a.intactPenalty = Math.max(0, a.intactPenalty - 0.05); if (a.castration.period === 'mature') a.castBonus = Math.min(0.1, a.castBonus + 0.15); }
        else a.intactPenalty = Math.min(G.C.intactPenaltyMax, a.intactPenalty + G.C.intactPenaltyPerTurn);
      }
      const v = G.shipValue(a);
      sales += v.sales; carcass += v.carcass; q += v.q;
    }
    console.log(`| ${label} | ${shipAge}ターン | ${Math.round(carcass / N)}kg | ${G.rankName(Math.round(q / N))} | ${man(sales / N)} | ${man(feed / N)} | ${man(ccost / N)} | ${man((sales - feed - ccost) / N)} |`);
  }
}
