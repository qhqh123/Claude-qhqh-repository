// 効果音とBGM（Web Audio で合成）
G.audio = {
  ctx: null, master: null, bgmGain: null, sfxGain: null, muted: false, bgmTimer: null, step: 0,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.6;
    this.master.connect(this.ctx.destination);
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.18;
    this.bgmGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.master);
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('inochi-farm-muted', m ? '1' : ''); } catch (e) { /* */ }
    if (this.master) this.master.gain.value = m ? 0 : 0.6;
  },
  tone(freq, start, dur, type, gain, dest) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + start;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  },
  sfx(name) {
    if (!this.ctx) return;
    this.resume();
    const T = (f, s, d, ty, g) => this.tone(f, s, d, ty, g);
    switch (name) {
      case 'click': T(880, 0, 0.08, 'triangle', 0.15); break;
      case 'open': T(660, 0, 0.1, 'sine', 0.2); T(990, 0.06, 0.12, 'sine', 0.15); break;
      case 'close': T(780, 0, 0.08, 'sine', 0.15); T(520, 0.05, 0.1, 'sine', 0.12); break;
      case 'care': [784, 988, 1175, 1568].forEach((f, i) => T(f, i * 0.07, 0.25, 'sine', 0.2)); break;
      case 'coin': T(1318, 0, 0.1, 'square', 0.08); T(1760, 0.08, 0.3, 'square', 0.08); break;
      case 'notice': T(1046, 0, 0.15, 'sine', 0.2); T(1318, 0.12, 0.25, 'sine', 0.2); break;
      case 'fanfare':
        [[523, 0], [659, 0.12], [784, 0.24], [1046, 0.4], [784, 0.62], [1046, 0.76]].forEach(([f, s]) => T(f, s, 0.35, 'triangle', 0.25));
        [[262, 0.4], [330, 0.4], [392, 0.4]].forEach(([f, s]) => T(f, s, 0.8, 'sine', 0.12));
        break;
      case 'season': [659, 784, 988, 1318].forEach((f, i) => T(f, i * 0.1, 0.5, 'sine', 0.15)); break;
      case 'page': T(1200, 0, 0.04, 'triangle', 0.05); break;
      case 'moo': {
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(140, t + 0.5);
        const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(f); f.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 0.7);
        break;
      }
      default: break;
    }
  },
  // のんびりしたBGM（季節で調を変える）
  startBgm() {
    if (!this.ctx || this.bgmTimer) return;
    const scales = [
      [523, 587, 659, 784, 880, 1046], // 春
      [587, 659, 740, 880, 988, 1175], // 夏
      [440, 494, 523, 659, 740, 880],  // 秋
      [392, 440, 494, 587, 659, 784],  // 冬
    ];
    const chords = [[0, 2, 4], [3, 5, 1], [4, 1, 3], [0, 2, 4]];
    this.bgmTimer = setInterval(() => {
      if (!G.S) return;
      const sc = scales[(G.S.turn - 1) % 4];
      const bar = Math.floor(this.step / 8) % 4;
      const ch = chords[bar];
      const i = this.step % 8;
      if (i === 0) ch.forEach((n) => this.tone(sc[n] / 2, 0, 1.6, 'sine', 0.06, this.bgmGain));
      if (i % 2 === 0 || Math.random() < 0.3) {
        const n = G.pick(ch.concat([ch[0] + 1 > 5 ? 5 : ch[0] + 1]));
        this.tone(sc[n], 0, 0.5, 'triangle', 0.08, this.bgmGain);
      }
      this.step++;
    }, 300);
  },
  duck(on) {
    if (!this.bgmGain) return;
    this.bgmGain.gain.setTargetAtTime(on ? 0.09 : 0.18, this.ctx.currentTime, 0.3);
  },
};
