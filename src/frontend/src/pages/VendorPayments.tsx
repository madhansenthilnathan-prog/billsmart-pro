import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, formatINR, genId } from "../lib/formatters";
import { sampleVendorPayments, sampleVendors } from "../lib/sampleData";

interface Payment {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  date: string;
  mode: string;
  reference: string;
  notes: string;
}

export default function VendorPayments() {
  const [payments, setPayments] = useState<Payment[]>(sampleVendorPayments);
  const [vendors, setVendors] = useState(sampleVendors);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vendorId: "v1",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    mode: "NEFT",
    reference: "",
    notes: "",
  });

  const handleSave = () => {
    if (!form.amount) {
      toast.error("Enter amount");
      return;
    }
    const vendor = vendors.find((v) => v.id === form.vendorId);
    if (!vendor) return;
    setPayments((prev) => [
      {
        id: genId(),
        vendorId: form.vendorId,
        vendorName: vendor.name,
        amount: +form.amount,
        date: form.date,
        mode: form.mode,
        reference: form.reference,
        notes: form.notes,
      },
      ...prev,
    ]);
    setVendors((prev) =>
      prev.map((v) =>
        v.id === form.vendorId
          ? { ...v, outstanding: Math.max(0, v.outstanding - +form.amount) }
          : v,
      ),
    );
    toast.success("Payment recorded!");
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          Vendor Payments
        </h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            background: "oklch(0.79 0.13 185)",
            color: "oklch(0.13 0.02 230)",
          }}
        >
          <Plus size={15} /> Record Payment
        </button>
      </div>

      {/* Vendor Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
            }}
          >
            <div
              className="font-semibold text-sm mb-1"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              {v.name}
            </div>
            <div
              className="text-xs mb-2"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              {v.phone} &bull; {v.gstin || "No GSTIN"}
            </div>
            <div
              className="text-lg font-bold"
              style={{
                color:
                  v.outstanding > 0
                    ? "oklch(0.58 0.18 25)"
                    : "oklch(0.73 0.15 160)",
              }}
            >
              {formatINR(v.outstanding)}
            </div>
            <div className="text-xs" style={{ color: "oklch(0.67 0.02 230)" }}>
              Outstanding
            </div>
          </div>
        ))}
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
              Record Payment
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
                Vendor
              </p>
              <select
                value={form.vendorId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vendorId: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Amount (₹)
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
                Mode
              </p>
              <select
                value={form.mode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mode: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                {["NEFT", "RTGS", "UPI", "Cash", "Cheque"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Reference #
              </p>
              <input
                value={form.reference}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reference: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="TXN ID"
              />
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Notes
              </p>
              <input
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="Optional note"
              />
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
            Record Payment
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
              {["Date", "Vendor", "Amount", "Mode", "Reference", "Notes"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-t"
                style={{ borderColor: "oklch(0.22 0.025 230)" }}
              >
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatDate(p.date)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {p.vendorName}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.73 0.15 160)" }}
                >
                  {formatINR(p.amount)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {p.mode}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.58 0.18 255)" }}
                >
                  {p.reference}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {p.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
