import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    front: "",
    mid1: "",
    mid2: "",
    rear: "",
  });

  const MAX_AXLE_LOAD = 10000;

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

  const remaining = Math.max(0, MAX_AXLE_LOAD - usedLoad);

  const emptyKeys = Object.entries(weights)
    .filter(([_, val]) => val === "")
    .map(([key]) => key);

  // 各エリアにあと何kg積めば10tに届くか逆算
  const targetAreas = ["mid1", "mid2", "rear"];
  const remainingRatios = targetAreas.map((key) => influences[key]);
  const ratioSum = remainingRatios.reduce((a, b) => a + b, 0);
  const suggestedLoads = Object.fromEntries(
    targetAreas.map((key) => [
      key,
      Math.floor((remaining * influences[key]) / ratioSum),
    ])
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>第2軸 荷重計算ツール</h2>
      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: "10px" }}>
          <label>
            {key.toUpperCase()}（kg）：
            <input
              type="number"
              name={key}
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              style={{ marginLeft: "10px" }}
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

      {remaining > 0 && (
        <div>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            <li>MID1：{suggestedLoads.mid1}kg</li>
            <li>MID2：{suggestedLoads.mid2}kg</li>
            <li>REAR：{suggestedLoads.rear}kg</li>
          </ul>
        </div>
      )}
    </div>
  );
}
