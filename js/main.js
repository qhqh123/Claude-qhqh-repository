// 起動
G.main = {
  async boot() {
    try { G.audio.muted = !!localStorage.getItem('inochi-farm-muted'); } catch (e) { /* */ }
    await G.text.load();
    await G.skin.init();
    G.ui.initHud();
    G.ui.initTip();
    G.novel.init();
    let agreed = false;
    try { agreed = !!localStorage.getItem('inochi-farm-agreed'); } catch (e) { /* */ }
    if (agreed) this.showTitle(); else this.showWarning();
  },
  showWarning() {
    const w = document.getElementById('warning');
    w.classList.remove('hidden');
    w.querySelector('.agree').onclick = () => {
      try { localStorage.setItem('inochi-farm-agreed', '1'); } catch (e) { /* */ }
      w.classList.add('hidden');
      this.startAudio();
      this.showTitle();
    };
  },
  startAudio() {
    G.audio.init();
    G.audio.resume();
    G.audio.startBgm();
  },
  showTitle() {
    const t = document.getElementById('title');
    t.classList.remove('hidden');
    document.getElementById('game').classList.add('hidden');
    const cont = t.querySelector('.continue');
    cont.classList.toggle('hidden', !G.save.hasAuto());
    const demo = { id: 'title', idNo: '0', personality: '甘えん坊', age: 1, sex: 'F', castrated: false };
    G.draw.portrait(t.querySelector('canvas'), demo);
    t.querySelector('.new').onclick = () => {
      this.startAudio();
      if (G.save.hasAuto()) {
        G.ui.confirm('新規ゲーム', '', '新規ゲーム', () => this.newGame());
      } else this.newGame();
    };
    // 新規ゲーム（B）：出現条件はテストプレーの後で決める。今は常に表示
    t.querySelector('.new-b').onclick = () => {
      this.startAudio();
      if (G.save.hasAuto()) {
        G.ui.confirm('新規ゲーム（B）', '', '新規ゲーム', () => this.newGame('B'));
      } else this.newGame('B');
    };
    cont.onclick = () => {
      this.startAudio();
      if (G.save.loadAuto()) this.startLoaded(); else G.ui.error('セーブデータを読み込めませんでした');
    };
    t.querySelector('.load').onclick = () => {
      this.startAudio();
      G.ui.pickFile('.json,application/json', async (f) => {
        const err = await G.save.importFile(f);
        if (err) G.ui.error(err); else this.startLoaded();
      });
    };
  },
  enterGame() {
    document.getElementById('title').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    if (!G.map.canvas) G.map.init();
    G.map.st = {};
    G.map.staff.girl.init = false; G.map.staff.boy.init = false;
    G.map.buildBlocks();
    G.map.resize();
    G.map.snapCamera();
    G.ui.noticeQueue = [];
    document.getElementById('notices').innerHTML = '';
    G.ui.refreshHud();
  },
  newGame(route) {
    G.newGame(route);
    G.recalcSlots();
    this.enterGame();
    G.ui.holdNotices = true;
    for (const a of G.alive()) if (a.sex === 'M' && !a.castrated && a.age === 0) G.notify('castrate', a.id, `🐮 ${a.name}が去勢を検討できる時期になりました！`);
    G.save.auto();
    G.ui.seasonChange();
  },
  startLoaded() {
    G.recalcSlots();
    this.enterGame();
    G.ui.holdNotices = false;
    G.ui.buildNoticeQueue();
  },
};

window.addEventListener('DOMContentLoaded', () => G.main.boot());
