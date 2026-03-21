export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export function calcGST(
  subtotal: number,
  gstRate: number,
  isInterState: boolean,
) {
  const totalGst = subtotal * (gstRate / 100);
  if (isInterState) return { cgst: 0, sgst: 0, igst: totalGst };
  return { cgst: totalGst / 2, sgst: totalGst / 2, igst: 0 };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 11);
}
