// レース（No.13）
G.race = {
  // 今季の出走表。G1 は春と秋だけ
  makeCard() {
    const season = (G.S.turn - 1) % 4;
    const grades = ['farm', 'G3', 'G2'].concat(season === 0 || season === 2 ? ['G1'] : []);
    G.S.raceCard = grades.map((g, i) => ({ key: `r${G.S.turn}_${i}`, grade: g, dist: G.pick(['short', 'mid', 'long']) }));
    G.S.raceEntries = (G.S.raceEntries || []).filter((e) => e.turn === G.S.turn);
  },
  label(r) { return `${G.C.races[r.grade].name}　${G.DIST_NAMES[r.dist]}`; },
  entryOf(a) { return (G.S.raceEntries || []).find((e) => e.aid === a.id && e.turn === G.S.turn); },
  // 出走できるか（理由は返さない。UI はボタンの可否だけ）
  canEnter(a, r) {
    if (!a || a.status !== 'alive' || !G.isHorse(a) || !G.isMature(a)) return false;
    if (this.entryOf(a)) return false;
    if (r.grade === 'farm' && G.traitRank(a, 'racer')) return false;
    return G.S.money >= G.C.races[r.grade].fee;
  },
  enter(a, key) {
    const r = G.S.raceCard.find((x) => x.key === key);
    if (!r || !this.canEnter(a, r)) return false;
    const fee = G.C.races[r.grade].fee;
    G.S.raceEntries.push({ aid: a.id, key, grade: r.grade, dist: r.dist, turn: G.S.turn });
    G.pay(fee, `出走登録　${this.label(r)}　${a.name}　${G.yen(fee)}`);
    return true;
  },
  cancel(a) {
    const e = this.entryOf(a);
    if (!e) return;
    G.S.raceEntries = G.S.raceEntries.filter((x) => x !== e);
    const fee = G.C.races[e.grade].fee;
    G.S.money += fee;
    G.ledger(`出走取消　${G.C.races[e.grade].name}　${a.name}　${G.yen(fee)} 返金`, fee, 'income');
  },
  // 評価点 ＝（距離適性 ＋ コンディション補正 ＋ 基礎乱数 ＋ 競走馬補正）× 展開乱数
  score(a, dist) {
    const [ws, wt] = G.C.distWeights[dist];
    const tr = (a.trained || 0) / 10;
    const fit = (G.traitRank(a, 'speed') * 10 + tr) * ws + (G.traitRank(a, 'stamina') * 10 + tr) * wt;
    const cond = (G.condition(a) - 1) * 40;
    const base = Math.random() * 10;
    const racer = G.traitRank(a, 'racer') ? 5 : 0;
    const fickle = G.traitRank(a, 'fickle');
    const spread = 0.1 + fickle * 0.05;
    let dev = 1 - spread + Math.random() * spread * 2;
    dev *= 1 - G.traitRank(a, 'timid') * 0.04;
    return (fit + cond + base + racer - G.C.speedDeclinePerRank * G.acqRank(a, 'speedDecline')) * dev;
  },
  // ターン終了時に結果を出す
  resolve() {
    const S = G.S;
    const list = (S.raceEntries || []).filter((e) => e.turn === S.turn);
    for (const e of list) {
      const a = S.animals[e.aid];
      if (!a || a.status !== 'alive') continue;
      const R = G.C.races[e.grade];
      const name = `${R.name}　${G.DIST_NAMES[e.dist]}`;
      // 出走不能の判定は評価点の前
      if (G.chance(G.refuseChance(a))) {
        a.races.push({ turn: S.turn, grade: e.grade, dist: e.dist, result: 'refuse' });
        G.ledger(`出走不能　${name}　${a.name}`, 0, 'note');
        G.addHistory(a, `レース　${name}　出走不能`);
        continue;
      }
      const sc = this.score(a, e.dist);
      const result = sc >= R.line[1] ? 'win' : sc >= R.line[0] ? 'place' : 'out';
      a.races.push({ turn: S.turn, grade: e.grade, dist: e.dist, result, score: Math.round(sc) });
      a.stress = Math.min(100, a.stress + 8);
      const resName = { win: '1着', place: '入賞', out: '着外' }[result];
      G.addHistory(a, `レース　${name}　${resName}`);
      if (result === 'out') G.ledger(`レース　${name}　${a.name}　${resName}`, 0, 'note');
      else G.earn(R.prize[result === 'win' ? 1 : 0], `レース　${name}　${a.name}　${resName}　賞金 ${G.yen(R.prize[result === 'win' ? 1 : 0])}`, { silent: true });
    }
    S.raceEntries = [];
  },
  record(a) {
    const rs = (a.races || []).filter((r) => r.result !== 'refuse');
    return { n: rs.length, win: rs.filter((r) => r.result === 'win').length, place: rs.filter((r) => r.result === 'place').length };
  },
};
