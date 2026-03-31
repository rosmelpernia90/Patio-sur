# Auditoría de Base de Datos - Proyecto Patio Sur

## ESTADO ACTUAL

### ✅ Tablas Existentes (7 modelos)

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE: Proyectos                      │
└─────────────────────────────────────────────────────────────────┘

1. users
   ├── id (UUID, PK)
   ├── email (unique)
   ├── hashed_password
   ├── full_name
   ├── role (gerente, controller, ingeniero, viewer)
   ├── is_active
   ├── created_at
   └── updated_at

2. projects
   ├── id (UUID, PK)
   ├── name
   ├── code (unique) → "OE 1035"
   ├── description
   ├── client_name → "Consorcio Express S.A.S."
   ├── start_date → 2025-06-20
   ├── estimated_end_date → 2026-09-16
   ├── actual_end_date
   ├── total_budget → 41,012,884,481 COP
   ├── currency → "COP"
   ├── status → "in_progress"
   ├── location
   ├── project_manager
   ├── created_at
   └── updated_at

   Relaciones: ←→ wbs_items, budget_items, transactions, invoices, cash_flow_entries

3. wbs_items (Work Breakdown Structure)
   ├── id (UUID, PK)
   ├── project_id (FK → projects)
   ├── parent_id (FK → wbs_items, nullable)
   ├── code → "1.0", "1.1", etc.
   ├── name → "Estudios y Disenos", "Redes MT", etc.
   ├── level → "chapter", "section", "task"
   ├── description
   ├── planned_start_date
   ├── planned_end_date
   ├── actual_start_date
   ├── actual_end_date
   ├── planned_progress
   ├── actual_progress
   ├── weight
   ├── status → "not_started", "in_progress", "completed"
   ├── sort_order
   ├── created_at
   └── updated_at

   Relaciones: ←→ budget_items, transactions, invoice_line_items

4. budget_items (Presupuesto por Capítulo)
   ├── id (UUID, PK)
   ├── project_id (FK → projects)
   ├── wbs_item_id (FK → wbs_items)
   ├── code → "12", "1.0.1", etc.
   ├── description → "Comp. Reactiva", "Redes MT (Celdas)", etc.
   ├── category → "electrical", "civil", "services"
   ├── cost_type → "direct", "indirect"
   ├── original_amount → 547,200,000 COP (venta)
   ├── approved_changes → 0 COP
   ├── committed_amount → 0 COP (PO comprometidas)
   ├── actual_amount → 751,864,128 COP (costo realizado)
   ├── unit
   ├── quantity
   ├── unit_price
   ├── notes
   ├── created_at
   └── updated_at

5. transactions (Ingresos/Egresos)
   ├── id (UUID, PK)
   ├── project_id (FK → projects)
   ├── transaction_type → "income", "expense"
   ├── category → "materials", "labor", "services"
   ├── description
   ├── amount → 16,745,324,701 COP
   ├── transaction_date
   ├── wbs_item_id (FK → wbs_items, nullable)
   ├── budget_item_id (FK → budget_items, nullable)
   ├── invoice_id (FK → invoices, nullable)
   ├── reference_number
   ├── counterparty → "Starcharge", "SGS", etc.
   ├── status → "draft", "pending", "approved", "rejected"
   ├── due_date
   ├── payment_date
   ├── tax_amount
   ├── retention_amount
   ├── notes
   ├── created_at
   └── updated_at

6. invoices (Facturas)
   ├── id (UUID, PK)
   ├── project_id (FK → projects)
   ├── invoice_type → "issued" (emitida), "received" (recibida)
   ├── invoice_number → "INV-001"
   ├── counterparty_name
   ├── issue_date
   ├── due_date
   ├── status → "draft", "sent", "partial", "paid", "overdue"
   ├── tax_id
   ├── retention_percentage
   ├── amount_paid
   ├── payment_terms
   ├── certification_number
   ├── notes
   ├── created_at
   └── updated_at

   Relaciones: ←→ invoice_line_items

7. invoice_line_items (Líneas de Factura)
   ├── id (UUID, PK)
   ├── invoice_id (FK → invoices)
   ├── description
   ├── quantity
   ├── unit_price
   ├── tax_rate
   ├── wbs_item_id (FK → wbs_items, nullable)
   └── budget_item_id (FK → budget_items, nullable)

