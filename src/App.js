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

  // Excelと同じ「残容量の逆数分配ロジック」
  const isEntered = (val) => val !== "" && !isNaN(val);
  const isMid1Entered = isEntered(weights.mid1);
  const isMid2Entered = isEntered(weights.mid2);
  const isRearEntered = isEntered(weights.rear);

  let remainingSuggestion = {};
  if (!isMid1Entered || !isMid2Entered || !isRearEntered) {
    const influenceEntries = [
      ["mid1", influences.mid1],
      ["mid2", influences.mid2],
      ["rear", influences.rear],
    ].filter(([key]) => !isEntered(weights[key]));

    const inverseSum = influenceEntries.reduce(
      (sum, [, inf]) => sum + 1 / inf,
      0
    );

    remainingSuggestion = Object.fromEntries(
      influenceEntries.map(([key, inf]) => [
        key,
        Math.round((remaining / inf / inverseSum)),
      ])
    );
  }

  const handleChange = (e) => {
    setWeights({ ...weights, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>第2軸 荷重計算ツール</h2>
      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: 8 }}>
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
        現在の第2軸荷重：<strong>{usedLoad.toFixed(0)}kg</strong>
      </p>
      <p>
        あと積める目安：<strong>{remaining.toFixed(0)}kg</strong>
      </p>

      {Object.keys(remainingSuggestion).length > 0 ? (
        <>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {Object.entries(remainingSuggestion).map(([key, value]) => (
              <li key={key}>
                {key.toUpperCase()}：{value}kg
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ color: "gray" }}>
          👉 mid1, mid2, rear が未入力です
        </p>
      )}
    </div>
  );
}
