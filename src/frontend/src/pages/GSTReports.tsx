import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const toRupees = (p: bigint) => (Number(p) / 100).toFixed(2);
const formatDate = (ns: bigint) =>
  new Date(Number(ns / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const firstOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

export default function GSTReports() {
  const { actor } = useActor();
  const [tab, setTab] = useState<"gstr1" | "gstr3b">("gstr1");
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());

  const startNs = BigInt(new Date(startDate).getTime()) * 1_000_000n;
  const endNs = BigInt(new Date(`${endDate}T23:59:59`).getTime()) * 1_000_000n;

  const { data: gstr1 = [], isLoading: loadingGstr1 } = useQuery({
    queryKey: ["gstr1", startDate, endDate],
    queryFn: () => actor!.getSalesForGSTR1(startNs, endNs),
    enabled: !!actor,
  });

  const { data: purchaseSummary = [], isLoading: loadingPurchase } = useQuery({
    queryKey: ["purchaseSummary", startDate, endDate],
    queryFn: () => actor!.getPurchaseSummary(startNs, endNs),
    enabled: !!actor,
  });

  const totalSales = gstr1.reduce((s, r) => s + Number(r.totalAmount), 0) / 100;
  const totalTax = gstr1.reduce((s, r) => s + Number(r.taxAmount), 0) / 100;
  const totalPurchase =
    purchaseSummary.reduce((s, r) => s + Number(r.totalAmount), 0) / 100;

  const inputStyle = {
    background: "oklch(0.15 0.02 230)",
    border: "1px solid oklch(0.26 0.025 230)",
    color: "oklch(0.93 0.015 230)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: "oklch(0.93 0.015 230)" }}
      >
        GST Reports
      </h1>
      <p className="text-sm mb-5" style={{ color: "oklch(0.67 0.02 230)" }}>
        GSTR-1 and GSTR-3B summary
      </p>

      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "oklch(0.67 0.02 230)" }}>
            From
          </span>
          <input
            type="date"
            style={inputStyle}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "oklch(0.67 0.02 230)" }}>
            To
          </span>
          <input
            type="date"
            style={inputStyle}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(["gstr1", "gstr3b"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background:
                tab === t ? "oklch(0.79 0.13 185)" : "oklch(0.24 0.025 230)",
              color:
                tab === t ? "oklch(0.13 0.02 230)" : "oklch(0.87 0.015 230)",
            }}
          >
            {t === "gstr1" ? "GSTR-1 (Sales)" : "GSTR-3B (Summary)"}
          </button>
        ))}
      </div>

      {tab === "gstr1" ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "Total Sales", value: `₹${totalSales.toFixed(2)}` },
              {
                label: "Total Tax Collected",
                value: `₹${totalTax.toFixed(2)}`,
              },
              { label: "Invoices", value: gstr1.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{
                  background: "oklch(0.19 0.025 230)",
                  border: "1px solid oklch(0.24 0.025 230)",
                }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {label}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          {loadingGstr1 ? (
            <div
              className="h-32 rounded-xl animate-pulse"
              style={{ background: "oklch(0.19 0.025 230)" }}
            />
          ) : gstr1.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                background: "oklch(0.19 0.025 230)",
                border: "1px solid oklch(0.24 0.025 230)",
              }}
            >
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                No sales in this period.
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
                      "Invoice No",
                      "Customer",
                      "Date",
                      "Taxable",
                      "Tax",
                      "Total",
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
                  {gstr1.map((r) => (
                    <tr
                      key={r.invoiceNumber}
                      style={{
                        background:
                          gstr1.indexOf(r) % 2 === 0
                            ? "oklch(0.19 0.025 230)"
                            : "oklch(0.17 0.02 230)",
                        borderTop: "1px solid oklch(0.22 0.025 230)",
                      }}
                    >
                      <td
                        className="px-4 py-3 font-mono text-xs"
                        style={{ color: "oklch(0.79 0.13 185)" }}
                      >
                        {r.invoiceNumber}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.87 0.015 230)" }}
                      >
                        {r.customerName}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.67 0.02 230)" }}
                      >
                        {formatDate(r.date)}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.87 0.015 230)" }}
                      >
                        ₹{toRupees(r.subtotal)}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.87 0.015 230)" }}
                      >
                        ₹{toRupees(r.taxAmount)}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "oklch(0.73 0.15 160)" }}
                      >
                        ₹{toRupees(r.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              {
                label: "Total Purchases (ITC)",
                value: `₹${totalPurchase.toFixed(2)}`,
              },
              { label: "Bills", value: purchaseSummary.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{
                  background: "oklch(0.19 0.025 230)",
                  border: "1px solid oklch(0.24 0.025 230)",
                }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "oklch(0.67 0.02 230)" }}
                >
                  {label}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: "oklch(0.93 0.015 230)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          {loadingPurchase ? (
            <div
              className="h-32 rounded-xl animate-pulse"
              style={{ background: "oklch(0.19 0.025 230)" }}
            />
          ) : purchaseSummary.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                background: "oklch(0.19 0.025 230)",
                border: "1px solid oklch(0.24 0.025 230)",
              }}
            >
              <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
                No purchases in this period.
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
                    {["Bill No", "Vendor", "Date", "Amount"].map((h) => (
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
                  {purchaseSummary.map((r) => (
                    <tr
                      key={r.billNumber}
                      style={{
                        background:
                          purchaseSummary.indexOf(r) % 2 === 0
                            ? "oklch(0.19 0.025 230)"
                            : "oklch(0.17 0.02 230)",
                        borderTop: "1px solid oklch(0.22 0.025 230)",
                      }}
                    >
                      <td
                        className="px-4 py-3 font-mono text-xs"
                        style={{ color: "oklch(0.79 0.13 185)" }}
                      >
                        {r.billNumber}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.87 0.015 230)" }}
                      >
                        {r.vendorName}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.67 0.02 230)" }}
                      >
                        {formatDate(r.date)}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "oklch(0.87 0.015 230)" }}
                      >
                        ₹{toRupees(r.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
