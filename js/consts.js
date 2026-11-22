// 定数（仕様書 付録C。すべて調整前提）
window.G = window.G || {};

G.VERSION = 1;

G.C = {
  startMoney: 3000000,
  startLoan: 15000000,
  yearlyRepay: 3000000,
  loanRate: 0.05,
  startCattleSlots: 12,

  cattleMatureAge: 4,
  cattleShipAgeMin: 6,
  cattleShipAgeMax: 8,
  cattleLifeMin: 60,
  cattleLifeMax: 80,
  cattleDeclineAge: 32,
  oldAgeDeathRate: 0.2,
  accidentRate: 0.002,

  gestationMin: 2,
  gestationMax: 3,
  naturalConception: 0.70,
  aiConception: 0.60,

  strawPrice: { 3: 8000, 4: 30000 },
  strawDemeritRate: { 3: 0.30, 4: 0.70 },

  castDirect: { ring: 300, burdizzo: 1000, surgical: 18000 },
  burdizzoToolCost: 20000,
  castOutsource: { ring: 5000, burdizzo: 8000, surgical: 25000 },
  castStress: { early: 20, standard: 35, late: 50, mature: 65 },
  castWeightLoss: { early: 0, standard: 0.02, late: 0.05, mature: 0.07 },
  // 時期に適した術式
  castSuitable: {
    early: ['ring', 'burdizzo', 'surgical'],
    standard: ['burdizzo', 'surgical'],
    late: ['surgical'],
    mature: ['surgical'],
  },
  // 不完全率・感染率・ストレス追加（適さない場合を含む）
  castRisk: {
    ring:     { early: [0, 0, 0],      standard: [0.10, 0, 15], late: [0.30, 0.15, 30], mature: [0.30, 0.15, 30] },
    burdizzo: { early: [0.05, 0, 0],   standard: [0.05, 0, 0],  late: [0.25, 0, 20],    mature: [0.25, 0, 20] },
    surgical: { early: [0, 0.03, 0],   standard: [0, 0.03, 0],  late: [0, 0.03, 0],     mature: [0, 0.03, 0] },
  },
  infectionStress: 30,
  infectionTurns: 2,
  infectionCost: 15000,

  // 食肉
  carcassUnit: [1200, 1600, 2000, 2500, 2900, 3400], // 平凡,C,B,A,A+,S
  intactPenaltyPerTurn: 0.03,
  intactPenaltyMax: 0.30,
  carcassRatio: 0.62,

  // 維持費
  feedAdult: 40000,
  feedYoung: 20000,
  feedSeason: [0.9, 0.8, 1.0, 1.3],
  pastureUpkeep: 50000,
  staffWage: 100000,
  pastureOpenCost: 2000000,
  pastureOpenSlots: 6,

  // 市場
  marketCalf: [300000, 600000],
  marketAdult: [500000, 900000],
  marketSellRate: 0.7,
  marketTraitDist: [0.50, 0.35, 0.15], // なし, C, B
  marketDemeritRate: 0.30,

  carePerTurn: 5,
};

G.SEASONS = ['春', '夏', '秋', '冬'];
G.RANKS = ['平凡', 'C', 'B', 'A', 'A+', 'S'];
G.PERSONALITIES = ['おっとり', '甘えん坊', '活発', '好奇心旺盛', 'マイペース', '頑固'];
G.ACTIVITIES = ['brush', 'pet', 'exercise'];
G.ACTIVITY_NAMES = { brush: 'ブラッシング', pet: 'ふれあい', exercise: '運動' };
G.METHOD_NAMES = { ring: 'ゴムリング法', burdizzo: '去勢鉗子法', surgical: '観血法' };
G.METHOD_SHORT = { ring: 'ゴムリング', burdizzo: '去勢鉗子', surgical: '観血法' };
G.PERIOD_NAMES = { early: '早期', standard: '標準', late: '晩期', mature: '高齢' };

// バッジ定義（吹き出しの文字列は「表示：」扱い）
G.TRAITS = {
  length:  { name: '伸び/骨格', tip: '骨格が大きい', frame: true },
  depth:   { name: '深み/肉付き', tip: '肉付きがよい', frame: true },
  milk:    { name: '乳量', tip: '搾乳量が多い', femaleOnly: true },
  milkq:   { name: '乳質', tip: '乳成分が濃い', femaleOnly: true },
  meat:    { name: '肉質', tip: '肉質がよい' },
  growth:  { name: '成長速度', tip: '成長が早い' },
  charm:   { name: '愛嬌', tip: '好かれやすい' },
  temper:  { name: '気性難', tip: 'トラブルが起きやすい　就労・出走不能 C10% / B20% / A30% / A+40% / S50%', demerit: true, intactMaleOnly: true },
  frail:   { name: '虚弱体質', tip: 'ストレスに弱い', demerit: true },
};
G.CATTLE_FREE_TRAITS = ['milk', 'milkq', 'meat', 'growth', 'charm'];
G.CATTLE_DEMERITS = ['temper', 'frail'];

G.NAMES_F = ['ハナコ', 'サクラ', 'モカ', 'チョコ', 'ミルク', 'ユキ', 'ココ', 'リボン', 'マロン', 'ナナ', 'ルル', 'スミレ', 'キナコ', 'アズキ', 'ミント', 'ポポ', 'ハル', 'ツバキ', 'ラテ', 'モナカ', 'ノノ', 'ヒナ', 'ウメ', 'クルミ', 'シロ', 'メイ', 'カエデ', 'リンゴ', 'ミカン', 'ソラ'];
G.NAMES_M = ['ゴロウ', 'タロウ', 'ゴンタ', 'クロ', 'マメ', 'ジロウ', 'ポン', 'テツ', 'ダイチ', 'リキ', 'コタロウ', 'ハヤテ', 'ブン', 'ムギ', 'ゲン', 'ソウタ', 'トラ', 'ケン', 'ヤマト', 'コウ', 'ガク', 'ロック', 'ボス', 'チビ', 'イブキ', 'ショウ', 'ダン', 'ノボル', 'モモ', 'タイガ'];

G.STRAW_MAIN = ['meat', 'growth', 'milk', 'milkq'];
G.STRAW_NAMES = ['北の誉', '福光', '安美', '茂勝', '百合花', '勝早', '糸桜', '照久', '金幸', '平茂', '美津照', '藤良'];
