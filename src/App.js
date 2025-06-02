import React, { useState } from "react";

export default function App() {
const \[weights, setWeights] = useState({
ひな壇: "",
中間①: "",
中間②: "",
後部: "",
});

// 影響係数
const influences = {
ひな壇: 0.6,
中間①: 0.8,
中間②: 0.5,
後部: 0.2,
};

// 第2軸と第3軸の影響係数
const axle2Keys = \["ひな壇", "中間①"];
const axle3Keys = \["中間②", "後部"];

const MAX\_AXLE2 = 10000;
const MAX\_AXLE3 = 20000;
const MAX\_TOTAL = 19700;

const parsed = Object.fromEntries(
Object.entries(weights).map((\[k, v]) => \[k, parseFloat(v) || 0])
);

const axle2Load = axle2Keys.reduce((sum, key) => sum + parsed\[key] \* influences\[key], 0);
const axle3Load = axle3Keys.reduce((sum, key) => sum + parsed\[key] \* influences\[key], 0);
const totalLoad = Object.values(parsed).reduce((sum, v) => sum + v, 0);

const remainingAxle2 = Math.max(0, MAX\_AXLE2 - axle2Load);
const remainingAxle3 = Math.max(0, MAX\_AXLE3 - axle3Load);
const remainingTotal = Math.max(0, MAX\_TOTAL - totalLoad);

// 空欄のエリア
const emptyAreas = Object.keys(weights).filter((key) => !weights\[key]);

// 修正済の正規比率（合計19,700kg時）
const ratios = {
ひな壇: 0.200,
中間①: 0.205,
中間②: 0.326,
後部: 0.267,
};

// 推奨積載量
const recommended = {};
if (emptyAreas.length > 0 && remainingTotal > 0) {
const ratioSum = emptyAreas.reduce((sum, key) => sum + ratios\[key], 0);
emptyAreas.forEach((key) => {
recommended\[key] = Math.round((MAX\_TOTAL \* ratios\[key]) / ratioSum);
});
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
\>✖</button> </label> </div>
))}

```
  <div>
    <strong>現在の第2軸荷重：</strong>{Math.round(axle2Load).toLocaleString()}kg
  </div>
  <div>
    <strong>現在の第3軸荷重：</strong>{Math.round(axle3Load).toLocaleString()}kg
  </div>
  <div>
    <strong>あと積める目安：</strong>
    {Math.round(remainingAxle2).toLocaleString()}kg（第2軸） ／ {Math.round(remainingAxle3).toLocaleString()}kg（第3軸）
  </div>

  {emptyAreas.length > 0 && (
    <div style={{ marginTop: "1rem" }}>
      👉 <strong>{emptyAreas.join("、")}</strong> が未入力です
    </div>
  )}

  {emptyAreas.length > 0 && (
    <div style={{ marginTop: "1rem" }}>
      <strong>目安積載量（全体19700kg配分）：</strong>
      <ul>
        {Object.entries(recommended).map(([key, val]) => (
          <li key={key}>{key}：{val.toLocaleString()}kg</li>
        ))}
      </ul>
    </div>
  )}
</div>
```

);
}
