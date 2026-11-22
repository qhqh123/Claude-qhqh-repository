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
   "speaker": "narration"
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
   "speaker": "narration"
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
    "partner_liked": true
   }
  },
  "breed.natural.act_02": {
   "text": "［breed.natural.act_02｜自然交配（それ以外）］",
   "speaker": "narration",
   "cond": {
    "partner_liked": false
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
    "species": "horse"
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
    "species": "horse"
   }
  },
  "breed.stallion.after_01": {
   "text": "［breed.stallion.after_01｜直後］",
   "speaker": "narration",
   "cond": {
    "species": "horse"
   }
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
    "method": "ring"
   }
  },
  "cas.ring.act": {
   "text": "［cas.ring.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "ring"
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
    ]
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
    ]
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
    ]
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
    "method": "burdizzo"
   }
  },
  "cas.burdizzo.act": {
   "text": "［cas.burdizzo.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "burdizzo"
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
    ]
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
    ]
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
    ]
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
    "method": "surgical"
   }
  },
  "cas.surgical.act": {
   "text": "［cas.surgical.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "surgical"
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
    ]
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
    ]
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
    ]
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
    "method": "traditional"
   }
  },
  "cas.traditional.act": {
   "text": "［cas.traditional.act｜処置の実施］",
   "speaker": "narration",
   "cond": {
    "method": "traditional"
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
    ]
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
    ]
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
    ]
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
  }
 }
};
