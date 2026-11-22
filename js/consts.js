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

  castDirect: { ring: 300, burdizzo: 1500, surgical: 5000, traditional: 500 }, // 毎回の資材費（器具の消耗・破損分を含む）
  traditionalLinger: 2,      // 旧来手法：ストレスが残りやすいターン数（回復量が半分）
  castOutsource: { ring: 5000, burdizzo: 8000, surgical: 25000 },
  horseCastOutsource: 25000,
  castStress: { early: 20, standard: 35, late: 50, mature: 65 },
  castWeightLoss: { early: 0, standard: 0.02, late: 0.05, mature: 0.07 },
  // 時期に適した術式
  castSuitable: {
    early: ['ring', 'burdizzo', 'surgical', 'traditional'],
    standard: ['burdizzo', 'surgical', 'traditional'],
    late: ['surgical', 'traditional'],
    mature: ['surgical', 'traditional'],
  },
  // 不完全率・感染率・ストレス追加（適さない場合を含む）
  castRisk: {
    ring:     { early: [0, 0, 0],      standard: [0.10, 0, 15], late: [0.30, 0.15, 30], mature: [0.30, 0.15, 30] },
    burdizzo: { early: [0.05, 0, 0],   standard: [0.05, 0, 0],  late: [0.25, 0, 20],    mature: [0.25, 0, 20] },
    surgical: { early: [0, 0.03, 0],   standard: [0, 0.03, 0],  late: [0, 0.03, 0],     mature: [0, 0.03, 0] },
    traditional: { early: [0.02, 0.05, 15], standard: [0.02, 0.05, 15], late: [0.02, 0.05, 20], mature: [0.03, 0.05, 25] },
  },
  // 馬（四手法×時期。仮）
  horseCastSuitable: {
    early: ['surgical', 'traditional'],
    standard: ['surgical', 'traditional'],
    late: ['surgical', 'traditional'],
    mature: ['surgical', 'traditional'],
  },
  horseCastRisk: {
    ring:        { early: [0.30, 0.20, 30], standard: [0.35, 0.20, 30], late: [0.40, 0.25, 35], mature: [0.40, 0.25, 35] },
    burdizzo:    { early: [0.20, 0.05, 20], standard: [0.25, 0.05, 20], late: [0.30, 0.05, 25], mature: [0.30, 0.05, 25] },
    surgical:    { early: [0, 0.03, 0],     standard: [0, 0.03, 0],     late: [0, 0.03, 0],     mature: [0, 0.03, 0] },
    traditional: { early: [0.02, 0.05, 15], standard: [0.02, 0.05, 15], late: [0.02, 0.05, 20], mature: [0.03, 0.05, 25] },
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
  feedSeason: [0.9, 0.8, 1.0, 1.3],
  pastureUpkeep: 50000,
  staffWage: 100000,
  pastureOpenCost: 2000000,
  pastureOpenSlots: 6,

  // 市場
  marketCalf: [300000, 600000],
  marketBasic: [150000, 250000], // 基礎的な若い雌牛（C / B）
  marketAdult: [500000, 900000],
  marketSellRate: 0.7,
  marketTraitDist: [0.50, 0.35, 0.15], // なし, C, B
  marketDemeritRate: 0.30,

  carePerTurn: 5,
  sideWorkWage: 25000, // 他の牧場の手伝い：お世話1回あたりの賃金（仮）

  // 後天バッジの年齢は js/aging.js の G.AGING。ここは効果の量（仮）
  acqRankMax: 3,           // 後天のデメリットバッジの上限（A）
  fertDownMult: 0.7,       // 【受胎率低下】【繁殖力低下】
  injuryRate: 0.02,        // 【けがしやすい】1ランクあたりのけがの確率
  injuryCost: 10000,
  milkDeclinePerRank: 0.10, // 【乳量低下】1ランクあたり
  meatDeclinePerRank: 0.3,  // 【肉質低下】1ランクあたりの肉質評価
  speedDeclinePerRank: 4,   // 【走力低下】1ランクあたりのレース評価点

  // 倉庫とメモリアルアイテム（仮）
  storageCap: 20,
  storageExpandCost: 200000,
  storageExpandSlots: 10,
  itemPrice: {
    nameplate: { memorial: 3000 },
    horseshoe: { memorial: 5000 },       // 勝利数に応じて ×(1+勝利数)
    testes: { food: 3000 },
  },

  // 馬（No.13・付録C。賞金・種付け料・価格などは仮）
  horseMatureAge: 6,
  horseLifeMin: 80,
  horseLifeMax: 120,
  horseDeclineAge: 40,
  teaserBonus: 0.15,
  horseSlotsPerPasture: 4,
  horsePastureCost: 2000000,
  marketFoal: [400000, 900000],
  marketHorse: [700000, 1500000],
  stallionFee: { farm3: 150000, race3: 500000, race4: 2000000 },
  trainMax: 100,
  trainDecay: 3,
  trainCare: { brush: 2, pet: 1, exercise: 8 },
  // レース：[入賞ライン, 勝利ライン, 出走料, 入賞賞金, 優勝賞金]
  races: {
    farm: { name: '農耕馬レース', line: [20, 28], fee: 20000, prize: [80000, 300000] },
    G3: { name: 'G3', line: [30, 38], fee: 100000, prize: [500000, 2000000] },
    G2: { name: 'G2', line: [38, 45], fee: 200000, prize: [1200000, 5000000] },
    G1: { name: 'G1', line: [44, 52], fee: 500000, prize: [3000000, 15000000] },
  },
  distWeights: { short: [0.75, 0.25], mid: [0.5, 0.5], long: [0.25, 0.75] },

  // 搾乳（No.11）
  milkBase: [1200, 1500, 1800, 2100, 2400, 2700],
  milkDepthPerRank: 0.05,
  lactation: [1.0, 1.0, 0.75, 0.5, 0.25, 0.10],
  milkSeason: [1.3, 1.0, 1.2, 1.1],
  milkPrice: [90, 100, 110, 125, 150, 190],
  milkDilute1: 2500,
  milkDilute2: 3000,
  milkLowAt: 5, // 泌乳5ターン目（25%）で通知
  startMilkSlots: 1,
  milkSlotCost: 800000,
  milkSlotUpkeep: 20000,

  // 畑と牧草（No.04）
  feedUnitPrice: 4000,  // 飼料1単位（成牛1頭1ターンの1/10）
  feedUnitsAdult: 10,
  feedUnitsYoung: 5,
  feedSurplusPrice: 1500,
  fieldPastureBase: 25,
  fieldCropBase: 100000,
  fieldOpenCost: 300000,
  fieldUpkeep: 10000,
  // 農耕馬の能力 → [商業作物, 牧草]（null は配置不可）
  fieldMult: { none: [null, 0.5], 0: [1.0, 1.0], 1: [1.5, 1.2], 2: [2.5, 1.5], 3: [4.0, 2.0] },
};

