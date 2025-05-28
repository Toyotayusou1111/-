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

  const remaining = Math.max(0, 10000 - usedLoad);

  const emptyKeys = Object.entries(weights)
    .filter(([_, val]) => val === "")
    .map(([key]) => key);

  return (
    <div style={{ padding: 20 }}>
      <h1>第2軸荷重 簡易計算ツール</h1>
      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <label>{key.toUpperCase()} 重量(kg): </label>
          <input
            type="number"
            value={weights[key]}
            onChange={(e) =>
              setWeights((prev) => ({ ...prev, [key]: e.target.value }))
            }
          />
        </div>
      ))}
      <div style={{ marginTop: 20 }}>
        {emptyKeys.length > 0 ? (
          <p style={{ color: "gray" }}>👉 {emptyKeys.join(", ")} が未入力です</p>
        ) : (
          <>
            <p>想定される第2軸荷重：<strong>{usedLoad.toFixed(0)}kg</strong></p>
            <p>あと積める目安：<strong>{remaining.toFixed(0)}kg</strong></p>
          </>
        )}
      </div>
    </div>
  );
}
