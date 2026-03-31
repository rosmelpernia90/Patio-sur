import { useParams } from 'react-router-dom';
import { Upload, FileText, File, Download, Trash2, Search, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'approved' | 'pending' | 'revision';
}

const mockDocuments: DocumentItem[] = [
  { id: '1', name: 'Oferta Mercantil - PC Mejia a Consorcio Express', type: 'PDF', category: 'Contractual', size: '2.4 MB', uploadDate: '2025-10-15', uploadedBy: 'Gerencia de Proyecto', status: 'approved' },
  { id: '2', name: 'Presupuesto Detallado IRE Patio Sur', type: 'XLSX', category: 'Presupuesto', size: '1.8 MB', uploadDate: '2025-10-20', uploadedBy: 'Gerencia de Proyecto', status: 'approved' },
  { id: '3', name: 'Otrosi No. 23 - Contrato Concesion 009-2010', type: 'PDF', category: 'Contractual', size: '5.1 MB', uploadDate: '2025-09-30', uploadedBy: 'Consorcio Express', status: 'approved' },
  { id: '4', name: 'Diseno Electrico - Red MT Celdas', type: 'DWG', category: 'Disenos', size: '12.3 MB', uploadDate: '2026-01-15', uploadedBy: 'Ing. Electrico', status: 'approved' },
  { id: '5', name: 'Diseno Civil - Estructural Shelter', type: 'DWG', category: 'Disenos', size: '8.7 MB', uploadDate: '2026-01-20', uploadedBy: 'Ing. Civil', status: 'approved' },
  { id: '6', name: 'Cronograma General del Proyecto', type: 'PDF', category: 'Planificacion', size: '3.2 MB', uploadDate: '2025-10-25', uploadedBy: 'Gerencia de Proyecto', status: 'approved' },
  { id: '7', name: 'Especificacion Tecnica Cargadores 450kW', type: 'PDF', category: 'Tecnico', size: '4.5 MB', uploadDate: '2025-11-10', uploadedBy: 'Proveedor Cargadores', status: 'approved' },
  { id: '8', name: 'Poliza de Cumplimiento 20%', type: 'PDF', category: 'Garantias', size: '1.2 MB', uploadDate: '2025-10-30', uploadedBy: 'Aseguradora', status: 'approved' },
  { id: '9', name: 'Informe de Avance Mensual - Febrero 2026', type: 'PDF', category: 'Informes', size: '6.8 MB', uploadDate: '2026-03-05', uploadedBy: 'Director de Proyecto', status: 'pending' },
  { id: '10', name: 'Solicitud Factibilidad 4MVa - Enel Codensa', type: 'PDF', category: 'Tramites', size: '0.8 MB', uploadDate: '2026-02-15', uploadedBy: 'Ing. Electrico', status: 'revision' },
];

const categories = ['Todos', 'Contractual', 'Presupuesto', 'Disenos', 'Planificacion', 'Tecnico', 'Garantias', 'Informes', 'Tramites'];

const statusConfig: Record<string, { label: string; color: string }> = {
  approved: { label: 'Aprobado', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  revision: { label: 'En Revision', color: 'bg-primary-50 text-primary-700 border border-primary-200' },
};

export default function DocumentsPage() {
  const { projectId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Documentos del Proyecto</h2>
          <p className="text-xs text-steel-400 mt-1">
            Gestion documental — Patio de Operacion Sur
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 shadow-sm transition">
          <Upload className="h-4 w-4" />
          Subir Documento
        </button>
      </div>

      {/* Upload area */}
      <div className="rounded-xl border-2 border-dashed border-steel-300 bg-steel-50 p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition cursor-pointer">
        <Upload className="h-10 w-10 text-steel-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-steel-600">
          Arrastra archivos aqui o haz clic para seleccionar
        </p>
        <p className="text-xs text-steel-400 mt-1">
          PDF, DWG, XLSX, DOCX hasta 50MB
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-300" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-steel-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-steel-300"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-[10px] font-semibold transition',
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-steel-100 text-steel-500 hover:bg-steel-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents count */}
      <div className="flex items-center gap-2 text-xs text-steel-400">
        <FolderOpen className="h-4 w-4" />
        <span>{filteredDocs.length} documento(s) encontrado(s)</span>
      </div>

      {/* Documents table */}
      <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-900 text-white">
                <th className="px-4 py-3 text-left font-semibold text-xs">Documento</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Tamano</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Subido por</th>
                <th className="px-4 py-3 text-center font-semibold text-xs">Estado</th>
                <th className="px-4 py-3 text-center font-semibold text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {filteredDocs.map((doc) => {
                const status = statusConfig[doc.status];
                return (
                  <tr key={doc.id} className="hover:bg-steel-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.type === 'PDF' ? (
                          <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <File className="h-5 w-5 text-primary-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-steel-800 truncate max-w-xs text-xs">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-steel-100 border border-steel-200 px-2.5 py-0.5 text-[10px] font-medium text-steel-600">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-primary-600 font-medium">{doc.type}</td>
                    <td className="px-4 py-3 text-steel-400 text-xs">{doc.size}</td>
                    <td className="px-4 py-3 text-steel-400 text-xs">{doc.uploadDate}</td>
                    <td className="px-4 py-3 text-steel-400 text-xs">{doc.uploadedBy}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={clsx('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-primary-50 text-steel-400 hover:text-primary-600 transition" title="Descargar">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-steel-400 hover:text-red-600 transition" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
