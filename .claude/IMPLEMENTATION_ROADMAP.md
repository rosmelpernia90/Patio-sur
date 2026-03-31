# Plan de Implementación - Integración BD MySQL

## RESUMEN EJECUTIVO

**Estado Actual:**
- ✅ Backend: FastAPI con 38 endpoints ya implementados
- ✅ BD: MySQL configurada (DATABASE_URL apuntando a localhost)
- ✅ 8 tablas creadas (projects, wbs_items, budget_items, transactions, invoices, cash_flow_entries, users, invoice_line_items)
- ❌ Frontend: 100% datos hardcodeados en componentes
- ❌ Tabla de Alertas: No existe en BD

**Tarea Principal:**
Migrar toda la información de la aplicación desde datos hardcodeados → Base de datos MySQL + API REST

---

## FASE 1: CREAR TABLA DE ALERTAS (Backend) — ~2 horas

### Step 1.1: Crear AlertModel
Archivo: `backend/src/infrastructure/database/models/alert_model.py`

```python
class AlertModel(Base):
    __tablename__ = "alerts"

    id: UUID (PK)
    project_id: UUID (FK → projects)
    severity: "critical" | "warning" | "info"
    category: "Cronograma" | "Avance" | "Presupuesto" | "Financiero" | "Procura"
    title: str
    description: str
    impact: str
    recommendation: str
    metric: str (nullable)
    metric_label: str (nullable)
    date: date
    resolved: bool
    resolved_at: datetime (nullable)
    resolved_by: str (nullable)
    created_at: datetime
    updated_at: datetime
```

### Step 1.2: Crear AlertDTO
Archivo: `backend/src/application/dtos/alert_dto.py`

```python
class AlertCreate(BaseModel):
    severity: str
    category: str
    title: str
    ...

class AlertResponse(BaseModel):
    id: UUID
    severity: str
    ...
```

### Step 1.3: Crear AlertsEndpoints
Archivo: `backend/src/interface/api/v1/endpoints/alerts.py`

- GET /projects/{project_id}/alerts
- POST /projects/{project_id}/alerts
- GET /projects/{project_id}/alerts/{alert_id}
- PUT /projects/{project_id}/alerts/{alert_id}
- DELETE /projects/{project_id}/alerts/{alert_id}
- PATCH /projects/{project_id}/alerts/{alert_id}/resolve

### Step 1.4: Registrar Router
Archivo: `backend/src/interface/api/v1/router.py`

```python
api_v1_router.include_router(alerts_router, prefix="/projects/{project_id}/alerts", tags=["Alerts"])
```

### Step 1.5: Seed Data
Insertar las 5 alertas del archivo AlertsPage.tsx en la BD

---

## FASE 2: SEED DATA PRINCIPAL (Backend) — ~1 hora

### Step 2.1: Crear script seed
Insertar:
- 1 Proyecto (Patio de Operacion Sur)
- 15 WBS Items (Capítulos del cronograma)
- 15 Budget Items (Presupuesto por capítulo)
- 11 Cash Flow Entries (Flujo de caja)
- 5 Alerts (Alertas del proyecto)

---

## FASE 3: CREAR CLIENTES API (Frontend) — ~1 hora

### Step 3.1: Servicio de Proyectos
Archivo: `frontend/src/services/api/projects.ts`

```typescript
export const projectsAPI = {
  list: () => client.get('/projects'),
  get: (id: string) => client.get(`/projects/${id}`),
  ...
}
```

### Step 3.2: Servicio de Alertas
Archivo: `frontend/src/services/api/alerts.ts`

```typescript
export const alertsAPI = {
  list: (projectId: string) => client.get(`/projects/${projectId}/alerts`),
  get: (projectId: string, alertId: string) => ...
  ...
}
```

### Step 3.3: Servicio de Dashboard
Archivo: `frontend/src/services/api/dashboard.ts`

```typescript
export const dashboardAPI = {
  get: (projectId: string) => client.get(`/projects/${projectId}/dashboard`)
}
```

### Step 3.4: Servicios adicionales
- `frontend/src/services/api/wbs.ts` (cronograma)
- `frontend/src/services/api/budget.ts` (presupuesto)
- `frontend/src/services/api/cashFlow.ts` (flujo de caja)

---

## FASE 4: ACTUALIZAR COMPONENTES (Frontend) — ~2 horas

### Step 4.1: ProjectsPage.tsx
Reemplazar:
```typescript
const projects = [ ... ] // hardcoded
```

Por:
```typescript
const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: projectsAPI.list
})
```

### Step 4.2: DashboardPage.tsx
```typescript
const { data } = useQuery({
  queryKey: ['dashboard', projectId],
  queryFn: () => dashboardAPI.get(projectId)
})
```

