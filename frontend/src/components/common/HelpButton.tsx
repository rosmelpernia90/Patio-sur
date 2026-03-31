import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, FileText, Download, ChevronRight } from 'lucide-react';

export interface LegendItem {
  color?: string;
  icon?: string;
  label: string;
  description: string;
}

export interface LegendSection {
  title: string;
  items: LegendItem[];
}

interface HelpButtonProps {
  pageTitle: string;
  description: string;
  sections: LegendSection[];
  pdfUrl?: string;
  pdfName?: string;
}

export default function HelpButton({ pageTitle, description, sections, pdfUrl, pdfName }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'legend' | 'report'>('legend');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
          ${isOpen
            ? 'bg-primary-600 text-white shadow-md'
            : 'border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:border-primary-300'
          }
        `}
        title="Ayuda y leyenda de esta pagina"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Ayuda</span>
      </button>

      {/* Overlay backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 xl:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-out Panel */}
      {isOpen && (
        <div
          className={`
            fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50
            border-l border-steel-200 flex flex-col
            animate-in slide-in-from-right duration-200
          `}
          style={{ animation: 'slideIn 0.25s ease-out' }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary-800 to-primary-900 text-white">
            <div>
              <h3 className="font-bold text-base">{pageTitle}</h3>
              <p className="text-primary-200 text-xs mt-0.5">Guia de metricas e indicadores</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/15 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-steel-200 bg-steel-50">
            <button
              onClick={() => setActiveTab('legend')}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'legend'
                  ? 'text-primary-700 border-b-2 border-primary-600 bg-white'
                  : 'text-steel-400 hover:text-steel-600'
              }`}
            >
              Leyenda
            </button>
            {pdfUrl && (
              <button
                onClick={() => setActiveTab('report')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === 'report'
                    ? 'text-primary-700 border-b-2 border-primary-600 bg-white'
                    : 'text-steel-400 hover:text-steel-600'
                }`}
              >
                Informe PDF
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-pcm">
            {activeTab === 'legend' ? (
              <div className="p-5 space-y-5">
                {/* Description */}
                <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
                  <p className="text-xs text-primary-800 leading-relaxed">{description}</p>
                </div>

                {/* Legend Sections */}
                {sections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h4 className="text-xs font-bold text-steel-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="h-1 w-5 bg-primary-400 rounded-full" />
                      {section.title}
                    </h4>
                    <div className="space-y-2">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-steel-50 hover:bg-steel-100/80 transition group"
                        >
                          {item.color && (
                            <div
                              className="w-4 h-4 rounded-md flex-shrink-0 mt-0.5 border border-black/5 shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                          )}
                          {item.icon && !item.color && (
                            <span className="text-sm flex-shrink-0 mt-0.5">{item.icon}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-steel-800">{item.label}</p>
                            <p className="text-[11px] text-steel-500 leading-relaxed mt-0.5">{item.description}</p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-steel-300 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* PDF Preview info */}
                <div className="rounded-xl border border-steel-200 bg-white overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-3 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-white" />
                    <div>
                      <p className="text-white font-bold text-sm">{pdfName || 'Informe de Metricas'}</p>
                      <p className="text-red-100 text-[10px]">Documento PDF</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-steel-600 leading-relaxed">
                      Este informe contiene la explicacion detallada de cada metrica e indicador
                      visualizado en esta pagina, incluyendo:
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Significado de cada metrica y su formula',
                        'Fuente de datos de donde se obtuvo la informacion',
                        'Interpretacion en el contexto del proyecto',
                        'Tablas detalladas con valores y referencias',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-steel-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Download button */}
                    <a
                      href={pdfUrl}
                      download={pdfName || 'Informe.pdf'}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition shadow-sm"
                    >
                      <Download className="h-4 w-4" />
                      Descargar Informe PDF
                    </a>

                    {/* Open in new tab */}
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-lg border border-steel-300 bg-white px-4 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50 transition"
                    >
                      <FileText className="h-4 w-4" />
                      Ver en nueva pestana
                    </a>
                  </div>
                </div>

                {/* Embedded PDF preview */}
                {pdfUrl && (
                  <div className="rounded-xl border border-steel-200 overflow-hidden shadow-sm">
                    <div className="bg-steel-100 px-4 py-2 border-b border-steel-200">
                      <p className="text-[10px] font-semibold text-steel-500 uppercase tracking-wider">Vista previa</p>
                    </div>
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[400px] bg-steel-50"
                      title="Vista previa del informe"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="px-5 py-3 border-t border-steel-200 bg-steel-50">
            <p className="text-[10px] text-steel-400 text-center">
              PC Mejia Ingenieria S.A. — Sistema de Gestion de Proyectos v1.0
            </p>
          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
