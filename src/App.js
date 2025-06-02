import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間①: "",
    中間②: "",
    後部: "",
  });

  const influences = {
    ひな壇: 0.1,
    中間①: 0.25,
    中間②: 0.45,
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

  const areas = ["中間①", "中間②", "後部"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainingAxle > 0 && remainingTotal > 0) {
    const ratios = {
      ひな壇: 0.178,
      中間①: 0.242,
      中間②: 0.334,
      後部: 0.246,
    };

    const filled = areas.filter((key) => weights[key]);
    let filledSum = filled.reduce((sum, key) => sum + ratios[key], 0);
    let remainingRatio = 1 - filledSum - (weights.ひな壇 ? ratios.ひな壇 : 0);
    let ratioSum = emptyAreas.reduce((sum, key) => sum + ratios[key], 0);

    const rawRecommended = {};
    emptyAreas.forEach((key) => {
      rawRecommended[key] = remainingTotal * (ratios[key] / ratioSum);
    });

    const fixedLoad =
      (weights.ひな壇 ? parsedWeights.ひな壇 * influences.ひな壇 : 0) +
      (weights.中間① ? parsedWeights.中間① * influences.中間① : 0);
    const rawAxle =
      Object.entries(rawRecommended).reduce(
        (acc, [key, val]) => acc + val * influences[key],
        fixedLoad
      );

    const scale = (MAX_AXLE_LOAD - fixedLoad) / (rawAxle - fixedLoad);
    emptyAreas.forEach((key) => {
      recommended[key] = Math.round(rawRecommended[key] * scale);
    });
  }

  const handleKeyDown = (e, key) => {
    if (e.key === "Enter") {
      const keys = Object.keys(weights);
      const currentIndex = keys.indexOf(key);
      const nextKey = keys[currentIndex + 1];
      if (nextKey) {
        const nextInput = document.getElementById(nextKey);
        if (nextInput) nextInput.focus();
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
      {Object.keys(weights).map((key) => (
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