### Step 4.3: AlertsPage.tsx
```typescript
const { data: alerts } = useQuery({
  queryKey: ['alerts', projectId],
  queryFn: () => alertsAPI.list(projectId)
})
```

### Step 4.4: CronogramaPage.tsx
```typescript
const { data: wbsItems } = useQuery({
  queryKey: ['wbs', projectId],
  queryFn: () => wbsAPI.list(projectId)
})
```

### Step 4.5: Otros componentes
- Presupuesto
- Flujo de Caja
- Transacciones (si existe página)
- Facturas (si existe página)

---

## FASE 5: VALIDACIÓN Y TESTING — ~1 hora

### Step 5.1: Verificar conectividad BD
```bash
# Probar que MySQL se conecta correctamente
```

### Step 5.2: Verificar endpoints
```bash
# Probar cada endpoint con Postman/Thunder Client
curl http://localhost:8000/api/v1/projects
curl http://localhost:8000/api/v1/projects/{id}/alerts
```

### Step 5.3: Verificar datos en Frontend
- Navegar a cada página
- Verificar que datos cargan correctamente
- Verificar cálculos y totales
- Verificar formateo de moneda

---

## ORDEN DE EJECUCIÓN RECOMENDADO

```
┌─ BACKEND (Horas 0-3)
│  ├─ 0:00-0:30  Crear AlertModel + AlertDTO
│  ├─ 0:30-1:00  Crear endpoints de Alertas
│  ├─ 1:00-1:15  Registrar router
│  └─ 1:15-3:00  Seed data (Proyecto + WBS + Budget + CashFlow + Alerts)
│
├─ FRONTEND - SERVICIOS (Horas 3-4)
│  ├─ 3:00-3:30  Crear clients API (projects, alerts, dashboard, wbs, budget)
│  └─ 3:30-4:00  Verificar que servicios compilean
│
├─ FRONTEND - COMPONENTES (Horas 4-6)
│  ├─ 4:00-4:30  ProjectsPage.tsx
│  ├─ 4:30-5:00  DashboardPage.tsx
│  ├─ 5:00-5:30  AlertsPage.tsx
│  └─ 5:30-6:00  CronogramaPage.tsx
│
└─ VALIDACIÓN (Horas 6-7)
   ├─ 6:00-6:30  Testing de endpoints
   └─ 6:30-7:00  Testing visual en Frontend

TIEMPO TOTAL ESTIMADO: 7 horas
```

---

## PRIORIDAD DE PÁGINAS

### ALTA PRIORIDAD
1. ProjectsPage - Punto de entrada
2. DashboardPage - Dashboard principal
3. AlertsPage - Alertas críticas

### MEDIA PRIORIDAD
4. CronogramaPage - Cronograma
5. Presupuesto - Capítulos

### BAJA PRIORIDAD
6. Flujo de Caja
7. Transacciones
8. Facturas

---

## CONSIDERACIONES IMPORTANTES

### 1. UUID vs ID numérico
- Backend usa UUID (PostgreSQL style)
- MySQL lo soporta bien
- Frontend debe manejar strings UUID en URLs

### 2. Tipos de datos
- Presupuesto/Finanzas: Numeric(18,2) en BD → float/Decimal en DTO → JSON
- Fechas: ISO8601 format en JSON
- Porcentajes: float (0-100) o Decimal

### 3. Paginación
- Endpoints de lista deben soportar skip/limit
- Frontend: implementar lazy loading si hay muchos datos

### 4. Errores comunes a evitar
- ❌ Usar UUIDs en URL sin validación
- ❌ Olvidar convertir Numeric → float en DTO
- ❌ Datos stale en Frontend (usar React Query)
- ❌ FK references a proyectos que no existen

### 5. Variables de entorno
- `.env` con DATABASE_URL apuntando a MySQL
- Puerto backend: 8000
- Puerto frontend: 5173
- CORS habilitado en ambos

---

## CHECKLIST PRE-IMPLEMENTACIÓN

- [ ] MySQL corriendo en localhost:3306
- [ ] Base de datos "Proyectos" creada
- [ ] Backend visto y configurado
- [ ] Frontend compilando sin errores
- [ ] Node modules instalados
- [ ] requirements.txt instalado en Python

---

## PRÓXIMOS PASOS

Procederé en este orden:
1. ✅ Crear AlertModel
2. ✅ Crear AlertDTO
3. ✅ Crear alerts endpoints
4. ✅ Registrar router
5. ✅ Seed data del proyecto
6. ✅ Crear servicios API en Frontend
7. ✅ Actualizar ProjectsPage
8. ✅ Actualizar DashboardPage
9. ✅ Actualizar AlertsPage
10. ✅ Testing y validación
