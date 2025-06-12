import React, { useState } from "react";

const initialArea = () => ({
  assistant: ["", "", "", ""],
  driver: ["", "", "", ""],
});

const initialBin = () => ({
  id: Date.now(),
  areas: {
    ひな壇: initialArea(),
    中間1: initialArea(),
    中間2: initialArea(),
    後部: initialArea(),
  },
});

const AREA_WEIGHTS = {
  ひな壇: 3700,
  中間1: 4100,
  中間2: 6400,
  後部: 5500,
};

const AREA_COEFFICIENTS = {
  ひな壇: 0.6,
  中間1: 0.8,
  中間2: 0.5,
  後部: 0.2,
};

export default function App() {
  const [bins, setBins] = useState([initialBin()]);

  const handleInputChange = (binId, area, role, index, value) => {
    const updatedBins = bins.map((bin) => {
      if (bin.id !== binId) return bin;
      const newBin = { ...bin };
      newBin.areas[area][role][index] = value;
      return newBin;
    });
    setBins(updatedBins);
  };

  const calcAreaTotal = (areaData) => {
    const allValues = [...areaData.assistant, ...areaData.driver];
    return allValues.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const calcAxleLoad = (bin) => {
    return Object.entries(bin.areas).reduce((sum, [key, area]) => {
      const total = calcAreaTotal(area);
      return sum + total * AREA_COEFFICIENTS[key];
    }, 0);
  };

  const addBin = () => {
    setBins([...bins, initialBin()]);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">リフト重量記録（便単位）</h1>

      {bins.map((bin, binIndex) => (
        <div key={bin.id} className="bg-white rounded-2xl p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">便名：{binIndex + 1}</h2>

          {Object.entries(bin.areas).map(([areaName, areaData]) => (
            <div key={areaName} className="mb-6 border-b pb-4">
              <h3 className="font-bold mb-2">
                {areaName}（{AREA_WEIGHTS[areaName].toLocaleString()}kg）
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {areaData.assistant.map((val, idx) => (
                    <div key={idx} className="mb-1">
                      <label className="text-sm mr-2">
                        助手席{idx + 1}：
                      </label>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          handleInputChange(
                            bin.id,
                            areaName,
                            "assistant",
                            idx,
                            e.target.value
                          )
                        }
                        className="border px-2 py-1 rounded w-24"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  {areaData.driver.map((val, idx) => (
                    <div key={idx} className="mb-1">
                      <label className="text-sm mr-2">
                        運転席{idx + 1}：
                      </label>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          handleInputChange(
                            bin.id,
                            areaName,
                            "driver",
                            idx,
                            e.target.value
                          )
                        }
                        className="border px-2 py-1 rounded w-24"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                ➤ エリア合計: {calcAreaTotal(areaData)}kg
              </p>
            </div>
          ))}

          <div className="text-right font-semibold">
            第2軸荷重：{calcAxleLoad(bin).toFixed(0)}kg
          </div>
        </div>
      ))}

      <div className="fixed bottom-4 left-4">
        <button
          onClick={addBin}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          ＋便を追加する
        </button>
      </div>
    </div>
  );
}

