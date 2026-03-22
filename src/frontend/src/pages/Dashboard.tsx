import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useActor } from "../hooks/useActor";

const _toRupees = (p: bigint) => (Number(p) / 100).toFixed(2);
const formatINR = (p: bigint) => {
  const n = Number(p) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
};

interface Props {
  onNav: (page: string) => void;
}

export default function Dashboard({ onNav }: Props) {
  const { actor } = useActor();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => actor!.getDashboardStats(),
    enabled: !!actor,
  });

  if (isLoading || !stats) {
    return (
      <div className="p-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          Dashboard
        </h1>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5 animate-pulse"
              style={{ background: "oklch(0.19 0.025 230)", height: 100 }}
            />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Sales",
      value: formatINR(stats.totalSales),
      icon: ShoppingCart,
      color: "oklch(0.73 0.15 160)",
      onClick: () => onNav("sales"),
    },
    {
      label: "Total Purchases",
      value: formatINR(stats.totalPurchases),
      icon: TrendingUp,
      color: "oklch(0.79 0.13 185)",
      onClick: () => onNav("purchase"),
    },
    {
      label: "Total Expenses",
      value: formatINR(stats.totalExpenses),
      icon: BarChart3,
      color: "oklch(0.75 0.15 70)",
      onClick: () => onNav("expenses"),
    },
    {
      label: "Profit Estimate",
      value: formatINR(stats.profitEstimate),
      icon: TrendingUp,
      color: "oklch(0.79 0.13 185)",
      onClick: undefined,
    },
  ];

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: "oklch(0.93 0.015 230)" }}
      >
        Dashboard
      </h1>
      <p className="text-sm mb-6" style={{ color: "oklch(0.67 0.02 230)" }}>
        Your business at a glance
      </p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, onClick }) => (
          <button
            type="button"
            key={label}
            onClick={onClick}
            className="rounded-xl p-5 text-left transition-transform hover:scale-[1.02]"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.24 0.025 230)",
              cursor: onClick ? "pointer" : "default",
            }}
          >
            <div className="flex items-center justify-between mb-3">
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
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <div
              className="text-xl font-bold"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              {value}
            </div>
          </button>
        ))}
      </div>

      {stats.lowStockItems.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} style={{ color: "oklch(0.75 0.15 70)" }} />
            <h2
              className="font-semibold text-sm"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              Low Stock Alerts ({stats.lowStockItems.length})
            </h2>
          </div>
          <div className="space-y-2">
            {stats.lowStockItems.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: "oklch(0.15 0.02 230)" }}
              >
                <div className="flex items-center gap-2">
                  <Package
                    size={14}
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "oklch(0.87 0.015 230)" }}
                  >
                    {product.name}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {product.sku}
                  </span>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      Number(product.stockQty) === 0
                        ? "oklch(0.58 0.18 25)"
                        : "oklch(0.75 0.15 70)",
                  }}
                >
                  {Number(product.stockQty)} left
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNav("inventory")}
            className="mt-3 text-xs font-medium"
            style={{ color: "oklch(0.79 0.13 185)" }}
          >
            View Inventory →
          </button>
        </div>
      )}

      {stats.totalSales === 0n && stats.totalPurchases === 0n && (
        <div
          className="rounded-xl p-8 text-center mt-4"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <p className="text-sm mb-3" style={{ color: "oklch(0.67 0.02 230)" }}>
            No data yet. Start by adding products and creating your first
            invoice.
          </p>
          <button
            type="button"
            onClick={() => onNav("inventory")}
            className="text-sm font-medium"
            style={{ color: "oklch(0.79 0.13 185)" }}
          >
            Add Products →
          </button>
        </div>
      )}
    </div>
  );
}