G.SEASONS = ['春', '夏', '秋', '冬'];
G.SPECIES = {
  cattle: { name: '牛', icon: '🐮', mature: 4, lifeMin: 60, lifeMax: 80, decline: 32 },
  horse: { name: '馬', icon: '🐴', mature: 6, lifeMin: 80, lifeMax: 120, decline: 40 },
};
G.DIST_NAMES = { short: '短距離', mid: '中距離', long: '長距離' };
G.RANKS = ['平凡', 'C', 'B', 'A', 'A+', 'S'];
G.PERSONALITIES = ['おっとり', '甘えん坊', '活発', '好奇心旺盛', 'マイペース', '頑固'];
G.ACTIVITIES = ['brush', 'pet', 'exercise'];
G.ACTIVITY_NAMES = { brush: 'ブラッシング', pet: 'ふれあい', exercise: '運動' };
G.METHOD_NAMES = { ring: 'ゴムリング法', burdizzo: '去勢鉗子法', surgical: '観血法', traditional: '旧来手法' };
G.METHOD_SHORT = { ring: 'ゴムリング', burdizzo: '去勢鉗子', surgical: '観血法', traditional: '旧来手法' };
// 馬の外部委託の不完全率は、牛の去勢鉗子法（標準）の不完全率に合わせる
G.horseOutsourceFail = () => G.C.castRisk.burdizzo.standard[0];
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
  speed:   { name: 'スピード', tip: '速く走る' },
  stamina: { name: 'スタミナ', tip: '長く走れる' },
  timid:   { name: '臆病', tip: 'レースで力を出しにくい', demerit: true },
  fickle:  { name: '気まぐれ', tip: 'レース成績がばらつく', demerit: true },
  racer:   { name: '競走馬', tip: 'レース評価点 +5', noRank: true },
  fertDownF:  { name: '受胎率低下', tip: '受胎率 ×0.7', noRank: true, acquired: true },
  infertileF: { name: '受胎不可', tip: '受胎しない', noRank: true, acquired: true },
  fertDownM:  { name: '繁殖力低下', tip: '交配相手の受胎率 ×0.7', noRank: true, acquired: true },
  infertileM: { name: '繁殖不能', tip: '交配できない', noRank: true, acquired: true },
  milkDecline:  { name: '乳量低下', tip: '乳量が減る　1ランクごとに −10%', demerit: true, acquired: true },
  meatDecline:  { name: '肉質低下', tip: '肉質が下がる', demerit: true, acquired: true },
  injuryProne:  { name: 'けがしやすい', tip: 'けが・事故が起きやすい', demerit: true, acquired: true },
  speedDecline: { name: '走力低下', tip: 'レースで力が落ちる', demerit: true, acquired: true },
  workDecline:  { name: '足腰の衰え', tip: '農耕の能力が下がる', demerit: true, acquired: true },
};
G.HORSE_FREE_TRAITS = ['speed', 'stamina', 'meat', 'growth', 'charm'];
G.HORSE_DEMERITS = ['temper', 'frail', 'timid', 'fickle'];
G.freeTraits = (sp) => (sp === 'horse' ? G.HORSE_FREE_TRAITS : G.CATTLE_FREE_TRAITS);
G.demerits = (sp) => (sp === 'horse' ? G.HORSE_DEMERITS : G.CATTLE_DEMERITS);
G.HORSE_NAMES = ['ハヤテ', 'ソヨカゼ', 'ポニー', 'クリ', 'アオバ', 'ヒカリ', 'ツムジ', 'ホシ', 'ミドリ', 'カザミ', 'シラユキ', 'イナホ', 'ノゾミ', 'コハク', 'サクヤ', 'ライ', 'ギンガ', 'ススキ', 'マツカゼ', 'タチバナ'];
G.STALLION_NAMES = ['サンダーボルト', 'ハーベストキング', 'シルバーアロー', 'ノーザンスター', 'グランドホープ', 'ブルーファルコン', 'レッドクラウン', 'ゴールドウィング', 'ストームライダー', 'ミストラル'];
G.CATTLE_FREE_TRAITS = ['milk', 'milkq', 'meat', 'growth', 'charm'];
G.CATTLE_DEMERITS = ['temper', 'frail'];

