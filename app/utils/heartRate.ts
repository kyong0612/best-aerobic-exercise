/**
 * 最大心拍数を計算する
 * デフォルトの式: 211 - 0.64 × 年齢
 * 
 * @param age 年齢
 * @returns 最大心拍数
 */
export const calculateMaxHeartRate = (age: number): number => {
  return Math.round(211 - 0.64 * age);
};

/**
 * 特定の心拍ゾーンの範囲を計算する
 * 
 * @param maxHeartRate 最大心拍数
 * @param zoneNumber ゾーン番号（1-5）
 * @returns [最小心拍数, 最大心拍数] の配列
 */
export const calculateHeartRateZone = (maxHeartRate: number, zoneNumber: 1 | 2 | 3 | 4 | 5): [number, number] => {
  const zones = {
    1: [0.5, 0.6],
    2: [0.6, 0.7],
    3: [0.7, 0.8],
    4: [0.8, 0.9],
    5: [0.9, 1.0],
  };
  
  const [minPercent, maxPercent] = zones[zoneNumber];
  const min = Math.round(maxHeartRate * minPercent);
  const max = Math.round(maxHeartRate * maxPercent);
  
  return [min, max];
};

/**
 * 全ての心拍ゾーンを計算する
 * 
 * @param maxHeartRate 最大心拍数
 * @returns すべてのゾーンの心拍数範囲を含むオブジェクト
 */
export const calculateAllHeartRateZones = (maxHeartRate: number) => {
  return {
    zone1: calculateHeartRateZone(maxHeartRate, 1),
    zone2: calculateHeartRateZone(maxHeartRate, 2),
    zone3: calculateHeartRateZone(maxHeartRate, 3),
    zone4: calculateHeartRateZone(maxHeartRate, 4),
    zone5: calculateHeartRateZone(maxHeartRate, 5),
  };
};

/**
 * 心拍数からゾーンを判定する
 * 
 * @param heartRate 現在の心拍数
 * @param maxHeartRate 最大心拍数
 * @returns ゾーン番号（1-5）、範囲外の場合は0
 */
export const determineHeartRateZone = (heartRate: number, maxHeartRate: number): 0 | 1 | 2 | 3 | 4 | 5 => {
  const percent = heartRate / maxHeartRate;
  
  if (percent < 0.5) return 0;
  if (percent < 0.6) return 1;
  if (percent < 0.7) return 2;
  if (percent < 0.8) return 3;
  if (percent < 0.9) return 4;
  return 5;
};

/**
 * 各ゾーンの説明と効果
 */
export const zoneDescriptions = {
  0: {
    name: "リカバリー",
    description: "通常の安静時心拍数に近い状態。特別なトレーニング効果はありません。",
    benefits: ["身体の回復", "軽いクールダウン"],
    examples: ["通常の歩行", "軽いストレッチ"],
  },
  1: {
    name: "ウォームアップ",
    description: "非常に軽い強度で、長時間続けることができます。脂肪燃焼の効率が最も高い領域です。",
    benefits: ["脂肪燃焼の効率化", "心肺機能の基礎強化", "回復の促進"],
    examples: ["速歩き", "軽いジョギング", "軽いサイクリング"],
  },
  2: {
    name: "有酸素運動基礎",
    description: "軽い〜中程度の運動強度。長時間持続可能で、持久力向上に最適なゾーンです。",
    benefits: ["有酸素能力の向上", "脂肪燃焼", "エネルギー効率の改善"],
    examples: ["ジョギング", "サイクリング", "長距離スイミング"],
  },
  3: {
    name: "有酸素運動向上",
    description: "中程度〜高めの運動強度。持久力と有酸素能力を向上させる領域です。",
    benefits: ["心肺機能の向上", "乳酸閾値の向上", "速筋繊維の活性化"],
    examples: ["テンポランニング", "インターバルトレーニング"],
  },
  4: {
    name: "無酸素運動基礎",
    description: "高強度の運動で、長時間の継続は難しいゾーン。無酸素性能力を向上させます。",
    benefits: ["スピードの向上", "乳酸耐性の強化", "最大酸素摂取量の向上"],
    examples: ["インターバルトレーニング", "テンポランニング", "レースペース"],
  },
  5: {
    name: "最大限努力",
    description: "最大強度に近い状態で、短時間しか維持できないゾーン。爆発的なパワー向上に効果的です。",
    benefits: ["最大パワーの向上", "神経系の活性化", "スプリント能力の向上"],
    examples: ["短距離スプリント", "高強度インターバル", "ヒルスプリント"],
  },
};

/**
 * 各トレーニング目的に最適なゾーン組み合わせの推奨パターン
 * 値は各ゾーンの割合（合計で100になる）
 */
export const recommendedZoneDistribution = {
  weight_loss: {
    name: "ダイエット・脂肪燃焼",
    distribution: {
      zone1: 30,
      zone2: 50,
      zone3: 15,
      zone4: 5,
      zone5: 0,
    },
    description: "脂肪燃焼に最適なゾーン1-2を中心に、基礎代謝を上げるためのゾーン3も取り入れたバランス。",
  },
  cardio_health: {
    name: "心肺機能向上（健康・スタミナ）",
    distribution: {
      zone1: 20,
      zone2: 40,
      zone3: 30,
      zone4: 10,
      zone5: 0,
    },
    description: "基礎持久力を高めるゾーン2を中心にしながら、心肺機能を効果的に向上させるゾーン3も積極的に取り入れる。",
  },
  marathon: {
    name: "マラソン・長距離レース対策",
    distribution: {
      zone1: 25,
      zone2: 45,
      zone3: 20,
      zone4: 8,
      zone5: 2,
    },
    description: "長時間の持久力を高めるゾーン1-2を中心に、レースペースに近いゾーン3-4も取り入れたトレーニング。",
  },
  sprint: {
    name: "短距離・スプリント能力向上",
    distribution: {
      zone1: 20,
      zone2: 20,
      zone3: 25,
      zone4: 25,
      zone5: 10,
    },
    description: "高強度のゾーン4-5を多く取り入れながら、回復と持久力向上のためのゾーン1-2もバランスよく行う。",
  },
  custom: {
    name: "カスタム",
    distribution: {
      zone1: 20,
      zone2: 30,
      zone3: 30,
      zone4: 15,
      zone5: 5,
    },
    description: "バランスの取れた基本的な配分。目的に応じてカスタマイズできます。",
  },
};
