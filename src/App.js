import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間①: "",
    中間②: "",
    後部: "",
  });

  const influences = {
    ひな壇: { axle2: 0.6, axle3: 0 },
    中間①: { axle2: 0.8, axle3: 0 },
    中間②: { axle2: 0.5, axle3: 0.6 },
    後部: { axle2: 0.2, axle3: 0.8 },
  };

  const MAX_AXLE2 = 10000;
  const MAX_AXLE3 = 20000;
  const MAX_TOTAL = 19700;

  const parsed = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, parseFloat(v) || 0])
  );

  const usedAxle2 = Object.entries(parsed).reduce(
    (acc, [k, v]) => acc + v * influences[k].axle2,
    0
  );

  const usedAxle3 = Object.entries(parsed).reduce(
    (acc, [k, v]) => acc + v * influences[k].axle3,
    0
  );

  const usedTotal = Object.values(parsed).reduce((acc, v) => acc + v, 0);

  const remainAxle2 = Math.max(0, MAX_AXLE2 - usedAxle2);
  const remainAxle3 = Math.max(0, MAX_AXLE3 - usedAxle3);
  const remainTotal = Math.max(0, MAX_TOTAL - usedTotal);

  const areaRatios = {
    中間②: 0.6,
    後部: 0.4,
  };

  const emptyKeys = Object.entries(weights)
    .filter(([k, v]) => v === "")
    .map(([k]) => k);

  const recommended = {};
  const totalRatio = emptyKeys.reduce((sum, key) => sum + (areaRatios[key] || 0), 0);

  if (remainTotal > 0 && totalRatio > 0) {
    emptyKeys.forEach((key) => {
      if (areaRatios[key]) {
        recommended[key] = Math.round((remainTotal * areaRatios[key]) / totalRatio);
      }
    });
  }

  return (
    <div style={{ padding: "2rem", fontSize: "1rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>

      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: "0.8rem" }}>
          <label>
            {key}（kg）：
            <input
              type="number"
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              style={{ marginLeft: "0.5rem", width: "100px" }}
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
        <strong>現在の第2軸荷重：</strong>{usedAxle2.toLocaleString()}kg
      </div>
      <div>
        <strong>現在の第3軸荷重：</strong>{usedAxle3.toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {remainAxle2.toLocaleString()}kg（第2軸） ／{" "}
        {remainAxle3.toLocaleString()}kg（第3軸）
      </div>

      {emptyKeys.length > 0 && (
        <div style={{ marginTop: "1rem", color: "darkorange" }}>
          👉 <strong>{emptyKeys.join("、")}</strong> が未入力です
        </div>
      )}

      {Object.keys(recommended).length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>目安積載量（全体19700kg配分）：</strong>
          <ul>
            {Object.entries(recommended).map(([k, v]) => (
              <li key={k}>
                {k}：{v.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
