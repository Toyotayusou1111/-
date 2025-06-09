import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間1: "",
    中間2: "",
    後部: "",
  });

  const influences = {
    ひな壇: 0.6817,
    中間1: 0.607,
    中間2: 0.0975,
    後部: 0.0433,
  };

  const ratios = {
    中間1: 0.211,
    中間2: 0.323,
    後部: 0.279,
  };

  const INTERCEPT = 3317.33;
  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const parsed = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, parseFloat(v) || 0])
  );

  const empty = Object.entries(weights)
    .filter(([_, v]) => v === "")
    .map(([k]) => k);

  const usedTotal = Object.entries(parsed)
    .filter(([k]) => !empty.includes(k))
    .reduce((sum, [k, v]) => sum + v, 0);

  const usedAxle = Object.entries(parsed)
    .filter(([k]) => !empty.includes(k))
    .reduce((sum, [k, v]) => sum + v * influences[k], INTERCEPT);

  const remainingTotal = MAX_TOTAL_LOAD - usedTotal;

  const rawAlloc = {};
  const ratioSum = empty.reduce((sum, k) => sum + (ratios[k] || 0), 0);
  empty.forEach((k) => {
    rawAlloc[k] = remainingTotal * (ratios[k] || 0) / ratioSum;
  });

  const rawAxle = Object.entries(rawAlloc).reduce(
    (sum, [k, v]) => sum + v * influences[k],
    usedAxle
  );

  const scale = rawAxle > MAX_AXLE_LOAD ? (MAX_AXLE_LOAD - usedAxle) / (rawAxle - usedAxle) : 1;

  const recommended = {};
  empty.forEach((k) => {
    recommended[k] = Math.round(rawAlloc[k] * scale);
  });

  const finalTotal = usedTotal + Object.values(recommended).reduce((a, b) => a + b, 0);
  const finalAxle = Object.entries(parsed)
    .filter(([k]) => !empty.includes(k))
    .reduce((sum, [k, v]) => sum + v * influences[k], INTERCEPT)
    + Object.entries(recommended).reduce((sum, [k, v]) => sum + v * influences[k], 0);

  const diagnosis = finalAxle > MAX_AXLE_LOAD
    ? "⚠ 第2軸荷重が過積載です。荷重を調整してください。"
    : finalAxle >= 9500
    ? "◎ 第2軸荷重は適正範囲内です。"
    : "△ 第2軸荷重がやや不足しています。バランスに注意。";

  const areas = ["ひな壇", "中間1", "中間2", "後部"];

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
              onChange={(e) => setWeights({ ...weights, [key]: e.target.value })}
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
          {recommended[key] !== undefined && (
            <div style={{ marginTop: "0.25rem", color: "#666" }}>
              👉 <strong>{key}</strong> の積載目安：{recommended[key].toLocaleString()}kg
            </div>
          )}
        </div>
      ))}
      <div>
        <strong>現在の第2軸荷重：</strong>
        {Math.round(finalAxle).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の総積載量：</strong>
        {Math.round(finalTotal).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.max(0, MAX_AXLE_LOAD - finalAxle).toLocaleString()}kg（第2軸）
      </div>
      <div style={{ marginTop: "1rem" }}>
        <strong>診断コメント：</strong>
        <span
          style={{
            color:
              finalAxle > MAX_AXLE_LOAD
                ? "red"
                : finalAxle >= 9500
                ? "green"
                : "orange",
          }}
        >
          {diagnosis}
        </span>
      </div>
    </div>
  );
}
