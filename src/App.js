import React, { useState, useRef } from "react";
import { db, collection, addDoc, serverTimestamp } from "./firebase";

export default function App() {
  const MAX_AXLE_LOAD = 10000;
  const MAX_TOTAL_LOAD = 19700;
  const influences = {
    ひな壇: 1.2006,
    中間1: 0.3345,
    中間2: 0.1491,
    後部: -0.218,
  };
  const INTERCEPT = 3554.87;

  const areaLabels = [
    { key: "ひな壇", label: "ひな壇（3,700kg）" },
    { key: "中間1", label: "中間①（4,100kg）" },
    { key: "中間2", label: "中間②（6,400kg）" },
    { key: "後部", label: "後部（5,500kg）" },
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

  const updateCell = (entryIdx, area, index, side, value) => {
    const updatedEntries = [...entries];
    const areaRows = [...updatedEntries[entryIdx][area]];
    areaRows[index] = { ...areaRows[index], [side]: value };
    updatedEntries[entryIdx][area] = areaRows;
    setEntries(updatedEntries);
  };

  const parseValue = (val) => parseFloat(val) || 0;

  const calculateAreaTotal = (entry, area) => {
    return entry[area].reduce(
      (sum, row) => sum + parseValue(row.left) + parseValue(row.right),
      0
    );
  };

  const calculateTotals = (entry) => {
    const totalWeight = areaLabels.reduce(
      (sum, { key }) => sum + calculateAreaTotal(entry, key),
      0
    );
    const axleWeight =
      calculateAreaTotal(entry, "ひな壇") * influences.ひな壇 +
      calculateAreaTotal(entry, "中間1") * influences.中間1 +
      calculateAreaTotal(entry, "中間2") * influences.中間2 +
      calculateAreaTotal(entry, "後部") * influences.後部 +
      INTERCEPT;
    return { totalWeight, axleWeight };
  };

  const handleKeyDown = (e, entryIdx, area, rowIdx, side) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextField = (() => {
        const areaIdx = areaLabels.findIndex((a) => a.key === area);
        if (side === "left") return [entryIdx, area, rowIdx, "right"];
        if (rowIdx < 3) return [entryIdx, area, rowIdx + 1, "left"];
        if (areaIdx < areaLabels.length - 1)
          return [entryIdx, areaLabels[areaIdx + 1].key, 0, "left"];
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
    areaLabels.forEach(({ key }) => {
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
      <h2>リフト重量記録（最大26便）</h2>
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
            <div style={{ marginBottom: "1rem" }}>
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
                        onChange={(e) => updateCell(entryIdx, key, i, "left", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, entryIdx, key, i, "left")}
                        ref={(el) => (inputRefs.current[`${entryIdx}-${key}-${i}-left`] = el)}
                        style={{ width: "100px" }}
                      />
                    </label>
                    <label>
                      運転席側{i + 1}：
                      <input
                        type="number"
                        value={entry[key][i]?.right || ""}
                        onChange={(e) => updateCell(entryIdx, key, i, "right", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, entryIdx, key, i, "right")}
                        ref={(el) => (inputRefs.current[`${entryIdx}-${key}-${i}-right`] = el)}
                        style={{ width: "100px" }}
                      />
                    </label>
                  </div>
                ))}
                <div>
                  ⇒ エリア合計：<strong>{Math.round(calculateAreaTotal(entry, key)).toLocaleString()}kg</strong>
                </div>
              </div>
            ))}
            <div>
              <strong>第2軸荷重：</strong> {Math.round(axleWeight).toLocaleString()}kg
            </div>
            <div>
              <strong>総積載量：</strong> {Math.round(totalWeight).toLocaleString()}kg
            </div>
            <button
              onClick={() => saveToCloud(entry)}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              ☁ クラウド保存
            </button>
          </div>
        );
      })}
      {entries.length < 26 && (
        <button
          onClick={addEntry}
          style={{
            display: "block",
            marginTop: "1rem",
            marginLeft: "0",
            marginRight: "auto",
            padding: "0.75rem 1.25rem",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          ＋便を追加する
        </button>
      )}
    </div>
  );
}
