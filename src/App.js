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

  // 分配比の計算（影響率の逆数で正規化）
  const inverseSum =
    1 / influences.mid1 + 1 / influences.mid2 + 1 / influences.rear;

  const suggested = {
    mid1: Math.round((remaining / influences.mid1) / inverseSum),
    mid2: Math.round((remaining / influences.mid2) / inverseSum),
    rear: Math.round((remaining / influences.rear) / inverseSum),
  };

  const emptyKeys = Object.entries(weights)
    .filter(([_, val]) => val === "")
    .map(([key]) => key);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h2>第2軸 荷重計算ツール</h2>

      {Object.entries(weights).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: 10 }}>{key.toUpperCase()}（kg）:</label>
          <input
            type="number"
            name={key}
            value={value}
            onChange={(e) =>
              setWeights((prev) => ({ ...prev, [key]: e.target.value }))
            }
            placeholder="kg 単位で入力"
          />
        </div>
      ))}

      <hr />

      <p>
        現在の第2軸荷重：
        <strong>{usedLoad.toFixed(0)}kg</strong>
      </p>
      <p>
        あと積める目安：
        <strong>{remaining.toFixed(0)}kg</strong>
      </p>

      {remaining > 0 && (
        <>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            <li>MID1：{suggested.mid1}kg</li>
            <li>MID2：{suggested.mid2}kg</li>
            <li>REAR：{suggested.rear}kg</li>
          </ul>
        </>
      )}
    </div>
  );
}
