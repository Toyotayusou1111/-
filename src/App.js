import React, { useState, useRef } from "react";
import { db, collection, addDoc, serverTimestamp } from "./firebase";

/* ───────── 設定値 ───────── */
const MAX_TOTAL = 19700;
const MAX_AXLE  = 10000;

const RATIO = { ひな壇: 0.202, 中間1: 0.205, 中間2: 0.326, 後部: 0.267 };
const AXLE_COEF = { ひな壇: 1.2006, 中間1: 0.3345, 中間2: 0.1491, 後部: -0.218 };
const INTERCEPT = 3554.87;

const AREAS = [
  { key: "ひな壇", label: "ひな壇（3,700kg）" },
  { key: "中間1", label: "中間①（4,100kg）" },
  { key: "中間2", label: "中間②（6,400kg）" },
  { key: "後部",   label: "後部（5,500kg）" },
];
/* ──────────────────────── */

const blankRows = () => Array(4).fill({ left: "", right: "" });
const newEntry  = () => ({
  便名: "", ひな壇: blankRows(), 中間1: blankRows(), 中間2: blankRows(), 後部: blankRows(),
});

export default function App() {
  const [entries, setEntries] = useState([newEntry()]);
  const refMap = useRef({});

  /* 共通関数 */
  const n = (v) => parseFloat(v) || 0;
  const sumArea = (e, k) => e[k].reduce((s, r) => s + n(r.left) + n(r.right), 0);
  const totals = (e) => {
    const total = AREAS.reduce((s, a) => s + sumArea(e, a.key), 0);
    const axle  =
      sumArea(e, "ひな壇") * AXLE_COEF.ひな壇 +
      sumArea(e, "中間1") * AXLE_COEF.中間1 +
      sumArea(e, "中間2") * AXLE_COEF.中間2 +
      sumArea(e, "後部")   * AXLE_COEF.後部   + INTERCEPT;
    return { total, axle };
  };
  const suggest = (e, k) => {
    const { total } = totals(e);
    const remain   = MAX_TOTAL - total;
    if (remain <= 0) return 0;
    const ideal    = MAX_TOTAL * RATIO[k];
    const need     = ideal - sumArea(e, k);
    return need > 0 ? Math.floor(Math.min(need, remain)) : 0;
  };

  /* 更新とフォーカス移動 */
  const setVal = (ei, k, ri, side, v) =>
    setEntries((prev) => {
      const cp   = [...prev];
      const rows = cp[ei][k].map((r) => ({ ...r }));
      rows[ri]   = { ...rows[ri], [side]: v };
      cp[ei][k]  = rows;
      return cp;
    });

  const next = (e, ei, k, ri, side) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const aIdx = AREAS.findIndex((a) => a.key === k);
    const nxt  = side === "left" ? [ei, k, ri, "right"] :
                 ri < 3          ? [ei, k, ri + 1, "left"] :
                 aIdx < 3        ? [ei, AREAS[aIdx + 1].key, 0, "left"] :
                 null;
    if (nxt) refMap.current[nxt.join("-")]?.focus();
  };

  /* ===== 画面 ===== */
  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", fontSize: 14 }}>
      <h2 style={{ margin: "0 0 8px" }}>リフト重量記録（最大26便）</h2>

      {entries.map((ent, ei) => {
        const { total, axle } = totals(ent);
        return (
          <div key={ei} style={{ marginBottom: 32 }}>
            {/* 便名 */}
            <div style={{ marginBottom: 12 }}>
              便名：<input
                value={ent.便名}
                onChange={(e) => {
                  const cp = [...entries]; cp[ei].便名 = e.target.value; setEntries(cp);
                }}
                style={{ width: 120 }}
              />
            </div>

            {/* 各エリア */}
            {AREAS.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 20 }}>
                <b>{label}</b>
                {ent[key].map((row, ri) => (
                  <div key={ri} style={{ margin: "2px 0" }}>
                    助手席荷重{ri + 1}:{" "}
                    <input
                      type="number"
                      value={row.left}
                      onChange={(e) => setVal(ei, key, ri, "left", e.target.value)}
                      onKeyDown={(e) => next(e, ei, key, ri, "left")}
                      ref={(el) => (refMap.current[`${ei}-${key}-${ri}-left`] = el)}
                      style={{ width: 70, marginRight: 8 }}
                    />
                    運転席荷重{ri + 1}:{" "}
                    <input
                      type="number"
                      value={row.right}
                      onChange={(e) => setVal(ei, key, ri, "right", e.target.value)}
                      onKeyDown={(e) => next(e, ei, key, ri, "right")}
                      ref={(el) => (refMap.current[`${ei}-${key}-${ri}-right`] = el)}
                      style={{ width: 70 }}
                    />
                  </div>
                ))}
                <div>
                  ← エリア合計: <b>{sumArea(ent, key).toLocaleString()}kg</b>
                  {sumArea(ent, key) === 0 && suggest(ent, key) > 0 && (
                    <>（推奨 {suggest(ent, key).toLocaleString()}kg）</>
                  )}
                </div>
              </div>
            ))}

            {/* 集計 */}
            <div>第2軸荷重: {Math.round(axle).toLocaleString()}kg / {MAX_AXLE.toLocaleString()}kg</div>
            <div>総積載量:  {Math.round(total).toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg</div>

            {/* 保存ボタン */}
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
    </div>
  );
}
