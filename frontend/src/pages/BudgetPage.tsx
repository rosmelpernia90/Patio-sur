import { useState } from 'react';
import { AlertTriangle, Package, HardHat, Briefcase, Wrench, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { ElementType } from 'react';

const fmtM = (v: number) => Math.round(v / 1_000_000).toLocaleString('es-CO') + ' M';
const fmtCOP = (v: number) => '$' + Math.round(v).toLocaleString('es-CO');

interface Item { item: string; desc: string; un?: string; qty?: number | null; costo: number; venta: number }
interface ChSection { id: string; nombre: string; items: Item[] }
interface Chapter { id: string; nombre: string; sections: ChSection[] }
interface Grupo { id: string; nombre: string; desc: string; color: string; colorBg: string; colorText: string; colorBorder: string; icon: ElementType; chapters: Chapter[] }

const GRUPOS: Grupo[] = [
  {
    id: 'materiales', nombre: 'Materiales y Equipos',
    desc: 'Suministro de equipos electromecánicos, cargadores, cables y materiales',
    color: '#1b5eab', colorBg: 'bg-primary-50', colorText: 'text-primary-700', colorBorder: 'border-primary-200', icon: Package,
    chapters: [
      {
        id: '12', nombre: 'CARGADORES',
        sections: [{
          id: '12', nombre: 'Módulos de Potencia, Dispensadores y Controladores',
          items: [
            { item: '12.2', desc: 'Módulo de Potencia 720KW', un: 'u', qty: 17, costo: 3523420000, venta: 3914911111 },
            { item: '12.3', desc: 'Dispensador Triton', un: 'u', qty: 80, costo: 1290000000, venta: 1433333333 },
            { item: '12.4', desc: 'Controlador con Pantalla', un: 'u', qty: 17, costo: 146200000, venta: 162444444 },
            { item: '12.5', desc: 'Cable de control 2×18AWG blindado', un: 'm', qty: 4091, costo: 34949413, venta: 38832681 },
            { item: '12.7', desc: 'Transporte internacional FOB Shanghai – Buenaventura', un: 'sg', qty: 1, costo: 90000000, venta: 100000000 },
            { item: '12.8', desc: 'Instalación de Módulo de Potencia 480/720kW', un: 'u', qty: 17, costo: 21250000, venta: 31716418 },
            { item: '12.9', desc: 'Instalación de Dispensador Triton', un: 'u', qty: 80, costo: 140000000, venta: 208955224 },
            { item: '12.10', desc: 'Instalación de Controlador con pantalla', un: 'u', qty: 17, costo: 29750000, venta: 44402985 },
            { item: '12.11', desc: 'Elevadores manguera piso 2', un: 'u', qty: 80, costo: 252756000, venta: 297360000 },
            { item: '12.12', desc: 'Soportes mangueras piso 1 y 2', un: 'u', qty: 80, costo: 28000000, venta: 28000000 },
          ],
        }],
      },
      {
        id: '2', nombre: 'SUBESTACIÓN ELÉCTRICA',
        sections: [
          {
            id: '2.1', nombre: 'Subestación Principal Media Tensión 35kV — Celdas',
            items: [
              { item: '2.1.1', desc: 'Celda de Entrada/Salida (Seccionador sin fusible)', un: 'u', qty: 2, costo: 77104558, venta: 91129367 },
              { item: '2.1.2', desc: 'Celda de Medida en MT — incluye 3TC y 3TP 34.5kV', un: 'u', qty: 1, costo: 88527721, venta: 104630329 },
              { item: '2.1.3', desc: 'Celda Interruptor de protección compacta 35kV', un: 'u', qty: 1, costo: 123105835, venta: 145497973 },
              { item: '2.1.4', desc: 'Celda remonte tipo compacta — SE Principal', un: 'u', qty: 1, costo: 22330069, venta: 26391761 },
              { item: '2.1.5', desc: 'Celda seccionador-fusible QM 35kV — Salida subestaciones patio', un: 'u', qty: 6, costo: 253181459, venta: 299233494 },
              { item: '2.1.6', desc: 'Zócalo técnico metálico 50cm para celdas compactas — SE Principal', un: 'm', qty: 9, costo: 12417821, venta: 14676541 },
            ],
          },
          {
            id: '2.2', nombre: 'Subestaciones Islas MT — Transformadores y Celdas',
            items: [
              { item: '2.2.1', desc: 'Celda remonte tipo compacta (Islas)', un: 'u', qty: 6, costo: 133980411, venta: 158350563 },
              { item: '2.2.3', desc: 'Celda Interruptor de protección compacta 35kV (Islas)', un: 'u', qty: 6, costo: 738635009, venta: 872987837 },
              { item: '2.2.4', desc: 'Descargadores distribución MT 35kV 10kA ZNO', un: 'jgo', qty: 6, costo: 12654584, venta: 14956370 },
              { item: '2.2.5', desc: 'Celda Transformador seco 1500kVA', un: 'u', qty: 2, costo: 32201194, venta: 35601099 },
              { item: '2.2.6', desc: 'Transformador seco en resina clase F trifásico 1500kVA 34500/400V', un: 'u', qty: 2, costo: 511628250, venta: 565647595 },
              { item: '2.2.7', desc: 'Celda Transformador seco 2250kVA', un: 'u', qty: 3, costo: 50718408, venta: 56073420 },
              { item: '2.2.8', desc: 'Transformador seco en resina clase F trifásico 2250kVA 34500/400V', un: 'u', qty: 3, costo: 1058873514, venta: 1170672763 },
              { item: '2.2.11', desc: 'Celda Transformador seco 3000kVA', un: 'u', qty: 1, costo: 16906136, venta: 18691140 },
              { item: '2.2.12', desc: 'Transformador seco en resina clase F trifásico 3000kVA 34500/400V', un: 'u', qty: 1, costo: 429152500, venta: 474463792 },
              { item: '2.2.13', desc: 'Zócalo técnico metálico 50cm — Celdas Islas', un: 'm', qty: 11.25, costo: 15522276, venta: 17161168 },
            ],
          },
          {
            id: '2.3-MT', nombre: 'Alimentadores MT 35kV — Cables y Terminales',
            items: [
              { item: '2.3.1', desc: 'Cable Cu 1/0 AWG XLPE 133% aislamiento 35kV — Interconexión MT Islas', un: 'm', qty: 1339, costo: 527552704, venta: 623511055 },
              { item: '2.3.6', desc: 'Terminales premoldeados interior 35kV cable 1/0 AWG Cu XLPE', un: 'jgo', qty: 28, costo: 57091986, venta: 67476641 },
            ],
          },
          {
            id: '2.3-CANT', nombre: 'Canalizaciones MT Islas — Tubería PVC y Cajas CODENSA',
            items: [
              { item: '2.3.2', desc: 'Canalización Tubería PVC ∅6" norma CODENSA', un: 'm', qty: 1567, costo: 159137578, venta: 188083652 },
              { item: '2.3.3', desc: 'Canalización Tubería PVC ∅6" atracada norma CODENSA', un: 'm', qty: 330, costo: 53982017, venta: 63800989 },
              { item: '2.3.4', desc: 'Caja de paso MT norma CS276-1 — Enlace SE Islas', un: 'u', qty: 9, costo: 86201644, venta: 101881153 },
              { item: '2.3.5', desc: 'Cajas CS 280 norma CODENSA vehicular', un: 'u', qty: 12, costo: 102600000, venta: 121262262 },
            ],
          },
          {
            id: '2.5S', nombre: 'Subestaciones tipo Shelter — Infraestructura completa',
            items: [
              { item: '2.5.1', desc: 'Subestación tipo Shelter 4×4.5m — SE Enlace', un: 'u', qty: 1, costo: 158316637, venta: 200299389 },
              { item: '2.5.2', desc: 'Subestación tipo Shelter 4×4.5m — Islas (×6)', un: 'u', qty: 6, costo: 1113974794, venta: 1409381066 },
              { item: '2.5.3', desc: 'Subestación tipo Shelter 4×6.5m — Islas (×6)', un: 'u', qty: 6, costo: 1140181679, venta: 1442537550 },
              { item: '2.5.4', desc: 'Subestación tipo Shelter 4×6.5m — SE Enlace', un: 'u', qty: 1, costo: 279706228, venta: 353879336 },
            ],
          },
          {
            id: '2.4', nombre: 'Celdas Baja Tensión SE Islas — Tableros Generales (TGA)',
            items: [
              { item: '2.4.1', desc: 'TGA TRF 1500kVA (SE1 y SE6) 400V', un: 'u', qty: 2, costo: 204474381, venta: 283992196 },
              { item: '2.4.2', desc: 'TGA TRF 2250kVA (SE2) 400V', un: 'u', qty: 3, costo: 437483924, venta: 607616561 },
              { item: '2.4.4', desc: 'TGA TRF 3000kVA (SE4) 400V', un: 'u', qty: 1, costo: 223455000, venta: 310354167 },
            ],
          },
          {
            id: '2.5-BT', nombre: 'Alimentadores Baja Tensión — Trafo→TGA y TGA→Módulos de Potencia',
            items: [
              { item: '2.5.1', desc: 'Interconexión BT 400V Trafo 1.5MVA → Celda BT barraje 2700A', un: 'm', qty: 16, costo: 76482829, venta: 103355175 },
              { item: '2.5.2', desc: 'Interconexión BT 400V Trafo 2.25MVA → Celda BT barraje 4000A', un: 'm', qty: 24, costo: 144293090, venta: 194990662 },
              { item: '2.5.3', desc: 'Interconexión BT 400V Trafo 3MVA → Celda BT barraje 4400A', un: 'm', qty: 8, costo: 64516757, venta: 87184807 },
              { item: '2.5.A', desc: 'Interconexión BT 400V TGA → Módulo Potencia 720kW — SE#1', un: 'm', qty: 40, costo: 50977680, venta: 68888757 },
              { item: '2.5.B', desc: 'Interconexión BT 400V TGA → Módulo Potencia 720kW — SE#2', un: 'm', qty: 28, costo: 35684376, venta: 48222130 },
              { item: '2.5.C', desc: 'Interconexión BT 400V TGA → Módulo Potencia 720kW — SE#3', un: 'm', qty: 28, costo: 35684376, venta: 48222130 },
              { item: '2.5.D', desc: 'Interconexión BT 400V TGA → Módulo Potencia 720kW — SE#4', un: 'm', qty: 18, costo: 22939956, venta: 30999941 },
              { item: '2.5.E', desc: 'Interconexión BT 400V TGA → Módulo Potencia 720kW — SE#5', un: 'm', qty: 30, costo: 38233260, venta: 51666568 },
              { item: '2.5.F', desc: 'Interconexión BT 400V TGA → Módulo Potencia 720kW — SE#6', un: 'm', qty: 18, costo: 22939956, venta: 30999941 },
            ],
          },
        ],
      },
      {
        id: '3', nombre: 'SISTEMA DE MPT Y APANTALLAMIENTO + TTE INTERNACIONAL',
        sections: [{
          id: '3', nombre: 'Suministro e instalación — Lump Sum global',
          items: [
            { item: '3', desc: 'SPT, MPT, apantallamiento y transporte internacional equipos', un: 'sg', qty: 1, costo: 257800000, venta: 303294118 },
          ],
        }],
      },
      {
        id: '4', nombre: 'TABLEROS DE DISTRIBUCIÓN',
        sections: [{
          id: '4', nombre: 'Tableros de baja tensión — distribución interna',
          items: [
            { item: '4.1', desc: 'Tablero TMB 18 ctos. Totalizador 3×40A + 12 protecciones enchufables 1×20A', un: 'u', qty: 3, costo: 3461893, venta: 4678233 },
          ],
        }],
      },
      {
        id: '6', nombre: 'ALIMENTADORES BT — CABLES DC ISLAS',
        sections: [
          {
            id: '6.1', nombre: 'Cables fuerza 2×150mm² Cu — Conexión TGA a Módulos de Potencia',
            items: [
              { item: '6.1.1', desc: 'Cable Cu 2×150mm²+1N°35mm² FUERZA FLEX XLPE/PVC — Isla 1', un: 'm', qty: 1761, costo: 566732434, venta: 765854640 },
              { item: '6.1.2', desc: 'Cable Cu 2×150mm²+1N°35mm² FUERZA FLEX XLPE/PVC — Isla 2', un: 'm', qty: 1430, costo: 460208620, venta: 621903541 },
              { item: '6.1.3', desc: 'Cable Cu 2×150mm²+1N°35mm² FUERZA FLEX XLPE/PVC — Isla 3', un: 'm', qty: 765, costo: 246195521, venta: 332696650 },
              { item: '6.1.7', desc: 'Cable AL 3N°6+1N°6 THHN-THWWN — SE208V a TMB', un: 'm', qty: 767, costo: 12015139, venta: 16236675 },
            ],
          },
          {
            id: '6.2', nombre: 'Circuitos ramales por tubería — acometidas internas',
            items: [
              { item: '6.2.1', desc: '1N°12+1N°12+1N°12T Cu AWG aislamiento LSHF', un: 'm', qty: 300, costo: 100800, venta: 136216 },
              { item: '6.2.2', desc: '2N°10+1N°10+1N°12T Cu AWG aislamiento LSHF', un: 'm', qty: 854, costo: 1551718, venta: 2096916 },
            ],
          },
        ],
      },
      {
        id: '8', nombre: 'LUMINARIAS',
        sections: [
          {
            id: '8.1', nombre: 'Suministro de luminarias y equipos de emergencia',
            items: [
              { item: '8.1.1', desc: 'Luminaria LED hermética 50W sobreponer/suspender IP65 IK08 50000h L70 (S4)', un: 'u', qty: 242, costo: 62243997, venta: 73228232 },
              { item: '8.1.2', desc: 'Aviso salida emergencia LED letras verdes 4.5W autonomía 90min (E2)', un: 'u', qty: 22, costo: 2137361, venta: 2514543 },
              { item: '8.1.3', desc: 'Luminaria LED emergencia 2×0.9W sobreponer autonomía 90min (E3)', un: 'u', qty: 22, costo: 1509879, venta: 1776328 },
              { item: '8.1.4', desc: 'Luminarias especiales para cárcamo', un: 'u', qty: 10, costo: 12500000, venta: 14705882 },
            ],
          },
          {
            id: '8.2', nombre: 'Instalación de luminarias — incluye conexión, soporte y pruebas',
            items: [
              { item: '8.2.1', desc: 'Instalación Luminaria LED 50W hermética — altura 3m', un: 'u', qty: 242, costo: 7865244, venta: 9253229 },
              { item: '8.2.2', desc: 'Instalación Aviso emergencia LED — altura 3m', un: 'u', qty: 22, costo: 777004, venta: 914122 },
              { item: '8.2.3', desc: 'Instalación Luminaria emergencia — altura 3m', un: 'u', qty: 22, costo: 777004, venta: 914122 },
              { item: '8.2.4', desc: 'Instalación Luminaria cárcamo', un: 'u', qty: 10, costo: 353184, venta: 415510 },
            ],
          },
        ],
      },
      {
        id: '9', nombre: 'EQUIPOS ACTIVOS',
        sections: [{
          id: '9', nombre: 'Switches, routers y equipos de red activos',
          items: [
            { item: '9', desc: 'Suministro e instalación equipos activos de red (switches, routers, acceso)', un: 'sg', qty: 1, costo: 56653330, venta: 80933328 },
          ],
        }],
      },
      {
        id: '10', nombre: 'COMUNICACIONES (SIN EQUIPOS ACTIVOS)',
        sections: [
          {
            id: '10-infra', nombre: 'Infraestructura de red — Racks, fibra óptica, cobre y certificación',
            items: [
              { item: '10.1', desc: 'Barras de puesta a tierra para rack y gabinetes', un: 'u', qty: 3, costo: 1407982, venta: 2011403 },
              { item: '10.2', desc: 'Rack cerrado 21RU 1.22×0.51×0.3m para SE', un: 'u', qty: 3, costo: 6537817, venta: 9339739 },
              { item: '10.3', desc: 'Bandeja de fibras ópticas deslizable 50/125µm OM3 19"', un: 'u', qty: 3, costo: 1951913, venta: 2788447 },
              { item: '10.4', desc: 'Fusión de fibra óptica — Conector LC Multimodo EPÓXICO OM3/OM4', un: 'u', qty: 72, costo: 17443620, venta: 24919457 },
              { item: '10.5', desc: 'Placa adaptadora modular LC dúplex 12 fibras para bandeja', un: 'u', qty: 6, costo: 2843482, venta: 4062118 },
              { item: '10.6', desc: 'Placa adaptadora ciega de fibra SDX Leviton', un: 'u', qty: 3, costo: 105484, venta: 150691 },
              { item: '10.7', desc: 'Pigtail 3m LC OM3 12 hilos OFNR ANSI/TIA-568.3-D Leviton', un: 'u', qty: 3, costo: 425648, venta: 608068 },
              { item: '10.8', desc: 'Certificación de fibra óptica OM3 con Pigtail', un: 'u', qty: 36, costo: 1892646, venta: 2703780 },
              { item: '10.9', desc: 'Organizador de cable vertical 5" conducto ranurado', un: 'u', qty: 6, costo: 5143476, venta: 7347823 },
              { item: '10.10', desc: 'Organizador de cable horizontal 2RU conducto ranurado', un: 'u', qty: 7, costo: 1519581, venta: 2170831 },
              { item: '10.11', desc: 'Patch panel horizontal 1RU 24 puertos Cat 6A blindado', un: 'u', qty: 7, costo: 10861369, venta: 15516242 },
              { item: '10.12', desc: 'Jack Cat 6A blindado terminado sin herramienta Leviton', un: 'u', qty: 194, costo: 10380240, venta: 14828914 },
              { item: '10.13', desc: 'PDU 1RU Horizontal Nema 5-15P 120V 20A mín 12 salidas NEMA 5-20R', un: 'u', qty: 3, costo: 2981070, venta: 4258672 },
              { item: '10.14', desc: 'Fibra óptica multimodo Tight-buffered 12h 50/125µm OM3 Indoor LSZH', un: 'm', qty: 821, costo: 8660819, venta: 12372599 },
              { item: '10.15', desc: 'Cable U/FTP Cat 6A 4pr 23AWG Interior LSZH ∅6.8mm Leviton', un: 'm', qty: 4091, costo: 21458400, venta: 30654857 },
              { item: '10.16', desc: 'Certificación de punto', un: 'u', qty: 194, costo: 4371111, venta: 6244444 },
              { item: '10.17', desc: 'Bandeja tipo malla 20×5.4cm', un: 'm', qty: 886, costo: 63884286, venta: 91263265 },
              { item: '10.18', desc: 'Puesta a tierra 8 AWG en bandejas', un: 'm', qty: 886, costo: 7178726, venta: 10255323 },
              { item: '10.19', desc: 'Tubería EMT 3/4" — De bandeja a cargadores', un: 'm', qty: 262, costo: 4477528, venta: 6396468 },
              { item: '10.20', desc: 'Tubería EMT 3/4" — FO en SE', un: 'm', qty: 9, costo: 153808, venta: 219726 },
            ],
          },
          {
            id: '10-cant', nombre: 'Canalizaciones subterráneas — Comunicaciones entre SE',
            items: [
              { item: '10.21', desc: 'Canalización subterránea PVC DB 2×4" — SE a Cuarto Comunicaciones', un: 'm', qty: 247, costo: 34506861, venta: 49295515 },
              { item: '10.22', desc: 'Cajas CS 280 norma CODENSA — Comunicaciones', un: 'u', qty: 12, costo: 102600000, venta: 146571429 },
              { item: '10.23', desc: 'Obra civil para canalizaciones Comunicaciones', un: 'm', qty: 192, costo: 44631360, venta: 63759086 },
              { item: '10.24', desc: 'Obra civil para topo misil Comunicaciones', un: 'm', qty: 56, costo: 71043182, venta: 101490260 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mano_obra', nombre: 'Mano de Obra e Instalación',
    desc: 'Obra civil, estructura metálica, canalizaciones e instalaciones eléctricas',
    color: '#059669', colorBg: 'bg-emerald-50', colorText: 'text-emerald-700', colorBorder: 'border-emerald-200', icon: HardHat,
    chapters: [
      {
        id: '1', nombre: 'REDES EXTERIORES',
        sections: [
          {
            id: '1.1', nombre: 'Punto de Conexión Definitivo 9MVA — Acometida MT 35kV aérea',
            items: [
              { item: '1.1.1', desc: 'Salida de subestación CODENSA norma CTU615 — sin reconectador', un: 'sg', qty: 1, costo: 75878000, venta: 106870423 },
              { item: '1.1.2', desc: 'Estructura MT Vestida en suspensión Cruceta 34.5kV (LA673 Red)', un: 'u', qty: 8, costo: 35772243, venta: 50383441 },
              { item: '1.1.3', desc: 'Vestida LA117 CODENSA — Estructura MT Cruceta 34.5kV en poste nuevo', un: 'u', qty: 2, costo: 80000000, venta: 112676056 },
              { item: '1.1.5', desc: 'Bajante en Tubería Metálica Galvanizada ∅6" con boquilla en poste', un: 'u', qty: 2, costo: 5049349, venta: 7111759 },
              { item: '1.1.6', desc: 'Terminales premoldeados exterior 35kV cable 4/0 Cu XLPE 133%', un: 'u', qty: 6, costo: 5028960, venta: 7083042 },
              { item: '1.1.7', desc: 'Acometida MT cable Cu AWG 3N°4/0 XLPE 133% aislamiento 35kV', un: 'm', qty: 36, costo: 20020738, venta: 28198222 },
              { item: '1.1.8', desc: 'Cableado #4/0 para red de media tensión en AL', un: 'u', qty: 318, costo: 4777231, venta: 6728495 },
              { item: '1.1.9', desc: 'Poste de 14 metros para red de media tensión', un: 'sg', qty: 10, costo: 38419985, venta: 54112655 },
              { item: '1.1.10', desc: 'Viento para poste', un: 'sg', qty: 2, costo: 1685248, venta: 2373589 },
              { item: '1.1.11', desc: 'Señalización y marcaciones de canalizaciones', un: 'sg', qty: 1, costo: 450000, venta: 633803 },
              { item: '1.1.12', desc: 'Seccionador de maniobras en MT — CTS526-1', un: 'sg', qty: 1, costo: 55000000, venta: 77464789 },
            ],
          },
          {
            id: '1.2', nombre: 'Canalizaciones subterráneas — Acometida MT principal',
            items: [
              { item: '1.2.1', desc: 'Caja de paso MT doble tapa norma CS276', un: 'u', qty: 1, costo: 9240000, venta: 13014085 },
              { item: '1.2.2', desc: 'Canalización subterránea Tubería PVC DB ∅6"', un: 'm', qty: 15, costo: 6698595, venta: 9434640 },
              { item: '1.2.3', desc: 'Señalización y marcaciones de canalizaciones MT', un: 'sg', qty: 1, costo: 450000, venta: 633803 },
              { item: '1.2.4', desc: 'Cajas CS 290 norma CODENSA', un: 'sg', qty: 1, costo: 21993327, venta: 30976517 },
              { item: '1.2.5', desc: 'Obra civil para canalizaciones MT principal', un: 'm', qty: 15, costo: 8971388, venta: 11573090 },
              { item: '1.2.6', desc: 'Obra civil para topo misil MT principal', un: 'm', qty: 14, costo: 47946339, venta: 59932924 },
            ],
          },
        ],
      },
      {
        id: '5', nombre: 'CANALIZACIONES INTERNAS',
        sections: [{
          id: '5.1', nombre: 'Bandejas metálicas tipo ducto y tubería IMT — distribución interna',
          items: [
            { item: '5.1.1', desc: 'Bandeja Metálica tipo ducto 60×10 — Armarios a Dispensadores', un: 'm', qty: 73, costo: 11218901, venta: 15160677 },
            { item: '5.1.2', desc: 'Bandeja Metálica tipo ducto 50×10 — Armarios a Dispensadores', un: 'm', qty: 75, costo: 10694223, venta: 14451653 },
            { item: '5.1.3', desc: 'Bandeja Metálica tipo ducto 40×10 — Armarios a Dispensadores', un: 'm', qty: 282, costo: 35131616, venta: 47475157 },
            { item: '5.1.4', desc: 'Bandeja Metálica tipo ducto 30×10 — Armarios a Dispensadores', un: 'm', qty: 306, costo: 33328963, venta: 45039139 },
            { item: '5.1.5', desc: 'Bandeja Metálica tipo ducto 50×10 — TGA a Armarios', un: 'm', qty: 97, costo: 13831195, venta: 18690804 },
            { item: '5.1.6', desc: 'Cable de cobre desnudo N°2 AWG puesta a tierra en bandejas', un: 'm', qty: 833, costo: 17503604, venta: 23653519 },
            { item: '5.1.7', desc: 'Tubería IMT de 3/4"', un: 'm', qty: 570, costo: 35420370, venta: 47865365 },
            { item: '5.1.8', desc: 'Tubería IMT de 1"', un: 'm', qty: 285, costo: 25125885, venta: 33953899 },
          ],
        }],
      },
      {
        id: '7', nombre: 'SALIDAS ILUMINACIÓN Y TOMAS PLATAFORMAS',
        sections: [
          {
            id: '7.1', nombre: 'Tomacorrientes y servicios auxiliares',
            items: [
              { item: '7.1.1', desc: 'Salidas tomacorriente doble con polo a tierra 15A 120V — Sistema normal', un: 'u', qty: 22, costo: 3893425, venta: 4580500 },
            ],
          },
          {
            id: '7.2', nombre: 'Salidas de iluminación y control',
            items: [
              { item: '7.2.1', desc: 'Salidas para Luminaria LED hermética 101mm×1277mm 46W', un: 'u', qty: 242, costo: 25999340, venta: 30587459 },
              { item: '7.2.2', desc: 'Salidas para Aviso emergencia LED letras verdes 4.5W', un: 'u', qty: 22, costo: 2363576, venta: 2780678 },
              { item: '7.2.3', desc: 'Salidas para Luminaria LED emergencia 2×0.9W sobreponer', un: 'u', qty: 22, costo: 2363576, venta: 2780678 },
              { item: '7.2.4', desc: 'Salidas para interruptor sencillo 15A 120V', un: 'u', qty: 6, costo: 723427, venta: 851090 },
              { item: '7.2.5', desc: 'Salidas para interruptor tipo escalera sencillo 15A 120V', un: 'u', qty: 18, costo: 2279409, venta: 2681658 },
            ],
          },
        ],
      },
      {
        id: '11', nombre: 'OBRA CIVIL Y ESTRUCTURA METÁLICA',
        sections: [
          {
            id: '11-civil', nombre: 'Demoliciones, excavaciones, concreto y adecuaciones',
            items: [
              { item: '11.1', desc: 'Demolición de losa — Canalizaciones principales', un: 'm²', qty: 480, costo: 78624000, venta: 92498824 },
              { item: '11.2', desc: 'Excavación', un: 'm³', qty: 480, costo: 42840000, venta: 50400000 },
              { item: '11.3', desc: 'Relleno en material de sitio', un: 'm³', qty: 120, costo: 32844000, venta: 38640000 },
              { item: '11.4', desc: 'Reposición de losa en concreto', un: 'm³', qty: 240, costo: 400320000, venta: 470964706 },
              { item: '11.5', desc: 'Construcción dados de concreto', un: 'm³', qty: 110, costo: 183480000, venta: 215858824 },
              { item: '11.6', desc: 'Construcción dados de concreto — Shelters', un: 'm³', qty: 20, costo: 33360000, venta: 39247059 },
              { item: '11.7', desc: 'Adecuación terreno Shelters', un: 'sg', qty: 14, costo: 77000000, venta: 90588235 },
              { item: '11.8', desc: 'Acabados interiores y exteriores', un: 'sg', qty: 1, costo: 320018480, venta: 376492329 },
              { item: '11.9', desc: 'Red Hidrosanitaria', un: 'sg', qty: 1, costo: 223692454, venta: 263167593 },
              { item: '11.10', desc: 'Sistema de ventilación mecánica', un: 'sg', qty: 1, costo: 552478618, venta: 649974845 },
              { item: '11.11', desc: 'Base de concreto Módulos de Carga', un: 'u', qty: 17, costo: 127500000, venta: 150000000 },
              { item: '11.12', desc: 'Construcción de Andén de 50cm de alto', un: 'm³', qty: 53, costo: 75886354, venta: 89278064 },
            ],
          },
          {
            id: '11-metal', nombre: 'Estructura metálica — cubierta, Metaldeck y protección',
            items: [
              { item: '11.13', desc: 'Estructura metálica — 198.926 kg cubierta, Metaldeck, pernos de anclaje, tótems', un: 'kg', qty: 198926, costo: 2709478366, venta: 3187621608 },
              { item: '11.14', desc: 'Cubierta Metaldeck', un: 'm²', qty: 1272, costo: 26308819, venta: 30951552 },
              { item: '11.15', desc: 'Pernos de anclaje estructura metálica', un: 'kg', qty: 1545.81, costo: 28293842, venta: 33286872 },
              { item: '11.16', desc: 'Tótems de protección a la estructura metálica', un: 'u', qty: 77, costo: 214060000, venta: 251835294 },
            ],
          },
          {
            id: '11-cant-islas', nombre: 'Canalizaciones MT Islas — Obra civil y topo misil',
            items: [
              { item: '11.18', desc: 'Demolición de losa — Canalizaciones MT Islas', un: 'm²', qty: 30, costo: 4914000, venta: 5781176 },
              { item: '11.19', desc: 'Excavación — Canalizaciones MT Islas', un: 'm³', qty: 54, costo: 4819500, venta: 5670000 },
              { item: '11.20a', desc: 'Relleno en material de sitio — MT Islas', un: 'm³', qty: 10, costo: 2737000, venta: 3220000 },
              { item: '11.21a', desc: 'Reposición de losa en concreto — MT Islas', un: 'm³', qty: 16.2, costo: 24494400, venta: 28816941 },
              { item: '11.20', desc: 'Obra civil para canalizaciones MT Islas', un: 'm', qty: 188, costo: 112441390, venta: 140551738 },
              { item: '11.21', desc: 'Obra civil para topo misil MT Islas 2×∅6"', un: 'm', qty: 299, costo: 418048644, venta: 522560805 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'administracion', nombre: 'Administración y Estudios',
    desc: 'Diseños de ingeniería, estudios técnicos, trámites y certificaciones',
    color: '#7c3aed', colorBg: 'bg-violet-50', colorText: 'text-violet-700', colorBorder: 'border-violet-200', icon: Briefcase,
    chapters: [
      {
        id: '14', nombre: 'DISEÑOS',
        sections: [{
          id: '14', nombre: 'Ingeniería, estudios técnicos y coordinación',
          items: [
            { item: '14.1', desc: 'Diseño eléctrico y aprobación de series ante CODENSA', un: 'sg', qty: 1, costo: 0, venta: 83594566 },
            { item: '14.4', desc: 'Diseño cimentaciones estructura + shelters', un: 'sg', qty: 1, costo: 16520000, venta: 17262278 },
            { item: '14.5', desc: 'Estudio de suelos', un: 'sg', qty: 1, costo: 33957840, venta: 35483636 },
            { item: '14.6', desc: 'Topografía', un: 'sg', qty: 1, costo: 23324000, venta: 24371996 },
            { item: '14.7', desc: 'Diseños sistema contra incendios — extinción', un: 'sg', qty: 1, costo: 43399014, venta: 45349022 },
            { item: '14.8', desc: 'Diseños de detección cuartos técnicos de subestaciones', un: 'sg', qty: 1, costo: 26921851, venta: 28131506 },
            { item: '14.9a', desc: 'Aprobación diseño redes ante OR — CODENSA', un: 'sg', qty: 1, costo: 75000000, venta: 75000000 },
            { item: '14.9b', desc: 'Medida de resistividad del terreno', un: 'sg', qty: 1, costo: 1011500, venta: 1056949 },
            { item: '14.10', desc: 'Coordinación de protecciones E1 (9 MVA)', un: 'sg', qty: 1, costo: 8568000, venta: 8952978 },
            { item: '14.11', desc: 'Coordinación de protecciones E2 (4 MVA)', un: 'sg', qty: 1, costo: 4284000, venta: 4476489 },
            { item: '14.12', desc: 'Estudio de puesta en servicio E1 (9 MVA)', un: 'sg', qty: 1, costo: 7854000, venta: 8206897 },
            { item: '14.13', desc: 'Estudio de puesta en servicio E2 (4 MVA)', un: 'sg', qty: 1, costo: 3927000, venta: 4103448 },
            { item: '14.14', desc: 'Diseño Geométrico', un: 'sg', qty: 1, costo: 67960000, venta: 71013584 },
          ],
        }],
      },
      {
        id: '15', nombre: 'TRÁMITES Y CERTIFICACIONES',
        sections: [{
          id: '15', nombre: 'Certificaciones, legalización y pruebas de comisionamiento',
          items: [
            { item: '15.1', desc: 'Certificación RETIE', un: 'sg', qty: 1, costo: 85000000, venta: 103658537 },
            { item: '15.2', desc: 'Certificación RETILAP', un: 'sg', qty: 1, costo: 35000000, venta: 42682927 },
            { item: '15.3', desc: 'Legalización de proyecto ante OR — CODENSA', un: 'sg', qty: 1, costo: 45000000, venta: 54878049 },
            { item: '15.4', desc: 'Pruebas VLF para cableado XLPE', un: 'u', qty: 7, costo: 21229084, venta: 25889127 },
          ],
        }],
      },
    ],
  },
  {
    id: 'otros', nombre: 'Especiales y Contingencias',
    desc: 'Compensación reactiva y sistemas de seguridad activa contra incendio',
    color: '#f59e0b', colorBg: 'bg-amber-50', colorText: 'text-amber-700', colorBorder: 'border-amber-200', icon: Wrench,
    chapters: [
      {
        id: '13', nombre: 'COMPENSACIÓN DE REACTIVA',
        sections: [{
          id: '13', nombre: 'Banco de capacitores — costo supera venta (margen negativo)',
          items: [
            { item: '13', desc: 'Compensación de reactiva — Capacitor bank suministro e instalación', un: 'sg', qty: 1, costo: 751864128, venta: 547200000 },
          ],
        }],
      },
      {
        id: '11-inc', nombre: 'SISTEMAS CONTRA INCENDIO Y DETECCIÓN',
        sections: [{
          id: '11-inc', nombre: 'Extinción automática y detección cuartos técnicos de subestaciones',
          items: [
            { item: '11.12b', desc: 'Sistema contra incendio — extinción automática cuartos técnicos', un: 'sg', qty: 1, costo: 69000000, venta: 81176471 },
            { item: '11.13b', desc: 'Sistema de detección de incendio — ejecución en subestaciones', un: 'sg', qty: 1, costo: 158943849, venta: 186992763 },
          ],
        }],
      },
    ],
  },
];

// ── Computed totals ──
function sumItems(items: Item[], key: 'costo' | 'venta') {
  return items.reduce((s, i) => s + i[key], 0);
}
function chapterTotal(ch: Chapter, key: 'costo' | 'venta') {
  return ch.sections.reduce((s, sec) => s + sumItems(sec.items, key), 0);
}
function grupoTotal(g: Grupo, key: 'costo' | 'venta') {
  return g.chapters.reduce((s, ch) => s + chapterTotal(ch, key), 0);
}

const TOTAL_COSTO  = GRUPOS.reduce((s, g) => s + grupoTotal(g, 'costo'), 0);
const TOTAL_VENTA  = GRUPOS.reduce((s, g) => s + grupoTotal(g, 'venta'), 0);
const TOTAL_OFERTA = 41012884481;

// ── AIU (Administración 11% · Imprevistos 2% · Utilidad 4% · IVA Utilidad 19%) ──
const AIU_ADM_PCT  = 0.11;
const AIU_IMPR_PCT = 0.02;
const AIU_UTIL_PCT = 0.04;
const AIU_IVA_PCT  = 0.19; // sobre Utilidad únicamente

const aiu_adm_c  = TOTAL_COSTO * AIU_ADM_PCT;
const aiu_impr_c = TOTAL_COSTO * AIU_IMPR_PCT;
const aiu_util_c = TOTAL_COSTO * AIU_UTIL_PCT;
const aiu_iva_c  = aiu_util_c * AIU_IVA_PCT;
const TOTAL_CON_AIU_COSTO = TOTAL_COSTO + aiu_adm_c + aiu_impr_c + aiu_util_c + aiu_iva_c;

const aiu_adm_v  = TOTAL_VENTA * AIU_ADM_PCT;
const aiu_impr_v = TOTAL_VENTA * AIU_IMPR_PCT;
const aiu_util_v = TOTAL_VENTA * AIU_UTIL_PCT;
const aiu_iva_v  = aiu_util_v * AIU_IVA_PCT;
const TOTAL_CON_AIU_VENTA = TOTAL_VENTA + aiu_adm_v + aiu_impr_v + aiu_util_v + aiu_iva_v;

// ── Costo vs Venta panel (extracted to avoid IIFE in JSX) ──
function CostoVentaPanel() {
  const margen = TOTAL_VENTA - TOTAL_COSTO;
  const margenPct = (margen / TOTAL_VENTA * 100);
  const costoRatio = TOTAL_COSTO / TOTAL_VENTA * 100;
  return (
    <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-card">
      <p className="text-xs font-bold text-steel-700 mb-4">Análisis Costo vs Venta Directa — Presupuesto</p>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center rounded-lg bg-steel-50 border border-steel-200 py-3 px-2">
          <p className="text-[10px] text-steel-500 uppercase font-semibold tracking-wide mb-1">Costo Directo</p>
          <p className="text-xl font-black text-steel-900">{fmtM(TOTAL_COSTO)}</p>
          <p className="text-[10px] text-steel-400 mt-0.5">{costoRatio.toFixed(1)}% de la venta</p>
        </div>
        <div className="text-center rounded-lg bg-emerald-50 border border-emerald-200 py-3 px-2">
          <p className="text-[10px] text-emerald-600 uppercase font-semibold tracking-wide mb-1">Margen Bruto</p>
          <p className="text-xl font-black text-emerald-700">{fmtM(margen)}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">+{margenPct.toFixed(1)}% sobre venta</p>
        </div>
        <div className="text-center rounded-lg bg-primary-50 border border-primary-200 py-3 px-2">
          <p className="text-[10px] text-primary-600 uppercase font-semibold tracking-wide mb-1">Venta Directa</p>
          <p className="text-xl font-black text-primary-800">{fmtM(TOTAL_VENTA)}</p>
          <p className="text-[10px] text-primary-500 mt-0.5">100% base presupuestal</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-steel-500 w-20 text-right font-semibold">Costo</span>
          <div className="flex-1 h-7 bg-steel-100 rounded-lg overflow-hidden flex">
            <div className="h-full rounded-lg flex items-center justify-end pr-2"
              style={{ width: `${costoRatio.toFixed(1)}%`, backgroundColor: '#1b5eab' }}>
              <span className="text-[9px] font-bold text-white">{fmtM(TOTAL_COSTO)}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-steel-700 w-14 text-left">{costoRatio.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-steel-500 w-20 text-right font-semibold">Margen</span>
          <div className="flex-1 h-7 bg-steel-100 rounded-lg overflow-hidden flex">
            <div className="h-full rounded-lg flex items-center justify-end pr-2"
              style={{ width: '100%', backgroundColor: '#059669' }}>
              <span className="text-[9px] font-bold text-white">{fmtM(TOTAL_VENTA)} (venta)</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 w-14 text-left">+{margenPct.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] text-steel-400 w-20 text-right">Total venta</span>
          <div className="flex-1 h-3 rounded-lg overflow-hidden flex">
            <div className="h-full" style={{ width: `${costoRatio.toFixed(1)}%`, backgroundColor: '#1b5eab' }} />
            <div className="h-full flex-1" style={{ backgroundColor: '#059669' }} />
          </div>
          <span className="text-[10px] font-black text-steel-800 w-14 text-left">{fmtM(TOTAL_VENTA)}</span>
        </div>
      </div>
    </div>
  );
}

// ── AIU breakdown panel ──
function AIUPanel() {
  const rows: { label: string; pct?: string; costo: number; venta: number; bold?: boolean; highlight?: boolean }[] = [
    { label: 'Subtotal Instalaciones Eléctricas — Costo Directo', costo: TOTAL_COSTO, venta: TOTAL_VENTA, bold: true },
    { label: 'Administración', pct: '11,00%', costo: aiu_adm_c,  venta: aiu_adm_v  },
    { label: 'Imprevistos',    pct: '2,00%',  costo: aiu_impr_c, venta: aiu_impr_v },
    { label: 'Utilidad',       pct: '4,00%',  costo: aiu_util_c, venta: aiu_util_v },
    { label: 'IVA de Utilidad',pct: '19,00%', costo: aiu_iva_c,  venta: aiu_iva_v  },
    { label: 'TOTAL INSTALACIONES ELÉCTRICAS', costo: TOTAL_CON_AIU_COSTO, venta: TOTAL_CON_AIU_VENTA, bold: true, highlight: true },
  ];

  return (
    <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
      <div className="px-5 py-3 border-b border-steel-100 flex items-center justify-between">
        <p className="text-xs font-bold text-steel-700">AIU — Administración · Imprevistos · Utilidad</p>
        <span className="text-[10px] text-steel-400 font-medium">aplicado sobre costo y venta directa</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-steel-50 border-b border-steel-100">
            <th className="text-left px-5 py-2 text-[10px] text-steel-500 font-semibold uppercase tracking-wide">Concepto</th>
            <th className="text-right px-4 py-2 text-[10px] text-steel-500 font-semibold uppercase tracking-wide w-16">%</th>
            <th className="text-right px-5 py-2 text-[10px] text-steel-500 font-semibold uppercase tracking-wide">Costo</th>
            <th className="text-right px-5 py-2 text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">Venta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={
              r.highlight
                ? 'bg-primary-50 border-t-2 border-primary-200'
                : r.bold
                ? 'bg-steel-50 border-b border-steel-200'
                : 'border-b border-steel-50 hover:bg-steel-50/60'
            }>
              <td className={`px-5 py-2.5 ${r.bold ? 'font-bold text-steel-900' : 'text-steel-600'}`}>
                {r.label}
              </td>
              <td className="text-right px-4 py-2.5 text-steel-500 font-mono">
                {r.pct ?? ''}
              </td>
              <td className={`text-right px-5 py-2.5 font-mono tabular-nums ${r.highlight ? 'font-black text-primary-800 text-sm' : r.bold ? 'font-bold text-steel-900' : 'text-steel-700'}`}>
                {fmtCOP(r.costo)}
              </td>
              <td className={`text-right px-5 py-2.5 font-mono tabular-nums ${r.highlight ? 'font-black text-emerald-700 text-sm' : r.bold ? 'font-bold text-emerald-800' : 'text-emerald-700'}`}>
                {fmtCOP(r.venta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Component ──
export function BudgetPageContent() {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapter = (key: string) =>
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className="space-y-5">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 shadow-card">
          <p className="text-[10px] text-primary-600 uppercase font-semibold tracking-wide">Valor Oferta Total (BAC)</p>
          <p className="text-xl font-black text-primary-800 mt-1">{fmtM(TOTAL_OFERTA)}</p>
          <p className="text-[10px] text-primary-500 mt-0.5">Precio global fijo inc. IVA, AIU, financiación</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <p className="text-[10px] text-steel-500 uppercase font-semibold tracking-wide">Costo Directo Total</p>
          <p className="text-xl font-black text-steel-800 mt-1">{fmtM(TOTAL_COSTO)}</p>
          <p className="text-[10px] text-steel-400 mt-0.5">15 capítulos · hoja PS USD4000costo</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-card">
          <p className="text-[10px] text-emerald-600 uppercase font-semibold tracking-wide">Venta Directa Total</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{fmtM(TOTAL_VENTA)}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Margen bruto {((TOTAL_VENTA - TOTAL_COSTO) / TOTAL_VENTA * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-card">
          <p className="text-[10px] text-red-600 uppercase font-semibold tracking-wide">Capítulos en Riesgo</p>
          <p className="text-xl font-black text-red-700 mt-1">1</p>
          <p className="text-[10px] text-red-500 mt-0.5">Cap. 13 — Comp. Reactiva margen negativo</p>
        </div>
      </div>

      {/* ── Indicador Costo vs Venta ── */}
      <CostoVentaPanel />

      {/* ── Desglose AIU ── */}
      <AIUPanel />

      {/* ── Barras de composición Costo y Venta ── */}
      <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card space-y-4">
        {/* Costo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-steel-700">Composición del Costo Directo</p>
            <span className="text-xs font-black text-steel-900">{fmtM(TOTAL_COSTO)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-10 rounded-lg overflow-hidden flex">
              {GRUPOS.map(g => {
                const gc = grupoTotal(g, 'costo');
                const w = gc / TOTAL_COSTO * 100;
                return (
                  <div key={g.id} className="flex flex-col items-center justify-center overflow-hidden"
                    style={{ width: `${w.toFixed(1)}%`, backgroundColor: g.color }}
                    title={`${g.nombre}: ${fmtM(gc)} (${w.toFixed(1)}%)`}>
                    {w > 10 && <>
                      <span className="text-[9px] font-bold text-white leading-tight">{fmtM(gc)}</span>
                      <span className="text-[8px] text-white/80 leading-tight">{w.toFixed(1)}%</span>
                    </>}
                    {w > 4 && w <= 10 && <span className="text-[8px] font-bold text-white">{w.toFixed(1)}%</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex-shrink-0 text-right min-w-[90px] border-l-2 border-steel-200 pl-4 py-1">
              <p className="text-[9px] text-steel-400 uppercase font-semibold tracking-widest">Total</p>
              <p className="text-base font-black text-steel-900 leading-snug">{fmtM(TOTAL_COSTO)}</p>
            </div>
          </div>
        </div>

        {/* Venta */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-steel-700">Composición de la Venta Directa</p>
            <span className="text-xs font-black text-primary-800">{fmtM(TOTAL_VENTA)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-10 rounded-lg overflow-hidden flex">
              {GRUPOS.map(g => {
                const gv = grupoTotal(g, 'venta');
                const w = gv / TOTAL_VENTA * 100;
                return (
                  <div key={g.id} className="flex flex-col items-center justify-center overflow-hidden"
                    style={{ width: `${w.toFixed(1)}%`, backgroundColor: g.color + 'cc' }}
                    title={`${g.nombre}: ${fmtM(gv)} (${w.toFixed(1)}%)`}>
                    {w > 10 && <>
                      <span className="text-[9px] font-bold text-white leading-tight">{fmtM(gv)}</span>
                      <span className="text-[8px] text-white/80 leading-tight">{w.toFixed(1)}%</span>
                    </>}
                    {w > 4 && w <= 10 && <span className="text-[8px] font-bold text-white">{w.toFixed(1)}%</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex-shrink-0 text-right min-w-[90px] border-l-2 border-primary-200 pl-4 py-1">
              <p className="text-[9px] text-primary-400 uppercase font-semibold tracking-widest">Total</p>
              <p className="text-base font-black text-primary-800 leading-snug">{fmtM(TOTAL_VENTA)}</p>
            </div>
          </div>
        </div>

        {/* Leyenda compartida */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2 border-t border-steel-100">
          {GRUPOS.map(g => (
            <div key={g.id} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
              <span className="text-[10px] text-steel-600 font-medium">{g.nombre}</span>
              <span className="text-[10px] text-steel-500">C: <strong className="text-steel-800">{fmtM(grupoTotal(g, 'costo'))}</strong></span>
              <span className="text-[10px] text-primary-500">V: <strong className="text-primary-700">{fmtM(grupoTotal(g, 'venta'))}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grupos con capítulos ── */}
      {GRUPOS.map(g => {
        const gc = grupoTotal(g, 'costo');
        const gv = grupoTotal(g, 'venta');
        const gMargen = gv > 0 ? ((gv - gc) / gv * 100) : 0;
        const Icon = g.icon;
        return (
          <div key={g.id} className={clsx('rounded-xl border shadow-card', g.colorBorder, g.colorBg)}>
            {/* Grupo header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: g.color + '30' }}>
              <div className="rounded-xl p-2.5" style={{ backgroundColor: g.color + '20' }}>
                <Icon className="h-5 w-5" style={{ color: g.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-steel-900">{g.nombre}</p>
                <p className="text-[11px] text-steel-500">{g.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black" style={{ color: g.color }}>{fmtM(gc)}</p>
                <p className={clsx('text-[10px] font-semibold', gMargen < 0 ? 'text-red-600' : 'text-steel-500')}>
                  Margen {gMargen.toFixed(1)}% · Venta {fmtM(gv)}
                </p>
              </div>
            </div>

            {/* Capítulos */}
            <div className="divide-y" style={{ borderColor: g.color + '20' }}>
              {g.chapters.map(ch => {
                const cc = chapterTotal(ch, 'costo');
                const cv = chapterTotal(ch, 'venta');
                const cMargen = cv > 0 ? ((cv - cc) / cv * 100) : 0;
                const key = `${g.id}-${ch.id}`;
                const open = expandedChapters.has(key);
                return (
                  <div key={ch.id}>
                    {/* Chapter header — clickable */}
                    <button
                      onClick={() => toggleChapter(key)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-black/5 transition text-left"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: g.color }}>
                        {ch.id.replace('11-inc', '🔥').replace('11-', '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-steel-800 truncate">Cap. {ch.id} — {ch.nombre}</p>
                        <p className="text-[10px] text-steel-400">
                          {ch.sections.reduce((s, sec) => s + sec.items.length, 0)} actividades
                          {ch.sections.length > 1 && ` en ${ch.sections.length} grupos`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-steel-800">{fmtM(cc)}</p>
                        <p className={clsx('text-[10px] font-semibold', cMargen < 0 ? 'text-red-600' : 'text-steel-500')}>
                          Margen {cMargen.toFixed(1)}%
                        </p>
                      </div>
                      {open
                        ? <ChevronDown className="h-4 w-4 text-steel-400 flex-shrink-0" />
                        : <ChevronRight className="h-4 w-4 text-steel-400 flex-shrink-0" />}
                    </button>

                    {/* Chapter detail — expandible */}
                    {open && (
                      <div className="px-5 pb-4 space-y-4">
                        {ch.sections.map(sec => {
                          const sc = sumItems(sec.items, 'costo');
                          const sv = sumItems(sec.items, 'venta');
                          return (
                            <div key={sec.id}>
                              {/* Section sub-header */}
                              <div className="flex items-center justify-between py-2 mb-1">
                                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: g.color }}>
                                  {sec.nombre}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-steel-500">
                                  <span>Costo: <strong className="text-steel-700">{fmtM(sc)}</strong></span>
                                  <span>Venta: <strong className="text-steel-700">{fmtM(sv)}</strong></span>
                                </div>
                              </div>

                              {/* Items table */}
                              <div className="overflow-x-auto rounded-lg border border-steel-200">
                                <table className="w-full text-xs bg-white">
                                  <thead>
                                    <tr style={{ backgroundColor: g.color + '10' }} className="border-b border-steel-200">
                                      <th className="px-3 py-2 text-left font-semibold text-steel-600 w-16">Ítem</th>
                                      <th className="px-3 py-2 text-left font-semibold text-steel-600">Descripción</th>
                                      <th className="px-3 py-2 text-center font-semibold text-steel-600 w-10">UN</th>
                                      <th className="px-3 py-2 text-right font-semibold text-steel-600 w-14">Cant.</th>
                                      <th className="px-3 py-2 text-right font-semibold text-steel-600 w-28">Costo</th>
                                      <th className="px-3 py-2 text-right font-semibold text-steel-600 w-28">Venta</th>
                                      <th className="px-3 py-2 text-right font-semibold text-steel-600 w-16">Margen</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-steel-100">
                                    {sec.items.map((it, i) => {
                                      const mg = it.venta > 0 ? ((it.venta - it.costo) / it.venta * 100) : 0;
                                      const neg = mg < -0.5;
                                      return (
                                        <tr key={i} className={clsx('hover:bg-steel-50/50', neg && 'bg-red-50/30')}>
                                          <td className="px-3 py-2">
                                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: g.color + '15', color: g.color }}>
                                              {it.item}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 text-steel-700 leading-snug max-w-xs">{it.desc}</td>
                                          <td className="px-3 py-2 text-center text-steel-400 font-mono">{it.un ?? '—'}</td>
                                          <td className="px-3 py-2 text-right text-steel-500 font-mono">{it.qty != null ? it.qty.toLocaleString('es-CO') : '—'}</td>
                                          <td className="px-3 py-2 text-right font-semibold text-steel-800">{fmtCOP(it.costo)}</td>
                                          <td className="px-3 py-2 text-right text-steel-600">{fmtCOP(it.venta)}</td>
                                          <td className={clsx('px-3 py-2 text-right font-bold', neg ? 'text-red-600' : 'text-emerald-600')}>
                                            {neg ? '' : '+'}{mg.toFixed(1)}%
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t-2 font-bold" style={{ borderColor: g.color + '40', backgroundColor: g.color + '08' }}>
                                      <td colSpan={4} className="px-3 py-2 text-steel-700">Subtotal</td>
                                      <td className="px-3 py-2 text-right text-steel-900">{fmtCOP(sc)}</td>
                                      <td className="px-3 py-2 text-right text-steel-900">{fmtCOP(sv)}</td>
                                      <td className={clsx('px-3 py-2 text-right', sv > 0 && (sv - sc) / sv < -0.005 ? 'text-red-600' : 'text-emerald-600')}>
                                        {sv > 0 ? ((sv - sc) / sv * 100).toFixed(1) + '%' : '—'}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              {/* Alert margen negativo */}
                              {sec.items.some(i => i.venta > 0 && i.costo > i.venta) && (
                                <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-[11px] text-red-700">Partida con margen negativo — el costo supera la venta. Revisar con proveedor.</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Fuente */}
      <div className="rounded-xl bg-primary-50 border border-primary-100 p-3 text-[10px] text-primary-700">
        <strong>Fuente:</strong> Hoja "PS USD4000costo" — <em>Detallado caso de negocio_220126.xlsx</em> · {GRUPOS.reduce((s, g) => s + g.chapters.reduce((s2, ch) => s2 + ch.sections.reduce((s3, sec) => s3 + sec.items.length, 0), 0), 0)} actividades en 15 capítulos
      </div>
    </div>
  );
}

export default BudgetPageContent;
