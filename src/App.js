// App.js（エリア目安 + 履歴 + CSV + getDocs import / JSX閉じタグ修正 完全版）

import React, { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

export default function App() {
  /* ---------- 定数 ---------- */
  const MAX_TOTAL_LOAD = 19700;   // 最大総積載量(kg)
  const MAX_AXLE_LOAD  = 10000;   // 第2軸上限(kg)

  const influences = {
    ひな壇: 1.2006,
    中間1: 0.3345,
    中間2: 0.1491,
    後部 : -0.218,
  };
  const INTERCEPT = 3554.87;

  const areaLabels = [
    { key: "ひな壇", label: "ひな壇（3,700kg）" },
    { key: "中間1", label: "中間①（4,100kg）" },
    { key: "中間2", label: "中間②（6,400kg）" },
    { key: "後部",  label: "後部（5,500kg）" },
  ];

  /* ---------- state ---------- */
  const defaultRow  = () => Array(4).fill({ left: "", right: "" });
  const initialEntry = () => ({ 便名: "", ひな壇: defaultRow(), 中間1: defaultRow(), 中間2: defaultRow(), 後部: defaultRow() });

  const [entries,     setEntries]     = useState([initialEntry()]);
  const [logs,        setLogs]        = useState([]);   // Firestore履歴
  const [suggestion,  setSuggestion]  = useState({});  // 未入力エリアへの目安値
  const inputRefs = useRef({});

  /* ---------- 計算 ---------- */
  const parseVal = (v) => parseFloat(v) || 0;

  const areaTotal = (entry, area) => entry[area].reduce((s, r) => s + parseVal(r.left) + parseVal(r.right), 0);

  const calcTotals = (entry) => {
    const totalWeight = areaLabels.reduce((s, { key }) => s + areaTotal(entry, key), 0);
    const axleWeight  =
      areaTotal(entry, "ひな壇") * influences.ひな壇 +
      areaTotal(entry, "中間1") * influences.中間1 +
      areaTotal(entry, "中間2") * influences.中間2 +
      areaTotal(entry, "後部")   * influences.後部   + INTERCEPT;
    return { totalWeight, axleWeight };
  };

  /* ---------- 入力変更 ---------- */
  const updateCell = (ei, area, ri, side, val) => {
    const upd  = [...entries];
    const rows = [...upd[ei][area]];
    rows[ri]   = { ...rows[ri], [side]: val };
    upd[ei][area] = rows;
    setEntries(upd);
  };

  /* ---------- 残量目安計算 ---------- */
  useEffect(() => {
    const entry = entries[0];
    const { totalWeight } = calcTotals(entry);
    const remaining = Math.max(MAX_TOTAL_LOAD - totalWeight, 0);

    const emptyAreas = areaLabels.filter(({ key }) => areaTotal(entry, key) === 0).map(({ key }) => key);
    const perArea = emptyAreas.length ? Math.floor(remaining / emptyAreas.length) : 0;

    const sgs = {};
    emptyAreas.forEach((k) => { sgs[k] = perArea; });
    setSuggestion(sgs);
  }, [entries]);

  /* ---------- Firestore 保存 ---------- */
  const saveToCloud = async (entry) => {
    if (!entry.便名.trim()) {
      alert("便名を入力してください");
      return;
    }
    const { totalWeight, axleWeight } = calcTotals(entry);
    const data = { 便名: entry.便名, timestamp: serverTimestamp(), totalWeight, axleWeight };
    areaLabels.forEach(({ key }) => (data[key] = entry[key]));
    await addDoc(collection(db, "liftLogs"), data);
    alert("✅ クラウドに保存しました！");
  };

  /* ---------- 履歴取得 ---------- */
  const fetchLogs = async () => {
    const snap = await getDocs(collection(db, "liftLogs"));
    setLogs(snap.docs.map((d) => d.data()));
  };
  useEffect(() => { fetchLogs(); }, []);

  /* ---------- CSV出力 ---------- */
  const downloadCSV = () => {
    const header = ["便名", "総積載量", "第2軸荷重", "日時"];
    const rows = logs.map((l) => [
      l.便名,
      Math.round(l.totalWeight),
      Math.round(l.axleWeight),
      new Date(l.timestamp?.seconds * 1000).toLocaleString(),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "liftLogs.csv";
    link.click();
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>リフト重量記録（最大26便）</h2>

      {entries.map((entry, ei) => {
        const { totalWeight, axleWeight } = calcTotals(entry);
        return (
          <div key={ei} style={{ borderBottom: "1px solid #ccc", marginBottom: 30 }}>
            <label>
              便名：
              <input value={entry.便名} onChange={(e) => { const u = [...entries]; u[ei].便名 = e.target.value; setEntries(u); }} style={{ marginLeft: 8 }} />
            </label>

            {areaLabels.map(({ key, label }) => (
              <div key={key} style={{ marginTop: 20 }}>
                <h4>{label}</h4>
                {[0, 1, 2, 3].map((ri) => (
                  <div key={ri} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                    <input type="number" placeholder="助手席側" style={{ width: 90 }}
                      value={entry[key][ri].left} onChange={(e) => updateCell(ei, key, ri, "left", e.target.value)} />
                    <input type="number" placeholder="運転席側" style={{ width: 90 }}
                      value={entry[key][ri].right} onChange={(e) => updateCell(ei, key, ri, "right", e.target.value)} />
                  </div>
                ))}
                <div>
                  ⇒ エリア合計：<strong>{areaTotal(entry, key).toLocaleString()}kg</strong>
                  {suggestion[key] !== undefined && areaTotal(entry, key) === 0 && (
                    <span style={{ color: "#888", marginLeft: 10 }}>(目安 {suggestion[key].toLocaleString()}kg)</span>
                  )}
                </div>
              </div>
            ))}

            <p><strong>第2軸荷重：</strong>{Math.round(axleWeight).toLocaleString()}kg</p>
            <p><strong>総積載量：</strong>{Math.round(totalWeight).toLocaleString()}kg</p>
            <button onClick={() => saveToCloud(entry)} style={{ background: "#28a745", color: "#fff", padding: "6px 12px" }}>☁ クラウド保存</button>
          </div>
        );
      })}

      <button onClick={() => setEntries([...entries, initialEntry()])} style={{ background: "#007bff", color: "#fff", padding: "8px 14px" }}>＋便を追加する</button>

      <hr style={{ margin: "40px 0" }} />
      <h3>履歴一覧</h3>
      <button onClick={downloadCSV} style={{ marginBottom: 10 }}>CSVでダウンロード</button>
      <table border="1" cellPadding="6" style={{ borderCollapse:"collapse" }}>
        <thead>
          <tr><th>便名</th><th>総積載量</th><th>第2軸荷重// ✅ Canvasにあるコードの最後にこの続きを追加してください！

            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td>{l.便名}</td>
                <td>{Math.round(l.totalWeight).toLocaleString()}kg</td>
                <td>{Math.round(l.axleWeight).toLocaleString()}kg</td>
                <td>{new Date(l.timestamp?.seconds * 1000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}

