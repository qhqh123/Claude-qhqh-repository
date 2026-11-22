// 文章JSON（No.21）
G.text = {
  files: ['castration.json', 'breeding.json', 'economy.json', 'animals.json', 'daily-events.json'],
  data: {},
  source: {},

  setFromBundle(bundle) {
    this.data = {}; this.source = {};
    for (const file of Object.keys(bundle)) this.merge(bundle[file], file);
  },
  merge(obj, file) {
    for (const id of Object.keys(obj)) {
      this.data[id] = obj[id];
      this.source[id] = file;
    }
  },
  async load() {
    if (window.TEXT_DATA) this.setFromBundle(window.TEXT_DATA);
    if (location.protocol === 'file:') return;
    try {
      const bundle = {};
      for (const f of this.files) {
        const r = await fetch('text/' + f, { cache: 'no-store' });
        if (!r.ok) throw new Error(f);
        bundle[f] = await r.json();
      }
      this.setFromBundle(bundle);
    } catch (e) { /* 同梱の text-data.js を使う */ }
  },
  // ゲーム内からの差し替え
  importFile(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const obj = JSON.parse(fr.result);
          // text-data 形式（ファイル名ごと）と単一ファイル形式の両方を受け付ける
          const isBundle = Object.values(obj).every((v) => v && typeof v === 'object' && !('text' in v));
          if (isBundle) for (const k of Object.keys(obj)) this.merge(obj[k], k);
          else this.merge(obj, file.name);
          resolve(Object.keys(obj).length);
        } catch (e) { reject(e); }
      };
      fr.onerror = reject;
      fr.readAsText(file, 'utf-8');
    });
  },

  get(id) { return this.data[id]; },

  match(cond, ctx) {
    if (!cond) return true;
    for (const k of Object.keys(cond)) {
      const v = cond[k];
      if (k === 'meat_grade_min') { if (!(ctx.meat_grade >= v)) return false; continue; }
      if (Array.isArray(v)) { if (!v.includes(ctx[k])) return false; continue; }
      if (ctx[k] === undefined) { if (v !== false) return false; continue; }
      if (ctx[k] !== v) return false;
    }
    return true;
  },
  // prefix に一致し、条件を満たす候補から1つ選ぶ
  pick(prefix, ctx) {
    const ids = Object.keys(this.data).filter((id) => id.startsWith(prefix) && this.match(this.data[id].cond, ctx));
    if (!ids.length) return null;
    return G.pick(ids);
  },
  has(id, ctx) {
    const e = this.data[id];
    return !!e && this.match(e.cond, ctx);
  },
  fill(text, vars) {
    return String(text).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] !== undefined ? vars[k] : m));
  },
};

// 文章イベント用の差し込み変数
G.textVars = (a, extra) => {
  const S = G.S;
  const staffKey = G.staffFor(a);
  return Object.assign({
    name: a.name,
    sex: a.sex === 'M' ? '♂' : '♀',
    age: G.ageText(a.age),
    species: '牛',
    staff: S.staff[staffKey].name,
    partner: '',
    date: G.dateText(S.turn),
    id_number: a.idNo,
  }, extra || {});
};

G.staffFor = (a) => {
  const S = G.S;
  const here = ['girl', 'boy'].filter((k) => S.staff[k].pasture === a.pasture);
  return here.length ? G.pick(here) : G.pick(['girl', 'boy']);
};

// 段落リストを組み立てる。steps: 'id' | {pick, p} | {id, p}
G.buildParas = (steps, ctx) => {
  const out = [];
  for (const s of steps) {
    const st = typeof s === 'string' ? { id: s } : s;
    if (st.p !== undefined && !G.chance(st.p)) continue;
    let id = null;
    if (st.pick) id = G.text.pick(st.pick, ctx);
    else if (G.text.has(st.id, ctx)) id = st.id;
    if (id) out.push(id);
  }
  return out;
};
