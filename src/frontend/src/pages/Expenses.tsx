import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, formatINR, genId } from "../lib/formatters";
import { sampleExpenses } from "../lib/sampleData";

const CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Marketing",
  "Transport",
  "Misc",
];

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMode: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "Rent",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMode: "Cash",
  });

  const handleSave = () => {
    if (!form.description || !form.amount) {
      toast.error("Fill all fields");
      return;
    }
    setExpenses((prev) => [
      { id: genId(), ...form, amount: +form.amount },
      ...prev,
    ]);
    toast.success("Expense recorded!");
    setShowForm(false);
    setForm({
      category: "Rent",
      description: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      paymentMode: "Cash",
    });
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const catColors: Record<string, string> = {
    Rent: "oklch(0.58 0.18 255)",
    Utilities: "oklch(0.75 0.15 70)",
    Salaries: "oklch(0.79 0.13 185)",
    Marketing: "oklch(0.73 0.15 160)",
    Transport: "oklch(0.65 0.13 300)",
    Misc: "oklch(0.67 0.02 230)",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            Expenses
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            Total this month:{" "}
            <span
              className="font-bold"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              {formatINR(total)}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            background: "oklch(0.79 0.13 185)",
            color: "oklch(0.13 0.02 230)",
          }}
        >
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.26 0.025 230)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              Add Expense
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={18} style={{ color: "oklch(0.67 0.02 230)" }} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Category
              </p>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Amount (₹) *
              </p>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="0"
              />
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Description *
              </p>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="Description"
              />
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Date
              </p>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              />
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Payment Mode
              </p>
              <select
                value={form.paymentMode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentMode: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                {["Cash", "UPI", "Bank Transfer", "Card"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: "oklch(0.79 0.13 185)",
              color: "oklch(0.13 0.02 230)",
            }}
          >
            Save Expense
          </button>
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.26 0.025 230)" }}
      >
        <table className="w-full">
          <thead style={{ background: "oklch(0.19 0.025 230)" }}>
            <tr>
              {[
                "Date",
                "Category",
                "Description",
                "Amount",
                "Payment Mode",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr
                key={exp.id}
                className="border-t"
                style={{ borderColor: "oklch(0.22 0.025 230)" }}
              >
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatDate(exp.date)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: `${catColors[exp.category] || "oklch(0.67 0.02 230)"} / 0.15`,
                      color: catColors[exp.category] || "oklch(0.67 0.02 230)",
                    }}
                  >
                    {exp.category}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {exp.description}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(exp.amount)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {exp.paymentMode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
