#!/usr/bin/env python3
"""
Genera informe PDF del Presupuesto — PC Mejia Ingenieria S.A.
Proyecto: Patio de Operacion Sur
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
import datetime

# Colors
P = HexColor('#1B5EAB');  PD = HexColor('#0D3F7E');  PL = HexColor('#A9C8EB');  PBG = HexColor('#EEF4FB')
S9 = HexColor('#1A1C21'); S7 = HexColor('#4A4D56');  S5 = HexColor('#6B6E77');  S4 = HexColor('#8B8E96')
S2 = HexColor('#D1D2D6'); S1 = HexColor('#E8E9EB');  S0 = HexColor('#F6F7F8')
EM = HexColor('#16A34A');  EBG = HexColor('#F0FDF4')
RD = HexColor('#DC2626');  RBG = HexColor('#FEF2F2')
AM = HexColor('#D97706');  ABG = HexColor('#FFFBEB')
W = HexColor('#FFFFFF')

OUTPUT = "/Users/rosmel/PC Mejiaa/Proyecto Patio Sur/docs/Informe_Presupuesto_Metricas.pdf"

class Doc(BaseDocTemplate):
    def __init__(self, fn, **kw):
        super().__init__(fn, **kw)
        f = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='n')
        self.addPageTemplates([PageTemplate(id='m', frames=f, onPage=self._hf)])
    def _hf(self, c, doc):
        c.saveState(); w, h = letter
        c.setFillColor(P); c.rect(0, h-50, w, 50, fill=True, stroke=False)
        c.setFillColor(W); c.setFont("Helvetica-Bold", 11); c.drawString(30, h-33, "PC MEJIA INGENIERIA S.A.")
        c.setFont("Helvetica", 8); c.drawString(30, h-45, "Informe de Metricas — Presupuesto")
        c.drawRightString(w-30, h-33, "Patio de Operacion Sur")
        c.drawRightString(w-30, h-45, f"Fecha: {datetime.date.today().strftime('%d/%m/%Y')}")
        c.setFillColor(S2); c.rect(0, 0, w, 30, fill=True, stroke=False)
        c.setFillColor(S5); c.setFont("Helvetica", 7)
        c.drawString(30, 12, "CONFIDENCIAL - PC Mejia Ingenieria S.A.")
        c.drawRightString(w-30, 12, f"Pagina {doc.page}")
        c.restoreState()

def S():
    from reportlab.lib.styles import getSampleStyleSheet
    s = getSampleStyleSheet()
    for n, kw in {
        'CT': dict(fontName='Helvetica-Bold', fontSize=28, textColor=P, alignment=TA_CENTER, spaceAfter=10),
        'CS': dict(fontName='Helvetica', fontSize=14, textColor=S5, alignment=TA_CENTER, spaceAfter=6),
        'ST': dict(fontName='Helvetica-Bold', fontSize=16, textColor=P, spaceBefore=18, spaceAfter=10),
        'SS': dict(fontName='Helvetica-Bold', fontSize=12, textColor=S9, spaceBefore=14, spaceAfter=6),
        'B': dict(fontName='Helvetica', fontSize=9.5, textColor=S7, alignment=TA_JUSTIFY, spaceAfter=6, leading=13),
        'Src': dict(fontName='Helvetica-Oblique', fontSize=8, textColor=S4, spaceBefore=4, spaceAfter=8, leftIndent=10),
        'TH': dict(fontName='Helvetica-Bold', fontSize=8, textColor=W, alignment=TA_CENTER),
        'TC': dict(fontName='Helvetica', fontSize=8, textColor=S7, leading=11),
        'TCB': dict(fontName='Helvetica-Bold', fontSize=8, textColor=S9, leading=11),
        'TCR': dict(fontName='Helvetica', fontSize=8, textColor=S7, alignment=TA_RIGHT, leading=11),
        'TCBR': dict(fontName='Helvetica-Bold', fontSize=8, textColor=S9, alignment=TA_RIGHT, leading=11),
    }.items():
        s.add(ParagraphStyle(name=n, **kw))
    return s

def div(): return HRFlowable(width="100%", thickness=1.5, color=PL, spaceBefore=6, spaceAfter=6)

def mb(st, sig, nm, val, desc, src, interp="", color=None):
    els = []
    vc = color or P
    hd = [[Paragraph(f'<b>{sig}</b> — {nm}', ParagraphStyle('mn', fontName='Helvetica-Bold', fontSize=10, textColor=S9)),
           Paragraph(f'<b>{val}</b>', ParagraphStyle('mv', fontName='Helvetica-Bold', fontSize=10, textColor=vc, alignment=TA_RIGHT))]]
    ht = Table(hd, colWidths=[350, 150])
    ht.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),S0),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
                             ('LEFTPADDING',(0,0),(0,-1),10),('RIGHTPADDING',(-1,0),(-1,-1),10),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
    els.append(ht); els.append(Spacer(1,4))
    els.append(Paragraph(f'<b>Significado:</b> {desc}', st['B']))
    if interp: els.append(Paragraph(f'<b>Interpretacion:</b> {interp}', st['B']))
    els.append(Paragraph(f'Fuente: {src}', st['Src']))
    els.append(Spacer(1,6))
    return els

def tbl(data, widths):
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),P),('GRID',(0,0),(-1,-1),0.5,S2),
                            ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
                            ('LEFTPADDING',(0,0),(-1,-1),5),('ROWBACKGROUNDS',(0,1),(-1,-1),[W,S0]),
                            ('VALIGN',(0,0),(-1,-1),'TOP')]))
    return t

# ============================================================
def cover(st):
    e = [Spacer(1,120)]
    cd = [[Paragraph("INFORME DE METRICAS", ParagraphStyle('ct2', fontName='Helvetica-Bold', fontSize=12, textColor=W, alignment=TA_CENTER))]]
    ct = Table(cd, colWidths=[300])
    ct.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),P),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),('ALIGN',(0,0),(-1,-1),'CENTER')]))
    e.append(ct); e.append(Spacer(1,30))
    e.append(Paragraph("Presupuesto del Proyecto", st['CT']))
    e.append(Paragraph("Patio de Operacion Sur", st['CS']))
    e.append(Spacer(1,20))
    e.append(Paragraph("PC Mejia Ingenieria S.A.", ParagraphStyle('cn', fontName='Helvetica-Bold', fontSize=14, textColor=PD, alignment=TA_CENTER)))
    e.append(Spacer(1,10))
    info = [["Proyecto:", "Patio de Operacion Sur (OE 1035)"],["Cliente:", "Consorcio Express S.A.S."],
            ["Contratista:", "PC Mejia Ingenieria S.A."],
            ["Fuente:", "Detallado caso de negocio_220126.xlsx + Proyeccion de Pagos.xlsx"],
            ["Fecha:", datetime.date.today().strftime('%d de %B de %Y')]]
    it = Table(info, colWidths=[100,360])
    it.setStyle(TableStyle([('FONTNAME',(0,0),(0,-1),'Helvetica-Bold'),('FONTNAME',(1,0),(1,-1),'Helvetica'),
                             ('FONTSIZE',(0,0),(-1,-1),9),('TEXTCOLOR',(0,0),(0,-1),S5),('TEXTCOLOR',(1,0),(1,-1),S9),
                             ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('LINEBELOW',(0,0),(-1,-2),0.5,S2)]))
    e.append(Spacer(1,20)); e.append(it); e.append(Spacer(1,40))
    e.append(Paragraph("Este documento describe cada metrica del modulo de Presupuesto, explicando la estructura "
                        "de costos y precios de venta del proyecto, la composicion del AIU, la financiacion, "
                        "y el impacto del costo financiero real en el margen.",
                        ParagraphStyle('d', fontName='Helvetica-Oblique', fontSize=9, textColor=S5, alignment=TA_CENTER, leading=13)))
    e.append(PageBreak())
    return e

def toc_page(st):
    e = [Paragraph("Tabla de Contenido", st['ST']), div()]
    items = [("1.","Tarjetas KPI — Indicadores Macro",3),("  1.1","Valor Oferta (Venta)",3),("  1.2","Costo Total Ajustado",3),
             ("  1.3","Margen Bruto Ajustado",4),("  1.4","Sobrecosto Financiero",4),
             ("  1.5","CPI Proyectado (sobre costo total)",5),("  1.6","% Utilidad Esperada",5),
             ("2.","Tabla de Presupuesto — Estructura",6),("  2.1","Capitulos de Obra (1-15)",6),
             ("  2.2","Costo Directo (CD)",5),("  2.3","AIU: Administracion e Imprevistos",5),
             ("  2.4","Financiacion (Dato Real)",6),("  2.5","Total Oferta",6),
             ("3.","Analisis de Margen por Capitulo",6),("4.","Estructura de la Oferta",7),
             ("5.","Alertas y Riesgos Presupuestarios",8),("6.","Fuentes de Datos",9)]
    data = []
    for num, title, pg in items:
        indent = "    " if num.startswith("  ") else ""
        fn = 'Helvetica' if num.startswith("  ") else 'Helvetica-Bold'
        fs = 8.5 if num.startswith("  ") else 9.5
        data.append([Paragraph(f'{indent}{num.strip()}', ParagraphStyle('tn', fontName=fn, fontSize=fs, textColor=S5)),
                     Paragraph(title, ParagraphStyle('tt', fontName=fn, fontSize=fs, textColor=S9)),
                     Paragraph(str(pg), ParagraphStyle('tp', fontName='Helvetica', fontSize=fs, textColor=S4, alignment=TA_RIGHT))])
    tt = Table(data, colWidths=[40,380,40])
    tt.setStyle(TableStyle([('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3),('LINEBELOW',(0,0),(-1,-1),0.3,S1)]))
    e.append(tt); e.append(PageBreak())
    return e

def content(st):
    e = []
    # === SECTION 1 ===
    e.append(Paragraph("1. Tarjetas KPI — Indicadores Macro", st['ST'])); e.append(div())
    e.append(Paragraph("La primera fila de tarjetas presenta los 6 indicadores financieros macro del presupuesto: "
                        "Valor Oferta, Costo Ajustado, Margen, Sobrecosto, CPI Proyectado y % Utilidad Esperada. "
                        "Estos valores reflejan la situacion real del proyecto, con el costo financiero actualizado "
                        "del credito bancario ($2.211B vs $1.375B estimado).", st['B']))

    e.append(Paragraph("1.1 Valor Oferta (Venta)", st['SS']))
    e.extend(mb(st, "BAC", "Valor Oferta Total", "$ 41.012.884.481 COP",
        "Precio global fijo de la Oferta Mercantil. Incluye: costo directo de 15 capitulos ($31.225B venta) "
        "+ AIU ($4.384B: Administracion 11%, Imprevistos 2%, Utilidad 4%) + IVA sobre utilidad ($247M) "
        "+ Financiacion ($3.077B). Es el ingreso total que recibira PC Mejia al completar la obra.",
        "Hoja 'RESUMEN VENTA' del Excel 'Detallado caso de negocio_220126.xlsx' — celda TOTAL OFERTA.",
        "Este valor es fijo y no cambia salvo otrosies (adiciones contractuales). Representa el 'techo' "
        "de ingresos del proyecto.", color=P))

    e.append(Paragraph("1.2 Costo Total Ajustado", st['SS']))
    e.extend(mb(st, "CTA", "Costo Total Ajustado", "$ 30.293.164.387 COP",
        "Costo total del proyecto ACTUALIZADO con el costo financiero real del credito bancario. "
        "Composicion: Costo Directo $24.274B + Administracion $2.445B + Imprevistos $485M "
        "+ IVA importaciones $248M + ITS $383M + Financiacion REAL $2.211B. "
        "El costo original estimaba financiacion de $1.375B, resultando en $29.457B total.",
        "Hojas 'Costo vs Venta' y 'Admon Patios' del caso de negocio para los costos base. "
        "Hoja 'CREDITO' del Excel 'Proyeccion de Pagos Patio Sur.xlsx' para el costo financiero real "
        "($17B de credito a IBR+2.85, 13.65% EA, intereses totales $2.211B).",
        "El costo ajustado es $836M mayor al original. Esto reduce el margen de 28.2% a 26.1%, "
        "pero el proyecto sigue siendo rentable.", color=S9))

    e.append(Paragraph("1.3 Margen Bruto Ajustado", st['SS']))
    e.extend(mb(st, "MBA", "Margen Bruto Ajustado", "$ 10.719.720.094 COP (26.1%)",
        "Diferencia entre Venta ($41.013B) y Costo Ajustado ($30.293B). El margen original era "
        "$11.556B (28.2%) pero el sobrecosto financiero de $836M lo reduce a $10.720B (26.1%). "
        "Este es el indicador mas realista de la rentabilidad esperada del proyecto.",
        "Calculo: $41,012,884,481 - $30,293,164,387 = $10,719,720,094. Porcentaje: 26.1%.",
        "Un margen de 26.1% sigue siendo saludable para infraestructura electrica. Sin embargo, "
        "si la obra se retrasa, cada mes adicional reduce ~$195M de margen por intereses extra.", color=EM))

    e.append(Paragraph("1.4 Sobrecosto Financiero", st['SS']))
    e.extend(mb(st, "SCF", "Sobrecosto Financiero", "$ 836.000.000 COP (+61%)",
        "Diferencia entre el costo financiero real ($2.211B) y el estimado en la oferta ($1.375B). "
        "El credito bancario de $17B a tasa IBR+2.85 (13.65% EA) genera intereses por $2.211B, "
        "cuando la oferta solo preveia $1.375B de costo financiero.",
        "Hoja 'CREDITO' del Excel 'Proyeccion de Pagos Patio Sur.xlsx' (costo real) vs "
        "Hoja 'Admon Patios' del caso de negocio (costo estimado original).",
        "Aun con el sobrecosto, la oferta incluye $3.077B para financiacion, dejando un margen "
        "financiero neto de $866M ($3.077B - $2.211B). El riesgo es si la obra se extiende.", color=RD))

    cpi_proy = 41012884481 / 30293164387
    pct_util = (10719720094 / 41012884481) * 100

    e.append(Paragraph("1.5 CPI Proyectado (sobre costo total)", st['SS']))
    e.extend(mb(st, "CPI<sub>proy</sub>", "CPI Proyectado", f"{cpi_proy:.2f}",
        "Indice de Desempeno de Costo calculado sobre el COSTO TOTAL PROYECTADO del proyecto, "
        "no sobre la ejecucion a la fecha. Formula: Valor Venta / Costo Total Ajustado = "
        "$41.013B / $30.293B = 1.35. A diferencia del CPI de ejecucion (EV/AC = 1.54, que mide "
        "la eficiencia del gasto ya realizado), este CPI mide la RENTABILIDAD GLOBAL ESPERADA "
        "del proyecto completo una vez finalizado.",
        "Calculo: $41,012,884,481 (Venta, hoja RESUMEN VENTA) / $30,293,164,387 (Costo Ajustado, "
        "hojas Costo vs Venta + CREDITO).",
        "Un valor de 1.35 significa que por cada $1 de costo proyectado se generan $1.35 de ingreso. "
        "Si el CPI baja de 1.0, el proyecto entraria en perdida. Actualmente el margen es suficiente, "
        "pero si la obra se extiende (SPI=0.64) y el costo financiero crece, este CPI se deteriora.",
        color=HexColor('#4F46E5')))

    e.append(Paragraph("1.6 % Utilidad Esperada", st['SS']))
    e.extend(mb(st, "% Util", "Porcentaje de Utilidad Esperada", f"{pct_util:.1f} %",
        "Porcentaje de utilidad neta esperada sobre el valor de venta del proyecto. "
        "Formula: (Margen Ajustado / Venta Total) x 100 = ($10.720B / $41.013B) x 100 = 26.1%. "
        "Representa la ganancia real proyectada despues de considerar TODOS los costos: directos "
        "(15 capitulos), indirectos (AIU) y financiacion real ($2.211B).",
        "Calculo: $10,719,720,094 (Margen Ajustado) / $41,012,884,481 (Venta Total) x 100. "
        "Fuentes: hojas 'Costo vs Venta', 'RESUMEN VENTA' del caso de negocio + hoja 'CREDITO'.",
        "El % original era 28.2% con financiacion estimada ($1.375B). El sobrecosto de $836M "
        "lo redujo 2.1 puntos porcentuales. Para una obra de infraestructura electrica de $41B, "
        "un margen del 26% es saludable pero debe monitorearse: cada mes de atraso erosiona ~0.5pp.",
        color=HexColor('#0D9488')))

    e.append(PageBreak())

    # === SECTION 2 ===
    e.append(Paragraph("2. Tabla de Presupuesto — Estructura", st['ST'])); e.append(div())
    e.append(Paragraph("La tabla principal del presupuesto presenta 20 filas: 15 capitulos de obra directa, "
                        "2 partidas de costos indirectos (Administracion e Imprevistos), financiacion, "
                        "y 3 subtotales/totales. Cada fila muestra Venta, Costo, Margen y Estado.", st['B']))

    e.append(Paragraph("2.1 Capitulos de Obra (1-15)", st['SS']))
    e.append(Paragraph("Los 15 capitulos cubren todo el alcance tecnico del proyecto:", st['B']))

    chapters = [
        ('1', 'Estudios y Disenos', 419047180, 312727205, 25.4, 'Ingenieria de detalle, memorias de calculo, planos'),
        ('2', 'Conexion a la Red', 519268407, 369435063, 28.9, 'Conexion del patio al sistema electrico de Enel/Codensa'),
        ('3', 'Redes MT (Celdas)', 2893959054, 2046582157, 29.3, 'Redes de media tension, celdas de proteccion'),
        ('4', 'Subestaciones (Shelter)', 3406137000, 2692179338, 21.0, 'Subestaciones prefabricadas tipo shelter'),
        ('5', 'Transformadores', 2338037308, 2115002279, 9.5, 'Transformadores de potencia (WEG)'),
        ('6', 'Baja Tension (BT)', 3856386116, 2864635880, 25.7, 'Tableros, cables y acometidas de baja tension'),
        ('7', 'SPE y SPT', 262823529, 257800000, 1.9, 'Sistema de puesta a tierra y proteccion electrica'),
        ('8', 'Comunicaciones', 701469115, 264839198, 62.2, 'Red de datos, fibra optica, SCADA'),
        ('9', 'Suministro Cargadores', 6743603237, 5330376000, 21.0, 'Cargadores electricos Starcharge 450kW'),
        ('10', 'Instalacion Cargadores', 261567164, 191000000, 27.0, 'Mano de obra instalacion de cargadores'),
        ('11', 'Iluminacion y Aux.', 147984032, 125786428, 15.0, 'Iluminacion exterior y circuitos auxiliares'),
        ('12', 'Comp. Reactiva', 547200000, 751864128, -37.4, 'Bancos de condensadores (MARGEN NEGATIVO)'),
        ('13', 'Det. Incendios', 270082618, 227943849, 15.6, 'Sistema de deteccion y alarma contra incendios'),
        ('14', 'Obras Civiles', 8177142400, 6537881527, 20.0, 'Cimentaciones, estructura, vias, canalizaciones'),
        ('15', 'Tramites', 679896358, 186229084, 72.6, 'Licencias, permisos, certificaciones, inspecciones'),
    ]

    def fmtM(v):
        if abs(v) >= 1e9: return f'${v/1e9:.1f}B'
        return f'${v/1e6:.0f}M'

    ch_data = [[Paragraph('<b>Cap</b>', st['TH']), Paragraph('<b>Descripcion</b>', st['TH']),
                 Paragraph('<b>Venta</b>', st['TH']), Paragraph('<b>Costo</b>', st['TH']),
                 Paragraph('<b>Margen %</b>', st['TH']), Paragraph('<b>Alcance</b>', st['TH'])]]
    for code, name, venta, costo, margen, alcance in chapters:
        mc = EM if margen >= 10 else (AM if margen >= 0 else RD)
        ch_data.append([
            Paragraph(code, st['TCB']),
            Paragraph(name, st['TC']),
            Paragraph(fmtM(venta), st['TCR']),
            Paragraph(fmtM(costo), st['TCR']),
            Paragraph(f'{margen:.1f}%', ParagraphStyle('m', parent=st['TCBR'], textColor=mc)),
            Paragraph(alcance, ParagraphStyle('a', fontName='Helvetica', fontSize=7, textColor=S5, leading=9)),
        ])
    # Total row
    ch_data.append([Paragraph('<b>CD</b>', st['TCB']), Paragraph('<b>COSTO DIRECTO</b>', st['TCB']),
                     Paragraph('<b>$31.2B</b>', st['TCBR']), Paragraph('<b>$24.3B</b>', st['TCBR']),
                     Paragraph('<b>22.3%</b>', ParagraphStyle('mt', parent=st['TCBR'], textColor=EM)),
                     Paragraph('Suma de 15 capitulos', ParagraphStyle('at', fontName='Helvetica-Oblique', fontSize=7, textColor=S5))])
    cht = Table(ch_data, colWidths=[25, 95, 55, 55, 50, 220])
    cht.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),P),('GRID',(0,0),(-1,-1),0.5,S2),
                              ('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3),('LEFTPADDING',(0,0),(-1,-1),3),
                              ('ROWBACKGROUNDS',(0,1),(-1,-2),[W,S0]),('BACKGROUND',(0,-1),(-1,-1),PBG),
                              ('VALIGN',(0,0),(-1,-1),'MIDDLE'),('BACKGROUND',(0,12),(-1,12),RBG)]))
    e.append(cht)
    e.append(Paragraph('Fuente: Hoja "Costo vs Venta" del Excel "Detallado caso de negocio_220126.xlsx".', st['Src']))

    e.append(PageBreak())

    # 2.3 AIU
    e.append(Paragraph("2.3 AIU: Administracion e Imprevistos", st['SS']))
    e.extend(mb(st, "AIU", "Administracion, Imprevistos y Utilidad", "17% sobre Costo Directo",
        "El AIU es el porcentaje que se agrega al costo directo para cubrir costos indirectos:\n"
        "- Administracion (11%): Director de proyecto, coordinador, residentes, HSE, calidad, "
        "oficinas, vehiculos, seguros, garantias, papeleria.\n"
        "- Imprevistos (2%): Reserva para contingencias y variaciones de precios.\n"
        "- Utilidad (4%): Ganancia contractual de PC Mejia. Se aplica IVA 19% sobre la utilidad ($247M).",
        "Hoja 'Admon Patios' del Excel del caso de negocio. Contiene el desglose detallado de cada "
        "componente del AIU con nombres de cargos, salarios, duraciones y costos unitarios.",
        "Los porcentajes (11%+2%+4%=17%) son estandar de la industria para proyectos de "
        "infraestructura electrica de esta magnitud en Colombia."))

    # 2.4 Financiacion
    e.append(Paragraph("2.4 Financiacion (Dato Real Actualizado)", st['SS']))
    fin_data = [[Paragraph('<b>Concepto</b>', st['TH']), Paragraph('<b>Valor</b>', st['TH']),
                  Paragraph('<b>Significado</b>', st['TH']), Paragraph('<b>Fuente</b>', st['TH'])],
        [Paragraph('Valor en Oferta (Venta)', st['TCB']), Paragraph('$3,077,349,397', st['TCR']),
         Paragraph('Monto cobrado al cliente por el concepto de financiacion', st['TC']),
         Paragraph('Hoja RESUMEN VENTA', st['TC'])],
        [Paragraph('Costo Estimado Original', st['TCB']), Paragraph('$1,375,000,000', st['TCR']),
         Paragraph('Estimacion de intereses incluida en el caso de negocio', st['TC']),
         Paragraph('Hoja Admon Patios', st['TC'])],
        [Paragraph('Costo Financiero REAL', ParagraphStyle('cfr', parent=st['TCB'], textColor=RD)),
         Paragraph('$2,211,000,000', ParagraphStyle('cf2', parent=st['TCBR'], textColor=RD)),
         Paragraph('Intereses reales: credito $17B a IBR+2.85 (13.65% EA)', st['TC']),
         Paragraph('Hoja CREDITO - Excel Pagos', st['TC'])],
        [Paragraph('Sobrecosto', ParagraphStyle('sc', parent=st['TCB'], textColor=RD)),
         Paragraph('$836,000,000', ParagraphStyle('sc2', parent=st['TCBR'], textColor=RD)),
         Paragraph('Real - Estimado. Reduce margen directamente.', st['TC']),
         Paragraph('Calculo', st['TC'])],
        [Paragraph('Margen Financiero Neto', ParagraphStyle('mfn', parent=st['TCB'], textColor=EM)),
         Paragraph('$866,349,397', ParagraphStyle('mf2', parent=st['TCBR'], textColor=EM)),
         Paragraph('Lo que queda: Oferta ($3.077B) - Real ($2.211B)', st['TC']),
         Paragraph('Calculo', st['TC'])]]
    e.append(tbl(fin_data, [115, 90, 175, 120]))
    e.append(Paragraph('Nota: La tabla del presupuesto muestra el costo financiero REAL ($2.211B) en la fila "F", '
                        'reemplazando el estimado original ($1.375B).', st['Src']))

    # 2.5 Total
    e.append(Paragraph("2.5 Total Oferta", st['SS']))
    e.extend(mb(st, "T", "Total Oferta", "Venta $41.013B / Costo $30.293B / Margen 26.1%",
        "Linea final del presupuesto que resume: precio de venta total, costo total ajustado con "
        "financiacion real, y margen bruto resultante. Incluye: CD + AIU + IVA + Financiacion Real.",
        "Sumatoria de todas las partidas. Costo ajustado con dato real de la hoja CREDITO.",
        "El margen de 26.1% es la referencia para el control financiero del proyecto. "
        "Cualquier sobrecosto adicional reduce este margen directamente.", color=P))

    e.append(PageBreak())

    # === SECTION 3 ===
    e.append(Paragraph("3. Analisis de Margen por Capitulo", st['ST'])); e.append(div())
    e.append(Paragraph("Clasificacion de los 15 capitulos segun su nivel de margen:", st['B']))

    risk_data = [[Paragraph('<b>Clasificacion</b>', st['TH']), Paragraph('<b>Condicion</b>', st['TH']),
                   Paragraph('<b>Capitulos</b>', st['TH']), Paragraph('<b>Accion</b>', st['TH'])],
        [Paragraph('PERDIDA', ParagraphStyle('p', parent=st['TCB'], textColor=RD)),
         Paragraph('Margen < 0%', st['TC']),
         Paragraph('Comp. Reactiva (-37.4%)', ParagraphStyle('r1', parent=st['TC'], textColor=RD)),
         Paragraph('Renegociar alcance con proveedor o solicitar adicion contractual', st['TC'])],
        [Paragraph('BAJO', ParagraphStyle('b2', parent=st['TCB'], textColor=AM)),
         Paragraph('0% - 10%', st['TC']),
         Paragraph('SPE/SPT (1.9%), Transformadores (9.5%)', ParagraphStyle('r2', parent=st['TC'], textColor=AM)),
         Paragraph('Control estricto de cantidades y precios. No aprobar extras sin autorizacion.', st['TC'])],
        [Paragraph('MODERADO', ParagraphStyle('m2', parent=st['TCB'], textColor=P)),
         Paragraph('10% - 25%', st['TC']),
         Paragraph('Iluminacion (15%), Det. Incendios (15.6%), Subestaciones (21%), Cargadores (21%), Obras Civiles (20%)', st['TC']),
         Paragraph('Monitoreo periodico. Aprobar cambios solo si mantienen margen > 10%.', st['TC'])],
        [Paragraph('ALTO', ParagraphStyle('a2', parent=st['TCB'], textColor=EM)),
         Paragraph('> 25%', st['TC']),
         Paragraph('Estudios (25.4%), Conexion Red (28.9%), Redes MT (29.3%), BT (25.7%), '
                    'Inst. Cargadores (27%), Comunicaciones (62.2%), Tramites (72.6%)', st['TC']),
         Paragraph('Capitulos "colchon" que compensan los de bajo margen. Proteger estos margenes.', st['TC'])]]
    e.append(tbl(risk_data, [70, 55, 200, 175]))
    e.append(Paragraph('El 73% del costo directo se concentra en 4 capitulos: Obras Civiles (27%), '
                        'Cargadores (22%), BT (12%) y Subestaciones (11%). Estos son los de mayor impacto.', st['Src']))

    # === SECTION 4 ===
    e.append(Paragraph("4. Estructura de la Oferta", st['ST'])); e.append(div())
    e.append(Paragraph("Composicion del precio de venta de $41.013B que se cobra al cliente:", st['B']))

    struct_data = [[Paragraph('<b>Componente</b>', st['TH']), Paragraph('<b>Venta</b>', st['TH']),
                     Paragraph('<b>Costo</b>', st['TH']), Paragraph('<b>% del Precio</b>', st['TH']),
                     Paragraph('<b>Significado</b>', st['TH'])],
        [Paragraph('Costo Directo (15 cap.)', st['TCB']), Paragraph('$31,225M', st['TCR']),
         Paragraph('$24,274M', st['TCR']), Paragraph('76.1%', st['TCR']),
         Paragraph('Materiales, equipos, mano de obra, servicios', st['TC'])],
        [Paragraph('Administracion (11%)', st['TCB']), Paragraph('$3,734M', st['TCR']),
         Paragraph('$2,445M', st['TCR']), Paragraph('9.1%', st['TCR']),
         Paragraph('Personal indirecto, oficinas, seguros', st['TC'])],
        [Paragraph('Imprevistos (2%)', st['TCB']), Paragraph('$649M', st['TCR']),
         Paragraph('$485M', st['TCR']), Paragraph('1.6%', st['TCR']),
         Paragraph('Reserva de contingencia', st['TC'])],
        [Paragraph('Utilidad (4%)', st['TCB']), Paragraph('$1,299M', st['TCR']),
         Paragraph('-', st['TCR']), Paragraph('3.2%', st['TCR']),
         Paragraph('Ganancia contractual de PC Mejia', st['TC'])],
        [Paragraph('IVA Utilidad (19%)', st['TCB']), Paragraph('$247M', st['TCR']),
         Paragraph('$247M', st['TCR']), Paragraph('0.6%', st['TCR']),
         Paragraph('Impuesto sobre la utilidad', st['TC'])],
        [Paragraph('ITS + IVA import.', st['TCB']), Paragraph('-', st['TCR']),
         Paragraph('$631M', st['TCR']), Paragraph('-', st['TCR']),
         Paragraph('Impuesto timbre + IVA cargadores importados', st['TC'])],
        [Paragraph('Financiacion', st['TCB']), Paragraph('$3,077M', st['TCR']),
         Paragraph('$2,211M*', ParagraphStyle('fr', parent=st['TCBR'], textColor=RD)), Paragraph('7.5%', st['TCR']),
         Paragraph('9 meses sin ingresos. *Costo REAL del credito', st['TC'])],
        [Paragraph('<b>TOTAL</b>', st['TCB']), Paragraph('<b>$41,013M</b>', st['TCBR']),
         Paragraph('<b>$30,293M*</b>', st['TCBR']), Paragraph('<b>100%</b>', st['TCBR']),
         Paragraph('* Con costo financiero real', st['TC'])]]
    e.append(tbl(struct_data, [95, 65, 65, 55, 220]))
    e.append(Paragraph('Fuente: Hojas "RESUMEN VENTA", "Costo vs Venta" y "Admon Patios" del caso de negocio. '
                        'Financiacion real de la hoja "CREDITO" del Excel de Pagos.', st['Src']))

    e.append(PageBreak())

    # === SECTION 5 ===
    e.append(Paragraph("5. Alertas y Riesgos Presupuestarios", st['ST'])); e.append(div())

    alerts = [
        ("CRITICO", RD, RBG, "Compensacion Reactiva: Margen Negativo (-37.4%)",
         "Unico capitulo con perdida directa. Costo $751,864,128 supera venta $547,200,000 por $204,664,128. "
         "Requiere renegociacion de alcance con proveedor o solicitud de adicion contractual al cliente.",
         "Hoja 'Costo vs Venta' — fila Comp. Reactiva. Comparacion directa columnas Venta vs Costo."),
        ("CRITICO", RD, RBG, "Sobrecosto Financiero Confirmado: +$836M (+61%)",
         "El costo financiero real ($2,211M) supera el estimado ($1,375M) por $836M. Causa: credito de $17B "
         "a tasa IBR+2.85 (13.65% EA), mas alto que la tasa asumida en la oferta. Si la obra se extiende "
         "2 meses (SPI=0.64 sugiere retraso), el sobrecosto adicional seria de ~$390M.",
         "Hoja 'CREDITO' del Excel de Pagos vs Hoja 'Admon Patios' del caso de negocio."),
        ("ALTO", AM, ABG, "Capitulos con Margen Bajo: SPE/SPT (1.9%) y Transformadores (9.5%)",
         "Estos capitulos tienen margen insuficiente para absorber variaciones. SPE/SPT tiene solo $5M de margen "
         "sobre $263M de venta. Transformadores tiene $223M de margen sobre $2.338B pero por su alto valor, "
         "cualquier sobrecosto del 5% genera una perdida de $106M.",
         "Hoja 'Costo vs Venta' — filas SPE/SPT y Transformadores."),
        ("POSITIVO", EM, EBG, "Margen Global Robusto: 26.1% aun con sobrecostos",
         "A pesar del sobrecosto financiero de $836M y el capitulo con margen negativo ($205M de perdida), "
         "el proyecto mantiene un margen global de 26.1% ($10.720B). Los capitulos de alto margen "
         "(Comunicaciones 62.2%, Tramites 72.6%, Redes MT 29.3%) compensan las debilidades.",
         "Calculo global: ($41.013B - $30.293B) / $41.013B = 26.1%.")]

    for sev, color, bg, title, desc, source in alerts:
        a_data = [[Paragraph(f'<b>[{sev}] {title}</b>', ParagraphStyle('at', fontName='Helvetica-Bold', fontSize=9, textColor=color))],
                   [Paragraph(f'<b>Descripcion:</b> {desc}', st['B'])],
                   [Paragraph(f'<b>Fuente:</b> {source}', st['Src'])]]
        at = Table(a_data, colWidths=[500])
        at.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),bg),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),3),
                                 ('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,-1),(-1,-1),8)]))
        e.append(at); e.append(Spacer(1,6))

    e.append(PageBreak())

    # === SECTION 6 ===
    e.append(Paragraph("6. Fuentes de Datos", st['ST'])); e.append(div())

    fuentes = [
        ("Excel: Detallado caso de negocio_220126.xlsx",
         "Archivo principal con 16 hojas. Las utilizadas para el Presupuesto son:\n\n"
         "- 'Costo vs Venta': 15 capitulos con columnas Venta y Costo. Total CD: $24.274B.\n"
         "- 'RESUMEN VENTA': Estructura completa de la oferta (CD + AIU + Utilidad + IVA + Financiacion).\n"
         "- 'Admon Patios': Desglose del AIU (11% + 2% + 4%), personal, costos financieros estimados."),
        ("Excel: Proyeccion de Pagos Patio Sur.xlsx",
         "Hoja 'CREDITO': Datos del credito bancario — monto $17B, tasa IBR+2.85 (13.65% EA), "
         "intereses totales $2,211,000,000. Este valor reemplaza el estimado original de $1,375,000,000 "
         "en la fila de Financiacion de la tabla presupuestal."),
        ("Oferta Mercantil — PC Mejia a Consorcio Express",
         "Documento contractual que define: precio global fijo ($41.013B), plazo (9 meses), "
         "forma de pago (total contra entrega), clausula penal (20% = $8.2B), "
         "y garantias requeridas (cumplimiento, salarios, calidad, estabilidad, RC).")]

    for i, (nombre, desc) in enumerate(fuentes):
        f_data = [[Paragraph(f'<b>{i+1}. {nombre}</b>', ParagraphStyle('fn', fontName='Helvetica-Bold', fontSize=10, textColor=P))],
                   [Paragraph(desc, st['B'])]]
        ft = Table(f_data, colWidths=[500])
        ft.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),PBG),('TOPPADDING',(0,0),(-1,-1),6),
                                 ('BOTTOMPADDING',(0,0),(-1,-1),6),('LEFTPADDING',(0,0),(-1,-1),10)]))
        e.append(ft); e.append(Spacer(1,4))

    e.append(Spacer(1,20))
    summ = ("<b>Resumen Ejecutivo:</b> El presupuesto del proyecto Patio de Operacion Sur presenta un margen "
            "bruto ajustado de 26.1% ($10.720B), considerando el costo financiero real de $2.211B (vs $1.375B estimado). "
            "De los 15 capitulos, 1 tiene margen negativo (Comp. Reactiva -37.4%) y 2 tienen margen bajo (<10%). "
            "El 73% del costo se concentra en 4 capitulos clave. El sobrecosto financiero de $836M (+61%) "
            "es el principal riesgo identificado. Aun asi, el margen es robusto para la industria.")
    sd = [[Paragraph(summ, ParagraphStyle('sum', fontName='Helvetica', fontSize=9, textColor=PD, leading=13))]]
    st2 = Table(sd, colWidths=[500])
    st2.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PBG),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),
                              ('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12)]))
    e.append(st2)
    return e

# ============================================================
def main():
    doc = Doc(OUTPUT, pagesize=letter, topMargin=65, bottomMargin=45, leftMargin=40, rightMargin=40)
    styles = S()
    elements = cover(styles) + toc_page(styles) + content(styles)
    doc.build(elements)
    print(f"PDF generado: {OUTPUT}")

if __name__ == "__main__":
    main()
