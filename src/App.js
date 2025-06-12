import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間1: "",
    中間2: "",
    後部: "",
  });

  const influences = {
    ひな壇: 1.2006,
    中間1: 0.3345,
    中間2: 0.1491,
    後部: -0.2180,
  };

  const INTERCEPT = 3554.87;
  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedLoad =
    parsedWeights.ひな壇 * influences.ひな壇 +
    parsedWeights.中間1 * influences.中間1 +
    parsedWeights.中間2 * influences.中間2 +
    parsedWeights.後部 * influences.後部 +
    INTERCEPT;

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

    const ratioSum = emptyAreas.reduce(
      (acc, key) => acc + (ratios[key] || 0),
      0
    );

    const rawRecommended = {};
    emptyAreas.forEach((key) => {
      rawRecommended[key] =
        remainingTotal * ((ratios[key] || 0) / ratioSum);
    });

    const frontAxle = parsedWeights.ひな壇 * influences.ひな壇;
    const rawAxle = Object.entries(rawRecommended).reduce(
      (acc, [key, val]) => acc + val * influences[key],
      frontAxle + INTERCEPT
    );

    const scale =
      rawAxle > MAX_AXLE_LOAD
        ? (MAX_AXLE_LOAD - frontAxle - INTERCEPT) /
          (rawAxle - frontAxle - INTERCEPT)
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

  const diagnosis =
    usedLoad > MAX_AXLE_LOAD
      ? "⚠ 第2軸が過積載です。荷重を調整してください。"
      : usedLoad >= 9500
      ? "◎ 第2軸荷重は適正範囲内です。"
      : "△ 第2軸荷重がやや不足しています。バランスに注意。";

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
            onChange={(e) => setWeights({ ...weights, [key]: e.target.value })}
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
              marginLeft: "0.5rem",
            }}
          >
            ✖
          </button>
          {recommended[key] && (
            <div style={{ color: "#FF9900", marginTop: "0.4rem" }}>
              👉 <strong>{key} の積載目安：</strong>
              {recommended[key].toLocaleString()}kg
            </div>
          )}
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
        {remainingAxle.toLocaleString(undefined, {
          minimumFractionDigits: 3,
        })}kg（第2軸）
      </div>
      <div style={{ marginTop: "1rem" }}>
        <strong>診断コメント：</strong>
        <span
          style={{
            color:
              usedLoad > MAX_AXLE_LOAD
                ? "red"
                : usedLoad >= 9500
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
