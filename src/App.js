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

  const areas = ["mid1", "mid2", "rear"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};

  if (emptyAreas.length > 0 && remaining > 0) {
    const numerator = (10000 - usedLoad);
    const denominator = emptyAreas.reduce(
      (acc, area) => acc + 1 / influences[area] ** 2,
      0
    );
    for (const area of emptyAreas) {
      recommended[area] = (numerator / denominator) / influences[area] ** 2;
    }
  }

  const handleChange = (key, value) => {
    setWeights({ ...weights, [key]: value });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>第2軸 荷重計算ツール</h1>
      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label>{key.toUpperCase()}（kg）:</label>
          <input
            type="number"
            value={weights[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="kg単位で入力"
          />
        </div>
      ))}
      <hr />
      <p><strong>現在の第2軸荷重：</strong>{usedLoad.toFixed(0)}kg</p>
      <p><strong>あと積める目安：</strong>{remaining.toFixed(0)}kg</p>
      {emptyAreas.length > 0 && (
        <>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {emptyAreas.map((key) => (
              <li key={key}>
                {key.toUpperCase()}：{recommended[key]?.toFixed(0)}kg
              </li>
            ))}
          </ul>
        </>
      )}
      {emptyAreas.length === 0 && (
        <p style={{ color: "gray" }}>
          👉 MID1, MID2, REAR が未入力です
        </p>
      )}
    </div>
  );
}
