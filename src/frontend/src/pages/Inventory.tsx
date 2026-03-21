import { Download, Edit2, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { formatINR, genId } from "../lib/formatters";
import { sampleProducts } from "../lib/sampleData";

const GST_RATES = [0, 5, 12, 18, 28];
const CATEGORIES = [
  "Grains",
  "Pulses",
  "Oils",
  "Dairy",
  "Snacks",
  "Instant Food",
  "Cleaning",
  "Personal Care",
  "Beverages",
  "Misc",
];

interface Product {
  id: string;
  name: string;
  category: string;
  hsn: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstRate: number;
  stock: number;
  unit: string;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const emptyForm = (): Product => ({
    id: genId(),
    name: "",
    category: "Misc",
    hsn: "",
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    gstRate: 5,
    stock: 0,
    unit: "Pcs",
  });
  const [form, setForm] = useState<Product>(emptyForm());

  const handleSave = () => {
    if (!form.name) {
      toast.error("Enter product name");
      return;
    }
    if (editProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editProduct.id ? form : p)),
      );
      toast.success("Product updated!");
    } else {
      setProducts((prev) => [...prev, form]);
      toast.success("Product added!");
    }
    setShowForm(false);
    setEditProduct(null);
    setForm(emptyForm());
  };

  const handleEdit = (p: Product) => {
    setEditProduct(p);
    setForm(p);
    setShowForm(true);
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Category",
      "HSN",
      "Purchase Price",
      "Selling Price",
      "MRP",
      "GST Rate",
      "Stock",
      "Unit",
    ];
    const rows = products.map((p) => [
      p.name,
      p.category,
      p.hsn,
      p.purchasePrice,
      p.sellingPrice,
      p.mrp,
      p.gstRate,
      p.stock,
      p.unit,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.csv";
    a.click();
    toast.success("Exported!");
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1).filter(Boolean);
      const newProducts: Product[] = lines.map((line) => {
        const [
          name,
          category,
          hsn,
          purchasePrice,
          sellingPrice,
          mrp,
          gstRate,
          stock,
          unit,
        ] = line.split(",");
        return {
          id: genId(),
          name,
          category,
          hsn,
          purchasePrice: +purchasePrice,
          sellingPrice: +sellingPrice,
          mrp: +mrp,
          gstRate: +gstRate,
          stock: +stock,
          unit,
        };
      });
      setProducts((prev) => [...prev, ...newProducts]);
      toast.success(`Imported ${newProducts.length} products!`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );
  const lowStockCount = products.filter((p) => p.stock <= 3).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            Inventory
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            {products.length} products &bull;{" "}
            <span style={{ color: "oklch(0.58 0.18 25)" }}>
              {lowStockCount} low stock
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={importCSV}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.22 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
              color: "oklch(0.93 0.015 230)",
            }}
          >
            <Upload size={14} /> Import CSV
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.22 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
              color: "oklch(0.93 0.015 230)",
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setEditProduct(null);
              setForm(emptyForm());
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: "oklch(0.79 0.13 185)",
              color: "oklch(0.13 0.02 230)",
            }}
          >
            <Plus size={15} /> Add Product
          </button>
        </div>
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
              {editProduct ? "Edit Product" : "Add Product"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={18} style={{ color: "oklch(0.67 0.02 230)" }} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Product Name *", key: "name", type: "text" },
              { label: "HSN Code", key: "hsn", type: "text" },
              { label: "Unit", key: "unit", type: "text" },
              {
                label: "Purchase Price (₹)",
                key: "purchasePrice",
                type: "number",
              },
              {
                label: "Selling Price (₹)",
                key: "sellingPrice",
                type: "number",
              },
              { label: "MRP (₹)", key: "mrp", type: "number" },
              { label: "Stock Quantity", key: "stock", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <p
                  className="text-xs font-medium block mb-1"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {label}
                </p>
                <input
                  type={type}
                  value={form[key as keyof Product] as string | number}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [key]:
                        type === "number" ? +e.target.value : e.target.value,
                    }))
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
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Category
              </p>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                GST Rate
              </p>
              <select
                value={form.gstRate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gstRate: +e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                {GST_RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
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
            Save Product
          </button>
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm mb-4"
        style={{
          background: "oklch(0.19 0.025 230)",
          border: "1px solid oklch(0.26 0.025 230)",
          color: "oklch(0.93 0.015 230)",
        }}
        placeholder="Search products..."
      />

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.26 0.025 230)" }}
      >
        <table className="w-full">
          <thead style={{ background: "oklch(0.19 0.025 230)" }}>
            <tr>
              {[
                "Product",
                "Category",
                "HSN",
                "Stock",
                "Sell Price",
                "MRP",
                "GST",
                "Actions",
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
            {filtered.map((p) => {
              const isLow = p.stock <= 3;
              return (
                <tr
                  key={p.id}
                  className="border-t"
                  style={{
                    borderColor: "oklch(0.22 0.025 230)",
                    background: isLow
                      ? "oklch(0.58 0.18 25 / 0.05)"
                      : "transparent",
                  }}
                >
                  <td
                    className="px-4 py-3 text-sm font-medium"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {p.name}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {p.category}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {p.hsn}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: isLow
                          ? "oklch(0.58 0.18 25)"
                          : "oklch(0.73 0.15 160)",
                      }}
                    >
                      {p.stock} {p.unit}
                    </span>
                    {isLow && (
                      <span
                        className="ml-1 text-xs"
                        style={{ color: "oklch(0.58 0.18 25)" }}
                      >
                        Low!
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {formatINR(p.sellingPrice)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {formatINR(p.mrp)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {p.gstRate}%
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="p-1.5 rounded"
                      style={{ background: "oklch(0.22 0.025 230)" }}
                    >
                      <Edit2
                        size={13}
                        style={{ color: "oklch(0.79 0.13 185)" }}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
