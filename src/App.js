import React, { useState, useRef } from "react";

export default function App() {
  const MAX_AXLE = 10000;
  const MAX_TOTAL = 19700;
  const COEF = { ひな壇: 0.6817, 中間1: 0.607, 中間2: 0.0975, 後部: 0.0433 };
  const LIMIT = { ひな壇: 3700, 中間1: 4100, 中間2: 6400, 後部: 5500 };
  const INTERCEPT = 3317.33;

  const areaMeta = [
    { key: "ひな壇", label: "ひな壇（3,700kg）" },
    { key: "中間1", label: "中間①（4,100kg）" },
    { key: "中間2", label: "中間②（6,400kg）" },
    { key: "後部", label: "後部（5,500kg）" },
  ];

  const blankRows = () => Array(4).fill({ left: "", right: "" });
  const newEntry = () => ({
    便名: "",
    ひな壇: blankRows(),
    中間1: blankRows(),
    中間2: blankRows(),
    後部: blankRows(),
  });

  const [entries, setEntries] = useState([newEntry()]);
  const refs = useRef({});

  const n = (v) => parseFloat(v) || 0;
  const areaSum = (en, k) => en[k].reduce((s, r) => s + n(r.left) + n(r.right), 0);

  const totals = (en) => {
    const areaSums = {};
    let total = 0;
    let axle = INTERCEPT;

    areaMeta.forEach(({ key }) => {
      const sum = areaSum(en, key);
      areaSums[key] = sum;
      total += sum;
      axle += sum * COEF[key];
    });

    const remainTotal = Math.max(0, MAX_TOTAL - total);
    const remainAxle = MAX_AXLE - axle;

    const estimate = {};

    const targets = areaMeta.filter((a) =>
      en[a.key].some((r) => r.left === "" || r.right === "")
    );

    if (targets.length > 0) {
      const coefSum = targets.reduce((s, a) => s + COEF[a.key], 0);

      targets.forEach((a) => {
        const ratio = COEF[a.key] / coefSum;
        const logicalTotal = remainTotal * ratio;
        const logicalAxle = remainAxle > 0 ? remainAxle * ratio : 0;
        const maxLimit = LIMIT[a.key] - areaSums[a.key];
        const est = Math.min(logicalTotal, logicalAxle, maxLimit, remainTotal);
        estimate[a.key] = Math.max(0, Math.floor(est));
      });
    }

    return { total, axle, estimate };
  };

  const setVal = (ei, k, ri, side, v) =>
    setEntries((p) => {
      const cp = [...p];
      const rows = cp[ei][k].map((r) => ({ ...r }));
      rows[ri][side] = v;
      cp[ei][k] = rows;
      return cp;
    });

  const clear = (ei, k, ri, side) => setVal(ei, k, ri, side, "");

  const handleKeyDown = (e, ei, k, ri, side) => {
    if (e.key === "Enter") {
      const order = ["left", "right"];
      const sideIdx = order.indexOf(side);
      const nextSide = sideIdx === 0 ? "right" : "left";
      const nextRi = sideIdx === 0 ? ri : ri + 1;
      const nextKey = `${ei}-${k}-${nextRi}-${nextSide}`;
      const nextInput = refs.current[nextKey];
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif", fontSize: 14 }}>
      <h2>リフト重量記録（最大26便）</h2>
      {entries.map((en, ei) => {
        const { total, axle, estimate } = totals(en);
        return (
          <div key={ei} style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 8 }}>
              便名：
              <input
                value={en.便名}
                onChange={(e) => {
                  const cp = [...entries];
                  cp[ei].便名 = e.target.value;
                  setEntries(cp);
                }}
                style={{ width: 120 }}
              />
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
                      onKeyDown={(e) => handleKeyDown(e, ei, key, ri, "left")}
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
                      onKeyDown={(e) => handleKeyDown(e, ei, key, ri, "right")}
                      ref={(el) => (refs.current[`${ei}-${key}-${ri}-right`] = el)}
                      style={{ width: 80 }}
                    />
                    <button onClick={() => clear(ei, key, ri, "right")}>×</button>
                  </div>
                ))}
                <div>← エリア合計: {areaSum(en, key).toLocaleString()}kg</div>
                {estimate[key] !== undefined && (
                  <div>→ 積載目安: {estimate[key].toLocaleString()}kg</div>
                )}
              </div>
            ))}
            <div>第2軸荷重: {Math.round(axle).toLocaleString()}kg / {MAX_AXLE.toLocaleString()}kg</div>
            <div>総積載量: {Math.round(total).toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg</div>
          </div>
        );
      })}
      <button onClick={() => setEntries([...entries, newEntry()])}>＋便を追加する</button>
    </div>
  );
}
