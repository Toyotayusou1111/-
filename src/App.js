// === App.js（最終確定版：クラウド保存機能削除） ===
import React, { useState, useRef } from "react";

export default function App() {
  const MAX_AXLE = 10000;
  const MAX_TOTAL = 19700;
  const COEF = { ひな壇: 0.6817, 中間1: 0.607, 中間2: 0.0975, 後部: 0.0433 };
  const INTERCEPT = 3317.33;
  const areaMeta = [
    { key: "ひな壇", label: "ひな壇（3,700kg）" },
    { key: "中間1", label: "中間①（4,100kg）" },
    { key: "中間2", label: "中間②（6,400kg）" },
    { key: "後部", label: "後部（5,500kg）" },
  ];

  const blankRows = () => Array(4).fill({ left: "", right: "" });
  const newEntry = () => ({ 便名: "", ひな壇: blankRows(), 中間1: blankRows(), 中間2: blankRows(), 後部: blankRows() });

  const [entries, setEntries] = useState([newEntry()]);
  const refs = useRef({});

  const n = (v) => parseFloat(v) || 0;
  const areaSum = (en, k) => en[k].reduce((s, r) => s + n(r.left) + n(r.right), 0);
  const totals = (en) => {
    const total = areaMeta.reduce((s, a) => s + areaSum(en, a.key), 0);
    const axle = areaSum(en, "ひな壇") * COEF.ひな壇 + areaSum(en, "中間1") * COEF.中間1 + areaSum(en, "中間2") * COEF.中間2 + areaSum(en, "後部") * COEF.後部 + INTERCEPT;
    return { total, axle };
  };

  const setVal = (ei, k, ri, side, v) => setEntries((p) => {
    const cp = [...p];
    const rows = cp[ei][k].map((r) => ({ ...r }));
    rows[ri][side] = v;
    cp[ei][k] = rows;
    return cp;
  });

  const clear = (ei, k, ri, side) => setVal(ei, k, ri, side, "");

  const toCSV = (data) => {
    const rows = [[
      "便名", "エリア", "助手席1", "運転席1", "助手席2", "運転席2", "助手席3", "運転席3", "助手席4", "運転席4", "合計", "第2軸荷重", "総積載"
    ].join(",")];

    data.forEach((en) => {
      const { total, axle } = totals(en);
      areaMeta.forEach(({ key }) => {
        const areaRows = en[key];
        const row = [en.便名, key];
        areaRows.forEach((r) => {
          row.push(r.left || "");
          row.push(r.right || "");
        });
        row.push(areaSum(en, key));
        row.push("", "");
        rows.push(row.join(","));
      });
      rows.push(["", "合計", "", "", "", "", "", "", "", "", "", Math.round(axle), Math.round(total)].join(","));
    });
    return rows.join("\n");
  };

  const downloadCSV = () => {
    const blob = new Blob(["\uFEFF" + toCSV(entries)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "履歴一覧.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", fontSize: 14 }}>
      <h2>リフト重量記録（最大26便）</h2>
      {entries.map((en, ei) => {
        const { total, axle } = totals(en);
        return (
          <div key={ei} style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 8 }}>
              便名：<input value={en.便名} onChange={(e) => {
                const cp = [...entries];
                cp[ei].便名 = e.target.value;
                setEntries(cp);
              }} style={{ width: 120 }} />
            </div>
            {areaMeta.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <strong>{label}</strong>
                {en[key].map((row, ri) => (
                  <div key={ri} style={{ margin: "2px 0" }}>
                    助手席荷重{ri + 1}：
                    <input
                      type="number"
                      value={row.left}
                      onChange={(e) => setVal(ei, key, ri, "left", e.target.value)}
                      ref={(el) => (refs.current[`${ei}-${key}-${ri}-left`] = el)}
                      style={{ width: 80 }}
                    />
                    <button onClick={() => clear(ei, key, ri, "left")}>×</button>
                    &nbsp;
                    運転席荷重{ri + 1}：
                    <input
                      type="number"
                      value={row.right}
                      onChange={(e) => setVal(ei, key, ri, "right", e.target.value)}
                      ref={(el) => (refs.current[`${ei}-${key}-${ri}-right`] = el)}
                      style={{ width: 80 }}
                    />
                    <button onClick={() => clear(ei, key, ri, "right")}>×</button>
                  </div>
                ))}
                <div>← エリア合計: {areaSum(en, key).toLocaleString()}kg</div>
              </div>
            ))}
            <div>第2軸荷重: {Math.round(axle).toLocaleString()}kg / {MAX_AXLE.toLocaleString()}kg</div>
            <div>総積載量: {Math.round(total).toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg</div>
          </div>
        );
      })}
      <button onClick={() => setEntries([...entries, newEntry()])}>＋便を追加する</button>
      &nbsp;
      <button onClick={downloadCSV}>📄 CSVでダウンロード</button>
    </div>
  );
}
