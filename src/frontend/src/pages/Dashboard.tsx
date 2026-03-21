import {
  AlertTriangle,
  FileText,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatINR, formatINRCompact } from "../lib/formatters";
import { monthlyData, sampleInvoices, sampleProducts } from "../lib/sampleData";

const STATUS_COLORS: Record<string, string> = {
  Paid: "oklch(0.73 0.15 160)",
  Pending: "oklch(0.75 0.15 70)",
  Overdue: "oklch(0.58 0.18 25)",
};

const aiAdvice = [
  {
    icon: "📦",
    title: "Restock Sunflower Oil",
    desc: "Only 3 units left. Avg daily sales: 2 units. Reorder in 1 day.",
  },
  {
    icon: "🏷️",
    title: "Bundle Opportunity",
    desc: "Rice + Dal frequently bought together. Create a bundle at 5% discount.",
  },
  {
    icon: "💰",
    title: "Dead Stock Alert",
    desc: "Amul Butter (0 stock, high demand). Order immediately to avoid lost sales.",
  },
];

interface Props {
  onNav: (page: string) => void;
}

export default function Dashboard({ onNav }: Props) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const todaySales = sampleInvoices
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + i.total, 0);
  const gstCollected = sampleInvoices.reduce(
    (s, i) => s + i.cgst + i.sgst + i.igst,
    0,
  );
  const lowStock = sampleProducts.filter((p) => p.stock <= 3).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            Dashboard Overview
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.67 0.02 230)" }}
          >
            {today} &nbsp;•&nbsp; Welcome!
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onNav("sales")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "oklch(0.79 0.13 185)",
              color: "oklch(0.13 0.02 230)",
            }}
          >
            <Plus size={15} /> New Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Today's Sales",
            value: formatINRCompact(todaySales),
            icon: ShoppingCart,
            color: "oklch(0.79 0.13 185)",
            sub: "+12% vs yesterday",
          },
          {
            label: "GST Collected",
            value: formatINRCompact(gstCollected),
            icon: Receipt,
            color: "oklch(0.58 0.18 255)",
            sub: "This month",
          },
          {
            label: "Total Invoices",
            value: sampleInvoices.length.toString(),
            icon: FileText,
            color: "oklch(0.75 0.15 70)",
            sub: `${sampleInvoices.filter((i) => i.status === "Pending").length} pending`,
          },
          {
            label: "Low Stock Items",
            value: lowStock.toString(),
            icon: AlertTriangle,
            color: "oklch(0.58 0.18 25)",
            sub: "Need reorder",
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                {label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color} / 0.15` }}
              >
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              {value}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Sales Chart */}
        <div
          className="col-span-2 rounded-xl p-4"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.26 0.025 230)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            Sales Performance (Monthly)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ED0C2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2ED0C2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.26 0.025 230)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.67 0.02 230)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${v / 1000}K`}
                tick={{ fill: "oklch(0.67 0.02 230)", fontSize: 11 }}
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
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#2ED0C2"
                strokeWidth={2}
                fill="url(#tealGrad)"
                name="Sales"
              />
              <Area
                type="monotone"
                dataKey="purchases"
                stroke="#2F80ED"
                strokeWidth={2}
                fill="none"
                name="Purchases"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.26 0.025 230)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              AI Insights
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "oklch(0.79 0.13 185 / 0.15)",
                color: "oklch(0.79 0.13 185)",
              }}
            >
              13 Active
            </span>
          </div>
          <div className="space-y-3">
            {aiAdvice.map((a) => (
              <div
                key={a.icon}
                className="rounded-lg p-3"
                style={{ background: "oklch(0.22 0.025 230)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{a.icon}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {a.title}
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNav("ai-engine")}
            className="mt-3 w-full text-xs py-2 rounded-lg font-medium"
            style={{
              color: "oklch(0.79 0.13 185)",
              background: "oklch(0.79 0.13 185 / 0.1)",
            }}
          >
            View All AI Tools →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            icon: ShoppingCart,
            label: "New Sale Invoice",
            page: "sales",
            color: "oklch(0.79 0.13 185)",
          },
          {
            icon: TrendingUp,
            label: "New Purchase Order",
            page: "purchase",
            color: "oklch(0.58 0.18 255)",
          },
          {
            icon: Package,
            label: "Add Product",
            page: "inventory",
            color: "oklch(0.73 0.15 160)",
          },
        ].map(({ icon: Icon, label, page, color }) => (
          <button
            type="button"
            key={label}
            onClick={() => onNav(page)}
            className="rounded-xl p-4 flex items-center gap-3 text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
              color: "oklch(0.93 0.015 230)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${color} / 0.1` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            {label}
          </button>
        ))}
      </div>

      {/* Recent Invoices */}
      <div
        className="rounded-xl"
        style={{
          background: "oklch(0.19 0.025 230)",
          border: "1px solid oklch(0.26 0.025 230)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "oklch(0.26 0.025 230)" }}
        >
          <h3
            className="text-sm font-semibold"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            Recent Invoices
          </h3>
          <button
            type="button"
            onClick={() => onNav("sales")}
            className="text-xs"
            style={{ color: "oklch(0.79 0.13 185)" }}
          >
            View all →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid oklch(0.26 0.025 230)" }}>
              {["Invoice #", "Date", "Customer", "Amount", "GST", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {sampleInvoices.slice(0, 5).map((inv) => (
              <tr
                key={inv.id}
                className="border-b transition-colors"
                style={{ borderColor: "oklch(0.22 0.025 230)" }}
              >
                <td
                  className="px-5 py-3 text-sm font-medium"
                  style={{ color: "oklch(0.58 0.18 255)" }}
                >
                  {inv.invoiceNo}
                </td>
                <td
                  className="px-5 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatDate(inv.date)}
                </td>
                <td
                  className="px-5 py-3 text-sm"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {inv.customerName}
                </td>
                <td
                  className="px-5 py-3 text-sm font-semibold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(inv.total)}
                </td>
                <td
                  className="px-5 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatINR(inv.cgst + inv.sgst + inv.igst)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      background: `${STATUS_COLORS[inv.status]} / 0.15`,
                      color: STATUS_COLORS[inv.status],
                    }}
                  >
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
