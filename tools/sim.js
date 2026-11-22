// 自動プレーによるバランス検証
// 使い方: node tools/sim.js [回数=200] [年数=10]
// ゲームの計算部分（画面以外）をそのまま読み込み、方針の違うプレーヤーに遊ばせて集計する。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
global.window = global;
global.G = {};
const files = ['consts', 'util', 'text-data', 'text', 'animals', 'game', 'events', 'production', 'race', 'relations', 'storage', 'save', 'map'];
for (const f of files) vm.runInThisContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), { filename: f + '.js' });
G.text.setFromBundle(window.TEXT_DATA);
// 調整案を試す: TUNE='{"staffWage":50000}' node tools/sim.js
if (process.env.TUNE) Object.assign(G.C, JSON.parse(process.env.TUNE));
if (process.env.ONLY_ECON) process.env.SKIP_CAST = '1';

const RUNS = +process.argv[2] || 200;
const YEARS = +process.argv[3] || 10;

// ---------- 方針 ----------
const shipReady = (a) => a.species === 'cattle' && a.castrated && a.age >= 6;
const castrateCalves = (method, mode) => {
  for (const a of G.alive()) {
    if (a.sex !== 'M' || a.castrated || a === bullOf()) continue;
    if (G.castPeriod(a) === 'standard') G.castrate(a, method, mode);
  }
};
const bullOf = () => G.alive().find((a) => a.species === 'cattle' && G.isIntactMature(a));
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
  // 未去勢のまま成熟した雄（種牛1頭を除く）は出荷
  const bulls = G.alive().filter((a) => a.species === 'cattle' && G.isIntactMature(a));
  for (const b of bulls.slice(1)) G.ship(b);
};
const cullOldCows = () => { for (const a of G.alive()) if (a.species === 'cattle' && a.sex === 'F' && a.age > 36 && !a.pregnancy) G.ship(a); };
const keepUnderCap = () => {
  const over = G.herdCount('cattle') - G.S.cattleSlots;
  if (over > 0) G.alive().filter((a) => a.species === 'cattle' && a.sex === 'M' && a.castrated).sort((x, y) => y.age - x.age).slice(0, over).forEach((a) => (a.age >= 3 ? G.ship(a) : G.sell(a)));
};

const STRATEGIES = {
  '何もしない': () => {},
  '基本（自然交配・標準去勢・出荷）': () => {
    castrateCalves('burdizzo', 'outsource'); breedNatural(); fillMilk(); shipAll(); sellExtraBulls(); cullOldCows(); keepUnderCap();
  },
  '改良と搾乳（人工授精・増設）': () => {
    const S = G.S;
    castrateCalves('burdizzo', 'direct'); breedAI(); fillMilk(); shipAll(); sellExtraBulls(); cullOldCows();
    const lact = G.alive().filter((a) => G.milk.canPlace(a) && G.milk.calc(a).income > 100000).length;
    if (lact > 0 && S.money > G.C.milkSlotCost + 1500000) G.milk.addSlot();
    const closed = S.fields.findIndex((f) => !f.open);
    if (closed >= 0 && S.money > 2500000) G.field.open(closed);
    const hill = ['p2', 'p3', 'p4', 'p5'].find((p) => !S.pastures[p].open);
    if (hill && S.money > 5000000 && G.herdCount('cattle') >= S.cattleSlots - 1) G.openPasture(hill);
    keepUnderCap();
  },
  '競馬（2年目から）': () => {
    const S = G.S;
    STRATEGIES['基本（自然交配・標準去勢・出荷）']();
    if (S.turn < 5) return;
    if (!S.pastures.h1.open && S.money > 3000000) G.openPasture('h1');
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
for (const [name, play] of Object.entries(STRATEGIES)) {
  const r = { y1short: [], y1ok: 0, paidYear: [], money: [], loan: [], firstS: [], borrowed: [], herd: [], raceIncome: [], shipped: [], milkIncome: [] };
  for (let run = 0; run < RUNS; run++) {
    G.newGame();
    let borrowed = 0, raceInc = 0, milkInc = 0, paid = null;
    for (let t = 0; t < YEARS * 4; t++) {
      play();
      const s = G.endTurn();
      borrowed += s.borrowed || 0;
      for (const e of s.entries) { if (e.lines[0].startsWith('レース')) raceInc += e.amount; if (e.lines[0].startsWith('搾乳')) milkInc += e.amount; }
      if (s.settlement && t === 3) { r.y1short.push(s.settlement.unpaid); if (!s.settlement.unpaid) r.y1ok++; }
      if (paid === null && G.S.loan <= 0) paid = Math.floor(t / 4) + 1;
    }
    r.paidYear.push(paid === null ? 99 : paid);
    r.money.push(G.S.money); r.loan.push(G.S.loan); r.borrowed.push(borrowed);
    r.firstS.push(G.S.records.rankS ? Math.floor((G.S.records.rankS.turn - 1) / 4) + 1 : 99);
    r.herd.push(G.alive().length); r.raceIncome.push(raceInc); r.milkIncome.push(milkInc);
    r.shipped.push(Object.values(G.S.animals).filter((a) => a.status === 'shipped').length);
  }
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
