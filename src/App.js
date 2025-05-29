import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    front: "",
    mid1: "",
    mid2: "",
    rear: "",
  });

  const influences = {
    front: 0.6,
    mid1: 0.8,
    mid2: 0.5,
    rear: 0.2,
  };

  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedLoad =
    parsedWeights.front * influences.front +
    parsedWeights.mid1 * influences.mid1 +
    parsedWeights.mid2 * influences.mid2 +
    parsedWeights.rear * influences.rear;

  const usedTotal =
    parsedWeights.front +
    parsedWeights.mid1 +
    parsedWeights.mid2 +
    parsedWeights.rear;

  const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedLoad);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);

  const areas = ["mid1", "mid2", "rear"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainingAxle > 0 && remainingTotal > 0) {
    const sumInverseSquare = emptyAreas.reduce(
      (acc, area) => acc + 1 / Math.pow(influences[area], 2),
      0
    );

    // スケール前：19700に対する等比割り
    let rawRecommended = {};
    emptyAreas.forEach((area) => {
      const ratio = 1 / Math.pow(influences[area], 2) / sumInverseSquare;
      rawRecommended[area] = MAX_TOTAL_LOAD * ratio;
    });

    // スケール比を計算（残りの第2軸枠に合わせて調整）
    const rawAxle = Object.entries(rawRecommended).reduce(
      (acc, [key, val]) => acc + val * influences[key],
      parsedWeights.front * influences.front
    );
    const scale =
      (MAX_AXLE_LOAD - parsedWeights.front * influences.front) /
      (rawAxle - parsedWeights.front * influences.front);

    // 最終反映
    emptyAreas.forEach((area) => {
      recommended[area] = Math.round(rawRecommended[area] * scale);
    });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール</h2>
      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key.toUpperCase()}（kg）：
            <input
              type="number"
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              style={{ marginLeft: "0.5rem" }}
            />
            <button
              onClick={() => setWeights({ ...weights, [key]: "" })}
              style={{ marginLeft: "0.5rem" }}
            >
              ✖
            </button>
          </label>
        </div>
      ))}
      <div>
        <strong>現在の第2軸荷重：</strong>
        {Math.round(usedLoad).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.round(remainingAxle).toLocaleString()}kg
      </div>
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyAreas.map((e) => e.toUpperCase()).join(", ")}</strong> が未入力です
        </div>
      )}
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>各エリア別 積載目安（第2軸10t & 合計19700kg範囲）</strong>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key.toUpperCase()}：{val.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
