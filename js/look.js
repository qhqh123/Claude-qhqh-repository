// 見た目情報：絵を描くのに必要なことだけをまとめる
// スキン（標準の絵・画像）はこの情報だけを見て描く。個体の他のデータ（遺伝・お金など）は見ない。
G.EXPR = { おっとり: 'calm', 甘えん坊: 'sweet', 活発: 'lively', 好奇心旺盛: 'curious', マイペース: 'easy', 頑固: 'stubborn' };
G.EXPR_KEYS = ['calm', 'sweet', 'lively', 'curious', 'easy', 'stubborn'];
G.COAT_COUNT = { cattle: 5, horse: 5 };
G.STAGES = ['calf', 'young', 'adult'];

// 毛色は生まれたときに決めて a.coat に保存する（以前のデータは同じ計算で補う）
G.defaultCoat = (a) => {
  const sp = a.species || 'cattle';
  return G.hash((a.id || '') + (a.idNo || '') + (sp === 'horse' ? 'h' : '')) % G.COAT_COUNT[sp];
};
G.stageOf = (a) => (a.age < 2 ? 'calf' : !G.isMature(a) ? 'young' : 'adult');

G.look = (a) => {
  const species = a.species || 'cattle';
  const stage = G.stageOf(Object.assign({ species }, a));
  const intactAdult = a.sex === 'M' && !a.castrated && stage === 'adult';
  return {
    species,
    sex: a.sex,
    stage,
    coat: typeof a.coat === 'number' ? a.coat : G.defaultCoat(a),
    expr: G.EXPR[a.personality] || 'easy',
    horns: species === 'cattle' && stage !== 'calf' ? (intactAdult ? 'big' : 'small') : 'none',
    pregnant: !!a.pregnancy,
    seed: G.hash((a.id || '') + (a.idNo || '') + (species === 'horse' ? 'h' : '')), // 標準スキンの模様の位置だけに使う
  };
};
