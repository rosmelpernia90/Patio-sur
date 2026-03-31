# PROMPT — Portal de Gestion Financiera Patio de Operacion Sur

## Proyecto
Sistema de control financiero y gestion de proyectos para **PC Mejia Ingenieria S.A.**, proyecto **Patio de Operacion Sur (OE 1035)** — Electrificacion de patio troncal de buses electricos en Bogota. Cliente: Consorcio Express S.A.S. Valor: $41B COP. Contrato EPC, pago total contra entrega.

---

## Arquitectura

```
Frontend (React 18 + TypeScript + Vite)
  └── Tailwind CSS + Recharts + Lucide Icons
  └── Zustand (estado) + React Query + Axios
  └── JWT auth con roles (gerente/controller/ingeniero/viewer)

Backend (FastAPI + Python 3.12)
  └── SQLAlchemy async ORM + Alembic migraciones
  └── PostgreSQL (prod) / SQLite (dev)
  └── Reportlab + WeasyPrint (PDFs)
  └── asyncpg + Pydantic v2

Docs (Python scripts)
  └── 4 generadores PDF (dashboard, caso negocio, flujo caja, presupuesto)
```

**Dev**: Vite :5173 → proxy → Uvicorn :8000 | Node v20 (fnm) | Python 3.12 (pyenv)

---

## Frontend — 13 Pages + 8 Components

### Pages
| Ruta | Pagina | Descripcion |
|------|--------|-------------|
| `/login` | LoginPage | Autenticacion JWT |
| `/projects` | ProjectsPage | Listado de proyectos |
| `/:id/dashboard` | DashboardPage | KPIs EVM, Curva S, Estructura General, Flujo Caja, Alertas, Contrato, Tabla EVM |
| `/:id/cronograma` | CronogramaPage | Curva S completa + WBS expandible 12 capitulos + barras Gantt |
| `/:id/budget` | BudgetPage | 15 capitulos + AIU + Financiacion real ($2.211B), KPIs: CPI Proyectado, % Utilidad |
| `/:id/cash-flow` | CashFlowPage | Flujo mensual Oct25-Sep26, KPIs financieros, credito $17B |
| `/:id/business-case` | BusinessCasePage | Caso de negocio con metricas EVM |
| `/:id/wbs` | WBSPage | Estructura desglose de trabajo |
| `/:id/transactions` | TransactionsPage | Transacciones ingreso/egreso |
| `/:id/invoices` | InvoicesPage | Facturas cliente/proveedor |
| `/:id/documents` | DocumentsPage | Documentos del proyecto |
| `/:id/reports` | ReportsPage | Exportacion PDF/Excel |
| `/:id/alerts` | AlertsPage | 5 alertas con impacto y recomendacion |

### Componentes clave
- **HelpButton**: Panel deslizable con 2 tabs (Leyenda + PDF), secciones con items coloreados
- **KPICard**: Tarjeta con titulo, valor, icono, tendencia y variante (default/success/warning/danger)
- **BudgetOverview**: 3 barras acumuladas horizontales (Venta/Costo/Ejecucion) + detalle expandible por capitulo + cruce de 3 fuentes
- **SCurveChart**: 67 semanas, planeado/ejecutado, ComposedChart con areas y lineas
- **AlertsPanel**: Panel de alertas con severidad (critical/warning)
- **CashFlowChart**: Grafico de flujo de caja mensual
- **MainLayout**: Sidebar + header + contenido protegido por rol

---

## Backend — API REST /api/v1

### Endpoints
```
/auth       → login, users CRUD, roles, cambio password
/projects   → CRUD proyectos
/:id/wbs    → estructura desglose (4 niveles: chapter/sub/package/activity)
/:id/budget → presupuesto por item WBS
/:id/transactions → ingresos y egresos
/:id/invoices     → facturas + line items
/:id/cash-flow    → flujo mensual proyectado vs real
/:id/dashboard    → datos consolidados
/:id/reports      → exportacion PDF/Excel
```