8. cash_flow_entries (Flujo de Caja)
   ├── id (UUID, PK)
   ├── project_id (FK → projects)
   ├── year
   ├── month
   ├── flow_type → "forecast", "actual"
   ├── projected_income → 16,745,324,701 COP (Feb 2026)
   ├── projected_expense → 7,234,000,000 COP
   ├── actual_income
   ├── actual_expense
   ├── notes
   ├── created_at
   └── updated_at

   Constraint: UNIQUE(project_id, year, month, flow_type)
```

### ❌ Tablas Faltantes (1 modelo)

```
alerts (NUEVA - necesaria para AlertsPage.tsx)
├── id (UUID, PK)
├── project_id (FK → projects)
├── severity → "critical", "warning", "info"
├── category → "Cronograma", "Avance", "Presupuesto", "Financiero", "Procura"
├── title
├── description
├── impact
├── recommendation
├── metric → "2.5 meses", "0.64", "-37.4%", etc.
├── metric_label → "Exceso de plazo", "SPI", "Margen capitulo", etc.
├── date
├── resolved → false
├── resolved_at (nullable)
├── resolved_by (nullable)
├── created_at
└── updated_at
```

### ✅ Endpoints Disponibles (9 routers)

```
BASE: /api/v1

Authentication
├── POST   /auth/login
├── POST   /auth/logout
├── POST   /auth/refresh
└── GET    /auth/me

Projects
├── GET    /projects/ (list)
├── POST   /projects/ (create)
├── GET    /projects/{project_id} (get)
├── PUT    /projects/{project_id} (update)
└── DELETE /projects/{project_id} (delete)

WBS (Work Breakdown Structure)
├── GET    /projects/{project_id}/wbs (list)
├── POST   /projects/{project_id}/wbs (create)
├── GET    /projects/{project_id}/wbs/{wbs_id} (get)
├── PUT    /projects/{project_id}/wbs/{wbs_id} (update)
└── DELETE /projects/{project_id}/wbs/{wbs_id} (delete)

Budget
├── GET    /projects/{project_id}/budget (list)
├── POST   /projects/{project_id}/budget (create)
├── GET    /projects/{project_id}/budget/{budget_id} (get)
├── PUT    /projects/{project_id}/budget/{budget_id} (update)
└── DELETE /projects/{project_id}/budget/{budget_id} (delete)

Transactions
├── GET    /projects/{project_id}/transactions (list)
├── POST   /projects/{project_id}/transactions (create)
├── GET    /projects/{project_id}/transactions/{tx_id} (get)
├── PUT    /projects/{project_id}/transactions/{tx_id} (update)
└── DELETE /projects/{project_id}/transactions/{tx_id} (delete)

Invoices
├── GET    /projects/{project_id}/invoices (list)
├── POST   /projects/{project_id}/invoices (create)
├── GET    /projects/{project_id}/invoices/{invoice_id} (get)
├── PUT    /projects/{project_id}/invoices/{invoice_id} (update)
└── DELETE /projects/{project_id}/invoices/{invoice_id} (delete)

Cash Flow
├── GET    /projects/{project_id}/cash-flow (list)
├── POST   /projects/{project_id}/cash-flow (create)
├── GET    /projects/{project_id}/cash-flow/{cf_id} (get)
├── PUT    /projects/{project_id}/cash-flow/{cf_id} (update)
└── DELETE /projects/{project_id}/cash-flow/{cf_id} (delete)

Reports
├── GET    /projects/{project_id}/reports/budget-summary
├── GET    /projects/{project_id}/reports/cash-flow-analysis
├── GET    /projects/{project_id}/reports/earned-value
└── POST   /projects/{project_id}/reports/export (PDF/Excel)

Dashboard
└── GET    /projects/{project_id}/dashboard
    Returns: {
      project: {...},
      budget_summary: {...},
      cash_flow_summary: {...},
      counts: {...},
      earned_value: {...}
    }
