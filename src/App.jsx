import { useState, useEffect } from "react";
import "./index.css";
import { db } from "./firebase";
import { ref, push, onValue, remove } from "firebase/database";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    const monthRef = ref(db, "transactions/" + selectedMonth);
    return onValue(monthRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      setTransactions(list);
      const newBalance = list.reduce(
        (acc, t) => acc + (t.type === "add" ? t.amount : -t.amount),
        0
      );
      setBalance(newBalance);
    });
  }, [selectedMonth]);

  const addTransaction = (type) => {
    if (!amount || isNaN(amount)) return;
    const num = parseFloat(amount);
    const now = new Date();
    const record = {
      amount: num,
      type,
      time: now.toLocaleTimeString(),
      note,
      id: now.getTime(),
    };
    const monthRef = ref(db, "transactions/" + selectedMonth);
    push(monthRef, record);
    setAmount("");
    setNote("");
  };

  const deleteAll = () => {
    const monthRef = ref(db, "transactions/" + selectedMonth);
    remove(monthRef);
  };

  // 折線圖資料
  const dailySums = {};
  transactions.forEach((t) => {
    const day = new Date(t.id).getDate();
    dailySums[day] = (dailySums[day] || 0) + (t.type === "add" ? t.amount : -t.amount);
  });
  const lineData = {
    labels: Array.from({ length: 31 }, (_, i) => i + 1),
    datasets: [
      {
        label: `${selectedMonth} 每日變化`,
        data: Array.from({ length: 31 }, (_, i) => dailySums[i + 1] || 0),
        borderColor: "#4fc3f7",
        backgroundColor: "#0288d1",
        tension: 0.3,
      },
    ],
  };

  // 圓餅圖資料
  const addStats = {};
  const subtractStats = {};
  transactions.forEach((t) => {
    const target = t.type === "add" ? addStats : subtractStats;
    const category = t.note || "未分類";
    target[category] = (target[category] || 0) + t.amount;
  });

  const pieAddData = {
    labels: Object.keys(addStats),
    datasets: [
      {
        data: Object.values(addStats),
        backgroundColor: ["#81c784", "#4caf50", "#2e7d32", "#66bb6a", "#a5d6a7"],
      },
    ],
  };

  const pieSubData = {
    labels: Object.keys(subtractStats),
    datasets: [
      {
        data: Object.values(subtractStats),
        backgroundColor: ["#ef5350", "#e53935", "#d32f2f", "#f44336", "#ffcdd2"],
      },
    ],
  };

  return (
    <div className="app-outer">
      <div className="app-card">
        <h2>智慧記帳 App</h2>
        <h3>💰 總金額：<span className="balance">{balance} 元</span></h3>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-amount"
        />

        <input
          type="number"
          placeholder="輸入金額"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-amount"
        />

        <input
          type="text"
          placeholder="輸入明細（例如 早餐）"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input-amount"
        />

        <div className="btn-group">
          <button className="btn btn-add" onClick={() => addTransaction("add")}>➕ 存入</button>
          <button className="btn btn-subtract" onClick={() => addTransaction("subtract")}>➖ 支出</button>
        </div>

        <button className="btn btn-clear" onClick={deleteAll}>清除所有紀錄</button>

        <ul className="record-list">
          {transactions.map((t) => (
            <li key={t.id} className={`record-item ${t.type}`}>
              {t.type === "add" ? "➕" : "➖"} {t.amount} 元 ({t.time})<br />
              <span className="note">{t.note || "未分類"}</span>
            </li>
          ))}
        </ul>

        <h3>📈 每日變化圖</h3>
        <Line data={lineData} />

        <h3>📊 分類統計圖 - 存入</h3>
        <Pie data={pieAddData} />

        <h3>📊 分類統計圖 - 支出</h3>
        <Pie data={pieSubData} />
      </div>
    </div>
  );
}

export default App;
