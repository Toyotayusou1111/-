import React, { useState, useRef } from "react";

export default function App() {
  const MAX_AXLE = 10000;
  const MAX_TOTAL = 19700;

  const INITIAL_ROWS = [
    { name: "ひな壇", base: 3700, coeffs: [1, 1, 1, 1, 1, 1, 1, 1], impact: 1.0 },
    { name: "中間①", base: 4100, coeffs: [1, 1, 1, 1, 1, 1, 1, 1], impact: 0.8 },
    { name: "中間②", base: 4100, coeffs: [1, 1, 1, 1, 1, 1, 1, 1], impact: 0.4 },
    { name: "後部", base: 3800, coeffs: [1, 1, 1, 1, 1, 1, 1, 1], impact: -0.3 },
  ];

  const [data, setData] = useState(
    INITIAL_ROWS.map((row) => Array(8).fill(""))
  );

  const inputRefs = useRef([]);

  const handleChange = (areaIndex, seatIndex, value) => {
    const newData = [...data];
    newData[areaIndex][seatIndex] = value;
    setData(newData);
  };

  const getAreaWeight = (areaIndex) => {
    return data[areaIndex].reduce((sum, val, i) => {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        return sum + num * INITIAL_ROWS[areaIndex].coeffs[i];
      }
      return sum;
    }, 0);
  };

  const getTotalWeight = () => {
    return data.reduce(
      (sum, row, areaIndex) => sum + getAreaWeight(areaIndex),
      0
    );
  };

  const getAxleLoad = () => {
    return data.reduce((sum, row, areaIndex) => {
      const areaWeight = getAreaWeight(areaIndex);
      return sum + areaWeight * INITIAL_ROWS[areaIndex].impact;
    }, 0);
  };

  const getSuggestedWeight = (areaIndex) => {
    const remainingAxle = MAX_AXLE - getAxleLoad();
    const remainingTotal = MAX_TOTAL - getTotalWeight();
    const impact = INITIAL_ROWS[areaIndex].impact;
    if (impact === 0) return 0;

    const maxByAxle = remainingAxle / impact;
    return Math.floor(Math.min(maxByAxle, remainingTotal));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>リフト重量記録（最大26便）</h2>
      <div>
        <label>便名：</label>
        <input type="text" />
      </div>

      {INITIAL_ROWS.map((row, areaIndex) => (
        <div key={areaIndex} style={{ marginTop: 20 }}>
          <h3>
            {row.name}（{row.base.toLocaleString()}kg）
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {data[areaIndex].map((val, seatIndex) => (
              <div key={seatIndex} style={{ margin: 5 }}>
                <label>
                  {seatIndex < 4 ? "助手席荷重" : "運転席荷重"}{seatIndex % 4 + 1}：
                  <input
                    type="number"
                    value={val}
                    onChange={(e) =>
                      handleChange(areaIndex, seatIndex, e.target.value)
                    }
                    ref={(el) =>
                      (inputRefs.current[areaIndex * 8 + seatIndex] = el)
                    }
                    style={{ width: 80 }}
                  />
                </label>
              </div>
            ))}
          </div>
          <div>
            ← エリア合計: {getAreaWeight(areaIndex).toLocaleString()}kg　
            <span style={{ color: "blue" }}>
              （目安: {getSuggestedWeight(areaIndex).toLocaleString()}kg）
            </span>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 30 }}>
        <strong>■ 第2軸荷重:</strong> {getAxleLoad().toLocaleString()}kg
      </div>
      <div>
        <strong>■ 合計重量:</strong> {getTotalWeight().toLocaleString()}kg
      </div>
    </div>
  );
}
