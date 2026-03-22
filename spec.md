# BillSmart Pro

## Current State
Backend (Motoko) is fully built with persistent cloud storage. All frontend pages still use sampleData.ts and login is a fake toggle with no real Internet Identity auth.

## Requested Changes (Diff)

### Add
- Real Internet Identity login using useInternetIdentity hook
- Each page fetches/mutates via useActor + react-query
- Toast notifications for CRUD, loading skeletons, empty states
- CSV import in Inventory

### Modify
- App.tsx: Real II login, spinner on init
- Dashboard.tsx: getDashboardStats()
- Inventory.tsx: getAllProducts/createProduct/updateProduct/deleteProduct
- Sales.tsx: full CRUD, auto invoice INV-YYYYMMDD-NNN, tax toggle, CGST/SGST vs IGST
- Purchase.tsx: getAllPurchaseBills/createPurchaseBill/deletePurchaseBill + vendor/product lookup
- Expenses.tsx: getAllExpenses/createExpense/deleteExpense
- VendorPayments.tsx: getAllVendorPayments/createVendorPayment/deleteVendorPayment
- GSTReports.tsx: date range via getSalesForGSTR1/getPurchaseSummary
- AIEngine.tsx: compute 13 AI tools from real invoice/product/purchase data
- Sidebar.tsx: logout wired to useInternetIdentity.clear()

### Remove
- All sampleData.ts imports
- Fake isLoggedIn state

## Implementation Plan
1. Rewrite App.tsx with real Internet Identity
2. Rewrite each page with useActor + useQuery/useMutation
3. Amounts in paise (store *100n, display /100)
4. IDs via crypto.randomUUID()
5. Times as BigInt(Date.now()) * 1_000_000n
