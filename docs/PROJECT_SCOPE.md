# WBA System Scope and Access Model

This document is the shared product and authorization reference for WBA. All future implementation work must align with this scope. Before adding a page, action, role permission, or workflow that conflicts with it, stop and ask the project owner for direction.

## Product Pages

### Core System & Access

1. **Login / Authentication** — Sign-in with role-based access for Admin, Warehouse Staff, Purchasing Manager, and Sales Staff.
2. **Main Dashboard** — Role-specific KPIs, low-stock alerts, pending purchase orders, and system summaries.
3. **User Management (Admin)** — Create and update users, manage role permissions, and view user activity logs.

### Inventory Module

1. **Item Catalog** — Master table of items, categories, inventory evaluation methods, and FIFO tracking; authorized users can add, edit, or delete items.
2. **Stock Quantity & Valuation** — Bulk quantity updates, pricing adjustments, and category-breakdown metrics.
3. **Category Management** — Create, modify, and organize item categories and tags.

### Warehouse Module

1. **Stock In / Stock Out (Movement)** — Receiving and shipping movements, including barcode or QR scanning in the workflow.
2. **Stock Count & Reconciliation** — Manual physical counts, discrepancy auditing, and reconciliation logs.

### Purchasing Module

1. **Supplier Directory** — Supplier profiles, contact details, and linked catalog lines.
2. **Purchase Orders & Forecasting** — Create and track POs, reorder-point alerts, and demand-forecast reports.

## Role Boundaries

| Role | Authorized scope |
| --- | --- |
| **Admin** | Full user-management control: create users, assign roles, configure access, and view global dashboards/logs. Full inventory CRUD, category management, and oversight of stock counts/reconciliation. Executive purchasing access: view budgets, approve high-value POs, and view demand forecasts. |
| **Warehouse Staff** | Warehouse operations: receive and ship stock, process stock movements, perform physical counts, and reconcile discrepancies. Read inventory categories and stock quantities; may update quantities only through approved physical-count or stock-movement workflows. No catalog, pricing, category, user, supplier, or purchasing-management access. |
| **Purchasing Manager** | Supplier and purchasing workflow ownership: manage suppliers, create and manage purchase orders, configure/view reorder points, and view forecasts. No direct inventory quantity adjustments or user-management access. |
| **Sales Staff** | Read-only access to pricing, stock availability, and item categories for product/service operations. No stock adjustments, catalog edits, purchasing, warehouse, or user-management access. |

## Implementation Rules

- QR/barcode scanning belongs to the **Warehouse Stock In / Stock Out** workflow and must be restricted to Warehouse Staff.
- Inventory quantity updates must have a traceable movement, physical-count, or reconciliation record; do not expose unrestricted direct edits to Warehouse Staff.
- Catalog, category, and pricing changes are Admin-only unless this document is explicitly revised.
- New navigation, dashboards, and actions must be filtered by role on both the visible UI and the action handler.
- This is the roadmap and source of truth; the current UI may not yet implement every listed page.
