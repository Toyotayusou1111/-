import React, { useState } from "react";

export default function App() {
  const [weights, setWeights] = useState({
    hinadan: "",
    chukan1: "",
    chukan2: "",
    koubu: "",
  });

  const parsed = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  // 第2軸荷重（乖離最小化モデルによる予測）
  const axleWeight =
    1.2007 * parsed.hinadan +
    0.3345 * parsed.chukan1 +
    0.1491 * parsed.chukan2 +
    -0.2180 * parsed.koubu +
    3554.87;

  const totalWeight =
    parsed.hinadan + parsed.chukan1 + parsed.chukan2 + parsed.koubu;

  const deficit = 10000 - axleWeight;
  const comment =
    axleWeight < 9700
      ? "△ 第2軸荷重がやや不足しています。バランスに注意。"
      : axleWeight > 10000
      ? "⚠️ 第2軸荷重が超過しています。積載位置を見直してください。"
      : "◎ 第2軸荷重は適正です。";

  const handleChange = (e) => {
    setWeights({ ...weights, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>第2軸 荷重計算ツール</h1>
      {[
        ["ひな壇（kg）", "hinadan"],
        ["中間1（kg）", "chukan1"],
        ["中間2（kg）", "chukan2"],
        ["後部（kg）", "koubu"],
      ].map(([label, name]) => (
        <div key={name} style={{ marginBottom: "1rem" }}>
          <label>{label}</label>
          <input
            type="number"
            name={name}
            value={weights[name]}
            onChange={handleChange}
            style={{ marginLeft: 10, padding: 5 }}
          />
        </div>
      ))}

      <p><strong>現在の第2軸荷重：</strong>{axleWeight.toLocaleString()}kg</p>
      <p><strong>現在の総積載量：</strong>{totalWeight.toLocaleString()}kg</p>
      <p><strong>あと積める目安：</strong>{deficit.toLocaleString(undefined, { minimumFractionDigits: 3 })}kg（第2軸）</p>
      <p style={{ color: "orange" }}><strong>診断コメント：</strong>{comment}</p>
    </div>
  );
}
