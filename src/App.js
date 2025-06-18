import React, { useState, useEffect } from "react";

const AREA_NAMES = ["ひな壇", "中間①", "中間②", "後部"];
const AREA_CAPACITY = [3700, 4100, 6400, 5500];     // 定格積載
const AXLE2_COEFF = [0.45, 0.58, 0.66, 0.72];       // 第2軸への係数
const MAX_TOTAL = 19700;
const MAX_AXLE2 = 10000;
const SEATS = 8;                                    // 各エリア入力欄数（助手4+運転4）

export default function App() {
  const [weights, setWeights] = useState(
    Array(4).fill().map(() => Array(SEATS).fill(""))
  );

  const [areaTotals, setAreaTotals] = useState([0, 0, 0, 0]);
  const [suggested, setSuggested] = useState([0, 0, 0, 0]);
  const [axle2Total, setAxle2Total] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    const newAreaTotals = weights.map(area =>
      area.reduce((sum, v) => sum + (+v || 0), 0)
    );
    setAreaTotals(newAreaTotals);

    const axle2 = newAreaTotals.reduce(
      (sum, w, i) => sum + w * AXLE2_COEFF[i], 0
    );
    setAxle2Total(Math.round(axle2));

    const total = newAreaTotals.reduce((a, b) => a + b, 0);
    setGrandTotal(total);

    setSuggested(
      calcSuggestedWeights(newAreaTotals, axle2, total)
    );
  }, [weights]);

  const calcSuggestedWeights = (currTotals, axle2Now, totalNow) => {
    const s = [0, 0, 0, 0];
    let remTotal = MAX_TOTAL - totalNow;
    let remAxle2 = MAX_AXLE2 - axle2Now;
    if (remTotal <= 0 || remAxle2 <= 0) return s;

    const priority = [3, 2, 1]; // 後部→中②→中①
    for (const i of priority) {
      if (currTotals[i] !== 0) continue;
      const maxCap = AREA_CAPACITY[i];
      const maxAxle2 = remAxle2 / AXLE2_COEFF[i];
      const canAdd = Math.floor(Math.min(maxCap, remTotal, maxAxle2));
      s[i] = canAdd;
      remTotal -= canAdd;
      remAxle2 -= canAdd * AXLE2_COEFF[i];
      if (remTotal <= 0 || remAxle2 <= 0) break;
    }
    return s;
  };

  const handleChange = (areaIdx, seatIdx, value) => {
    setWeights(prev => {
      const next = prev.map(row => [...row]);
      next[areaIdx][seatIdx] = value;
      return next;
    });
  };

  return (
    <div>
      <h2>リフト重量記録（最大26便）</h2>

      {AREA_NAMES.map((name, areaIdx) => (
        <div key={areaIdx}>
          <b>{name}（{AREA_CAPACITY[areaIdx].toLocaleString()}kg）</b>
          <br />
          {Array(SEATS).fill().map((_, seatIdx) => (
            <input
              key={seatIdx}
              type="number"
              value={weights[areaIdx][seatIdx]}
              onChange={e =>
                handleChange(areaIdx, seatIdx, e.target.value)
              }
              style={{ width: "60px", margin: "2px" }}
            />
          ))}
          <br />
          ← エリア合計: {areaTotals[areaIdx].toLocaleString()}kg
          {areaTotals[areaIdx] === 0 && suggested[areaIdx] > 0 && (
            <>（推奨 {suggested[areaIdx].toLocaleString()}kg）</>
          )}
          <br /><br />
        </div>
      ))}

      <div>
        第2軸荷重: {axle2Total.toLocaleString()}kg / {MAX_AXLE2.toLocaleString()}kg
      </div>
      <div>
        総積載: {grandTotal.toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg
      </div>
    </div>
  );
}
