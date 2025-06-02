import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    hinadan: "",
    chukan1: "",
    chukan2: "",
    koubu: "",
  });

  const influences = {
    hinadan: 0.5,
    chukan1: 0.5,
    chukan2: 0.45,
    koubu: 0.3,
  };

  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const ratios = {
    chukan1: 0.269,
    chukan2: 0.373,
    koubu: 0.276,
  };

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedAxleLoad =
    parsedWeights.hinadan * influences.hinadan +
    parsedWeights.chukan1 * influences.chukan1 +
    parsedWeights.chukan2 * influences.chukan2 +
    parsedWeights.koubu * influences.koubu;

  const usedTotalLoad =
    parsedWeights.hinadan +
    parsedWeights.chukan1 +
    parsedWeights.chukan2 +
    parsedWeights.koubu;

  const remainingAxle = Math.max(0, MAX_AXLE_LOAD - usedAxleLoad);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotalLoad);

  const emptyAreas = ["chukan1", "chukan2", "koubu"].filter(
    (key) => !weights[key]
  );

  const recommended = {};
  if (emptyAreas.length > 0 && remainingTotal > 0) {
    const activeRatios = Object.fromEntries(
      emptyAreas.map((key) => [key, ratios[key]])
    );

    const ratioSum = Object.values(activeRatios).reduce(
      (acc, val) => acc + val,
      0
    );

    emptyAreas.forEach((key) => {
      recommended[key] = Math.round(
        remainingTotal * (ratios[key] / ratioSum)
      );
    });
  }

  const handleKeyDown = (e, key) => {
    if (e.key === "Enter") {
      const keys = ["hinadan", "chukan1", "chukan2", "koubu"];
      const idx = keys.indexOf(key);
      if (idx !== -1 && idx < keys.length - 1) {
        const nextInput = document.getElementById(keys[idx + 1]);
        if (nextInput) nextInput.focus();
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
      {Object.entries(weights).map(([key, val]) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key === "hinadan"
              ? "ひな壇"
              : key === "chukan1"
              ? "中間①"
              : key === "chukan2"
              ? "中間②"
              : "後部"}
            （kg）：
            <input
              id={key}
              type="number"
              value={val}
              onChange={(e) => setWeights({ ...weights, [key]: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, key)}
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
        {Math.round(usedAxleLoad).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の総積載量：</strong>
        {Math.round(usedTotalLoad).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.round(remainingAxle).toLocaleString()}kg（第2軸）
      </div>

      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyAreas.map((e) => {
            if (e === "chukan1") return "中間①";
            if (e === "chukan2") return "中間②";
            return "後部";
          }).join("、")}</strong>
          が未入力です
        </div>
      )}

      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>目安積載量（全体19700kg配分）：</strong>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key === "chukan1"
                  ? "中間①"
                  : key === "chukan2"
                  ? "中間②"
                  : "後部"}
                ：{val.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
