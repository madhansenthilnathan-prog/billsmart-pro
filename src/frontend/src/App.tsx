import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AIEngine from "./pages/AIEngine";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import GSTReports from "./pages/GSTReports";
import Inventory from "./pages/Inventory";
import Purchase from "./pages/Purchase";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import VendorPayments from "./pages/VendorPayments";

type Page =
  | "dashboard"
  | "sales"
  | "purchase"
  | "expenses"
  | "vendor-payments"
  | "inventory"
  | "gst-reports"
  | "ai-engine"
  | "settings";

function MainApp() {
  const [page, setPage] = useState<Page>("dashboard");
  const [businessName, setBusinessName] = useState("My Retail Store");
  const { clear } = useInternetIdentity();
  const { actor } = useActor();

  // Register user on first login
  useState(() => {
    if (actor) {
      actor
        .getCallerUserProfile()
        .then((profile) => {
          if (!profile) {
            actor.saveCallerUserProfile({ name: "User" }).catch(() => {});
          }
        })
        .catch(() => {});
    }
  });

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNav={(p) => setPage(p as Page)} />;
      case "sales":
        return <Sales />;
      case "purchase":
        return <Purchase />;
      case "expenses":
        return <Expenses />;
      case "vendor-payments":
        return <VendorPayments />;
      case "inventory":
        return <Inventory />;
      case "gst-reports":
        return <GSTReports />;
      case "ai-engine":
        return <AIEngine />;
      case "settings":
        return (
          <Settings businessName={businessName} onSave={setBusinessName} />
        );
      default:
        return <Dashboard onNav={(p) => setPage(p as Page)} />;
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "oklch(0.13 0.02 230)" }}
    >
      <Sidebar
        active={page}
        onNav={(k) => setPage(k as Page)}
        onLogout={clear}
        businessName={businessName}
      />
      <main className="flex-1 ml-60 min-h-screen">{renderPage()}</main>
      <Toaster />
    </div>
  );
}

export default function App() {
  const { identity, login, isInitializing, isLoggingIn } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.13 0.02 230)" }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "oklch(0.79 0.13 185)",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            Loading...
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  if (!identity) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.13 0.02 230)" }}
      >
        <div
          className="rounded-2xl p-10 w-full max-w-md text-center"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.26 0.025 230)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "oklch(0.79 0.13 185)" }}
          >
            <span className="text-3xl">⚡</span>
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            BillSmart Pro
          </h1>
          <p className="text-sm mb-8" style={{ color: "oklch(0.67 0.02 230)" }}>
            Cloud Retail Billing Software with AI Intelligence
          </p>
          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              background: "oklch(0.79 0.13 185)",
              color: "oklch(0.13 0.02 230)",
            }}
          >
            {isLoggingIn ? "Connecting..." : "Login with Internet Identity"}
          </button>
          <p className="text-xs mt-4" style={{ color: "oklch(0.5 0.02 230)" }}>
            Secure, cloud-based access from any device
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  return <MainApp />;
}
