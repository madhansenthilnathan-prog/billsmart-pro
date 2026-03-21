import {
  BarChart3,
  Brain,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "sales", label: "Sales", icon: ShoppingCart },
  { key: "purchase", label: "Purchase", icon: TrendingUp },
  { key: "expenses", label: "Expenses", icon: CreditCard },
  { key: "vendor-payments", label: "Vendor Payments", icon: Users },
  { key: "inventory", label: "Inventory", icon: Package },
  { key: "gst-reports", label: "GST Reports", icon: BarChart3 },
  { key: "ai-engine", label: "AI Engine", icon: Brain, badge: "13" },
  { key: "settings", label: "Settings", icon: Settings },
];

interface Props {
  active: string;
  onNav: (key: string) => void;
  onLogout: () => void;
  businessName: string;
}

export default function Sidebar({
  active,
  onNav,
  onLogout,
  businessName,
}: Props) {
  return (
    <aside
      className="no-print fixed left-0 top-0 bottom-0 w-60 flex flex-col"
      style={{
        background: "oklch(0.16 0.025 230)",
        borderRight: "1px solid oklch(0.22 0.025 230)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5 border-b"
        style={{ borderColor: "oklch(0.22 0.025 230)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(0.79 0.13 185)" }}
        >
          <Zap size={16} style={{ color: "oklch(0.13 0.02 230)" }} />
        </div>
        <div>
          <div
            className="font-bold text-sm leading-tight"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            BillSmart Pro
          </div>
          <div className="text-xs" style={{ color: "oklch(0.67 0.02 230)" }}>
            {businessName}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ key, label, icon: Icon, badge }) => {
          const isActive = active === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => onNav(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: isActive
                  ? "oklch(0.79 0.13 185 / 0.15)"
                  : "transparent",
                color: isActive
                  ? "oklch(0.79 0.13 185)"
                  : "oklch(0.67 0.02 230)",
              }}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.79 0.13 185 / 0.2)",
                    color: "oklch(0.79 0.13 185)",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ color: "oklch(0.67 0.02 230)" }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
