import React, { useState } from "react";

export default function App() {
  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const influences = {
    ひな壇: 1.2006,
    中間1: 0.3345,
    中間2: 0.1491,
    後部: -0.2180,
  };

  const INTERCEPT = 3554.87;
  const areas = ["ひな壇", "中間1", "中間2", "後部"];

  const [entries, setEntries] = useState([
    { ひな壇: "", 中間1: "", 中間2: "", 後部: "" },
  ]);

  const addEntry = () => {
    if (entries.length < 26) {
      setEntries([...entries, { ひな壇: "", 中間1: "", 中間2: "", 後部: "" }]);
    }
  };

  const updateEntry = (index, key, value) => {
    const updated = [...entries];
    updated[index][key] = value;
    setEntries(updated);
  };

  const calculate = (entry) => {
    const parsed = Object.fromEntries(
      Object.entries(entry).map(([k, v]) => [k, parseFloat(v) || 0])
    );
    const usedLoad =
      parsed.ひな壇 * influences.ひな壇 +
      parsed.中間1 * influences.中間1 +
      parsed.中間2 * influences.中間2 +
      parsed.後部 * influences.後部 +
      INTERCEPT;
    const totalLoad =
      parsed.ひな壇 + parsed.中間1 + parsed.中間2 + parsed.後部;
    return {
      axle: Math.round(usedLoad),
      total: Math.round(totalLoad),
    };
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>1日分リフト積載記録ツール（最大26便）</h2>
      {entries.map((entry, idx) => {
        const result = calculate(entry);
        return (
          <div key={idx} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
            <h4>第{idx + 1}便</h4>
            {areas.map((area) => (
              <div key={area} style={{ marginBottom: "0.3rem" }}>
                <label>
                  {area}：
                  <input
                    type="number"
                    value={entry[area]}
                    onChange={(e) => updateEntry(idx, area, e.target.value)}
                    style={{ marginLeft: "0.5rem", width: "100px" }}
                  />
                </label>
              </div>
            ))}
            <div>第2軸荷重：<strong>{result.axle.toLocaleString()}kg</strong></div>
            <div>総積載量：<strong>{result.total.toLocaleString()}kg</strong></div>
          </div>
        );
      })}

      {entries.length < 26 && (
        <button onClick={addEntry} style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}>
          便を追加する
        </button>
      )}

      <h3 style={{ marginTop: "2rem" }}>▼ 記録一覧</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>便</th>
            {areas.map((a) => (
              <th key={a}>{a}</th>
            ))}
            <th>第2軸荷重</th>
            <th>総積載量</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const result = calculate(entry);
            return (
              <tr key={idx}>
                <td>{idx + 1}</td>
                {areas.map((a) => (
                  <td key={a}>{entry[a]}</td>
                ))}
                <td>{result.axle}</td>
                <td>{result.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
