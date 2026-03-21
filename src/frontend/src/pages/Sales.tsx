import { Plus, Printer, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, formatINR, genId } from "../lib/formatters";
import {
  sampleCustomers,
  sampleInvoices,
  sampleProducts,
} from "../lib/sampleData";

const STATUS_COLORS: Record<string, string> = {
  Paid: "oklch(0.73 0.15 160)",
  Pending: "oklch(0.75 0.15 70)",
  Overdue: "oklch(0.58 0.18 25)",
};

interface InvoiceItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
  gstRate: number;
  amount: number;
}
interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  paymentMode: string;
  status: string;
}

export default function Sales() {
  const [invoices, setInvoices] = useState<Invoice[]>(
    sampleInvoices as Invoice[],
  );
  const [showForm, setShowForm] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form state
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custGstin, setCustGstin] = useState("");
  const [isInterState, setIsInterState] = useState(false);
  const [payMode, setPayMode] = useState("Cash");
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    {
      id: genId(),
      name: "",
      qty: 1,
      price: 0,
      discount: 0,
      gstRate: 5,
      amount: 0,
    },
  ]);

  const calcItem = (item: InvoiceItem) => {
    const base = item.qty * item.price * (1 - item.discount / 100);
    return { ...item, amount: base };
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setFormItems((prev) =>
      prev.map((it) =>
        it.id === id ? calcItem({ ...it, [field]: value }) : it,
      ),
    );
  };

  const subtotal = formItems.reduce((s, i) => s + i.amount, 0);
  const totalGst = formItems.reduce(
    (s, i) => s + i.amount * (i.gstRate / 100),
    0,
  );
  const cgst = isInterState ? 0 : totalGst / 2;
  const sgst = isInterState ? 0 : totalGst / 2;
  const igst = isInterState ? totalGst : 0;
  const total = subtotal + totalGst;

  const handleSave = (status: string) => {
    if (!custName || formItems.some((i) => !i.name)) {
      toast.error("Fill all required fields");
      return;
    }
    const inv: Invoice = {
      id: genId(),
      invoiceNo: `INV-2024-${String(invoices.length + 1).padStart(3, "0")}`,
      customerId: genId(),
      customerName: custName,
      date: new Date().toISOString().slice(0, 10),
      items: formItems,
      subtotal,
      cgst,
      sgst,
      igst,
      total,
      paymentMode: payMode,
      status,
    };
    setInvoices((prev) => [inv, ...prev]);
    toast.success(`Invoice ${inv.invoiceNo} saved!`);
    setShowForm(false);
    setCustName("");
    setCustPhone("");
    setFormItems([
      {
        id: genId(),
        name: "",
        qty: 1,
        price: 0,
        discount: 0,
        gstRate: 5,
        amount: 0,
      },
    ]);
  };

  const filtered = invoices.filter(
    (inv) =>
      (statusFilter === "All" || inv.status === statusFilter) &&
      (inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase())),
  );

  if (printInvoice) {
    return (
      <div className="print-invoice p-8 bg-white text-black min-h-screen">
        <div className="no-print mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            onClick={() => setPrintInvoice(null)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Back
          </button>
        </div>
        <div className="max-w-2xl mx-auto border border-gray-200 p-8 rounded">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Retail Store
              </h1>
              <p className="text-sm text-gray-500">GSTIN: 29AABCS1234Z1Z5</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">TAX INVOICE</p>
              <p className="text-sm font-semibold">{printInvoice.invoiceNo}</p>
              <p className="text-sm text-gray-500">
                {formatDate(printInvoice.date)}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700">Bill To:</p>
            <p className="font-semibold">{printInvoice.customerName}</p>
            {printInvoice.customerId && (
              <p className="text-sm text-gray-500">Phone: {custPhone}</p>
            )}
          </div>
          <table className="w-full text-sm mb-6 border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["Item", "Qty", "Price", "Disc%", "GST%", "Amount"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left border border-gray-200"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {printInvoice.items.map((item) => (
                <tr key={item.name}>
                  <td className="px-3 py-2 border border-gray-200">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    {item.qty}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    {formatINR(item.price)}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    {item.discount}%
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    {item.gstRate}%
                  </td>
                  <td className="px-3 py-2 border border-gray-200 font-medium">
                    {formatINR(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatINR(printInvoice.subtotal)}</span>
            </div>
            {printInvoice.cgst > 0 && (
              <>
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span>{formatINR(printInvoice.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span>{formatINR(printInvoice.sgst)}</span>
                </div>
              </>
            )}
            {printInvoice.igst > 0 && (
              <div className="flex justify-between">
                <span>IGST:</span>
                <span>{formatINR(printInvoice.igst)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1 mt-1">
              <span>Total:</span>
              <span>{formatINR(printInvoice.total)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-8 text-center">
            Thank you for your business!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          Sales Invoices
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
          <Plus size={15} /> New Invoice
        </button>
      </div>

      {/* New Invoice Form */}
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
              className="text-lg font-semibold"
              style={{ color: "oklch(0.93 0.015 230)" }}
            >
              New Invoice
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={18} style={{ color: "oklch(0.67 0.02 230)" }} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Customer Name *
              </p>
              <input
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="Customer name"
              />
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Phone
              </p>
              <input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="9XXXXXXXXX"
              />
            </div>
            <div>
              <p
                className="text-xs font-medium block mb-1"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                GSTIN
              </p>
              <input
                value={custGstin}
                onChange={(e) => setCustGstin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
                placeholder="27AABCU9603R1ZX"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <label
              className="flex items-center gap-2 text-sm"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              <input
                type="checkbox"
                checked={isInterState}
                onChange={(e) => setIsInterState(e.target.checked)}
                className="rounded"
              />
              Inter-State (IGST)
            </label>
            <div className="flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                Payment:
              </span>
              <select
                value={payMode}
                onChange={(e) => setPayMode(e.target.value)}
                className="px-2 py-1 rounded text-sm"
                style={{
                  background: "oklch(0.22 0.025 230)",
                  border: "1px solid oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                {["Cash", "UPI", "Card", "Credit", "Bank Transfer"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
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
                    "Price (₹)",
                    "Disc %",
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
                        list="products-list"
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
                        placeholder="Product name"
                      />
                      <datalist id="products-list">
                        {sampleProducts.map((p) => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                    </td>
                    {["qty", "price", "discount", "gstRate"].map((field) => (
                      <td key={field} className="px-3 py-2">
                        <input
                          type="number"
                          value={item[field as keyof InvoiceItem] as number}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              field as keyof InvoiceItem,
                              +e.target.value,
                            )
                          }
                          className="w-20 px-2 py-1 rounded text-sm"
                          style={{
                            background: "oklch(0.22 0.025 230)",
                            border: "1px solid oklch(0.26 0.025 230)",
                            color: "oklch(0.93 0.015 230)",
                          }}
                        />
                      </td>
                    ))}
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
                  price: 0,
                  discount: 0,
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

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div
                className="flex justify-between"
                style={{ color: "oklch(0.67 0.02 230)" }}
              >
                <span>Subtotal:</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {!isInterState && (
                <>
                  <div
                    className="flex justify-between"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    <span>CGST:</span>
                    <span>{formatINR(cgst)}</span>
                  </div>
                  <div
                    className="flex justify-between"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    <span>SGST:</span>
                    <span>{formatINR(sgst)}</span>
                  </div>
                </>
              )}
              {isInterState && (
                <div
                  className="flex justify-between"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  <span>IGST:</span>
                  <span>{formatINR(igst)}</span>
                </div>
              )}
              <div
                className="flex justify-between font-bold text-base pt-2 border-t"
                style={{
                  borderColor: "oklch(0.26 0.025 230)",
                  color: "oklch(0.93 0.015 230)",
                }}
              >
                <span>Total:</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => handleSave("Paid")}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "oklch(0.79 0.13 185)",
                color: "oklch(0.13 0.02 230)",
              }}
            >
              Save &amp; Paid
            </button>
            <button
              type="button"
              onClick={() => handleSave("Pending")}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "oklch(0.22 0.025 230)",
                border: "1px solid oklch(0.26 0.025 230)",
                color: "oklch(0.93 0.015 230)",
              }}
            >
              Save as Pending
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg text-sm"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.26 0.025 230)",
            color: "oklch(0.93 0.015 230)",
          }}
          placeholder="Search invoices..."
        />
        {["All", "Paid", "Pending", "Overdue"].map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background:
                statusFilter === s
                  ? "oklch(0.79 0.13 185)"
                  : "oklch(0.19 0.025 230)",
              color:
                statusFilter === s
                  ? "oklch(0.13 0.02 230)"
                  : "oklch(0.67 0.02 230)",
              border: "1px solid oklch(0.26 0.025 230)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.26 0.025 230)" }}
      >
        <table className="w-full">
          <thead style={{ background: "oklch(0.19 0.025 230)" }}>
            <tr>
              {[
                "Invoice #",
                "Date",
                "Customer",
                "Subtotal",
                "GST",
                "Total",
                "Payment",
                "Status",
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
            {filtered.map((inv) => (
              <tr
                key={inv.id}
                className="border-t transition-colors"
                style={{ borderColor: "oklch(0.22 0.025 230)" }}
              >
                <td
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "oklch(0.58 0.18 255)" }}
                >
                  {inv.invoiceNo}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatDate(inv.date)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {inv.customerName}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(inv.subtotal)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {formatINR(inv.cgst + inv.sgst + inv.igst)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(inv.total)}
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {inv.paymentMode}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      background: `${STATUS_COLORS[inv.status]} / 0.15`,
                      color: STATUS_COLORS[inv.status],
                    }}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setPrintInvoice(inv)}
                    className="p-1.5 rounded"
                    style={{ background: "oklch(0.22 0.025 230)" }}
                  >
                    <Printer
                      size={14}
                      style={{ color: "oklch(0.79 0.13 185)" }}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
