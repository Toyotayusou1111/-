import React, { useState } from "react";

export default function App() {
const \[weights, setWeights] = useState({
ひな壇: "",
中間①: "",
中間②: "",
後部: "",
});

// 新しい影響係数（第2軸／第3軸）
const influence2 = { ひな壇: 0.6, 中間①: 0.8, 中間②: 0.5, 後部: 0.2 };
const influence3 = { ひな壇: 0.0, 中間①: 0.1, 中間②: 0.5, 後部: 0.9 };

const MAX\_TOTAL = 19700;
const MAX\_AXLE2 = 10000;
const MAX\_AXLE3 = 20000;

const parsed = Object.fromEntries(
Object.entries(weights).map((\[k, v]) => \[k, parseFloat(v) || 0])
);

const axle2 =
parsed.ひな壇 \* influence2.ひな壇 +
parsed.中間① \* influence2.中間① +
parsed.中間② \* influence2.中間② +
parsed.後部 \* influence2.後部;

const axle3 =
parsed.ひな壇 \* influence3.ひな壇 +
parsed.中間① \* influence3.中間① +
parsed.中間② \* influence3.中間② +
parsed.後部 \* influence3.後部;

const total = parsed.ひな壇 + parsed.中間① + parsed.中間② + parsed.後部;

const remain2 = Math.max(0, MAX\_AXLE2 - axle2);
const remain3 = Math.max(0, MAX\_AXLE3 - axle3);
const remainTotal = Math.max(0, MAX\_TOTAL - total);

const allAreas = \["中間②", "後部"];
const empty = allAreas.filter((key) => !weights\[key]);
const recommended = {};

if (empty.length > 0 && remainTotal > 0) {
const ratios = { 中間②: 0.601, 後部: 0.399 }; // 11852 / 19700 ≒ 0.601
const ratioSum = empty.reduce((acc, key) => acc + ratios\[key], 0);

```
empty.forEach((key) => {
  recommended[key] = Math.round((remainTotal * ratios[key]) / ratioSum);
});
```

}

return (
\<div style={{ padding: "2rem" }}> <h2>第2軸 荷重計算ツール（19700kg分配）</h2>
{Object.keys(weights).map((key) => (
\<div key={key} style={{ marginBottom: "1rem" }}> <label>
{key}（kg）：
\<input
type="number"
value={weights\[key]}
onChange={(e) => setWeights({ ...weights, \[key]: e.target.value })}
style={{ marginLeft: "0.5rem" }}
/>
\<button
onClick={() => setWeights({ ...weights, \[key]: "" })}
style={{ marginLeft: "0.5rem" }}
\>
✖ </button> </label> </div>
))}

```
  <div>
    <strong>現在の第2軸荷重：</strong>
    {Math.round(axle2).toLocaleString()}kg
  </div>
  <div>
    <strong>現在の第3軸荷重：</strong>
    {Math.round(axle3).toLocaleString()}kg
  </div>
  <div>
    <strong>あと積める目安：</strong>
    {Math.round(remain2).toLocaleString()}kg（第2軸） ／ {Math.round(
      remain3
    ).toLocaleString()}kg（第3軸）
  </div>

  {empty.length > 0 && (
    <div style={{ marginTop: "1rem" }}>
      👉 <strong>{empty.join("、")}</strong> が未入力です
    </div>
  )}

  {empty.length > 0 && (
    <div style={{ marginTop: "1rem" }}>
      <strong>目安積載量（全体19700kg配分）：</strong>
      <ul>
        {Object.entries(recommended).map(([k, v]) => (
          <li key={k}>{k}：{v.toLocaleString()}kg</li>
        ))}
      </ul>
    </div>
  )}
</div>
```

);
}
