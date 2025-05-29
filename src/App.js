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
  const emptyKeys = allKeys.filter((key) => !weights[key]);
  const usedKeys = allKeys.filter((key) => weights[key]);

  let suggestions = {};
  if (emptyKeys.length > 0 && remaining > 0) {
    const usedImpact = usedKeys.reduce((sum, key) => sum + parsedWeights[key] * influences[key], 0);
    const totalImpact = allKeys.reduce((sum, key) => sum + (weights[key] ? parsedWeights[key] * influences[key] : 0), 0);
    const distributedImpact = MAX_AXLE_LOAD - parsedWeights.front * influences.front - totalImpact;
    const totalWeightFactor = emptyKeys.reduce((sum, key) => sum + influences[key] ** 2, 0);

    emptyKeys.forEach((key) => {
      suggestions[key] = Math.round((influences[key] ** 2 / totalWeightFactor) * distributedImpact / influences[key]);
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setWeights({ ...weights, [name]: value });
  }

  function handleClear(name) {
    setWeights({ ...weights, [name]: "" });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>第2軸 荷重計算ツール</h2>
      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: "10px" }}>
          <label style={{ width: "80px", display: "inline-block" }}>
            {key.toUpperCase()}（kg）：
          </label>
          <input
            type="number"
            name={key}
            value={weights[key]}
            onChange={handleChange}
            style={{ width: "100px" }}
          />
          <button onClick={() => handleClear(key)} style={{ marginLeft: "5px" }}>✖</button>
        </div>
      ))}

      <p>現在の第2軸荷重：<strong>{usedLoad}kg</strong></p>
      <p>あと積める目安：<strong>{remaining}kg</strong></p>

      {emptyKeys.length > 0 && (
        <>
          <p>👉 <strong>{emptyKeys.map(k => k.toUpperCase()).join(", ")}</strong> が未入力です</p>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {Object.entries(suggestions).map(([key, val]) => (
              <li key={key}>{key.toUpperCase()}：{val}kg</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
