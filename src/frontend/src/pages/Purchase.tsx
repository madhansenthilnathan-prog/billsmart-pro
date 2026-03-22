import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PurchaseBill, PurchaseItem } from "../backend";
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
const todayStr = () => new Date().toISOString().slice(0, 10);

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  costPrice: number;
}

export default function Purchase() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [date, setDate] = useState(todayStr());
  const [lines, setLines] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      qty: 1,
      costPrice: 0,
    },
  ]);

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => actor!.getAllPurchaseBills(),
    enabled: !!actor,
  });
  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => actor!.getAllVendors(),
    enabled: !!actor,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getAllProducts(),
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: (bill: PurchaseBill) => actor!.createPurchaseBill(bill),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Purchase bill created");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deletePurchaseBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Bill deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setVendorId("");
    setVendorName("");
    setDate(todayStr());
    setLines([
      {
        id: crypto.randomUUID(),
        productId: "",
        productName: "",
        qty: 1,
        costPrice: 0,
      },
    ]);
  };

  const genBillNumber = () => {
    const d = date.replace(/-/g, "");
    const num = String(
      bills.filter((b) => b.billNumber.includes(d)).length + 1,
    ).padStart(3, "0");
    return `PO-${d}-${num}`;
  };

  const totalRupees = lines.reduce((s, l) => s + l.qty * l.costPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName) {
      toast.error("Vendor name required");
      return;
    }
    if (lines.some((l) => !l.productName)) {
      toast.error("All items need a product");
      return;
    }
    const dateNs = BigInt(new Date(date).getTime()) * 1_000_000n;
    const items: PurchaseItem[] = lines.map((l) => ({
      productId: l.productId,
      productName: l.productName,
      qty: BigInt(l.qty),
      costPrice: toPaise(l.costPrice),
      amount: toPaise(l.qty * l.costPrice),
    }));
    const bill: PurchaseBill = {
      id: crypto.randomUUID(),
      owner: PLACEHOLDER,
      billNumber: genBillNumber(),
      date: dateNs,
      vendorId: vendorId || crypto.randomUUID(),
      vendorName,
      items,
      totalAmount: toPaise(totalRupees),
      createdAt: nowNs(),
    };
    addMutation.mutate(bill);
  };

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
            Purchase
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.67 0.02 230)" }}>
            {bills.length} bills
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
          <Plus size={14} /> New Purchase Bill
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto py-8"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-xl mx-4"
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
                New Purchase Bill
              </h2>
              <button type="button" onClick={resetForm}>
                <X size={16} style={{ color: "oklch(0.67 0.02 230)" }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div style={labelStyle}>Vendor</div>
                  <select
                    style={inputStyle}
                    value={vendorId}
                    onChange={(e) => {
                      const v = vendors.find((v) => v.id === e.target.value);
                      if (v) {
                        setVendorId(v.id);
                        setVendorName(v.name);
                      } else {
                        setVendorId("");
                      }
                    }}
                  >
                    <option value="">-- Select vendor --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {!vendorId && (
                    <input
                      style={{ ...inputStyle, marginTop: 4 }}
                      placeholder="Or type vendor name"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                    />
                  )}
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
              </div>

              <div>
                <div style={labelStyle}>Items</div>
                <div className="space-y-2">
                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className="grid gap-2"
                      style={{ gridTemplateColumns: "2fr 1fr 1fr auto" }}
                    >
                      <select
                        style={inputStyle}
                        value={line.productId}
                        onChange={(e) => {
                          const p = products.find(
                            (p) => p.id === e.target.value,
                          );
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id
                                ? {
                                    ...l,
                                    productId: p?.id || "",
                                    productName: p?.name || "",
                                    costPrice: p
                                      ? Number(p.costPrice) / 100
                                      : 0,
                                  }
                                : l,
                            ),
                          );
                        }}
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        style={inputStyle}
                        value={line.qty}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id
                                ? {
                                    ...l,
                                    qty: Number.parseInt(e.target.value) || 1,
                                  }
                                : l,
                            ),
                          )
                        }
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Cost ₹"
                        style={inputStyle}
                        value={line.costPrice}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id
                                ? {
                                    ...l,
                                    costPrice:
                                      Number.parseFloat(e.target.value) || 0,
                                  }
                                : l,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter((l) => l.id !== line.id),
                          )
                        }
                        disabled={lines.length === 1}
                        style={{ color: "oklch(0.58 0.18 25)" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setLines((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          productId: "",
                          productName: "",
                          qty: 1,
                          costPrice: 0,
                        },
                      ])
                    }
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.79 0.13 185)" }}
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              <div
                className="text-sm font-semibold text-right"
                style={{ color: "oklch(0.93 0.015 230)" }}
              >
                Total: ₹{totalRupees.toFixed(2)}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
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
                  {addMutation.isPending ? "Saving..." : "Create Bill"}
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
      ) : bills.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            No purchase bills yet.
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
                {["Bill No", "Vendor", "Date", "Items", "Total", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {bills
                .sort((a, b) => Number(b.date - a.date))
                .map((bill, i) => (
                  <tr
                    key={bill.id}
                    style={{
                      background:
                        i % 2 === 0
                          ? "oklch(0.19 0.025 230)"
                          : "oklch(0.17 0.02 230)",
                      borderTop: "1px solid oklch(0.22 0.025 230)",
                    }}
                  >
                    <td
                      className="px-4 py-3 font-mono text-xs"
                      style={{ color: "oklch(0.79 0.13 185)" }}
                    >
                      {bill.billNumber}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "oklch(0.87 0.015 230)" }}
                    >
                      {bill.vendorName}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      {formatDate(bill.date)}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      {bill.items.length} items
                    </td>
                    <td
                      className="px-4 py-3 font-semibold"
                      style={{ color: "oklch(0.87 0.015 230)" }}
                    >
                      ₹{toRupees(bill.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete bill?"))
                            deleteMutation.mutate(bill.id);
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
