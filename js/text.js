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

// 人物の評価の台詞（No.24）。prefixes の候補に、牧場にいるフォームの npc.<form>.<人物>_ を加えて1つ選ぶ
G.farmForms = () => [...new Set(G.alive().map((a) => a.form || 'normal'))];
G.npcLine = (person, prefixes, ctx) => {
  const pres = (prefixes || []).concat(G.farmForms().map((f) => `npc.${f}.${person}_`));
  const ids = Object.keys(G.text.data).filter((id) => pres.some((p) => id.startsWith(p)) && G.text.match(G.text.data[id].cond, ctx || {}));
  return ids.length ? G.pick(ids) : null;
};

// 文章イベント用の差し込み変数
G.textVars = (a, extra) => {
  const S = G.S;
  const staffKey = G.staffFor(a);
  return Object.assign({
    name: a.name,
    sex: a.sex === 'M' ? '♂' : '♀',
    age: G.ageText(a.age),
    species: G.spName(a),
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

// 声のステップ（No.24）：声のある個体だけ。base.<場面>.<性格キー>_NN、late なら base.late.… を優先
// B（No.25）：全フォームが話す。b.voice.<種類>_<場面>.<性格キー>_NN を A の声の代わりに出す
G.voiceStep = (a, base, scene, late) => {
  if (!a) return null;
  const pk = G.PERS_KEY[a.personality];
  if (G.isRouteB()) {
    const kind = base.split('.')[0];
    return { picks: [`b.voice.${scene ? kind + '_' + scene : kind}.${pk}_`] };
  }
  if (!G.formOf(a).voice) return null;
  const sc = scene ? '.' + scene : '';
  return { picks: (late ? [`${base}.late${sc}.${pk}_`] : []).concat([`${base}${sc}.${pk}_`]) };
};
// B：厩務員が家畜に向けて話した台詞の後に、家畜の返事 b.reply.<場面>.<性格キー>_NN（直前の台詞が出たときだけ）
G.replyStep = (a, scene) => (a && G.isRouteB() ? { picks: [`b.reply.${scene}.${G.PERS_KEY[a.personality]}_`], ifPrev: true } : null);
// 候補の中から1つ（なければ null）
G.pickStep = (step, ctx) => {
  if (!step) return null;
  for (const pre of step.picks) { const id = G.text.pick(pre, ctx || {}); if (id) return id; }
  return null;
};

// 体の文（No.24）：四足の文と二足の文（ID末尾 .biped）のうち条件に合うほう
G.bodyStep = (id) => ({ alt: [id, id + '.biped'] });
// 腕の文：腕のある個体だけ
G.armsStep = (a, scene) => (a && G.formOf(a).arms ? { pick: `cas.arms.${scene}_` } : null);

// 段落リストを組み立てる。steps: 'id' | {pick, p} | {picks: [接頭辞…]} | {id, p} | null（飛ばす）
G.buildParas = (steps, ctx) => {
  const out = [];
  let prevAdded = false;
  for (const s of steps) {
    if (!s) continue;
    const st = typeof s === 'string' ? { id: s } : s;
    if (st.ifPrev && !prevAdded) continue;
    prevAdded = false;
    if (st.p !== undefined && !G.chance(st.p)) continue;
    let id = null;
    if (st.picks) { for (const pre of st.picks) { id = G.text.pick(pre, ctx); if (id) break; } } else if (st.pick) id = G.text.pick(st.pick, ctx);
    else if (st.alt) id = st.alt.find((x) => G.text.has(x, ctx)) || null;
    else if (G.text.has(st.id, ctx)) id = st.id;
    if (id) { out.push(id); prevAdded = true; }
  }
  return out;
};
