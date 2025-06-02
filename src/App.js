import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    front: "",
    mid1: "",
    mid2: "",
    rear: "",
  });

  const influences = {
    front: 0.6,
    mid1: 0.8,
    mid2: 0.5,
    rear: 0.2,
  };

  const MAX_AXLE_LOAD = 10000;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedLoad =
    parsedWeights.front * influences.front +
    parsedWeights.mid1 * influences.mid1 +
    parsedWeights.mid2 * influences.mid2 +
    parsedWeights.rear * influences.rear;

  const remaining = Math.max(0, MAX_AXLE_LOAD - usedLoad);

  const allKeys = ["mid1", "mid2", "rear"];
  const emptyKeys = allKeys.filter((k) => !weights[k]);

  const recommended = {};
  if (emptyKeys.length > 0 && remaining > 0) {
    const denom = emptyKeys
      .map((k) => Math.pow(influences[k], 2))
      .reduce((a, b) => a + b, 0);

    emptyKeys.forEach((k) => {
      const val =
        (Math.pow(influences[k], 2) * remaining) /
        (influences[k] * denom);
      recommended[k] = Math.round(val);
    });
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>第2軸 荷重計算ツール</h2>

      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label>
            {key.toUpperCase()}（kg）：
            <input
              type="number"
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              style={{ marginLeft: 10 }}
              placeholder="kg単位で入力"
            />
          </label>
        </div>
      ))}

      <hr />
      <p>
        <strong>現在の第2軸荷重：</strong>
        {usedLoad.toFixed(0)}kg
      </p>
      <p>
        <strong>あと積める目安：</strong>
        {remaining.toFixed(0)}kg
      </p>

      {emptyKeys.length > 0 && remaining > 0 ? (
        <>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {emptyKeys.map((key) => (
              <li key={key}>
                {key.toUpperCase()}：{recommended[key]}kg
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ color: "gray" }}>
          👉 {emptyKeys.join(", ").toUpperCase()} が未入力です
        </p>
      )}
    </div>
  );
}
