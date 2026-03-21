import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, formatINR } from "../lib/formatters";
import { sampleInvoices } from "../lib/sampleData";

export default function GSTReports() {
  const [fromDate, setFromDate] = useState("2024-01-01");
  const [toDate, setToDate] = useState("2024-01-31");
  const [tab, setTab] = useState<"gstr1" | "gstr3b">("gstr1");

  const filtered = sampleInvoices.filter(
    (inv) => inv.date >= fromDate && inv.date <= toDate,
  );
  const totalTaxable = filtered.reduce((s, i) => s + i.subtotal, 0);
  const totalCGST = filtered.reduce((s, i) => s + i.cgst, 0);
  const totalSGST = filtered.reduce((s, i) => s + i.sgst, 0);
  const totalIGST = filtered.reduce((s, i) => s + i.igst, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const totalInvoiceValue = filtered.reduce((s, i) => s + i.total, 0);

  const exportCSV = () => {
    const headers = [
      "Invoice #",
      "Date",
      "Customer",
      "Taxable",
      "CGST",
      "SGST",
      "IGST",
      "Total",
    ];
    const rows = filtered.map((inv) => [
      inv.invoiceNo,
      inv.date,
      inv.customerName,
      inv.subtotal,
      inv.cgst,
      inv.sgst,
      inv.igst,
      inv.total,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gst-report.csv";
    a.click();
    toast.success("Exported!");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          GST Reports
        </h1>
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
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <p
            className="text-xs font-medium block mb-1"
            style={{ color: "oklch(0.67 0.02 230)" }}
          >
            From
          </p>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.19 0.025 230)",
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
            To
          </p>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
              color: "oklch(0.93 0.015 230)",
            }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Taxable Value",
            value: formatINR(totalTaxable),
            color: "oklch(0.58 0.18 255)",
          },
          {
            label: "CGST + SGST",
            value: formatINR(totalCGST + totalSGST),
            color: "oklch(0.79 0.13 185)",
          },
          {
            label: "IGST",
            value: formatINR(totalIGST),
            color: "oklch(0.75 0.15 70)",
          },
          {
            label: "Total Tax",
            value: formatINR(totalTax),
            color: "oklch(0.73 0.15 160)",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.26 0.025 230)",
            }}
          >
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "oklch(0.67 0.02 230)" }}
            >
              {label}
            </div>
            <div className="text-xl font-bold" style={{ color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-lg w-fit"
        style={{ background: "oklch(0.19 0.025 230)" }}
      >
        {(["gstr1", "gstr3b"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{
              background: tab === t ? "oklch(0.79 0.13 185)" : "transparent",
              color:
                tab === t ? "oklch(0.13 0.02 230)" : "oklch(0.67 0.02 230)",
            }}
          >
            {t === "gstr1" ? "GSTR-1 (Outward)" : "GSTR-3B (Summary)"}
          </button>
        ))}
      </div>

      {tab === "gstr1" && (
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
                  "GSTIN",
                  "Taxable",
                  "CGST",
                  "SGST",
                  "IGST",
                  "Total",
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
                  className="border-t"
                  style={{ borderColor: "oklch(0.22 0.025 230)" }}
                >
                  <td
                    className="px-4 py-3 text-sm"
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
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    -
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {formatINR(inv.subtotal)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.79 0.13 185)" }}
                  >
                    {formatINR(inv.cgst)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.79 0.13 185)" }}
                  >
                    {formatINR(inv.sgst)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "oklch(0.75 0.15 70)" }}
                  >
                    {formatINR(inv.igst)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-bold"
                    style={{ color: "oklch(0.93 0.015 230)" }}
                  >
                    {formatINR(inv.total)}
                  </td>
                </tr>
              ))}
              <tr
                style={{
                  background: "oklch(0.22 0.025 230)",
                  borderTop: "2px solid oklch(0.26 0.025 230)",
                }}
              >
                <td
                  colSpan={4}
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  TOTAL
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(totalTaxable)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.79 0.13 185)" }}
                >
                  {formatINR(totalCGST)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.79 0.13 185)" }}
                >
                  {formatINR(totalSGST)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.75 0.15 70)" }}
                >
                  {formatINR(totalIGST)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {formatINR(totalInvoiceValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "gstr3b" && (
        <div
          className="rounded-xl p-6"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.26 0.025 230)",
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ color: "oklch(0.93 0.015 230)" }}
          >
            GSTR-3B Summary
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "3.1 Outward taxable supplies",
                taxable: totalTaxable,
                igst: totalIGST,
                cgst: totalCGST,
                sgst: totalSGST,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-lg p-4"
                style={{ background: "oklch(0.22 0.025 230)" }}
              >
                <div
                  className="text-sm font-medium mb-3"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {row.label}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div style={{ color: "oklch(0.67 0.02 230)" }}>
                      Taxable Value
                    </div>
                    <div
                      className="font-bold"
                      style={{ color: "oklch(0.93 0.015 230)" }}
                    >
                      {formatINR(row.taxable)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "oklch(0.67 0.02 230)" }}>IGST</div>
                    <div
                      className="font-bold"
                      style={{ color: "oklch(0.75 0.15 70)" }}
                    >
                      {formatINR(row.igst)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "oklch(0.67 0.02 230)" }}>CGST</div>
                    <div
                      className="font-bold"
                      style={{ color: "oklch(0.79 0.13 185)" }}
                    >
                      {formatINR(row.cgst)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "oklch(0.67 0.02 230)" }}>
                      SGST/UTGST
                    </div>
                    <div
                      className="font-bold"
                      style={{ color: "oklch(0.79 0.13 185)" }}
                    >
                      {formatINR(row.sgst)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div
              className="rounded-lg p-4"
              style={{ background: "oklch(0.22 0.025 230)" }}
            >
              <div
                className="text-sm font-medium mb-2"
                style={{ color: "oklch(0.93 0.015 230)" }}
              >
                Total Tax Liability
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(0.73 0.15 160)" }}
              >
                {formatINR(totalTax)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
