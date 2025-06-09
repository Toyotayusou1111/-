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
    中間1: 0.6070,
    中間2: 0.0975,
    後部: 0.0433,
  };

  const INTERCEPT = 3317.33;
  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const areas = ["ひな壇", "中間1", "中間2", "後部"];

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, parseFloat(v) || 0])
  );

  const usedTotal = Object.values(parsedWeights).reduce((a, b) => a + b, 0);
  const usedAxle =
    Object.entries(parsedWeights).reduce(
      (sum, [k, v]) => sum + v * influences[k],
      INTERCEPT
    );

  const emptyAreas = areas.filter((area) => !weights[area]);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);
  const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedAxle);

  const recommended = {};

  if (emptyAreas.length > 0 && remainingTotal > 0) {
    const ratios = {
      中間1: 0.211,
      中間2: 0.323,
      後部: 0.279,
    };

    const ratioSum = emptyAreas.reduce(
      (acc, key) => acc + (ratios[key] || 0),
      0
    );

    const rawRec = {};
    emptyAreas.forEach((key) => {
      rawRec[key] = MAX_TOTAL_LOAD * (ratios[key] || 0) / ratioSum;
    });

    const frontLoad = parsedWeights.ひな壇 * influences.ひな壇;
    const rawAxle = Object.entries(rawRec).reduce(
      (sum, [k, v]) => sum + v * influences[k],
      frontLoad + INTERCEPT
    );

    const scale =
      rawAxle > MAX_AXLE_LOAD
        ? (MAX_AXLE_LOAD - frontLoad - INTERCEPT) /
          (rawAxle - frontLoad - INTERCEPT)
        : 1;

    emptyAreas.forEach((key) => {
      recommended[key] = Math.round(rawRec[key] * scale);
    });
  }

  const diagnosis =
    usedAxle > MAX_AXLE_LOAD
      ? "⚠ 第2軸が過積載です。荷重を調整してください。"
      : usedAxle >= 9500
      ? "◎ 第2軸荷重は適正範囲内です。"
      : "△ 第2軸荷重がやや不足しています。バランスに注意。";

  const handleKeyDown = (e, key) => {
    if (e.key === "Enter") {
      const i = areas.indexOf(key);
      if (i >= 0 && i < areas.length - 1) {
        const next = areas[i + 1];
        const el = document.getElementById(next);
        if (el) el.focus();
      }
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>第2軸 荷重計算ツール</h2>
      {areas.map((key) => (
        <div key={key} style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>
            {key}（kg）：
          </label>
          <input
            id={key}
            type="number"
            value={weights[key]}
            onChange={(e) =>
              setWeights({ ...weights, [key]: e.target.value })
            }
            onKeyDown={(e) => handleKeyDown(e, key)}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              marginBottom: "0.3rem",
            }}
          />
          <button
            onClick={() => setWeights({ ...weights, [key]: "" })}
            style={{
              padding: "0.3rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#ccc",
              border: "none",
              cursor: "pointer",
              marginTop: "0.3rem",
            }}
          >
            ✖
          </button>
          {recommended[key] !== undefined && (
            <div style={{ marginTop: "0.5rem", color: "#555" }}>
              👉 <strong>{key}</strong> の積載目安：
              {recommended[key].toLocaleString()}kg
            </div>
          )}
        </div>
      ))}

      <div>
        <strong>現在の第2軸荷重：</strong>
        {Math.round(usedAxle).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の総積載量：</strong>
        {Math.round(usedTotal).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.round(remainingAxle).toLocaleString()}kg（第2軸）
      </div>

      <div style={{ marginTop: "1rem" }}>
        <strong>診断コメント：</strong>
        <span
          style={{
            color:
              usedAxle > MAX_AXLE_LOAD
                ? "red"
                : usedAxle >= 9500
                ? "green"
                : "orange",
          }}
        >
          {diagnosis}
        </span>
      </div>

      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem", color: "#FF9900" }}>
          👉 <strong>{emptyAreas.join("、")}</strong>が未入力です
        </div>
      )}
    </div>
  );
}
