import React, { useState } from "react";

export default function App() {
const \[weights, setWeights] = useState({
front: "",
mid1: "",
mid2: "",
rear: "",
});

const influences = {
front: 0.6,
mid1: 0.8,
mid2: 0.5,
rear: 0.2,
};

const MAX\_AXLE\_LOAD = 10000;
const MAX\_TOTAL\_LOAD = 19700;

const parsedWeights = Object.fromEntries(
Object.entries(weights).map((\[key, val]) => \[key, parseFloat(val) || 0])
);

const usedLoad =
parsedWeights.front \* influences.front +
parsedWeights.mid1 \* influences.mid1 +
parsedWeights.mid2 \* influences.mid2 +
parsedWeights.rear \* influences.rear;

const remainingAxle = Math.max(0, MAX\_AXLE\_LOAD - usedLoad);
const usedTotal =
parsedWeights.front +
parsedWeights.mid1 +
parsedWeights.mid2 +
parsedWeights.rear;
const remainingTotal = Math.max(0, MAX\_TOTAL\_LOAD - usedTotal);

const areas = \["mid1", "mid2", "rear"];
const emptyAreas = areas.filter((area) => !weights\[area]);

const recommended = {};
if (emptyAreas.length > 0 && remainingAxle > 0 && remainingTotal > 0) {
const ratios = {
mid1: 0.211,
mid2: 0.323,
rear: 0.279,
};

```
// 未入力エリアの合計比率
const ratioSum = emptyAreas.reduce((acc, key) => acc + ratios[key], 0);

const rawRecommended = {};
emptyAreas.forEach((key) => {
  rawRecommended[key] = MAX_TOTAL_LOAD * (ratios[key] / ratioSum);
});

const frontAxle = parsedWeights.front * influences.front;
const rawAxle = Object.entries(rawRecommended).reduce(
  (acc, [key, val]) => acc + val * influences[key],
  frontAxle
);

const scale = (MAX_AXLE_LOAD - frontAxle) / (rawAxle - frontAxle);

emptyAreas.forEach((key) => {
  recommended[key] = Math.round(rawRecommended[key] * scale);
});
```

}

return (
\<div style={{ padding: "2rem" }}> <h2>第2軸 荷重計算ツール</h2>
{Object.keys(weights).map((key) => (
\<div key={key} style={{ marginBottom: "1rem" }}> <label>
{key.toUpperCase()}（kg）：
\<input
type="number"
value={weights\[key]}
onChange={(e) =>
setWeights({ ...weights, \[key]: e.target.value })
}
style={{ marginLeft: "0.5rem" }}
/>
\<button
onClick={() => setWeights({ ...weights, \[key]: "" })}
style={{ marginLeft: "0.5rem" }}
\>
✖ </button> </label> </div>
))} <div> <strong>現在の第2軸荷重：</strong>
{Math.round(usedLoad).toLocaleString()}kg </div> <div> <strong>あと積める目安：</strong>
{Math.round(remainingAxle).toLocaleString()}kg </div>
{emptyAreas.length > 0 && (
\<div style={{ marginTop: "1rem" }}>
👉 <strong>{emptyAreas.map((e) => e.toUpperCase()).join(", ")}</strong>
が未入力です </div>
)}
{emptyAreas.length > 0 && (
\<div style={{ marginTop: "1rem" }}> <strong>各エリア別 積載目安（第2軸10t & 合計19700kg範囲）</strong> <ul>
{Object.entries(recommended).map((\[key, val]) => ( <li key={key}>
{key.toUpperCase()}：{val.toLocaleString()}kg </li>
))} </ul> </div>
)} </div>
);
}
