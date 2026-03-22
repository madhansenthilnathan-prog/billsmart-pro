import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Expense } from "../backend";
import { useActor } from "../hooks/useActor";

const toRupees = (p: bigint) => (Number(p) / 100).toFixed(2);
const toPaise = (r: number) => BigInt(Math.round(r * 100));
const nowNs = () => BigInt(Date.now()) * 1_000_000n;
const PLACEHOLDER = Principal.fromText("2vxsx-fae");
const formatDate = (ns: bigint) =>
  new Date(Number(ns / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Marketing",
  "Transport",
  "Maintenance",
  "Misc",
  "Other",
];

export default function Expenses() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("Misc");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => actor!.getAllExpenses(),
    enabled: !!actor,
  });
  const addMutation = useMutation({
    mutationFn: (exp: Expense) => actor!.createExpense(exp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added");
      setShowForm(false);
      setDescription("");
      setAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      toast.error("Amount required");
      return;
    }
    const dateNs = BigInt(new Date(date).getTime()) * 1_000_000n;
    addMutation.mutate({
      id: crypto.randomUUID(),
      owner: PLACEHOLDER,
      date: dateNs,
      category,
      description,
      amount: toPaise(Number.parseFloat(amount)),
      createdAt: nowNs(),
    });
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0) / 100;
  const inputStyle = {
    background: "oklch(0.15 0.02 230)",
    border: "1px solid oklch(0.26 0.025 230)",
    color: "oklch(0.93 0.015 230)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
    width: "100%",
  };
  const labelStyle = {
    fontSize: 12,
    color: "oklch(0.67 0.02 230)",
    marginBottom: 4,
    display: "block" as const,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            Expenses
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.67 0.02 230)" }}>
            Total: ₹{total.toFixed(2)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "oklch(0.79 0.13 185)",
            color: "oklch(0.13 0.02 230)",
          }}
        >
          <Plus size={14} /> Add Expense
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="font-semibold"
                style={{ color: "oklch(0.93 0.015 230)" }}
              >
                Add Expense
              </h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X size={16} style={{ color: "oklch(0.67 0.02 230)" }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div style={labelStyle}>Category</div>
                <select
                  style={inputStyle}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={labelStyle}>Description</div>
                <input
                  style={inputStyle}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>Amount (₹) *</div>
                <input
                  type="number"
                  step="0.01"
                  required
                  style={inputStyle}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>Date</div>
                <input
                  type="date"
                  style={inputStyle}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: "oklch(0.24 0.025 230)",
                    color: "oklch(0.87 0.015 230)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: "oklch(0.79 0.13 185)",
                    color: "oklch(0.13 0.02 230)",
                  }}
                >
                  {addMutation.isPending ? "Saving..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl animate-pulse"
              style={{ background: "oklch(0.19 0.025 230)" }}
            />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            No expenses yet.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.24 0.025 230)" }}
        >
          <table className="w-full text-sm">
            <thead style={{ background: "oklch(0.16 0.025 230)" }}>
              <tr>
                {["Date", "Category", "Description", "Amount", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses
                .sort((a, b) => Number(b.date - a.date))
                .map((exp, i) => (
                  <tr
                    key={exp.id}
                    style={{
                      background:
                        i % 2 === 0
                          ? "oklch(0.19 0.025 230)"
                          : "oklch(0.17 0.02 230)",
                      borderTop: "1px solid oklch(0.22 0.025 230)",
                    }}
                  >
                    <td
                      className="px-4 py-3"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: "oklch(0.79 0.13 185 / 0.15)",
                          color: "oklch(0.79 0.13 185)",
                        }}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "oklch(0.87 0.015 230)" }}
                    >
                      {exp.description}
                    </td>
                    <td
                      className="px-4 py-3 font-semibold"
                      style={{ color: "oklch(0.87 0.015 230)" }}
                    >
                      ₹{toRupees(exp.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete?")) deleteMutation.mutate(exp.id);
                        }}
                        style={{ color: "oklch(0.58 0.18 25)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
