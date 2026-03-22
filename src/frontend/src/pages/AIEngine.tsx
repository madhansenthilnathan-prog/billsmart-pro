import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const toRupees = (p: bigint) => Number(p) / 100;

interface Tool {
  id: number;
  name: string;
  icon: string;
  compute: () => React.ReactNode;
}

export default function AIEngine() {
  const { actor } = useActor();
  const [activeTool, setActiveTool] = useState<number | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getAllProducts(),
    enabled: !!actor,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => actor!.getAllSalesInvoices(),
    enabled: !!actor,
  });
  const { data: bills = [] } = useQuery({
    queryKey: ["bills"],
    queryFn: () => actor!.getAllPurchaseBills(),
    enabled: !!actor,
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => actor!.getAllExpenses(),
    enabled: !!actor,
  });

  const noData = products.length === 0 && invoices.length === 0;

  // Product sales map
  const salesByProduct: Record<
    string,
    { name: string; qty: number; revenue: number }
  > = {};
  for (const inv of invoices) {
    for (const item of inv.items) {
      if (!salesByProduct[item.productId])
        salesByProduct[item.productId] = {
          name: item.productName,
          qty: 0,
          revenue: 0,
        };
      salesByProduct[item.productId].qty += Number(item.qty);
      salesByProduct[item.productId].revenue += toRupees(item.amount);
    }
  }

  const tools: Tool[] = [
    {
      id: 1,
      name: "Inventory DNA Sequencer",
      icon: "🧬",
      compute: () => {
        const sorted = Object.values(salesByProduct).sort(
          (a, b) => b.qty - a.qty,
        );
        const high = sorted.slice(0, Math.ceil(sorted.length / 3));
        const low = sorted.slice(-Math.ceil(sorted.length / 3));
        return (
          <div className="space-y-3">
            <p
              className="text-xs font-semibold"
              style={{ color: "oklch(0.73 0.15 160)" }}
            >
              HIGH VELOCITY
            </p>
            {high.map((p) => (
              <div key={p.name} className="flex justify-between text-sm">
                <span style={{ color: "oklch(0.87 0.015 230)" }}>{p.name}</span>
                <span style={{ color: "oklch(0.73 0.15 160)" }}>
                  {p.qty} sold
                </span>
              </div>
            ))}
            <p
              className="text-xs font-semibold mt-3"
              style={{ color: "oklch(0.58 0.18 25)" }}
            >
              LOW VELOCITY
            </p>
            {low.map((p) => (
              <div key={p.name} className="flex justify-between text-sm">
                <span style={{ color: "oklch(0.87 0.015 230)" }}>{p.name}</span>
                <span style={{ color: "oklch(0.58 0.18 25)" }}>
                  {p.qty} sold
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: 2,
      name: "Capital Lock Analyzer",
      icon: "🔒",
      compute: () => {
        const locked = products
          .filter((p) => Number(p.stockQty) > 20 && !salesByProduct[p.id])
          .map((p) => ({
            name: p.name,
            value: toRupees(p.costPrice) * Number(p.stockQty),
          }));
        return (
          <div className="space-y-2">
            {locked.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                No capital lock detected.
              </p>
            ) : (
              locked.map((p) => (
                <div key={p.name} className="flex justify-between text-sm">
                  <span style={{ color: "oklch(0.87 0.015 230)" }}>
                    {p.name}
                  </span>
                  <span style={{ color: "oklch(0.75 0.15 70)" }}>
                    ₹{p.value.toFixed(0)} locked
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 3,
      name: "Silent Killer Detector",
      icon: "☠️",
      compute: () => {
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const unsold = products.filter((p) => {
          const lastSale = invoices
            .filter((inv) => inv.items.some((i) => i.productId === p.id))
            .map((inv) => Number(inv.date / 1_000_000n))
            .sort((a, b) => b - a)[0];
          return !lastSale || now - lastSale > thirtyDays;
        });
        return (
          <div className="space-y-2">
            {unsold.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                All products sold recently!
              </p>
            ) : (
              unsold.map((p) => (
                <div
                  key={p.id}
                  className="text-sm"
                  style={{ color: "oklch(0.87 0.015 230)" }}
                >
                  {p.name}{" "}
                  <span style={{ color: "oklch(0.58 0.18 25)" }}>
                    — not sold in 30+ days
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 4,
      name: "Phantom Predictor",
      icon: "🔮",
      compute: () => {
        const months: Record<string, number> = {};
        for (const inv of invoices) {
          const m = new Date(Number(inv.date / 1_000_000n)).toLocaleDateString(
            "en-IN",
            { month: "short", year: "2-digit" },
          );
          months[m] = (months[m] || 0) + toRupees(inv.totalAmount);
        }
        const entries = Object.entries(months).slice(-3);
        const avg = entries.length
          ? entries.reduce((s, [, v]) => s + v, 0) / entries.length
          : 0;
        return (
          <div className="space-y-2">
            {entries.map(([m, v]) => (
              <div key={m} className="flex justify-between text-sm">
                <span style={{ color: "oklch(0.87 0.015 230)" }}>{m}</span>
                <span style={{ color: "oklch(0.67 0.02 230)" }}>
                  ₹{v.toFixed(0)}
                </span>
              </div>
            ))}
            <div
              className="border-t pt-2"
              style={{ borderColor: "oklch(0.26 0.025 230)" }}
            >
              <div className="flex justify-between text-sm font-semibold">
                <span style={{ color: "oklch(0.79 0.13 185)" }}>
                  Predicted Next Month
                </span>
                <span style={{ color: "oklch(0.79 0.13 185)" }}>
                  ~₹{(avg * 1.05).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 5,
      name: "Goal-Based Planner",
      icon: "🎯",
      compute: () => {
        const totalRevenue = invoices.reduce(
          (s, i) => s + toRupees(i.totalAmount),
          0,
        );
        const goal = 100000;
        const pct = Math.min(100, (totalRevenue / goal) * 100);
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "oklch(0.87 0.015 230)" }}>
              Monthly Goal: ₹{goal.toLocaleString()}
            </p>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: "oklch(0.24 0.025 230)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "oklch(0.73 0.15 160)" }}
              />
            </div>
            <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
              Achieved: ₹{totalRevenue.toFixed(0)} ({pct.toFixed(1)}%)
            </p>
            {pct < 100 && (
              <p className="text-sm" style={{ color: "oklch(0.75 0.15 70)" }}>
                ₹{(goal - totalRevenue).toFixed(0)} more needed
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 6,
      name: "Smart Bundle Generator",
      icon: "🎁",
      compute: () => {
        // Find products appearing in same invoice
        const bundles: Record<string, Set<string>> = {};
        for (const inv of invoices) {
          if (inv.items.length >= 2) {
            for (let i = 0; i < inv.items.length; i++) {
              const key = inv.items[i].productName;
              if (!bundles[key]) bundles[key] = new Set();
              for (let j = 0; j < inv.items.length; j++) {
                if (i !== j) bundles[key].add(inv.items[j].productName);
              }
            }
          }
        }
        const suggestions = Object.entries(bundles).slice(0, 5);
        return (
          <div className="space-y-2">
            {suggestions.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                Create more invoices with multiple items to see bundle
                suggestions.
              </p>
            ) : (
              suggestions.map(([p, others]) => (
                <div key={p} className="text-sm">
                  <span style={{ color: "oklch(0.87 0.015 230)" }}>{p}</span>
                  <span style={{ color: "oklch(0.67 0.02 230)" }}>
                    {" "}
                    + {Array.from(others).slice(0, 2).join(", ")}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 7,
      name: "Auto Substitution AI",
      icon: "🔄",
      compute: () => {
        const outOfStock = products.filter((p) => Number(p.stockQty) === 0);
        return (
          <div className="space-y-2">
            {outOfStock.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                All products in stock.
              </p>
            ) : (
              outOfStock.map((p) => {
                const similar = products.find(
                  (s) =>
                    s.id !== p.id &&
                    s.category === p.category &&
                    Number(s.stockQty) > 0,
                );
                return (
                  <div key={p.id} className="text-sm">
                    <span style={{ color: "oklch(0.58 0.18 25)" }}>
                      {p.name} (out)
                    </span>
                    {similar && (
                      <span style={{ color: "oklch(0.73 0.15 160)" }}>
                        {" "}
                        → Suggest: {similar.name}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      },
    },
    {
      id: 8,
      name: "Inventory Decision Memory AI",
      icon: "🧠",
      compute: () => {
        const restocks = bills.slice(-5).map((b) => ({
          vendor: b.vendorName,
          date: new Date(Number(b.date / 1_000_000n)).toLocaleDateString(
            "en-IN",
          ),
          total: `₹${toRupees(b.totalAmount).toFixed(0)}`,
        }));
        return (
          <div className="space-y-2">
            {restocks.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                No restock history yet.
              </p>
            ) : (
              restocks.map((r, i) => (
                <div
                  key={r.vendor + String(i)}
                  className="text-sm flex justify-between"
                >
                  <span style={{ color: "oklch(0.87 0.015 230)" }}>
                    {r.vendor}
                  </span>
                  <span style={{ color: "oklch(0.67 0.02 230)" }}>
                    {r.date} — {r.total}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 9,
      name: "Inventory Aging Brain",
      icon: "⏳",
      compute: () => {
        const old = products.filter((p) => {
          const age =
            (Date.now() - Number(p.createdAt / 1_000_000n)) /
            (1000 * 60 * 60 * 24);
          return age > 60 && !salesByProduct[p.id];
        });
        return (
          <div className="space-y-2">
            {old.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                No aging inventory detected.
              </p>
            ) : (
              old.map((p) => (
                <div key={p.id} className="text-sm">
                  <span style={{ color: "oklch(0.75 0.15 70)" }}>{p.name}</span>
                  <span style={{ color: "oklch(0.67 0.02 230)" }}>
                    {" "}
                    — {Number(p.stockQty)} units, never sold
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 10,
      name: "AI Business Mentor",
      icon: "👨‍💼",
      compute: () => {
        const rev = invoices.reduce((s, i) => s + toRupees(i.totalAmount), 0);
        const cost = bills.reduce((s, b) => s + toRupees(b.totalAmount), 0);
        const exp = expenses.reduce((s, e) => s + toRupees(e.amount), 0);
        const profit = rev - cost - exp;
        const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : "0";
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.67 0.02 230)" }}>Revenue</span>
              <span style={{ color: "oklch(0.73 0.15 160)" }}>
                ₹{rev.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.67 0.02 230)" }}>Costs</span>
              <span style={{ color: "oklch(0.58 0.18 25)" }}>
                ₹{(cost + exp).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span style={{ color: "oklch(0.87 0.015 230)" }}>Net Profit</span>
              <span
                style={{
                  color:
                    profit >= 0
                      ? "oklch(0.73 0.15 160)"
                      : "oklch(0.58 0.18 25)",
                }}
              >
                ₹{profit.toFixed(0)} ({margin}%)
              </span>
            </div>
            <p
              className="text-xs pt-2"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              {Number(margin) >= 20
                ? "Good margins! Consider scaling up inventory."
                : Number(margin) >= 10
                  ? "Moderate margins. Look for cost reduction opportunities."
                  : "Tight margins. Review pricing and expenses."}
            </p>
          </div>
        );
      },
    },
    {
      id: 11,
      name: "Business Stress Detector",
      icon: "⚠️",
      compute: () => {
        const issues: string[] = [];
        const lowStock = products.filter((p) => Number(p.stockQty) <= 5).length;
        const overStock = products.filter(
          (p) => Number(p.stockQty) > 100 && !salesByProduct[p.id],
        ).length;
        const noSales30 =
          invoices.filter(
            (i) =>
              Date.now() - Number(i.date / 1_000_000n) <
              30 * 24 * 60 * 60 * 1000,
          ).length === 0;
        if (lowStock > 0)
          issues.push(`${lowStock} products critically low on stock`);
        if (overStock > 0)
          issues.push(`${overStock} products overstocked with no recent sales`);
        if (noSales30 && invoices.length > 0)
          issues.push("No sales in the last 30 days");
        return (
          <div className="space-y-2">
            {issues.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.73 0.15 160)" }}>
                Business is healthy! No critical issues.
              </p>
            ) : (
              issues.map((issue) => (
                <div key={issue} className="flex items-start gap-2 text-sm">
                  <span style={{ color: "oklch(0.75 0.15 70)" }}>⚠</span>
                  <span style={{ color: "oklch(0.87 0.015 230)" }}>
                    {issue}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 12,
      name: "Explainable Profit AI",
      icon: "💡",
      compute: () => {
        const productProfit = Object.entries(salesByProduct)
          .map(([id, { name, revenue }]) => {
            const product = products.find((p) => p.id === id);
            const cost = product
              ? toRupees(product.costPrice) * salesByProduct[id].qty
              : 0;
            return { name, profit: revenue - cost };
          })
          .sort((a, b) => b.profit - a.profit);
        return (
          <div className="space-y-2">
            {productProfit.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                No sales data yet.
              </p>
            ) : (
              productProfit.slice(0, 8).map((p) => (
                <div key={p.name} className="flex justify-between text-sm">
                  <span style={{ color: "oklch(0.87 0.015 230)" }}>
                    {p.name}
                  </span>
                  <span
                    style={{
                      color:
                        p.profit >= 0
                          ? "oklch(0.73 0.15 160)"
                          : "oklch(0.58 0.18 25)",
                    }}
                  >
                    ₹{p.profit.toFixed(0)}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 13,
      name: "Micro-Mistake Detector",
      icon: "🔍",
      compute: () => {
        const mistakes: string[] = [];
        const negMargin = products.filter(
          (p) =>
            Number(p.sellingPrice) < Number(p.costPrice) &&
            Number(p.sellingPrice) > 0,
        );
        if (negMargin.length > 0)
          mistakes.push(
            `${negMargin.map((p) => p.name).join(", ")} selling below cost price`,
          );
        const zeroPrice = products.filter((p) => Number(p.sellingPrice) === 0);
        if (zeroPrice.length > 0)
          mistakes.push(`${zeroPrice.length} products with zero selling price`);
        const noHSN = products.filter((p) => !p.hsnCode);
        if (noHSN.length > 0)
          mistakes.push(`${noHSN.length} products missing HSN code`);
        return (
          <div className="space-y-2">
            {mistakes.length === 0 ? (
              <p className="text-sm" style={{ color: "oklch(0.73 0.15 160)" }}>
                No mistakes found!
              </p>
            ) : (
              mistakes.map((m) => (
                <div key={m} className="flex items-start gap-2 text-sm">
                  <span style={{ color: "oklch(0.58 0.18 25)" }}>✗</span>
                  <span style={{ color: "oklch(0.87 0.015 230)" }}>{m}</span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: "oklch(0.93 0.015 230)" }}
      >
        AI Inventory Intelligence Engine
      </h1>
      <p className="text-sm mb-6" style={{ color: "oklch(0.67 0.02 230)" }}>
        13 AI-powered analytics tools learning from your business data
      </p>

      {noData && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: "oklch(0.19 0.025 230 / 0.5)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.75 0.15 70)" }}>
            Add products and create invoices to unlock full AI insights.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() =>
              setActiveTool(activeTool === tool.id ? null : tool.id)
            }
            className="rounded-xl p-4 text-left transition-all"
            style={{
              background:
                activeTool === tool.id
                  ? "oklch(0.79 0.13 185 / 0.15)"
                  : "oklch(0.19 0.025 230)",
              border: `1px solid ${activeTool === tool.id ? "oklch(0.79 0.13 185 / 0.5)" : "oklch(0.24 0.025 230)"}`,
            }}
          >
            <div className="text-2xl mb-2">{tool.icon}</div>
            <div
              className="text-sm font-medium"
              style={{ color: "oklch(0.87 0.015 230)" }}
            >
              {tool.name}
            </div>
          </button>
        ))}
      </div>

      {activeTool !== null && (
        <div
          className="rounded-xl p-6"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.26 0.025 230)",
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            {tools.find((t) => t.id === activeTool)?.icon}{" "}
            {tools.find((t) => t.id === activeTool)?.name}
          </h3>
          {tools.find((t) => t.id === activeTool)?.compute()}
        </div>
      )}
    </div>
  );
}
