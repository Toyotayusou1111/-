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

  const entryStates = {
    mid1: weights.mid1 === "",
    mid2: weights.mid2 === "",
    rear: weights.rear === "",
  };

  const emptyKeys = Object.keys(entryStates).filter((key) => entryStates[key]);

  const recommended = {};
  if (emptyKeys.length > 0 && remaining > 0) {
    const sumInverseSquares = emptyKeys.reduce(
      (sum, key) => sum + 1 / influences[key] ** 2,
      0
    );

    emptyKeys.forEach((key) => {
      recommended[key] =
        Math.round((remaining * (1 / influences[key] ** 2)) / sumInverseSquares);
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>第2軸 荷重計算ツール</h2>
      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label>{key.toUpperCase()}（kg）：</label>
          <input
            type="number"
            name={key}
            value={weights[key]}
            onChange={(e) =>
              setWeights((prev) => ({ ...prev, [key]: e.target.value }))
            }
            placeholder="kg単位で入力"
          />
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

      {emptyKeys.length > 0 ? (
        <>
          <p>👉 {emptyKeys.join(", ")} が未入力です</p>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {emptyKeys.map((key) => (
              <li key={key}>
                {key.toUpperCase()}：{recommended[key] || 0}kg
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
