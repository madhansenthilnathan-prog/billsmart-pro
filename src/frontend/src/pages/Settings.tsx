import { useState } from "react";
import { toast } from "sonner";

interface Props {
  businessName: string;
  onSave: (name: string) => void;
}

export default function Settings({ businessName, onSave }: Props) {
  const [form, setForm] = useState({
    name: businessName,
    address: "123 MG Road, Bangalore, Karnataka - 560001",
    gstin: "29AABCS1234Z1Z5",
    phone: "9876543210",
    email: "store@email.com",
    state: "Karnataka",
    revenueTarget: "150000",
  });

  const handleSave = () => {
    onSave(form.name);
    toast.success("Settings saved!");
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "oklch(0.93 0.015 230)" }}
      >
        Settings
      </h1>

      {/* Business Profile */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{
          background: "oklch(0.19 0.025 230)",
          border: "1px solid oklch(0.26 0.025 230)",
        }}
      >
        <h2
          className="font-semibold mb-4"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          Business Profile
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Business Name", key: "name" },
            { label: "Phone", key: "phone" },
            { label: "Email", key: "email" },
            { label: "GSTIN", key: "gstin" },
            { label: "State", key: "state" },
          ].map(({ label, key }) => (
            <div key={key}>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                {label}
              </p>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              />
            </div>
          ))}
          <div className="col-span-2">
            <p
              className="text-xs font-medium block mb-1"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              Address
            </p>
            <textarea
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none"
              style={{
                background: "oklch(0.22 0.025 230)",
                border: "1px solid oklch(0.26 0.025 230)",
                color: "oklch(0.93 0.015 230)",
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{
          background: "oklch(0.19 0.025 230)",
          border: "1px solid oklch(0.26 0.025 230)",
        }}
      >
        <h2
          className="font-semibold mb-4"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          AI Engine Settings
        </h2>
        <div>
          <p
            className="text-xs font-medium block mb-1"
            style={{ color: "oklch(0.67 0.02 230)" }}
          >
            Monthly Revenue Target (₹)
          </p>
          <input
            type="number"
            value={form.revenueTarget}
            onChange={(e) =>
              setForm((f) => ({ ...f, revenueTarget: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.22 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
              color: "oklch(0.93 0.015 230)",
            }}
          />
          <p className="text-xs mt-1" style={{ color: "oklch(0.67 0.02 230)" }}>
            Used by Goal-Based Planner in AI Engine
          </p>
        </div>
      </div>

      {/* Zoho Reference */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: "oklch(0.19 0.025 230)",
          border: "1px solid oklch(0.26 0.025 230)",
        }}
      >
        <h2
          className="font-semibold mb-2"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          Zoho Books Reference
        </h2>
        <p className="text-sm mb-3" style={{ color: "oklch(0.67 0.02 230)" }}>
          Use Zoho Books as a reference for your existing purchase, sales, and
          expense data. Export CSV from Zoho and import here.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.22 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
              color: "oklch(0.93 0.015 230)",
            }}
          >
            Import from Zoho CSV
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.22 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
              color: "oklch(0.93 0.015 230)",
            }}
          >
            View Import Guide
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold"
        style={{
          background: "oklch(0.79 0.13 185)",
          color: "oklch(0.13 0.02 230)",
        }}
      >
        Save Settings
      </button>
    </div>
  );
}
