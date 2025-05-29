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
    const sumInverseSquare = emptyAreas.reduce(
      (sum, key) => sum + 1 / Math.pow(influences[key], 2),
      0
    );

    emptyAreas.forEach((key) => {
      const ratio = (1 / Math.pow(influences[key], 2)) / sumInverseSquare;
      recommended[key] = Math.round(ratio * remaining);
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWeights((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = (key) => {
    setWeights((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>第2軸 荷重計算ツール</h2>

      {Object.entries(weights).map(([key, val]) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "0.5rem" }}>
            {key.toUpperCase()}（kg）:
            <input
              type="number"
              name={key}
              value={val}
              onChange={handleChange}
              style={{ marginLeft: "0.5rem", width: "100px" }}
            />
          </label>
          <button
            type="button"
            onClick={() => handleClear(key)}
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#eee",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ))}

      <p>
        <strong>現在の第2軸荷重：</strong>
        {usedLoad.toFixed(0)}kg
      </p>
      <p>
        <strong>あと積める目安：</strong>
        {remaining.toFixed(0)}kg
      </p>

      {emptyAreas.length > 0 ? (
        <>
          <p>
            👉 <strong>{emptyAreas.join(", ").toUpperCase()}</strong> が未入力です
          </p>
          <p>
            <strong>各エリア別 積載目安（第2軸10t超えない範囲）</strong>
          </p>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key.toUpperCase()}：{val}kg
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
