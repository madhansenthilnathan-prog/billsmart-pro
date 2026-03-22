import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Package, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useActor } from "../hooks/useActor";

const toRupees = (p: bigint) => (Number(p) / 100).toFixed(2);
const toPaise = (r: number) => BigInt(Math.round(r * 100));
const nowNs = () => BigInt(Date.now()) * 1_000_000n;
const PLACEHOLDER_PRINCIPAL = Principal.fromText("2vxsx-fae");

const emptyForm = () => ({
  name: "",
  sku: "",
  hsnCode: "",
  category: "",
  costPrice: "",
  sellingPrice: "",
  gstPercent: "5",
  stockQty: "0",
});

export default function Inventory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getAllProducts(),
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: (p: Product) => actor!.createProduct(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added");
      setShowForm(false);
      setForm(emptyForm());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, p }: { id: string; p: Product }) =>
      actor!.updateProduct(id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) {
      toast.error("Name and SKU are required");
      return;
    }
    const product: Product = {
      id: editId ?? crypto.randomUUID(),
      owner: PLACEHOLDER_PRINCIPAL,
      name: form.name,
      sku: form.sku,
      hsnCode: form.hsnCode,
      category: form.category,
      costPrice: toPaise(Number.parseFloat(form.costPrice) || 0),
      sellingPrice: toPaise(Number.parseFloat(form.sellingPrice) || 0),
      gstPercent: BigInt(form.gstPercent || "0"),
      stockQty: BigInt(form.stockQty || "0"),
      createdAt: nowNs(),
      updatedAt: nowNs(),
    };
    if (editId) {
      updateMutation.mutate({ id: editId, p: product });
    } else {
      addMutation.mutate(product);
    }
  };

  const handleEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      hsnCode: p.hsnCode,
      category: p.category,
      costPrice: toRupees(p.costPrice),
      sellingPrice: toRupees(p.sellingPrice),
      gstPercent: String(Number(p.gstPercent)),
      stockQty: String(Number(p.stockQty)),
    });
    setShowForm(true);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split("\n").slice(1); // skip header
      let count = 0;
      for (const line of lines) {
        const [name, sku, hsnCode, category, costP, sellP, gst, stock] = line
          .split(",")
          .map((s) => s.trim());
        if (!name || !sku) continue;
        const product: Product = {
          id: crypto.randomUUID(),
          owner: PLACEHOLDER_PRINCIPAL,
          name,
          sku,
          hsnCode: hsnCode || "",
          category: category || "",
          costPrice: toPaise(Number.parseFloat(costP) || 0),
          sellingPrice: toPaise(Number.parseFloat(sellP) || 0),
          gstPercent: BigInt(gst || "0"),
          stockQty: BigInt(stock || "0"),
          createdAt: nowNs(),
          updatedAt: nowNs(),
        };
        await actor!.createProduct(product);
        count++;
      }
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Imported ${count} products`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

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
            Inventory
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.67 0.02 230)" }}>
            {products.length} products
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "oklch(0.24 0.025 230)",
              color: "oklch(0.87 0.015 230)",
            }}
          >
            <Upload size={14} /> Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSV}
          />
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(emptyForm());
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "oklch(0.79 0.13 185)",
              color: "oklch(0.13 0.02 230)",
            }}
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
        style={{ ...inputStyle, width: 280 }}
      />

      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-lg"
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
                {editId ? "Edit Product" : "Add Product"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
              >
                <X size={16} style={{ color: "oklch(0.67 0.02 230)" }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div style={labelStyle}>Product Name *</div>
                  <input
                    required
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>SKU *</div>
                  <input
                    required
                    style={inputStyle}
                    value={form.sku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sku: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>HSN Code</div>
                  <input
                    style={inputStyle}
                    value={form.hsnCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hsnCode: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>Category</div>
                  <input
                    style={inputStyle}
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>Cost Price (₹)</div>
                  <input
                    type="number"
                    step="0.01"
                    style={inputStyle}
                    value={form.costPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, costPrice: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>Selling Price (₹)</div>
                  <input
                    type="number"
                    step="0.01"
                    style={inputStyle}
                    value={form.sellingPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sellingPrice: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>GST %</div>
                  <select
                    style={inputStyle}
                    value={form.gstPercent}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, gstPercent: e.target.value }))
                    }
                  >
                    {[0, 5, 12, 18, 28].map((r) => (
                      <option key={r} value={r}>
                        {r}%
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>Stock Qty</div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={form.stockQty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stockQty: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
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
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: "oklch(0.79 0.13 185)",
                    color: "oklch(0.13 0.02 230)",
                  }}
                >
                  {addMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl animate-pulse"
              style={{ background: "oklch(0.19 0.025 230)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <Package
            size={40}
            className="mx-auto mb-3"
            style={{ color: "oklch(0.4 0.02 230)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            {search
              ? "No products match your search"
              : "No products yet. Add your first product or import via CSV."}
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
                {[
                  "Product",
                  "SKU",
                  "HSN",
                  "Category",
                  "Cost",
                  "Selling",
                  "GST%",
                  "Stock",
                  "",
                ].map((h) => (
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
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    background:
                      i % 2 === 0
                        ? "oklch(0.19 0.025 230)"
                        : "oklch(0.17 0.02 230)",
                    borderTop: "1px solid oklch(0.22 0.025 230)",
                  }}
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "oklch(0.87 0.015 230)" }}
                  >
                    {p.name}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {p.sku}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {p.hsnCode}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {p.category}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.87 0.015 230)" }}
                  >
                    ₹{toRupees(p.costPrice)}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.87 0.015 230)" }}
                  >
                    ₹{toRupees(p.sellingPrice)}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.87 0.015 230)" }}
                  >
                    {Number(p.gstPercent)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        color:
                          Number(p.stockQty) === 0
                            ? "oklch(0.58 0.18 25)"
                            : Number(p.stockQty) <= 10
                              ? "oklch(0.75 0.15 70)"
                              : "oklch(0.73 0.15 160)",
                        fontWeight: 600,
                      }}
                    >
                      {Number(p.stockQty)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        style={{ color: "oklch(0.67 0.02 230)" }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${p.name}?`))
                            deleteMutation.mutate(p.id);
                        }}
                        style={{ color: "oklch(0.58 0.18 25)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 text-xs" style={{ color: "oklch(0.5 0.02 230)" }}>
        CSV format: name, sku, hsnCode, category, costPrice, sellingPrice,
        gstPercent, stockQty
      </div>
    </div>
  );
}
