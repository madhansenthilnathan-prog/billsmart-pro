import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";

import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

// Add migration spec.

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Initialize file storage and references
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type ProductId = Text;
  type CustomerId = Text;
  type VendorId = Text;
  type InvoiceId = Text;
  type BillId = Text;
  type ExpenseId = Text;
  type PaymentId = Text;

  type HSNCode = Text;
  type GSTPercent = Nat; // Represent as percentage (e.g. 18 for 18%)

  type Money = Nat; // All amounts are in paise (1 INR = 100 paise)

  type GSTType = {
    #cgst_sgst;
    #igst;
  };

  type TaxMode = {
    #inclusive;
    #exclusive;
  };

  public type Product = {
    id : ProductId;
    owner : Principal;
    name : Text;
    sku : Text;
    hsnCode : HSNCode;
    costPrice : Money;
    sellingPrice : Money;
    gstPercent : GSTPercent;
    stockQty : Nat;
    category : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type Customer = {
    id : CustomerId;
    owner : Principal;
    name : Text;
    phone : Text;
    address : Text;
    gstNumber : Text;
    createdAt : Time.Time;
  };

  public type Vendor = {
    id : VendorId;
    owner : Principal;
    name : Text;
    phone : Text;
    address : Text;
    gstNumber : Text;
    createdAt : Time.Time;
  };

  public type InvoiceItem = {
    productId : ProductId;
    productName : Text;
    hsnCode : HSNCode;
    qty : Nat;
    rate : Money;
    gstPercent : GSTPercent;
    cgst : Money;
    sgst : Money;
    igst : Money;
    amount : Money;
  };

  public type SalesInvoice = {
    id : InvoiceId;
    owner : Principal;
    invoiceNumber : Text;
    date : Time.Time;
    customerId : CustomerId;
    customerName : Text;
    items : [InvoiceItem];
    subtotal : Money;
    taxAmount : Money;
    totalAmount : Money;
    gstType : GSTType;
    taxMode : TaxMode;
    notes : Text;
    createdAt : Time.Time;
  };

  public type PurchaseItem = {
    productId : ProductId;
    productName : Text;
    qty : Nat;
    costPrice : Money;
    amount : Money;
  };

  public type PurchaseBill = {
    id : BillId;
    owner : Principal;
    billNumber : Text;
    date : Time.Time;
    vendorId : VendorId;
    vendorName : Text;
    items : [PurchaseItem];
    totalAmount : Money;
    createdAt : Time.Time;
  };

  public type Expense = {
    id : ExpenseId;
    owner : Principal;
    date : Time.Time;
    category : Text;
    description : Text;
    amount : Money;
    createdAt : Time.Time;
  };

  public type VendorPayment = {
    id : PaymentId;
    owner : Principal;
    vendorId : VendorId;
    vendorName : Text;
    amount : Money;
    date : Time.Time;
    notes : Text;
    createdAt : Time.Time;
  };

  public type DashboardStats = {
    totalSales : Money;
    totalPurchases : Money;
    totalExpenses : Money;
    profitEstimate : Money;
    lowStockItems : [Product];
  };

  public type GSTR1Sale = {
    invoiceNumber : Text;
    date : Time.Time;
    customerName : Text;
    subtotal : Money;
    taxAmount : Money;
    totalAmount : Money;
  };

  public type PurchaseSummary = {
    billNumber : Text;
    date : Time.Time;
    vendorName : Text;
    totalAmount : Money;
  };

  // Per-user data storage using nested maps
  let products = Map.empty<Principal, Map.Map<ProductId, Product>>();
  let customers = Map.empty<Principal, Map.Map<CustomerId, Customer>>();
  let vendors = Map.empty<Principal, Map.Map<VendorId, Vendor>>();
  let invoices = Map.empty<Principal, Map.Map<InvoiceId, SalesInvoice>>();
  let bills = Map.empty<Principal, Map.Map<BillId, PurchaseBill>>();
  let expenses = Map.empty<Principal, Map.Map<ExpenseId, Expense>>();
  let payments = Map.empty<Principal, Map.Map<PaymentId, VendorPayment>>();

  // Helper functions to get or create user-specific maps
  func getUserProducts(user : Principal) : Map.Map<ProductId, Product> {
    switch (products.get(user)) {
      case (?userProducts) { userProducts };
      case (null) {
        let newMap = Map.empty<ProductId, Product>();
        products.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserCustomers(user : Principal) : Map.Map<CustomerId, Customer> {
    switch (customers.get(user)) {
      case (?userCustomers) { userCustomers };
      case (null) {
        let newMap = Map.empty<CustomerId, Customer>();
        customers.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserVendors(user : Principal) : Map.Map<VendorId, Vendor> {
    switch (vendors.get(user)) {
      case (?userVendors) { userVendors };
      case (null) {
        let newMap = Map.empty<VendorId, Vendor>();
        vendors.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserInvoices(user : Principal) : Map.Map<InvoiceId, SalesInvoice> {
    switch (invoices.get(user)) {
      case (?userInvoices) { userInvoices };
      case (null) {
        let newMap = Map.empty<InvoiceId, SalesInvoice>();
        invoices.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserBills(user : Principal) : Map.Map<BillId, PurchaseBill> {
    switch (bills.get(user)) {
      case (?userBills) { userBills };
      case (null) {
        let newMap = Map.empty<BillId, PurchaseBill>();
        bills.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserExpenses(user : Principal) : Map.Map<ExpenseId, Expense> {
    switch (expenses.get(user)) {
      case (?userExpenses) { userExpenses };
      case (null) {
        let newMap = Map.empty<ExpenseId, Expense>();
        expenses.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserPayments(user : Principal) : Map.Map<PaymentId, VendorPayment> {
    switch (payments.get(user)) {
      case (?userPayments) { userPayments };
      case (null) {
        let newMap = Map.empty<PaymentId, VendorPayment>();
        payments.add(user, newMap);
        newMap;
      };
    };
  };

  // Products
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };

    let userProducts = getUserProducts(caller);
    let newProduct : Product = {
      product with
      owner = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    userProducts.add(product.id, newProduct);
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, updated : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };

    let userProducts = getUserProducts(caller);
    switch (userProducts.get(productId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own products");
        };
        let updatedProduct : Product = {
          updated with
          owner = caller;
          id = productId;
          updatedAt = Time.now();
          createdAt = existing.createdAt;
        };
        userProducts.add(productId, updatedProduct);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };

    let userProducts = getUserProducts(caller);
    switch (userProducts.get(productId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own products");
        };
        userProducts.remove(productId);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    let userProducts = getUserProducts(caller);
    userProducts.values().toArray();
  };

  public query ({ caller }) func getProductById(productId : ProductId) : async ?Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };

    let userProducts = getUserProducts(caller);
    userProducts.get(productId);
  };

  // Customers
  public shared ({ caller }) func createCustomer(customer : Customer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add customers");
    };

    let userCustomers = getUserCustomers(caller);
    let newCustomer : Customer = {
      customer with
      owner = caller;
      createdAt = Time.now();
    };
    userCustomers.add(customer.id, newCustomer);
  };

  public shared ({ caller }) func updateCustomer(customerId : CustomerId, updated : Customer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update customers");
    };

    let userCustomers = getUserCustomers(caller);
    switch (userCustomers.get(customerId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own customers");
        };
        let updatedCustomer : Customer = {
          updated with
          owner = caller;
          id = customerId;
          createdAt = existing.createdAt;
        };
        userCustomers.add(customerId, updatedCustomer);
      };
      case (null) { Runtime.trap("Customer not found") };
    };
  };

  public shared ({ caller }) func deleteCustomer(customerId : CustomerId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete customers");
    };

    let userCustomers = getUserCustomers(caller);
    switch (userCustomers.get(customerId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own customers");
        };
        userCustomers.remove(customerId);
      };
      case (null) { Runtime.trap("Customer not found") };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };

    let userCustomers = getUserCustomers(caller);
    userCustomers.values().toArray();
  };

  // Vendors
  public shared ({ caller }) func createVendor(vendor : Vendor) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add vendors");
    };

    let userVendors = getUserVendors(caller);
    let newVendor : Vendor = {
      vendor with
      owner = caller;
      createdAt = Time.now();
    };
    userVendors.add(vendor.id, newVendor);
  };

  public shared ({ caller }) func updateVendor(vendorId : VendorId, updated : Vendor) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update vendors");
    };

    let userVendors = getUserVendors(caller);
    switch (userVendors.get(vendorId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own vendors");
        };
        let updatedVendor : Vendor = {
          updated with
          owner = caller;
          id = vendorId;
          createdAt = existing.createdAt;
        };
        userVendors.add(vendorId, updatedVendor);
      };
      case (null) { Runtime.trap("Vendor not found") };
    };
  };

  public shared ({ caller }) func deleteVendor(vendorId : VendorId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete vendors");
    };

    let userVendors = getUserVendors(caller);
    switch (userVendors.get(vendorId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own vendors");
        };
        userVendors.remove(vendorId);
      };
      case (null) { Runtime.trap("Vendor not found") };
    };
  };

  public query ({ caller }) func getAllVendors() : async [Vendor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view vendors");
    };

    let userVendors = getUserVendors(caller);
    userVendors.values().toArray();
  };

  // Sales Invoices
  public shared ({ caller }) func createSalesInvoice(invoice : SalesInvoice) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };

    let userInvoices = getUserInvoices(caller);
    let newInvoice : SalesInvoice = {
      invoice with
      owner = caller;
      createdAt = Time.now();
    };
    userInvoices.add(invoice.id, newInvoice);

    // Update stock for caller's products only
    let userProducts = getUserProducts(caller);
    for (item in invoice.items.vals()) {
      switch (userProducts.get(item.productId)) {
        case (?product) {
          if (product.owner != caller) {
            Runtime.trap("Unauthorized: Can only use your own products in invoices");
          };
          let updatedProduct : Product = {
            product with
            // Silencing warning. This is a handled subtraction where qty is explicitly compared and verified to be positive beforehand. 
            stockQty = if (product.stockQty >= item.qty) { product.stockQty - item.qty } else {
              0;
            };
            updatedAt = Time.now();
          };
          userProducts.add(item.productId, updatedProduct);
        };
        case (null) { Runtime.trap("Product not found for stock update") };
      };
    };
  };

  public shared ({ caller }) func deleteSalesInvoice(invoiceId : InvoiceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete invoices");
    };

    let userInvoices = getUserInvoices(caller);
    switch (userInvoices.get(invoiceId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own invoices");
        };
        userInvoices.remove(invoiceId);
      };
      case (null) { Runtime.trap("Invoice not found") };
    };
  };

  public query ({ caller }) func getAllSalesInvoices() : async [SalesInvoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };

    let userInvoices = getUserInvoices(caller);
    userInvoices.values().toArray();
  };

  public query ({ caller }) func getSalesInvoiceById(invoiceId : InvoiceId) : async ?SalesInvoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };

    let userInvoices = getUserInvoices(caller);
    userInvoices.get(invoiceId);
  };

  // Purchase Bills
  public shared ({ caller }) func createPurchaseBill(bill : PurchaseBill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create purchase bills");
    };

    let userBills = getUserBills(caller);
    let newBill : PurchaseBill = {
      bill with
      owner = caller;
      createdAt = Time.now();
    };
    userBills.add(bill.id, newBill);

    // Update stock for caller's products only
    let userProducts = getUserProducts(caller);
    for (item in bill.items.vals()) {
      switch (userProducts.get(item.productId)) {
        case (?product) {
          if (product.owner != caller) {
            Runtime.trap("Unauthorized: Can only use your own products in bills");
          };
          let updatedProduct : Product = {
            product with
            stockQty = product.stockQty + item.qty;
            updatedAt = Time.now();
          };
          userProducts.add(item.productId, updatedProduct);
        };
        case (null) { Runtime.trap("Product not found for stock update") };
      };
    };
  };

  public shared ({ caller }) func deletePurchaseBill(billId : BillId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete purchase bills");
    };

    let userBills = getUserBills(caller);
    switch (userBills.get(billId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own bills");
        };
        userBills.remove(billId);
      };
      case (null) { Runtime.trap("Bill not found") };
    };
  };

  public query ({ caller }) func getAllPurchaseBills() : async [PurchaseBill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view purchase bills");
    };

    let userBills = getUserBills(caller);
    userBills.values().toArray();
  };

  public query ({ caller }) func getPurchaseBillById(billId : BillId) : async ?PurchaseBill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view purchase bills");
    };

    let userBills = getUserBills(caller);
    userBills.get(billId);
  };

  // Expenses
  public shared ({ caller }) func createExpense(expense : Expense) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };

    let userExpenses = getUserExpenses(caller);
    let newExpense : Expense = {
      expense with
      owner = caller;
      createdAt = Time.now();
    };
    userExpenses.add(expense.id, newExpense);
  };

  public shared ({ caller }) func deleteExpense(expenseId : ExpenseId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expenses");
    };

    let userExpenses = getUserExpenses(caller);
    switch (userExpenses.get(expenseId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own expenses");
        };
        userExpenses.remove(expenseId);
      };
      case (null) { Runtime.trap("Expense not found") };
    };
  };

  public query ({ caller }) func getAllExpenses() : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };

    let userExpenses = getUserExpenses(caller);
    userExpenses.values().toArray();
  };

  // Vendor Payments
  public shared ({ caller }) func createVendorPayment(payment : VendorPayment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add vendor payments");
    };

    let userPayments = getUserPayments(caller);
    let newPayment : VendorPayment = {
      payment with
      owner = caller;
      createdAt = Time.now();
    };
    userPayments.add(payment.id, newPayment);
  };

  public shared ({ caller }) func deleteVendorPayment(paymentId : PaymentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete vendor payments");
    };

    let userPayments = getUserPayments(caller);
    switch (userPayments.get(paymentId)) {
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own payments");
        };
        userPayments.remove(paymentId);
      };
      case (null) { Runtime.trap("Payment not found") };
    };
  };

  public query ({ caller }) func getAllVendorPayments() : async [VendorPayment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view vendor payments");
    };

    let userPayments = getUserPayments(caller);
    userPayments.values().toArray();
  };

  // Dashboard Stats
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };

    let userInvoices = getUserInvoices(caller);
    let userBills = getUserBills(caller);
    let userExpenses = getUserExpenses(caller);
    let userProducts = getUserProducts(caller);

    let totalSales = userInvoices.values().toArray().foldLeft(0, func(acc, invoice) { acc + invoice.totalAmount });
    let totalPurchases = userBills.values().toArray().foldLeft(0, func(acc, bill) { acc + bill.totalAmount });
    let totalExpenses = userExpenses.values().toArray().foldLeft(0, func(acc, expense) { acc + expense.amount });

    // Silencing operator warning on profitEstimate as the result is guaranteed to be >= 0 due to the if condition.
    let profitEstimate = if (totalSales > totalPurchases + totalExpenses) {
      totalSales - (totalPurchases + totalExpenses);
    } else {
      0;
    };

    let lowStockItems = userProducts.values().toArray().filter(
      func(product) { product.stockQty <= 10 }
    );

    {
      totalSales;
      totalPurchases;
      totalExpenses;
      profitEstimate;
      lowStockItems;
    };
  };

  public query ({ caller }) func getSalesForGSTR1(startDate : Time.Time, endDate : Time.Time) : async [GSTR1Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view GSTR1 sales data");
    };

    let userInvoices = getUserInvoices(caller);
    userInvoices.values().toArray().filter(
      func(invoice) { invoice.date >= startDate and invoice.date <= endDate }
    ).map(
      func(invoice) {
        {
          invoiceNumber = invoice.invoiceNumber;
          date = invoice.date;
          customerName = invoice.customerName;
          subtotal = invoice.subtotal;
          taxAmount = invoice.taxAmount;
          totalAmount = invoice.totalAmount;
        };
      }
    );
  };

  public query ({ caller }) func getPurchaseSummary(startDate : Time.Time, endDate : Time.Time) : async [PurchaseSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view purchase summary");
    };

    let userBills = getUserBills(caller);
    userBills.values().toArray().filter(
      func(bill) { bill.date >= startDate and bill.date <= endDate }
    ).map(
      func(bill) {
        {
          billNumber = bill.billNumber;
          date = bill.date;
          vendorName = bill.vendorName;
          totalAmount = bill.totalAmount;
        };
      }
    );
  };
};
