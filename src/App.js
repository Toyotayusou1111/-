import React, { useState } from "react";

export default function App() {
const \[weights, setWeights] = useState({
ひな壇: "",
中間①: "",
中間②: "",
後部: "",
});

const influences2 = {
ひな壇: 0.6,
中間①: 0.8,
中間②: 0.5,
後部: 0.2,
};

const influences3 = {
ひな壇: 0.05,
中間①: 0.15,
中間②: 0.4,
後部: 0.4,
};

const MAX\_AXLE2 = 10000;
const MAX\_AXLE3 = 20000;
const MAX\_TOTAL = 19700;

const parsed = Object.fromEntries(
Object.entries(weights).map((\[key, val]) => \[key, parseFloat(val) || 0])
);

const usedAxle2 =
parsed.ひな壇 \* influences2.ひな壇 +
parsed.中間① \* influences2.中間① +
parsed.中間② \* influences2.中間② +
parsed.後部 \* influences2.後部;

const usedAxle3 =
parsed.ひな壇 \* influences3.ひな壇 +
parsed.中間① \* influences3.中間① +
parsed.中間② \* influences3.中間② +
parsed.後部 \* influences3.後部;

const usedTotal =
parsed.ひな壇 + parsed.中間① + parsed.中間② + parsed.後部;

const remainAxle2 = Math.max(0, MAX\_AXLE2 - usedAxle2);
const remainAxle3 = Math.max(0, MAX\_AXLE3 - usedAxle3);
const remainTotal = Math.max(0, MAX\_TOTAL - usedTotal);

const areas = \["中間①", "中間②", "後部"];
const empty = areas.filter((k) => !weights\[k]);

const recommend = {};
if (empty.length > 0 && remainAxle2 > 0 && remainTotal > 0) {
const ratio = {
中間①: 0.2594,
中間②: 0.3971,
後部: 0.3435,
};
const rSum = empty.reduce((a, k) => a + ratio\[k], 0);
const raw = {};
empty.forEach((k) => {
raw\[k] = remainTotal \* (ratio\[k] / rSum);
});
const axle2Pre = parsed.ひな壇 \* influences2.ひな壇;
const axle2Raw = Object.entries(raw).reduce(
(a, \[k, v]) => a + v \* influences2\[k],
axle2Pre
);
const scale = (MAX\_AXLE2 - axle2Pre) / (axle2Raw - axle2Pre);
empty.forEach((k) => {
recommend\[k] = Math.round(raw\[k] \* scale);
});
}

return (
\<div style={{ padding: "2rem" }}> <h2>第2軸 荷重計算ツール</h2>
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
))} <div> <strong>現在の第2軸荷重：</strong>
{Math.round(usedAxle2).toLocaleString()}kg </div> <div> <strong>現在の第3軸荷重：</strong>
{Math.round(usedAxle3).toLocaleString()}kg </div> <div> <strong>あと積める目安：</strong>
{Math.round(remainAxle2).toLocaleString()}kg（第2軸） ／ {Math.round(remainAxle3).toLocaleString()}kg（第3軸） </div>
{empty.length > 0 && (
\<div style={{ marginTop: "1rem" }}>
👉 <strong>{empty.join(", ")}</strong> が未入力です </div>
)}
{empty.length > 0 && (
\<div style={{ marginTop: "1rem" }}> <strong>各エリア別 積載目安（第2軸10t & 合計19700kg範囲）</strong> <ul>
{Object.entries(recommend).map((\[key, val]) => ( <li key={key}>{key}：{val.toLocaleString()}kg</li>
))} </ul> </div>
)} </div>
);
}
