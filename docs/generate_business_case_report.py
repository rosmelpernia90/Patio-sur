#!/usr/bin/env python3
"""
Genera informe PDF del Caso de Negocio — PC Mejia Ingenieria S.A.
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
WHITE = HexColor('#FFFFFF')

OUTPUT = "/Users/rosmel/PC Mejiaa/Proyecto Patio Sur/docs/Informe_CasoDeNegocio_Metricas.pdf"


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
        c.drawString(30, h - 45, "Informe de Metricas — Caso de Negocio")
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
    e.append(Paragraph("Caso de Negocio", st['CoverTitle']))
    e.append(Paragraph("Patio de Operacion Sur", st['CoverSub']))
    e.append(Spacer(1, 20))
    e.append(Paragraph("PC Mejia Ingenieria S.A.", ParagraphStyle('cn', fontName='Helvetica-Bold', fontSize=14, textColor=PRIMARY_DARK, alignment=TA_CENTER)))
    e.append(Spacer(1, 10))

    info = [
        ["Proyecto:", "Patio de Operacion Sur (OE 1035)"],
        ["Cliente:", "Consorcio Express S.A.S."],
        ["Contratista:", "PC Mejia Ingenieria S.A."],
        ["Fuente de Datos:", "Detallado caso de negocio_220126.xlsx (16 hojas)"],
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
        "Este documento describe cada metrica e indicador visualizado en la pagina Caso de Negocio, "
        "explicando su significado, la fuente de datos de donde se obtuvo y su interpretacion "
        "en el contexto del proyecto.",
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
        ("1.", "Tarjetas KPI — Indicadores Macro Financieros", "3"),
        ("  1.1", "Valor Oferta Total", "3"),
        ("  1.2", "Costo Total Estimado", "3"),
        ("  1.3", "Margen Bruto", "3"),
        ("  1.4", "Ahorro en Compras", "4"),
        ("  1.5", "Financiacion (9 meses)", "4"),
        ("2.", "Tarjetas KPI — Estado de Procura", "4"),
        ("  2.1", "Costo Directo (Caso Negocio)", "4"),
        ("  2.2", "Negociado", "5"),
        ("  2.3", "Pendiente por Negociar", "5"),
        ("  2.4", "Costo Proyectado Total", "5"),
        ("3.", "Grafico: Venta vs Costo por Capitulo", "5"),
        ("4.", "Grafico: Gestion de Compra vs Caso de Negocio", "6"),
        ("5.", "Graficos Circulares: Estructura de Costos y Venta", "6"),
        ("6.", "Tabla: Detalle Costo vs Venta por Capitulo", "7"),
        ("7.", "Tabla: Gestion de Compra por Capitulo", "8"),
        ("8.", "Alertas e Indicadores de Riesgo", "9"),
        ("9.", "Fuentes de Datos", "10"),
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

    # ==== SECTION 1: KPI ROW 1 ====
    e.append(Paragraph("1. Tarjetas KPI — Indicadores Macro Financieros", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "La primera fila de tarjetas presenta 5 indicadores macro del caso de negocio. Estos valores "
        "representan la estructura financiera global del proyecto, incluyendo precio de venta, costo, "
        "margen, ahorros en procura y costo de financiacion.",
        st['Body']
    ))

    # 1.1
    e.append(Paragraph("1.1 Valor Oferta Total", st['SubSec']))
    e.extend(metric_block(st, "BAC", "Valor Oferta Total",
        "$ 41.012.884.481 COP",
        "Precio global fijo de la Oferta Mercantil que PC Mejia presentara/presento a Consorcio Express. "
        "Incluye: costo directo de los 15 capitulos de obra + AIU (Administracion 11%, Imprevistos 2%, "
        "Utilidad 4%) + IVA sobre utilidad + costo de financiacion por 9 meses.",
        "Hoja 'Costo vs Venta' del archivo 'Detallado caso de negocio_220126.xlsx' - celda de TOTAL "
        "OFERTA. Tambien visible en la hoja 'RESUMEN VENTA'.",
        "Es el ingreso total que recibira PC Mejia al completar y entregar la obra. Este valor es fijo "
        "y no cambia salvo que se firmen otrosies (adiciones contractuales)."
    ))

    # 1.2
    e.append(Paragraph("1.2 Costo Total Estimado", st['SubSec']))
    e.extend(metric_block(st, "CT", "Costo Total Estimado",
        "$ 29.457.164.387 COP",
        "Costo total proyectado para ejecutar el proyecto, incluyendo: costo directo de todos los "
        "capitulos ($24.3B), mas costos indirectos de administracion ($2.4B), imprevistos ($485M), "
        "IVA de cargadores importados ($248M), ITS ($383M) y costo financiero ($1.375B).",
        "Sumatoria de la columna COSTO de la hoja 'Costo vs Venta' del Excel, mas las partidas de "
        "costos indirectos de la hoja 'Admon Patios' (AIU, seguros, personal indirecto).",
        "Es el 'piso' de costo del proyecto. Si los costos reales superan este valor, el margen "
        "se reduce. El objetivo de la gestion de compra es mantener los costos por debajo de este estimado.",
        color=STEEL_900
    ))

    # 1.3
    e.append(Paragraph("1.3 Margen Bruto", st['SubSec']))
    e.extend(metric_block(st, "MB", "Margen Bruto",
        "$ 11.555.720.094 COP (28.2%)",
        "Diferencia entre el valor de venta (oferta) y el costo total estimado. Formula: "
        "Margen = Oferta - Costo = $41,012,884,481 - $29,457,164,387 = $11,555,720,094. "
        "El porcentaje se calcula como: (Margen / Oferta) x 100 = 28.2%.",
        "Calculo automatico: Total columna VENTA menos Total columna COSTO de la hoja 'Costo vs Venta'.",
        "Un margen de 28.2% es saludable para un proyecto de infraestructura electrica de esta magnitud. "
        "Sin embargo, este margen incluye el AIU (17%) y la financiacion, por lo que el margen neto real "
        "despues de costos indirectos es menor.",
        color=EMERALD
    ))

    # 1.4
    e.append(Paragraph("1.4 Ahorro en Compras", st['SubSec']))
    e.extend(metric_block(st, "AC", "Ahorro en Compras",
        "$ 3.718.326.390 COP (15.3%)",
        "Diferencia entre el costo estimado original del caso de negocio y el costo proyectado real "
        "basado en las negociaciones realizadas. Formula: Ahorro = Caso de Negocio - Proyectado = "
        "$24,274,282,134 - $20,555,955,744 = $3,718,326,390.",
        "Hoja 'Ejecucion vs Caso de Negocio' del Excel. Se compara la columna 'Caso de Negocio' "
        "(costo presupuestado original) contra la columna 'Proyectado' (negociado + pendiente a precios "
        "actuales). Los principales ahorros provienen de Subestaciones ($2.2B), Transformadores ($903M) "
        "y Redes MT ($808M).",
        "Un ahorro del 15.3% sobre el caso de negocio es un resultado excelente de la gestion de compra. "
        "Esto mejora directamente el margen del proyecto.",
        color=PRIMARY
    ))

    e.append(PageBreak())

    # 1.5
    e.append(Paragraph("1.5 Financiacion (9 meses)", st['SubSec']))
    e.extend(metric_block(st, "FIN", "Financiacion",
        "$ 3.077.349.397 COP (costo financiero real: $ 2.211.000.000)",
        "Monto total de financiacion requerido durante los 9 meses de ejecucion del proyecto. "
        "El contrato establece 'pago total contra entrega', lo que significa que PC Mejia no recibe "
        "ningun ingreso hasta completar la obra. Durante la ejecucion debe financiar todos los costos. "
        "El costo financiero real ($2.211B) corresponde a intereses de un credito de $17B a tasa "
        "IBR + 2.85 (13.65% EA), mayor al estimado original de $1.375B.",
        "Hoja 'Admon Patios' del Excel, seccion de Financiacion ($3.077B en oferta, $1.375B costo estimado). "
        "Datos reales del credito en la hoja 'CREDITO' del Excel de Pagos: $17B a IBR+2.85, "
        "interes total $2.211B.",
        "Este es uno de los mayores riesgos del proyecto. El costo financiero REAL ($2.211B) supera el "
        "estimado original ($1.375B) por $836M, reduciendo el margen. Si la obra se retrasa (SPI=0.64), "
        "el costo financiero aumenta proporcionalmente.",
        color=STEEL_900
    ))

    # ==== SECTION 2: KPI ROW 2 ====
    e.append(Paragraph("2. Tarjetas KPI — Estado de Procura", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "La segunda fila de tarjetas muestra el estado de la gestion de compras y contratacion "
        "(procura) del proyecto. Permite monitorear cuanto del costo directo ya ha sido negociado "
        "con proveedores y cuanto queda pendiente.",
        st['Body']
    ))

    # 2.1
    e.append(Paragraph("2.1 Costo Directo (Caso de Negocio)", st['SubSec']))
    e.extend(metric_block(st, "CD", "Costo Directo",
        "$ 24.274.282.134 COP",
        "Sumatoria de los costos directos estimados de los 15 capitulos de obra en el caso de negocio "
        "original. Excluye costos indirectos (AIU), IVA de importaciones, ITS y financiacion. "
        "Representa el 'presupuesto base' contra el cual se miden las negociaciones de compra.",
        "Hoja 'Ejecucion vs Caso de Negocio' del Excel - suma de la columna 'Caso de Negocio' "
        "para todos los capitulos. Coincide con la suma de costos de la hoja 'Costo vs Venta'.",
        "Este es el monto total que debe gestionarse en compras y contratacion. Los $24.3B se "
        "distribuyen entre 15 capitulos de diferente naturaleza (equipos, obras civiles, servicios, etc.).",
        color=STEEL_900
    ))

    # 2.2
    e.append(Paragraph("2.2 Negociado", st['SubSec']))
    e.extend(metric_block(st, "NEG", "Total Negociado",
        "$ 13.159.418.623 COP (54.2%)",
        "Monto total de ordenes de compra y contratos ya firmados con proveedores. Representa "
        "compromisos firmes con precios cerrados. El 54.2% indica que mas de la mitad del costo "
        "directo ya tiene proveedor y precio definido.",
        "Hoja 'Ejecucion vs Caso de Negocio' del Excel - suma de la columna 'Negociado'. "
        "Incluye contratos con: Starcharge (cargadores $4.37B), WEG (transformadores $1.21B), "
        "Taesmet/R2F (civil + estructura $4.02B), entre otros.",
        "El 54.2% negociado es un avance moderado. Quedan capitulos criticos sin negociar como "
        "Conexion a la Red, SPE/SPT, Comunicaciones e Iluminacion.",
        color=EMERALD
    ))

    # 2.3
    e.append(Paragraph("2.3 Pendiente por Negociar", st['SubSec']))
    e.extend(metric_block(st, "PEND", "Pendiente por Negociar",
        "$ 7.396.537.122 COP (30.5%)",
        "Monto del costo directo que aun no tiene proveedor ni contrato firmado. Estos capitulos "
        "representan riesgo ya que los precios finales aun no estan definidos y pueden variar.",
        "Hoja 'Ejecucion vs Caso de Negocio' del Excel - suma de la columna 'Pendiente'. "
        "Capitulos principales pendientes: Compensacion Reactiva ($752M), Conexion Red ($369M), "
        "BT parcial ($722M), Civil parcial ($2.3B), SPE/SPT ($258M), Comunicaciones ($265M).",
        "El 30.5% pendiente requiere accion urgente del equipo de compras. Especialmente criticos son "
        "los capitulos de Conexion a la Red y Compensacion Reactiva que tienen margen bajo o negativo.",
        color=AMBER
    ))

    e.append(PageBreak())

    # 2.4
    e.append(Paragraph("2.4 Costo Proyectado Total", st['SubSec']))
    e.extend(metric_block(st, "PROY", "Costo Proyectado Total",
        "$ 20.555.955.744 COP",
        "Estimacion del costo directo final del proyecto: Negociado ($13.16B) + Pendiente ($7.4B) = "
        "Proyectado ($20.56B). La diferencia con el caso de negocio ($24.27B) es el ahorro ($3.72B).",
        "Calculo: suma de columnas Negociado + Pendiente de la hoja 'Ejecucion vs Caso de Negocio'.",
        "Si se mantienen los ahorros en las negociaciones pendientes, el proyecto terminaria $3.7B "
        "por debajo del caso de negocio original, mejorando significativamente el margen.",
        color=PRIMARY
    ))

    # ==== SECTION 3: CHART VENTA VS COSTO ====
    e.append(Paragraph("3. Grafico: Venta vs Costo por Capitulo", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "Este grafico de barras compara el valor de VENTA (precio cobrado al cliente) contra el COSTO "
        "(estimado del caso de negocio) para cada capitulo de obra con costo superior a $500M. "
        "La diferencia entre ambas barras es el margen de cada capitulo.",
        st['Body']
    ))

    chart_data = [
        [Paragraph('<b>Elemento</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH']),
         Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Barra Azul (Venta)', st['TCB']),
         Paragraph('Precio de venta de cada capitulo segun la Oferta Mercantil. Es lo que el cliente paga.', st['TC']),
         Paragraph('Columna VENTA de la hoja "Costo vs Venta"', st['TC'])],
        [Paragraph('Barra Gris (Costo)', st['TCB']),
         Paragraph('Costo estimado de cada capitulo segun el caso de negocio. Es lo que cuesta ejecutar.', st['TC']),
         Paragraph('Columna COSTO de la hoja "Costo vs Venta"', st['TC'])],
        [Paragraph('Eje X', st['TCB']),
         Paragraph('Nombre de cada capitulo (15 capitulos de obra)', st['TC']),
         Paragraph('Filas de la hoja "Costo vs Venta"', st['TC'])],
        [Paragraph('Eje Y', st['TCB']),
         Paragraph('Valor en miles de millones de COP (formato $X.XB)', st['TC']),
         Paragraph('Escala automatica', st['TC'])],
    ]
    e.append(std_table(chart_data, [100, 220, 180]))
    e.append(Paragraph(
        'Capitulos principales por volumen: Obras Civiles ($8.2B venta), Cargadores ($6.7B), BT ($3.9B), '
        'Subestaciones ($3.4B), Redes MT ($2.9B), Transformadores ($2.3B).',
        st['Src']
    ))

    # ==== SECTION 4: CHART GESTION COMPRA ====
    e.append(Paragraph("4. Grafico: Gestion de Compra vs Caso de Negocio", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "Grafico de barras agrupadas que muestra tres valores por capitulo: el presupuesto del caso de "
        "negocio (gris), lo negociado con proveedores (verde) y lo pendiente por negociar (amarillo).",
        st['Body']
    ))

    proc_data = [
        [Paragraph('<b>Barra</b>', st['TH']),
         Paragraph('<b>Color</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH']),
         Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Caso de Negocio', st['TCB']), Paragraph('Gris', st['TC']),
         Paragraph('Presupuesto original estimado para el capitulo', st['TC']),
         Paragraph('Columna "Caso de Negocio" de Ejecucion vs CN', st['TC'])],
        [Paragraph('Negociado', st['TCB']), Paragraph('Verde', st['TC']),
         Paragraph('Monto con contrato/OC firmada', st['TC']),
         Paragraph('Columna "Negociado" de Ejecucion vs CN', st['TC'])],
        [Paragraph('Pendiente', st['TCB']), Paragraph('Amarillo', st['TC']),
         Paragraph('Monto sin proveedor definido', st['TC']),
         Paragraph('Columna "Pendiente" de Ejecucion vs CN', st['TC'])],
    ]
    e.append(std_table(proc_data, [100, 50, 180, 170]))
    e.append(Paragraph(
        'Nota: Solo se muestran capitulos con caso de negocio > $200M para legibilidad del grafico.',
        st['Src']
    ))

    # ==== SECTION 5: PIE CHARTS ====
    e.append(Paragraph("5. Graficos Circulares: Estructura de Costos y Venta", st['SecTitle']))
    e.append(divider())

    e.append(Paragraph("5.1 Estructura de Costos", st['SubSec']))
    e.append(Paragraph(
        "Muestra la composicion del costo total estimado ($29.457B) desglosada en sus componentes:",
        st['Body']
    ))
    cost_items = [
        [Paragraph('<b>Componente</b>', st['TH']), Paragraph('<b>Valor</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH']), Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Costo Directo', st['TCB']), Paragraph('$24,274,282,134', st['TCR']),
         Paragraph('Suma de materiales, equipos, mano de obra y servicios de los 15 capitulos', st['TC']),
         Paragraph('Hoja Costo vs Venta - Suma columna Costo', st['TC'])],
        [Paragraph('IVA Cargadores', st['TCB']), Paragraph('$247,981,000', st['TCR']),
         Paragraph('IVA 19% sobre cargadores importados (compra en USD)', st['TC']),
         Paragraph('Hoja Admon Patios - Impuestos importacion', st['TC'])],
        [Paragraph('ITS', st['TCB']), Paragraph('$382,907,200', st['TCR']),
         Paragraph('Impuesto de Timbre y Sellos sobre el contrato', st['TC']),
         Paragraph('Hoja Admon Patios - Impuestos', st['TC'])],
        [Paragraph('Administracion (11%)', st['TCB']), Paragraph('$2,444,728,897', st['TCR']),
         Paragraph('Costos indirectos: personal administrativo, oficinas, vehiculos, seguros', st['TC']),
         Paragraph('Hoja Admon Patios - Desglose AIU', st['TC'])],
        [Paragraph('Imprevistos (2%)', st['TCB']), Paragraph('$485,485,643', st['TCR']),
         Paragraph('Reserva para contingencias e imprevistos del proyecto', st['TC']),
         Paragraph('Hoja Admon Patios - % sobre CD', st['TC'])],
        [Paragraph('Financiacion', st['TCB']), Paragraph('$2,211,000,000', st['TCR']),
         Paragraph('Costo financiero real (intereses credito $17B a IBR+2.85)', st['TC']),
         Paragraph('Hoja CREDITO del Excel de Pagos', st['TC'])],
    ]
    e.append(std_table(cost_items, [100, 95, 175, 130]))

    e.append(Spacer(1, 10))
    e.append(Paragraph("5.2 Estructura de Venta (Oferta)", st['SubSec']))
    e.append(Paragraph(
        "Muestra como se compone el precio de venta ($41.013B) que se cobra al cliente:",
        st['Body']
    ))
    sale_items = [
        [Paragraph('<b>Componente</b>', st['TH']), Paragraph('<b>Valor</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH']), Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Costo Directo', st['TCB']), Paragraph('$32,006,332,599', st['TCR']),
         Paragraph('Costo directo con margen aplicado (precio de venta de los capitulos)', st['TC']),
         Paragraph('Hoja Costo vs Venta - Suma columna Venta', st['TC'])],
        [Paragraph('Administracion', st['TCB']), Paragraph('$3,734,163,668', st['TCR']),
         Paragraph('11% del costo directo de venta para gastos administrativos', st['TC']),
         Paragraph('Hoja RESUMEN VENTA - AIU', st['TC'])],
        [Paragraph('Imprevistos', st['TCB']), Paragraph('$649,419,768', st['TCR']),
         Paragraph('2% del costo directo de venta para contingencias', st['TC']),
         Paragraph('Hoja RESUMEN VENTA - AIU', st['TC'])],
        [Paragraph('Utilidad', st['TCB']), Paragraph('$1,298,839,537', st['TCR']),
         Paragraph('4% del costo directo como ganancia contractual', st['TC']),
         Paragraph('Hoja RESUMEN VENTA - AIU', st['TC'])],
        [Paragraph('IVA Utilidad', st['TCB']), Paragraph('$246,779,512', st['TCR']),
         Paragraph('IVA 19% aplicado sobre la utilidad', st['TC']),
         Paragraph('Calculo: Utilidad x 19%', st['TC'])],
        [Paragraph('Financiacion', st['TCB']), Paragraph('$3,077,349,397', st['TCR']),
         Paragraph('Costo de financiacion trasladado al precio de venta', st['TC']),
         Paragraph('Hoja RESUMEN VENTA - Financiacion', st['TC'])],
    ]
    e.append(std_table(sale_items, [100, 95, 175, 130]))

    e.append(PageBreak())

    # ==== SECTION 6: COSTO VS VENTA TABLE ====
    e.append(Paragraph("6. Tabla: Detalle Costo vs Venta por Capitulo", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "Tabla detallada con los 15 capitulos de obra, mostrando el valor de venta, costo, diferencia "
        "(margen absoluto), porcentaje de margen y nivel de riesgo. El nivel de riesgo se clasifica en:",
        st['Body']
    ))

    risk_legend = [
        [Paragraph('<b>Indicador</b>', st['TH']),
         Paragraph('<b>Condicion</b>', st['TH']),
         Paragraph('<b>Significado</b>', st['TH'])],
        [Paragraph('OK (Verde)', ParagraphStyle('ok', fontName='Helvetica-Bold', fontSize=8, textColor=EMERALD)),
         Paragraph('Margen >= 10%', st['TC']),
         Paragraph('Capitulo con margen saludable', st['TC'])],
        [Paragraph('Bajo (Amarillo)', ParagraphStyle('bj', fontName='Helvetica-Bold', fontSize=8, textColor=AMBER)),
         Paragraph('Margen entre 0% y 10%', st['TC']),
         Paragraph('Margen ajustado, requiere monitoreo', st['TC'])],
        [Paragraph('Perdida (Rojo)', ParagraphStyle('pe', fontName='Helvetica-Bold', fontSize=8, textColor=RED)),
         Paragraph('Margen < 0%', st['TC']),
         Paragraph('El costo supera la venta — genera perdida', st['TC'])],
    ]
    e.append(std_table(risk_legend, [100, 150, 250]))
    e.append(Spacer(1, 8))

    # Full data table
    chapters = [
        ('Estudios y Disenos', 419047180, 312727205, 25.4),
        ('Conexion a la Red', 519268407, 369435063, 28.9),
        ('Redes MT (Celdas)', 2893959054, 2046582157, 29.3),
        ('Subestaciones (Shelter)', 3406137000, 2692179338, 21.0),
        ('Transformadores', 2338037308, 2115002279, 9.5),
        ('Baja Tension (BT)', 3856386116, 2864635880, 25.7),
        ('SPE y SPT', 262823529, 257800000, 1.9),
        ('Comunicaciones', 701469115, 264839198, 62.2),
        ('Cargadores', 6743603237, 5330376000, 21.0),
        ('Instalacion Cargadores', 261567164, 191000000, 27.0),
        ('Iluminacion y Aux.', 147984032, 125786428, 15.0),
        ('Comp. Reactiva', 547200000, 751864128, -37.4),
        ('Deteccion Incendios', 270082618, 227943849, 15.6),
        ('Obras Civiles', 8177142400, 6537881527, 20.0),
        ('Tramites', 679896358, 186229084, 72.6),
    ]

    def fmtM(v):
        if abs(v) >= 1e9:
            return f'${v/1e9:.1f}B'
        return f'${v/1e6:.0f}M'

    ch_data = [
        [Paragraph('<b>Capitulo</b>', st['TH']),
         Paragraph('<b>Venta</b>', st['TH']),
         Paragraph('<b>Costo</b>', st['TH']),
         Paragraph('<b>Margen</b>', st['TH']),
         Paragraph('<b>%</b>', st['TH']),
         Paragraph('<b>Riesgo</b>', st['TH'])],
    ]
    for cap, venta, costo, margen in chapters:
        diff = venta - costo
        mc = EMERALD if margen >= 10 else (AMBER if margen >= 0 else RED)
        risk = 'OK' if margen >= 10 else ('Bajo' if margen >= 0 else 'Perdida')
        ch_data.append([
            Paragraph(cap, st['TC']),
            Paragraph(fmtM(venta), st['TCR']),
            Paragraph(fmtM(costo), st['TCR']),
            Paragraph(fmtM(diff), ParagraphStyle('d', parent=st['TCBR'], textColor=mc)),
            Paragraph(f'{margen:.1f}%', ParagraphStyle('p', parent=st['TCBR'], textColor=mc)),
            Paragraph(risk, ParagraphStyle('r', parent=st['TCB'], textColor=mc, alignment=TA_CENTER)),
        ])
    # Totals
    ch_data.append([
        Paragraph('<b>TOTAL OFERTA</b>', st['TCB']),
        Paragraph('<b>$41.0B</b>', st['TCBR']),
        Paragraph('<b>$29.5B</b>', st['TCBR']),
        Paragraph('<b>$11.6B</b>', ParagraphStyle('dt', parent=st['TCBR'], textColor=EMERALD)),
        Paragraph('<b>28.2%</b>', ParagraphStyle('pt', parent=st['TCBR'], textColor=EMERALD)),
        Paragraph('', st['TC']),
    ])

    cht = Table(ch_data, colWidths=[110, 65, 65, 70, 45, 55])
    cht.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, STEEL_200),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [WHITE, STEEL_50]),
        ('BACKGROUND', (0,-1), (-1,-1), PRIMARY_BG),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        # Highlight Comp. Reactiva row (row 12, 0-indexed header=0)
        ('BACKGROUND', (0,12), (-1,12), RED_BG),
    ]))
    e.append(cht)

    e.append(Paragraph(
        'Fuente: Hoja "Costo vs Venta" del Excel "Detallado caso de negocio_220126.xlsx". '
        'Cada fila corresponde a un capitulo de la estructura de desglose de costos del proyecto.',
        st['Src']
    ))

    e.append(PageBreak())

    # ==== SECTION 7: GESTION COMPRA TABLE ====
    e.append(Paragraph("7. Tabla: Gestion de Compra por Capitulo", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "Tabla que muestra el estado de negociacion con proveedores para cada capitulo. "
        "Incluye: presupuesto del caso de negocio, monto negociado (contratos firmados), "
        "pendiente por negociar, ahorro obtenido y estado de gestion.",
        st['Body']
    ))

    # Status legend
    status_leg = [
        [Paragraph('<b>Estado</b>', st['TH']), Paragraph('<b>Condicion</b>', st['TH']), Paragraph('<b>Significado</b>', st['TH'])],
        [Paragraph('Cerrado', ParagraphStyle('c', fontName='Helvetica-Bold', fontSize=8, textColor=EMERALD)),
         Paragraph('>= 80% negociado', st['TC']),
         Paragraph('Capitulo con la mayoria de su presupuesto en contratos firmados', st['TC'])],
        [Paragraph('Parcial', ParagraphStyle('pa', fontName='Helvetica-Bold', fontSize=8, textColor=AMBER)),
         Paragraph('> 0% y < 80% negociado', st['TC']),
         Paragraph('Capitulo con negociacion en curso, parcialmente comprometido', st['TC'])],
        [Paragraph('Pendiente', ParagraphStyle('pe2', fontName='Helvetica-Bold', fontSize=8, textColor=RED)),
         Paragraph('0% negociado', st['TC']),
         Paragraph('Sin proveedor definido, riesgo alto de precio', st['TC'])],
    ]
    e.append(std_table(status_leg, [80, 130, 290]))
    e.append(Spacer(1, 8))

    procurement = [
        ('Estudios y Disenos', 312727205, 252360920, 60366285, 0),
        ('Conexion a la Red', 369435063, 0, 369435063, 0),
        ('Redes MT (Celdas)', 2046582157, 1238615200, 0, 807966957),
        ('Subestaciones (Shelter)', 2692179338, 0, 460221135, 2231958203),
        ('Transformadores', 2115002279, 1211417000, 0, 903585279),
        ('Baja Tension (BT)', 2864635880, 1988944382, 721684532, 154006966),
        ('SPE y SPT', 257800000, 0, 257800000, 0),
        ('Comunicaciones', 264839198, 0, 264839198, 0),
        ('Cargadores', 5330376000, 4374580000, 280756000, 675040000),
        ('Inst. Cargadores', 191000000, 0, 191000000, 0),
        ('Iluminacion', 125786428, 0, 125786428, 0),
        ('Comp. Reactiva', 751864128, 0, 751864128, 0),
        ('Det. Incendios', 227943849, 0, 227943849, 0),
        ('Civil + Estructura', 6537881527, 4021596721, 2314007162, 202278644),
        ('Tramites', 186229084, 13605060, 172624024, 0),
    ]

    pr_data = [
        [Paragraph('<b>Capitulo</b>', st['TH']),
         Paragraph('<b>Caso Neg.</b>', st['TH']),
         Paragraph('<b>Negociado</b>', st['TH']),
         Paragraph('<b>Pendiente</b>', st['TH']),
         Paragraph('<b>Ahorro</b>', st['TH']),
         Paragraph('<b>Estado</b>', st['TH'])],
    ]
    for cap, cn, neg, pend, ahorro in procurement:
        pct = neg / cn * 100 if cn > 0 else 0
        status = 'Cerrado' if pct >= 80 else ('Parcial' if pct > 0 else 'Pendiente')
        sc = EMERALD if pct >= 80 else (AMBER if pct > 0 else RED)
        pr_data.append([
            Paragraph(cap, st['TC']),
            Paragraph(fmtM(cn), st['TCR']),
            Paragraph(fmtM(neg) if neg > 0 else '-', ParagraphStyle('n', parent=st['TCBR'], textColor=EMERALD)),
            Paragraph(fmtM(pend) if pend > 0 else '-', ParagraphStyle('pe3', parent=st['TCBR'], textColor=AMBER)),
            Paragraph(fmtM(ahorro) if ahorro > 0 else '-', ParagraphStyle('a', parent=st['TCBR'], textColor=PRIMARY)),
            Paragraph(status, ParagraphStyle('s', parent=st['TCB'], textColor=sc, alignment=TA_CENTER)),
        ])
    # Total row
    pr_data.append([
        Paragraph('<b>TOTAL</b>', st['TCB']),
        Paragraph('<b>$24.3B</b>', st['TCBR']),
        Paragraph('<b>$13.2B</b>', ParagraphStyle('nt', parent=st['TCBR'], textColor=EMERALD)),
        Paragraph('<b>$7.4B</b>', ParagraphStyle('pt2', parent=st['TCBR'], textColor=AMBER)),
        Paragraph('<b>$3.7B</b>', ParagraphStyle('at', parent=st['TCBR'], textColor=PRIMARY)),
        Paragraph('', st['TC']),
    ])

    prt = Table(pr_data, colWidths=[95, 65, 70, 65, 65, 55])
    prt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, STEEL_200),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [WHITE, STEEL_50]),
        ('BACKGROUND', (0,-1), (-1,-1), PRIMARY_BG),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    e.append(prt)
    e.append(Paragraph(
        'Fuente: Hoja "Ejecucion vs Caso de Negocio" del Excel. Proveedores principales: '
        'Starcharge (cargadores), WEG (transformadores), Taesmet (estructura metalica), '
        'R2F (obras civiles), entre otros.',
        st['Src']
    ))

    e.append(PageBreak())

    # ==== SECTION 8: ALERTS ====
    e.append(Paragraph("8. Alertas e Indicadores de Riesgo", st['SecTitle']))
    e.append(divider())
    e.append(Paragraph(
        "La pagina de Caso de Negocio incluye 4 tarjetas de alerta que resumen los hallazgos "
        "criticos del analisis financiero:",
        st['Body']
    ))

    alerts = [
        ("CRITICA", RED, RED_BG, "Compensacion Reactiva: Margen Negativo",
         "El capitulo de Compensacion Reactiva tiene un costo estimado de $751,864,128 que supera "
         "el valor de venta de $547,200,000, generando una perdida de $204,664,128 (margen -37.4%). "
         "Esto requiere revision del alcance y renegociacion con el proveedor.",
         "Hoja 'Costo vs Venta' del Excel - Fila Comp. Reactiva. Comparacion directa de columnas Venta vs Costo."),
        ("ADVERTENCIA", AMBER, AMBER_BG, "30.5% del costo directo pendiente por negociar",
         "$7,396,537,122 aun sin negociar. Los capitulos mas criticos pendientes son: Conexion a la Red "
         "($369M, sin proveedor), Compensacion Reactiva ($752M, sin proveedor), SPE/SPT ($258M), "
         "Comunicaciones ($265M) e Iluminacion ($126M). Estos representan riesgo de precio.",
         "Hoja 'Ejecucion vs Caso de Negocio' - Suma de columna Pendiente / Total Caso de Negocio = 30.5%."),
        ("POSITIVO", EMERALD, EMERALD_BG, "Ahorro en gestion de compra: $3,718,326,390",
         "El costo proyectado total es 15.3% menor al caso de negocio original. Los principales ahorros "
         "provienen de: Subestaciones ($2,232M por negociacion favorable), Transformadores ($904M), "
         "Redes MT ($808M) y Cargadores ($675M).",
         "Calculo: Caso de Negocio ($24.3B) - Proyectado ($20.6B) = $3.7B ahorro. "
         "Datos de la hoja 'Ejecucion vs Caso de Negocio'."),
        ("INFO", PRIMARY, PRIMARY_BG, "Estructura AIU y Financiacion",
         "El AIU total es del 17% distribuido en: Administracion 11% + Imprevistos 2% + Utilidad 4%. "
         "La financiacion de $3,077,349,397 cubre 9 meses de ejecucion. El costo financiero REAL "
         "es de $2,211,000,000 (credito de $17B a IBR+2.85), superando el estimado original de $1,375,000,000 "
         "por $836M.",
         "Hoja 'Admon Patios' del Excel - Seccion AIU. Datos reales del credito en hoja 'CREDITO' "
         "del Excel de Pagos."),
    ]

    for sev, color, bg, title, desc, source in alerts:
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

    # ==== SECTION 9: FUENTES ====
    e.append(Paragraph("9. Fuentes de Datos", st['SecTitle']))
    e.append(divider())

    e.append(Paragraph(
        "Todas las metricas de la pagina Caso de Negocio provienen de un unico archivo Excel principal, "
        "complementado con la informacion contractual:",
        st['Body']
    ))

    fuentes = [
        ("Archivo Excel: Detallado caso de negocio_220126.xlsx",
         "Archivo principal con 16 hojas que contiene el analisis financiero completo del proyecto. "
         "Las hojas utilizadas para esta pagina son:\n"
         "- 'Costo vs Venta': Desglose de los 15 capitulos con valores de venta y costo\n"
         "- 'Ejecucion vs Caso de Negocio': Estado de procura por capitulo (negociado, pendiente, ahorro)\n"
         "- 'Admon Patios': Desglose del AIU, personal indirecto, seguros, financiacion\n"
         "- 'RESUMEN VENTA': Estructura de la oferta (CD + AIU + IVA + Financiacion)"),
        ("Hoja 'Costo vs Venta'",
         "Contiene 15 filas (una por capitulo) con columnas: Capitulo, Venta (precio al cliente), "
         "Costo (estimado), y filas adicionales para AIU, IVA y Financiacion. "
         "Total Venta = $41,012,884,481 | Total Costo = $29,457,164,387 | Margen = 28.2%"),
        ("Hoja 'Ejecucion vs Caso de Negocio'",
         "Estado de la gestion de compra. Columnas: Capitulo, Caso de Negocio, Negociado, Pendiente, "
         "Proyectado, Ahorro. Incluye nombres de proveedores: Starcharge (cargadores), WEG "
         "(transformadores), Taesmet (estructura metalica), R2F (obras civiles)."),
        ("Hoja 'Admon Patios'",
         "Desglose completo del AIU: 17% total (11% Administracion + 2% Imprevistos + 4% Utilidad). "
         "Detalle de personal indirecto (Director, Coordinador, Residentes, HSE, Calidad), "
         "seguros, garantias y costo de financiacion por 9 meses."),
        ("Excel: Proyeccion de Pagos Patio Sur.xlsx",
         "Archivo con 6 hojas: 'Pagos Patio Sur (2)' (pagos reales Feb/Mar 2026 y proyecciones Abr-Sep), "
         "'Otros Pagos' (detalle de pagos a proveedores, bancos, terceros), "
         "'CREDITO' (credito de $17B a IBR+2.85, interes real $2.211B), "
         "'CC_FRAS' (tracking de facturas por proveedor)."),
        ("Oferta Mercantil",
         "Documento contractual que define el precio global fijo ($41,012,884,481), plazo (9 meses), "
         "forma de pago (contra entrega) y condiciones generales."),
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
        "<b>Resumen Ejecutivo:</b> El caso de negocio del proyecto Patio de Operacion Sur presenta "
        "un margen bruto de 28.2% ($11.6B). La gestion de compra ha logrado un ahorro de $3.7B (15.3%) "
        "sobre el presupuesto original, con el 54.2% del costo directo ya negociado. "
        "El principal riesgo financiero es el capitulo de Compensacion Reactiva con margen negativo (-37.4%) "
        "y el 30.5% de costos pendientes por negociar. El costo de financiacion real ($2.211B) supera "
        "el estimado ($1.375B) por $836M, dado que no hay ingresos hasta la entrega final."
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
