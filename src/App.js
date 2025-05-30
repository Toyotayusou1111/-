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
  const MAX_TOTAL_LOAD = 19700;
  const MAX_REAR_AXLE = 20000;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedAxle2 =
    parsedWeights.front * influences.front +
    parsedWeights.mid1 * influences.mid1 +
    parsedWeights.mid2 * influences.mid2 +
    parsedWeights.rear * influences.rear;

  const usedTotal =
    parsedWeights.front +
    parsedWeights.mid1 +
    parsedWeights.mid2 +
    parsedWeights.rear;

  const usedAxle3 =
    parsedWeights.mid2 * influences.mid2 + parsedWeights.rear * influences.rear;

  const remainingAxle2 = Math.max(0, MAX_AXLE_LOAD - usedAxle2);
  const remainingAxle3 = Math.max(0, MAX_REAR_AXLE - usedAxle3);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);

  const areas = ["mid1", "mid2", "rear"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainingTotal > 0) {
    const ratios = {
      mid1: 0.196,
      mid2: 0.318,
      rear: 0.308,
    };

    const ratioSum = emptyAreas.reduce((acc, key) => acc + ratios[key], 0);

    const rawRecommended = {};
    emptyAreas.forEach((key) => {
      rawRecommended[key] = remainingTotal * (ratios[key] / ratioSum);
    });

    const frontAxle = parsedWeights.front * influences.front;
    const rawAxle2 = Object.entries(rawRecommended).reduce(
      (acc, [key, val]) => acc + val * influences[key],
      frontAxle
    );
    const rawAxle3 = (rawRecommended.mid2 || 0) * influences.mid2 + (rawRecommended.rear || 0) * influences.rear;

    const scale2 = (MAX_AXLE_LOAD - frontAxle) / (rawAxle2 - frontAxle);
    const scale3 = MAX_REAR_AXLE / rawAxle3;
    const scale = Math.min(scale2, scale3, 1.0);

    emptyAreas.forEach((key) => {
      recommended[key] = Math.round(rawRecommended[key] * scale);
    });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール</h2>
      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key.toUpperCase()}（kg）：
            <input
              type="number"
              value={weights[key]}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              style={{ marginLeft: "0.5rem" }}
            />
            <button
              onClick={() => setWeights({ ...weights, [key]: "" })}
              style={{ marginLeft: "0.5rem" }}
            >
              ✖
            </button>
          </label>
        </div>
      ))}
      <div>
        <strong>現在の第2軸荷重：</strong>
        {Math.round(usedAxle2).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の第3軸荷重：</strong>
        {Math.round(usedAxle3).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.round(remainingAxle2).toLocaleString()}kg（第2軸） /{" "}
        {Math.round(remainingAxle3).toLocaleString()}kg（第3軸）
      </div>
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyAreas.map((e) => e.toUpperCase()).join(", ")}</strong>
          が未入力です
        </div>
      )}
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>各エリア別 積載目安（2軸10t＆3軸20t以内＆合計19700kg）</strong>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key.toUpperCase()}：{val.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
