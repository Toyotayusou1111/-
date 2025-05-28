import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_AXLE_LOAD = 10000;

export default function AxleCalculator() {
  const [weights, setWeights] = useState({ front: "", mid1: "", mid2: "", rear: "" });

  const influences = {
    front: 0.6,
    mid1: 0.8,
    mid2: 0.5,
    rear: 0.2,
  };

  const parsedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, val]) => [key, parseFloat(val) || 0])
  );

  const usedLoad =
    parsedWeights.front * influences.front +
    parsedWeights.mid1 * influences.mid1 +
    parsedWeights.mid2 * influences.mid2 +
    parsedWeights.rear * influences.rear;

  const remaining = Math.max(0, MAX_AXLE_LOAD - usedLoad);

  const emptyKeys = Object.entries(weights)
    .filter(([_, val]) => val === "")
    .map(([key]) => key);

  const weightSuggestions = Object.fromEntries(
    emptyKeys.map((key) => {
      const denom = emptyKeys.reduce((sum, k) => sum + influences[k] ** 2, 0);
      const suggestion = ((influences[key] ** 2) / denom) * (remaining / influences[key]);
      return [key, Math.round(suggestion)];
    })
  );

  const handleChange = (key, val) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-center">第2軸荷重自動計算ツール</h1>

      {Object.entries({ front: "前部", mid1: "中間①", mid2: "中間②", rear: "後部" }).map(
        ([key, label]) => (
          <Card key={key}>
            <CardContent className="p-4 grid gap-2">
              <Label>{label}（影響率 {influences[key] * 100}%）</Label>
              <Input
                type="number"
                value={weights[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`重量を入力（kg）`}
              />
              {weights[key] === "" && (
                <div className="text-sm text-muted-foreground">
                  ▶ 目安：{weightSuggestions[key] ?? "-"} kg
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}

      <div className="text-center mt-4">
        <strong>現在の第2軸荷重：</strong> {usedLoad.toFixed(0)} kg / {MAX_AXLE_LOAD} kg
      </div>
    </div>
  );
}