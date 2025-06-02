import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    hinadan: "",
    mid1: "",
    mid2: "",
    rear: "",
  });

  // 比率は19.7t（19700kg）に基づく正解便平均より
  const ratio = {
    hinadan: 0.2134,
    mid1: 0.2583,
    mid2: 0.3015,
    rear: 0.2268,
  };

  const influences = {
    hinadan: 0.5, // 仮定
    mid1: 0.8,
    mid2: 0.5,
    rear: 0.2,
  };

  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const parsed = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, parseFloat(v) || 0])
  );

  const usedLoad =
    parsed.hinadan * influences.hinadan +
    parsed.mid1 * influences.mid1 +
    parsed.mid2 * influences.mid2 +
    parsed.rear * influences.rear;

  const totalLoad =
    parsed.hinadan + parsed.mid1 + parsed.mid2 + parsed.rear;

  const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedLoad);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - totalLoad);

  const emptyAreas = ["mid1", "mid2", "rear"].filter((k) => !weights[k]);

  let recommended = {};

  if (emptyAreas.length > 0 && remainingAxle > 0 && remainingTotal > 0) {
    const remainingRatio = emptyAreas.reduce((sum, key) => sum + ratio[key], 0);

    const raw = {};
    emptyAreas.forEach((k) => {
      raw[k] = MAX_TOTAL_LOAD * (ratio[k] / remainingRatio);
    });

    const base = parsed.hinadan * influences.hinadan;
    const rawAxle = Object.entries(raw).reduce(
      (acc, [k, v]) => acc + v * influences[k],
      base
    );

    const scale = (MAX_AXLE_LOAD - base) / (rawAxle - base);
    emptyAreas.forEach((k) => {
      recommended[k] = Math.round(raw[k] * scale);
    });
  }

  const handleKeyDown = (e, key) => {
    if (e.key === "Enter") {
      const inputs = ["hinadan", "mid1", "mid2", "rear"];
      const index = inputs.indexOf(key);
      if (index !== -1 && index < inputs.length - 1) {
        const next = document.getElementById(inputs[index + 1]);
        if (next) next.focus();
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>

      {Object.entries({
        hinadan: "ひな壇（kg）",
        mid1: "中間①（kg）",
        mid2: "中間②（kg）",
        rear: "後部（kg）",
      }).map(([key, label]) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {label}
            ：
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
        </div>
      ))}

      <div>
        <strong>現在の第2軸荷重：</strong>
        {Math.round(usedLoad).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の総積載量：</strong>
        {Math.round(totalLoad).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.round(remainingAxle).toLocaleString()}kg（第2軸）
      </div>

      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyAreas.map((e) => {
            if (e === "mid1") return "中間①";
            if (e === "mid2") return "中間②";
            if (e === "rear") return "後部";
            return e;
          }).join("、")}</strong>が未入力です
        </div>
      )}

      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>目安積載量（全体19700kg配分）：</strong>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key === "mid1"
                  ? "中間①"
                  : key === "mid2"
                  ? "中間②"
                  : "後部"}
                ：{val.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
