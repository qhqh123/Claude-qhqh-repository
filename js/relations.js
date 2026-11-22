// 家畜同士の親密度（No.09）と厩務員の性格相性（No.16）

// 相性のよい性格の組（仮。対称）
G.PERSONALITY_MATCH = [
  ['おっとり', '甘えん坊'], ['おっとり', 'マイペース'], ['甘えん坊', '活発'],
  ['活発', '好奇心旺盛'], ['好奇心旺盛', 'マイペース'], ['頑固', 'マイペース'],
];
G.personalityMatch = (p, q) => G.PERSONALITY_MATCH.some(([x, y]) => (x === p && y === q) || (x === q && y === p));

// 厩務員の適性
G.STAFF_FOR_PERSONALITY = {
  おっとり: 'girl', 甘えん坊: 'girl', 活発: 'girl',
  好奇心旺盛: 'boy', マイペース: 'boy', 頑固: 'boy',
};
G.staffMatches = (a) => {
  const k = G.STAFF_FOR_PERSONALITY[a.personality];
  return !!k && G.S.staff[k].pasture === a.pasture;
};

G.rel = {
  // a から見た関係
  compute(a) {
    const S = G.S;
    const same = (b) => b && b.id !== a.id && b.status === 'alive' && b.species === a.species;
    const map = {};
    const add = (b, line) => {
      if (!same(b)) return;
      const m = map[b.id] || (map[b.id] = { b, like: 0, interest: 0, lines: [] });
      m.like += line.v;
      m.lines.push(line);
    };
    const pickLike = (b) => (G.hash(a.id + b.id) % 2 ? 'rel.like_01' : 'rel.like_02');
    if (a.motherBond) add(S.animals[a.motherBond.id], { id: 'rel.mother_01', v: a.motherBond.v, kind: 'mother' });
    for (const c of a.childBonds || []) add(S.animals[c.id], { id: 'rel.child_01', v: c.v, kind: 'child' });
    for (const l of a.likes || []) add(S.animals[l.id], { id: pickLike(S.animals[l.id] || { id: l.id }), v: l.v, kind: 'like' });
    for (const d of a.dislikes || []) add(S.animals[d.id], { id: 'rel.dislike_01', v: d.v, kind: 'dislike' });
    for (const b of G.alive()) {
      if (same(b) && b.pasture === a.pasture && G.personalityMatch(a.personality, b.personality)) add(b, { id: 'rel.match_01', v: 1, kind: 'match' });
    }
    // 繁殖関心（成熟した未去勢雄 → 同種の成熟雌全員）
    const interest = (a.sex === 'M' && !a.castrated && G.isMature(a)) ? (a.breedInterest || 0) : 0;
    const matureF = interest ? G.alive().filter((b) => same(b) && b.sex === 'F' && G.isMature(b)) : [];
    for (const b of matureF) { const m = map[b.id] || (map[b.id] = { b, like: 0, interest: 0, lines: [] }); m.interest = interest; }
    const lines = [];
    for (const m of Object.values(map)) for (const l of m.lines) lines.push(Object.assign({ b: m.b }, l));
    const totals = [];
    let others = false;
    for (const m of Object.values(map)) {
      const total = m.like + m.interest;
      if (m.like === 0 && m.interest > 0) { others = true; continue; }
      if (total === 0) continue;
      totals.push(Object.assign({ total }, m));
    }
    totals.sort((x, y) => y.total - x.total);
    return { lines, interest, totals, others: others ? interest : 0 };
  },
  category(b) {
    if (b.sex === 'F') return G.isMature(b) ? '成熟雌' : '未成熟雌';
    return '雄';
  },
};
