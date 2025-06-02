import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間①: "",
    中間②: "",
    後部: "",
  });

  // 修正済み比率（19.7t換算）
  const correctRatios = {
    ひな壇: 0.1995,
    中間①: 0.2584,
    中間②: 0.2572,
    後部: 0.2849,
  };

  // 各エリアの第2軸への影響係数
  const influences = {
    ひな壇: 0.4,
    中間①: 0.6,
    中間②: 0.5,
    後部: 0.2,
  };

  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedLoad =
    parsedWeights.ひな壇 * influences.ひな壇 +
    parsedWeights.中間① * influences.中間① +
    parsedWeights.中間② * influences.中間② +
    parsedWeights.後部 * influences.後部;

  const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedLoad);
  const usedTotal =
    parsedWeights.ひな壇 +
    parsedWeights.中間① +
    parsedWeights.中間② +
    parsedWeights.後部;
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);

  const areas = ["ひな壇", "中間①", "中間②", "後部"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainingTotal > 0) {
    const ratioSum = emptyAreas.reduce((acc, key) => acc + correctRatios[key], 0);

    emptyAreas.forEach((key) => {
      recommended[key] = Math.round(
        remainingTotal * (correctRatios[key] / ratioSum)
      );
    });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
      {areas.map((key, index) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key}（kg）：
            <input
              type="number"
              value={weights[key]}
              onChange={(e) => setWeights({ ...weights, [key]: e.target.value })}
              style={{ marginLeft: "0.5rem" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const next = areas[index + 1];
                  if (next) document.getElementById(next)?.focus();
                }
              }}
              id={key}
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
          👉 <strong>{emptyAreas.join(", ")}</strong> が未入力です
        </div>
      )}
      {emptyAreas.length > 0 && (
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
