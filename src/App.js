import React, { useState } from "react";

export default function App() {
  const [logs, setLogs] = useState([{ id: 1, driver: "", assistant: "" }]);

  const handleChange = (id, field, value) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === id ? { ...log, [field]: value } : log
      )
    );
  };

  const addLog = () => {
    const newId = logs.length > 0 ? logs[logs.length - 1].id + 1 : 1;
    setLogs([...logs, { id: newId, driver: "", assistant: "" }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Lift Log Cloud</h1>

      {logs.map((log) => (
        <div
          key={log.id}
          className="bg-white p-4 rounded-2xl shadow mb-4 flex flex-col gap-4"
        >
          <div>
            <label className="block font-semibold mb-1">運転席</label>
            <input
              type="text"
              value={log.driver}
              onChange={(e) => handleChange(log.id, "driver", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="運転席の名前"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">助手席</label>
            <input
              type="text"
              value={log.assistant}
              onChange={(e) => handleChange(log.id, "assistant", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="助手席の名前"
            />
          </div>
        </div>
      ))}

      <div className="fixed bottom-4 left-4">
        <button
          onClick={addLog}
          className="bg-blue-500 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-600"
        >
          ＋ 便を追加
        </button>
      </div>
    </div>
  );
}
