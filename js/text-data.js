// 自動生成: python3 tools/build-text.py
window.TEXT_DATA = {
 "animals.json": {
  "care.brush_01": {
   "text": "［care.brush_01｜お世話への反応］",
   "speaker": "animal",
   "cond": {
    "personality": [
     "おっとり",
     "甘えん坊",
     "マイペース"
    ]
   }
  },
  "care.brush_02": {
   "text": "［care.brush_02｜お世話への反応］",
   "speaker": "animal",
   "cond": {
    "personality": [
     "活発",
     "好奇心旺盛",
     "頑固"
    ]
   }
  },
  "care.pet_01": {
   "text": "［care.pet_01｜お世話への反応］",
   "speaker": "animal",
   "cond": {
    "personality": [
     "おっとり",
     "甘えん坊",
     "マイペース"
    ]
   }
  },
  "care.pet_02": {
   "text": "［care.pet_02｜お世話への反応］",
   "speaker": "animal",
   "cond": {
    "personality": [
     "活発",
     "好奇心旺盛",
     "頑固"
    ]
   }
  },
  "care.exercise_01": {
   "text": "［care.exercise_01｜お世話への反応］",
   "speaker": "animal",
   "cond": {
    "personality": [
     "おっとり",
     "甘えん坊",
     "マイペース"
    ]
   }
  },
  "care.exercise_02": {
   "text": "［care.exercise_02｜お世話への反応］",
   "speaker": "animal",
   "cond": {
    "personality": [
     "活発",
     "好奇心旺盛",
     "頑固"
    ]
   }
  },
  "anim.mature_01": {
   "text": "［anim.mature_01｜成熟した様子］",
   "speaker": "animal"
  },
  "rel.mother_01": {
   "text": "{name}は{partner}から生まれた",
   "speaker": "narration"
  },
  "rel.child_01": {
   "text": "{partner}は{name}から生まれた",
   "speaker": "narration"
  },
  "rel.like_01": {
   "text": "{partner}と一緒に過ごすことが多いようだ",
   "speaker": "narration"
  },
  "rel.like_02": {
   "text": "{partner}と一緒に遊ぶことが多いようだ",
   "speaker": "narration"
  },
  "rel.dislike_01": {
   "text": "{partner}と喧嘩しがちなようだ",
   "speaker": "narration"
  },
  "rel.match_01": {
   "text": "{partner}と性格が合うようだ",
   "speaker": "narration"
  }
 },
 "breeding.json": {
  "breed.ai.head": {
   "text": "［breed.ai.head］{date}｜{name}　{species} {sex}　生後{age}",
   "speaker": "narration"
  },
  "breed.ai.estrus_01": {
   "text": "［breed.ai.estrus_01｜発情の確認］",
   "speaker": "narration",
   "cond": {
    "locomotion": "quad"
   }
  },
  "breed.ai.estrus_biped_01": {
   "text": "［breed.ai.estrus_biped_01｜発情の確認（二足）］",
   "speaker": "narration",
   "cond": {
    "locomotion": "biped"
   }
  },
  "breed.ai.partner_near_01": {
   "text": "［breed.ai.partner_near_01｜仲の良い雄］",
   "speaker": "narration",
   "cond": {
    "partner_in_pasture": true
   }
  },
  "breed.ai.staff_01": {
   "text": "［breed.ai.staff_01｜厩務員の主観］",
   "speaker": "staff_girl",
   "cond": {
    "partner_in_pasture": true
   }
  },
  "breed.ai.act": {
   "text": "［breed.ai.act｜人工授精の実施］",
   "speaker": "narration",
   "cond": {
    "locomotion": "quad"
   }
  },
  "breed.ai.act.biped": {
   "text": "［breed.ai.act.biped｜人工授精の実施（二足）］",
   "speaker": "narration",
   "cond": {
    "locomotion": "biped"
   }
  },
  "breed.ai.after_partner_01": {
   "text": "［breed.ai.after_partner_01｜直後（仲の良い雄）］",
   "speaker": "narration",
   "cond": {
    "partner_in_pasture": true
   }
  },
  "breed.natural.head": {
   "text": "［breed.natural.head］{date}｜{name}　{partner}",
   "speaker": "narration"
  },
  "breed.natural.act_01": {
   "text": "［breed.natural.act_01｜自然交配（仲の良い相手）］",
   "speaker": "narration",
   "cond": {
    "partner_liked": true,
    "locomotion": "quad"
   }
  },
  "breed.natural.act_biped_01": {
   "text": "［breed.natural.act_biped_01｜自然交配（仲の良い相手）（二足）］",
   "speaker": "narration",
   "cond": {
    "partner_liked": true,
    "locomotion": "biped"
   }
  },
  "breed.natural.act_02": {
   "text": "［breed.natural.act_02｜自然交配（それ以外）］",
   "speaker": "narration",
   "cond": {
    "partner_liked": false,
    "locomotion": "quad"
   }
  },
  "breed.natural.act_biped_02": {
   "text": "［breed.natural.act_biped_02｜自然交配（それ以外）（二足）］",
   "speaker": "narration",
   "cond": {
    "partner_liked": false,
    "locomotion": "biped"
   }
  },
  "breed.natural.after_01": {
   "text": "［breed.natural.after_01｜直後］",
   "speaker": "narration"
  },
  "breed.teaser.act_01": {
   "text": "［breed.teaser.act_01｜当て馬］",
   "speaker": "narration",
   "cond": {
    "species": "horse",
    "locomotion": "quad"
   }
  },
  "breed.teaser.act_biped_01": {
   "text": "［breed.teaser.act_biped_01｜当て馬（二足）］",
   "speaker": "narration",
   "cond": {
    "species": "horse",
    "locomotion": "biped"
   }
  },
  "breed.teaser.after_01": {
   "text": "［breed.teaser.after_01｜当て馬の直後］",
   "speaker": "narration",
   "cond": {
    "species": "horse"
   }
  },
  "breed.stallion.head": {
   "text": "［breed.stallion.head］{date}｜{name}　{partner}",
   "speaker": "narration"
  },
  "breed.stallion.act_01": {
   "text": "［breed.stallion.act_01｜外部種牡馬との交配］",
   "speaker": "narration",
   "cond": {
    "species": "horse",
    "locomotion": "quad"
   }
  },
  "breed.stallion.act_biped_01": {
   "text": "［breed.stallion.act_biped_01｜外部種牡馬との交配（二足）］",
   "speaker": "narration",
   "cond": {
    "species": "horse",
    "locomotion": "biped"
   }
  },
  "breed.stallion.after_01": {
   "text": "［breed.stallion.after_01｜直後］",
   "speaker": "narration",
   "cond": {
    "species": "horse"
   }
  },
  "breed.voice.pre.calm_01": {
   "text": "［breed.voice.pre.calm_01｜声・交配前］",
   "speaker": "animal"
  },
  "breed.voice.pre.sweet_01": {
   "text": "［breed.voice.pre.sweet_01｜声・交配前］",
   "speaker": "animal"
  },
  "breed.voice.pre.lively_01": {
   "text": "［breed.voice.pre.lively_01｜声・交配前］",
   "speaker": "animal"
  },
  "breed.voice.pre.curious_01": {
   "text": "［breed.voice.pre.curious_01｜声・交配前］",
   "speaker": "animal"
  },
  "breed.voice.pre.easy_01": {
   "text": "［breed.voice.pre.easy_01｜声・交配前］",
   "speaker": "animal"
  },
  "breed.voice.pre.stubborn_01": {
   "text": "［breed.voice.pre.stubborn_01｜声・交配前］",
   "speaker": "animal"
  },
  "breed.voice.act.calm_01": {
   "text": "［breed.voice.act.calm_01｜声・交配］",
   "speaker": "animal"
  },
  "breed.voice.act.sweet_01": {
   "text": "［breed.voice.act.sweet_01｜声・交配］",
   "speaker": "animal"
  },
  "breed.voice.act.lively_01": {
   "text": "［breed.voice.act.lively_01｜声・交配］",
   "speaker": "animal"
  },
  "breed.voice.act.curious_01": {
   "text": "［breed.voice.act.curious_01｜声・交配］",
   "speaker": "animal"
  },
  "breed.voice.act.easy_01": {
   "text": "［breed.voice.act.easy_01｜声・交配］",
   "speaker": "animal"
  },
  "breed.voice.act.stubborn_01": {
   "text": "［breed.voice.act.stubborn_01｜声・交配］",
   "speaker": "animal"
  },
  "breed.voice.after.calm_01": {
   "text": "［breed.voice.after.calm_01｜声・交配後］",
   "speaker": "animal"
  },
  "breed.voice.after.sweet_01": {
   "text": "［breed.voice.after.sweet_01｜声・交配後］",
   "speaker": "animal"
  },
  "breed.voice.after.lively_01": {
   "text": "［breed.voice.after.lively_01｜声・交配後］",
   "speaker": "animal"
  },
  "breed.voice.after.curious_01": {
   "text": "［breed.voice.after.curious_01｜声・交配後］",
   "speaker": "animal"
  },
  "breed.voice.after.easy_01": {
   "text": "［breed.voice.after.easy_01｜声・交配後］",
   "speaker": "animal"
  },
  "breed.voice.after.stubborn_01": {
   "text": "［breed.voice.after.stubborn_01｜声・交配後］",
   "speaker": "animal"
  }
 },
 "castration.json": {
  "cas.head": {
   "text": "［cas.head］{date}｜{name}　{species} {sex}　生後{age}",
   "speaker": "narration"
  },
  "cas.cattle.function_sperm": {
   "text": "［cas.cattle.function_sperm｜機能の説明1］",
   "speaker": "narration",
   "cond": {
    "species": "cattle"
   }
  },
  "cas.cattle.function_hormone": {
   "text": "［cas.cattle.function_hormone｜機能の説明2］",
   "speaker": "narration",
   "cond": {
    "species": "cattle"
   }
  },
  "cas.ring.pre_01": {
   "text": "［cas.ring.pre_01｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "おっとり",
     "甘えん坊",
     "マイペース"
    ]
   }
  },
  "cas.ring.pre_02": {
   "text": "［cas.ring.pre_02｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "活発",
     "好奇心旺盛",
     "頑固"
    ]
   }
  },
  "cas.ring.tool": {
   "text": "［cas.ring.tool｜器具の準備］",
   "speaker": "narration",
   "cond": {
    "method": "ring"
   }
  },
  "cas.ring.locate": {
   "text": "［cas.ring.locate｜対象の確認］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "locomotion": "quad"
   }
  },
  "cas.ring.locate.biped": {
   "text": "［cas.ring.locate.biped｜対象の確認（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "locomotion": "biped"
   }
  },
  "cas.ring.act": {
   "text": "［cas.ring.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "locomotion": "quad"
   }
  },
  "cas.ring.act.biped": {
   "text": "［cas.ring.act.biped｜処置の実施（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "locomotion": "biped"
   }
  },
  "cas.ring.mismatch_01": {
   "text": "［cas.ring.mismatch_01｜適さない時期の処置］",
   "speaker": "narration",
   "cond": {
    "method": "ring"
   }
  },
  "cas.ring.react_01": {
   "text": "［cas.ring.react_01｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "quad"
   }
  },
  "cas.ring.react_biped_01": {
   "text": "［cas.ring.react_biped_01｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "biped"
   }
  },
  "cas.ring.react_02": {
   "text": "［cas.ring.react_02｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "quad"
   }
  },
  "cas.ring.react_biped_02": {
   "text": "［cas.ring.react_biped_02｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "biped"
   }
  },
  "cas.ring.react_03": {
   "text": "［cas.ring.react_03｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "quad"
   }
  },
  "cas.ring.react_biped_03": {
   "text": "［cas.ring.react_biped_03｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "biped"
   }
  },
  "cas.ring.after": {
   "text": "［cas.ring.after｜直後］",
   "speaker": "narration",
   "cond": {
    "method": "ring"
   }
  },
  "cas.ring.course_01": {
   "text": "［cas.ring.course_01｜経過日誌］",
   "speaker": "narration",
   "cond": {
    "method": "ring"
   }
  },
  "cas.burdizzo.pre_01": {
   "text": "［cas.burdizzo.pre_01｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "おっとり",
     "甘えん坊",
     "マイペース"
    ]
   }
  },
  "cas.burdizzo.pre_02": {
   "text": "［cas.burdizzo.pre_02｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "活発",
     "好奇心旺盛",
     "頑固"
    ]
   }
  },
  "cas.burdizzo.tool": {
   "text": "［cas.burdizzo.tool｜器具の準備］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo"
   }
  },
  "cas.burdizzo.locate": {
   "text": "［cas.burdizzo.locate｜対象の確認］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "locomotion": "quad"
   }
  },
  "cas.burdizzo.locate.biped": {
   "text": "［cas.burdizzo.locate.biped｜対象の確認（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "locomotion": "biped"
   }
  },
  "cas.burdizzo.act": {
   "text": "［cas.burdizzo.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "locomotion": "quad"
   }
  },
  "cas.burdizzo.act.biped": {
   "text": "［cas.burdizzo.act.biped｜処置の実施（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "locomotion": "biped"
   }
  },
  "cas.burdizzo.mismatch_01": {
   "text": "［cas.burdizzo.mismatch_01｜適さない時期の処置］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo"
   }
  },
  "cas.burdizzo.react_01": {
   "text": "［cas.burdizzo.react_01｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "quad"
   }
  },
  "cas.burdizzo.react_biped_01": {
   "text": "［cas.burdizzo.react_biped_01｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "biped"
   }
  },
  "cas.burdizzo.react_02": {
   "text": "［cas.burdizzo.react_02｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "quad"
   }
  },
  "cas.burdizzo.react_biped_02": {
   "text": "［cas.burdizzo.react_biped_02｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "biped"
   }
  },
  "cas.burdizzo.react_03": {
   "text": "［cas.burdizzo.react_03｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "quad"
   }
  },
  "cas.burdizzo.react_biped_03": {
   "text": "［cas.burdizzo.react_biped_03｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "biped"
   }
  },
  "cas.burdizzo.after": {
   "text": "［cas.burdizzo.after｜直後］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo"
   }
  },
  "cas.burdizzo.course_01": {
   "text": "［cas.burdizzo.course_01｜経過日誌］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo"
   }
  },
  "cas.surgical.pre_01": {
   "text": "［cas.surgical.pre_01｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "おっとり",
     "甘えん坊",
     "マイペース"
    ]
   }
  },
  "cas.surgical.pre_02": {
   "text": "［cas.surgical.pre_02｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "活発",
     "好奇心旺盛",
     "頑固"
    ]
   }
  },
  "cas.surgical.tool": {
   "text": "［cas.surgical.tool｜器具の準備］",
   "speaker": "narration",
   "cond": {
    "method": "surgical"
   }
  },
  "cas.surgical.locate": {
   "text": "［cas.surgical.locate｜対象の確認］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "locomotion": "quad"
   }
  },
  "cas.surgical.locate.biped": {
   "text": "［cas.surgical.locate.biped｜対象の確認（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "locomotion": "biped"
   }
  },
  "cas.surgical.act": {
   "text": "［cas.surgical.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "locomotion": "quad"
   }
  },
  "cas.surgical.act.biped": {
   "text": "［cas.surgical.act.biped｜処置の実施（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "locomotion": "biped"
   }
  },
  "cas.surgical.mismatch_01": {
   "text": "［cas.surgical.mismatch_01｜適さない時期の処置］",
   "speaker": "narration",
   "cond": {
    "method": "surgical"
   }
  },
  "cas.surgical.react_01": {
   "text": "［cas.surgical.react_01｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "quad"
   }
  },
  "cas.surgical.react_biped_01": {
   "text": "［cas.surgical.react_biped_01｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "biped"
   }
  },
  "cas.surgical.react_02": {
   "text": "［cas.surgical.react_02｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "quad"
   }
  },
  "cas.surgical.react_biped_02": {
   "text": "［cas.surgical.react_biped_02｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "biped"
   }
  },
  "cas.surgical.react_03": {
   "text": "［cas.surgical.react_03｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "quad"
   }
  },
  "cas.surgical.react_biped_03": {
   "text": "［cas.surgical.react_biped_03｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "biped"
   }
  },
  "cas.surgical.after": {
   "text": "［cas.surgical.after｜直後］",
   "speaker": "narration",
   "cond": {
    "method": "surgical"
   }
  },
  "cas.surgical.course_01": {
   "text": "［cas.surgical.course_01｜経過日誌］",
   "speaker": "narration",
   "cond": {
    "method": "surgical"
   }
  },
  "cas.course_incomplete_01": {
   "text": "［cas.course_incomplete_01｜経過日誌（不完全）］",
   "speaker": "narration"
  },
  "cas.course_infection_01": {
   "text": "［cas.course_infection_01｜経過日誌（感染）］",
   "speaker": "narration"
  },
  "cas.react_projection_01": {
   "text": "［cas.react_projection_01｜語り手の一文］",
   "speaker": "narration"
  },
  "cas.staff_girl_01": {
   "text": "［cas.staff_girl_01｜厩務員の主観］",
   "speaker": "staff_girl"
  },
  "cas.staff_boy_01": {
   "text": "［cas.staff_boy_01｜厩務員の主観］",
   "speaker": "staff_boy"
  },
  "cas.horse.function_sperm": {
   "text": "［cas.horse.function_sperm｜機能の説明1］",
   "speaker": "narration",
   "cond": {
    "species": "horse"
   }
  },
  "cas.horse.function_hormone": {
   "text": "［cas.horse.function_hormone｜機能の説明2］",
   "speaker": "narration",
   "cond": {
    "species": "horse"
   }
  },
  "cas.traditional.pre_01": {
   "text": "［cas.traditional.pre_01｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "おっとり",
     "甘えん坊",
     "マイペース"
    ]
   }
  },
  "cas.traditional.pre_02": {
   "text": "［cas.traditional.pre_02｜処置前の観察］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "活発",
     "好奇心旺盛",
     "頑固"
    ]
   }
  },
  "cas.traditional.tool": {
   "text": "［cas.traditional.tool｜器具の準備］",
   "speaker": "narration",
   "cond": {
    "method": "traditional"
   }
  },
  "cas.traditional.locate": {
   "text": "［cas.traditional.locate｜対象の確認］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "locomotion": "quad"
   }
  },
  "cas.traditional.locate.biped": {
   "text": "［cas.traditional.locate.biped｜対象の確認（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "locomotion": "biped"
   }
  },
  "cas.traditional.act": {
   "text": "［cas.traditional.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "locomotion": "quad"
   }
  },
  "cas.traditional.act.biped": {
   "text": "［cas.traditional.act.biped｜処置の実施（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "locomotion": "biped"
   }
  },
  "cas.traditional.mismatch_01": {
   "text": "［cas.traditional.mismatch_01｜適さない時期の処置］",
   "speaker": "narration",
   "cond": {
    "method": "traditional"
   }
  },
  "cas.traditional.react_01": {
   "text": "［cas.traditional.react_01｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "quad"
   }
  },
  "cas.traditional.react_biped_01": {
   "text": "［cas.traditional.react_biped_01｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "おっとり",
     "甘えん坊"
    ],
    "locomotion": "biped"
   }
  },
  "cas.traditional.react_02": {
   "text": "［cas.traditional.react_02｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "quad"
   }
  },
  "cas.traditional.react_biped_02": {
   "text": "［cas.traditional.react_biped_02｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "活発",
     "頑固"
    ],
    "locomotion": "biped"
   }
  },
  "cas.traditional.react_03": {
   "text": "［cas.traditional.react_03｜反応］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "quad"
   }
  },
  "cas.traditional.react_biped_03": {
   "text": "［cas.traditional.react_biped_03｜反応（二足）］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ],
    "locomotion": "biped"
   }
  },
  "cas.traditional.after": {
   "text": "［cas.traditional.after｜直後］",
   "speaker": "narration",
   "cond": {
    "method": "traditional"
   }
  },
  "cas.traditional.course_01": {
   "text": "［cas.traditional.course_01｜経過日誌］",
   "speaker": "narration",
   "cond": {
    "method": "traditional"
   }
  },
  "cas.keep_testes_01": {
   "text": "［cas.keep_testes_01｜精巣の冷凍保存］",
   "speaker": "narration"
  },
  "cas.voice.ring.pre.calm_01": {
   "text": "［cas.voice.ring.pre.calm_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.ring.pre.sweet_01": {
   "text": "［cas.voice.ring.pre.sweet_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.ring.pre.lively_01": {
   "text": "［cas.voice.ring.pre.lively_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.ring.pre.curious_01": {
   "text": "［cas.voice.ring.pre.curious_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.ring.pre.easy_01": {
   "text": "［cas.voice.ring.pre.easy_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.ring.pre.stubborn_01": {
   "text": "［cas.voice.ring.pre.stubborn_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.ring.act.calm_01": {
   "text": "［cas.voice.ring.act.calm_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.ring.act.sweet_01": {
   "text": "［cas.voice.ring.act.sweet_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.ring.act.lively_01": {
   "text": "［cas.voice.ring.act.lively_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.ring.act.curious_01": {
   "text": "［cas.voice.ring.act.curious_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.ring.act.easy_01": {
   "text": "［cas.voice.ring.act.easy_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.ring.act.stubborn_01": {
   "text": "［cas.voice.ring.act.stubborn_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.ring.react.calm_01": {
   "text": "［cas.voice.ring.react.calm_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.ring.react.sweet_01": {
   "text": "［cas.voice.ring.react.sweet_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.ring.react.lively_01": {
   "text": "［cas.voice.ring.react.lively_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.ring.react.curious_01": {
   "text": "［cas.voice.ring.react.curious_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.ring.react.easy_01": {
   "text": "［cas.voice.ring.react.easy_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.ring.react.stubborn_01": {
   "text": "［cas.voice.ring.react.stubborn_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.ring.after.calm_01": {
   "text": "［cas.voice.ring.after.calm_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.ring.after.sweet_01": {
   "text": "［cas.voice.ring.after.sweet_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.ring.after.lively_01": {
   "text": "［cas.voice.ring.after.lively_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.ring.after.curious_01": {
   "text": "［cas.voice.ring.after.curious_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.ring.after.easy_01": {
   "text": "［cas.voice.ring.after.easy_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.ring.after.stubborn_01": {
   "text": "［cas.voice.ring.after.stubborn_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.ring.course.calm_01": {
   "text": "［cas.voice.ring.course.calm_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.ring.course.sweet_01": {
   "text": "［cas.voice.ring.course.sweet_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.ring.course.lively_01": {
   "text": "［cas.voice.ring.course.lively_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.ring.course.curious_01": {
   "text": "［cas.voice.ring.course.curious_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.ring.course.easy_01": {
   "text": "［cas.voice.ring.course.easy_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.ring.course.stubborn_01": {
   "text": "［cas.voice.ring.course.stubborn_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.pre.calm_01": {
   "text": "［cas.voice.burdizzo.pre.calm_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.pre.sweet_01": {
   "text": "［cas.voice.burdizzo.pre.sweet_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.pre.lively_01": {
   "text": "［cas.voice.burdizzo.pre.lively_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.pre.curious_01": {
   "text": "［cas.voice.burdizzo.pre.curious_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.pre.easy_01": {
   "text": "［cas.voice.burdizzo.pre.easy_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.pre.stubborn_01": {
   "text": "［cas.voice.burdizzo.pre.stubborn_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.act.calm_01": {
   "text": "［cas.voice.burdizzo.act.calm_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.act.sweet_01": {
   "text": "［cas.voice.burdizzo.act.sweet_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.act.lively_01": {
   "text": "［cas.voice.burdizzo.act.lively_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.act.curious_01": {
   "text": "［cas.voice.burdizzo.act.curious_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.act.easy_01": {
   "text": "［cas.voice.burdizzo.act.easy_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.act.stubborn_01": {
   "text": "［cas.voice.burdizzo.act.stubborn_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.react.calm_01": {
   "text": "［cas.voice.burdizzo.react.calm_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.react.sweet_01": {
   "text": "［cas.voice.burdizzo.react.sweet_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.react.lively_01": {
   "text": "［cas.voice.burdizzo.react.lively_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.react.curious_01": {
   "text": "［cas.voice.burdizzo.react.curious_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.react.easy_01": {
   "text": "［cas.voice.burdizzo.react.easy_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.react.stubborn_01": {
   "text": "［cas.voice.burdizzo.react.stubborn_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.after.calm_01": {
   "text": "［cas.voice.burdizzo.after.calm_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.after.sweet_01": {
   "text": "［cas.voice.burdizzo.after.sweet_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.after.lively_01": {
   "text": "［cas.voice.burdizzo.after.lively_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.after.curious_01": {
   "text": "［cas.voice.burdizzo.after.curious_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.after.easy_01": {
   "text": "［cas.voice.burdizzo.after.easy_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.after.stubborn_01": {
   "text": "［cas.voice.burdizzo.after.stubborn_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.course.calm_01": {
   "text": "［cas.voice.burdizzo.course.calm_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.course.sweet_01": {
   "text": "［cas.voice.burdizzo.course.sweet_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.course.lively_01": {
   "text": "［cas.voice.burdizzo.course.lively_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.course.curious_01": {
   "text": "［cas.voice.burdizzo.course.curious_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.course.easy_01": {
   "text": "［cas.voice.burdizzo.course.easy_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.burdizzo.course.stubborn_01": {
   "text": "［cas.voice.burdizzo.course.stubborn_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.surgical.pre.calm_01": {
   "text": "［cas.voice.surgical.pre.calm_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.surgical.pre.sweet_01": {
   "text": "［cas.voice.surgical.pre.sweet_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.surgical.pre.lively_01": {
   "text": "［cas.voice.surgical.pre.lively_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.surgical.pre.curious_01": {
   "text": "［cas.voice.surgical.pre.curious_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.surgical.pre.easy_01": {
   "text": "［cas.voice.surgical.pre.easy_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.surgical.pre.stubborn_01": {
   "text": "［cas.voice.surgical.pre.stubborn_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.surgical.act.calm_01": {
   "text": "［cas.voice.surgical.act.calm_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.surgical.act.sweet_01": {
   "text": "［cas.voice.surgical.act.sweet_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.surgical.act.lively_01": {
   "text": "［cas.voice.surgical.act.lively_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.surgical.act.curious_01": {
   "text": "［cas.voice.surgical.act.curious_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.surgical.act.easy_01": {
   "text": "［cas.voice.surgical.act.easy_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.surgical.act.stubborn_01": {
   "text": "［cas.voice.surgical.act.stubborn_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.surgical.react.calm_01": {
   "text": "［cas.voice.surgical.react.calm_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.surgical.react.sweet_01": {
   "text": "［cas.voice.surgical.react.sweet_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.surgical.react.lively_01": {
   "text": "［cas.voice.surgical.react.lively_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.surgical.react.curious_01": {
   "text": "［cas.voice.surgical.react.curious_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.surgical.react.easy_01": {
   "text": "［cas.voice.surgical.react.easy_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.surgical.react.stubborn_01": {
   "text": "［cas.voice.surgical.react.stubborn_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.surgical.after.calm_01": {
   "text": "［cas.voice.surgical.after.calm_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.surgical.after.sweet_01": {
   "text": "［cas.voice.surgical.after.sweet_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.surgical.after.lively_01": {
   "text": "［cas.voice.surgical.after.lively_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.surgical.after.curious_01": {
   "text": "［cas.voice.surgical.after.curious_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.surgical.after.easy_01": {
   "text": "［cas.voice.surgical.after.easy_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.surgical.after.stubborn_01": {
   "text": "［cas.voice.surgical.after.stubborn_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.surgical.course.calm_01": {
   "text": "［cas.voice.surgical.course.calm_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.surgical.course.sweet_01": {
   "text": "［cas.voice.surgical.course.sweet_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.surgical.course.lively_01": {
   "text": "［cas.voice.surgical.course.lively_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.surgical.course.curious_01": {
   "text": "［cas.voice.surgical.course.curious_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.surgical.course.easy_01": {
   "text": "［cas.voice.surgical.course.easy_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.surgical.course.stubborn_01": {
   "text": "［cas.voice.surgical.course.stubborn_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.traditional.pre.calm_01": {
   "text": "［cas.voice.traditional.pre.calm_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.traditional.pre.sweet_01": {
   "text": "［cas.voice.traditional.pre.sweet_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.traditional.pre.lively_01": {
   "text": "［cas.voice.traditional.pre.lively_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.traditional.pre.curious_01": {
   "text": "［cas.voice.traditional.pre.curious_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.traditional.pre.easy_01": {
   "text": "［cas.voice.traditional.pre.easy_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.traditional.pre.stubborn_01": {
   "text": "［cas.voice.traditional.pre.stubborn_01｜声・処置前］",
   "speaker": "animal"
  },
  "cas.voice.traditional.act.calm_01": {
   "text": "［cas.voice.traditional.act.calm_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.traditional.act.sweet_01": {
   "text": "［cas.voice.traditional.act.sweet_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.traditional.act.lively_01": {
   "text": "［cas.voice.traditional.act.lively_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.traditional.act.curious_01": {
   "text": "［cas.voice.traditional.act.curious_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.traditional.act.easy_01": {
   "text": "［cas.voice.traditional.act.easy_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.traditional.act.stubborn_01": {
   "text": "［cas.voice.traditional.act.stubborn_01｜声・処置］",
   "speaker": "animal"
  },
  "cas.voice.traditional.react.calm_01": {
   "text": "［cas.voice.traditional.react.calm_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.traditional.react.sweet_01": {
   "text": "［cas.voice.traditional.react.sweet_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.traditional.react.lively_01": {
   "text": "［cas.voice.traditional.react.lively_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.traditional.react.curious_01": {
   "text": "［cas.voice.traditional.react.curious_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.traditional.react.easy_01": {
   "text": "［cas.voice.traditional.react.easy_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.traditional.react.stubborn_01": {
   "text": "［cas.voice.traditional.react.stubborn_01｜声・反応］",
   "speaker": "animal"
  },
  "cas.voice.traditional.after.calm_01": {
   "text": "［cas.voice.traditional.after.calm_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.traditional.after.sweet_01": {
   "text": "［cas.voice.traditional.after.sweet_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.traditional.after.lively_01": {
   "text": "［cas.voice.traditional.after.lively_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.traditional.after.curious_01": {
   "text": "［cas.voice.traditional.after.curious_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.traditional.after.easy_01": {
   "text": "［cas.voice.traditional.after.easy_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.traditional.after.stubborn_01": {
   "text": "［cas.voice.traditional.after.stubborn_01｜声・直後］",
   "speaker": "animal"
  },
  "cas.voice.traditional.course.calm_01": {
   "text": "［cas.voice.traditional.course.calm_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.traditional.course.sweet_01": {
   "text": "［cas.voice.traditional.course.sweet_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.traditional.course.lively_01": {
   "text": "［cas.voice.traditional.course.lively_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.traditional.course.curious_01": {
   "text": "［cas.voice.traditional.course.curious_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.traditional.course.easy_01": {
   "text": "［cas.voice.traditional.course.easy_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.voice.traditional.course.stubborn_01": {
   "text": "［cas.voice.traditional.course.stubborn_01｜声・経過日誌］",
   "speaker": "animal"
  },
  "cas.arms.locate_01": {
   "text": "［cas.arms.locate_01｜腕・押さえ方］",
   "speaker": "narration",
   "cond": {
    "method": "ring"
   }
  },
  "cas.arms.act_01": {
   "text": "［cas.arms.act_01｜腕・処置］",
   "speaker": "narration",
   "cond": {
    "method": "ring"
   }
  },
  "cas.arms.react_01": {
   "text": "［cas.arms.react_01｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "おっとり",
     "甘えん坊"
    ]
   }
  },
  "cas.arms.react_02": {
   "text": "［cas.arms.react_02｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "活発",
     "頑固"
    ]
   }
  },
  "cas.arms.react_03": {
   "text": "［cas.arms.react_03｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "ring",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ]
   }
  },
  "cas.arms.locate_02": {
   "text": "［cas.arms.locate_02｜腕・押さえ方］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo"
   }
  },
  "cas.arms.act_02": {
   "text": "［cas.arms.act_02｜腕・処置］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo"
   }
  },
  "cas.arms.react_04": {
   "text": "［cas.arms.react_04｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "おっとり",
     "甘えん坊"
    ]
   }
  },
  "cas.arms.react_05": {
   "text": "［cas.arms.react_05｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "活発",
     "頑固"
    ]
   }
  },
  "cas.arms.react_06": {
   "text": "［cas.arms.react_06｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ]
   }
  },
  "cas.arms.locate_03": {
   "text": "［cas.arms.locate_03｜腕・押さえ方］",
   "speaker": "narration",
   "cond": {
    "method": "surgical"
   }
  },
  "cas.arms.act_03": {
   "text": "［cas.arms.act_03｜腕・処置］",
   "speaker": "narration",
   "cond": {
    "method": "surgical"
   }
  },
  "cas.arms.react_07": {
   "text": "［cas.arms.react_07｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "おっとり",
     "甘えん坊"
    ]
   }
  },
  "cas.arms.react_08": {
   "text": "［cas.arms.react_08｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "活発",
     "頑固"
    ]
   }
  },
  "cas.arms.react_09": {
   "text": "［cas.arms.react_09｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "surgical",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ]
   }
  },
  "cas.arms.locate_04": {
   "text": "［cas.arms.locate_04｜腕・押さえ方］",
   "speaker": "narration",
   "cond": {
    "method": "traditional"
   }
  },
  "cas.arms.act_04": {
   "text": "［cas.arms.act_04｜腕・処置］",
   "speaker": "narration",
   "cond": {
    "method": "traditional"
   }
  },
  "cas.arms.react_10": {
   "text": "［cas.arms.react_10｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "おっとり",
     "甘えん坊"
    ]
   }
  },
  "cas.arms.react_11": {
   "text": "［cas.arms.react_11｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "活発",
     "頑固"
    ]
   }
  },
  "cas.arms.react_12": {
   "text": "［cas.arms.react_12｜腕・反応］",
   "speaker": "narration",
   "cond": {
    "method": "traditional",
    "personality": [
     "好奇心旺盛",
     "マイペース"
    ]
   }
  },
  "b.mature.pre.calm_01": {
   "text": "［b.mature.pre.calm_01｜B成熟後の去勢・処置を嫌がる］",
   "speaker": "animal"
  },
  "b.mature.pre.sweet_01": {
   "text": "［b.mature.pre.sweet_01｜B成熟後の去勢・処置を嫌がる］",
   "speaker": "animal"
  },
  "b.mature.pre.lively_01": {
   "text": "［b.mature.pre.lively_01｜B成熟後の去勢・処置を嫌がる］",
   "speaker": "animal"
  },
  "b.mature.pre.curious_01": {
   "text": "［b.mature.pre.curious_01｜B成熟後の去勢・処置を嫌がる］",
   "speaker": "animal"
  },
  "b.mature.pre.easy_01": {
   "text": "［b.mature.pre.easy_01｜B成熟後の去勢・処置を嫌がる］",
   "speaker": "animal"
  },
  "b.mature.pre.stubborn_01": {
   "text": "［b.mature.pre.stubborn_01｜B成熟後の去勢・処置を嫌がる］",
   "speaker": "animal"
  },
  "b.mature.after.calm_01": {
   "text": "［b.mature.after.calm_01｜B成熟後の去勢・失ったことを話す］",
   "speaker": "animal"
  },
  "b.mature.after.sweet_01": {
   "text": "［b.mature.after.sweet_01｜B成熟後の去勢・失ったことを話す］",
   "speaker": "animal"
  },
  "b.mature.after.lively_01": {
   "text": "［b.mature.after.lively_01｜B成熟後の去勢・失ったことを話す］",
   "speaker": "animal"
  },
  "b.mature.after.curious_01": {
   "text": "［b.mature.after.curious_01｜B成熟後の去勢・失ったことを話す］",
   "speaker": "animal"
  },
  "b.mature.after.easy_01": {
   "text": "［b.mature.after.easy_01｜B成熟後の去勢・失ったことを話す］",
   "speaker": "animal"
  },
  "b.mature.after.stubborn_01": {
   "text": "［b.mature.after.stubborn_01｜B成熟後の去勢・失ったことを話す］",
   "speaker": "animal"
  },
  "b.margin_01": {
   "text": "［b.margin_01｜B余白］",
   "speaker": "margin"
  },
  "b.margin_02": {
   "text": "［b.margin_02｜B余白］",
   "speaker": "margin"
  }
 },
 "daily-events.json": {
  "daily.staff_girl_01": {
   "text": "［daily.staff_girl_01｜厩務員ガールの台詞］",
   "speaker": "staff_girl"
  },
  "daily.staff_boy_01": {
   "text": "［daily.staff_boy_01｜厩務員ボーイの台詞］",
   "speaker": "staff_boy"
  },
  "daily.staff_girl_02": {
   "text": "［daily.staff_girl_02｜厩務員ガールの台詞］",
   "speaker": "staff_girl"
  },
  "daily.staff_boy_02": {
   "text": "［daily.staff_boy_02｜厩務員ボーイの台詞］",
   "speaker": "staff_boy"
  },
  "daily.staff_girl_03": {
   "text": "［daily.staff_girl_03｜厩務員ガールの台詞］",
   "speaker": "staff_girl"
  },
  "daily.staff_boy_03": {
   "text": "［daily.staff_boy_03｜厩務員ボーイの台詞］",
   "speaker": "staff_boy"
  },
  "daily.animal_01": {
   "text": "［daily.animal_01｜家畜の仕草］",
   "speaker": "narration"
  },
  "daily.animal_02": {
   "text": "［daily.animal_02｜家畜の仕草］",
   "speaker": "narration"
  },
  "daily.animal_03": {
   "text": "［daily.animal_03｜家畜の仕草］",
   "speaker": "narration"
  },
  "staff.match_girl_01": {
   "text": "［staff.match_girl_01｜相性の良い個体への台詞］",
   "speaker": "staff_girl",
   "cond": {
    "personality": [
     "おっとり",
     "甘えん坊",
     "活発"
    ]
   }
  },
  "staff.match_boy_01": {
   "text": "［staff.match_boy_01｜相性の良い個体への台詞］",
   "speaker": "staff_boy",
   "cond": {
    "personality": [
     "好奇心旺盛",
     "マイペース",
     "頑固"
    ]
   }
  },
  "senior.advice_01": {
   "text": "［senior.advice_01｜先輩牧場主のアドバイス］",
   "speaker": "senior"
  },
  "senior.advice_02": {
   "text": "［senior.advice_02｜先輩牧場主のアドバイス］",
   "speaker": "senior"
  },
  "senior.advice_03": {
   "text": "［senior.advice_03｜先輩牧場主のアドバイス］",
   "speaker": "senior"
  },
  "senior.rescue_01": {
   "text": "［senior.rescue_01｜再建支援］",
   "speaker": "senior"
  },
  "daily.voice.calm_01": {
   "text": "［daily.voice.calm_01｜声・日常］",
   "speaker": "animal"
  },
  "daily.voice.sweet_01": {
   "text": "［daily.voice.sweet_01｜声・日常］",
   "speaker": "animal"
  },
  "daily.voice.lively_01": {
   "text": "［daily.voice.lively_01｜声・日常］",
   "speaker": "animal"
  },
  "daily.voice.curious_01": {
   "text": "［daily.voice.curious_01｜声・日常］",
   "speaker": "animal"
  },
  "daily.voice.easy_01": {
   "text": "［daily.voice.easy_01｜声・日常］",
   "speaker": "animal"
  },
  "daily.voice.stubborn_01": {
   "text": "［daily.voice.stubborn_01｜声・日常］",
   "speaker": "animal"
  },
  "b.voice.cas_pre.calm_01": {
   "text": "［b.voice.cas_pre.calm_01｜B声・去勢・処置前］",
   "speaker": "animal"
  },
  "b.voice.cas_pre.sweet_01": {
   "text": "［b.voice.cas_pre.sweet_01｜B声・去勢・処置前］",
   "speaker": "animal"
  },
  "b.voice.cas_pre.lively_01": {
   "text": "［b.voice.cas_pre.lively_01｜B声・去勢・処置前］",
   "speaker": "animal"
  },
  "b.voice.cas_pre.curious_01": {
   "text": "［b.voice.cas_pre.curious_01｜B声・去勢・処置前］",
   "speaker": "animal"
  },
  "b.voice.cas_pre.easy_01": {
   "text": "［b.voice.cas_pre.easy_01｜B声・去勢・処置前］",
   "speaker": "animal"
  },
  "b.voice.cas_pre.stubborn_01": {
   "text": "［b.voice.cas_pre.stubborn_01｜B声・去勢・処置前］",
   "speaker": "animal"
  },
  "b.voice.cas_act.calm_01": {
   "text": "［b.voice.cas_act.calm_01｜B声・去勢・処置］",
   "speaker": "animal"
  },
  "b.voice.cas_act.sweet_01": {
   "text": "［b.voice.cas_act.sweet_01｜B声・去勢・処置］",
   "speaker": "animal"
  },
  "b.voice.cas_act.lively_01": {
   "text": "［b.voice.cas_act.lively_01｜B声・去勢・処置］",
   "speaker": "animal"
  },
  "b.voice.cas_act.curious_01": {
   "text": "［b.voice.cas_act.curious_01｜B声・去勢・処置］",
   "speaker": "animal"
  },
  "b.voice.cas_act.easy_01": {
   "text": "［b.voice.cas_act.easy_01｜B声・去勢・処置］",
   "speaker": "animal"
  },
  "b.voice.cas_act.stubborn_01": {
   "text": "［b.voice.cas_act.stubborn_01｜B声・去勢・処置］",
   "speaker": "animal"
  },
  "b.voice.cas_react.calm_01": {
   "text": "［b.voice.cas_react.calm_01｜B声・去勢・反応］",
   "speaker": "animal"
  },
  "b.voice.cas_react.sweet_01": {
   "text": "［b.voice.cas_react.sweet_01｜B声・去勢・反応］",
   "speaker": "animal"
  },
  "b.voice.cas_react.lively_01": {
   "text": "［b.voice.cas_react.lively_01｜B声・去勢・反応］",
   "speaker": "animal"
  },
  "b.voice.cas_react.curious_01": {
   "text": "［b.voice.cas_react.curious_01｜B声・去勢・反応］",
   "speaker": "animal"
  },
  "b.voice.cas_react.easy_01": {
   "text": "［b.voice.cas_react.easy_01｜B声・去勢・反応］",
   "speaker": "animal"
  },
  "b.voice.cas_react.stubborn_01": {
   "text": "［b.voice.cas_react.stubborn_01｜B声・去勢・反応］",
   "speaker": "animal"
  },
  "b.voice.cas_after.calm_01": {
   "text": "［b.voice.cas_after.calm_01｜B声・去勢・直後］",
   "speaker": "animal"
  },
  "b.voice.cas_after.sweet_01": {
   "text": "［b.voice.cas_after.sweet_01｜B声・去勢・直後］",
   "speaker": "animal"
  },
  "b.voice.cas_after.lively_01": {
   "text": "［b.voice.cas_after.lively_01｜B声・去勢・直後］",
   "speaker": "animal"
  },
  "b.voice.cas_after.curious_01": {
   "text": "［b.voice.cas_after.curious_01｜B声・去勢・直後］",
   "speaker": "animal"
  },
  "b.voice.cas_after.easy_01": {
   "text": "［b.voice.cas_after.easy_01｜B声・去勢・直後］",
   "speaker": "animal"
  },
  "b.voice.cas_after.stubborn_01": {
   "text": "［b.voice.cas_after.stubborn_01｜B声・去勢・直後］",
   "speaker": "animal"
  },
  "b.voice.cas_course.calm_01": {
   "text": "［b.voice.cas_course.calm_01｜B声・去勢・経過日誌］",
   "speaker": "animal"
  },
  "b.voice.cas_course.sweet_01": {
   "text": "［b.voice.cas_course.sweet_01｜B声・去勢・経過日誌］",
   "speaker": "animal"
  },
  "b.voice.cas_course.lively_01": {
   "text": "［b.voice.cas_course.lively_01｜B声・去勢・経過日誌］",
   "speaker": "animal"
  },
  "b.voice.cas_course.curious_01": {
   "text": "［b.voice.cas_course.curious_01｜B声・去勢・経過日誌］",
   "speaker": "animal"
  },
  "b.voice.cas_course.easy_01": {
   "text": "［b.voice.cas_course.easy_01｜B声・去勢・経過日誌］",
   "speaker": "animal"
  },
  "b.voice.cas_course.stubborn_01": {
   "text": "［b.voice.cas_course.stubborn_01｜B声・去勢・経過日誌］",
   "speaker": "animal"
  },
  "b.voice.breed_pre.calm_01": {
   "text": "［b.voice.breed_pre.calm_01｜B声・交配前］",
   "speaker": "animal"
  },
  "b.voice.breed_pre.sweet_01": {
   "text": "［b.voice.breed_pre.sweet_01｜B声・交配前］",
   "speaker": "animal"
  },
  "b.voice.breed_pre.lively_01": {
   "text": "［b.voice.breed_pre.lively_01｜B声・交配前］",
   "speaker": "animal"
  },
  "b.voice.breed_pre.curious_01": {
   "text": "［b.voice.breed_pre.curious_01｜B声・交配前］",
   "speaker": "animal"
  },
  "b.voice.breed_pre.easy_01": {
   "text": "［b.voice.breed_pre.easy_01｜B声・交配前］",
   "speaker": "animal"
  },
  "b.voice.breed_pre.stubborn_01": {
   "text": "［b.voice.breed_pre.stubborn_01｜B声・交配前］",
   "speaker": "animal"
  },
  "b.voice.breed_act.calm_01": {
   "text": "［b.voice.breed_act.calm_01｜B声・交配］",
   "speaker": "animal"
  },
  "b.voice.breed_act.sweet_01": {
   "text": "［b.voice.breed_act.sweet_01｜B声・交配］",
   "speaker": "animal"
  },
  "b.voice.breed_act.lively_01": {
   "text": "［b.voice.breed_act.lively_01｜B声・交配］",
   "speaker": "animal"
  },
  "b.voice.breed_act.curious_01": {
   "text": "［b.voice.breed_act.curious_01｜B声・交配］",
   "speaker": "animal"
  },
  "b.voice.breed_act.easy_01": {
   "text": "［b.voice.breed_act.easy_01｜B声・交配］",
   "speaker": "animal"
  },
  "b.voice.breed_act.stubborn_01": {
   "text": "［b.voice.breed_act.stubborn_01｜B声・交配］",
   "speaker": "animal"
  },
  "b.voice.breed_after.calm_01": {
   "text": "［b.voice.breed_after.calm_01｜B声・交配後］",
   "speaker": "animal"
  },
  "b.voice.breed_after.sweet_01": {
   "text": "［b.voice.breed_after.sweet_01｜B声・交配後］",
   "speaker": "animal"
  },
  "b.voice.breed_after.lively_01": {
   "text": "［b.voice.breed_after.lively_01｜B声・交配後］",
   "speaker": "animal"
  },
  "b.voice.breed_after.curious_01": {
   "text": "［b.voice.breed_after.curious_01｜B声・交配後］",
   "speaker": "animal"
  },
  "b.voice.breed_after.easy_01": {
   "text": "［b.voice.breed_after.easy_01｜B声・交配後］",
   "speaker": "animal"
  },
  "b.voice.breed_after.stubborn_01": {
   "text": "［b.voice.breed_after.stubborn_01｜B声・交配後］",
   "speaker": "animal"
  },
  "b.voice.ship_farewell.calm_01": {
   "text": "［b.voice.ship_farewell.calm_01｜B声・出荷］",
   "speaker": "animal"
  },
  "b.voice.ship_farewell.sweet_01": {
   "text": "［b.voice.ship_farewell.sweet_01｜B声・出荷］",
   "speaker": "animal"
  },
  "b.voice.ship_farewell.lively_01": {
   "text": "［b.voice.ship_farewell.lively_01｜B声・出荷］",
   "speaker": "animal"
  },
  "b.voice.ship_farewell.curious_01": {
   "text": "［b.voice.ship_farewell.curious_01｜B声・出荷］",
   "speaker": "animal"
  },
  "b.voice.ship_farewell.easy_01": {
   "text": "［b.voice.ship_farewell.easy_01｜B声・出荷］",
   "speaker": "animal"
  },
  "b.voice.ship_farewell.stubborn_01": {
   "text": "［b.voice.ship_farewell.stubborn_01｜B声・出荷］",
   "speaker": "animal"
  },
  "b.voice.daily.calm_01": {
   "text": "［b.voice.daily.calm_01｜B声・日常］",
   "speaker": "animal"
  },
  "b.voice.daily.sweet_01": {
   "text": "［b.voice.daily.sweet_01｜B声・日常］",
   "speaker": "animal"
  },
  "b.voice.daily.lively_01": {
   "text": "［b.voice.daily.lively_01｜B声・日常］",
   "speaker": "animal"
  },
  "b.voice.daily.curious_01": {
   "text": "［b.voice.daily.curious_01｜B声・日常］",
   "speaker": "animal"
  },
  "b.voice.daily.easy_01": {
   "text": "［b.voice.daily.easy_01｜B声・日常］",
   "speaker": "animal"
  },
  "b.voice.daily.stubborn_01": {
   "text": "［b.voice.daily.stubborn_01｜B声・日常］",
   "speaker": "animal"
  },
  "b.reply.cas_staff.calm_01": {
   "text": "［b.reply.cas_staff.calm_01｜B返事・去勢・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.cas_staff.sweet_01": {
   "text": "［b.reply.cas_staff.sweet_01｜B返事・去勢・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.cas_staff.lively_01": {
   "text": "［b.reply.cas_staff.lively_01｜B返事・去勢・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.cas_staff.curious_01": {
   "text": "［b.reply.cas_staff.curious_01｜B返事・去勢・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.cas_staff.easy_01": {
   "text": "［b.reply.cas_staff.easy_01｜B返事・去勢・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.cas_staff.stubborn_01": {
   "text": "［b.reply.cas_staff.stubborn_01｜B返事・去勢・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.breed_staff.calm_01": {
   "text": "［b.reply.breed_staff.calm_01｜B返事・人工授精・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.breed_staff.sweet_01": {
   "text": "［b.reply.breed_staff.sweet_01｜B返事・人工授精・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.breed_staff.lively_01": {
   "text": "［b.reply.breed_staff.lively_01｜B返事・人工授精・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.breed_staff.curious_01": {
   "text": "［b.reply.breed_staff.curious_01｜B返事・人工授精・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.breed_staff.easy_01": {
   "text": "［b.reply.breed_staff.easy_01｜B返事・人工授精・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.breed_staff.stubborn_01": {
   "text": "［b.reply.breed_staff.stubborn_01｜B返事・人工授精・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.match.calm_01": {
   "text": "［b.reply.match.calm_01｜B返事・日常・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.match.sweet_01": {
   "text": "［b.reply.match.sweet_01｜B返事・日常・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.match.lively_01": {
   "text": "［b.reply.match.lively_01｜B返事・日常・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.match.curious_01": {
   "text": "［b.reply.match.curious_01｜B返事・日常・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.match.easy_01": {
   "text": "［b.reply.match.easy_01｜B返事・日常・厩務員への返事］",
   "speaker": "animal"
  },
  "b.reply.match.stubborn_01": {
   "text": "［b.reply.match.stubborn_01｜B返事・日常・厩務員への返事］",
   "speaker": "animal"
  },
  "b.behavior.flower_crown_01": {
   "text": "［b.behavior.flower_crown_01｜B行動・花冠を作る］",
   "speaker": "narration"
  },
  "b.behavior.flower_crown_02": {
   "text": "［b.behavior.flower_crown_02｜B行動・花冠を作る］",
   "speaker": "narration"
  },
  "b.behavior.flower_give_01": {
   "text": "［b.behavior.flower_give_01｜B行動・花を摘んで好きな相手に渡す］",
   "speaker": "narration"
  },
  "b.behavior.flower_give_02": {
   "text": "［b.behavior.flower_give_02｜B行動・花を摘んで好きな相手に渡す］",
   "speaker": "narration"
  },
  "b.behavior.flower_carry_01": {
   "text": "［b.behavior.flower_carry_01｜B行動・花をくわえて好きな相手のところへ持ってくる］",
   "speaker": "narration"
  },
  "b.behavior.flower_carry_02": {
   "text": "［b.behavior.flower_carry_02｜B行動・花をくわえて好きな相手のところへ持ってくる］",
   "speaker": "narration"
  },
  "b.behavior.sing_01": {
   "text": "［b.behavior.sing_01｜B行動・歌う］",
   "speaker": "narration"
  },
  "b.behavior.sing_02": {
   "text": "［b.behavior.sing_02｜B行動・歌う］",
   "speaker": "narration"
  },
  "b.behavior.nestle_01": {
   "text": "［b.behavior.nestle_01｜B行動・好きな相手のそばに寄り添う］",
   "speaker": "narration"
  },
  "b.behavior.nestle_02": {
   "text": "［b.behavior.nestle_02｜B行動・好きな相手のそばに寄り添う］",
   "speaker": "narration"
  },
  "b.behavior.greet_staff_01": {
   "text": "［b.behavior.greet_staff_01｜B行動・厩務員に挨拶する］",
   "speaker": "narration"
  },
  "b.behavior.greet_staff_02": {
   "text": "［b.behavior.greet_staff_02｜B行動・厩務員に挨拶する］",
   "speaker": "narration"
  },
  "b.npc_on_behavior.staff_girl_01": {
   "text": "［b.npc_on_behavior.staff_girl_01｜B行動への反応・厩務員ガール］",
   "speaker": "staff_girl"
  },
  "b.npc_on_behavior.staff_girl_02": {
   "text": "［b.npc_on_behavior.staff_girl_02｜B行動への反応・厩務員ガール］",
   "speaker": "staff_girl"
  },
  "b.npc_on_behavior.staff_boy_01": {
   "text": "［b.npc_on_behavior.staff_boy_01｜B行動への反応・厩務員ボーイ］",
   "speaker": "staff_boy"
  },
  "b.npc_on_behavior.staff_boy_02": {
   "text": "［b.npc_on_behavior.staff_boy_02｜B行動への反応・厩務員ボーイ］",
   "speaker": "staff_boy"
  }
 },
 "economy.json": {
  "ship.farewell_01": {
   "text": "［ship.farewell_01｜見送りの一言］",
   "speaker": "staff_girl"
  },
  "ship.farewell_02": {
   "text": "［ship.farewell_02｜トラックが出ていく］",
   "speaker": "narration"
  },
  "ship.buyer_marbling_01": {
   "text": "［ship.buyer_marbling_01｜バイヤーの評価］",
   "speaker": "narration",
   "cond": {
    "meat_grade_min": 4
   }
  },
  "vet.advice.early": {
   "text": "［vet.advice.early｜時期ごとのアドバイス］",
   "speaker": "narration"
  },
  "vet.advice.standard": {
   "text": "［vet.advice.standard｜時期ごとのアドバイス］",
   "speaker": "narration"
  },
  "vet.advice.late": {
   "text": "［vet.advice.late｜時期ごとのアドバイス］",
   "speaker": "narration"
  },
  "vet.advice.mature": {
   "text": "［vet.advice.mature｜時期ごとのアドバイス］",
   "speaker": "narration"
  },
  "vet.advice.ring": {
   "text": "［vet.advice.ring｜術式ごとのアドバイス］",
   "speaker": "narration"
  },
  "vet.advice.burdizzo": {
   "text": "［vet.advice.burdizzo｜術式ごとのアドバイス］",
   "speaker": "narration"
  },
  "vet.advice.surgical": {
   "text": "［vet.advice.surgical｜術式ごとのアドバイス］",
   "speaker": "narration"
  },
  "vet.advice.traditional": {
   "text": "［vet.advice.traditional｜アドバイス］",
   "speaker": "narration"
  },
  "vet.advice.horse": {
   "text": "［vet.advice.horse｜アドバイス］",
   "speaker": "narration"
  },
  "memo.nameplate_01": {
   "text": "［memo.nameplate_01｜ネームプレートを残す］",
   "speaker": "narration"
  },
  "memo.horseshoe_01": {
   "text": "［memo.horseshoe_01｜蹄鉄を残す］",
   "speaker": "narration",
   "cond": {
    "species": "horse"
   }
  },
  "ship.voice.farewell.calm_01": {
   "text": "［ship.voice.farewell.calm_01｜声・出荷］",
   "speaker": "animal"
  },
  "ship.voice.farewell.sweet_01": {
   "text": "［ship.voice.farewell.sweet_01｜声・出荷］",
   "speaker": "animal"
  },
  "ship.voice.farewell.lively_01": {
   "text": "［ship.voice.farewell.lively_01｜声・出荷］",
   "speaker": "animal"
  },
  "ship.voice.farewell.curious_01": {
   "text": "［ship.voice.farewell.curious_01｜声・出荷］",
   "speaker": "animal"
  },
  "ship.voice.farewell.easy_01": {
   "text": "［ship.voice.farewell.easy_01｜声・出荷］",
   "speaker": "animal"
  },
  "ship.voice.farewell.stubborn_01": {
   "text": "［ship.voice.farewell.stubborn_01｜声・出荷］",
   "speaker": "animal"
  },
  "npc.normal.senior_01": {
   "text": "［npc.normal.senior_01｜先輩牧場主・普通の評価］",
   "speaker": "senior"
  },
  "npc.normal.senior_02": {
   "text": "［npc.normal.senior_02｜先輩牧場主・普通の評価］",
   "speaker": "senior"
  },
  "npc.normal.vet_01": {
   "text": "［npc.normal.vet_01｜獣医・普通の評価］",
   "speaker": "vet"
  },
  "npc.normal.vet_02": {
   "text": "［npc.normal.vet_02｜獣医・普通の評価］",
   "speaker": "vet"
  },
  "npc.normal.dealer_01": {
   "text": "［npc.normal.dealer_01｜家畜商・普通の評価］",
   "speaker": "dealer"
  },
  "npc.normal.dealer_02": {
   "text": "［npc.normal.dealer_02｜家畜商・普通の評価］",
   "speaker": "dealer"
  },
  "npc.normal.buyer_01": {
   "text": "［npc.normal.buyer_01｜バイヤー・普通の評価］",
   "speaker": "buyer"
  },
  "npc.normal.buyer_02": {
   "text": "［npc.normal.buyer_02｜バイヤー・普通の評価］",
   "speaker": "buyer"
  },
  "npc.normal.staff_girl_01": {
   "text": "［npc.normal.staff_girl_01｜厩務員ガール・普通の評価］",
   "speaker": "staff_girl"
  },
  "npc.normal.staff_girl_02": {
   "text": "［npc.normal.staff_girl_02｜厩務員ガール・普通の評価］",
   "speaker": "staff_girl"
  },
  "npc.normal.staff_boy_01": {
   "text": "［npc.normal.staff_boy_01｜厩務員ボーイ・普通の評価］",
   "speaker": "staff_boy"
  },
  "npc.normal.staff_boy_02": {
   "text": "［npc.normal.staff_boy_02｜厩務員ボーイ・普通の評価］",
   "speaker": "staff_boy"
  },
  "npc.telepathy.senior_01": {
   "text": "［npc.telepathy.senior_01｜先輩牧場主・テレパシー種の評価］",
   "speaker": "senior"
  },
  "npc.telepathy.senior_02": {
   "text": "［npc.telepathy.senior_02｜先輩牧場主・テレパシー種の評価］",
   "speaker": "senior"
  },
  "npc.telepathy.vet_01": {
   "text": "［npc.telepathy.vet_01｜獣医・テレパシー種の評価］",
   "speaker": "vet"
  },
  "npc.telepathy.vet_02": {
   "text": "［npc.telepathy.vet_02｜獣医・テレパシー種の評価］",
   "speaker": "vet"
  },
  "npc.telepathy.dealer_01": {
   "text": "［npc.telepathy.dealer_01｜家畜商・テレパシー種の評価］",
   "speaker": "dealer"
  },
  "npc.telepathy.dealer_02": {
   "text": "［npc.telepathy.dealer_02｜家畜商・テレパシー種の評価］",
   "speaker": "dealer"
  },
  "npc.telepathy.buyer_01": {
   "text": "［npc.telepathy.buyer_01｜バイヤー・テレパシー種の評価］",
   "speaker": "buyer"
  },
  "npc.telepathy.buyer_02": {
   "text": "［npc.telepathy.buyer_02｜バイヤー・テレパシー種の評価］",
   "speaker": "buyer"
  },
  "npc.telepathy.staff_girl_01": {
   "text": "［npc.telepathy.staff_girl_01｜厩務員ガール・テレパシー種の評価］",
   "speaker": "staff_girl"
  },
  "npc.telepathy.staff_girl_02": {
   "text": "［npc.telepathy.staff_girl_02｜厩務員ガール・テレパシー種の評価］",
   "speaker": "staff_girl"
  },
  "npc.telepathy.staff_boy_01": {
   "text": "［npc.telepathy.staff_boy_01｜厩務員ボーイ・テレパシー種の評価］",
   "speaker": "staff_boy"
  },
  "npc.telepathy.staff_boy_02": {
   "text": "［npc.telepathy.staff_boy_02｜厩務員ボーイ・テレパシー種の評価］",
   "speaker": "staff_boy"
  },
  "npc.taur.senior_01": {
   "text": "［npc.taur.senior_01｜先輩牧場主・タウル種の評価］",
   "speaker": "senior"
  },
  "npc.taur.senior_02": {
   "text": "［npc.taur.senior_02｜先輩牧場主・タウル種の評価］",
   "speaker": "senior"
  },
  "npc.taur.vet_01": {
   "text": "［npc.taur.vet_01｜獣医・タウル種の評価］",
   "speaker": "vet"
  },
  "npc.taur.vet_02": {
   "text": "［npc.taur.vet_02｜獣医・タウル種の評価］",
   "speaker": "vet"
  },
  "npc.taur.dealer_01": {
   "text": "［npc.taur.dealer_01｜家畜商・タウル種の評価］",
   "speaker": "dealer"
  },
  "npc.taur.dealer_02": {
   "text": "［npc.taur.dealer_02｜家畜商・タウル種の評価］",
   "speaker": "dealer"
  },
  "npc.taur.buyer_01": {
   "text": "［npc.taur.buyer_01｜バイヤー・タウル種の評価］",
   "speaker": "buyer"
  },
  "npc.taur.buyer_02": {
   "text": "［npc.taur.buyer_02｜バイヤー・タウル種の評価］",
   "speaker": "buyer"
  },
  "npc.taur.staff_girl_01": {
   "text": "［npc.taur.staff_girl_01｜厩務員ガール・タウル種の評価］",
   "speaker": "staff_girl"
  },
  "npc.taur.staff_girl_02": {
   "text": "［npc.taur.staff_girl_02｜厩務員ガール・タウル種の評価］",
   "speaker": "staff_girl"
  },
  "npc.taur.staff_boy_01": {
   "text": "［npc.taur.staff_boy_01｜厩務員ボーイ・タウル種の評価］",
   "speaker": "staff_boy"
  },
  "npc.taur.staff_boy_02": {
   "text": "［npc.taur.staff_boy_02｜厩務員ボーイ・タウル種の評価］",
   "speaker": "staff_boy"
  },
  "npc.halfbeast.senior_01": {
   "text": "［npc.halfbeast.senior_01｜先輩牧場主・半獣人種の評価］",
   "speaker": "senior"
  },
  "npc.halfbeast.senior_02": {
   "text": "［npc.halfbeast.senior_02｜先輩牧場主・半獣人種の評価］",
   "speaker": "senior"
  },
  "npc.halfbeast.vet_01": {
   "text": "［npc.halfbeast.vet_01｜獣医・半獣人種の評価］",
   "speaker": "vet"
  },
  "npc.halfbeast.vet_02": {
   "text": "［npc.halfbeast.vet_02｜獣医・半獣人種の評価］",
   "speaker": "vet"
  },
  "npc.halfbeast.dealer_01": {
   "text": "［npc.halfbeast.dealer_01｜家畜商・半獣人種の評価］",
   "speaker": "dealer"
  },
  "npc.halfbeast.dealer_02": {
   "text": "［npc.halfbeast.dealer_02｜家畜商・半獣人種の評価］",
   "speaker": "dealer"
  },
  "npc.halfbeast.buyer_01": {
   "text": "［npc.halfbeast.buyer_01｜バイヤー・半獣人種の評価］",
   "speaker": "buyer"
  },
  "npc.halfbeast.buyer_02": {
   "text": "［npc.halfbeast.buyer_02｜バイヤー・半獣人種の評価］",
   "speaker": "buyer"
  },
  "npc.halfbeast.staff_girl_01": {
   "text": "［npc.halfbeast.staff_girl_01｜厩務員ガール・半獣人種の評価］",
   "speaker": "staff_girl"
  },
  "npc.halfbeast.staff_girl_02": {
   "text": "［npc.halfbeast.staff_girl_02｜厩務員ガール・半獣人種の評価］",
   "speaker": "staff_girl"
  },
  "npc.halfbeast.staff_boy_01": {
   "text": "［npc.halfbeast.staff_boy_01｜厩務員ボーイ・半獣人種の評価］",
   "speaker": "staff_boy"
  },
  "npc.halfbeast.staff_boy_02": {
   "text": "［npc.halfbeast.staff_boy_02｜厩務員ボーイ・半獣人種の評価］",
   "speaker": "staff_boy"
  },
  "npc.kemomimi.senior_01": {
   "text": "［npc.kemomimi.senior_01｜先輩牧場主・ケモミミ種の評価］",
   "speaker": "senior"
  },
  "npc.kemomimi.senior_02": {
   "text": "［npc.kemomimi.senior_02｜先輩牧場主・ケモミミ種の評価］",
   "speaker": "senior"
  },
  "npc.kemomimi.vet_01": {
   "text": "［npc.kemomimi.vet_01｜獣医・ケモミミ種の評価］",
   "speaker": "vet"
  },
  "npc.kemomimi.vet_02": {
   "text": "［npc.kemomimi.vet_02｜獣医・ケモミミ種の評価］",
   "speaker": "vet"
  },
  "npc.kemomimi.dealer_01": {
   "text": "［npc.kemomimi.dealer_01｜家畜商・ケモミミ種の評価］",
   "speaker": "dealer"
  },
  "npc.kemomimi.dealer_02": {
   "text": "［npc.kemomimi.dealer_02｜家畜商・ケモミミ種の評価］",
   "speaker": "dealer"
  },
  "npc.kemomimi.staff_girl_01": {
   "text": "［npc.kemomimi.staff_girl_01｜厩務員ガール・ケモミミ種の評価］",
   "speaker": "staff_girl"
  },
  "npc.kemomimi.staff_girl_02": {
   "text": "［npc.kemomimi.staff_girl_02｜厩務員ガール・ケモミミ種の評価］",
   "speaker": "staff_girl"
  },
  "npc.kemomimi.staff_boy_01": {
   "text": "［npc.kemomimi.staff_boy_01｜厩務員ボーイ・ケモミミ種の評価］",
   "speaker": "staff_boy"
  },
  "npc.kemomimi.staff_boy_02": {
   "text": "［npc.kemomimi.staff_boy_02｜厩務員ボーイ・ケモミミ種の評価］",
   "speaker": "staff_boy"
  },
  "ship.buyer_young_meat_01": {
   "text": "［ship.buyer_young_meat_01｜バイヤー・年齢のわりに肉が若い］",
   "speaker": "buyer",
   "cond": {
    "young_meat": true
   }
  }
 }
};
