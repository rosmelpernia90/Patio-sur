import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, X, Clock, Circle } from 'lucide-react';
import {
  getActiveSessions,
  getActivityLog,
  type ActiveSession,
  type ActivityEntry,
} from '../../utils/activityTracker';
import { ROLE_CONFIG, type UserRole } from '../../stores/authStore';
import clsx from 'clsx';

// ── Helpers ──────────────────────────────────────────────────

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'business-case': 'Caso de Negocio',
  budget: 'Presupuesto',
  cronograma: 'Cronograma',
  'cash-flow': 'Flujo de Caja',
  reports: 'Reportes',
  documents: 'Documentos',
  alerts: 'Alertas',
  projects: 'Proyectos',
};

function getPageLabel(path: string): string {
  const segment = path.split('/').filter(Boolean).pop() || '';
  return PAGE_LABELS[segment] || 'App';
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_PALETTE = [
  'bg-primary-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function avatarColor(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
}

const ROLE_BADGE: Record<string, string> = {
  gerente: 'bg-violet-100 text-violet-700',
  controller: 'bg-blue-100 text-blue-700',
  ingeniero: 'bg-emerald-100 text-emerald-700',
  viewer: 'bg-steel-100 text-steel-500',
};

// ── Component ────────────────────────────────────────────────

export default function ActivityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [log, setLog] = useState<ActivityEntry[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    setSessions(getActiveSessions());
    setLog(getActivityLog(40));
  }, []);

  // Refresh on open
  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  // Refresh when other tabs write activity
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'pcm_active_sessions' || e.key === 'pcm_activity_log') refresh();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  // Also poll every 30s when panel is open to pick up same-tab changes
  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [isOpen, refresh]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const activeCount = sessions.length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="Control de actividad"
        className={clsx(
          'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
          isOpen
            ? 'bg-primary-600 text-white shadow'
            : 'border border-steel-200 bg-white text-steel-600 hover:bg-steel-50',
        )}
      >
        <span className="relative flex items-center">
          <Activity className="h-4 w-4" />
          {activeCount > 0 && (
            <span
              className={clsx(
                'absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
                isOpen ? 'bg-white text-primary-700' : 'bg-primary-600 text-white',
              )}
            >
              {activeCount}
            </span>
          )}
        </span>
        <span className="hidden sm:inline">Actividad</span>
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/15 z-40 xl:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-out panel */}
      {isOpen && (
        <div
          className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 border-l border-steel-200 flex flex-col"
          style={{ animation: 'slideIn 0.22s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary-800 to-primary-900 text-white flex-shrink-0">
            <div>
              <h3 className="font-bold text-base">Control de Actividad</h3>
              <p className="text-primary-200 text-xs mt-0.5">
                {activeCount === 0
                  ? 'Sin usuarios activos ahora'
                  : `${activeCount} usuario${activeCount > 1 ? 's' : ''} activo${activeCount > 1 ? 's' : ''} ahora`}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/15 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-pcm p-5 space-y-6">
            {/* ── En línea ahora ── */}
            <section>
              <h4 className="text-xs font-bold text-steel-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-1 w-5 bg-emerald-400 rounded-full" />
                En línea ahora
              </h4>

              {sessions.length === 0 ? (
                <div className="rounded-xl bg-steel-50 border border-steel-100 p-5 text-center">
                  <Activity className="h-7 w-7 text-steel-300 mx-auto mb-2" />
                  <p className="text-xs text-steel-400">Ningún usuario activo recientemente</p>
                  <p className="text-[10px] text-steel-300 mt-1">Los usuarios aparecen aquí mientras navegan la app</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div
                      key={s.userId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-steel-50 border border-steel-100"
                    >
                      <div
                        className={clsx(
                          'flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0',
                          avatarColor(s.userId),
                        )}
                      >
                        {getInitials(s.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-xs font-semibold text-steel-800 truncate">{s.userName}</p>
                          <Circle className="h-1.5 w-1.5 text-emerald-500 fill-emerald-500 flex-shrink-0" />
                        </div>
                        <span
                          className={clsx(
                            'inline-block rounded-full px-2 py-0 text-[9px] font-semibold',
                            ROLE_BADGE[s.userRole] ?? 'bg-steel-100 text-steel-500',
                          )}
                        >
                          {ROLE_CONFIG[s.userRole as UserRole]?.label ?? s.userRole}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-medium text-steel-600">{getPageLabel(s.currentPage)}</p>
                        <p className="text-[9px] text-steel-400 mt-0.5">{timeAgo(s.lastSeen)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Historial de ediciones ── */}
            <section>
              <h4 className="text-xs font-bold text-steel-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-1 w-5 bg-primary-400 rounded-full" />
                Historial de ediciones
              </h4>

              {log.length === 0 ? (
                <div className="rounded-xl bg-steel-50 border border-steel-100 p-5 text-center">
                  <Clock className="h-7 w-7 text-steel-300 mx-auto mb-2" />
                  <p className="text-xs text-steel-400">Sin ediciones registradas aún</p>
                  <p className="text-[10px] text-steel-300 mt-1">Las ediciones aparecen cuando los usuarios guardan cambios</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {log.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-steel-50 border border-steel-100 hover:bg-steel-100/60 transition"
                    >
                      <div
                        className={clsx(
                          'flex h-7 w-7 items-center justify-center rounded-full text-white text-[9px] font-bold flex-shrink-0 mt-0.5',
                          avatarColor(entry.userId),
                        )}
                      >
                        {getInitials(entry.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-steel-800">{entry.userName}</p>
                        <p className="text-[11px] text-steel-600 leading-relaxed mt-0.5">{entry.action}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[9px] text-steel-500 bg-steel-100 border border-steel-200 px-1.5 py-0.5 rounded-full">
                            {entry.page}
                          </span>
                          <span className="text-[9px] text-steel-400 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {timeAgo(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-steel-200 bg-steel-50 flex-shrink-0">
            <p className="text-[10px] text-steel-400 text-center">
              PC Mejia Ingenieria S.A. — Sistema de Gestion de Proyectos v1.0
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
