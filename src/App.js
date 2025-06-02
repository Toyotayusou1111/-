import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間1: "",
    中間2: "",
    後部: "",
  });

  const influences = {
    ひな壇: 0.6,
    中間1: 0.7,
    中間2: 0.3,
    後部: 0.2,
  };

  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedAxleLoad = Object.entries(parsedWeights).reduce(
    (sum, [key, val]) => sum + val * influences[key],
    0
  );

  const usedTotal = Object.values(parsedWeights).reduce((a, b) => a + b, 0);

  const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedAxleLoad);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);

  const areas = ["ひな壇", "中間1", "中間2", "後部"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainingTotal > 0) {
    const baseRatios = {
      ひな壇: 0.212,
      中間1: 0.228,
      中間2: 0.319,
      後部: 0.241,
    };

    const fixedTotal = Object.entries(parsedWeights).reduce(
      (acc, [key, val]) => acc + val,
      0
    );
    const fixedAxle = Object.entries(parsedWeights).reduce(
      (acc, [key, val]) => acc + val * influences[key],
      0
    );

    const ratioSum = emptyAreas.reduce((acc, key) => acc + baseRatios[key], 0);

    // 仮の配分（比率で割り当て）
    const rawRecommended = {};
    emptyAreas.forEach((key) => {
      rawRecommended[key] = baseRatios[key];
    });

    // スケーリング調整
    const totalScale = (MAX_TOTAL_LOAD - fixedTotal) / emptyAreas.reduce((sum, key) => sum + rawRecommended[key], 0);
    emptyAreas.forEach((key) => {
      rawRecommended[key] = rawRecommended[key] * totalScale;
    });

    // 2軸荷重を最大10tに近づけるよう再スケール（2軸超過しない範囲で最大限）
    const axleRaw = Object.entries(rawRecommended).reduce(
      (acc, [key, val]) => acc + val * influences[key],
      fixedAxle
    );
    const axleScale = Math.min(1, MAX_AXLE_LOAD / axleRaw);

    emptyAreas.forEach((key) => {
      recommended[key] = Math.floor(rawRecommended[key] * axleScale);
    });
  }

  const handleKeyDown = (e, key) => {
    if (e.key === "Enter") {
      const index = areas.indexOf(key);
      if (index >= 0 && index < areas.length - 1) {
        document.getElementById(areas[index + 1]).focus();
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
      {areas.map((key) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key}（kg）：
            <input
              id={key}
              type="number"
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              onKeyDown={(e) => handleKeyDown(e, key)}
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
        {Math.round(usedAxleLoad).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の総積載量：</strong>
        {Math.round(usedTotal).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.round(remainingAxle).toLocaleString()}kg（第2軸）
      </div>
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyAreas.join("、")}</strong>が未入力です
        </div>
      )}
      {Object.keys(recommended).length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>目安積載量（全体19700kg配分）：</strong>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key}：{val.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
