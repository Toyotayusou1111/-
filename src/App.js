import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間①: "",
    中間②: "",
    後部: "",
  });

  // 各エリアの2軸・3軸への影響係数（実測値に基づく）
  const influences2 = {
    ひな壇: 0.4,
    中間①: 0.7,
    中間②: 0.6,
    後部: 0.3,
  };
  const influences3 = {
    ひな壇: 0.0,
    中間①: 0.3,
    中間②: 0.6,
    後部: 0.8,
  };

  const MAX_AXLE2 = 10000;
  const MAX_AXLE3 = 20000;
  const MAX_TOTAL = 19700;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, parseFloat(v) || 0])
  );

  const usedAxle2 = Object.entries(parsedWeights).reduce(
    (sum, [k, v]) => sum + v * influences2[k],
    0
  );
  const usedAxle3 = Object.entries(parsedWeights).reduce(
    (sum, [k, v]) => sum + v * influences3[k],
    0
  );
  const usedTotal = Object.values(parsedWeights).reduce((a, b) => a + b, 0);

  const remainAxle2 = Math.max(0, MAX_AXLE2 - usedAxle2);
  const remainAxle3 = Math.max(0, MAX_AXLE3 - usedAxle3);
  const remainTotal = Math.max(0, MAX_TOTAL - usedTotal);

  const emptyAreas = Object.keys(weights).filter((k) => !weights[k]);

  const recommended = {};
  if (emptyAreas.length > 0 && remainTotal > 0) {
    const ratios = {
      ひな壇: 0.188,
      中間①: 0.296,
      中間②: 0.338,
      後部: 0.278,
    };

    const ratioSum = emptyAreas.reduce((sum, k) => sum + ratios[k], 0);
    const raw = Object.fromEntries(
      emptyAreas.map((k) => [
        k,
        remainTotal * (ratios[k] / ratioSum)
      ])
    );

    const testAxle2 = Object.entries(raw).reduce(
      (sum, [k, v]) => sum + v * influences2[k],
      usedAxle2
    );
    const testAxle3 = Object.entries(raw).reduce(
      (sum, [k, v]) => sum + v * influences3[k],
      usedAxle3
    );
    const scale2 = MAX_AXLE2 / testAxle2;
    const scale3 = MAX_AXLE3 / testAxle3;
    const finalScale = Math.min(1, scale2, scale3);

    emptyAreas.forEach((k) => {
      recommended[k] = Math.round(raw[k] * finalScale);
    });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
      {Object.keys(weights).map((key) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label>
            {key}（kg）：
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
        {Math.round(remainAxle2).toLocaleString()}kg（第2軸） ／{" "}
        {Math.round(remainAxle3).toLocaleString()}kg（第3軸）
      </div>
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          👉 <strong>{emptyAreas.join(", ")}</strong> が未入力です
        </div>
      )}
      {emptyAreas.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>各エリア別 積載目安（第2軸10t & 第3軸20t & 合計19700kg内）</strong>
          <ul>
            {Object.entries(recommended).map(([k, v]) => (
              <li key={k}>
                {k}：{v.toLocaleString()}kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
