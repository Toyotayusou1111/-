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

  // --- 正確な積載目安計算（Excelと同様） ---
  const w1 = 1 / influences.mid1;
  const w2 = 1 / influences.mid2;
  const w3 = 1 / influences.rear;
  const totalWeight = w1 + w2 + w3;

  const targetAreas = {
    mid1: Math.round((remaining * w1) / totalWeight),
    mid2: Math.round((remaining * w2) / totalWeight),
    rear: Math.round((remaining * w3) / totalWeight),
  };

  const emptyKeys = Object.entries(weights)
    .filter(([_, val]) => val === "")
    .map(([key]) => key);

  return (
    <div style={{ padding: "20px" }}>
      <h2>第2軸 荷重計算ツール</h2>

      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: "10px" }}>
          <label style={{ width: "100px", display: "inline-block" }}>
            {key.toUpperCase()}（kg）:
          </label>
          <input
            type="number"
            name={key}
            value={weights[key]}
            onChange={(e) =>
              setWeights({ ...weights, [key]: e.target.value })
            }
          />
        </div>
      ))}

      <hr />
      <p>
        <strong>現在の第2軸荷重：</strong>
        {usedLoad.toFixed(0)}kg
      </p>
      <p>
        <strong>あと積める目安：</strong>
        {remaining.toFixed(0)}kg
      </p>

      {emptyKeys.length > 0 ? (
        <p style={{ color: "gray" }}>
          👉 {emptyKeys.join(", ")} が未入力です
        </p>
      ) : (
        <>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {Object.entries(targetAreas).map(([key, val]) => (
              <li key={key}>
                {key.toUpperCase()}：{
