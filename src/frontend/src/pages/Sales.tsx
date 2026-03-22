import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Printer, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Customer,
  GSTType,
  type InvoiceItem,
  type SalesInvoice,
  TaxMode,
} from "../backend";
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
  hsnCode: string;
  qty: number;
  rate: number;
  gstPercent: number;
}

export default function Sales() {
  const { actor } = useActor();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<SalesInvoice | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [custId, setCustId] = useState("");
  const [custName, setCustName] = useState("");
  const [date, setDate] = useState(todayStr());
  const [taxMode, setTaxMode] = useState<"inclusive" | "exclusive">(
    "exclusive",
  );
  const [gstType, setGstType] = useState<"cgst_sgst" | "igst">("cgst_sgst");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      hsnCode: "",
      qty: 1,
      rate: 0,
      gstPercent: 5,
    },
  ]);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => actor!.getAllSalesInvoices(),
    enabled: !!actor,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => actor!.getAllCustomers(),
    enabled: !!actor,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => actor!.getAllProducts(),
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: (inv: SalesInvoice) => actor!.createSalesInvoice(inv),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Invoice created");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteSalesInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setCustId("");
    setCustName("");
    setDate(todayStr());
    setTaxMode("exclusive");
    setGstType("cgst_sgst");
    setNotes("");
    setLines([
      {
        id: crypto.randomUUID(),
        productId: "",
        productName: "",
        hsnCode: "",
        qty: 1,
        rate: 0,
        gstPercent: 5,
      },
    ]);
  };

  const genInvoiceNumber = () => {
    const d = date.replace(/-/g, "");
    const existing = invoices.filter((inv) => inv.invoiceNumber.includes(d));
    const num = String(existing.length + 1).padStart(3, "0");
    return `INV-${d}-${num}`;
  };

  const calcLine = (l: LineItem) => {
    if (taxMode === "inclusive") {
      const base = (l.rate * l.qty * 100) / (100 + l.gstPercent);
      const tax = l.rate * l.qty - base;
      return { base, tax };
    }
    const base = l.rate * l.qty;
    const tax = base * (l.gstPercent / 100);
    return { base, tax };
  };

  const subtotalRupees = lines.reduce((s, l) => s + calcLine(l).base, 0);
  const taxRupees = lines.reduce((s, l) => s + calcLine(l).tax, 0);
  const totalRupees =
    taxMode === "inclusive"
      ? lines.reduce((s, l) => s + l.rate * l.qty, 0)
      : subtotalRupees + taxRupees;

  const handleSelectProduct = (lineId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              productId: product.id,
              productName: product.name,
              hsnCode: product.hsnCode,
              rate: Number(product.sellingPrice) / 100,
              gstPercent: Number(product.gstPercent),
            }
          : l,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName) {
      toast.error("Customer name is required");
      return;
    }
    if (lines.some((l) => !l.productName)) {
      toast.error("All line items need a product");
      return;
    }

    const dateNs = BigInt(new Date(date).getTime()) * 1_000_000n;
    const items: InvoiceItem[] = lines.map((l) => {
      const { base, tax } = calcLine(l);
      const cgst = gstType === "cgst_sgst" ? toPaise(tax / 2) : 0n;
      const sgst = gstType === "cgst_sgst" ? toPaise(tax / 2) : 0n;
      const igst = gstType === "igst" ? toPaise(tax) : 0n;
      return {
        productId: l.productId,
        productName: l.productName,
        hsnCode: l.hsnCode,
        qty: BigInt(l.qty),
        rate: toPaise(l.rate),
        gstPercent: BigInt(l.gstPercent),
        cgst,
        sgst,
        igst,
        amount: toPaise(base + tax),
      };
    });

    const invoice: SalesInvoice = {
      id: crypto.randomUUID(),
      owner: PLACEHOLDER,
      invoiceNumber: genInvoiceNumber(),
      date: dateNs,
      customerId: custId || crypto.randomUUID(),
      customerName: custName,
      items,
      subtotal: toPaise(subtotalRupees),
      taxAmount: toPaise(taxRupees),
      totalAmount: toPaise(totalRupees),
      gstType: gstType === "cgst_sgst" ? GSTType.cgst_sgst : GSTType.igst,
      taxMode: taxMode === "inclusive" ? TaxMode.inclusive : TaxMode.exclusive,
      notes,
      createdAt: nowNs(),
    };
    addMutation.mutate(invoice);
  };

  const filtered = invoices
    .filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => Number(b.date - a.date));

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
            Sales Invoices
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.67 0.02 230)" }}>
            {invoices.length} invoices
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
          <Plus size={14} /> New Invoice
        </button>
      </div>

      <input
        placeholder="Search invoices..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
        style={{ ...inputStyle, width: 280 }}
      />

      {/* Create Invoice Modal */}
      {showForm && (
        <div
          className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto py-8"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-2xl mx-4"
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
                New Sales Invoice
              </h2>
              <button type="button" onClick={resetForm}>
                <X size={16} style={{ color: "oklch(0.67 0.02 230)" }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <div style={labelStyle}>Customer</div>
                  <select
                    style={inputStyle}
                    value={custId}
                    onChange={(e) => {
                      const c = customers.find((c) => c.id === e.target.value);
                      if (c) {
                        setCustId(c.id);
                        setCustName(c.name);
                      } else {
                        setCustId("");
                        setCustName(
                          e.target.value === "__new__" ? "" : e.target.value,
                        );
                      }
                    }}
                  >
                    <option value="">-- Select or type below --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {!custId && (
                    <input
                      style={{ ...inputStyle, marginTop: 4 }}
                      placeholder="Or type customer name"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
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

              <div className="flex gap-4">
                <div>
                  <div style={labelStyle}>Tax Mode</div>
                  <div className="flex gap-2">
                    {(["exclusive", "inclusive"] as const).map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setTaxMode(m)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background:
                            taxMode === m
                              ? "oklch(0.79 0.13 185)"
                              : "oklch(0.24 0.025 230)",
                          color:
                            taxMode === m
                              ? "oklch(0.13 0.02 230)"
                              : "oklch(0.87 0.015 230)",
                        }}
                      >
                        {m === "exclusive" ? "Exclusive" : "Inclusive"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>GST Type</div>
                  <div className="flex gap-2">
                    {(["cgst_sgst", "igst"] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGstType(g)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background:
                            gstType === g
                              ? "oklch(0.79 0.13 185)"
                              : "oklch(0.24 0.025 230)",
                          color:
                            gstType === g
                              ? "oklch(0.13 0.02 230)"
                              : "oklch(0.87 0.015 230)",
                        }}
                      >
                        {g === "cgst_sgst" ? "CGST+SGST" : "IGST"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={labelStyle}>Line Items</div>
                <div className="space-y-2">
                  {lines.map((line, _i) => (
                    <div
                      key={line.id}
                      className="grid gap-2"
                      style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}
                    >
                      <select
                        style={inputStyle}
                        value={line.productId}
                        onChange={(e) =>
                          handleSelectProduct(line.id, e.target.value)
                        }
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
                        placeholder="Rate ₹"
                        style={inputStyle}
                        value={line.rate}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id
                                ? {
                                    ...l,
                                    rate:
                                      Number.parseFloat(e.target.value) || 0,
                                  }
                                : l,
                            ),
                          )
                        }
                      />
                      <select
                        style={inputStyle}
                        value={line.gstPercent}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id
                                ? {
                                    ...l,
                                    gstPercent: Number.parseInt(e.target.value),
                                  }
                                : l,
                            ),
                          )
                        }
                      >
                        {[0, 5, 12, 18, 28].map((r) => (
                          <option key={r} value={r}>
                            {r}% GST
                          </option>
                        ))}
                      </select>
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
                          hsnCode: "",
                          qty: 1,
                          rate: 0,
                          gstPercent: 5,
                        },
                      ])
                    }
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.79 0.13 185)" }}
                  >
                    + Add Line
                  </button>
                </div>
              </div>

              <div
                className="rounded-xl p-4 text-sm space-y-1"
                style={{ background: "oklch(0.15 0.02 230)" }}
              >
                <div
                  className="flex justify-between"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  <span>Subtotal</span>
                  <span>₹{subtotalRupees.toFixed(2)}</span>
                </div>
                {gstType === "cgst_sgst" ? (
                  <>
                    <div
                      className="flex justify-between"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      <span>CGST</span>
                      <span>₹{(taxRupees / 2).toFixed(2)}</span>
                    </div>
                    <div
                      className="flex justify-between"
                      style={{ color: "oklch(0.67 0.02 230)" }}
                    >
                      <span>SGST</span>
                      <span>₹{(taxRupees / 2).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div
                    className="flex justify-between"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    <span>IGST</span>
                    <span>₹{taxRupees.toFixed(2)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-semibold pt-1 border-t"
                  style={{
                    color: "oklch(0.93 0.015 230)",
                    borderColor: "oklch(0.26 0.025 230)",
                  }}
                >
                  <span>Total</span>
                  <span>₹{totalRupees.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <div style={labelStyle}>Notes</div>
                <textarea
                  style={{ ...inputStyle, height: 60, resize: "vertical" }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                  {addMutation.isPending ? "Creating..." : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printInvoice && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="bg-white rounded-xl p-8 w-full max-w-lg text-black">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Tax Invoice</h2>
                <p className="text-sm text-gray-600">
                  {printInvoice.invoiceNumber}
                </p>
              </div>
              <button type="button" onClick={() => setPrintInvoice(null)}>
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="font-medium">To: {printInvoice.customerName}</p>
              <p className="text-sm text-gray-600">
                {formatDate(printInvoice.date)}
              </p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Item</th>
                  <th className="text-right py-1">Qty</th>
                  <th className="text-right py-1">Rate</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {printInvoice.items.map((item, i) => (
                  <tr key={item.productId + String(i)} className="border-b">
                    <td className="py-1">{item.productName}</td>
                    <td className="text-right">{Number(item.qty)}</td>
                    <td className="text-right">₹{toRupees(item.rate)}</td>
                    <td className="text-right">₹{toRupees(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-sm space-y-1 text-right">
              <div>Subtotal: ₹{toRupees(printInvoice.subtotal)}</div>
              <div>Tax: ₹{toRupees(printInvoice.taxAmount)}</div>
              <div className="font-bold text-base">
                Total: ₹{toRupees(printInvoice.totalAmount)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm"
            >
              Print
            </button>
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
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            {search
              ? "No invoices match your search"
              : "No invoices yet. Create your first invoice."}
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
                {["Invoice No", "Customer", "Date", "Items", "Total", ""].map(
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
              {filtered.map((inv, i) => (
                <tr
                  key={inv.id}
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
                    {inv.invoiceNumber}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.87 0.015 230)" }}
                  >
                    {inv.customerName}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {formatDate(inv.date)}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {inv.items.length} items
                  </td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "oklch(0.73 0.15 160)" }}
                  >
                    ₹{toRupees(inv.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPrintInvoice(inv)}
                        style={{ color: "oklch(0.67 0.02 230)" }}
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this invoice?"))
                            deleteMutation.mutate(inv.id);
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
    </div>
  );
}
