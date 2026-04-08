/**
 * activityTracker.ts
 * Tracks active user sessions and edit history in localStorage.
 * Works across browser tabs via storage events.
 */
import type { User } from '../stores/authStore';

const LS_SESSIONS_KEY = 'pcm_active_sessions';
const LS_ACTIVITY_KEY = 'pcm_activity_log';
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const MAX_LOG_ENTRIES = 150;

export interface ActiveSession {
  userId: string;
  userName: string;
  userRole: string;
  currentPage: string;
  lastSeen: string; // ISO
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  page: string;
  action: string;
  timestamp: string; // ISO
}

/** Update the current user's presence record (call every ~30s). */
export function updatePresence(user: User, currentPage: string): void {
  try {
    const raw = localStorage.getItem(LS_SESSIONS_KEY);
    const sessions: Record<string, ActiveSession> = raw ? JSON.parse(raw) : {};
    sessions[user.id] = {
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      currentPage,
      lastSeen: new Date().toISOString(),
    };
    localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(sessions));
  } catch { /* ignore */ }
}

/** Remove the current user from active sessions (call on logout). */
export function clearPresence(userId: string): void {
  try {
    const raw = localStorage.getItem(LS_SESSIONS_KEY);
    const sessions: Record<string, ActiveSession> = raw ? JSON.parse(raw) : {};
    delete sessions[userId];
    localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(sessions));
  } catch { /* ignore */ }
}

/** Get all sessions active within the last SESSION_TIMEOUT_MS. */
export function getActiveSessions(): ActiveSession[] {
  try {
    const raw = localStorage.getItem(LS_SESSIONS_KEY);
    if (!raw) return [];
    const sessions: Record<string, ActiveSession> = JSON.parse(raw);
    const cutoff = Date.now() - SESSION_TIMEOUT_MS;
    return Object.values(sessions)
      .filter((s) => new Date(s.lastSeen).getTime() > cutoff)
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
  } catch { return []; }
}

/** Record an edit action performed by a user. */
export function logEdit(user: User, page: string, action: string): void {
  try {
    const raw = localStorage.getItem(LS_ACTIVITY_KEY);
    const log: ActivityEntry[] = raw ? JSON.parse(raw) : [];
    const entry: ActivityEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      page,
      action,
      timestamp: new Date().toISOString(),
    };
    log.unshift(entry);
    if (log.length > MAX_LOG_ENTRIES) log.splice(MAX_LOG_ENTRIES);
    localStorage.setItem(LS_ACTIVITY_KEY, JSON.stringify(log));
  } catch { /* ignore */ }
}

/** Get the most recent edit entries (newest first). */
export function getActivityLog(limit = 50): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(LS_ACTIVITY_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as ActivityEntry[]).slice(0, limit);
  } catch { return []; }
}
