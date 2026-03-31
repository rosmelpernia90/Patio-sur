"""
Seed data for Patio Sur project.
Run: python backend/seed_patio_sur.py
"""
import asyncio
from datetime import date
from uuid import uuid4

from sqlalchemy import select

from src.infrastructure.database.models import Base
from src.infrastructure.database.session import engine, AsyncSessionLocal
from src.infrastructure.database.models import (
    ProjectModel,
    WBSItemModel,
    BudgetItemModel,
    CashFlowEntryModel,
    AlertModel,
)


async def seed_patio_sur():
    """Seed Patio Sur project with all real data."""
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tablas creadas/verificadas")

    async with AsyncSessionLocal() as session:
        # Check if project already exists
        existing = await session.execute(
            select(ProjectModel).where(ProjectModel.code == "OE 1035")
        )
        if existing.scalar_one_or_none():
            print("✅ Proyecto Patio Sur ya existe. Saltando seed.")
            return

        # Create Project
        project_id = str(uuid4())
        project = ProjectModel(
            id=project_id,
            name="Patio de Operacion Sur",
            code="OE 1035",
            description="Estudios y Disenos, Ingenieria de Detalle, Construccion, Instalacion, Pruebas y Puesta en Marcha de la Infraestructura de Recarga Electrica (IRE)",
            client_name="Consorcio Express S.A.S.",
            start_date=date(2025, 6, 20),
            estimated_end_date=date(2026, 9, 16),
            total_budget=41012884481.0,
            currency="COP",
            status="in_progress",
            project_manager="Esteban Londono",
        )
        session.add(project)
        await session.flush()
        print(f"✅ Proyecto creado: {project.name} ({project.code})")

        # WBS Items (15 Capítulos)
        wbs_data = [
            ("1.0", "Estudios y Disenos", "chapter"),
            ("2.0", "Conexion a la Red", "chapter"),
            ("3.0", "Redes MT (Celdas)", "chapter"),
            ("4.0", "Subestaciones (Shelter)", "chapter"),
            ("5.0", "Transformadores", "chapter"),
            ("6.0", "Baja Tension (BT)", "chapter"),
            ("7.0", "SPE y SPT", "chapter"),
            ("8.0", "Comunicaciones", "chapter"),
            ("9.0", "Cargadores", "chapter"),
            ("10.0", "Instalacion Cargadores", "chapter"),
            ("11.0", "Iluminacion y Aux.", "chapter"),
            ("12.0", "Compensacion Reactiva", "chapter"),
            ("13.0", "Deteccion Incendios", "chapter"),
            ("14.0", "Obras Civiles", "chapter"),
            ("15.0", "Tramites", "chapter"),
        ]

        wbs_items = []
        for code, name, level in wbs_data:
            wbs = WBSItemModel(
                project_id=project_id,
                code=code,
                name=name,
                level=level,
                planned_start_date=date(2025, 6, 20),
                planned_end_date=date(2026, 9, 16),
                weight=1.0,
                status="in_progress",
            )
            session.add(wbs)
            wbs_items.append(wbs)

        await session.flush()
        print(f"✅ {len(wbs_items)} WBS Items creados")

        # Budget Items (15 Capítulos con datos reales)
        budget_data = [
            ("Estudios y Disenos", 419047180, 312727205),
            ("Conexion a la Red", 519268407, 369435063),
            ("Redes MT (Celdas)", 2893959054, 2046582157),
            ("Subestaciones (Shelter)", 3406137000, 2692179338),
            ("Transformadores", 2338037308, 2115002279),
            ("Baja Tension (BT)", 3856386116, 2864635880),
            ("SPE y SPT", 262823529, 257800000),
            ("Comunicaciones", 701469115, 264839198),
            ("Cargadores", 6743603237, 5330376000),
            ("Instalacion Cargadores", 261567164, 191000000),
            ("Iluminacion y Aux.", 147984032, 125786428),
            ("Comp. Reactiva", 547200000, 751864128),
            ("Deteccion Incendios", 270082618, 227943849),
            ("Obras Civiles", 8177142400, 6537881527),
            ("Tramites", 679896358, 186229084),
        ]

        for i, (desc, venta, costo) in enumerate(budget_data):
            budget = BudgetItemModel(
                project_id=project_id,
                wbs_item_id=wbs_items[i].id,
                code=str(i + 1),
                description=desc,
                category="electrical",
                cost_type="direct",
                original_amount=venta,
                actual_amount=costo,
            )
            session.add(budget)

        await session.flush()
        print(f"✅ {len(budget_data)} Budget Items creados")

        # Cash Flow Entries (11 períodos reales)
        cash_flow_data = [
            (2025, 10, -235139266),
            (2025, 11, -954984),
            (2025, 12, -198015049),
            (2026, 1, -316045103),
            (2026, 2, 9152324701),
            (2026, 3, -1003716497),
            (2026, 4, 830402000),
            (2026, 5, -3626000000),
            (2026, 6, -646000000),
            (2026, 10, 17214279534),
            (2026, 11, 15907000000),
        ]

        for year, month, net in cash_flow_data:
            cf = CashFlowEntryModel(
                project_id=project_id,
                year=year,
                month=month,
                flow_type="actual",
                projected_income=max(0, net),
                projected_expense=max(0, -net),
                actual_income=max(0, net),
                actual_expense=max(0, -net),
            )
            session.add(cf)

        await session.flush()
        print(f"✅ {len(cash_flow_data)} Cash Flow Entries creados")

        # Alerts (5 alertas críticas del proyecto)
        alerts_data = [
            {
                "severity": "critical",
                "category": "Cronograma",
                "title": "Cronograma MPP excede plazo contractual por 2.5 meses",
                "description": "El cronograma revisado (19 mar) finaliza el 16 Sep 2026 (453 dias). La fecha contractual es 3 Jul 2026 (405 dias). El plazo real es 2.5 meses mayor al contractual.",
                "impact": "Riesgo de activacion de la clausula penal contractual del 20% sobre el valor del contrato, equivalente a $8.2B COP. Esto eliminaria por completo el margen del proyecto ($10.7B).",
                "recommendation": "Solicitar formalizacion del otrosi de ampliacion de plazo. Documentar causas de retraso no atribuibles al contratista. Preparar argumentacion tecnica y juridica para la negociacion.",
                "metric": "2.5 meses",
                "metric_label": "Exceso de plazo",
                "alert_date": "2026-03-19",
            },
            {
                "severity": "critical",
                "category": "Avance",
                "title": "Atraso en cronograma: SPI = 0.64 (-18% desviacion)",
                "description": "Avance real del 32% vs planificado del 50% a la fecha de corte. El SPI (Schedule Performance Index) de 0.64 indica que por cada dia programado solo se avanza 0.64 dias efectivos. Islas 1, 2 y 3 con minimo avance.",
                "impact": "Al ritmo actual, la obra no terminaria en Jul 2026 sino en Nov 2026 (4 meses adicionales). Cada mes de retraso incrementa el costo financiero en ~$195M por intereses del credito ($17B a IBR+2.85).",
                "recommendation": "Implementar plan de aceleracion con turnos adicionales y fast-tracking de actividades no criticas. Priorizar Isla 1 para demostrar avance al cliente. Revisar restricciones de procura.",
                "metric": "0.64",
                "metric_label": "SPI",
                "alert_date": "2026-03-07",
            },
            {
                "severity": "critical",
                "category": "Presupuesto",
                "title": "Compensacion Reactiva: margen negativo -37.4%",
                "description": "El capitulo 12 (Compensacion Reactiva) tiene un costo estimado de $751.9M que supera el valor de venta de $547.2M, generando una perdida directa de $204.7M en este capitulo.",
                "impact": "Perdida neta de $204.7M que reduce el margen global del proyecto. Si no se optimiza el diseno o se negocia un otrosi, esta partida absorbe utilidad de otros capitulos.",
                "recommendation": "Evaluar alternativas tecnicas de menor costo para los bancos de condensadores. Explorar la posibilidad de un otrosi que reconozca el incremento de costo. Revisar si el alcance puede optimizarse.",
                "metric": "-37.4%",
                "metric_label": "Margen capitulo",
                "alert_date": "2026-03-07",
            },
            {
                "severity": "warning",
                "category": "Financiero",
                "title": "Flujo de caja negativo acumulado: -$8.5B COP",
                "description": "Modalidad de pago total contra entrega. El proyecto acumula $8.5B en egresos a Mar 2026 sin ningun ingreso. El flujo negativo se proyecta hasta Jul 2026 cuando se recibe el pago de $41B.",
                "impact": "Dependencia total del credito bancario de $17B (IBR+2.85 = 13.65% EA). El costo financiero real asciende a $2.211B, superando el estimado de $1.375B en $836M (+61%). Exposicion maxima proyectada: ~$19.8B.",
                "recommendation": "Gestionar con el cliente la posibilidad de pagos parciales por hitos. Monitorear la tasa IBR para anticipar variaciones en el costo financiero. Optimizar el calendario de desembolsos.",
                "metric": "$8.5B",
                "metric_label": "Exposicion actual",
                "alert_date": "2026-03-07",
            },
            {
                "severity": "warning",
                "category": "Procura",
                "title": "Retrasos en procura: Cargadores e Islas 2-3",
                "description": "Los cargadores Starcharge de 450kW para Islas 2 y 3 no llegan hasta Abr 2026. Los shelters (subestaciones prefabricadas) para Isla 3 tambien con entrega en Abr 2026. Estos items estan en la ruta critica.",
                "impact": "El retraso en la llegada de cargadores impide el montaje electrico y las pruebas de las Islas 2 y 3. Sin estos equipos, no se puede completar el comisionamiento ni la entrega parcial.",
                "recommendation": "Hacer seguimiento semanal con Starcharge (proveedor en China). Evaluar envios parciales por via aerea para items criticos. Preparar frentes de trabajo alternativos mientras llegan los equipos.",
                "metric": "Abr 2026",
                "metric_label": "Fecha estimada",
                "alert_date": "2026-03-07",
            },
        ]

        for alert_data in alerts_data:
            alert = AlertModel(
                project_id=project_id,
                **alert_data,
            )
            session.add(alert)

        await session.flush()
        print(f"✅ {len(alerts_data)} Alerts creadas")

        # Commit
        await session.commit()
        print("\n✅ ✅ ✅ SEED DATA COMPLETADO EXITOSAMENTE ✅ ✅ ✅")
        print(f"Proyecto: {project.name} ({project.code})")
        print(f"BD: Proyectos > Tabla: Patio Sur")


if __name__ == "__main__":
    asyncio.run(seed_patio_sur())
