#!/usr/bin/env python3
"""
Genera informe PDF del Flujo de Caja — PC Mejia Ingenieria S.A.
Proyecto: Patio de Operacion Sur
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
import datetime

# ============================================================
# CORPORATE COLORS
# ============================================================
PRIMARY = HexColor('#1B5EAB')
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
VIOLET = HexColor('#7C3AED')
VIOLET_BG = HexColor('#F5F3FF')
WHITE = HexColor('#FFFFFF')

OUTPUT = "/Users/rosmel/PC Mejiaa/Proyecto Patio Sur/docs/Informe_FlujoDeCaja_Metricas.pdf"


# ============================================================
# DOCUMENT CLASS
# ============================================================
class ReportDoc(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='normal')
        template = PageTemplate(id='main', frames=frame, onPage=self._hf)
        self.addPageTemplates([template])

    def _hf(self, c, doc):
        c.saveState()
        w, h = letter
        # Header
        c.setFillColor(PRIMARY)
        c.rect(0, h - 50, w, 50, fill=True, stroke=False)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(30, h - 33, "PC MEJIA INGENIERIA S.A.")
        c.setFont("Helvetica", 8)
        c.drawString(30, h - 45, "Informe de Metricas — Flujo de Caja")
        c.drawRightString(w - 30, h - 33, "Patio de Operacion Sur")
        c.drawRightString(w - 30, h - 45, f"Fecha: {datetime.date.today().strftime('%d/%m/%Y')}")
        # Footer
        c.setFillColor(STEEL_200)
        c.rect(0, 0, w, 30, fill=True, stroke=False)
        c.setFillColor(STEEL_500)
        c.setFont("Helvetica", 7)
        c.drawString(30, 12, "CONFIDENCIAL - PC Mejia Ingenieria S.A.")
        c.drawRightString(w - 30, 12, f"Pagina {doc.page}")
        c.restoreState()


# ============================================================
# STYLES
# ============================================================
def S():
    from reportlab.lib.styles import getSampleStyleSheet
    s = getSampleStyleSheet()
    defs = {
        'CoverTitle': dict(fontName='Helvetica-Bold', fontSize=28, textColor=PRIMARY, alignment=TA_CENTER, spaceAfter=10),
        'CoverSub': dict(fontName='Helvetica', fontSize=14, textColor=STEEL_500, alignment=TA_CENTER, spaceAfter=6),
        'SecTitle': dict(fontName='Helvetica-Bold', fontSize=16, textColor=PRIMARY, spaceBefore=18, spaceAfter=10),
        'SubSec': dict(fontName='Helvetica-Bold', fontSize=12, textColor=STEEL_900, spaceBefore=14, spaceAfter=6),
        'Body': dict(fontName='Helvetica', fontSize=9.5, textColor=STEEL_700, alignment=TA_JUSTIFY, spaceAfter=6, leading=13),
        'Src': dict(fontName='Helvetica-Oblique', fontSize=8, textColor=STEEL_400, spaceBefore=4, spaceAfter=8, leftIndent=10),
        'TH': dict(fontName='Helvetica-Bold', fontSize=8, textColor=WHITE, alignment=TA_CENTER),
        'TC': dict(fontName='Helvetica', fontSize=8, textColor=STEEL_700, leading=11),
        'TCB': dict(fontName='Helvetica-Bold', fontSize=8, textColor=STEEL_900, leading=11),
        'TCR': dict(fontName='Helvetica', fontSize=8, textColor=STEEL_700, alignment=TA_RIGHT, leading=11),
        'TCBR': dict(fontName='Helvetica-Bold', fontSize=8, textColor=STEEL_900, alignment=TA_RIGHT, leading=11),
        'Note': dict(fontName='Helvetica-Oblique', fontSize=7.5, textColor=STEEL_400, spaceBefore=6),
    }
    for name, kw in defs.items():
        s.add(ParagraphStyle(name=name, **kw))
    return s


def divider():
    return HRFlowable(width="100%", thickness=1.5, color=PRIMARY_LIGHT, spaceBefore=6, spaceAfter=6)

def thin_div():
    return HRFlowable(width="100%", thickness=0.5, color=STEEL_200, spaceBefore=4, spaceAfter=4)


def metric_block(st, sigla, name, value, significado, fuente, interpretacion="", color=None):
    els = []
    vc = color or PRIMARY
    hd = [[
        Paragraph(f'<b>{sigla}</b> — {name}', ParagraphStyle('mn', fontName='Helvetica-Bold', fontSize=10, textColor=STEEL_900)),
        Paragraph(f'<b>{value}</b>', ParagraphStyle('mv', fontName='Helvetica-Bold', fontSize=10, textColor=vc, alignment=TA_RIGHT)),
    ]]
    ht = Table(hd, colWidths=[350, 150])
    ht.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), STEEL_50),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (0,-1), 10), ('RIGHTPADDING', (-1,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    els.append(ht)
    els.append(Spacer(1, 4))
    els.append(Paragraph(f'<b>Significado:</b> {significado}', st['Body']))
    if interpretacion:
        els.append(Paragraph(f'<b>Interpretacion en el proyecto:</b> {interpretacion}', st['Body']))
    els.append(Paragraph(f'Fuente: {fuente}', st['Src']))
    els.append(Spacer(1, 6))
    return els


def std_table(data, widths):
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, STEEL_200),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, STEEL_50]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t


# ============================================================
# COVER
# ============================================================
def cover(st):
    e = []
    e.append(Spacer(1, 120))
    cd = [[Paragraph("INFORME DE METRICAS", ParagraphStyle('ct', fontName='Helvetica-Bold', fontSize=12, textColor=WHITE, alignment=TA_CENTER))]]
    ct = Table(cd, colWidths=[300])
    ct.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), PRIMARY), ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10), ('ALIGN', (0,0), (-1,-1), 'CENTER')]))
    e.append(ct)
    e.append(Spacer(1, 30))
    e.append(Paragraph("Flujo de Caja del Proyecto", st['CoverTitle']))
    e.append(Paragraph("Patio de Operacion Sur", st['CoverSub']))
    e.append(Spacer(1, 20))
    e.append(Paragraph("PC Mejia Ingenieria S.A.", ParagraphStyle('cn', fontName='Helvetica-Bold', fontSize=14, textColor=PRIMARY_DARK, alignment=TA_CENTER)))
    e.append(Spacer(1, 10))

    info = [
        ["Proyecto:", "Patio de Operacion Sur (OE 1035)"],
        ["Cliente:", "Consorcio Express S.A.S."],
        ["Contratista:", "PC Mejia Ingenieria S.A."],
        ["Fuente de Datos:", "Proyeccion de Pagos Patio Sur.xlsx (6 hojas)"],
        ["Credito:", "$17,000,000,000 a IBR+2.85 (13.65% EA)"],
        ["Fecha del Informe:", datetime.date.today().strftime('%d de %B de %Y')],
    ]
    it = Table(info, colWidths=[140, 320])
    it.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'), ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,0), (0,-1), STEEL_500), ('TEXTCOLOR', (1,0), (1,-1), STEEL_900),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, STEEL_200),
    ]))
    e.append(Spacer(1, 20))
    e.append(it)
    e.append(Spacer(1, 40))
    e.append(Paragraph(
        "Este documento describe cada metrica e indicador del modulo de Flujo de Caja, "
        "explicando su significado, la fuente de datos, la interpretacion gerencial y "
        "el impacto financiero en el proyecto Patio de Operacion Sur.",
        ParagraphStyle('desc', fontName='Helvetica-Oblique', fontSize=9, textColor=STEEL_500, alignment=TA_CENTER, leading=13)
    ))
    e.append(PageBreak())
    return e


# ============================================================
# TOC
# ============================================================
def toc(st):
    e = [Paragraph("Tabla de Contenido", st['SecTitle']), divider()]
    items = [
        ("1.", "Contexto Financiero del Proyecto", "3"),
        ("2.", "Tarjetas KPI — Indicadores de Liquidez", "3"),
        ("  2.1", "Total Egresos Reales", "3"),
        ("  2.2", "Total Egresos Proyectados", "4"),
        ("  2.3", "Ingreso Proyectado Total", "4"),
        ("  2.4", "Exposicion Maxima de Caja", "4"),
        ("3.", "Grafico de Flujo de Caja Mensual", "5"),
        ("  3.1", "Lineas del Grafico", "5"),
        ("  3.2", "Interpretacion Visual", "5"),
        ("4.", "Tabla de Detalle Mensual", "6"),
        ("5.", "Financiacion y Credito Bancario", "7"),
        ("  5.1", "Credito Bancario ($17B)", "7"),
        ("  5.2", "Costo Financiero Real vs Estimado", "7"),
        ("6.", "Analisis de Riesgo de Liquidez", "8"),
        ("7.", "Fuentes de Datos", "9"),
    ]
    data = []
    for num, title, pg in items:
        indent = "    " if num.startswith("  ") else ""
        fn = 'Helvetica' if num.startswith("  ") else 'Helvetica-Bold'
        fs = 8.5 if num.startswith("  ") else 9.5
        data.append([
            Paragraph(f'{indent}{num.strip()}', ParagraphStyle('tn', fontName=fn, fontSize=fs, textColor=STEEL_500)),
            Paragraph(title, ParagraphStyle('tt', fontName=fn, fontSize=fs, textColor=STEEL_900)),
            Paragraph(pg, ParagraphStyle('tp', fontName='Helvetica', fontSize=fs, textColor=STEEL_400, alignment=TA_RIGHT)),
        ])
    tt = Table(data, colWidths=[40, 380, 40])
    tt.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, STEEL_100),
    ]))
    e.append(tt)
    e.append(PageBreak())
    return e


# ============================================================
# CONTENT
# ============================================================
def content(st):
    e = []

    # ==== SECTION 1: CONTEXT ====
    e.append(Paragraph("1. Contexto Financiero del Proyecto", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "El proyecto Patio de Operacion Sur tiene una estructura financiera particular que hace "
        "del flujo de caja uno de los indicadores mas criticos para la gerencia:",
        st['Body']
    ))

    ctx_data = [
        [Paragraph('<b>Aspecto</b>', st['TH']),
         Paragraph('<b>Detalle</b>', st['TH']),
         Paragraph('<b>Impacto en Flujo de Caja</b>', st['TH'])],
        [Paragraph('Forma de Pago', st['TCB']),
         Paragraph('Pago total contra entrega', st['TC']),
         Paragraph('No hay ingresos hasta completar la obra (Jul 2026). Flujo 100% negativo durante ejecucion.', st['TC'])],
        [Paragraph('Valor de la Obra', st['TCB']),
         Paragraph('$41,012,884,481 COP', st['TC']),
         Paragraph('Ingreso unico al finalizar. Debe financiarse toda la ejecucion con credito.', st['TC'])],
        [Paragraph('Plazo', st['TCB']),
         Paragraph('9 meses (Oct 2025 - Jul 2026)', st['TC']),
         Paragraph('9 meses de egresos sin ingresos. Cada mes de retraso genera costo financiero adicional.', st['TC'])],
        [Paragraph('Financiacion', st['TCB']),
         Paragraph('Credito $17B a IBR+2.85', st['TC']),
         Paragraph('Tasa del 13.65% EA. Interes total: $2,211,000,000 (61% mas que el estimado de $1,375M).', st['TC'])],
        [Paragraph('Clausula Penal', st['TCB']),
         Paragraph('20% = $8,202,576,896', st['TC']),
         Paragraph('Si no se entrega a tiempo, ademas del sobrecosto financiero hay riesgo de penalidad.', st['TC'])],
    ]
    e.append(std_table(ctx_data, [100, 170, 230]))
    e.append(Paragraph(
        'Fuente: Oferta Mercantil PC Mejia a Consorcio Express, hoja "CREDITO" del Excel de Pagos.',
        st['Src']
    ))

    # ==== SECTION 2: KPI CARDS ====
    e.append(Paragraph("2. Tarjetas KPI — Indicadores de Liquidez", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "Las cuatro tarjetas KPI superiores del modulo de Flujo de Caja presentan los indicadores "
        "clave de liquidez y posicion financiera del proyecto. Permiten al gerente evaluar "
        "rapidamente el estado de caja y la necesidad de financiacion.",
        st['Body']
    ))

    # 2.1
    e.append(Paragraph("2.1 Total Egresos Reales", st['SubSec']))
    e.extend(metric_block(st, "ER", "Total Egresos Reales",
        "$ 8.530.521.315 COP",
        "Suma de todos los pagos efectivamente realizados a proveedores, subcontratistas, bancos y "
        "terceros desde el inicio del proyecto hasta la fecha de corte (Mar 2026). "
        "Incluye: importacion de equipos, obras civiles, nomina, seguros, intereses bancarios "
        "y cualquier otro desembolso registrado en tesoreria.",
        "Excel 'Proyeccion de Pagos Patio Sur.xlsx' — Hoja 'Pagos Patio Sur (2)', columnas R "
        "(Feb 2026: $7,526,804,818) y S (Mar 2026: $1,003,716,497). Detalle en hoja 'Otros Pagos': "
        "Proyecto $7.5B + Bancos $3.5B + Terceros $3.8B.",
        "El 88% del desembolso total se concentro en Febrero 2026, principalmente por la importacion "
        "de cargadores electricos Starcharge ($4.2B COP). Esta concentracion genero un pico de necesidad "
        "de caja que requirio utilizacion inmediata del credito bancario.",
        color=RED
    ))

    # 2.2
    e.append(Paragraph("2.2 Total Egresos Proyectados", st['SubSec']))
    e.extend(metric_block(st, "EP", "Total Egresos Proyectados",
        "$ 19.762.759.238 COP",
        "Suma total de todos los egresos planificados para los 12 meses de ejecucion del proyecto "
        "(Oct 2025 - Sep 2026). Incluye los pagos reales ya realizados (Feb-Mar: $8.5B) mas las "
        "proyecciones de pagos futuros (Abr-Sep: $11.2B). Este valor representa el costo total "
        "de ejecucion sin incluir costos indirectos de administracion ni financieros.",
        "Excel 'Proyeccion de Pagos' — Hoja 'Pagos Patio Sur (2)'. Columnas R-S (datos reales) + "
        "columnas T-Z (proyecciones mensuales Abr-Sep 2026). Las proyecciones se basan en el "
        "cronograma de compras y los contratos firmados con proveedores.",
        "Este valor es menor al costo total del caso de negocio ($24.3B costo directo) porque "
        "algunas partidas aun no tienen fecha de pago definida y los ahorros en compras reducen "
        "los desembolsos proyectados.",
        color=AMBER
    ))

    e.append(PageBreak())

    # 2.3
    e.append(Paragraph("2.3 Ingreso Proyectado Total", st['SubSec']))
    e.extend(metric_block(st, "IP", "Ingreso Proyectado Total",
        "$ 41.012.884.481 COP",
        "Valor total que PC Mejia recibira de Consorcio Express al completar la obra. "
        "Es el precio global fijo de la Oferta Mercantil. Este ingreso se recibe en un solo pago "
        "al momento de la entrega y aceptacion final de la obra completa.",
        "Oferta Mercantil PC Mejia a Consorcio Express S.A.S. El valor esta definido en el contrato "
        "y no cambia salvo que se aprueben otrosies (adiciones contractuales). El pago esta "
        "proyectado para Jul 2026 (mes 9 del plazo contractual).",
        "La entrada de $41B en Jul 2026 genera un flujo neto positivo de +$39B en ese mes, "
        "suficiente para cubrir todos los egresos restantes, el costo financiero y dejar el margen "
        "neto del proyecto. Si la obra se retrasa, este ingreso se posterga.",
        color=EMERALD
    ))

    # 2.4
    e.append(Paragraph("2.4 Exposicion Maxima de Caja", st['SubSec']))
    e.extend(metric_block(st, "EMC", "Exposicion Maxima de Caja",
        "$ 15.108.264.955 COP",
        "Maximo acumulado de flujo negativo (egresos sin ingresos) que alcanza el proyecto antes "
        "de recibir el pago del cliente. Representa la cantidad maxima de financiacion externa "
        "que PC Mejia necesita cubrir simultaneamente con capital propio o creditos bancarios. "
        "Se calcula como la suma acumulada de egresos proyectados desde Oct 2025 hasta Jun 2026 "
        "(el mes anterior al pago).",
        "Calculo acumulado de la columna 'Egreso Proyectado' de Oct 2025 a Jun 2026. "
        "Dato derivado del Excel 'Proyeccion de Pagos Patio Sur.xlsx'.",
        "La exposicion de $15.1B es cubierta por el credito bancario de $17B, dejando un margen "
        "de maniobra de ~$1.9B. Si los costos se incrementan o hay retrasos significativos, "
        "el credito podria resultar insuficiente, requiriendo ampliacion.",
        color=PRIMARY
    ))

    # ==== SECTION 3: CHART ====
    e.append(Paragraph("3. Grafico de Flujo de Caja Mensual", st['SecTitle']))
    e.append(divider())

    e.append(Paragraph("3.1 Lineas del Grafico", st['SubSec']))
    e.append(Paragraph(
        "El grafico de lineas muestra 6 series de datos que representan los movimientos financieros "
        "del proyecto mes a mes. Las lineas punteadas son proyecciones y las solidas son datos reales.",
        st['Body']
    ))

    lines_data = [
        [Paragraph('<b>Linea</b>', st['TH']),
         Paragraph('<b>Color</b>', st['TH']),
         Paragraph('<b>Tipo</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH']),
         Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Ingreso Proyectado', st['TCB']), Paragraph('Azul claro', st['TC']),
         Paragraph('Punteada', st['TC']),
         Paragraph('$0 todos los meses excepto Jul 2026 ($41B)', st['TC']),
         Paragraph('Oferta Mercantil — pago contra entrega', st['TC'])],
        [Paragraph('Ingreso Real', st['TCB']), Paragraph('Azul oscuro', st['TC']),
         Paragraph('Solida', st['TC']),
         Paragraph('$0 a Mar 2026. Sin ingresos del cliente', st['TC']),
         Paragraph('Registros contables', st['TC'])],
        [Paragraph('Egreso Proyectado', st['TCB']), Paragraph('Amarillo', st['TC']),
         Paragraph('Punteada', st['TC']),
         Paragraph('Gastos mensuales planificados a proveedores', st['TC']),
         Paragraph('Excel Pagos — columnas de proyeccion', st['TC'])],
        [Paragraph('Egreso Real', st['TCB']), Paragraph('Rojo', st['TC']),
         Paragraph('Solida', st['TC']),
         Paragraph('Feb: $7.5B, Mar: $1.0B. Pagos efectivos', st['TC']),
         Paragraph('Excel Pagos — cols R, S', st['TC'])],
        [Paragraph('Neto Proyectado', st['TCB']), Paragraph('Verde claro', st['TC']),
         Paragraph('Punteada', st['TC']),
         Paragraph('Ingreso - Egreso mensual. Negativo 11/12 meses', st['TC']),
         Paragraph('Calculo automatico', st['TC'])],
        [Paragraph('Neto Real', st['TCB']), Paragraph('Verde oscuro', st['TC']),
         Paragraph('Solida', st['TC']),
         Paragraph('Acumulado real: -$8.5B a Mar 2026', st['TC']),
         Paragraph('Calculo automatico', st['TC'])],
    ]
    e.append(std_table(lines_data, [90, 60, 50, 170, 130]))

    e.append(Spacer(1, 8))
    e.append(Paragraph("3.2 Interpretacion Visual", st['SubSec']))
    e.append(Paragraph(
        "El grafico muestra un patron tipico de un proyecto con 'pago contra entrega': una linea "
        "de egresos descendente (gastos constantes) con ingresos en cero, generando un neto negativo "
        "sostenido. El pico de egreso en Feb 2026 ($7.5B) destaca por la importacion de cargadores. "
        "En Jul 2026 se observa el unico punto positivo: el ingreso de $41B que invierte completamente "
        "la posicion de caja. Los meses Ago-Sep 2026 muestran egresos residuales menores.",
        st['Body']
    ))
    e.append(Paragraph(
        'Fuente: Todos los datos del grafico provienen del Excel "Proyeccion de Pagos Patio Sur.xlsx".',
        st['Src']
    ))

    e.append(PageBreak())

    # ==== SECTION 4: DETAIL TABLE ====
    e.append(Paragraph("4. Tabla de Detalle Mensual", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "La tabla de detalle presenta 7 columnas de informacion financiera para cada mes del proyecto, "
        "mas una columna de alerta que indica los periodos con flujo negativo.",
        st['Body']
    ))

    col_data = [
        [Paragraph('<b>Columna</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH']),
         Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Periodo', st['TCB']),
         Paragraph('Mes y ano del flujo. 12 meses: Oct 2025 a Sep 2026. Los primeros 4 meses (Oct-Ene) '
                    'son periodo de movilizacion con actividad minima.', st['TC']),
         Paragraph('Cronograma del proyecto', st['TC'])],
        [Paragraph('Ing. Proyectado', st['TCB']),
         Paragraph('Ingresos esperados del cliente en el mes. $0 en todos los meses excepto Jul 2026 ($41B) '
                    'por la condicion contractual de pago contra entrega.', st['TC']),
         Paragraph('Oferta Mercantil', st['TC'])],
        [Paragraph('Ing. Real', st['TCB']),
         Paragraph('Ingresos efectivamente recibidos. A Mar 2026: $0. El cliente no ha realizado ningun pago.', st['TC']),
         Paragraph('Contabilidad / Tesoreria', st['TC'])],
        [Paragraph('Egr. Proyectado', st['TCB']),
         Paragraph('Pagos planificados a proveedores, subcontratistas y costos operativos del mes. '
                    'Feb 2026 es el mes con mayor egreso ($7.5B por cargadores).', st['TC']),
         Paragraph('Excel Pagos — Proyecciones', st['TC'])],
        [Paragraph('Egr. Real', st['TCB']),
         Paragraph('Pagos efectivamente realizados. Feb: $7,526,804,818 (Starcharge $4.2B, bancos $3.5B). '
                    'Mar: $1,003,716,497 (subcontratistas, materiales).', st['TC']),
         Paragraph('Hoja "Otros Pagos" del Excel', st['TC'])],
        [Paragraph('Neto Proyectado', st['TCB']),
         Paragraph('Ingreso Proyectado - Egreso Proyectado del mes. Negativo indica "quema de caja". '
                    'Solo Jul 2026 es positivo (+$39B).', st['TC']),
         Paragraph('Calculo automatico', st['TC'])],
        [Paragraph('Neto Real', st['TCB']),
         Paragraph('Ingreso Real - Egreso Real del mes. Acumulado a Mar 2026: -$8,530,521,315.', st['TC']),
         Paragraph('Calculo automatico', st['TC'])],
        [Paragraph('Alerta', st['TCB']),
         Paragraph('"NEGATIVO" (rojo) cuando el neto del mes es < 0. "POSITIVO" (verde) cuando > 0. '
                    'Todos los meses son negativos excepto Jul 2026.', st['TC']),
         Paragraph('Logica del sistema', st['TC'])],
    ]
    e.append(std_table(col_data, [80, 250, 170]))

    e.append(Spacer(1, 10))

    # Monthly detail summary
    monthly = [
        ('Oct 2025', '$0', '$0', 'Periodo de estudios y disenos. Sin desembolsos significativos.'),
        ('Nov 2025', '$0', '$0', 'Movilizacion y tramites. Sin egresos relevantes.'),
        ('Dic 2025', '$0', '$0', 'Tramites con Enel/Codensa. Actividad administrativa.'),
        ('Ene 2026', '$0', '$0', 'Inicio de obras civiles menores. Pagos minimos.'),
        ('Feb 2026', '$7,527M', '$7,527M', 'Mes critico: importacion cargadores Starcharge ($4.2B), pagos bancarios ($3.5B).'),
        ('Mar 2026', '$1,004M', '$1,004M', 'Pagos a subcontratistas civiles y electricos. Materiales.'),
        ('Abr 2026', '$1,854M', 'Proy.', 'Cargadores Isla 2/3 llegan. Avance obras civiles pico.'),
        ('May 2026', '$2,655M', 'Proy.', 'Mes de mayor egreso proyectado. Instalaciones electricas.'),
        ('Jun 2026', '$2,069M', 'Proy.', 'Continuacion instalaciones. Pruebas parciales.'),
        ('Jul 2026', '$2,017M', 'Proy.', 'Entrega y pago de $41B del cliente. Flujo se invierte.'),
        ('Ago 2026', '$2,053M', 'Proy.', 'Pagos residuales a proveedores y cierre de contratos.'),
        ('Sep 2026', '$584M', 'Proy.', 'Ultimo mes. Pagos finales y liquidacion de contratos.'),
    ]

    m_data = [
        [Paragraph('<b>Mes</b>', st['TH']),
         Paragraph('<b>Egreso</b>', st['TH']),
         Paragraph('<b>Tipo</b>', st['TH']),
         Paragraph('<b>Detalle</b>', st['TH'])],
    ]
    for mes, egreso, tipo, detalle in monthly:
        m_data.append([
            Paragraph(mes, st['TCB']),
            Paragraph(egreso, st['TCR']),
            Paragraph(tipo, ParagraphStyle('t', parent=st['TC'], alignment=TA_CENTER)),
            Paragraph(detalle, st['TC']),
        ])
    e.append(std_table(m_data, [60, 65, 45, 330]))
    e.append(Paragraph(
        'Fuente: Datos reales de las hojas "Pagos Patio Sur (2)" y "Otros Pagos". '
        'Proyecciones de las columnas T-Z del mismo Excel.',
        st['Src']
    ))

    e.append(PageBreak())

    # ==== SECTION 5: FINANCING ====
    e.append(Paragraph("5. Financiacion y Credito Bancario", st['SecTitle']))
    e.append(divider())

    e.append(Paragraph("5.1 Credito Bancario", st['SubSec']))
    e.extend(metric_block(st, "CRED", "Credito Bancario",
        "$ 17.000.000.000 COP",
        "Linea de credito aprobada con una entidad bancaria para financiar los costos de ejecucion "
        "del proyecto durante los 9 meses que PC Mejia no recibe ingresos del cliente. "
        "La tasa es IBR + 2.85 puntos, equivalente a una tasa efectiva anual (EA) del 13.65%. "
        "El credito cubre la exposicion maxima de caja ($15.1B) con un margen de ~$1.9B adicional "
        "para imprevistos.",
        "Hoja 'CREDITO' del Excel 'Proyeccion de Pagos Patio Sur.xlsx'. Contiene el detalle "
        "del credito: monto, tasa, plazo, cuotas de interes mensuales y total de intereses.",
        "El credito de $17B es suficiente para cubrir la exposicion maxima proyectada de $15.1B. "
        "Sin embargo, si la obra se extiende mas alla de Jul 2026 (como sugiere el SPI de 0.64), "
        "podria requerirse una ampliacion del credito y los intereses aumentarian proporcionalmente.",
        color=VIOLET
    ))

    e.append(Paragraph("5.2 Costo Financiero: Real vs Estimado", st['SubSec']))

    fin_data = [
        [Paragraph('<b>Concepto</b>', st['TH']),
         Paragraph('<b>Valor</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH']),
         Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Costo Financiero Oferta', st['TCB']),
         Paragraph('$1,375,000,000', st['TCR']),
         Paragraph('Estimacion original de intereses incluida en el precio de venta de la oferta.', st['TC']),
         Paragraph('Hoja "Admon Patios" del Excel caso de negocio', st['TC'])],
        [Paragraph('Costo Financiero Real', ParagraphStyle('cfr', parent=st['TCB'], textColor=RED)),
         Paragraph('$2,211,000,000', ParagraphStyle('cfr2', parent=st['TCBR'], textColor=RED)),
         Paragraph('Intereses reales del credito de $17B a tasa IBR+2.85 (13.65% EA).', st['TC']),
         Paragraph('Hoja "CREDITO" del Excel de Pagos', st['TC'])],
        [Paragraph('Sobrecosto Financiero', ParagraphStyle('sc', parent=st['TCB'], textColor=RED)),
         Paragraph('$836,000,000', ParagraphStyle('sc2', parent=st['TCBR'], textColor=RED)),
         Paragraph('Diferencia entre el costo real y el estimado. Reduce directamente el margen.', st['TC']),
         Paragraph('Calculo: Real - Estimado', st['TC'])],
        [Paragraph('% Sobrecosto', ParagraphStyle('psc', parent=st['TCB'], textColor=AMBER)),
         Paragraph('60.8%', ParagraphStyle('psc2', parent=st['TCBR'], textColor=AMBER)),
         Paragraph('El costo financiero real es 60.8% mayor al estimado en la oferta.', st['TC']),
         Paragraph('Calculo: ($836M / $1,375M) x 100', st['TC'])],
        [Paragraph('Financiacion en Oferta', st['TCB']),
         Paragraph('$3,077,349,397', st['TCR']),
         Paragraph('Monto total incluido en el precio de venta para cubrir la financiacion.', st['TC']),
         Paragraph('Hoja "RESUMEN VENTA" del caso de negocio', st['TC'])],
        [Paragraph('Margen Financiero Neto', ParagraphStyle('mfn', parent=st['TCB'], textColor=EMERALD)),
         Paragraph('$866,349,397', ParagraphStyle('mfn2', parent=st['TCBR'], textColor=EMERALD)),
         Paragraph('Lo que queda despues de pagar intereses: $3,077M - $2,211M = $866M.', st['TC']),
         Paragraph('Calculo: Oferta - Real', st['TC'])],
    ]
    e.append(std_table(fin_data, [110, 90, 170, 130]))
    e.append(Paragraph(
        'El sobrecosto financiero de $836M reduce el margen del proyecto pero no lo elimina. '
        'La oferta incluyo $3,077M para financiacion, de los cuales $2,211M son intereses reales, '
        'dejando un margen financiero neto de $866M.',
        st['Src']
    ))

    e.append(PageBreak())

    # ==== SECTION 6: RISK ====
    e.append(Paragraph("6. Analisis de Riesgo de Liquidez", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "El analisis de riesgo de liquidez evalua la capacidad del proyecto para cumplir con sus "
        "obligaciones de pago en cada periodo. En un contrato 'contra entrega', el riesgo de "
        "liquidez es inherentemente alto y requiere monitoreo constante.",
        st['Body']
    ))

    risks = [
        ("CRITICO", RED, RED_BG, "Flujo de Caja Negativo Sostenido (11/12 meses)",
         "El proyecto tiene flujo negativo durante 11 de los 12 meses de ejecucion. La unica excepcion "
         "es Jul 2026 cuando se recibe el pago. Esto es inherente a la condicion 'contra entrega' "
         "pero genera dependencia total del credito bancario. Cualquier interrupcion en el credito "
         "paralizaria la obra.",
         "Calculo: Neto mensual < 0 en 11 periodos de Oct 2025 a Sep 2026."),
        ("CRITICO", RED, RED_BG, "Concentracion de Egresos en Feb 2026 (88% del total real)",
         "El 88% de los egresos reales ($7.5B de $8.5B) se concentraron en un solo mes (Feb 2026) "
         "por la importacion de cargadores Starcharge. Esta concentracion genera picos de necesidad "
         "de caja que deben coordinarse con la entidad bancaria con suficiente anticipacion. "
         "Un retraso en el desembolso del credito en ese mes habria paralizado la importacion.",
         "Hoja 'Otros Pagos' del Excel: Detalle de pagos Feb 2026 por categoria."),
        ("ALTO", AMBER, AMBER_BG, "Sobrecosto Financiero de $836M (+60.8%)",
         "El costo financiero real ($2,211M) supera el estimado ($1,375M) por $836M. "
         "Esto se debe a: (1) tasa de interes real mas alta que la estimada, (2) monto del credito "
         "($17B) mayor al previsto originalmente. Si la obra se retrasa (SPI=0.64), el sobrecosto "
         "se incrementa con intereses adicionales por cada mes extra.",
         "Hoja 'CREDITO' del Excel de Pagos vs Hoja 'Admon Patios' del caso de negocio."),
        ("ALTO", AMBER, AMBER_BG, "Riesgo de Extension de Plazo (SPI = 0.64)",
         "Con un SPI de 0.64, el proyecto lleva 36% de retraso en cronograma. Si la entrega se "
         "posterga de Jul a Sep 2026 (2 meses extra), el costo financiero adicional seria de "
         "~$390M (2 meses x $17B x 13.65%/12), reduciendo aun mas el margen.",
         "Dashboard EVM: SPI = 0.64. Cronograma MPP: fecha fin Jul 2026."),
        ("POSITIVO", EMERALD, EMERALD_BG, "Credito cubre exposicion con margen",
         "El credito de $17B cubre la exposicion maxima de $15.1B con un margen de $1.9B (12.6%). "
         "Ademas, la oferta incluye $3,077M para financiacion, de los cuales quedan $866M de margen "
         "financiero neto despues de pagar los intereses reales.",
         "Calculo: $17B credito - $15.1B exposicion = $1.9B margen de maniobra."),
    ]

    for sev, color, bg, title, desc, source in risks:
        a_data = [[
            Paragraph(f'<b>[{sev}] {title}</b>', ParagraphStyle('at', fontName='Helvetica-Bold', fontSize=9, textColor=color)),
        ], [
            Paragraph(f'<b>Descripcion:</b> {desc}', st['Body']),
        ], [
            Paragraph(f'<b>Fuente:</b> {source}', st['Src']),
        ]]
        at = Table(a_data, colWidths=[500])
        at.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg),
            ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 10), ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,-1), (-1,-1), 8),
        ]))
        e.append(at)
        e.append(Spacer(1, 6))

    e.append(PageBreak())

    # ==== SECTION 7: DATA SOURCES ====
    e.append(Paragraph("7. Fuentes de Datos", st['SecTitle']))
    e.append(divider())

    e.append(Paragraph(
        "Todas las metricas del modulo de Flujo de Caja provienen de dos fuentes principales:",
        st['Body']
    ))

    fuentes = [
        ("Excel: Proyeccion de Pagos Patio Sur.xlsx",
         "Archivo principal con 6 hojas que contiene los datos financieros reales y proyectados:\n\n"
         "- 'Pagos Patio Sur (2)': Tabla principal. Columna R = pagos Feb 2026 ($7,526,804,818), "
         "columna S = pagos Mar 2026 ($1,003,716,497), columnas T-Z = proyecciones Abr-Sep 2026. "
         "Cada fila es un capitulo/proveedor.\n\n"
         "- 'Otros Pagos': Detalle de todos los pagos categorizados: proyecto ($7.5B), bancos ($3.5B), "
         "terceros/proveedores ($3.8B). Incluye fechas, montos y beneficiarios.\n\n"
         "- 'CREDITO': Datos del credito bancario: monto $17B, tasa IBR+2.85 (13.65% EA), "
         "cuotas de interes mensuales, total intereses $2,211,000,000.\n\n"
         "- 'CC_FRAS': Tracking de facturas por proveedor. Permite cruzar pagos con facturas."),
        ("Oferta Mercantil — PC Mejia a Consorcio Express",
         "Define las condiciones de pago: precio global fijo de $41,012,884,481, pago total contra entrega, "
         "plazo de 9 meses, clausula penal del 20%, y el monto de financiacion incluido en la oferta "
         "($3,077,349,397). Es la referencia para el ingreso proyectado en Jul 2026."),
        ("Excel: Detallado caso de negocio_220126.xlsx",
         "Fuente del costo financiero estimado original ($1,375,000,000) en la hoja 'Admon Patios'. "
         "Este valor se contrasta con el costo financiero real ($2,211M) de la hoja CREDITO "
         "para calcular el sobrecosto financiero de $836M."),
    ]

    for i, (nombre, desc) in enumerate(fuentes):
        f_data = [[
            Paragraph(f'<b>{i+1}. {nombre}</b>', ParagraphStyle('fn', fontName='Helvetica-Bold', fontSize=10, textColor=PRIMARY)),
        ], [
            Paragraph(desc, st['Body']),
        ]]
        ft = Table(f_data, colWidths=[500])
        ft.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), PRIMARY_BG),
            ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
        ]))
        e.append(ft)
        e.append(Spacer(1, 4))

    e.append(Spacer(1, 20))

    # Summary box
    sum_text = (
        "<b>Resumen Ejecutivo:</b> El flujo de caja del proyecto Patio de Operacion Sur es negativo durante "
        "11 de 12 meses de ejecucion, con una exposicion maxima de $15.1B cubierta por un credito de $17B "
        "a IBR+2.85. El costo financiero real ($2.211B) supera el estimado ($1.375B) por $836M. "
        "Los egresos reales a Mar 2026 suman $8.5B, concentrados en Feb 2026 por la importacion de "
        "cargadores. La recuperacion completa se proyecta en Jul 2026 con el pago de $41B del cliente. "
        "El principal riesgo es la extension del plazo (SPI=0.64) que incrementaria el costo financiero."
    )
    sd = [[Paragraph(sum_text, ParagraphStyle('sum', fontName='Helvetica', fontSize=9, textColor=PRIMARY_DARK, leading=13))]]
    st2 = Table(sd, colWidths=[500])
    st2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PRIMARY_BG),
        ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12), ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    e.append(st2)

    return e


# ============================================================
# MAIN
# ============================================================
def main():
    doc = ReportDoc(OUTPUT, pagesize=letter, topMargin=65, bottomMargin=45, leftMargin=40, rightMargin=40)
    styles = S()
    elements = []
    elements.extend(cover(styles))
    elements.extend(toc(styles))
    elements.extend(content(styles))
    doc.build(elements)
    print(f"PDF generado: {OUTPUT}")

if __name__ == "__main__":
    main()
