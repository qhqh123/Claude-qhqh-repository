// 画像スキンの登録。新しいスキンは assets/skins/<名前>/ にPNGを置き、ここに1行足す。
// active：最初に使うスキン（'standard' はプログラムで描く標準の絵）。
// 開発者モードのメニューの「スキン」で切り替えられる（ブラウザに記憶される）。
window.SKINS = {
  active: 'standard',
  list: {
    // 下絵（tools/export-skin.js で標準の絵を書き出したもの）。これをなぞって新しいスキンを作る。
    template: {
      label: '下絵',
      dir: 'assets/skins/template/',
      scale: 1 / 1.4, // 画像1px = マップ上の 1/1.4px
      frames: { walk: 4, idle: 1, graze: 1 },
      sprite: {
        cattle: { w: 128, h: 96, ax: 64, ay: 90 },
        horse: { w: 128, h: 112, ax: 64, ay: 106 },
        person: { w: 64, h: 96, ax: 32, ay: 92 },
      },
    },
  },
};
