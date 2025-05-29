const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedLoad);
const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);

// 空欄のエリアに配分する目安を計算（Excelと同様の2軸負荷の逆数2乗ロジック）
if (emptyAreas.length > 0 && remainingAxle > 0 && remainingTotal > 0) {
  // 重み（逆数2乗）
  const sumInverseSquare = emptyAreas.reduce(
    (acc, area) => acc + 1 / Math.pow(influences[area], 2),
    0
  );

  // まずは第2軸だけで配分計算
  let rawRecommended = {};
  emptyAreas.forEach((area) => {
    const ratio = 1 / Math.pow(influences[area], 2) / sumInverseSquare;
    rawRecommended[area] = (remainingAxle * ratio) / influences[area];
  });

  // その合計が残りの積載上限（19,700-FRONT）を超えないようにスケーリング
  const totalRaw = Object.values(rawRecommended).reduce((a, b) => a + b, 0);
  const scale = remainingTotal / totalRaw;

  emptyAreas.forEach((area) => {
    recommended[area] = Math.round(rawRecommended[area] * scale);
  });
}
