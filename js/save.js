// セーブ／ロード（No.20）
G.save = {
  KEY: 'inochi-farm-autosave',

  serialize() {
    return JSON.stringify(Object.assign({ app: 'inochi-farm', savedAt: new Date().toISOString() }, G.S));
  },
  auto() {
    try { localStorage.setItem(this.KEY, this.serialize()); } catch (e) { /* 保存できない環境 */ }
  },
  hasAuto() {
    try { return !!localStorage.getItem(this.KEY); } catch (e) { return false; }
  },
  loadAuto() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return false;
      return this.apply(JSON.parse(raw));
    } catch (e) { return false; }
  },
  exportFile() {
    const blob = new Blob([this.serialize()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const y = Math.floor((G.S.turn - 1) / 4) + 1;
    a.download = `inochi-farm-${y}年目-${G.SEASONS[(G.S.turn - 1) % 4]}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  },
  importFile(file) {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        let obj;
        try { obj = JSON.parse(fr.result); } catch (e) { resolve('JSONの形式が正しくありません'); return; }
        const err = this.validate(obj);
        if (err) { resolve(err); return; }
        resolve(this.apply(obj) ? null : 'セーブデータを読み込めませんでした');
      };
      fr.onerror = () => resolve('ファイルを読み込めませんでした');
      fr.readAsText(file, 'utf-8');
    });
  },
  validate(obj) {
    if (!obj || typeof obj !== 'object') return 'セーブデータではありません';
    if (typeof obj.turn !== 'number' || !obj.animals || typeof obj.animals !== 'object') return 'セーブデータではありません';
    if (obj.version > G.VERSION) return 'このバージョンでは読み込めないセーブデータです';
    return null;
  },
  // 旧データの補完
  migrate(obj) {
    const def = { careLeft: G.C.carePerTurn, cattleSlots: G.C.startCattleSlots, ledger: [], records: {}, readTexts: {}, notices: [], nextNotice: 1, market: [], straws: [], strawCatalog: [], tools: { burdizzo: false }, pendingCourses: [], yearSales: 0, devMode: false, player: { x: 1000, y: 880 }, nextSeq: 1 };
    for (const k of Object.keys(def)) if (obj[k] === undefined) obj[k] = def[k];
    if (!obj.pastures) obj.pastures = {};
    for (const pid of Object.keys(G.MAP.pastures)) if (!obj.pastures[pid]) obj.pastures[pid] = { open: pid === 'p1' };
    if (typeof obj.horseSlots !== 'number') obj.horseSlots = 0;
    for (const k of ['stallions', 'raceCard', 'raceEntries']) if (!Array.isArray(obj[k])) obj[k] = [];
    if (!Array.isArray(obj.milkSlots)) obj.milkSlots = Array.from({ length: G.C.startMilkSlots }, () => ({ aid: null }));
    if (!Array.isArray(obj.fields)) obj.fields = [];
    while (obj.fields.length < G.FIELD_SLOTS) obj.fields.push({ open: false, use: 'pasture', horse: null });
    obj.noticeTurn = null;
    if (!obj.storage || !Array.isArray(obj.storage.items)) obj.storage = { cap: G.C.storageCap, items: [], next: 1 };
    if (!obj.staff) obj.staff = { girl: { name: 'ミナミ', pasture: 'p1' }, boy: { name: 'ソウスケ', pasture: 'p1' } };
    let maxSeq = 0;
    for (const a of Object.values(obj.animals)) {
      const n = parseInt(String(a.id).slice(1), 10);
      if (n > maxSeq) maxSeq = n;
      for (const k of ['history', 'diaries', 'likes', 'dislikes', 'children']) if (!Array.isArray(a[k])) a[k] = [];
      if (!a.flags) a.flags = {};
      if (!a.species) a.species = 'cattle';
      if (typeof a.coat !== 'number') a.coat = G.defaultCoat(a);
      if (!a.form) a.form = 'normal';
      if (typeof a.trained !== 'number') a.trained = 0;
      if (!Array.isArray(a.races)) a.races = [];
      if (!a.affinity) a.affinity = { player: 10, girl: 20, boy: 20 };
      if (!a.genes) a.genes = { length: 0, depth: 0, traits: [] };
      if (!a.genes.traits) a.genes.traits = [];
    }
    if (obj.nextSeq <= maxSeq) obj.nextSeq = maxSeq + 1;
    obj.version = G.VERSION;
    delete obj.app; delete obj.savedAt;
    return obj;
  },
  apply(obj) {
    try {
      G.S = this.migrate(obj);
      return true;
    } catch (e) { return false; }
  },
};
