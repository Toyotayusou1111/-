<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>積載量計算ツール</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      padding: 0;
      background-color: #f4f4f9;
    }
    .container {
      width: 50%;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      text-align: center;
    }
    label, input, button {
      width: 100%;
      margin-bottom: 10px;
      padding: 10px;
      font-size: 16px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
    .result {
      padding: 10px;
      background-color: #e0f7fa;
      margin-top: 20px;
      border-radius: 5px;
    }
  </style>
</head>
<body>

  <div class="container">
    <h1>積載量計算ツール</h1>
    <label for="remainTotal">残り積載量（kg）:</label>
    <input type="number" id="remainTotal" placeholder="残り積載量を入力" required>
    
    <label for="remainAxle">残り第2軸荷重（kg）:</label>
    <input type="number" id="remainAxle" placeholder="残り第2軸荷重を入力" required>
    
    <button onclick="calculateLoad()">計算</button>

    <div class="result" id="result" style="display:none;">
      <h3>積載目安結果</h3>
      <p><strong>フロントエリア:</strong> <span id="frontResult"></span> kg</p>
      <p><strong>中間①エリア:</strong> <span id="middle1Result"></span> kg</p>
      <p><strong>中間②エリア:</strong> <span id="middle2Result"></span> kg</p>
      <p><strong>後部エリア:</strong> <span id="rearResult"></span> kg</p>
    </div>
  </div>

  <script>
    // 係数定義
    const COEF = {
      front: 0.1,  // フロントエリア係数
      middle1: 0.08, // 中間①エリア係数
      middle2: 0.0975, // 中間②エリア係数（マイナス影響）
      rear: 0.0433 // 後部エリア係数（マイナス影響）
    };

    // 積載量計算ロジック
    function calculateLoad() {
      const remainTotal = parseFloat(document.getElementById('remainTotal').value);
      const remainAxle = parseFloat(document.getElementById('remainAxle').value);
      const coefSum = COEF.front + COEF.middle1 + COEF.middle2 + COEF.rear;

      // 入力値チェック
      if (isNaN(remainTotal) || isNaN(remainAxle)) {
        alert("積載量と荷重の値を正しく入力してください");
        return;
      }

      const estimate = [
        { key: 'front', load: 0 },
        { key: 'middle1', load: 0 },
        { key: 'middle2', load: 0 },
        { key: 'rear', load: 0 }
      ];

      // 計算処理
      for (let a of estimate) {
        if (a.key === 'middle2' || a.key === 'rear') {
          // 中間②、後部エリアの計算修正：積載量が増えると第2軸荷重の余裕が増えるように計算
          a.load = Math.min(
            remainTotal * (COEF[a.key] / coefSum),
            remainAxle * (COEF[a.key] / coefSum)
          );
        } else {
          a.load = Math.min(
            remainTotal * (COEF[a.key] / coefSum),
            remainAxle * COEF[a.key]
          );
        }
      }

      // 結果表示
      document.getElementById('frontResult').innerText = estimate[0].load.toFixed(2);
      document.getElementById('middle1Result').innerText = estimate[1].load.toFixed(2);
      document.getElementById('middle2Result').innerText = estimate[2].load.toFixed(2);
      document.getElementById('rearResult').innerText = estimate[3].load.toFixed(2);
      
      // 結果エリアを表示
      document.getElementById('result').style.display = 'block';
    }
  </script>

</body>
</html>
