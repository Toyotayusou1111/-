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

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedLoad =
    parsedWeights.front * influences.front +
    parsedWeights.mid1 * influences.mid1 +
    parsedWeights.mid2 * influences.mid2 +
    parsedWeights.rear * influences.rear;

  const MAX_AXLE_LOAD = 10000;
  const remaining = Math.max(0, MAX_AXLE_LOAD - usedLoad);

  // 配分計算：未入力のエリアに対して逆算分配
  const emptyKeys = Object.entries(weights)
    .filter(([_, val]) => val === "")
    .map(([key]) => key);

  const totalInverse = emptyKeys.reduce(
    (sum, key) => sum + 1 / influences[key],
    0
  );

  const suggestedLoads = Object.fromEntries(
    Object.keys(influences).map((key) => {
      if (weights[key] !== "") return [key, null];
      const portion = (1 / influences[key]) / totalInverse;
      return [key, Math.round(portion * remaining)];
    })
  );

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>第2軸 荷重計算ツール</h2>
      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label>
            {key.toUpperCase()}（kg）：
            <input
              type="number"
              name={key}
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              style={{ marginLeft: 10 }}
              placeholder="kg 単位で入力"
            />
          </label>
        </div>
      ))}

      <hr />
      <p>
        現在の第2軸荷重：<strong>{usedLoad.toFixed(0)}kg</strong>
      </p>
      <p>
        あと積める目安：<strong>{remaining.toFixed(0)}kg</strong>
      </p>

      {emptyKeys.length > 0 ? (
        <>
          <p style={{ color: "gray" }}>
            👉 {emptyKeys.join(", ")} が未入力です
          </p>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {emptyKeys.map((key) => (
              <li key={key}>
                {key.toUpperCase()}：{suggestedLoads[key]}kg
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
