import React, { useState, useRef } from "react";

export default function App() {
  const MAX_AXLE = 10000;
  const MAX_TOTAL = 19700;

  const INITIAL_ROWS = [
    { name: "ひな壇", base: 3700, coeffs: [1,1,1,1,1,1,1,1], impact: 1.0 },
    { name: "中間①", base: 4100, coeffs: [1,1,1,1,1,1,1,1], impact: 0.8 },
    { name: "中間②", base: 4100, coeffs: [1,1,1,1,1,1,1,1], impact: 0.4 },
    { name: "後部", base: 3800, coeffs: [1,1,1,1,1,1,1,1], impact: -0.3 },
  ];

  const [data, setData] = useState(INITIAL_ROWS.map(() => Array(8).fill("")));
  const inputRefs = useRef([]);

  const handleChange = (a, s, v) => {
    const nd = [...data]; nd[a][s] = v; setData(nd);
  };

  const getAreaWeight = (a) => data[a].reduce((sum, val, i) => {
    const n = parseFloat(val);
    return isNaN(n) ? sum : sum + n * INITIAL_ROWS[a].coeffs[i];
  }, 0);

  const getTotalWeight = () => data.reduce((sum, _, a) => sum + getAreaWeight(a), 0);
  const getAxleLoad = () => data.reduce((sum, _, a) => sum + getAreaWeight(a) * INITIAL_ROWS[a].impact, 0);
  const getSuggestedWeight = (a) => Math.max(0, INITIAL_ROWS[a].base - getAreaWeight(a));

  return (
    <div style={{ width: "1000px", margin: "0 auto", fontSize: "14px" }}>
      <h2>リフト重量記録（最大26便）</h2>
      <div><label>便名：<input type="text" /></label></div>

      {INITIAL_ROWS.map((row, a) => (
        <div key={a} style={{ marginTop: "20px" }}>
          <h3>{row.name}（{row.base.toLocaleString()}kg）</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", columnGap: "8px", rowGap: "4px" }}>
            {data[a].map((v, s) => (
              <div key={s} style={{ whiteSpace: "nowrap" }}>
                <label>
                  {s < 4 ? "助手席荷重" : "運転席荷重"}{s % 4 + 1}：
                  <input
                    type="number"
                    value={v}
                    onChange={(e) => handleChange(a, s, e.target.value)}
                    ref={(el) => inputRefs.current[a * 8 + s] = el}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const n = a * 8 + s + 1;
                        inputRefs.current[n]?.focus();
                      }
                    }}
                    style={{ width: "80px" }}
                  />
                </label>
              </div>
            ))}
          </div>
          <div>
            ← エリア合計: {getAreaWeight(a).toLocaleString()}kg
            <span style={{ color: "blue" }}>（目安: {getSuggestedWeight(a).toLocaleString()}kg）</span>
          </div>
        </div>
      ))}

      <div style={{ marginTop: "30px" }}>
        <strong>■ 第2軸荷重:</strong> {getAxleLoad().toLocaleString()}kg / {MAX_AXLE.toLocaleString()}kg
      </div>
      <div>
        <strong>■ 合計重量:</strong> {getTotalWeight().toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg
      </div>
    </div>
  );
}
