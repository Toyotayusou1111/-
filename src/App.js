import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間①: "",
    中間②: "",
    後部: "",
  });

  // 正しい影響係数（参考データより）
  const influences = {
    "第2軸": {
      ひな壇: 0.6,
      中間①: 0.8,
      中間②: 0.5,
      後部: 0.2,
    },
    "第3軸": {
      ひな壇: 0.0,
      中間①: 0.2,
      中間②: 0.5,
      後部: 0.8,
    },
  };

  const MAX_AXLE2 = 10000;
  const MAX_AXLE3 = 20000;
  const MAX_TOTAL = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  // 軸ごとの荷重計算
  const axle2Load = Object.entries(parsedWeights).reduce(
    (sum, [key, val]) => sum + val * influences["第2軸"][key],
    0
  );
  const axle3Load = Object.entries(parsedWeights).reduce(
    (sum, [key, val]) => sum + val * influences["第3軸"][key],
    0
  );

  const totalUsed = Object.values(parsedWeights).reduce((a, b) => a + b, 0);
  const remainingAxle2 = Math.max(0, MAX_AXLE2 - axle2Load);
  const remainingAxle3 = Math.max(0, MAX_AXLE3 - axle3Load);
  const remainingTotal = Math.max(0, MAX_TOTAL - totalUsed);

  const keys = ["ひな壇", "中間①", "中間②", "後部"];
  const empty = keys.filter((k) => !weights[k]);

  // 推奨配分（2軸10t & 3軸20t かつ合計19.7t内に収まるバランス）
  const recommended = {};
  if (empty.length > 0 && remainingTotal > 0) {
    const baseRatios = {
      ひな壇: 0.188,
      中間①: 0.208,
      中間②: 0.325,
      後部: 0.279,
    };

    const totalRatio = empty.reduce((sum, key) => sum + baseRatios[key], 0);
    empty.forEach((key) => {
      recommended[key] = Math.round((remainingTotal * baseRatios[key]) / totalRatio);
    });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
      {keys.map((key) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key}（kg）：
            <input
              type="number"
              value={weights[key]}
              onChange={(e) => setWeights({ ...weights, [key]: e.target.value })}
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
        {Math.round(axle2Load).toLocaleString()}kg
      </div>
      <div>
        <strong>現在の第3軸荷重：</strong>
        {Math.round(axle3Load).toLocaleString()}kg
      </div>
      <div>
        <strong>あと積める目安：</strong>
        {Math.round(remainingAxle2).toLocaleString()}kg（第2軸） ／{" "}
        {Math.round(remainingAxle3).toLocaleString()}kg（第3軸）
      </div>

      {empty.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{empty.join("、")}</strong> が未入力です
        </div>
      )}

      {empty.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>各エリア別 積載目安（第2軸10t & 合計19700kg範囲）</strong>
          <ul>
            {Object.entries(recommended).map(([key, val]) => (
              <li key={key}>
                {key}：{val.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
