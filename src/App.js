import React, { useState } from "react";
import { db, collection, addDoc, serverTimestamp } from "./firebase";

export default function App() {
  const initialData = [
    { id: 1, ひな壇: "", 中間1: "", 中間2: "", 後部: "", 区分: "助手席" },
    { id: 2, ひな壇: "", 中間1: "", 中間2: "", 後部: "", 区分: "運転席" },
  ];

  const influences = {
    ひな壇: 0.6,
    中間1: 0.8,
    中間2: 0.5,
    後部: 0.2,
  };

  const axleInfluence = {
    ひな壇: 0.9,
    中間1: 0.7,
    中間2: 0.4,
    後部: 0.1,
  };

  const [data, setData] = useState(initialData);

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const addEntry = () => {
    const newId = data.length + 1;
    const new区分 = newId % 2 === 1 ? "助手席" : "運転席";
    setData([
      ...data,
      { id: newId, ひな壇: "", 中間1: "", 中間2: "", 後部: "", 区分: new区分 },
    ]);
  };

  const calculateTotal = (row) => {
    return (
      (parseFloat(row.ひな壇) || 0) * influences.ひな壇 +
      (parseFloat(row.中間1) || 0) * influences.中間1 +
      (parseFloat(row.中間2) || 0) * influences.中間2 +
      (parseFloat(row.後部) || 0) * influences.後部
    );
  };

  const calculateAxle = (row) => {
    return (
      (parseFloat(row.ひな壇) || 0) * axleInfluence.ひな壇 +
      (parseFloat(row.中間1) || 0) * axleInfluence.中間1 +
      (parseFloat(row.中間2) || 0) * axleInfluence.中間2 +
      (parseFloat(row.後部) || 0) * axleInfluence.後部
    );
  };

  const totalWeight = data.reduce(
    (sum, row) => sum + calculateTotal(row),
    0
  ).toFixed(1);

  const totalAxle = data.reduce(
    (sum, row) => sum + calculateAxle(row),
    0
  ).toFixed(1);

  const handleSaveToCloud = async () => {
    try {
      await addDoc(collection(db, "liftLogs"), {
        timestamp: serverTimestamp(),
        entries: data,
        totalWeight: parseFloat(totalWeight),
        totalAxle: parseFloat(totalAxle),
      });
      alert("クラウドに保存しました！");
    } catch (e) {
      console.error("保存エラー:", e);
      alert("保存に失敗しました。");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Lift Log Cloud</h2>
      <div style={{ display: "flex", gap: "40px" }}>
        {["助手席", "運転席"].map((seatType) => (
          <div key={seatType} style={{ flex: 1 }}>
            <h3>{seatType}</h3>
            {data
              .filter((row) => row.区分 === seatType)
              .map((row, index) => (
                <div key={row.id} style={{ marginBottom: "12px", border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
                  {["ひな壇", "中間1", "中間2", "後部"].map((field) => (
                    <div key={field} style={{ marginBottom: "4px" }}>
                      <label>
                        {field}：
                        <input
                          type="number"
                          value={row[field]}
                          onChange={(e) =>
                            handleChange(
                              data.findIndex((r) => r.id === row.id),
                              field,
                              e.target.value
                            )
                          }
                          style={{ marginLeft: "5px", width: "80px" }}
                        />
                        kg
                      </label>
                    </div>
                  ))}
                  <div style={{ marginTop: "5px", fontSize: "14px" }}>
                    エリア重量：{calculateTotal(row).toFixed(1)} kg / 第2軸荷重：{calculateAxle(row).toFixed(1)} kg
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", fontSize: "16px" }}>
        <strong>第2軸荷重：</strong>{totalAxle}kg<br />
        <strong>総積載重量：</strong>{totalWeight}kg
      </div>

      <button onClick={handleSaveToCloud} style={{ marginTop: "20px", padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
        ▶ クラウド保存
      </button>

      <div>
        <button onClick={addEntry} style={{ marginTop: "20px", padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
          + 便を追加する
        </button>
      </div>
    </div>
  );
}
