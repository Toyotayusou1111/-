import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    front: "",   // ひな壇
    mid1: "",    // 中間①
    mid2: "",    // 中間②
    rear: "",    // 後部
  });

  // 実績ベースから得られた積載割合（合計19700kg想定）
  const ratios = {
    front: 0.203,   // 約20.3%
    mid1: 0.2355,   // 約23.55%
    mid2: 0.3378,   // 約33.78%
    rear: 0.2237,   // 約22.37%
  };

  // 軸影響係数（実運用に応じて調整可）
  const influences = {
    front: 0.6,
    mid1: 0.8,
    mid2: 0.5,
    rear: 0.2,
  };

  const MAX_TOTAL = 19700;
  const MAX_AXLE2 = 10000;
  const MAX_AXLE3 = 20000;

  const parsed = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, parseFloat(v) || 0])
  );

  const usedTotal = parsed.front + parsed.mid1 + parsed.mid2 + parsed.rear;
  const usedAxle2 =
    parsed.front * influences.front +
    parsed.mid1 * influences.mid1 +
    parsed.mid2 * influences.mid2 +
    parsed.rear * influences.rear;

  const usedAxle3 = parsed.mid2 + parsed.rear;

  const remainingTotal = Math.max(0, MAX_TOTAL - usedTotal);
  const remainingAxle2 = Math.max(0, MAX_AXLE2 - usedAxle2);
  const remainingAxle3 = Math.max(0, MAX_AXLE3 - usedAxle3);

  // 未入力エリアを取得
  const emptyKeys = ["front", "mid1", "mid2", "rear"].filter((k) => !weights[k]);

  // 割合ベースの推奨値
  const sumRatio = emptyKeys.reduce((sum, k) => sum + ratios[k], 0);
  const recommendations = {};
  emptyKeys.forEach((k) => {
    recommendations[k] = Math.round((MAX_TOTAL * ratios[k]) / sumRatio);
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>

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
        <strong>現在の第2軸荷重：</strong> {Math.round(usedAxle2).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の第3軸荷重：</strong> {Math.round(usedAxle3).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>{" "}
        {Math.round(remainingAxle2).toLocaleString()}kg（第2軸） ／{" "}
        {Math.round(remainingAxle3).toLocaleString()}kg（第3軸）
      </div>

      {emptyKeys.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyKeys.map((k) => k.toUpperCase()).join(", ")}</strong>{" "}
          が未入力です
        </div>
      )}

      {emptyKeys.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>目安積載量（全体19700kg配分）：</strong>
          <ul>
            {Object.entries(recommendations).map(([k, v]) => (
              <li key={k}>
                {k.toUpperCase()}：{v.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
