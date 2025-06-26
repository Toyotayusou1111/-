// === App.js（UI固定・最適重量自動計算） ===
import React, { useState, useEffect } from "react";

const AREA_INFO = [
  { name: "ひな壇", max: 3700, id: "hinadan" },
  { name: "中間①", max: 4100, id: "chukan1" },
  { name: "中間②", max: 6400, id: "chukan2" },
  { name: "後部", max: 5500, id: "koubu" },
];

export default function App() {
  const [weights, setWeights] = useState({});
  const [optimal, setOptimal] = useState({});

  const totalWeight = Object.values(weights).flat().reduce((a, b) => a + (parseFloat(b) || 0), 0);

  const secondAxleLoad = ["chukan2", "koubu"].reduce(
    (sum, key) => sum + ((weights[key]?.reduce((a, b) => a + (parseFloat(b) || 0), 0) || 0) * 0.9),
    0
  );

  const updateWeight = (areaId, index, value) => {
    setWeights((prev) => {
      const newArea = [...(prev[areaId] || [])];
      newArea[index] = value;
      return { ...prev, [areaId]: newArea };
    });
  };

  useEffect(() => {
    const filled = AREA_INFO.map((area) => {
      return {
        id: area.id,
        sum: (weights[area.id] || []).reduce((a, b) => a + (parseFloat(b) || 0), 0),
      };
    });

    const usedWeight = filled.reduce((sum, a) => sum + a.sum, 0);
    const remain = 19700 - usedWeight;
    const remain2axle = 10000 - secondAxleLoad;

    const defaultRatio = {
      chukan1: 0.25,
      chukan2: 0.45,
      koubu: 0.3,
    };

    const h = filled.find((f) => f.id === "hinadan")?.sum || 0;
    const o = {};
    let avail = 19700 - h;
    let axleAvail = 10000;
    o.chukan1 = Math.min(4100, Math.floor(avail * defaultRatio.chukan1));
    o.chukan2 = Math.min(6400, Math.floor(Math.min(avail * defaultRatio.chukan2, axleAvail * 0.5)));
    o.koubu = Math.min(5500, Math.floor(Math.min(avail * defaultRatio.koubu, axleAvail * 0.5)));
    o.hinadan = Math.min(3700, h);

    setOptimal(o);
  }, [weights]);

  return (
    <div style={{ padding: 20 }}>
      <h2>リフト重量記録（最大26便）</h2>
      {AREA_INFO.map((area) => (
        <div key={area.id} style={{ marginBottom: 30 }}>
          <strong>{area.name}（{area.max.toLocaleString()}kg）</strong>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="number"
                value={weights[area.id]?.[i] || ""}
                onChange={(e) => updateWeight(area.id, i, e.target.value)}
                style={{ width: 80, marginRight: 6, marginTop: 6 }}
              />
            ))}
          </div>
          <div>← エリア合計: {(weights[area.id]?.reduce((a, b) => a + (parseFloat(b) || 0), 0) || 0).toLocaleString()}kg</div>
          <div>→ 積載目安: {optimal[area.id]?.toLocaleString() || 0}kg</div>
        </div>
      ))}
      <hr />
      <div>第2軸荷重: {Math.round(secondAxleLoad).toLocaleString()} / 10,000kg</div>
      <div>総積載量: {totalWeight.toLocaleString()} / 19,700kg</div>
    </div>
  );
}
