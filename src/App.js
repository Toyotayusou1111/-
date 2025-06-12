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

  const areaLabels = [
    { key: "ひな壇", label: "ひな壇（3,700kg）" },
    { key: "中間1", label: "中間①（4,100kg）" },
    { key: "中間2", label: "中間②（6,400kg）" },
    { key: "後部", label: "後部（5,500kg）" },
  ];

  const initialEntry = {
    便名: "",
    ひな壇: Array(4).fill({ left: "", right: "" }),
    中間1: Array(4).fill({ left: "", right: "" }),
    中間2: Array(4).fill({ left: "", right: "" }),
    後部: Array(4).fill({ left: "", right: "" }),
  };

  const [entry, setEntry] = useState(initialEntry);

  const updateCell = (area, index, side, value) => {
    const updatedArea = [...entry[area]];
    updatedArea[index] = { ...updatedArea[index], [side]: value };
    setEntry({ ...entry, [area]: updatedArea });
  };

  const parseValue = (val) => parseFloat(val) || 0;

  const calculateAreaTotal = (area) => {
    return entry[area].reduce(
      (sum, row) => sum + parseValue(row.left) + parseValue(row.right),
      0
    );
  };

  const calculateAxleWeight = () => {
    const values = Object.fromEntries(
      areaLabels.map(({ key }) => [key, calculateAreaTotal(key)])
    );
    return (
      values.ひな壇 * influences.ひな壇 +
      values.中間1 * influences.中間1 +
      values.中間2 * influences.中間2 +
      values.後部 * influences.後部 +
      INTERCEPT
    );
  };

  const totalWeight = areaLabels.reduce(
    (sum, { key }) => sum + calculateAreaTotal(key),
    0
  );
  const axleWeight = calculateAxleWeight();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>リフト重量記録（便単位）</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          便名：
          <input
            type="text"
            value={entry.便名}
            onChange={(e) => setEntry({ ...entry, 便名: e.target.value })}
            style={{ marginLeft: "0.5rem", width: "120px" }}
          />
        </label>
      </div>

      {areaLabels.map(({ key, label }) => (
        <div key={key} style={{ marginBottom: "1.5rem" }}>
          <h4>{label}</h4>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
              <label>
                助手席側{i + 1}：
                <input
                  type="number"
                  value={entry[key][i]?.left || ""}
                  onChange={(e) => updateCell(key, i, "left", e.target.value)}
                  style={{ width: "60px" }}
                />
              </label>
              <label>
                運転席側{i + 1}：
                <input
                  type="number"
                  value={entry[key][i]?.right || ""}
                  onChange={(e) => updateCell(key, i, "right", e.target.value)}
                  style={{ width: "60px" }}
                />
              </label>
            </div>
          ))}
          <div>
            ⇒ エリア合計：<strong>{Math.round(calculateAreaTotal(key)).toLocaleString()}kg</strong>
          </div>
        </div>
      ))}

      <hr />
      <div style={{ marginTop: "1rem" }}>
        <strong>第2軸荷重：</strong> {Math.round(axleWeight).toLocaleString()}kg
      </div>
      <div>
        <strong>総積載量：</strong> {Math.round(totalWeight).toLocaleString()}kg
      </div>
    </div>
  );
}
