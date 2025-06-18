import React, { useState, useRef } from "react";
import { db, collection, addDoc, serverTimestamp } from "./firebase";

const MAX_TOTAL = 19700;
const MAX_AXLE  = 10000;

const RATIO = {
  ひな壇: 0.202,
  中間1: 0.205,
  中間2: 0.326,
  後部:  0.267,
};

const AXLE_COEF = {
  ひな壇:  1.2006,
  中間1:   0.3345,
  中間2:   0.1491,
  後部:   -0.218,
};

const INTERCEPT = 3554.87;

const AREAS = [
  { key: "ひな壇", label: "ひな壇（3,700kg）" },
  { key: "中間1", label: "中間①（4,100kg）" },
  { key: "中間2", label: "中間②（6,400kg）" },
  { key: "後部",   label: "後部（5,500kg）" },
];

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

  const calcTotals = (entry) => {
    const total = AREAS.reduce((s, a) => s + areaSum(entry, a.key), 0);
    const axle  =
      areaSum(entry, "ひな壇") * AXLE_COEF.ひな壇 +
      areaSum(entry, "中間1") * AXLE_COEF.中間1 +
      areaSum(entry, "中間2") * AXLE_COEF.中間2 +
      areaSum(entry, "後部")   * AXLE_COEF.後部 +
      INTERCEPT;
    return { total, axle };
  };

  const suggest = (entry, areaKey) => {
    const { total, axle } = calcTotals(entry);
    const remTotal = MAX_TOTAL - total;
    const remAxle  = MAX_AXLE  - axle;

    const coef  = AXLE_COEF[areaKey];
    const ideal = MAX_TOTAL * RATIO[areaKey];
    const need  = ideal - areaSum(entry, areaKey);
    if (need <= 0) return 0;

    let maxByAxle;
    if (coef >= 0) {
      maxByAxle = remAxle > 0 ? remAxle / coef : 0;
    } else {
      maxByAxle = remAxle < 0 ? (-remAxle) / (-coef) : Infinity;
    }

    const addable = Math.floor(Math.max(0, Math.min(need, remTotal, maxByAxle)));
    return addable >= 300 ? addable : 0; // 🟩 今回の修正：300kg未満なら非表示
  };

  const setVal = (ei, k, ri, side, value) =>
    setEntries((prev) => {
      const copy = [...prev];
      const rows = copy[ei][k].map((r) => ({ ...r }));
      rows[ri] = { ...rows[ri], [side]: value };
      copy[ei][k] = rows;
      return copy;
    });

  const nextField = (e, ei, k, ri, side) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const aIdx = AREAS.findIndex((a) => a.key === k);
    const tgt =
      side === "left" ? [ei, k, ri, "right"] :
      ri < 3          ? [ei, k, ri + 1, "left"] :
      aIdx < 3        ? [ei, AREAS[aIdx + 1].key, 0, "left"] : null;
    if (tgt) refMap.current[tgt.join("-")]?.focus();
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", fontSize: 14 }}>
      <h2 style={{ margin: "0 0 8px" }}>リフト重量記録（最大26便）</h2>

      {entries.map((ent, ei) => {
        const { total, axle } = calcTotals(ent);
        return (
          <div key={ei} style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 12 }}>
              便名：<input
                value={ent.便名}
                onChange={(e) => {
                  const cp = [...entries];
                  cp[ei].便名 = e.target.value;
                  setEntries(cp);
                }}
                style={{ width: 120 }}
              />
            </div>

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
                      onKeyDown={(e) => nextField(e, ei, key, ri, "left")}
                      ref={(el) => (refMap.current[`${ei}-${key}-${ri}-left`] = el)}
                      style={{ width: 70, marginRight: 8 }}
                    />
                    運転席荷重{ri + 1}:{" "}
                    <input
                      type="number"
                      value={row.right}
                      onChange={(e) => setVal(ei, key, ri, "right", e.target.value)}
                      onKeyDown={(e) => nextField(e, ei, key, ri, "right")}
                      ref={(el) => (refMap.current[`${ei}-${key}-${ri}-right`] = el)}
                      style={{ width: 70 }}
                    />
                  </div>
                ))}
                <div>
                  ← エリア合計: <b>{areaSum(ent, key).toLocaleString()}kg</b>
                  {suggest(ent, key) > 0 && (
                    <>（目安 {suggest(ent, key).toLocaleString()}kg）</>
                  )}
                </div>
              </div>
            ))}

            <div>第2軸荷重: {Math.round(axle).toLocaleString()}kg / {MAX_AXLE.toLocaleString()}kg</div>
            <div>総積載量:  {Math.round(total).toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg</div>

            <button
              onClick={async () => {
                try {
                  await addDoc(collection(db, "liftLogs"), {
                    ...ent,
                    ...calcTotals(ent),
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
