import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    hinadan: "",
    chukan1: "",
    chukan2: "",
    koubu: "",
  });

  const influences2 = {
    hinadan: 0.6,
    chukan1: 0.8,
    chukan2: 0.5,
    koubu: 0.2,
  };

  const influences3 = {
    chukan2: 0.6,
    koubu: 0.4,
  };

  const MAX_AXLE2 = 10000;
  const MAX_AXLE3 = 20000;
  const MAX_TOTAL = 19700;

  const parsed = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, parseFloat(v) || 0])
  );

  const usedAxle2 =
    parsed.hinadan * influences2.hinadan +
    parsed.chukan1 * influences2.chukan1 +
    parsed.chukan2 * influences2.chukan2 +
    parsed.koubu * influences2.koubu;

  const usedAxle3 =
    parsed.chukan2 * influences3.chukan2 +
    parsed.koubu * influences3.koubu;

  const usedTotal =
    parsed.hinadan + parsed.chukan1 + parsed.chukan2 + parsed.koubu;

  const remainAxle2 = Math.max(0, MAX_AXLE2 - usedAxle2);
  const remainAxle3 = Math.max(0, MAX_AXLE3 - usedAxle3);
  const remainTotal = Math.max(0, MAX_TOTAL - usedTotal);

  const empty = ["chukan1", "chukan2", "koubu"].filter((k) => !weights[k]);

  const targetRatios = {
    chukan1: 4867 / 19700,
    chukan2: 4844 / 19700,
    koubu: 5109 / 19700,
  };

  const recommendations = {};
  if (empty.length > 0) {
    const sum = empty.reduce((acc, key) => acc + targetRatios[key], 0);
    empty.forEach((key) => {
      recommendations[key] = Math.round((remainTotal * targetRatios[key]) / sum);
    });
  }

  const fields = [
    { id: "hinadan", label: "ひな壇（kg）" },
    { id: "chukan1", label: "中間①（kg）" },
    { id: "chukan2", label: "中間②（kg）" },
    { id: "koubu", label: "後部（kg）" },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>

      {fields.map(({ id, label }, i) => (
        <div key={id} style={{ marginBottom: "1rem" }}>
          <label>
            {label}
            <input
              type="number"
              value={weights[id]}
              onChange={(e) => setWeights({ ...weights, [id]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const nextField = fields[i + 1]?.id;
                  if (nextField) {
                    document.getElementById(nextField)?.focus();
                  }
                }
              }}
              id={id}
              style={{ marginLeft: "0.5rem" }}
            />
            <button
              onClick={() => setWeights({ ...weights, [id]: "" })}
              style={{ marginLeft: "0.5rem" }}
            >
              ✖
            </button>
          </label>
        </div>
      ))}

      <div>
        <strong>現在の第2軸荷重：</strong> {Math.round(usedAxle2).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の第3軸荷重：</strong> {Math.round(usedAxle3).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong> {remainAxle2.toLocaleString()}kg（第2軸） ／ {remainAxle3.toLocaleString()}kg（第3軸）
      </div>

      {empty.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{empty.map((e) => fields.find(f => f.id === e).label).join(", ")}</strong> が未入力です
        </div>
      )}

      {empty.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>目安積載量（全体19700kg配分）：</strong>
          <ul>
            {Object.entries(recommendations).map(([k, v]) => (
              <li key={k}>{fields.find(f => f.id === k).label}：{v.toLocaleString()}kg</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
