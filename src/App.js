import React, { useState } from "react";

export default function App() {
const \[weights, setWeights] = useState({
ひな壇: "",
中間①: "",
中間②: "",
後部: "",
});

const influences = {
ひな壇: 0.6,
中間①: 0.8,
中間②: 0.5,
後部: 0.2,
};

const influences3rd = {
中間②: 0.6,
後部: 0.4,
};

const MAX\_AXLE\_2 = 10000;
const MAX\_AXLE\_3 = 20000;
const MAX\_TOTAL\_LOAD = 19700;

const parsedWeights = Object.fromEntries(
Object.entries(weights).map((\[key, val]) => \[key, parseFloat(val) || 0])
);

const usedAxle2 =
parsedWeights.ひな壇 \* influences.ひな壇 +
parsedWeights.中間① \* influences.中間① +
parsedWeights.中間② \* influences.中間② +
parsedWeights.後部 \* influences.後部;

const usedAxle3 =
parsedWeights.中間② \* influences3rd.中間② +
parsedWeights.後部 \* influences3rd.後部;

const usedTotal = Object.values(parsedWeights).reduce(
(acc, val) => acc + val,
0
);

const remaining2 = Math.max(0, MAX\_AXLE\_2 - usedAxle2);
const remaining3 = Math.max(0, MAX\_AXLE\_3 - usedAxle3);
const remainingTotal = Math.max(0, MAX\_TOTAL\_LOAD - usedTotal);

const areas = \["中間①", "中間②", "後部"];
const emptyAreas = areas.filter((area) => !weights\[area]);

const recommended = {};
if (emptyAreas.length > 0 && remainingTotal > 0) {
const ratios = {
中間①: 0.229,
中間②: 0.292,
後部: 0.276,
};

```
const ratioSum = emptyAreas.reduce((acc, key) => acc + ratios[key], 0);
emptyAreas.forEach((key) => {
  recommended[key] = Math.round(
    (MAX_TOTAL_LOAD * ratios[key]) / ratioSum
  );
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
{Math.round(usedAxle2).toLocaleString()}kg </div> <div> <strong>現在の第3軸荷重：</strong>
{Math.round(usedAxle3).toLocaleString()}kg </div> <div> <strong>あと積める目安：</strong>
{Math.round(remaining2).toLocaleString()}kg（第2軸） ／ {Math.round(
remaining3
).toLocaleString()}kg（第3軸） </div>
{emptyAreas.length > 0 && (
\<div style={{ marginTop: "1rem" }}>
👉 <strong>{emptyAreas.join(", ")}</strong>
が未入力です </div>
)}
{emptyAreas.length > 0 && (
\<div style={{ marginTop: "1rem" }}> <strong>目安積載量（全体19700kg配分）：</strong> <ul>
{Object.entries(recommended).map((\[key, val]) => ( <li key={key}>
{key}：{val.toLocaleString()}kg </li>
))} </ul> </div>
)} </div>
);
}
