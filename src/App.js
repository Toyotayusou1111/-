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
  const emptyAreas = areas.filter((area) => weights[area] === "");

  const recommended = {};
  if (emptyAreas.length > 0 && remaining > 0) {
    const sumInverseSquare = emptyAreas.reduce(
      (acc, area) => acc + 1 / Math.pow(influences[area], 2),
      0
    );

    for (const area of emptyAreas) {
      const ratio = 1 / Math.pow(influences[area], 2);
      const share = (ratio / sumInverseSquare) * remaining;
      recommended[area] = Math.round(share);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>第2軸 荷重計算ツール</h1>
      {["front", "mid1", "mid2", "rear"].map((area) => (
        <div key={area}>
          <label style={{ marginRight: 10 }}>
            {area.toUpperCase()}（kg）：{" "}
            <input
              type="number"
              value={weights[area]}
              onChange={(e) =>
                setWeights({ ...weights, [area]: e.target.value })
              }
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

      {emptyAreas.length > 0 && (
        <div>
          <h4>各エリア別 積載目安（第2軸10t超えない範囲）</h4>
          <ul>
            {emptyAreas.map((area) => (
              <li key={area}>
                {area.toUpperCase()}：{recommended[area]}kg
              </li>
            ))}
          </ul>
        </div>
      )}

      {emptyAreas.length === 0 && remaining > 0 && (
        <p style={{ color: "gray" }}>👉 MID1, MID2, REAR が未入力です</p>
      )}
    </div>
  );
}