```

### ❌ Endpoints Faltantes (1 router)

```
Alerts
├── GET    /projects/{project_id}/alerts (list all)
├── POST   /projects/{project_id}/alerts (create)
├── GET    /projects/{project_id}/alerts/{alert_id} (get)
├── PUT    /projects/{project_id}/alerts/{alert_id} (update)
├── DELETE /projects/{project_id}/alerts/{alert_id} (delete)
└── PATCH  /projects/{project_id}/alerts/{alert_id}/resolve (marcar como resuelto)
```

## DATOS DEL PROYECTO PATIO SUR

### Proyecto Base
- **ID**: ps-001-uuid (por asignar desde BD)
- **Nombre**: Patio de Operacion Sur
- **Código**: OE 1035
- **Cliente**: Consorcio Express S.A.S. (NIT: 900.365.740-3)
- **Contratista**: PC Mejia Ingenieria S.A. (NIT: 811.025.231-5)
- **Tipo Contrato**: EPC
- **Inicio**: 2025-06-20
- **Fin Contractual**: 2026-07-03
- **Fin Revisada**: 2026-09-16
- **Duración Original**: 405 días
- **Duración Revisada**: 453 días
- **Presupuesto Total**: 41,012,884,481 COP
- **Margen Global**: 28.2%

### Capítulos/WBS Items (15 items presupuestarios)
1. Estudios y Disenos - $419M / $313M (25.4%)
2. Conexion a la Red - $519M / $369M (28.9%)
3. Redes MT (Celdas) - $2,894M / $2,047M (29.3%)
4. Subestaciones (Shelter) - $3,406M / $2,692M (21.0%)
5. Transformadores - $2,338M / $2,115M (9.5%)
6. Baja Tension (BT) - $3,856M / $2,865M (25.7%)
7. SPE y SPT - $263M / $258M (1.9%)
8. Comunicaciones - $701M / $265M (62.2%)
9. Cargadores - $6,744M / $5,330M (21.0%)
10. Instalacion Cargadores - $262M / $191M (27.0%)
11. Iluminacion y Aux. - $148M / $126M (15.0%)
12. **Comp. Reactiva** - $547M / $752M **(-37.4%)** ⚠️ CRÍTICA
13. Deteccion Incendios - $270M / $228M (15.6%)
14. Obras Civiles - $8,177M / $6,538M (20.0%)
15. Tramites - $680M / $186M (72.6%)

### Alertas Críticas (5 alertas en AlertsPage.tsx)
1. ⚠️ CRÍTICA: Cronograma excede 2.5 meses (16 Sep 2026 vs 3 Jul 2026)
2. ⚠️ CRÍTICA: Atraso en cronograma SPI=0.64 (-18%)
3. ⚠️ CRÍTICA: Compensación Reactiva margen negativo -37.4%
4. ⚠️ WARNING: Flujo caja negativo acumulado -$8.5B
5. ⚠️ WARNING: Retrasos en procura (Cargadores, Islas 2-3)

### Flujo de Caja (11 períodos)
- **Oct 2025**: Egreso $235M
- **Feb 2026**: Ingreso $16,745M, Egreso $7,234M, Neto +$9,511M
- **Mar 2026**: Egreso $2,719M, Acumulado negativo -$8.5B
- **Oct 2026**: Ingreso $17,714M (pago final)
- **Nov 2026**: Ingreso $16,207M

### Crédito Puente
- **Monto**: $17,000M
- **Tasa**: 13.66% EA (13.01% nominal)
- **Desembolso**: 2026-02-06
- **Vencimiento**: 2027-02-06
- **Interés Total**: $2,211M
- **Tipo**: Bullet (pago capital al vencimiento)

---

## PLAN DE IMPLEMENTACIÓN

### Fase 1: Backend (BD + Endpoints)
1. ✅ Cambiar config a MySQL ← HECHO
2. ✅ Agregar aiomysql a requirements ← HECHO
3. ⏳ Crear modelo AlertModel (alert_model.py)
4. ⏳ Crear DTO AlertResponse (alert_dto.py)
5. ⏳ Crear endpoints de Alertas (alerts.py)
6. ⏳ Registrar router de Alertas en router.py
7. ⏳ Seed data: Insertar proyecto Patio Sur + datos históricos

### Fase 2: Frontend (Consumo API)
1. ⏳ Crear cliente API (api/alerts.ts)
2. ⏳ Actualizar ProjectsPage.tsx → Consumir /api/v1/projects
3. ⏳ Actualizar DashboardPage.tsx → Consumir /api/v1/projects/{id}/dashboard
4. ⏳ Actualizar AlertsPage.tsx → Consumir /api/v1/projects/{id}/alerts
5. ⏳ Actualizar CronogramaPage.tsx → Consumir /api/v1/projects/{id}/wbs
6. ⏳ Actualizar componentes de Presupuesto, Flujo de Caja, etc.

### Fase 3: Validación
1. ⏳ Pruebas de conectividad BD
2. ⏳ Pruebas CRUD en cada endpoint
3. ⏳ Verificación visual en frontend
4. ⏳ Validación de datos (tipos, cálculos, totales)
