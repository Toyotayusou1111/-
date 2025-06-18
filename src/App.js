// 修正済みの App.js 全コード
import React, { useState, useRef } from "react";
import { db, collection, addDoc, serverTimestamp } from "./firebase";

export default function App() {
  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;
  const influences = {
    ひな壇: 0.6817,
    中間1: 0.6070,
    中間2: 0.0975,
    後部: 0.0433,
  };
  const INTERCEPT = 3317.33;

  const areaLabels = ["ひな壇", "中間1", "中間2", "後部"];

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

  const updateCell = (entryIdx, area, index, side, value) => {
    const updatedEntries = [...entries];
    const areaRows = [...updatedEntries[entryIdx][area]];
    areaRows[index] = { ...areaRows[index], [side]: value };
    updatedEntries[entryIdx][area] = areaRows;
    setEntries(updatedEntries);
  };

  const calculateAreaTotal = (entry, area) => {
    return entry[area].reduce(
      (sum, row) => sum + parseValue(row.left) + parseValue(row.right),
      0
    );
  };

  const calculateTotals = (entry) => {
    const totalWeight = areaLabels.reduce(
      (sum, key) => sum + calculateAreaTotal(entry, key),
      0
    );
    const axleWeight =
      calculateAreaTotal(entry, "ひな壇") * influences["ひな壇"] +
      calculateAreaTotal(entry, "中間1") * influences["中間1"] +
      calculateAreaTotal(entry, "中間2") * influences["中間2"] +
      calculateAreaTotal(entry, "後部") * influences["後部"] +
      INTERCEPT;
    return { totalWeight, axleWeight };
  };

  const handleKeyDown = (e, entryIdx, area, rowIdx, side) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextField = (() => {
        const areaIdx = areaLabels.indexOf(area);
        if (side === "left") return [entryIdx, area, rowIdx, "right"];
        if (rowIdx < 3) return [entryIdx, area, rowIdx + 1, "left"];
        if (areaIdx < areaLabels.length - 1)
          return [entryIdx, areaLabels[areaIdx + 1], 0, "left"];
        if (entryIdx < entries.length - 1)
          return [entryIdx + 1, "ひな壇", 0, "left"];
        return null;
      })();

      if (nextField) {
        const [ei, ak, ri, sd] = nextField;
        const refKey = `${ei}-${ak}-${ri}-${sd}`;
        const nextInput = inputRefs.current[refKey];
        if (nextInput) nextInput.focus();
      }
    }
  };

  const addEntry = () => {
    if (entries.length < 26) {
      setEntries([...entries, initialEntry()]);
    }
  };

  const saveToCloud = async (entry) => {
    const { totalWeight, axleWeight } = calculateTotals(entry);
    const data = {
      便名: entry.便名,
      timestamp: serverTimestamp(),
      totalWeight,
      axleWeight,
    };
    areaLabels.forEach((key) => {
      data[key] = entry[key];
    });
    try {
      await addDoc(collection(db, "liftLogs"), data);
      alert("✅ クラウドに保存しました");
    } catch (err) {
      alert("❌ 保存に失敗しました");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>リフト重量記録</h2>
      {entries.map((entry, entryIdx) => {
        const { axleWeight, totalWeight } = calculateTotals(entry);
        return (
          <div
            key={entryIdx}
            style={{
              marginBottom: "2rem",
              borderBottom: "1px solid #ccc",
              paddingBottom: "1rem",
            }}
          >
            <div>
              <label>
                便名：
                <input
                  value={entry.便名}
                  onChange={(e) => {
                    const updated = [...entries];
                    updated[entryIdx].便名 = e.target.value;
                    setEntries(updated);
                  }}
                  style={{ marginLeft: "0.5rem", width: "120px" }}
                />
              </label>
            </div>
            {areaLabels.map((key) => (
              <div key={key} style={{ marginTop: "1rem" }}>
                <h4>{key}</h4>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: "1rem" }}>
                    <input
                      ref={(el) =>
                        (inputRefs.current[`${entryIdx}-${key}-${i}-left`] = el)
                      }
                      type="number"
                      value={entry[key][i]?.left || ""}
                      onChange={(e) =>
                        updateCell(entryIdx, key, i, "left", e.target.value)
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, entryIdx, key, i, "left")
                      }
                    />
                    <input
                      ref={(el) =>
                        (inputRefs.current[`${entryIdx}-${key}-${i}-right`] = el)
                      }
                      type="number"
                      value={entry[key][i]?.right || ""}
                      onChange={(e) =>
                        updateCell(entryIdx, key, i, "right", e.target.value)
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, entryIdx, key, i, "right")
                      }
                    />
                  </div>
                ))}
                <div>
                  合計: {Math.round(calculateAreaTotal(entry, key)).toLocaleString()} kg
                </div>
              </div>
            ))}
            <div>
              <strong>第2軸荷重：</strong> {Math.round(axleWeight).toLocaleString()} kg
            </div>
            <div>
              <strong>総重量：</strong> {Math.round(totalWeight).toLocaleString()} kg
            </div>
            <button onClick={() => saveToCloud(entry)}>☁ クラウド保存</button>
          </div>
        );
      })}
      <button onClick={addEntry}>＋便を追加</button>
    </div>
  );
}
