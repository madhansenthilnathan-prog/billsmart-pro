import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type VendorId = string;
export type Time = bigint;
export type BillId = string;
export interface SalesInvoice {
    id: InvoiceId;
    customerName: string;
    owner: Principal;
    date: Time;
    createdAt: Time;
    invoiceNumber: string;
    totalAmount: Money;
    notes: string;
    customerId: CustomerId;
    gstType: GSTType;
    items: Array<InvoiceItem>;
    taxAmount: Money;
    taxMode: TaxMode;
    subtotal: Money;
}
export type HSNCode = string;
export interface PurchaseBill {
    id: BillId;
    owner: Principal;
    date: Time;
    createdAt: Time;
    totalAmount: Money;
    vendorId: VendorId;
    billNumber: string;
    items: Array<PurchaseItem>;
    vendorName: string;
}
export interface Vendor {
    id: VendorId;
    owner: Principal;
    gstNumber: string;
    name: string;
    createdAt: Time;
    address: string;
    phone: string;
}
export type GSTPercent = bigint;
export interface PurchaseItem {
    qty: bigint;
    productId: ProductId;
    productName: string;
    costPrice: Money;
    amount: Money;
}
export type Money = bigint;
export interface InvoiceItem {
    qty: bigint;
    cgst: Money;
    igst: Money;
    rate: Money;
    sgst: Money;
    gstPercent: GSTPercent;
    hsnCode: HSNCode;
    productId: ProductId;
    productName: string;
    amount: Money;
}
export interface Expense {
    id: ExpenseId;
    owner: Principal;
    date: Time;
    createdAt: Time;
    description: string;
    category: string;
    amount: Money;
}
export interface DashboardStats {
    totalExpenses: Money;
    totalSales: Money;
    totalPurchases: Money;
    profitEstimate: Money;
    lowStockItems: Array<Product>;
}
export interface Customer {
    id: CustomerId;
    owner: Principal;
    gstNumber: string;
    name: string;
    createdAt: Time;
    address: string;
    phone: string;
}
export interface GSTR1Sale {
    customerName: string;
    date: Time;
    invoiceNumber: string;
    totalAmount: Money;
    taxAmount: Money;
    subtotal: Money;
}
export type CustomerId = string;
export type PaymentId = string;
export type ExpenseId = string;
export type InvoiceId = string;
export interface VendorPayment {
    id: PaymentId;
    owner: Principal;
    date: Time;
    createdAt: Time;
    vendorId: VendorId;
    notes: string;
    amount: Money;
    vendorName: string;
}
export type ProductId = string;
export interface PurchaseSummary {
    date: Time;
    totalAmount: Money;
    billNumber: string;
    vendorName: string;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: ProductId;
    sku: string;
    stockQty: bigint;
    owner: Principal;
    name: string;
    createdAt: Time;
    gstPercent: GSTPercent;
    sellingPrice: Money;
    hsnCode: HSNCode;
    updatedAt: Time;
    category: string;
    costPrice: Money;
}
export enum GSTType {
    igst = "igst",
    cgst_sgst = "cgst_sgst"
}
export enum TaxMode {
    inclusive = "inclusive",
    exclusive = "exclusive"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomer(customer: Customer): Promise<void>;
    createExpense(expense: Expense): Promise<void>;
    createProduct(product: Product): Promise<void>;
    createPurchaseBill(bill: PurchaseBill): Promise<void>;
    createSalesInvoice(invoice: SalesInvoice): Promise<void>;
    createVendor(vendor: Vendor): Promise<void>;
    createVendorPayment(payment: VendorPayment): Promise<void>;
    deleteCustomer(customerId: CustomerId): Promise<void>;
    deleteExpense(expenseId: ExpenseId): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    deletePurchaseBill(billId: BillId): Promise<void>;
    deleteSalesInvoice(invoiceId: InvoiceId): Promise<void>;
    deleteVendor(vendorId: VendorId): Promise<void>;
    deleteVendorPayment(paymentId: PaymentId): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllExpenses(): Promise<Array<Expense>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllPurchaseBills(): Promise<Array<PurchaseBill>>;
    getAllSalesInvoices(): Promise<Array<SalesInvoice>>;
    getAllVendorPayments(): Promise<Array<VendorPayment>>;
    getAllVendors(): Promise<Array<Vendor>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getProductById(productId: ProductId): Promise<Product | null>;
    getPurchaseBillById(billId: BillId): Promise<PurchaseBill | null>;
    getPurchaseSummary(startDate: Time, endDate: Time): Promise<Array<PurchaseSummary>>;
    getSalesForGSTR1(startDate: Time, endDate: Time): Promise<Array<GSTR1Sale>>;
    getSalesInvoiceById(invoiceId: InvoiceId): Promise<SalesInvoice | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomer(customerId: CustomerId, updated: Customer): Promise<void>;
    updateProduct(productId: ProductId, updated: Product): Promise<void>;
    updateVendor(vendorId: VendorId, updated: Vendor): Promise<void>;
}
