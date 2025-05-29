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

  const MAX_LOAD = 10000;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const currentLoad =
    parsedWeights.front * influences.front +
    parsedWeights.mid1 * influences.mid1 +
    parsedWeights.mid2 * influences.mid2 +
    parsedWeights.rear * influences.rear;

  const remaining = Math.max(0, MAX_LOAD - currentLoad);

  // 分配対象（ひな壇以外）
  const targetAreas = ["mid1", "mid2", "rear"];
  const totalInfluence = targetAreas.reduce(
    (sum, key) => sum + influences[key],
    0
  );

  const suggestions = Object.fromEntries(
    targetAreas.map((key) => [
      key,
      remaining > 0
        ? Math.floor((remaining * influences[key]) / totalInfluence)
        : 0,
    ])
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWeights({ ...weights, [name]: value });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>第2軸 荷重計算ツール</h2>

      {Object.entries(weights).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key.toUpperCase()}（kg）:
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleChange}
              placeholder="kg 単位で入力"
              style={{ marginLeft: "1rem" }}
            />
          </label>
        </div>
      ))}

      <hr />
      <p>現在の第2軸荷重：<strong>{currentLoad.toFixed(0)}kg</strong></p>
      <p>あと積める目安：<strong>{remaining.toFixed(0)}kg</strong></p>

      {remaining > 0 && (
        <>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {targetAreas.map((key) => (
              <li key={key}>
                {key.toUpperCase()}：{suggestions[key]}kg
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
