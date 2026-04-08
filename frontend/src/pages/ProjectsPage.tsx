import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, DollarSign, Building2, Zap, Loader, Paperclip, FileText, Download, X, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { projectsApi } from '@/services/api/projects';
import { formatCOPFull } from '@/utils/formatNumbers';
import { getCronogramaStats } from '@/utils/cronogramaStats';

// Use full currency format for project budget display
const formatCOP = formatCOPFull;

const statusLabels: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planificacion', color: 'bg-primary-50 text-primary-700 border border-primary-200' },
  in_progress: { label: 'En Progreso', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  on_hold: { label: 'En Pausa', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  completed: { label: 'Completado', color: 'bg-steel-50 text-steel-700 border border-steel-200' },
  cancelled: { label: 'Cancelado', color: 'bg-red-50 text-red-700 border border-red-200' },
};

interface DocInfo { filename: string; previewable: boolean; }

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  // Leer stats del Cronograma (fuente única de verdad para avance)
  const cronStats = useMemo(() => getCronogramaStats(), []);

  // Oferta mercantil per project: projectId → DocInfo
  const [ofertas, setOfertas] = useState<Record<string, DocInfo>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ docId: string; filename: string } | null>(null);

  // Load existing ofertas from backend on mount
  useEffect(() => {
    fetch('/api/v1/documents/ofertas')
      .then(r => r.ok ? r.json() : {})
      .then((data: Record<string, { filename: string; previewable: boolean }>) => {
        if (Object.keys(data).length > 0) setOfertas(data);
      })
      .catch(() => {});
  }, []);

  const handleUpload = async (projectId: string, file: File) => {
    setUploadingId(projectId);
    const form = new FormData();
    form.append('doc_id', projectId);
    form.append('file', file);
    try {
      const res = await fetch('/api/v1/documents/upload/ofertas', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Error al subir');
      const data = await res.json();
      setOfertas(prev => ({ ...prev, [projectId]: { filename: data.original_name, previewable: data.previewable } }));
    } catch {
      alert('Error al subir el archivo. Intente de nuevo.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    await fetch(`/api/v1/documents/ofertas/${projectId}`, { method: 'DELETE' });
    setOfertas(prev => { const n = { ...prev }; delete n[projectId]; return n; });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Proyectos</h2>
          <p className="text-xs text-steel-400 mt-1">
            Gestion de proyectos de infraestructura de recarga electrica
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition shadow-sm">
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl bg-steel-50 border border-steel-200 p-8 text-center">
          <p className="text-steel-500">No hay proyectos disponibles.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const statusConfig = statusLabels[project.status] || statusLabels.planning;
            const oferta = ofertas[project.id];

            return (
              <div key={project.id} className="group rounded-xl border border-steel-200 bg-white shadow-card hover:shadow-card-hover transition-all hover:border-primary-300 flex flex-col">
                <Link to={`/projects/${project.id}/dashboard`} className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary-50 p-2.5 border border-primary-100">
                        <Zap className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-steel-900 group-hover:text-primary-600 transition">
                          {project.name}
                        </h3>
                        <p className="text-xs text-steel-400">{project.code}</p>
                      </div>
                    </div>
                    <span className={clsx('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', statusConfig.color)}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-xs text-steel-400 mb-3 line-clamp-2">{project.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-steel-600">
                      <Building2 className="h-4 w-4 text-steel-300" />
                      <span>Cliente: <strong className="text-steel-800">{project.client_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-steel-600">
                      <DollarSign className="h-4 w-4 text-steel-300" />
                      <span>Presupuesto: <strong className="text-primary-700">{formatCOP(project.total_budget)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-steel-600">
                      <Calendar className="h-4 w-4 text-steel-300" />
                      <span>{project.start_date} al {project.estimated_end_date}</span>
                    </div>
                  </div>

                  {/* Avance del Cronograma — fuente: Cronograma (pestaña) */}
                  <div className="mb-2 space-y-2">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-steel-400 font-medium">
                        Avance planificado ({cronStats.weekLabel})
                      </span>
                      <span className="font-bold text-primary-700">{cronStats.planned}%</span>
                    </div>
                    <div className="h-2 bg-steel-100 rounded-full">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${Math.min(cronStats.planned, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-steel-400 font-medium">
                        Avance real ({cronStats.weekLabel}, {cronStats.dateLabel})
                      </span>
                      <span className={clsx('font-bold', cronStats.real >= cronStats.planned ? 'text-emerald-600' : 'text-amber-600')}>
                        {cronStats.real}%
                      </span>
                    </div>
                    <div className="h-2 bg-steel-100 rounded-full">
                      <div
                        className={clsx('h-full rounded-full transition-all', cronStats.real >= cronStats.planned ? 'bg-emerald-500' : 'bg-amber-400')}
                        style={{ width: `${Math.min(cronStats.real, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-steel-100 text-[10px] text-steel-400 flex items-center justify-between">
                    <span>Estado: {statusConfig.label}</span>
                    <span className={clsx('font-semibold', cronStats.spi >= 1 ? 'text-emerald-600' : 'text-amber-600')}>
                      SPI {cronStats.spi.toFixed(2)}
                    </span>
                  </div>
                </Link>

                {/* Oferta Mercantil */}
                <div
                  className="px-6 pb-4"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 pt-3 border-t border-steel-100">
                    <span className="text-[10px] font-semibold text-steel-500 uppercase tracking-wide whitespace-nowrap">Oferta Mercantil</span>
                    {oferta ? (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <button
                          onClick={() => setPreview({ docId: project.id, filename: oferta.filename })}
                          className="flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-800 bg-primary-50 border border-primary-200 rounded-md px-2 py-1 truncate max-w-[140px] transition"
                          title={`Ver: ${oferta.filename}`}
                        >
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{oferta.filename}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1 rounded hover:bg-red-100 text-steel-300 hover:text-red-500 transition flex-shrink-0"
                          title="Eliminar oferta"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[10px] text-steel-400 hover:text-primary-600 bg-steel-50 hover:bg-primary-50 border border-steel-200 hover:border-primary-300 rounded-md px-2 py-1 transition">
                        {uploadingId === project.id ? (
                          <span className="animate-pulse">Subiendo...</span>
                        ) : (
                          <>
                            <Paperclip className="h-3 w-3" />
                            <span>Adjuntar</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUpload(project.id, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de previsualización */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-4xl h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-steel-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-semibold text-steel-800 truncate max-w-lg">{preview.filename}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/v1/documents/ofertas/${preview.docId}/download`}
                  download={preview.filename}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 bg-primary-50 border border-primary-200 rounded-lg px-3 py-1.5 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="p-1.5 rounded-lg hover:bg-steel-100 text-steel-500 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-xl bg-steel-50">
              {(() => {
                const ext = preview.filename.split('.').pop()?.toLowerCase();
                const previewUrl = `/api/v1/documents/ofertas/${preview.docId}/preview`;
                if (ext === 'pdf') {
                  return <iframe src={previewUrl} className="w-full h-full rounded-b-xl" title={preview.filename} />;
                }
                if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img src={previewUrl} alt={preview.filename} className="max-w-full max-h-full object-contain rounded-lg shadow" />
                    </div>
                  );
                }
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-steel-500">
                    <FileText className="h-16 w-16 text-steel-300" />
                    <p className="text-sm">Vista previa no disponible para este tipo de archivo.</p>
                    <a
                      href={`/api/v1/documents/ofertas/${preview.docId}/download`}
                      download={preview.filename}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 transition"
                    >
                      <Download className="h-4 w-4" />
                      Descargar para ver
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
