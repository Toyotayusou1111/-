import React, { useState, useEffect } from "react";

/* ========= 設定値（ここを実車仕様に合わせて変更する） ========= */
const CAPACITIES   = [3700, 4100, 6400, 5500];     // ひな壇／中①／中②／後部
const AXLE2_COEFF  = [0.45, 0.58, 0.66, 0.72];     // 各エリア→第2軸の影響係数
const MAX_TOTAL    = 19700;                        // 総重量上限
const MAX_AXLE2    = 10000;                        // 第2軸上限
const SEATS_PER_AREA = 8;                          // 助手×4 + 運転×4
const seatCoeff    = Array(SEATS_PER_AREA).fill(1);/* 位置係数があるなら書き換え */
/* =============================================================== */

const AREA_LABELS = ["ひな壇", "中間①", "中間②", "後部"];

export default function App() {
  // 各エリア×各席の入力値
  const [weights, setWeights] = useState(
    Array(4).fill().map(() => Array(SEATS_PER_AREA).fill(""))
  );

  // 計算結果
  const [areaTotals,   setAreaTotals]   = useState([0, 0, 0, 0]);
  const [suggested,    setSuggested]    = useState([0, 0, 0, 0]);
  const [axle2Total,   setAxle2Total]   = useState(0);
  const [grandTotal,   setGrandTotal]   = useState(0);

  /* -------- 入力変化時の再計算 -------- */
  useEffect(() => {
    // 各エリアの合計
    const newAreaTotals = weights.map(area =>
      area.reduce((sum, v, i) => sum + (+v || 0) * seatCoeff[i], 0)
    );
    setAreaTotals(newAreaTotals);

    // 第2軸
    const newAxle2 = newAreaTotals.reduce(
      (sum, w, i) => sum + w * AXLE2_COEFF[i],
      0
    );
    setAxle2Total(Math.round(newAxle2));

    // 総重量
    const newTotal = newAreaTotals.reduce((a, b) => a + b, 0);
    setGrandTotal(newTotal);

    // 推奨積載量の計算
    setSuggested(
      calcSuggestedWeights(newAreaTotals, newAxle2, newTotal)
    );
  }, [weights]);

  /* -------- 推奨値計算ロジック -------- */
  function calcSuggestedWeights(currentTotals, axle2Now, totalNow) {
    const s = [0, 0, 0, 0];

    let remTotal = MAX_TOTAL - totalNow;
    let remAxle2 = MAX_AXLE2 - axle2Now;
    if (remTotal <= 0 || remAxle2 <= 0) return s;

    // まだ 0kg のエリアを影響係数が小さい順で埋める
    const candidates = currentTotals
      .map((w, i) => (w === 0 ? i : null))
      .filter(i => i !== null)
      .sort((a, b) => AXLE2_COEFF[a] - AXLE2_COEFF[b]);

    for (const idx of candidates) {
      const maxByCap   = CAPACITIES[idx];
      const maxByAxle2 = remAxle2 / AXLE2_COEFF[idx];
      const addable    = Math.floor(Math.min(maxByCap, remTotal, maxByAxle2));

      s[idx]  = addable;
      remTotal -= addable;
      remAxle2 -= addable * AXLE2_COEFF[idx];

      if (remTotal <= 0 || remAxle2 <= 0) break;
    }
    return s;
  }

  /* -------- 入力ハンドラ -------- */
  const handleChange = (areaIdx, seatIdx, val) => {
    setWeights(prev => {
      const next = prev.map(row => [...row]);
      next[areaIdx][seatIdx] = val;
      return next;
    });
  };

  /* ----------- 画面描画 ----------- */
  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>リフト重量記録（最大26便）</h2>

      {AREA_LABELS.map((label, areaIdx) => (
        <div key={label} style={{ marginBottom: "1rem" }}>
          <strong>
            {label}（{CAPACITIES[areaIdx].toLocaleString()}kg）
          </strong>
          <br />

          {/* 座席入力欄 */}
          {weights[areaIdx].map((v, seatIdx) => (
            <input
              key={seatIdx}
              type="number"
              style={{ width: 70, margin: "2px 4px" }}
              value={v}
              placeholder="0"
              onChange={e =>
                handleChange(areaIdx, seatIdx, e.target.value)
              }
            />
          ))}

          {/* 合計 + 推奨 */}
          <div style={{ marginTop: 4 }}>
            ← エリア合計: {areaTotals[areaIdx].toLocaleString()}kg
            {areaTotals[areaIdx] === 0 && suggested[areaIdx] > 0 && (
              <span style={{ color: "#008800" }}>
                {" "}
                (推奨 {suggested[areaIdx].toLocaleString()}kg)
              </span>
            )}
          </div>
        </div>
      ))}

      <hr />

      <p>第2軸荷重: {axle2Total.toLocaleString()}kg / {MAX_AXLE2.toLocaleString()}kg</p>
      <p>総積載: {grandTotal.toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg</p>
    </div>
  );
}
