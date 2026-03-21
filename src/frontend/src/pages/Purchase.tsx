import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, formatINR, genId } from "../lib/formatters";
import {
  sampleProducts,
  samplePurchases,
  sampleVendors,
} from "../lib/sampleData";

interface POItem {
  id: string;
  name: string;
  qty: number;
  purchasePrice: number;
  gstRate: number;
  amount: number;
}
interface PO {
  id: string;
  poNo: string;
  vendorId: string;
  vendorName: string;
  date: string;
  items: POItem[];
  subtotal: number;
  totalGst: number;
  total: number;
  status: string;
}

export default function Purchase() {
  const [pos, setPos] = useState<PO[]>(samplePurchases as PO[]);
  const [showForm, setShowForm] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [formItems, setFormItems] = useState<POItem[]>([
    { id: genId(), name: "", qty: 1, purchasePrice: 0, gstRate: 5, amount: 0 },
  ]);

  const updateItem = (id: string, field: string, value: string | number) => {
    setFormItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        updated.amount = updated.qty * updated.purchasePrice;
        return updated;
      }),
    );
  };

  const subtotal = formItems.reduce((s, i) => s + i.amount, 0);
  const totalGst = formItems.reduce(
    (s, i) => s + i.amount * (i.gstRate / 100),
    0,
  );
  const total = subtotal + totalGst;

  const handleSave = () => {
    if (!vendorName) {
      toast.error("Enter vendor name");
      return;
    }
    const po: PO = {
      id: genId(),
      poNo: `PO-2024-${String(pos.length + 1).padStart(3, "0")}`,
      vendorId: genId(),
      vendorName,
      date: new Date().toISOString().slice(0, 10),
      items: formItems,
      subtotal,
      totalGst,
      total,
      status: "Pending",
    };
    setPos((prev) => [po, ...prev]);
    toast.success(`${po.poNo} created!`);
    setShowForm(false);
    setVendorName("");
    setFormItems([
      {
        id: genId(),
        name: "",
        qty: 1,
        purchasePrice: 0,
        gstRate: 5,
        amount: 0,
      },
    ]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          Purchase Orders
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
          <Plus size={15} /> New PO
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
              New Purchase Order
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={18} style={{ color: "oklch(0.67 0.02 230)" }} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Vendor Name *
              </p>
              <input
                list="vendors-list"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="Vendor name"
              />
              <datalist id="vendors-list">
                {sampleVendors.map((v) => (
                  <option key={v.id} value={v.name} />
                ))}
              </datalist>
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
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              />
            </div>
          </div>
          <div
            className="rounded-lg overflow-hidden mb-4"
            style={{ border: "1px solid oklch(0.26 0.025 230)" }}
          >
            <table className="w-full text-sm">
              <thead style={{ background: "oklch(0.22 0.025 230)" }}>
                <tr>
                  {[
                    "Product",
                    "Qty",
                    "Purchase Price",
                    "GST %",
                    "Amount",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 text-xs font-medium"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formItems.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderTop: "1px solid oklch(0.22 0.025 230)" }}
                  >
                    <td className="px-3 py-2">
                      <input
                        list="products-list2"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        className="w-full px-2 py-1 rounded text-sm"
                        style={{
                          background: "oklch(0.22 0.025 230)",
                          border: "1px solid oklch(0.26 0.025 230)",
                          color: "oklch(0.93 0.015 230)",
                        }}
                      />
                      <datalist id="products-list2">
                        {sampleProducts.map((p) => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(item.id, "qty", +e.target.value)
                        }
                        className="w-20 px-2 py-1 rounded text-sm"
                        style={{
                          background: "oklch(0.22 0.025 230)",
                          border: "1px solid oklch(0.26 0.025 230)",
                          color: "oklch(0.93 0.015 230)",
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.purchasePrice}
                        onChange={(e) =>
                          updateItem(item.id, "purchasePrice", +e.target.value)
                        }
                        className="w-24 px-2 py-1 rounded text-sm"
                        style={{
                          background: "oklch(0.22 0.025 230)",
                          border: "1px solid oklch(0.26 0.025 230)",
                          color: "oklch(0.93 0.015 230)",
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.gstRate}
                        onChange={(e) =>
                          updateItem(item.id, "gstRate", +e.target.value)
                        }
                        className="w-16 px-2 py-1 rounded text-sm"
                        style={{
                          background: "oklch(0.22 0.025 230)",
                          border: "1px solid oklch(0.26 0.025 230)",
                          color: "oklch(0.93 0.015 230)",
                        }}
                      />
                    </td>
                    <td
                      className="px-3 py-2 font-semibold"
                      style={{ color: "oklch(0.93 0.015 230)" }}
                    >
                      {formatINR(item.amount)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormItems((prev) =>
                            prev.filter((i) => i.id !== item.id),
                          )
                        }
                      >
                        <Trash2
                          size={14}
                          style={{ color: "oklch(0.58 0.18 25)" }}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormItems((prev) => [
                ...prev,
                {
                  id: genId(),
                  name: "",
                  qty: 1,
                  purchasePrice: 0,
                  gstRate: 5,
                  amount: 0,
                },
              ])
            }
            className="text-xs mb-4"
            style={{ color: "oklch(0.79 0.13 185)" }}
          >
            + Add Item
          </button>
          <div className="flex justify-between items-end">
            <div className="text-sm space-y-1">
              <div style={{ color: "oklch(0.67 0.02 230)" }}>
                Subtotal: {formatINR(subtotal)}
              </div>
              <div style={{ color: "oklch(0.67 0.02 230)" }}>
                GST: {formatINR(totalGst)}
              </div>
              <div
                className="font-bold text-base"
                style={{ color: "oklch(0.93 0.015 230)" }}
              >
                Total: {formatINR(total)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "oklch(0.79 0.13 185)",
                color: "oklch(0.13 0.02 230)",
              }}
            >
              Save PO
            </button>
          </div>
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
                "PO #",
                "Date",
                "Vendor",
                "Subtotal",
                "GST",
                "Total",
                "Status",
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
            {pos.map((po) => (
              <tr
                key={po.id}
                className="border-t"
                style={{ borderColor: "oklch(0.22 0.025 230)" }}
              >
                <td
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "oklch(0.58 0.18 255)" }}
                >
                  {po.poNo}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatDate(po.date)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {po.vendorName}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(po.subtotal)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatINR(po.totalGst)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(po.total)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background:
                        po.status === "Received"
                          ? "oklch(0.73 0.15 160 / 0.15)"
                          : "oklch(0.75 0.15 70 / 0.15)",
                      color:
                        po.status === "Received"
                          ? "oklch(0.73 0.15 160)"
                          : "oklch(0.75 0.15 70)",
                    }}
                  >
                    {po.status}
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
