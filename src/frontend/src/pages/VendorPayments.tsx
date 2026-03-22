import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Vendor, VendorPayment } from "../backend";
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

export default function VendorPayments() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"payments" | "vendors">("payments");

  // Payment form
  const [showPayForm, setShowPayForm] = useState(false);
  const [payVendorId, setPayVendorId] = useState("");
  const [payVendorName, setPayVendorName] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState("");

  // Vendor form
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editVendorId, setEditVendorId] = useState<string | null>(null);
  const [vName, setVName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vAddress, setVAddress] = useState("");
  const [vGst, setVGst] = useState("");

  const { data: payments = [], isLoading: loadingPay } = useQuery({
    queryKey: ["vendorPayments"],
    queryFn: () => actor!.getAllVendorPayments(),
    enabled: !!actor,
  });
  const { data: vendors = [], isLoading: loadingVen } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => actor!.getAllVendors(),
    enabled: !!actor,
  });

  const addPayMutation = useMutation({
    mutationFn: (p: VendorPayment) => actor!.createVendorPayment(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendorPayments"] });
      toast.success("Payment recorded");
      setShowPayForm(false);
      setPayAmount("");
      setPayNotes("");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delPayMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteVendorPayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendorPayments"] });
      toast.success("Payment deleted");
    },
  });
  const addVendorMutation = useMutation({
    mutationFn: (v: Vendor) => actor!.createVendor(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor added");
      resetVendorForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateVendorMutation = useMutation({
    mutationFn: ({ id, v }: { id: string; v: Vendor }) =>
      actor!.updateVendor(id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor updated");
      resetVendorForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delVendorMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteVendor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted");
    },
  });

  const resetVendorForm = () => {
    setShowVendorForm(false);
    setEditVendorId(null);
    setVName("");
    setVPhone("");
    setVAddress("");
    setVGst("");
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payVendorName || !payAmount) {
      toast.error("Vendor and amount required");
      return;
    }
    const dateNs = BigInt(new Date(payDate).getTime()) * 1_000_000n;
    addPayMutation.mutate({
      id: crypto.randomUUID(),
      owner: PLACEHOLDER,
      vendorId: payVendorId || crypto.randomUUID(),
      vendorName: payVendorName,
      amount: toPaise(Number.parseFloat(payAmount)),
      date: dateNs,
      notes: payNotes,
      createdAt: nowNs(),
    });
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName) {
      toast.error("Vendor name required");
      return;
    }
    const vendor: Vendor = {
      id: editVendorId ?? crypto.randomUUID(),
      owner: PLACEHOLDER,
      name: vName,
      phone: vPhone,
      address: vAddress,
      gstNumber: vGst,
      createdAt: nowNs(),
    };
    if (editVendorId)
      updateVendorMutation.mutate({ id: editVendorId, v: vendor });
    else addVendorMutation.mutate(vendor);
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
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(0.93 0.015 230)" }}
        >
          Vendors & Payments
        </h1>
        <button
          type="button"
          onClick={() =>
            tab === "payments" ? setShowPayForm(true) : setShowVendorForm(true)
          }
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "oklch(0.79 0.13 185)",
            color: "oklch(0.13 0.02 230)",
          }}
        >
          <Plus size={14} />{" "}
          {tab === "payments" ? "Record Payment" : "Add Vendor"}
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {(["payments", "vendors"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize"
            style={{
              background:
                tab === t ? "oklch(0.79 0.13 185)" : "oklch(0.24 0.025 230)",
              color:
                tab === t ? "oklch(0.13 0.02 230)" : "oklch(0.87 0.015 230)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Payment Form Modal */}
      {showPayForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
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
                Record Payment
              </h2>
              <button type="button" onClick={() => setShowPayForm(false)}>
                <X size={16} style={{ color: "oklch(0.67 0.02 230)" }} />
              </button>
            </div>
            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div>
                <div style={labelStyle}>Vendor</div>
                <select
                  style={inputStyle}
                  value={payVendorId}
                  onChange={(e) => {
                    const v = vendors.find((v) => v.id === e.target.value);
                    if (v) {
                      setPayVendorId(v.id);
                      setPayVendorName(v.name);
                    } else {
                      setPayVendorId("");
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
                {!payVendorId && (
                  <input
                    style={{ ...inputStyle, marginTop: 4 }}
                    placeholder="Or type vendor name"
                    value={payVendorName}
                    onChange={(e) => setPayVendorName(e.target.value)}
                  />
                )}
              </div>
              <div>
                <div style={labelStyle}>Amount (₹) *</div>
                <input
                  type="number"
                  step="0.01"
                  required
                  style={inputStyle}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>Date</div>
                <input
                  type="date"
                  style={inputStyle}
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>Notes</div>
                <input
                  style={inputStyle}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayForm(false)}
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
                  disabled={addPayMutation.isPending}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: "oklch(0.79 0.13 185)",
                    color: "oklch(0.13 0.02 230)",
                  }}
                >
                  {addPayMutation.isPending ? "Saving..." : "Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
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
                {editVendorId ? "Edit Vendor" : "Add Vendor"}
              </h2>
              <button type="button" onClick={resetVendorForm}>
                <X size={16} style={{ color: "oklch(0.67 0.02 230)" }} />
              </button>
            </div>
            <form onSubmit={handleVendorSubmit} className="space-y-3">
              <div>
                <div style={labelStyle}>Name *</div>
                <input
                  required
                  style={inputStyle}
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>Phone</div>
                <input
                  style={inputStyle}
                  value={vPhone}
                  onChange={(e) => setVPhone(e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>Address</div>
                <input
                  style={inputStyle}
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                />
              </div>
              <div>
                <div style={labelStyle}>GST Number</div>
                <input
                  style={inputStyle}
                  value={vGst}
                  onChange={(e) => setVGst(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetVendorForm}
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
                  disabled={
                    addVendorMutation.isPending ||
                    updateVendorMutation.isPending
                  }
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: "oklch(0.79 0.13 185)",
                    color: "oklch(0.13 0.02 230)",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === "payments" ? (
        loadingPay ? (
          <div
            className="h-32 rounded-xl animate-pulse"
            style={{ background: "oklch(0.19 0.025 230)" }}
          />
        ) : payments.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{
              background: "oklch(0.19 0.025 230)",
              border: "1px solid oklch(0.24 0.025 230)",
            }}
          >
            <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
              No payments yet.
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
                  {["Date", "Vendor", "Amount", "Notes", ""].map((h) => (
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
                {payments
                  .sort((a, b) => Number(b.date - a.date))
                  .map((p, i) => (
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
                        className="px-4 py-3"
                        style={{ color: "oklch(0.67 0.02 230)" }}
                      >
                        {formatDate(p.date)}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.87 0.015 230)" }}
                      >
                        {p.vendorName}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "oklch(0.87 0.015 230)" }}
                      >
                        ₹{toRupees(p.amount)}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "oklch(0.67 0.02 230)" }}
                      >
                        {p.notes}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete?")) delPayMutation.mutate(p.id);
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
        )
      ) : loadingVen ? (
        <div
          className="h-32 rounded-xl animate-pulse"
          style={{ background: "oklch(0.19 0.025 230)" }}
        />
      ) : vendors.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "oklch(0.19 0.025 230)",
            border: "1px solid oklch(0.24 0.025 230)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.67 0.02 230)" }}>
            No vendors yet.
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
                {["Name", "Phone", "GST Number", "Address", ""].map((h) => (
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
              {vendors.map((v, i) => (
                <tr
                  key={v.id}
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
                    {v.name}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {v.phone}
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {v.gstNumber || "-"}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "oklch(0.67 0.02 230)" }}
                  >
                    {v.address}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditVendorId(v.id);
                          setVName(v.name);
                          setVPhone(v.phone);
                          setVAddress(v.address);
                          setVGst(v.gstNumber);
                          setShowVendorForm(true);
                        }}
                        style={{ color: "oklch(0.67 0.02 230)" }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete vendor?"))
                            delVendorMutation.mutate(v.id);
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
