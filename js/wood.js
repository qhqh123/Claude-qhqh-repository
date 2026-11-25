// 木こり小屋と木材（No.23）
// 拡張の費用は「通貨＋木材」。木材の割合は施設ごと（G.C.woodShare）
G.woodCost = (base, kind) => {
  const share = G.C.woodShare[kind] || 0;
  const wood = Math.round(base * share / G.C.woodValue / G.C.woodRound) * G.C.woodRound;
  return { money: Math.round(base * (1 - share)), wood };
};
G.canPayCost = (c) => G.S.money >= c.money && (G.S.wood || 0) >= c.wood;
G.costText = (c) => `${G.yen(c.money)}${c.wood ? `　🪵${c.wood}` : ''}`;
// 木材が足りないとき、不足分を町の値段で買えば払えるか
G.woodShort = (c) => Math.max(0, c.wood - (G.S.wood || 0));
G.canBuyAndPay = (c) => G.woodShort(c) > 0 && G.S.money >= c.money + G.woodShort(c) * G.C.woodBuyPrice;
G.buyShortWood = (c) => { const n = G.woodShort(c); return n > 0 ? G.buyWood(n) : true; };
// 通貨は帳簿に、木材は同じ行に数量を書く
G.payCost = (c, label) => {
  G.S.wood = (G.S.wood || 0) - c.wood;
  G.pay(c.money, `${label}　${G.costText(c)}`);
};

// 木こり小屋：お世話の回数を使って木材を得る
G.lumberWork = (n) => {
  const S = G.S;
  n = Math.min(n, S.careLeft);
  if (n <= 0) return 0;
  S.careLeft -= n;
  const got = n * G.C.woodPerCare;
  S.wood = (S.wood || 0) + got;
  G.ledger(`木こり小屋　お世話 ${n}回分　木材 +${got}`, 0, 'note');
  return got;
};
// 町で木材を買う・売る
G.buyWood = (n) => {
  const S = G.S, cost = n * G.C.woodBuyPrice;
  if (n <= 0 || S.money < cost) return false;
  S.wood = (S.wood || 0) + n;
  G.pay(cost, `木材 購入　${n}　${G.yen(cost)}`);
  return true;
};
G.sellWood = (n) => {
  const S = G.S;
  n = Math.min(n, S.wood || 0);
  if (n <= 0) return false;
  const v = n * G.C.woodSellPrice;
  S.wood -= n;
  G.earn(v, `木材 売却　${n}　${G.yen(v)}`);
  return true;
};
