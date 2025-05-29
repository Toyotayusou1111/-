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

  // 正しい積載配分：影響率の合計に対する比率
  const totalInfluence =
    influences.mid1 + influences.mid2 + influences.rear;

  const alloc = {
    mid1: Math.round(remaining * (influences.mid1 / totalInfluence)),
    mid2: Math.round(remaining * (influences.mid2 / totalInfluence)),
    rear: Math.round(remaining * (influences.rear / totalInfluence)),
  };

  const emptyKeys = Object.entries(weights)
    .filter(([, val]) => val === "")
    .map(([key]) => key);

  return (
    <div style={{ padding: 30 }}>
      <h2>第2軸 荷重計算ツール</h2>

      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label>
            {key.toUpperCase()}（kg）：
            <input
              type="number"
              name={key}
              value={weights[key]}
              onChange={(e) =>
                setWeights((w) => ({ ...w, [key]: e.target.value }))
              }
              style={{ marginLeft: 5 }}
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

      {emptyKeys.length === 0 && (
        <>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            <li>MID1：{alloc.mid1}kg</li>
            <li>MID2：{alloc.mid2}kg</li>
            <li>REAR：{alloc.rear}kg</li>
          </ul>
        </>
      )}

      {emptyKeys.length > 0 && (
        <p style={{ color: "gray" }}>
          👉 {emptyKeys.join(", ")} が未入力です
        </p>
      )}
    </div>
  );
}
