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
    中間1: 0.8,
    中間2: 0.5,
    後部: 0.2,
  };

  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedLoad =
    parsedWeights.ひな壇 * influences.ひな壇 +
    parsedWeights.中間1 * influences.中間1 +
    parsedWeights.中間2 * influences.中間2 +
    parsedWeights.後部 * influences.後部;

  const usedTotal =
    parsedWeights.ひな壇 +
    parsedWeights.中間1 +
    parsedWeights.中間2 +
    parsedWeights.後部;

  const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedLoad);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);

  const areas = ["ひな壇", "中間1", "中間2", "後部"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainingAxle > 0 && remainingTotal > 0) {
    const ratios = {
      中間1: 0.211,
      中間2: 0.323,
      後部: 0.279,
    };

    const ratioSum = emptyAreas.reduce((acc, key) => acc + (ratios[key] || 0), 0);

    const rawRecommended = {};
    emptyAreas.forEach((key) => {
      rawRecommended[key] = remainingTotal * ((ratios[key] || 0) / ratioSum);
    });

    const frontAxle = parsedWeights.ひな壇 * influences.ひな壇;
    const rawAxle = Object.entries(rawRecommended).reduce(
      (acc, [key, val]) => acc + val * influences[key],
      frontAxle
    );

    const scale =
      rawAxle > MAX_AXLE_LOAD
        ? (MAX_AXLE_LOAD - frontAxle) / (rawAxle - frontAxle)
        : 1;

    emptyAreas.forEach((key) => {
      recommended[key] = Math.round(rawRecommended[key] * scale);
    });
  }

  const handleKeyDown = (e, key) => {
    if (e.key === "Enter") {
      const index = areas.indexOf(key);
      if (index >= 0 && index < areas.length - 1) {
        const nextKey = areas[index + 1];
        const nextInput = document.getElementById(nextKey);
        if (nextInput) nextInput.focus();
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール</h2>
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
        {Math.round(usedLoad).toLocaleString()}kg
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
          <strong>各エリア別 積載目安（第2軸10t & 合計19700kg範囲）</strong>
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
