import React, { useState, useEffect } from "react";

/* ---- 設定値（必要に応じて調整してください） ---- */
const AREA_NAMES     = ["ひな壇", "中間①", "中間②", "後部"];
const AREA_CAPACITY  = [3700, 4100, 6400, 5500];   // 各エリアの定格積載量
const AXLE2_COEFF    = [0.45, 0.58, 0.66, 0.72];   // 第2軸への影響係数
const MAX_TOTAL      = 19700;                      // 総重量上限
const MAX_AXLE2      = 10000;                      // 第2軸上限
const SEATS_PER_AREA = 8;                          // 入力欄数（助手4 + 運転4）
/* ---------------------------------------------- */

export default function App() {
  /* 各エリア×各席の入力値を文字列で保持 */
  const [weights, setWeights] = useState(
    Array(4).fill().map(() => Array(SEATS_PER_AREA).fill(""))
  );

  /* 計算結果（各エリア合計・推奨値・総積載・第2軸） */
  const [areaTotals, setAreaTotals] = useState([0, 0, 0, 0]);
  const [suggested,  setSuggested]  = useState([0, 0, 0, 0]);
  const [axle2Total, setAxle2Total] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  /* 入力変化ごとに再計算 */
  useEffect(() => {
    const newAreaTotals = weights.map(area =>
      area.reduce((sum, v) => sum + (+v || 0), 0)
    );
    setAreaTotals(newAreaTotals);

    const axle2 = newAreaTotals.reduce(
      (sum, w, i) => sum + w * AXLE2_COEFF[i], 0
    );
    setAxle2Total(Math.round(axle2));

    const total = newAreaTotals.reduce((a, b) => a + b, 0);
    setGrandTotal(total);

    setSuggested(calcSuggestedWeights(newAreaTotals, axle2, total));
  }, [weights]);

  /* 推奨値計算（後部→中間②→中間① の順で割当） */
  const calcSuggestedWeights = (currTotals, axle2Now, totalNow) => {
    const s = [0, 0, 0, 0];
    let remTotal = MAX_TOTAL - totalNow;
    let remAxle2 = MAX_AXLE2 - axle2Now;
    if (remTotal <= 0 || remAxle2 <= 0) return s;

    const priority = [3, 2, 1];               // エリア index の優先順
    for (const idx of priority) {
      if (currTotals[idx] !== 0) continue;    // すでに重量入力済みなら飛ばす
      const maxByCap   = AREA_CAPACITY[idx];
      const maxByAxle2 = remAxle2 / AXLE2_COEFF[idx];
      const addable    = Math.floor(Math.min(maxByCap, remTotal, maxByAxle2));
      s[idx]    = addable;
      remTotal -= addable;
      remAxle2 -= addable * AXLE2_COEFF[idx];
      if (remTotal <= 0 || remAxle2 <= 0) break;
    }
    return s;
  };

  /* 入力ハンドラ */
  const handleChange = (areaIdx, seatIdx, value) => {
    setWeights(prev => {
      const next = prev.map(row => [...row]);
      next[areaIdx][seatIdx] = value;
      return next;
    });
  };

  /* 画面描画 */
  return (
    <div>
      <h2>リフト重量記録（最大26便）</h2>

      {AREA_NAMES.map((name, areaIdx) => (
        <div key={areaIdx}>
          <b>{name}（{AREA_CAPACITY[areaIdx].toLocaleString()}kg）</b>
          <br />
          {Array(SEATS_PER_AREA).fill().map((_, seatIdx) => (
            <input
              key={seatIdx}
              type="number"
              value={weights[areaIdx][seatIdx]}
              onChange={e => handleChange(areaIdx, seatIdx, e.target.value)}
              /* ------- 見た目固定用スタイル ------- */
              style={{
                width: "50px",
                display: "inline-block",
                marginRight: "2px"
              }}
            />
          ))}
          <br />
          ← エリア合計: {areaTotals[areaIdx].toLocaleString()}kg
          {areaTotals[areaIdx] === 0 && suggested[areaIdx] > 0 && (
            <>（推奨 {suggested[areaIdx].toLocaleString()}kg）</>
          )}
          <br /><br />
        </div>
      ))}

      <div>
        第2軸荷重: {axle2Total.toLocaleString()}kg / {MAX_AXLE2.toLocaleString()}kg
      </div>
      <div>
        総積載: {grandTotal.toLocaleString()}kg / {MAX_TOTAL.toLocaleString()}kg
      </div>
    </div>
  );
}
