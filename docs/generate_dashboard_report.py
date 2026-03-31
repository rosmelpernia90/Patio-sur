#!/usr/bin/env python3
"""
Genera informe PDF del Dashboard - PC Mejia Ingenieria S.A.
Proyecto: Patio de Operacion Sur
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, black, white, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
from reportlab.lib.utils import simpleSplit
import datetime

# ============================================================
# CORPORATE COLORS
# ============================================================
PRIMARY_BLUE = HexColor('#1B5EAB')
PRIMARY_DARK = HexColor('#0D3F7E')
PRIMARY_LIGHT = HexColor('#A9C8EB')
PRIMARY_BG = HexColor('#EEF4FB')
STEEL_900 = HexColor('#1A1C21')
STEEL_700 = HexColor('#4A4D56')
STEEL_500 = HexColor('#6B6E77')
STEEL_400 = HexColor('#8B8E96')
STEEL_200 = HexColor('#D1D2D6')
STEEL_100 = HexColor('#E8E9EB')
STEEL_50 = HexColor('#F6F7F8')
EMERALD = HexColor('#16A34A')
EMERALD_BG = HexColor('#F0FDF4')
RED = HexColor('#DC2626')
RED_BG = HexColor('#FEF2F2')
AMBER = HexColor('#D97706')
AMBER_BG = HexColor('#FFFBEB')
WHITE = HexColor('#FFFFFF')

OUTPUT_PATH = "/Users/rosmel/PC Mejiaa/Proyecto Patio Sur/docs/Informe_Dashboard_Metricas.pdf"

# ============================================================
# CUSTOM DOCUMENT CLASS
# ============================================================
class DashboardReportDoc(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(
            self.leftMargin, self.bottomMargin,
            self.width, self.height,
            id='normal'
        )
        template = PageTemplate(id='main', frames=frame, onPage=self._header_footer)
        self.addPageTemplates([template])
        self.page_count = 0

    def _header_footer(self, canvas_obj, doc):
        canvas_obj.saveState()
        w, h = letter

        # --- Header bar ---
        canvas_obj.setFillColor(PRIMARY_BLUE)
        canvas_obj.rect(0, h - 50, w, 50, fill=True, stroke=False)

        canvas_obj.setFillColor(WHITE)
        canvas_obj.setFont("Helvetica-Bold", 11)
        canvas_obj.drawString(30, h - 33, "PC MEJIA INGENIERIA S.A.")

        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.drawString(30, h - 45, "Gestion de Proyectos - Obra Electrica")

        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.drawRightString(w - 30, h - 33, "Patio de Operacion Sur")
        canvas_obj.drawRightString(w - 30, h - 45, f"Fecha: {datetime.date.today().strftime('%d/%m/%Y')}")

        # --- Footer ---
        canvas_obj.setFillColor(STEEL_200)
        canvas_obj.rect(0, 0, w, 30, fill=True, stroke=False)

        canvas_obj.setFillColor(STEEL_500)
        canvas_obj.setFont("Helvetica", 7)
        canvas_obj.drawString(30, 12, "CONFIDENCIAL - PC Mejia Ingenieria S.A. - Todos los derechos reservados")
        canvas_obj.drawRightString(w - 30, 12, f"Pagina {doc.page}")

        canvas_obj.restoreState()


# ============================================================
# STYLES
# ============================================================
def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=28,
        textColor=PRIMARY_BLUE,
        alignment=TA_CENTER,
        spaceAfter=10,
    ))
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='Helvetica',
        fontSize=14,
        textColor=STEEL_500,
        alignment=TA_CENTER,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=PRIMARY_BLUE,
        spaceBefore=18,
        spaceAfter=10,
        borderPadding=(0, 0, 4, 0),
    ))
    styles.add(ParagraphStyle(
        name='SubSection',
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=STEEL_900,
        spaceBefore=14,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='BodyText2',
        fontName='Helvetica',
        fontSize=9.5,
        textColor=STEEL_700,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        leading=13,
    ))
    styles.add(ParagraphStyle(
        name='MetricName',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=STEEL_900,
    ))
    styles.add(ParagraphStyle(
        name='MetricValue',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=PRIMARY_BLUE,
        alignment=TA_RIGHT,
    ))
    styles.add(ParagraphStyle(
        name='SourceNote',
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=STEEL_400,
        spaceBefore=4,
        spaceAfter=8,
        leftIndent=10,
    ))
    styles.add(ParagraphStyle(
        name='AlertCritical',
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=RED,
    ))
    styles.add(ParagraphStyle(
        name='AlertWarning',
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=AMBER,
    ))
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=WHITE,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Helvetica',
        fontSize=8,
        textColor=STEEL_700,
        leading=11,
    ))
    styles.add(ParagraphStyle(
        name='TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=STEEL_900,
        leading=11,
    ))
    styles.add(ParagraphStyle(
        name='FootNote',
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        textColor=STEEL_400,
        spaceBefore=6,
    ))
    return styles


# ============================================================
# HELPER: Section Divider
# ============================================================
def section_divider():
    return HRFlowable(
        width="100%", thickness=1.5,
        color=PRIMARY_LIGHT, spaceBefore=6, spaceAfter=6
    )

def thin_divider():
    return HRFlowable(
        width="100%", thickness=0.5,
        color=STEEL_200, spaceBefore=4, spaceAfter=4
    )


# ============================================================
# METRIC EXPLANATION BLOCK
# ============================================================
def metric_block(styles, name, value, sigla, significado, fuente, interpretacion="", color=None):
    """Creates a styled metric explanation block."""
    elements = []

    # Header row with name and value
    val_color = color if color else PRIMARY_BLUE
    header_data = [
        [
            Paragraph(f'<b>{sigla}</b> - {name}', styles['MetricName']),
            Paragraph(f'<b>{value}</b>', ParagraphStyle(
                'mv', parent=styles['MetricValue'], textColor=val_color
            )),
        ]
    ]
    header_table = Table(header_data, colWidths=[350, 150])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), STEEL_50),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (0, -1), 10),
        ('RIGHTPADDING', (-1, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 4))

    # Significado
    elements.append(Paragraph(
        f'<b>Significado:</b> {significado}', styles['BodyText2']
    ))

    # Interpretacion
    if interpretacion:
        elements.append(Paragraph(
            f'<b>Interpretacion en el proyecto:</b> {interpretacion}', styles['BodyText2']
        ))

    # Fuente
    elements.append(Paragraph(
        f'Fuente: {fuente}', styles['SourceNote']
    ))

    elements.append(Spacer(1, 6))
    return elements


# ============================================================
# BUILD COVER PAGE
# ============================================================
def build_cover(styles):
    elements = []
    elements.append(Spacer(1, 120))

    # Blue box
    cover_data = [[
        Paragraph("INFORME DE METRICAS", ParagraphStyle(
            'ct', fontName='Helvetica-Bold', fontSize=12,
            textColor=WHITE, alignment=TA_CENTER
        ))
    ]]
    cover_table = Table(cover_data, colWidths=[300])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_BLUE),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    elements.append(cover_table)
    elements.append(Spacer(1, 30))

    elements.append(Paragraph("Dashboard del Proyecto", styles['CoverTitle']))
    elements.append(Paragraph("Patio de Operacion Sur", styles['CoverSubtitle']))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("PC Mejia Ingenieria S.A.", ParagraphStyle(
        'cn', fontName='Helvetica-Bold', fontSize=14, textColor=PRIMARY_DARK, alignment=TA_CENTER
    )))
    elements.append(Spacer(1, 10))

    # Info box
    info_items = [
        ["Proyecto:", "Patio de Operacion Sur (OE 1035)"],
        ["Cliente:", "Consorcio Express S.A.S."],
        ["Contratista:", "PC Mejia Ingenieria S.A."],
        ["Marco Contractual:", "Otrosi No. 23 - Contrato Concesion 009/2010"],
        ["Plazo:", "9 meses (Oct 2025 - Jul 2026)"],
        ["Fecha del Informe:", datetime.date.today().strftime('%d de %B de %Y')],
        ["Elaborado por:", "Sistema de Gestion de Proyectos v1.0"],
    ]
    info_table = Table(info_items, colWidths=[140, 320])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), STEEL_500),
        ('TEXTCOLOR', (1, 0), (1, -1), STEEL_900),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, STEEL_200),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(Spacer(1, 20))
    elements.append(info_table)

    elements.append(Spacer(1, 40))
    elements.append(Paragraph(
        "Este documento describe cada metrica e indicador visualizado en el Dashboard del proyecto, "
        "explicando su significado, la fuente de datos de donde se obtuvo y su interpretacion en el "
        "contexto del proyecto Patio de Operacion Sur.",
        ParagraphStyle('desc', fontName='Helvetica-Oblique', fontSize=9,
                       textColor=STEEL_500, alignment=TA_CENTER, leading=13)
    ))

    elements.append(PageBreak())
    return elements


# ============================================================
# TABLE OF CONTENTS
# ============================================================
def build_toc(styles):
    elements = []
    elements.append(Paragraph("Tabla de Contenido", styles['SectionTitle']))
    elements.append(section_divider())

    toc_items = [
        ("1.", "Encabezado del Dashboard", "3"),
        ("2.", "Tarjetas KPI - Fila Principal", "3"),
        ("  2.1", "Valor Total Oferta (BAC)", "3"),
        ("  2.2", "Costo Real (ACWP)", "3"),
        ("  2.3", "CPI - Indice de Rendimiento de Costo", "4"),
        ("  2.4", "SPI - Indice de Rendimiento de Cronograma", "4"),
        ("3.", "Tarjetas KPI - Fila Secundaria", "4"),
        ("  3.1", "Valor Ganado (BCWP)", "4"),
        ("  3.2", "EAC - Estimacion a la Terminacion", "5"),
        ("  3.3", "Facturas Pendientes", "5"),
        ("  3.4", "Alertas Activas", "5"),
        ("4.", "Curva S - Avance del Proyecto", "5"),
        ("5.", "Resumen Presupuestario", "6"),
        ("6.", "Alertas del Proyecto", "6"),
        ("7.", "Flujo de Caja Mensual", "7"),
        ("8.", "Resumen del Contrato", "7"),
        ("9.", "Analisis de Valor Ganado (EVM)", "8"),
        ("10.", "Fuentes de Datos", "9"),
    ]

    toc_data = []
    for num, title, page in toc_items:
        indent = "    " if num.startswith("  ") else ""
        fname = 'Helvetica' if num.startswith("  ") else 'Helvetica-Bold'
        fsize = 8.5 if num.startswith("  ") else 9.5
        toc_data.append([
            Paragraph(f'{indent}{num.strip()}', ParagraphStyle('tn', fontName=fname, fontSize=fsize, textColor=STEEL_500)),
            Paragraph(title, ParagraphStyle('tt', fontName=fname, fontSize=fsize, textColor=STEEL_900)),
            Paragraph(page, ParagraphStyle('tp', fontName='Helvetica', fontSize=fsize, textColor=STEEL_400, alignment=TA_RIGHT)),
        ])

    toc_table = Table(toc_data, colWidths=[40, 380, 40])
    toc_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, STEEL_100),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(toc_table)
    elements.append(PageBreak())
    return elements


# ============================================================
# MAIN CONTENT
# ============================================================
def build_content(styles):
    elements = []

    # =====================================================
    # SECTION 1: HEADER
    # =====================================================
    elements.append(Paragraph("1. Encabezado del Dashboard", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "El encabezado del Dashboard muestra la informacion de identificacion general del proyecto. "
        "Incluye el nombre del proyecto, codigo interno, contratista, cliente, estado actual, "
        "marco contractual, plazo y fecha objetivo.",
        styles['BodyText2']
    ))

    # Info table
    header_info = [
        [Paragraph('<b>Campo</b>', styles['TableHeader']),
         Paragraph('<b>Valor Mostrado</b>', styles['TableHeader']),
         Paragraph('<b>Fuente</b>', styles['TableHeader'])],
        [Paragraph('Nombre', styles['TableCell']),
         Paragraph('Patio de Operacion Sur', styles['TableCellBold']),
         Paragraph('Oferta Mercantil PC Mejia', styles['TableCell'])],
        [Paragraph('Codigo', styles['TableCell']),
         Paragraph('OE 1035', styles['TableCellBold']),
         Paragraph('Codigo interno del sistema', styles['TableCell'])],
        [Paragraph('Contratista', styles['TableCell']),
         Paragraph('PC Mejia Ingenieria S.A.', styles['TableCellBold']),
         Paragraph('Oferta Mercantil', styles['TableCell'])],
        [Paragraph('Cliente', styles['TableCell']),
         Paragraph('Consorcio Express S.A.S.', styles['TableCellBold']),
         Paragraph('Oferta Mercantil', styles['TableCell'])],
        [Paragraph('Marco', styles['TableCell']),
         Paragraph('Otrosi No. 23 - Contrato Concesion 009/2010', styles['TableCellBold']),
         Paragraph('Contrato de Concesion (Transmilenio)', styles['TableCell'])],
        [Paragraph('Plazo', styles['TableCell']),
         Paragraph('9 meses', styles['TableCellBold']),
         Paragraph('Oferta Mercantil - Clausula de plazo', styles['TableCell'])],
        [Paragraph('Fecha objetivo', styles['TableCell']),
         Paragraph('1 Abr 2026', styles['TableCellBold']),
         Paragraph('Calculada: inicio Oct 2025 + 9 meses', styles['TableCell'])],
    ]
    ht = Table(header_info, colWidths=[90, 220, 190])
    ht.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('GRID', (0, 0), (-1, -1), 0.5, STEEL_200),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STEEL_50]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(ht)
    elements.append(Spacer(1, 10))

    # =====================================================
    # SECTION 2: KPI ROW 1
    # =====================================================
    elements.append(Paragraph("2. Tarjetas KPI - Fila Principal", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "La primera fila de tarjetas KPI presenta los cuatro indicadores financieros y de rendimiento "
        "mas importantes del proyecto. Estos valores permiten al gerente tener una vision inmediata "
        "del estado del proyecto.",
        styles['BodyText2']
    ))

    # --- 2.1 BAC ---
    elements.append(Paragraph("2.1 Valor Total Oferta (BAC)", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Valor Total Oferta",
        sigla="BAC",
        value="$ 41.012.884.481 COP",
        significado="El BAC (Budget at Completion) representa el presupuesto total aprobado para completar "
                    "todo el trabajo del proyecto. En este caso, es el precio global fijo de la Oferta Mercantil "
                    "que incluye todos los capitulos de obra, el AIU (Administracion, Imprevistos y Utilidad) "
                    "y el IVA sobre la utilidad.",
        fuente="Hoja 'Costo vs Venta' del archivo Excel 'Detallado caso de negocio_220126.xlsx' - "
               "Suma total de la columna VENTA de los 15 capitulos + AIU + Financiacion.",
        interpretacion="Este es el valor fijo que Consorcio Express pagara a PC Mejia por la totalidad de la obra. "
                       "No cambia a menos que se aprueben cambios contractuales (otrosies)."
    ))

    # --- 2.2 ACWP ---
    elements.append(Paragraph("2.2 Costo Real (ACWP)", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Costo Real",
        sigla="AC / ACWP",
        value="$ 8.530.521.315 COP",
        significado="El Actual Cost (AC) o ACWP (Actual Cost of Work Performed) es el costo total real "
                    "que se ha incurrido hasta la fecha de corte. Incluye todos los pagos efectuados a proveedores, "
                    "subcontratistas, nomina, materiales, equipos y demas gastos del proyecto.",
        fuente="Archivo Excel 'Proyeccion de Pagos Patio Sur.xlsx' — hoja 'Pagos Patio Sur (2)'. "
               "Suma de pagos reales realizados en Febrero 2026 ($7,526,804,818 — incluye importacion "
               "cargadores Starcharge $4.2B) y Marzo 2026 ($1,003,716,497).",
        interpretacion="Representa el 20.8% del presupuesto total ejecutado. El proyecto ha gastado $8.5B COP "
                       "de los $41B disponibles. El mayor desembolso fue en Feb 2026 por la importacion de "
                       "cargadores electricos Starcharge ($4.2B).",
        color=STEEL_900
    ))

    # --- 2.3 CPI ---
    elements.append(Paragraph("2.3 CPI - Indice de Rendimiento de Costo", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Indice de Rendimiento de Costo",
        sigla="CPI",
        value="1.54",
        significado="El CPI (Cost Performance Index) mide la eficiencia del costo. Se calcula como: "
                    "CPI = EV / AC = $13,124,123,034 / $8,530,521,315 = 1.54. "
                    "Un CPI > 1.0 indica que el proyecto esta gastando menos de lo presupuestado por unidad "
                    "de trabajo completado. Un CPI < 1.0 indica sobrecosto.",
        fuente="Calculado automaticamente con la formula EV/AC usando los valores de Valor Ganado "
               "y Costo Real (pagos reales del Excel de pagos).",
        interpretacion="CPI = 1.54 significa que por cada $1 COP gastado, se esta obteniendo $1.54 de valor. "
                       "El proyecto es MUY EFICIENTE en costos. Esto se debe a que los pagos reales ($8.5B) "
                       "son significativamente menores al valor del trabajo completado ($13.1B).",
        color=EMERALD
    ))

    # --- 2.4 SPI ---
    elements.append(Paragraph("2.4 SPI - Indice de Rendimiento de Cronograma", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Indice de Rendimiento de Cronograma",
        sigla="SPI",
        value="0.64",
        significado="El SPI (Schedule Performance Index) mide la eficiencia del cronograma. Se calcula como: "
                    "SPI = EV / PV = $13,124,123,034 / $20,506,442,241 = 0.64. "
                    "Un SPI > 1.0 indica que el proyecto esta adelantado. Un SPI < 1.0 indica retraso.",
        fuente="Calculado con la formula EV/PV. El PV (Valor Planificado) se estimo como ~50% del BAC, "
               "basado en que a Marzo 2026 se ha transcurrido aproximadamente la mitad del plazo contractual "
               "(inicio Oct 2025, fin previsto Jul 2026).",
        interpretacion="SPI = 0.64 indica que solo se ha completado el 64% del trabajo que deberia estar terminado "
                       "a la fecha. Hay una desviacion de -18% en cronograma. Las Islas 1, 2 y 3 tienen minimo "
                       "avance y se requiere un plan de aceleracion urgente.",
        color=RED
    ))

    elements.append(PageBreak())

    # =====================================================
    # SECTION 3: KPI ROW 2
    # =====================================================
    elements.append(Paragraph("3. Tarjetas KPI - Fila Secundaria", styles['SectionTitle']))
    elements.append(section_divider())

    # --- 3.1 EV ---
    elements.append(Paragraph("3.1 Valor Ganado (BCWP)", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Valor Ganado",
        sigla="EV / BCWP",
        value="$ 13.124.123.034 COP",
        significado="El Earned Value (EV) o BCWP (Budgeted Cost of Work Performed) representa el valor "
                    "presupuestado del trabajo que realmente se ha completado. Es decir, cuanto 'vale' segun "
                    "el presupuesto original lo que efectivamente se ha construido o entregado hasta la fecha.",
        fuente="Estimado a partir del avance fisico del proyecto (~32%) aplicado al BAC. Se correlaciona con "
               "los montos negociados y ejecutados de la hoja 'Ejecucion vs Caso de Negocio' del Excel.",
        interpretacion="Con $13.1B de valor ganado sobre $41B totales, el avance fisico real es del 32%. "
                       "Este valor es clave porque es el numerador tanto del CPI como del SPI."
    ))

    # --- 3.2 EAC ---
    elements.append(Paragraph("3.2 EAC - Estimacion a la Terminacion", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Estimacion a la Terminacion",
        sigla="EAC",
        value="$ 26.631.743.429 COP",
        significado="El EAC (Estimate at Completion) es la proyeccion del costo total que tendra el proyecto "
                    "al finalizar, basado en el rendimiento actual. Se calcula como: EAC = BAC / CPI = "
                    "$41,012,884,481 / 1.54 = $26,631,743,429. Tambien se muestra el VAC (Variance at Completion) = "
                    "BAC - EAC = $14,381,141,052, que indica el ahorro proyectado.",
        fuente="Calculado automaticamente: BAC / CPI. Asume que la eficiencia de costos actual se mantendra "
               "durante el resto del proyecto.",
        interpretacion="Si se mantiene el CPI actual de 1.54, el proyecto costara ~$26.6B en vez de $41B. "
                       "Esto representa un ahorro proyectado de ~$14.4B. Sin embargo, esta proyeccion asume "
                       "que los costos futuros mantendran la misma eficiencia, lo cual debe monitorearse.",
        color=EMERALD
    ))

    # --- 3.3 Facturas ---
    elements.append(Paragraph("3.3 Facturas Pendientes", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Facturas Pendientes",
        sigla="N/A",
        value="12 (3 vencidas)",
        significado="Indica la cantidad de facturas recibidas de proveedores y subcontratistas que aun no "
                    "han sido pagadas. Las facturas vencidas son aquellas que ya superaron su fecha limite de pago.",
        fuente="Datos de demostracion del modulo de Facturacion del sistema. En produccion, se alimentaria "
               "del sistema contable o ERP de la empresa.",
        interpretacion="12 facturas pendientes con 3 vencidas requiere atencion del area financiera para evitar "
                       "incumplimientos con proveedores y posibles intereses moratorios.",
        color=RED
    ))

    # --- 3.4 Alertas ---
    elements.append(Paragraph("3.4 Alertas Activas", styles['SubSection']))
    elements.extend(metric_block(styles,
        name="Alertas Activas",
        sigla="N/A",
        value="5 (3 criticas)",
        significado="Contador de alertas y riesgos activos del proyecto, clasificados por severidad: "
                    "criticas (rojo) y advertencias (amarillo). Las alertas criticas requieren accion inmediata.",
        fuente="Generadas a partir del analisis del cronograma MPP, el caso de negocio, y el analisis "
               "de flujo de caja del proyecto.",
        interpretacion="5 alertas activas con 3 criticas es un nivel de riesgo ALTO. Las alertas criticas "
                       "incluyen: exceso de plazo contractual, atraso en cronograma y margen negativo en "
                       "Compensacion Reactiva.",
        color=RED
    ))

    elements.append(PageBreak())

    # =====================================================
    # SECTION 4: CURVA S
    # =====================================================
    elements.append(Paragraph("4. Curva S - Avance del Proyecto", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "La Curva S es una representacion grafica del avance acumulado del proyecto a lo largo del tiempo. "
        "Muestra dos lineas: el avance planificado (azul) y el avance real (verde). La separacion entre "
        "ambas lineas indica la desviacion del cronograma.",
        styles['BodyText2']
    ))

    curva_data = [
        [Paragraph('<b>Elemento</b>', styles['TableHeader']),
         Paragraph('<b>Valor</b>', styles['TableHeader']),
         Paragraph('<b>Significado</b>', styles['TableHeader']),
         Paragraph('<b>Fuente</b>', styles['TableHeader'])],
        [Paragraph('Avance Planificado', styles['TableCellBold']),
         Paragraph('50.0%', styles['TableCell']),
         Paragraph('Porcentaje de trabajo que deberia estar completado a la fecha segun el cronograma', styles['TableCell']),
         Paragraph('Curva S del cronograma MPP (505 actividades)', styles['TableCell'])],
        [Paragraph('Avance Real', styles['TableCellBold']),
         Paragraph('32.0%', styles['TableCell']),
         Paragraph('Porcentaje de trabajo efectivamente completado', styles['TableCell']),
         Paragraph('Avance fisico ponderado por costo de cada partida', styles['TableCell'])],
        [Paragraph('Desviacion', styles['TableCellBold']),
         Paragraph('-18.0%', styles['TableCell']),
         Paragraph('Diferencia entre planificado y real. Negativo = retraso', styles['TableCell']),
         Paragraph('Calculo: Avance Real - Avance Planificado', styles['TableCell'])],
        [Paragraph('EV/PV (SPI)', styles['TableCellBold']),
         Paragraph('0.64', styles['TableCell']),
         Paragraph('Ratio de eficiencia del cronograma derivado de la curva', styles['TableCell']),
         Paragraph('Calculo: 32% / 50% = 0.64', styles['TableCell'])],
    ]
    ct = Table(curva_data, colWidths=[100, 55, 195, 150])
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, STEEL_200),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STEEL_50]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(ct)
    elements.append(Paragraph(
        'Fuente: Cronograma Microsoft Project del proyecto con 505 actividades. '
        'Periodo: Jun 2025 a Jul 2026.',
        styles['SourceNote']
    ))

    # =====================================================
    # SECTION 5: RESUMEN PRESUPUESTARIO
    # =====================================================
    elements.append(Paragraph("5. Resumen Presupuestario", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "El modulo de Resumen Presupuestario presenta una barra de consumo y cuatro tarjetas con los "
        "valores clave del estado financiero del proyecto.",
        styles['BodyText2']
    ))

    budget_data = [
        [Paragraph('<b>Metrica</b>', styles['TableHeader']),
         Paragraph('<b>Valor</b>', styles['TableHeader']),
         Paragraph('<b>Significado</b>', styles['TableHeader']),
         Paragraph('<b>Fuente</b>', styles['TableHeader'])],
        [Paragraph('Consumo del Presupuesto', styles['TableCellBold']),
         Paragraph('20.8%', styles['TableCell']),
         Paragraph('Porcentaje del presupuesto total que ya se ha gastado (AC/BAC)', styles['TableCell']),
         Paragraph('Calculo: $8.5B / $41B', styles['TableCell'])],
        [Paragraph('Presupuesto Vigente', styles['TableCellBold']),
         Paragraph('$41,012,884,481', styles['TableCell']),
         Paragraph('Presupuesto original + cambios aprobados. Sin cambios a la fecha', styles['TableCell']),
         Paragraph('Excel caso de negocio - Total Venta', styles['TableCell'])],
        [Paragraph('Disponible', styles['TableCellBold']),
         Paragraph('$27,853,465,858', styles['TableCell']),
         Paragraph('Presupuesto restante: Vigente - Comprometido', styles['TableCell']),
         Paragraph('Calculo: $41B - $13.2B comprometidos', styles['TableCell'])],
        [Paragraph('Comprometido', styles['TableCellBold']),
         Paragraph('$13,159,418,623', styles['TableCell']),
         Paragraph('Total de ordenes de compra y contratos firmados', styles['TableCell']),
         Paragraph('Excel: Ejecucion vs Caso Negocio - Total Negociado', styles['TableCell'])],
        [Paragraph('Costo Real', styles['TableCellBold']),
         Paragraph('$8,530,521,315', styles['TableCell']),
         Paragraph('Desembolsos efectivos realizados a la fecha', styles['TableCell']),
         Paragraph('Excel Pagos Patio Sur - Pagos Feb+Mar 2026', styles['TableCell'])],
    ]
    bt = Table(budget_data, colWidths=[110, 100, 180, 110])
    bt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, STEEL_200),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STEEL_50]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(bt)
    elements.append(Paragraph(
        'Ademas incluye un grafico de barras comparando: Original vs Vigente vs Comprometido vs Real vs Disponible.',
        styles['SourceNote']
    ))

    # =====================================================
    # SECTION 6: ALERTAS
    # =====================================================
    elements.append(Paragraph("6. Alertas del Proyecto", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "El panel de alertas muestra los riesgos y problemas activos del proyecto, clasificados por severidad.",
        styles['BodyText2']
    ))

    alertas = [
        ("CRITICA", "Cronograma MPP excede plazo contractual por 4 meses",
         "El cronograma Microsoft Project finaliza el 30 Jul 2026 (405 dias). La fecha contractual es 1 Abr 2026 (9 meses). "
         "Riesgo de clausula penal del 20% ($8.2B COP).",
         "Comparacion entre fecha fin del archivo .MPP y plazo contractual de la Oferta Mercantil."),
        ("CRITICA", "Atraso en cronograma: -18% desviacion",
         "Avance real (32%) vs planificado (50%). SPI = 0.64. Islas 1, 2 y 3 con minimo avance.",
         "Calculo EVM: SPI = EV/PV. Avance fisico reportado vs curva S planificada."),
        ("CRITICA", "Compensacion Reactiva: margen negativo",
         "El capitulo tiene margen de -37.4%. Costo estimado ($751.9M) supera venta ($547.2M).",
         "Hoja 'Costo vs Venta' del Excel: Capitulo Compensacion Reactiva."),
        ("ADVERTENCIA", "Flujo de caja negativo acumulado",
         "Pago total contra entrega. Financiacion acumulada de ~$8.5B COP a Mar 2026.",
         "Analisis de flujo de caja: forma de pago contractual (contra entrega) vs gastos mensuales."),
        ("ADVERTENCIA", "Procura con retrasos: Cargadores e Islas 2-3",
         "Cargadores Isla 2/3 no llegan hasta Abr 2026. Shelters Isla 3 hasta Abr 2026.",
         "Cronograma de procura y fechas de entrega de proveedores (Starcharge, Taesmet)."),
    ]

    for severity, title, desc, source in alertas:
        sev_style = styles['AlertCritical'] if severity == "CRITICA" else styles['AlertWarning']
        sev_bg = RED_BG if severity == "CRITICA" else AMBER_BG

        alert_data = [[
            Paragraph(f'<b>[{severity}]</b> {title}', sev_style),
        ], [
            Paragraph(desc, styles['BodyText2']),
        ], [
            Paragraph(f'Fuente: {source}', styles['SourceNote']),
        ]]
        at = Table(alert_data, colWidths=[500])
        at.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), sev_bg),
            ('ROUNDEDCORNERS', [4, 4, 4, 4]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 6),
        ]))
        elements.append(at)
        elements.append(Spacer(1, 4))

    elements.append(PageBreak())

    # =====================================================
    # SECTION 7: FLUJO DE CAJA
    # =====================================================
    elements.append(Paragraph("7. Flujo de Caja Mensual", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "El grafico de Flujo de Caja Mensual muestra la proyeccion de ingresos, egresos y flujo neto "
        "del proyecto mes a mes. Incluye lineas para valores proyectados y reales.",
        styles['BodyText2']
    ))

    fc_data = [
        [Paragraph('<b>Linea</b>', styles['TableHeader']),
         Paragraph('<b>Color</b>', styles['TableHeader']),
         Paragraph('<b>Significado</b>', styles['TableHeader']),
         Paragraph('<b>Fuente</b>', styles['TableHeader'])],
        [Paragraph('Ingreso Proyectado', styles['TableCellBold']),
         Paragraph('Azul claro', styles['TableCell']),
         Paragraph('Ingresos esperados por cobros al cliente segun cronograma de facturacion', styles['TableCell']),
         Paragraph('Proyeccion basada en hitos contractuales', styles['TableCell'])],
        [Paragraph('Ingreso Real', styles['TableCellBold']),
         Paragraph('Azul oscuro', styles['TableCell']),
         Paragraph('Ingresos efectivamente recibidos del cliente', styles['TableCell']),
         Paragraph('Registros contables / facturacion', styles['TableCell'])],
        [Paragraph('Egreso Proyectado', styles['TableCellBold']),
         Paragraph('Amarillo', styles['TableCell']),
         Paragraph('Gastos mensuales planificados (proveedores, nomina, materiales)', styles['TableCell']),
         Paragraph('Plan de pagos del caso de negocio', styles['TableCell'])],
        [Paragraph('Egreso Real', styles['TableCellBold']),
         Paragraph('Rojo', styles['TableCell']),
         Paragraph('Gastos efectivamente realizados cada mes', styles['TableCell']),
         Paragraph('Registros contables / tesoreria', styles['TableCell'])],
        [Paragraph('Neto Proyectado', styles['TableCellBold']),
         Paragraph('Verde claro', styles['TableCell']),
         Paragraph('Flujo neto = Ingresos - Egresos proyectados', styles['TableCell']),
         Paragraph('Calculo automatico', styles['TableCell'])],
        [Paragraph('Neto Real', styles['TableCellBold']),
         Paragraph('Verde oscuro', styles['TableCell']),
         Paragraph('Flujo neto real = Ingresos reales - Egresos reales', styles['TableCell']),
         Paragraph('Calculo automatico', styles['TableCell'])],
    ]
    fct = Table(fc_data, colWidths=[100, 65, 195, 140])
    fct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, STEEL_200),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STEEL_50]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(fct)

    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        "<b>Nota importante:</b> El proyecto tiene forma de pago 'total contra entrega', lo que significa "
        "que no se reciben ingresos hasta la entrega final (proyectada en Jul 2026). Esto genera un flujo "
        "de caja negativo sostenido durante toda la ejecucion, con una financiacion acumulada de ~$8.5B COP.",
        styles['BodyText2']
    ))

    # =====================================================
    # SECTION 8: RESUMEN CONTRATO
    # =====================================================
    elements.append(Paragraph("8. Resumen del Contrato", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "Esta seccion muestra los datos contractuales fundamentales extraidos de la Oferta Mercantil.",
        styles['BodyText2']
    ))

    contrato_data = [
        [Paragraph('<b>Campo</b>', styles['TableHeader']),
         Paragraph('<b>Valor</b>', styles['TableHeader']),
         Paragraph('<b>Significado</b>', styles['TableHeader']),
         Paragraph('<b>Fuente</b>', styles['TableHeader'])],
        [Paragraph('Oferente', styles['TableCellBold']),
         Paragraph('PC Mejia Ingenieria S.A.\nNIT: 811.025.231-5', styles['TableCell']),
         Paragraph('Empresa que ejecuta la obra', styles['TableCell']),
         Paragraph('Oferta Mercantil', styles['TableCell'])],
        [Paragraph('Aceptante', styles['TableCellBold']),
         Paragraph('Consorcio Express S.A.S.\nNIT: 900.365.740-3', styles['TableCell']),
         Paragraph('Cliente que contrata y pagara la obra', styles['TableCell']),
         Paragraph('Oferta Mercantil', styles['TableCell'])],
        [Paragraph('Objeto', styles['TableCellBold']),
         Paragraph('Estudios, Disenos, Construccion, Instalacion, Pruebas y Puesta en Marcha de la IRE', styles['TableCell']),
         Paragraph('Alcance completo del proyecto', styles['TableCell']),
         Paragraph('Oferta Mercantil - Clausula Objeto', styles['TableCell'])],
        [Paragraph('Capacidad', styles['TableCellBold']),
         Paragraph('Min. 10 buses articulados + 45 buses duales', styles['TableCell']),
         Paragraph('Capacidad minima de recarga electrica simultanea', styles['TableCell']),
         Paragraph('Especificaciones tecnicas del contrato', styles['TableCell'])],
        [Paragraph('Forma de Pago', styles['TableCellBold']),
         Paragraph('Pago total contra entrega', styles['TableCell']),
         Paragraph('100% del valor se paga al entregar la obra completa. Sin anticipos', styles['TableCell']),
         Paragraph('Oferta Mercantil - Clausula de Pago', styles['TableCell'])],
        [Paragraph('Clausula Penal', styles['TableCellBold']),
         Paragraph('20% = $8,202,576,896', styles['TableCell']),
         Paragraph('Penalidad por incumplimiento del plazo contractual', styles['TableCell']),
         Paragraph('Oferta Mercantil - Clausula Penal', styles['TableCell'])],
        [Paragraph('Garantias', styles['TableCellBold']),
         Paragraph('Cumplimiento 20% | Salarios 10% | Calidad 20% | Estabilidad 30% | RC 20%', styles['TableCell']),
         Paragraph('Polizas de seguro requeridas para la ejecucion', styles['TableCell']),
         Paragraph('Oferta Mercantil - Clausula Garantias', styles['TableCell'])],
        [Paragraph('Margen Estimado', styles['TableCellBold']),
         Paragraph('28.2% ($11,555,720,094)', styles['TableCell']),
         Paragraph('Diferencia entre valor de venta y costo total estimado', styles['TableCell']),
         Paragraph('Excel: Total Venta - Total Costo', styles['TableCell'])],
    ]
    ctt = Table(contrato_data, colWidths=[80, 140, 145, 135])
    ctt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, STEEL_200),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STEEL_50]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(ctt)

    elements.append(PageBreak())

    # =====================================================
    # SECTION 9: EVM TABLE
    # =====================================================
    elements.append(Paragraph("9. Analisis de Valor Ganado (EVM)", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "La tabla de Analisis de Valor Ganado (Earned Value Management) presenta los 7 indicadores "
        "fundamentales del EVM segun el estandar PMI/PMBOK. Es la herramienta principal para medir "
        "el rendimiento integrado de costo y cronograma del proyecto.",
        styles['BodyText2']
    ))

    evm_data = [
        [Paragraph('<b>Indicador</b>', styles['TableHeader']),
         Paragraph('<b>Sigla</b>', styles['TableHeader']),
         Paragraph('<b>Formula</b>', styles['TableHeader']),
         Paragraph('<b>Valor</b>', styles['TableHeader']),
         Paragraph('<b>Interpretacion</b>', styles['TableHeader'])],
        [Paragraph('Presupuesto a la\nTerminacion', styles['TableCell']),
         Paragraph('BAC', styles['TableCellBold']),
         Paragraph('Precio global fijo', styles['TableCell']),
         Paragraph('$41,012,884,481', styles['TableCellBold']),
         Paragraph('Valor total de la oferta. No cambia salvo otrosies', styles['TableCell'])],
        [Paragraph('Valor Planificado', styles['TableCell']),
         Paragraph('PV / BCWS', styles['TableCellBold']),
         Paragraph('% planificado x BAC', styles['TableCell']),
         Paragraph('$20,506,442,241', styles['TableCellBold']),
         Paragraph('50% del BAC - Trabajo que debia estar hecho a Mar 2026', styles['TableCell'])],
        [Paragraph('Valor Ganado', styles['TableCell']),
         Paragraph('EV / BCWP', styles['TableCellBold']),
         Paragraph('% completado x BAC', styles['TableCell']),
         Paragraph('$13,124,123,034', styles['TableCellBold']),
         Paragraph('32% del BAC - Trabajo realmente completado a la fecha', styles['TableCell'])],
        [Paragraph('Costo Real', styles['TableCell']),
         Paragraph('AC / ACWP', styles['TableCellBold']),
         Paragraph('Suma de gastos reales', styles['TableCell']),
         Paragraph('$8,530,521,315', styles['TableCellBold']),
         Paragraph('Lo que realmente se ha desembolsado hasta la fecha', styles['TableCell'])],
        [Paragraph('Indice Rend. Costo', styles['TableCell']),
         Paragraph('CPI', styles['TableCellBold']),
         Paragraph('EV / AC', styles['TableCell']),
         Paragraph('1.54', ParagraphStyle('evm_green', parent=styles['TableCellBold'], textColor=EMERALD)),
         Paragraph('EFICIENTE: cada $1 gastado produce $1.54 de valor', styles['TableCell'])],
        [Paragraph('Indice Rend. Cronograma', styles['TableCell']),
         Paragraph('SPI', styles['TableCellBold']),
         Paragraph('EV / PV', styles['TableCell']),
         Paragraph('0.64', ParagraphStyle('evm_red', parent=styles['TableCellBold'], textColor=RED)),
         Paragraph('RETRASADO: solo 64% del trabajo planificado completado', styles['TableCell'])],
        [Paragraph('Estimacion a la\nTerminacion', styles['TableCell']),
         Paragraph('EAC', styles['TableCellBold']),
         Paragraph('BAC / CPI', styles['TableCell']),
         Paragraph('$26,631,743,429', styles['TableCellBold']),
         Paragraph('Costo total estimado. Por debajo del BAC gracias al CPI', styles['TableCell'])],
    ]
    evmt = Table(evm_data, colWidths=[85, 55, 80, 95, 185])
    evmt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, STEEL_200),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STEEL_50]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        # Highlight CPI row
        ('BACKGROUND', (0, 5), (-1, 5), EMERALD_BG),
        # Highlight SPI row
        ('BACKGROUND', (0, 6), (-1, 6), RED_BG),
    ]))
    elements.append(evmt)

    elements.append(Spacer(1, 12))

    # EVM Summary box
    summary_text = (
        "<b>Resumen Ejecutivo EVM:</b> El proyecto presenta un escenario mixto. "
        "En terminos de costo (CPI=1.54), el proyecto es muy eficiente y esta generando ahorros significativos. "
        "Sin embargo, en cronograma (SPI=0.64) existe un retraso significativo del 36%. "
        "La recomendacion es implementar un plan de aceleracion que mantenga la eficiencia de costos "
        "mientras se recupera el cronograma. El EAC de $26.6B sugiere un ahorro potencial de $14.4B."
    )
    sum_data = [[Paragraph(summary_text, ParagraphStyle(
        'sum', fontName='Helvetica', fontSize=9, textColor=PRIMARY_DARK, leading=13
    ))]]
    sumt = Table(sum_data, colWidths=[500])
    sumt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_BG),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(sumt)

    elements.append(PageBreak())

    # =====================================================
    # SECTION 10: FUENTES DE DATOS
    # =====================================================
    elements.append(Paragraph("10. Fuentes de Datos", styles['SectionTitle']))
    elements.append(section_divider())

    elements.append(Paragraph(
        "A continuacion se detallan todas las fuentes de informacion utilizadas para alimentar "
        "las metricas y valores mostrados en el Dashboard del proyecto:",
        styles['BodyText2']
    ))

    fuentes = [
        ("Oferta Mercantil",
         "Documento contractual entre PC Mejia Ingenieria S.A. y Consorcio Express S.A.S. "
         "Define: objeto, valor ($41B), plazo (9 meses), forma de pago, clausula penal, garantias."),
        ("Excel: Detallado caso de negocio_220126.xlsx",
         "Archivo de 16 hojas con el analisis financiero completo del proyecto. "
         "Hojas principales: 'Costo vs Venta' (15 capitulos con desglose), "
         "'Ejecucion vs Caso de Negocio' (estado de procura por capitulo), "
         "'Admon Patios' (desglose AIU y costos indirectos)."),
        ("Cronograma Microsoft Project (.MPP)",
         "Archivo de proyecto con 505 actividades que define la planificacion temporal. "
         "Genera la Curva S, las fechas hito, y permite calcular el avance planificado (PV). "
         "Fecha fin actual: 30 Jul 2026 (excede el contractual por 4 meses)."),
        ("Excel: Proyeccion de Pagos Patio Sur.xlsx",
         "Archivo con 6 hojas que contiene los pagos reales del proyecto. "
         "Pagos Feb 2026: $7,526,804,818 (incluye Starcharge $4.2B). Pagos Mar 2026: $1,003,716,497. "
         "Total AC = $8,530,521,315. Incluye hoja CREDITO con datos de financiacion real ($17B, IBR+2.85, "
         "interes $2.211B)."),
        ("Modulo de Facturacion (Demo)",
         "Datos de demostracion del sistema para facturas pendientes y vencidas. "
         "En produccion se integraria con el ERP o sistema contable."),
        ("Calculos EVM Automaticos",
         "Los indicadores CPI, SPI, EAC, VAC se calculan automaticamente usando las formulas "
         "estandar del PMBOK/PMI a partir de los valores base BAC, PV, EV y AC."),
    ]

    for i, (nombre, desc) in enumerate(fuentes):
        num = i + 1
        f_data = [[
            Paragraph(f'<b>{num}. {nombre}</b>', ParagraphStyle(
                'fn', fontName='Helvetica-Bold', fontSize=10, textColor=PRIMARY_BLUE
            )),
        ], [
            Paragraph(desc, styles['BodyText2']),
        ]]
        ft = Table(f_data, colWidths=[500])
        ft.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), PRIMARY_BG),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(ft)
        elements.append(Spacer(1, 4))

    elements.append(Spacer(1, 20))

    # Disclaimer
    disclaimer = (
        "<b>NOTA:</b> El AC (Costo Real) de $8,530,521,315 proviene de los pagos reales registrados en el "
        "Excel de Proyeccion de Pagos (Feb y Mar 2026). Los valores de PV (Valor Planificado) y EV (Valor Ganado) "
        "son estimaciones basadas en el avance fisico y el cronograma MPP. "
        "Para mayor precision se requiere: (1) medicion de avance fisico ponderado para el EV, y "
        "(2) distribucion de costos por actividad en el cronograma para el PV."
    )
    disc_data = [[Paragraph(disclaimer, ParagraphStyle(
        'disc', fontName='Helvetica', fontSize=8.5, textColor=AMBER, leading=12
    ))]]
    disct = Table(disc_data, colWidths=[500])
    disct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), AMBER_BG),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 1, AMBER),
    ]))
    elements.append(disct)

    return elements


# ============================================================
# MAIN
# ============================================================
def main():
    doc = DashboardReportDoc(
        OUTPUT_PATH,
        pagesize=letter,
        topMargin=65,
        bottomMargin=45,
        leftMargin=40,
        rightMargin=40,
    )

    styles = get_styles()
    elements = []

    # Build all sections
    elements.extend(build_cover(styles))
    elements.extend(build_toc(styles))
    elements.extend(build_content(styles))

    # Build PDF
    doc.build(elements)
    print(f"PDF generado exitosamente: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
