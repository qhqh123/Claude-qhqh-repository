// 先輩牧場主（再建支援。救済用の公式チート）
G.senior = {
  NAME: '先輩牧場主',
  // 家畜がゼロ、または雌が1頭もいない（購入以外で再建できない）
  needed() { return !G.alive().some((a) => a.sex === 'F'); },
  // 状態が変わったときに通知する（他の通知と同じポップアップ）
  check() {
    const S = G.S;
    if (!S) return;
    const need = this.needed();
    if (need && !S.seniorNotified) {
      S.seniorNotified = true;
      G.notify('rescue', null, '先輩牧場主', { title: '❗' });
    }
    if (!need) S.seniorNotified = false;
  },
  rescue() {
    const S = G.S;
    if (!this.needed()) return null;
    const lowGenes = () => ({ length: G.ri(0, 1), depth: G.ri(0, 1), traits: G.chance(0.5) ? [{ k: G.pick(['meat', 'milk', 'milkq']), r: 1 }] : [] });
    const pasture = G.pastureWithRoom('cattle') || 'p1'; // 救済なので満杯でも入れる
    const cow = G.makeAnimal({ sex: 'F', age: G.ri(8, 12), genes: lowGenes(), pasture, origin: 'senior' });
    const calf = G.makeAnimal({ sex: G.chance(0.5) ? 'M' : 'F', age: 0, genes: G.inherit({ length: 1, depth: 1, traits: [] }, cow.genes), dam: cow.id, pasture, origin: 'senior' });
    calf.motherBond = { id: cow.id, v: G.ri(2, 3) };
    cow.children.push(calf.id);
    cow.childBonds = [{ id: calf.id, v: G.ri(1, 3) }];
    cow.lactation = { start: S.turn };
    cow.flags.postpartum = true;
    // 農耕馬：馬の放牧地がなければ1つ開けてもらう
    if (!Object.keys(S.pastures).some((p) => S.pastures[p].open && G.pastureSpecies(p) === 'horse')) {
      S.pastures.h1.open = true;
      S.pastures.h1.stage = 0;
      G.recalcSlots();
      if (G.map && G.map.buildBlocks) G.map.buildBlocks();
    }
    const horse = G.makeAnimal({ species: 'horse', sex: 'M', age: G.ri(8, 12), genes: { length: 1, depth: 1, traits: [{ k: 'stamina', r: 2 }] }, pasture: G.pastureWithRoom('horse') || G.openPastures('horse')[0], origin: 'senior' });
    horse.castrated = true;
    horse.castration = { period: 'mature', method: 'surgical', mode: 'outsource', turn: S.turn - 10 };
    horse.breedInterest = 0;
    for (const a of [cow, calf, horse]) G.addHistory(a, '先輩牧場主から譲り受け');
    const line = `再建支援　先輩牧場主　母牛 ${cow.name}・子牛 ${calf.name}・農耕馬 ${horse.name}`;
    G.ledger(line, 0, 'note');
    if (calf.sex === 'M') G.notify('castrate', calf.id, `🐮 ${calf.name}が去勢を検討できる時期になりました！`);
    for (const n of S.notices) if (n.type === 'rescue') n.done = true;
    S.seniorNotified = false;
    const vars = { name: G.S.staff.girl.name, date: G.dateText(S.turn), partner: cow.name };
    return { title: '再建支援', paras: G.buildParas([{ pick: 'senior.rescue_' }], {}), vars, ledger: [line] };
  },
  advice() {
    const id = G.text.pick('senior.advice_', {});
    return { title: '先輩牧場主', paras: id ? [id] : [], vars: { date: G.dateText(G.S.turn) }, ledger: null };
  },
};
