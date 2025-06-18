import React, { useState, useRef } from "react";

export default function App() {
  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;

  const areaLabels = [
    { key: "ひな壇", label: "ひな壇" },
    { key: "中間1", label: "中間①" },
    { key: "中間2", label: "中間②" },
    { key: "後部", label: "後部" },
  ];

  const defaultRow = () => Array(4).fill({ left: "", right: "" });

  const initialEntry = () => ({
    便名: "",
    ひな壇: defaultRow(),
    中間1: defaultRow(),
    中間2: defaultRow(),
    後部: defaultRow(),
  });

  const [entries, setEntries] = useState([initialEntry()]);
  const inputRefs = useRef({});

  const parseValue = (val) => parseFloat(val) || 0;

  const calculateAreaTotal = (entry, area) => {
    return entry[area].reduce(
      (sum, row) => sum + parseValue(row.left) + parseValue(row.right),
      0
    );
  };

  const calculateTotals = (entry) => {
    const hinadan = calculateAreaTotal(entry, "ひな壇");
    const chukan1 = calculateAreaTotal(entry, "中間1");
    const chukan2 = calculateAreaTotal(entry, "中間2");
    const koubu = calculateAreaTotal(entry, "後部");

    const axleWeight =
      hinadan * 0.0728403 +
      chukan1 * -0.07967846 +
      chukan2 * -0.7294105 +
      koubu * 1.736249 +
      0;

    const totalWeight = hinadan + chukan1 + chukan2 + koubu;

    return { axleWeight, totalWeight };
  };

  const updateCell = (entryIdx, area, rowIdx, side, value) => {
    const updated = [...entries];
    updated[entryIdx][area][rowIdx][side] = value;
    setEntries(updated);
  };

  const handleKeyDown = (e, entryIdx, area, rowIdx, side) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const areaIndex = areaLabels.findIndex((a) => a.key === area);
      let nextArea = area;
      let nextRow = rowIdx;
      let nextSide = side;

      if (side === "left") {
        nextSide = "right";
      } else {
        nextRow = rowIdx + 1;
        nextSide = "left";
        if (nextRow >= 4) {
          nextRow = 0;
          nextArea = areaLabels[(areaIndex + 1) % areaLabels.length].key;
        }
      }

      const refKey = `${entryIdx}-${nextArea}-${nextRow}-${nextSide}`;
      const nextInput = inputRefs.current[refKey];
      if (nextInput) nextInput.focus();
    }
  };

  const clearCell = (entryIdx, area, rowIdx, side) => {
    updateCell(entryIdx, area, rowIdx, side, "");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>リフト重量記録（最大26便）</h2>
      {entries.map((entry, entryIdx) => {
        const { axleWeight, totalWeight } = calculateTotals(entry);

        return (
          <div key={entryIdx} style={{ marginBottom: "2rem" }}>
            <label>
              便名：
              <input
                type="text"
                value={entry.便名}
                onChange={(e) => {
                  const updated = [...entries];
                  updated[entryIdx].便名 = e.target.value;
                  setEntries(updated);
                }}
                style={{ marginLeft: "0.5rem" }}
              />
            </label>

            {areaLabels.map(({ key, label }) => {
              const areaTotal = calculateAreaTotal(entry, key);

              return (
                <div key={key} style={{ marginTop: "1rem" }}>
                  <strong>{label}</strong>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i}>
                      <label>
                        助手席荷重{i + 1}：
                        <input
                          type="number"
                          value={entry[key][i].left}
                          onChange={(e) =>
                            updateCell(entryIdx, key, i, "left", e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, entryIdx, key, i, "left")
                          }
                          ref={(el) =>
                            (inputRefs.current[
                              `${entryIdx}-${key}-${i}-left`
                            ] = el)
                          }
                          style={{ width: "80px", marginLeft: "4px" }}
                        />
                        <button onClick={() => clearCell(entryIdx, key, i, "left")}>×</button>
                      </label>
                      <label style={{ marginLeft: "1rem" }}>
                        運転席荷重{i + 1}：
                        <input
                          type="number"
                          value={entry[key][i].right}
                          onChange={(e) =>
                            updateCell(entryIdx, key, i, "right", e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, entryIdx, key, i, "right")
                          }
                          ref={(el) =>
                            (inputRefs.current[
                              `${entryIdx}-${key}-${i}-right`
                            ] = el)
                          }
                          style={{ width: "80px", marginLeft: "4px" }}
                        />
                        <button onClick={() => clearCell(entryIdx, key, i, "right")}>×</button>
                      </label>
                    </div>
                  ))}
                  <div style={{ marginTop: "0.5rem" }}>
                    ← エリア合計: <strong>{areaTotal.toLocaleString()}kg</strong>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: "1rem" }}>
              <strong>第2軸荷重：</strong> {Math.round(axleWeight).toLocaleString()}kg / {MAX_AXLE_LOAD.toLocaleString()}kg
            </div>
            <div>
              <strong>総積載量：</strong> {Math.round(totalWeight).toLocaleString()}kg / {MAX_TOTAL_LOAD.toLocaleString()}kg
            </div>
          </div>
        );
      })}
    </div>
  );
}
