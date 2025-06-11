import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function App() {
  const [weights, setWeights] = useState({
    ひな壇: "",
    中間1: "",
    中間2: "",
    後部: "",
  });

  const coefficients = {
    ひな壇: 1.1768,
    中間1: 0.3344,
    中間2: 0.1491,
    後部: -0.2180,
  };

  const intercept = 3554.87;

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const predictedAxleLoad =
    parsedWeights.ひな壇 * coefficients.ひな壇 +
    parsedWeights.中間1 * coefficients.中間1 +
    parsedWeights.中間2 * coefficients.中間2 +
    parsedWeights.後部 * coefficients.後部 +
    intercept;

  const data = [
    { name: "第2軸荷重", value: Math.round(predictedAxleLoad) },
    { name: "制限値", value: 10000 },
  ];

  const handleChange = (e) => {
    setWeights({ ...weights, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">再学習版｜第2軸荷重シミュレーター</h1>

      {Object.keys(weights).map((key) => (
        <div key={key} className="mb-2">
          <label className="block mb-1">{key}</label>
          <input
            type="number"
            name={key}
            value={weights[key]}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
      ))}

      <div className="mt-4">
        <p>予測される第2軸荷重：<strong>{Math.round(predictedAxleLoad)} kg</strong></p>
      </div>

      <div className="mt-4" style={{ height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
