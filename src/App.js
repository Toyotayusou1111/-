import React, { useState } from "react";

const COEF = {
  front: 0.1,
  middle1: 0.08,
  middle2: 0.0975,
  rear: 0.0433,
};

export default function App() {
  const [remainTotal, setRemainTotal] = useState("");
  const [remainAxle, setRemainAxle] = useState("");
  const [results, setResults] = useState(null);

  const calculateLoad = () => {
    const total = parseFloat(remainTotal);
    const axle = parseFloat(remainAxle);
    const coefSum = Object.values(COEF).reduce((a, b) => a + b, 0);

    if (isNaN(total) || isNaN(axle)) {
      alert("正しい数値を入力してください。");
      return;
    }

    const estimate = Object.entries(COEF).map(([key, coef]) => {
      let load;
      if (key === "middle2" || key === "rear") {
        // 第2軸へ軽く作用するエリアは多く積める
        load = Math.min(total * (coef / coefSum), axle * (1 - coef));
      } else {
        // 正方向に重くなるエリアは制限強めに
        load = Math.min(total * (coef / coefSum), axle * coef);
      }
      return { key, load: load.toFixed(2) };
    });

    setResults(estimate);
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: "1rem", background: "#f9f9f9", borderRadius: "10px" }}>
      <h1>積載量計算ツール</h1>

      <label>残り積載量（kg）</label>
      <input
        type="number"
        value={remainTotal}
        onChange={(e) => setRemainTotal(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
      />

      <label>残り第2軸荷重（kg）</label>
      <input
        type="number"
        value={remainAxle}
        onChange={(e) => setRemainAxle(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
      />

      <button
        onClick={calculateLoad}
        style={{
          width: "100%",
          padding: "12px",
          background: "#4CAF50",
          color: "white",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
        }}
      >
        計算
      </button>

      {results && (
        <div style={{ marginTop: "2rem", background: "#fff", padding: "1rem", borderRadius: 8 }}>
          <h3>積載目安結果</h3>
          {results.map(({ key, load }) => (
            <p key={key}>
              <strong>{displayName(key)}:</strong> {load} kg
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function displayName(key) {
  switch (key) {
    case "front":
      return "フロントエリア";
    case "middle1":
      return "中間①エリア";
    case "middle2":
      return "中間②エリア";
    case "rear":
      return "後部エリア";
    default:
      return key;
  }
}
