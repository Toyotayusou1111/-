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

  // 奥に再配分（入力されていないエリアだけ対象）
  const areas = ["mid1", "mid2", "rear"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remaining > 0) {
    const sumInverseSquare = emptyAreas.reduce(
      (sum, area) => sum + 1 / Math.pow(influences[area], 2),
      0
    );
    emptyAreas.forEach((area) => {
      recommended[area] =
        (remaining * (1 / Math.pow(influences[area], 2))) / sumInverseSquare;
    });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>第2軸 荷重計算ツール</h2>

      {["front", "mid1", "mid2", "rear"].map((key) => (
        <div key={key} style={{ marginBottom: "10px" }}>
          <label>
            {key.toUpperCase()}（kg）：
            <input
              type="number"
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              placeholder="kg単位で入力"
              style={{ marginLeft: "10px", width: "120px" }}
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

      {emptyAreas.length > 0 && (
        <div>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {emptyAreas.map((area) => (
              <li key={area}>
                {area.toUpperCase()}：{recommended[area].toFixed(0)}kg
              </li>
            ))}
          </ul>
        </div>
      )}

      {emptyAreas.length === 0 && (
        <p style={{ color: "gray" }}>
          👉 mid1, mid2, rear が未入力です
        </p>
      )}
    </div>
  );
}
