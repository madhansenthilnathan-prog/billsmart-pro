# BillSmart Pro - Cloud Retail Billing Software (India)

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add

**Core Billing Modules**
- Sales: Create GST invoices (CGST/SGST/IGST), printable + PDF export, customer management
- Purchase: Purchase orders and entries with supplier details
- Expenses: Record and categorize business expenses
- Vendor Payments: Track outstanding and paid amounts to vendors
- GST Reports: GSTR-1 and GSTR-3B style summaries with tax breakdowns

**Inventory Management**
- Product catalog: Add/edit/delete products with name, HSN code, price, MRP, stock qty, category, GST rate
- CSV import/export for products
- Real-time stock deduction on sales, stock addition on purchases
- Low stock alerts

**User Access & Auth**
- Role-based: Owner (full access), Cashier (billing/sales only), Accountant (reports, expenses)
- Cloud login via Internet Identity

**AI Inventory Intelligence Engine** (computed from billing history)
1. Inventory DNA Sequencer - product performance profiles (velocity, margin, turnover)
2. Capital Lock Analyzer - money tied up in unsold/slow stock
3. Silent Killer Detector - items that appear healthy but drain cash quietly
4. Phantom Predictor - demand forecasting based on sales trends
5. Goal-Based Planner - revenue target tracker with gap analysis
6. Smart Bundle Generator - suggests product combos that sell well together
7. Auto Substitution AI - recommends alternatives for out-of-stock items
8. Inventory Decision Memory - logs past restock/discount decisions and outcomes
9. Inventory Aging Brain - flags stock by age brackets (30/60/90+ days)
10. AI Business Mentor - personalized advice cards from billing history patterns
11. Business Stress Detector - cash flow and overstock risk indicators
12. Explainable Profit AI - margin breakdown per product/category
13. Micro-Mistake Detector - catches small recurring errors (wrong pricing, missed GST, etc.)

**Dashboard**
- Summary cards: today's sales, total revenue, pending payments, low stock count
- Revenue chart, top products, recent transactions

### Modify
N/A (new project)

### Remove
N/A

## Implementation Plan

1. Backend (Motoko):
   - Entities: Product, Customer, Vendor, SalesInvoice, SalesItem, PurchaseOrder, PurchaseItem, Expense, VendorPayment, DecisionLog
   - CRUD for all entities
   - Stock management: auto-deduct on sale, auto-add on purchase
   - GST computation helpers
   - AI engine functions: compute analytics from stored transactions (DNA, capital lock, aging, etc.)
   - Role management via authorization component

2. Frontend:
   - Sidebar navigation with all modules
   - Dashboard with KPI cards and charts
   - Sales module: new invoice form, invoice list, print/PDF view
   - Purchase module: PO form and list
   - Expenses module: form and list
   - Vendor Payments module
   - Inventory module: product grid, CSV import/export
   - GST Reports page
   - AI Intelligence Engine dashboard with 13 tool panels
   - Settings: business profile, tax config
