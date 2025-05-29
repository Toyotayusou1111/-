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

const remaining = Math.max(0, MAX\_AXLE\_LOAD - usedLoad);

const allKeys = \["mid1", "mid2", "rear"];
const emptyAreas = allKeys.filter((key) => !weights\[key]);

const recommended = {};

if (emptyAreas.length > 0 && remaining > 0) {
const denominator = emptyAreas.reduce(
(sum, area) => sum + Math.pow(influences\[area], 2),
0
);

```
emptyAreas.forEach((area) => {
  const ratio = Math.pow(influences[area], 2) / denominator;
  recommended[area] = Math.round((remaining / influences[area]) * ratio);
});
```

}

const totalLoad =
parsedWeights.front +
parsedWeights.mid1 +
parsedWeights.mid2 +
parsedWeights.rear;

return (
\<div style={{ padding: 20 }}> <h2>第2軸 荷重計算ツール</h2>
{Object.keys(weights).map((key) => (
\<div key={key} style={{ marginBottom: 10 }}> <label>
{key.toUpperCase()}（kg）：
\<input
type="number"
value={weights\[key]}
onChange={(e) =>
setWeights({ ...weights, \[key]: e.target.value })
}
style={{ marginLeft: 10 }}
/>
\<button onClick={() => setWeights({ ...weights, \[key]: "" })}>
× </button> </label> </div>
))} <p> <strong>現在の第2軸荷重：</strong>
{usedLoad.toFixed(0)}kg </p> <p> <strong>あと積める目安：</strong>
{remaining.toFixed(0)}kg </p>
{emptyAreas.length > 0 && (
<> <p>👉 <strong>{emptyAreas.map((a) => a.toUpperCase()).join(", ")}</strong> が未入力です</p> <p> <strong>各エリア別 積載目安（第2軸10t超えない範囲）：</strong> </p> <ul>
{Object.entries(recommended).map((\[key, val]) => ( <li key={key}>
{key.toUpperCase()}：{val}kg </li>
))} </ul>
\</>
)} <p> <strong>総積載重量：</strong> {totalLoad.toFixed(0)}kg ／ 19700kg </p> </div>
);
}