G.NAMES_F = ['ハナコ', 'サクラ', 'モカ', 'チョコ', 'ミルク', 'ユキ', 'ココ', 'リボン', 'マロン', 'ナナ', 'ルル', 'スミレ', 'キナコ', 'アズキ', 'ミント', 'ポポ', 'ハル', 'ツバキ', 'ラテ', 'モナカ', 'ノノ', 'ヒナ', 'ウメ', 'クルミ', 'シロ', 'メイ', 'カエデ', 'リンゴ', 'ミカン', 'ソラ'];
G.NAMES_M = ['ゴロウ', 'タロウ', 'ゴンタ', 'クロ', 'マメ', 'ジロウ', 'ポン', 'テツ', 'ダイチ', 'リキ', 'コタロウ', 'ハヤテ', 'ブン', 'ムギ', 'ゲン', 'ソウタ', 'トラ', 'ケン', 'ヤマト', 'コウ', 'ガク', 'ロック', 'ボス', 'チビ', 'イブキ', 'ショウ', 'ダン', 'ノボル', 'モモ', 'タイガ'];

G.STRAW_MAIN = ['meat', 'growth', 'milk', 'milkq'];
G.STRAW_NAMES = ['北の誉', '福光', '安美', '茂勝', '百合花', '勝早', '糸桜', '照久', '金幸', '平茂', '美津照', '藤良'];
