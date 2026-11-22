// 倉庫とメモリアルアイテム
G.ITEMS = {
  nameplate: { name: 'ネームプレート', icon: 'nameplate' },
  horseshoe: { name: '蹄鉄', icon: 'horseshoe' },
  testes: { name: '精巣（冷凍保存）', icon: 'testes' },
};

G.store = {
  used() { return G.S.storage.items.length; },
  full() { return this.used() >= G.S.storage.cap; },
  // 出荷・死亡した個体から残せるもの
  keepable(a) {
    if (!a || (a.status !== 'shipped' && a.status !== 'dead')) return [];
    const kinds = ['nameplate'].concat(G.isHorse(a) ? ['horseshoe'] : []);
    a.memorials = a.memorials || {};
    return kinds.filter((k) => !a.memorials[k]);
  },
  makeItem(a, kind, extra) {
    const S = G.S;
    const it = Object.assign({
      id: 'i' + (S.storage.next++),
      kind, aid: a.id, name: a.name, idNo: a.idNo, species: a.species, sex: a.sex,
      turn: S.turn, born: a.bornTurn,
    }, extra || {});
    S.storage.items.push(it);
    a.memorials = a.memorials || {};
    a.memorials[kind] = true;
    return it;
  },
  // ネームプレート・蹄鉄を残す（戻り値は文章イベント）
  keep(a, kind) {
    if (!this.keepable(a).includes(kind) || this.full()) return null;
    const it = this.makeItem(a, kind, { races: G.isHorse(a) ? G.race.record(a).win : 0 });
    const line = `保管　${G.ITEMS[kind].name}　${a.name}　個体識別番号 ${a.idNo}`;
    G.ledger(line, 0, 'note');
    G.addHistory(a, `${G.ITEMS[kind].name}を保管`);
    const ev = { title: G.ITEMS[kind].name, paras: G.buildParas([{ pick: `memo.${kind}_` }], { species: a.species }), vars: G.textVars(a), ledger: [line], aid: a.id };
    G.storeDiary(a, ev);
    return { it, ev };
  },
  // 観血法・旧来手法で成熟雄を去勢したとき
  addTestes(a, method) {
    if (this.full()) {
      const line = `精巣　保管不可（倉庫 ${G.S.storage.cap}/${G.S.storage.cap}）`;
      G.ledger(line, 0, 'note');
      return { line, kept: false };
    }
    this.makeItem(a, 'testes', { method });
    const line = `精巣 冷凍保存　${a.name}　個体識別番号 ${a.idNo}　${G.METHOD_SHORT[method]}`;
    G.ledger(line, 0, 'note');
    return { line, kept: true };
  },
  price(it, use) {
    const P = G.C.itemPrice[it.kind];
    if (!P || P[use] === undefined) return null;
    let v = P[use];
    if (it.kind === 'horseshoe' && use === 'memorial') v *= 1 + (it.races || 0);
    return v;
  },
  sell(id, use) {
    const S = G.S;
    const it = S.storage.items.find((x) => x.id === id);
    const v = it && this.price(it, use);
    if (!v) return false;
    S.storage.items = S.storage.items.filter((x) => x !== it);
    G.earn(v, `売却　${G.ITEMS[it.kind].name}（${it.name}）　${use === 'food' ? '食用' : '記念品'}　${G.yen(v)}`);
    return true;
  },
  expand() {
    const S = G.S;
    if (S.money < G.C.storageExpandCost) return false;
    S.storage.cap += G.C.storageExpandSlots;
    G.pay(G.C.storageExpandCost, `倉庫 増設　+${G.C.storageExpandSlots}　${G.yen(G.C.storageExpandCost)}`);
    return true;
  },
};
