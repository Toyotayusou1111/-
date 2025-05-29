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

  // 分配比率の逆数合計
  const inverseSum =
    1 / influences.mid1 + 1 / influences.mid2 + 1 / influences.rear;

  const estimates = {
    mid1: Math.round((1 / influences.mid1 / inverseSum) * remaining),
    mid2: Math.round((1 / influences.mid2 / inverseSum) * remaining),
    rear: Math.round((1 / influences.rear / inverseSum) * remaining),
  };

  const handleChange = (e) => {
    setWeights((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>第2軸 荷重計算ツール</h2>

      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label style={{ display: "inline-block", width: 100 }}>
            {key.toUpperCase()}（kg）:
          </label>
          <input
            type="number"
            name={key}
            value={weights[key]}
            onChange={handleChange}
            placeholder="kg 単位で入力"
          />
        </div>
      ))}

      <hr />

      <p>
        <strong>現在の第2軸荷重：</strong> {usedLoad.toFixed(0)}kg
      </p>
      <p>
        <strong>あと積める目安：</strong> {remaining.toFixed(0)}kg
      </p>

      <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
      <ul>
        <li>MID1：{estimates.mid1}kg</li>
        <li>MID2：{estimates.mid2}kg</li>
        <li>REAR：{estimates.rear}kg</li>
      </ul>
    </div>
  );
}
