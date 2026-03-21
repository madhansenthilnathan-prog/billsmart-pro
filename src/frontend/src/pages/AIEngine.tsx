import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "../lib/formatters";
import {
  sampleExpenses,
  sampleInvoices,
  sampleProducts,
} from "../lib/sampleData";

const CARD = {
  background: "oklch(0.19 0.025 230)",
  border: "1px solid oklch(0.26 0.025 230)",
};
const INNER = { background: "oklch(0.22 0.025 230)" };

function SectionTitle({
  icon,
  title,
  subtitle,
  color,
}: { icon: string; title: string; subtitle: string; color: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${color} / 0.15` }}
      >
        {icon}
      </div>
      <div>
        <h3
          className="font-semibold text-sm"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          {title}
        </h3>
        <p className="text-xs" style={{ color: "oklch(0.67 0.02 230)" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function AIEngine() {
  const [revenueTarget, setRevenueTarget] = useState(150000);
  const [goalInput, setGoalInput] = useState("150000");

  const totalRevenue = sampleInvoices.reduce((s, i) => s + i.total, 0);
  const goalProgress = Math.min(100, (totalRevenue / revenueTarget) * 100);
  const remainingDays = 13;
  const dailyNeeded = (revenueTarget - totalRevenue) / remainingDays;

  const profitData = [
    { category: "Grains", revenue: 12000, cost: 9200, profit: 2800 },
    { category: "Oils", revenue: 8500, cost: 7200, profit: 1300 },
    { category: "Pulses", revenue: 6000, cost: 4800, profit: 1200 },
    { category: "Dairy", revenue: 9500, cost: 7800, profit: 1700 },
    { category: "Cleaning", revenue: 11000, cost: 8500, profit: 2500 },
    { category: "Snacks", revenue: 4500, cost: 3200, profit: 1300 },
  ];

  const dnaData = [
    {
      name: "Parle-G Biscuits",
      velocity: "Very High",
      margin: 33,
      turnover: 8.2,
      grade: "A",
    },
    {
      name: "Basmati Rice 5kg",
      velocity: "High",
      margin: 20,
      turnover: 4.1,
      grade: "A",
    },
    {
      name: "Surf Excel 1kg",
      velocity: "Medium",
      margin: 16,
      turnover: 2.8,
      grade: "B",
    },
    {
      name: "Toor Dal 1kg",
      velocity: "Medium",
      margin: 21,
      turnover: 3.2,
      grade: "B",
    },
    {
      name: "Sunflower Oil 1L",
      velocity: "Low",
      margin: 18,
      turnover: 1.4,
      grade: "C",
    },
    {
      name: "Amul Butter 500g",
      velocity: "Very Low",
      margin: 14,
      turnover: 0.8,
      grade: "D",
    },
  ];

  const agingData = [
    { name: "Basmati Rice 5kg", "0-30": 30, "31-60": 10, "61-90": 5, "90+": 0 },
    { name: "Sunflower Oil 1L", "0-30": 2, "31-60": 1, "61-90": 0, "90+": 0 },
    { name: "Amul Butter 500g", "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 },
    { name: "Surf Excel 1kg", "0-30": 10, "31-60": 5, "61-90": 0, "90+": 0 },
  ];

  const gradeColors: Record<string, string> = {
    A: "oklch(0.73 0.15 160)",
    B: "oklch(0.79 0.13 185)",
    C: "oklch(0.75 0.15 70)",
    D: "oklch(0.58 0.18 25)",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          AI Inventory Intelligence Engine
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
          13 AI-powered tools analyzing your business data in real-time
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 1. Inventory DNA Sequencer */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🧬"
            title="Inventory DNA Sequencer"
            subtitle="Product performance profiles"
            color="oklch(0.79 0.13 185)"
          />
          <table className="w-full text-xs">
            <thead>
              <tr>
                {["Product", "Velocity", "Margin%", "Turnover", "Grade"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-1 pr-2 font-medium"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {dnaData.map((r) => (
                <tr
                  key={r.name}
                  className="border-t"
                  style={{ borderColor: "oklch(0.26 0.025 230)" }}
                >
                  <td
                    className="py-1.5 pr-2"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {r.name}
                  </td>
                  <td
                    className="py-1.5 pr-2"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {r.velocity}
                  </td>
                  <td
                    className="py-1.5 pr-2"
                    style={{ color: "oklch(0.73 0.15 160)" }}
                  >
                    {r.margin}%
                  </td>
                  <td
                    className="py-1.5 pr-2"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {r.turnover}x
                  </td>
                  <td className="py-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: `${gradeColors[r.grade]} / 0.15`,
                        color: gradeColors[r.grade],
                      }}
                    >
                      {r.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. Capital Lock Analyzer */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🔒"
            title="Capital Lock Analyzer"
            subtitle="Money tied in slow-moving stock"
            color="oklch(0.75 0.15 70)"
          />
          <div className="space-y-3">
            {[
              { name: "Basmati Rice 5kg", locked: 45 * 280, pct: 45 },
              { name: "Surf Excel 1kg", locked: 15 * 185, pct: 15 },
              { name: "Maggi Noodles 12pk", locked: 8 * 120, pct: 8 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "oklch(0.93 0.015 230)" }}>
                    {item.name}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "oklch(0.75 0.15 70)" }}
                  >
                    {formatINR(item.locked)}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ background: "oklch(0.26 0.025 230)" }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${item.pct}%`,
                      background: "oklch(0.75 0.15 70)",
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-lg p-3 mt-2" style={INNER}>
              <div
                className="text-xs"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Total Capital Locked
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "oklch(0.75 0.15 70)" }}
              >
                {formatINR(45 * 280 + 15 * 185 + 8 * 120)}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Silent Killer Detector */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="👻"
            title="Silent Killer Detector"
            subtitle="Items draining cash quietly"
            color="oklch(0.58 0.18 25)"
          />
          <div className="space-y-2">
            {[
              {
                name: "Amul Butter 500g",
                reason:
                  "0 stock but daily demand. Lost sales: ₹2,800 this month",
                severity: "high",
              },
              {
                name: "Sunflower Oil 1L",
                reason:
                  "Only 3 units. High velocity. Will stock-out in 1.5 days",
                severity: "high",
              },
              {
                name: "Colgate 200g",
                reason: "Only 2 units left. Moderate demand. Order soon",
                severity: "medium",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-lg p-3"
                style={{
                  ...INNER,
                  borderLeft: `3px solid ${item.severity === "high" ? "oklch(0.58 0.18 25)" : "oklch(0.75 0.15 70)"}`,
                }}
              >
                <div
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {item.name}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {item.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Phantom Predictor */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🔮"
            title="Phantom Predictor"
            subtitle="Demand forecast & restock planning"
            color="oklch(0.58 0.18 255)"
          />
          <table className="w-full text-xs">
            <thead>
              <tr>
                {["Product", "Avg/Month", "Predicted", "Restock By"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-1 pr-2 font-medium"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Basmati Rice", avg: 18, pred: 22, restock: "Jan 25" },
                {
                  name: "Sunflower Oil",
                  avg: 12,
                  pred: 14,
                  restock: "Jan 22 ⚠",
                },
                { name: "Parle-G", avg: 45, pred: 52, restock: "Jan 28" },
                { name: "Surf Excel", avg: 8, pred: 9, restock: "Feb 2" },
              ].map((r) => (
                <tr
                  key={r.name}
                  className="border-t"
                  style={{ borderColor: "oklch(0.26 0.025 230)" }}
                >
                  <td
                    className="py-1.5 pr-2"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {r.name}
                  </td>
                  <td
                    className="py-1.5 pr-2"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {r.avg} units
                  </td>
                  <td
                    className="py-1.5 pr-2"
                    style={{ color: "oklch(0.58 0.18 255)" }}
                  >
                    {r.pred} units
                  </td>
                  <td
                    className="py-1.5"
                    style={{
                      color: r.restock.includes("⚠")
                        ? "oklch(0.75 0.15 70)"
                        : "oklch(0.67 0.02 230)",
                    }}
                  >
                    {r.restock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Goal-Based Planner */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🎯"
            title="Goal-Based Planner"
            subtitle="Revenue target tracker"
            color="oklch(0.73 0.15 160)"
          />
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                background: "oklch(0.22 0.025 230)",
                border: "1px solid oklch(0.26 0.025 230)",
                color: "oklch(0.93 0.015 230)",
              }}
            />
            <button
              type="button"
              onClick={() => setRevenueTarget(+goalInput)}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: "oklch(0.73 0.15 160)", color: "white" }}
            >
              Set
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "oklch(0.67 0.02 230)" }}>Progress</span>
              <span
                className="font-bold"
                style={{ color: "oklch(0.73 0.15 160)" }}
              >
                {goalProgress.toFixed(0)}%
              </span>
            </div>
            <div
              className="h-3 rounded-full"
              style={{ background: "oklch(0.26 0.025 230)" }}
            >
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${goalProgress}%`,
                  background: "oklch(0.73 0.15 160)",
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-lg p-2" style={INNER}>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  Target
                </div>
                <div
                  className="font-bold text-sm"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(revenueTarget)}
                </div>
              </div>
              <div className="rounded-lg p-2" style={INNER}>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  Achieved
                </div>
                <div
                  className="font-bold text-sm"
                  style={{ color: "oklch(0.73 0.15 160)" }}
                >
                  {formatINR(totalRevenue)}
                </div>
              </div>
              <div className="rounded-lg p-2" style={INNER}>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  Daily Need
                </div>
                <div
                  className="font-bold text-sm"
                  style={{
                    color:
                      dailyNeeded > 0
                        ? "oklch(0.75 0.15 70)"
                        : "oklch(0.73 0.15 160)",
                  }}
                >
                  {dailyNeeded > 0 ? formatINR(dailyNeeded) : "Done!"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Smart Bundle Generator */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🛒"
            title="Smart Bundle Generator"
            subtitle="AI-suggested product combinations"
            color="oklch(0.79 0.13 185)"
          />
          <div className="space-y-3">
            {[
              {
                bundle: "Rice + Dal Combo",
                items: "Basmati Rice 5kg + Toor Dal 1kg",
                price: 480,
                saving: 15,
                margin: 22,
              },
              {
                bundle: "Kitchen Essentials",
                items: "Sunflower Oil + Dal + Rice",
                price: 620,
                saving: 25,
                margin: 19,
              },
              {
                bundle: "Snack Pack",
                items: "Parle-G x3 + Maggi 12pk",
                price: 190,
                saving: 10,
                margin: 28,
              },
            ].map((b) => (
              <div key={b.bundle} className="rounded-lg p-3" style={INNER}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {b.bundle}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.79 0.13 185)" }}
                  >
                    {formatINR(b.price)}
                  </span>
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {b.items}
                </div>
                <div className="flex gap-3 mt-1">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.73 0.15 160)" }}
                  >
                    Save {formatINR(b.saving)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    Margin: {b.margin}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Auto Substitution AI */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🔄"
            title="Auto Substitution AI"
            subtitle="Alternatives for out-of-stock items"
            color="oklch(0.58 0.18 255)"
          />
          <div className="mb-3">
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              Out-of-stock item
            </div>
            <div
              className="px-3 py-2 rounded-lg text-sm"
              style={{
                background: "oklch(0.22 0.025 230)",
                border: "1px solid oklch(0.58 0.18 25 / 0.4)",
                color: "oklch(0.58 0.18 25)",
              }}
            >
              Amul Butter 500g (0 stock)
            </div>
          </div>
          <div
            className="text-xs font-medium mb-2"
            style={{ color: "oklch(0.67 0.02 230)" }}
          >
            AI Suggestions:
          </div>
          <div className="space-y-2">
            {[
              {
                name: "Patanjali Butter 500g",
                match: 95,
                stock: 12,
                price: 260,
              },
              {
                name: "Mother Dairy Butter 500g",
                match: 90,
                stock: 8,
                price: 275,
              },
              { name: "Nandini Butter 500g", match: 85, stock: 5, price: 255 },
            ].map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg p-2"
                style={INNER}
              >
                <div>
                  <div
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {s.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    Stock: {s.stock} &bull; {formatINR(s.price)}
                  </div>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.73 0.15 160 / 0.15)",
                    color: "oklch(0.73 0.15 160)",
                  }}
                >
                  {s.match}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Inventory Decision Memory */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🧠"
            title="Inventory Decision Memory"
            subtitle="AI-tracked decisions and outcomes"
            color="oklch(0.75 0.15 70)"
          />
          <div className="space-y-3">
            {[
              {
                date: "Jan 15",
                decision: "Ordered 20 bags Basmati Rice",
                outcome: "Sold out in 12 days. ✔ Good call",
                good: true,
              },
              {
                date: "Jan 10",
                decision: "Skipped ordering Colgate 200g",
                outcome: "Stock exhausted. Lost ₹840 in sales. ✘ Mistake",
                good: false,
              },
              {
                date: "Dec 28",
                decision: "Bought 50 Parle-G cartons",
                outcome: "Cleared in 8 days at full margin. ✔ Excellent",
                good: true,
              },
            ].map((d) => (
              <div
                key={d.date}
                className="rounded-lg p-3"
                style={{
                  ...INNER,
                  borderLeft: `3px solid ${d.good ? "oklch(0.73 0.15 160)" : "oklch(0.58 0.18 25)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {d.decision}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {d.date}
                  </span>
                </div>
                <div
                  className="text-xs"
                  style={{
                    color: d.good
                      ? "oklch(0.73 0.15 160)"
                      : "oklch(0.58 0.18 25)",
                  }}
                >
                  {d.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9. Inventory Aging Brain */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="⏳"
            title="Inventory Aging Brain"
            subtitle="Stock age classification"
            color="oklch(0.73 0.15 160)"
          />
          <table className="w-full text-xs">
            <thead>
              <tr>
                {["Product", "0-30 days", "31-60", "61-90", "90+"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-1 pr-3 font-medium"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agingData.map((r) => (
                <tr
                  key={r.name}
                  className="border-t"
                  style={{ borderColor: "oklch(0.26 0.025 230)" }}
                >
                  <td
                    className="py-2 pr-3"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {r.name}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.73 0.15 160 / 0.15)",
                        color: "oklch(0.73 0.15 160)",
                      }}
                    >
                      {r["0-30"]}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.75 0.15 70 / 0.15)",
                        color: "oklch(0.75 0.15 70)",
                      }}
                    >
                      {r["31-60"]}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.65 0.18 40 / 0.15)",
                        color: "oklch(0.65 0.18 40)",
                      }}
                    >
                      {r["61-90"]}
                    </span>
                  </td>
                  <td className="py-2">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.58 0.18 25 / 0.15)",
                        color: "oklch(0.58 0.18 25)",
                      }}
                    >
                      {r["90+"]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 10. AI Business Mentor */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🎓"
            title="AI Business Mentor"
            subtitle="Personalized advice from your data"
            color="oklch(0.79 0.13 185)"
          />
          <div className="space-y-2">
            {[
              {
                icon: "📈",
                tip: "Your best performing day is Saturday. Staff up and stock high-velocity items by Friday.",
              },
              {
                icon: "⚠️",
                tip: "Amul Butter stockout cost you ₹2,800 this month. Set a minimum stock of 6 units.",
              },
              {
                icon: "💰",
                tip: "Parle-G has your highest margin (33%). Consider expanding this category.",
              },
              {
                icon: "🔄",
                tip: "Customers who buy Rice also buy Dal 78% of the time. Create a combo offer.",
              },
              {
                icon: "📅",
                tip: "January revenue is 31% below December. Run a promotion in last week to close the gap.",
              },
            ].map((a) => (
              <div
                key={a.icon}
                className="flex gap-3 rounded-lg p-3"
                style={INNER}
              >
                <span className="text-lg">{a.icon}</span>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {a.tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 11. Business Stress Detector */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🚨"
            title="Business Stress Detector"
            subtitle="Risk indicators for your business"
            color="oklch(0.58 0.18 25)"
          />
          <div className="space-y-4">
            {[
              {
                label: "Cash Flow Risk",
                score: 42,
                color: "oklch(0.75 0.15 70)",
                desc: "2 overdue invoices (₹5,616). Pending receivables: ₹14,560",
              },
              {
                label: "Overstock Risk",
                score: 28,
                color: "oklch(0.73 0.15 160)",
                desc: "3 products with >60 days stock. Capital locked: ₹18,360",
              },
              {
                label: "Stockout Risk",
                score: 71,
                color: "oklch(0.58 0.18 25)",
                desc: "4 products critically low. Estimated lost sales: ₹6,400",
              },
            ].map(({ label, score, color, desc }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "oklch(0.93 0.015 230)" }}>
                    {label}
                  </span>
                  <span className="font-bold" style={{ color }}>
                    {score}/100
                  </span>
                </div>
                <div
                  className="h-2.5 rounded-full mb-1"
                  style={{ background: "oklch(0.26 0.025 230)" }}
                >
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${score}%`, background: color }}
                  />
                </div>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 12. Explainable Profit AI */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="📊"
            title="Explainable Profit AI"
            subtitle="Profit breakdown by category"
            color="oklch(0.73 0.15 160)"
          />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={profitData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fill: "oklch(0.67 0.02 230)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.67 0.02 230)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => formatINR(v)}
                contentStyle={{
                  background: "oklch(0.19 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  borderRadius: 8,
                  color: "oklch(0.93 0.015 230)",
                }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="oklch(0.58 0.18 255)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="profit"
                name="Profit"
                fill="oklch(0.73 0.15 160)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              <span
                className="w-3 h-3 rounded inline-block"
                style={{ background: "oklch(0.58 0.18 255)" }}
              />
              Revenue
            </span>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              <span
                className="w-3 h-3 rounded inline-block"
                style={{ background: "oklch(0.73 0.15 160)" }}
              />
              Profit
            </span>
          </div>
        </div>

        {/* 13. Micro-Mistake Detector */}
        <div className="rounded-xl p-5" style={CARD}>
          <SectionTitle
            icon="🔍"
            title="Micro-Mistake Detector"
            subtitle="Small errors with big impact"
            color="oklch(0.58 0.18 25)"
          />
          <div className="space-y-2">
            {[
              {
                type: "Pricing Error",
                desc: "INV-2024-003: Surf Excel sold at ₹220 (below MRP ₹240). Revenue loss: ₹200",
                fix: "Update price list",
                severity: "medium",
              },
              {
                type: "Missing HSN",
                desc: "3 products have no HSN code. This may cause GST filing errors.",
                fix: "Add HSN codes",
                severity: "high",
              },
              {
                type: "Round-off Pattern",
                desc: "Last 8 invoices show ₹0.50-₹2.00 round-off differences. Check tax rounding logic.",
                fix: "Review rounding",
                severity: "low",
              },
              {
                type: "Below-Cost Sale",
                desc: "No below-cost sales detected this month. ✔ Good",
                fix: null,
                severity: "good",
              },
            ].map((m) => (
              <div
                key={m.type}
                className="rounded-lg p-3"
                style={{
                  ...INNER,
                  borderLeft: `3px solid ${m.severity === "high" ? "oklch(0.58 0.18 25)" : m.severity === "medium" ? "oklch(0.75 0.15 70)" : m.severity === "good" ? "oklch(0.73 0.15 160)" : "oklch(0.67 0.02 230)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {m.type}
                  </span>
                  {m.fix && (
                    <button
                      type="button"
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "oklch(0.79 0.13 185 / 0.15)",
                        color: "oklch(0.79 0.13 185)",
                      }}
                    >
                      Fix →
                    </button>
                  )}
                </div>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
