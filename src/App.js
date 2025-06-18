import React, { useState, useRef } from "react";
import { db, collection, addDoc, serverTimestamp } from "./firebase";

/* ─────────── 設定値 ─────────── */
const MAX_TOTAL = 19700;
const MAX_AXLE  = 10000;

/* 学習比率（19.7t 換算） */
const RATIO = { ひな壇: 0.202, 中間1: 0.205, 中間2: 0.326, 後部: 0.267 };

/* 第2軸 係数（＋前寄り／−後寄り） */
const AXLE_COEF = { ひな壇: 1.2006, 中間1: 0.3345, 中間2: 0.1491, 後部: -0.218 };
const INTERCEPT = 3554.87;

/* 表示エリア定義 */
const AREAS = [
  { key: "ひな壇", label: "ひな壇（3,700kg）" },
  { key: "中間1", label: "中間①（4,100kg）" },
  { key: "中間2", label: "中間②（6,400kg）" },
  { key: "後部",   label: "後部（5,500kg）" },
];
/* ───────────────────────── */

const blankRows = () => Array(4).fill({ left: "", right: "" });
const newEntry  = () => ({
  便名: "", ひな壇: blankRows(), 中間1: blankRows(), 中間2: blankRows(), 後部: blankRows(),
});

export default function App() {
  const [entries, setEntries] = useState([newEntry()]);
  const refMap = useRef({});

  const num = (v) => parseFloat(v) || 0;

  const areaSum = (entry, areaKey) =>
    entry[areaKey].reduce((s, r) => s + num(r.left) + num(r.right), 0);

  /* 総重量 + 第2軸荷重 */
  const totals = (entry) => {
    const total = AREAS.reduce((s, a) => s + areaSum(entry, a.key), 0);
    const axle  =
      areaSum(entry, "ひな壇") * AXLE_COEF.ひな壇 +
      areaSum(entry, "中間1") * AXLE_COEF.中間1 +
      areaSum(entry, "中間2") * AXLE_COEF.中間2 +
      areaSum(entry, "後部")   * AXLE_COEF.後部   +
      INTERCEPT;
    return { total, axle };
  };

  /* 🟢 目安を“全エリア同時”で計算（軸重バランス考慮） */
  const generateSuggestions = (entry) => {
    const { total, axle } = totals(entry);
    let remTotal = MAX_TOTAL - total;
    let remAxle  = MAX_AXLE  - axle;

    /* 各エリアの理想不足量を計算 */
    const needs = AREAS.map((a) => ({
      key:  a.key,
      need: Math.max(0, Math.round(MAX_TOTAL * RATIO[a.key] - areaSum(entry, a.key)))
    }));

    /* 結果を格納 */
    const sug = { ひな壇:0, 中間1:0, 中間2:0, 後部:0 };

    /* 1️⃣ 軸重が超過（remAxle ≤ 0）の場合は、後部(負係数)から埋めて補正 */
    if (remAxle < 0) {
      for (const a of needs.filter(n => AXLE_COEF[n.key] < 0 && n.need > 0)) {
        const maxByAxle = (-remAxle) / (-AXLE_COEF[a.key]);
        const add = Math.min(a.need, remTotal, maxByAxle);
        if (add >= 300) {
          sug[a.key] = add;
          remTotal  -= add;
          remAxle   += add * AXLE_COEF[a.key];   // remAxle は増減
        }
        if (remAxle >= 0 || remTotal <= 0) break;
      }
    }

    /* 2️⃣ 残り容量で、前寄りエリア→中央エリア→後部の順に割当て */
    const ordered = [...needs].sort((a, b) => AXLE_COEF[a.key] - AXLE_COEF[b.key]); // 小→大
    for (const a of ordered) {
      if (sug[a.key] > 0 || a.need === 0 || remTotal <= 0) continue;

      const coef = AXLE_COEF[a.key];
      /* 軸重側の制約 */
      const maxByAxle =
        coef >= 0
          ? (remAxle > 0 ? remAxle / coef : 0)
          : Infinity;

      const add = Math.min(a.need, remTotal, maxByAxle);
      if (add >= 300) {
        sug[a.key] = add;
        remTotal -= add;
        remAxle  -= add * (-coef);  // 前向きは残りAxle減る、後向きは増える (向き逆に注意)
      }
    }
    return sug;
  };

  /* 📌 入力更新 */
  const setVal = (ei, k, ri, side, value) =>
    setEntries((prev) => {
      const cp = [...prev];
      const rows = cp[ei][k].map(r => ({ ...r }));
      rows[ri] = { ...rows[ri], [side]: value };
      cp[ei][k] = rows;
      return cp;
    });

  /* Enter で次入力へ */
  const nextField = (e, ei, k, ri, side) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const aIdx = AREAS.findIndex(a => a.key === k);
    const tgt =
      side === "left" ? [ei, k, ri, "right"] :
      ri < 3          ? [ei, k, ri + 1, "left"] :
      aIdx < 3        ? [ei, AREAS[aIdx + 1].key, 0, "left"] : null;
    if (tgt) refMap.current[tgt.join("-")]?.focus();
  };

  /* ========== 画面 ========== */
  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", fontSize: 14 }}>
      <h2 style={{ margin: "0 0 8px" }}>リフト重量記録（最大26便）</h2>

      {entries.map((ent, ei) => {
        const { total, axle } = totals(ent);
        const sugMap = generateSuggestions(ent);

        return (
          <div key={ei} style={{ marginBottom: 32 }}>
            {/* 便名入力 */}
            <div style={{ marginBottom: 12 }}>
              便名：<input
                value={ent.便名}
                onChange={e => {
                  const cp = [...entries]; cp[ei].便名 = e.target.value; setEntries(cp);
                }}
                style={{ width: 120 }}
              />
            </div>

            {/* 各エリア入力 */}
            {AREAS.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 20 }}>
                <b>{label}</b>
                {ent[key].map((row, ri) => (
                  <div key={ri} style={{ margin: "2px 0" }}>
                    助手席荷重{ri + 1}:{" "}
                    <input
                      type="number"
                      value={row.left}
                      onChange={e => setVal(ei, key, ri, "left", e.target.value)}
                      onKeyDown={e => nextField(e, ei, key, ri, "left")}
                      ref={el => refMap.current[`${ei}-${key}-${ri}-left`] = el}
                      style={{ width: 70, marginRight: 8 }}
                    />
                    運転席荷重{ri + 1}:{" "}
                    <input
                      type="number"
                      value={row.right}
                      onChange={e => setVal(ei, key, ri, "right", e.target.value)}
                      onKeyDown={e => nextField(e, ei, key, ri, "right")}
                      ref={el => refMap.current[`${ei}-${key}-${ri}-right`] = el}
                      style={{ width: 70 }}
                    />
                  </div>
                ))}
                <div>
                  ← エリア合計: <b>{areaSum(ent, key).toLocaleString()}kg</b>
                  {sugMap[key] > 0 && (
                    <>（目安 {sugMap[key].toLocaleString()}kg）</>
                  )}
                </div>
              </div>
            ))}

            <div>第2軸荷重: {Math.round(axle).toLocaleString()}kg / {MAX_AXLE.toLocaleString()}kg</div>
            <div>総積載量:  {Math.round(total).toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg</div>

            {/* クラウド保存 */}
            <button
              onClick={async () => {
                try {
                  await addDoc(collection(db, "liftLogs"), {
                    ...ent,
                    ...totals(ent),
                    timestamp: serverTimestamp(),
                  });
                  alert("✅ クラウドに保存しました");
                } catch {
                  alert("❌ 保存に失敗しました");
                }
              }}
              style={{
                marginTop: 6,
                background: "#0baf00",
                color: "#fff",
                border: "none",
                padding: "4px 12px",
                cursor: "pointer",
              }}
            >
              ☁ クラウド保存
            </button>
          </div>
        );
      })}

      {/* 便追加 */}
      {entries.length < 26 && (
        <button
          onClick={() => setEntries([...entries, newEntry()])}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "6px 18px",
            cursor: "pointer",
          }}
        >
          ＋便を追加する
        </button>
      )}
    </div>
  );
}
