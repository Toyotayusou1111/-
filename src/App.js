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

  const MAX_AXLE_LOAD = 10000;

  const usedLoad =
    parsedWeights.front * influences.front +
    parsedWeights.mid1 * influences.mid1 +
    parsedWeights.mid2 * influences.mid2 +
    parsedWeights.rear * influences.rear;

  const remaining = Math.max(0, MAX_AXLE_LOAD - usedLoad);

  // Excel式と完全一致：未入力エリアへ影響率2乗に応じて配分
  const keys = ["mid1", "mid2", "rear"];
  const emptyKeys = keys.filter((k) => weights[k] === "");
  const filledLoad =
    parsedWeights.front * influences.front +
    keys
      .filter((k) => weights[k] !== "")
      .reduce((acc, k) => acc + parsedWeights[k] * influences[k], 0);

  const distributed = {};
  if (emptyKeys.length > 0) {
    const total = emptyKeys.reduce(
      (acc, key) => acc + influences[key] ** 2,
      0
    );
    emptyKeys.forEach((key) => {
      distributed[key] = ((influences[key] ** 2) / total) * (MAX_AXLE_LOAD - filledLoad * 1);
    });
  }

  const handleChange = (key, val) => {
    setWeights((w) => ({ ...w, [key]: val }));
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>第2軸 荷重計算ツール</h2>
      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label>
            {key.toUpperCase()}（kg）：{" "}
            <input
              type="number"
              value={weights[key]}
              onChange={(e) => handleChange(key, e.target.value)}
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

      {emptyKeys.length > 0 ? (
        <>
          <p>👉 未入力の各エリアへの積載目安（第2軸10t超えない範囲）</p>
          <ul>
            {emptyKeys.map((key) => (
              <li key={key}>
                {key.toUpperCase()}：{distributed[key].toFixed(0)}kg
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ color: "gray" }}>
          👉 MID1, MID2, REAR が未入力です
        </p>
      )}
    </div>
  );
}
