// === 修正済み React 全コード（積載目安ロジック完全版） ===

import React, { useState, useEffect } from "react";

const AREA_CONFIG = [
  { name: "ひな壇", limit: 3700, axleCoef: 1.0 },
  { name: "中間①", limit: 4100, axleCoef: 0.5 },
  { name: "中間②", limit: 6400, axleCoef: 0.3 },
  { name: "後部", limit: 5500, axleCoef: 0.1 },
];

const LiftInput = ({ index, data, onChange }) => {
  const handleChange = (e, i) => {
    const newValues = [...data.values];
    newValues[i] = Number(e.target.value);
    onChange(index, newValues);
  };
  const sum = data.values.reduce((acc, val) => acc + (val || 0), 0);
  return (
    <div>
      <h3>
        {data.name}（{data.limit.toLocaleString()}kg）
      </h3>
      {[...Array(4)].map((_, i) => (
        <input
          key={i}
          type="number"
          value={data.values[i] || ""}
          onChange={(e) => handleChange(e, i)}
        />
      ))}
      <div>← エリア合計: {sum.toLocaleString()}kg</div>
      <div>→ 積載目安: {data.suggest.toLocaleString()}kg</div>
    </div>
  );
};

export default function App() {
  const [areas, setAreas] = useState(
    AREA_CONFIG.map((area) => ({ ...area, values: [0, 0, 0, 0], suggest: area.limit }))
  );

  useEffect(() => {
    const usedTotal = areas.reduce(
      (acc, a) => acc + a.values.reduce((s, v) => s + (v || 0), 0),
      0
    );
    const usedAxle = areas.reduce(
      (acc, a) =>
        acc +
        a.values.reduce((s, v) => s + (v || 0), 0) * a.axleCoef,
      0
    );

    const remainTotal = 19700 - usedTotal;
    const remainAxle = 10000 - usedAxle;

    const newAreas = areas.map((a) => {
      const current = a.values.reduce((s, v) => s + (v || 0), 0);
      const remainLocal = Math.max(a.limit - current, 0);
      const limitByTotal = remainTotal;
      const limitByAxle = remainAxle / a.axleCoef;
      const logicalMax = Math.min(remainLocal, limitByTotal, limitByAxle);
      return {
        ...a,
        suggest: Math.max(Math.floor(logicalMax), 0),
      };
    });
    setAreas(newAreas);
  }, [areas.map((a) => a.values).flat().join(",")]);

  const handleAreaChange = (index, newValues) => {
    const newAreas = [...areas];
    newAreas[index].values = newValues;
    setAreas(newAreas);
  };

  const total = areas.reduce(
    (acc, a) => acc + a.values.reduce((s, v) => s + (v || 0), 0),
    0
  );
  const axleTotal = areas.reduce(
    (acc, a) => acc + a.values.reduce((s, v) => s + (v || 0), 0) * a.axleCoef,
    0
  );

  return (
    <div>
      <h2>リフト重量記録（最大26便）</h2>
      {areas.map((area, idx) => (
        <LiftInput key={idx} index={idx} data={area} onChange={handleAreaChange} />
      ))}
      <hr />
      <div>第2軸荷重: {axleTotal.toLocaleString()} / 10,000kg</div>
      <div>総積載: {total.toLocaleString()} / 19,700kg</div>
    </div>
  );
}