### Modelos DB (SQLAlchemy)
UserModel, ProjectModel, WBSItemModel, BudgetItemModel, TransactionModel, InvoiceModel, InvoiceLineItemModel, CashFlowEntryModel

### Auth
- JWT HS256, 8h expiracion
- 4 roles: gerente (full), controller (finanzas), ingeniero (tecnico), viewer (solo lectura)
- Admin seed: gerente@pcmejia.com / PcMejia2025*

---

## Datos Financieros Reales (hardcoded en frontend)

| Metrica | Valor | Fuente |
|---------|-------|--------|
| BAC (Valor Oferta) | $41,012,884,481 | Caso de negocio "RESUMEN VENTA" |
| AC (Costo Real) | $8,530,521,315 | Proyeccion de Pagos Feb+Mar |
| EV (Valor Ganado) | $13,131,322,874 | % avance x BAC |
| CPI | 1.54 | EV/AC |
| SPI (EVM) | 0.64 | EV/PV |
| SPI (Curva S) | 1.01 | Ejecutado/Planeado semanal |
| EAC | $26,631,743,429 | BAC/CPI |
| Costo Directo | $24,274,282,134 | 15 capitulos |
| AIU | $2,930,214,540 | Admin 11% + Imp 2% |
| Financiacion Real | $2,211,000,000 | Credito $17B a IBR+2.85 (13.65% EA) |
| Financiacion Oferta | $1,375,000,000 | Estimado original |
| Sobrecosto Financiero | $836,000,000 | Real - Estimado (+61%) |
| Margen Ajustado | $10,719,720,094 (26.1%) | Venta - Costo |
| CPI Proyectado | 1.35 | Venta/Costo Total |
| Comprometido | $13,052,418,623 | Contratos adjudicados |

### Fuentes Excel
1. **Detallado caso de negocio_220126.xlsx** — 16 hojas: Costo vs Venta, RESUMEN VENTA, Admon Patios
2. **Proyeccion de Pagos Patio Sur.xlsx** — 6 hojas: Pagos, CREDITO, Otros Pagos, CC_FRAS
3. **Curva S (19 mar) Pablo.xlsx** — 9 hojas: 67 semanas, 518 actividades, pesos WBS
4. **Patio Sur_.xlsx** — Reporte general: OE 1035, equipo, costos ejecutados, facturacion

---

## Curva S
- 67 semanas: S-00 (18 Jun 2025) a S-66 (23 Sep 2026)
- Corte actual: S-40 (25 Mar 2026) → Planeado 51.9%, Ejecutado 52.2%
- 12 capitulos WBS con pesos (Ejecucion = 50%)
- Fecha contractual: 3 Jul 2026

---

## PDFs generados (reportlab)
| Archivo | Contenido |
|---------|-----------|
| Informe_Dashboard_Metricas.pdf | KPIs EVM, presupuesto, curva S |
| Informe_CasoDeNegocio_Metricas.pdf | Estructura oferta, financiacion, AIU |
| Informe_FlujoDeCaja_Metricas.pdf | Flujo mensual, credito, riesgos |
| Informe_Presupuesto_Metricas.pdf | 15 capitulos, CPI Proy, % Utilidad |

---

## Tema visual (Tailwind)
- **Primary**: #2670be (azul PC Mejia)
- **Steel**: escala de grises corporativos
- **Accent**: #d4a017 (dorado)
- **Font**: Inter, system-ui
- **Shadows**: card, card-hover personalizados
- **Iconos**: Lucide React
- **Graficos**: Recharts (ComposedChart, BarChart, AreaChart)

---

## Instrucciones de continuidad
- El frontend usa datos hardcoded (no conectado a API real aun)
- Cada pagina tiene HelpButton con explicacion gerencial financiera detallada
- Los valores deben coincidir entre paginas, PDFs y help buttons
- Contexto: proyecto de infraestructura electrica, usuario con perfil gerencial financiero
- Mantener consistencia con el diseno corporativo y las fuentes de datos citadas
