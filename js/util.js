// 共通の小物
G.rand = Math.random;
G.ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
G.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
G.chance = (p) => Math.random() < p;
G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
G.shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
G.yen = (n) => (n < 0 ? '−¥' : '¥') + Math.abs(Math.round(n)).toLocaleString('ja-JP');
G.man = (n) => {
  const v = Math.round(n / 10000);
  return (n < 0 ? '−' : '') + Math.abs(v).toLocaleString('ja-JP') + '万円';
};
G.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
G.rankName = (r) => G.RANKS[G.clamp(r | 0, 0, 5)];

G.ageText = (turns) => {
  const months = turns * 3;
  if (months < 12) return months + 'か月';
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y}歳${m}か月` : `${y}歳`;
};
G.dateText = (turnIndex) => {
  const y = Math.floor((turnIndex - 1) / 4) + 1;
  return `${y}年目 ${G.SEASONS[(turnIndex - 1) % 4]}`;
};

G.newIdNumber = () => {
  const used = new Set(Object.values(G.S.animals).map((a) => a.idNo));
  let s;
  do {
    s = String(G.ri(1, 9));
    for (let i = 0; i < 9; i++) s += G.ri(0, 9);
  } while (used.has(s));
  return s;
};

G.pickName = (sex) => {
  const pool = sex === 'F' ? G.NAMES_F : G.NAMES_M;
  const used = new Set(Object.values(G.S.animals).filter((a) => a.status === 'alive').map((a) => a.name));
  const free = pool.filter((n) => !used.has(n));
  if (free.length) return G.pick(free);
  return G.pick(pool) + (G.ri(2, 9));
};

G.hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
