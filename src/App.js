import React, { useState, useRef } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    hinadan: "",
    chukan1: "",
    chukan2: "",
    kobu: "",
  });

  const inputRefs = {
    hinadan: useRef(null),
    chukan1: useRef(null),
    chukan2: useRef(null),
    kobu: useRef(null),
  };

  const influences = {
    hinadan: { axle2: 0.5, axle3: 0.0 },
    chukan1: { axle2: 0.6, axle3: 0.0 },
    chukan2: { axle2: 0.3, axle3: 0.6 },
    kobu: { axle2: 0.1, axle3: 0.4 },
  };

  const MAX_AXLE2_LOAD = 10000;
  const MAX_AXLE3_LOAD = 20000;
  const MAX_TOTAL_LOAD = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedAxle2 =
    parsedWeights.hinadan * influences.hinadan.axle2 +
    parsedWeights.chukan1 * influences.chukan1.axle2 +
    parsedWeights.chukan2 * influences.chukan2.axle2 +
    parsedWeights.kobu * influences.kobu.axle2;

  const usedAxle3 =
    parsedWeights.chukan2 * influences.chukan2.axle3 +
    parsedWeights.kobu * influences.kobu.axle3;

  const usedTotal =
    parsedWeights.hinadan +
    parsedWeights.chukan1 +
    parsedWeights.chukan2 +
    parsedWeights.kobu;

  const remainingAxle2 = Math.max(0, MAX_AXLE2_LOAD - usedAxle2);
  const remainingAxle3 = Math.max(0, MAX_AXLE3_LOAD - usedAxle3);
  const remainingTotal = Math.max(0, MAX_TOTAL_LOAD - usedTotal);

  const areas = ["chukan2", "kobu"];
  const emptyAreas = areas.filter((area) => !weights[area]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainingTotal > 0) {
    const ratios = {
      chukan2: 0.6017,
      kobu: 0.3983,
    };

    const ratioSum = emptyAreas.reduce((acc, key) => acc + ratios[key], 0);

    const rawRecommended = {};
    emptyAreas.forEach((key) => {
      rawRecommended[key] = MAX_TOTAL_LOAD * (ratios[key] / ratioSum);
    });

    emptyAreas.forEach((key) => {
      recommended[key] = Math.round(rawRecommended[key]);
    });
  }

  const handleKeyDown = (e, currentKey) => {
    if (e.key === "Enter") {
      const keys = Object.keys(inputRefs);
      const currentIndex = keys.indexOf(currentKey);
      const nextIndex = (currentIndex + 1) % keys.length;
      inputRefs[keys[nextIndex]].current.focus();
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
      {Object.entries(weights).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {(() => {
              switch (key) {
                case "hinadan":
                  return "ひな壇（kg）";
                case "chukan1":
                  return "中間①（kg）";
                case "chukan2":
                  return "中間②（kg）";
                case "kobu":
                  return "後部（kg）";
                default:
                  return key;
              }
            })()}
            ：
            <input
              type="number"
              value={value}
              onChange={(e) =>
                setWeights({ ...weights, [key]: e.target.value })
              }
              onKeyDown={(e) => handleKeyDown(e, key)}
              ref={inputRefs[key]}
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
        {usedAxle2.toLocaleString()}kg
      </div>
      <div>
        <strong>現在の第3軸荷重：</strong>
        {usedAxle3.toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {remainingAxle2.toLocaleString()}kg（第2軸） ／ {remainingAxle3.toLocaleString()}kg（第3軸）
      </div>
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyAreas.map((e) => {
            switch (e) {
              case "chukan2": return "中間②";
              case "kobu": return "後部";
              default: return e;
            }
          }).join(", ")}</strong>
          が未入力です
        </div>
      )}
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>目安積載量（全体19700kg配分）：</strong>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key === "chukan2" ? "中間②" : "後部"}：{val.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
