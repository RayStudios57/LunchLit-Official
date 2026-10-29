import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { studyAudio } from '@/lib/studyAudio';

export type PomodoroMode = 'work' | 'short_break' | 'long_break';

export const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const POMODORO_LABELS: Record<PomodoroMode, string> = {
  work: 'Focus Session',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  targetEndTime: number | null;
  selectedSubject: string;
  selectedTaskId: string;
  sessionsCompleted: number;
  autoPlayAudio: boolean;
}

const STORAGE_KEY = 'lunchlit_pomodoro_state_v2';
const SESSIONS_PREFIX = 'pomodoro_sessions_';

function getTodayKey() {
  return `${SESSIONS_PREFIX}${format(new Date(), 'yyyy-MM-dd')}`;
}

function getStoredSessions(): number {
  try {
    const val = localStorage.getItem(getTodayKey());
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

function loadInitialState(): PomodoroState {
  const defaultState: PomodoroState = {
    mode: 'work',
    timeLeft: POMODORO_DURATIONS.work,
    isRunning: false,
    targetEndTime: null,
    selectedSubject: 'General Study',
    selectedTaskId: 'none',
    sessionsCompleted: getStoredSessions(),
    autoPlayAudio: true,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    
    // Check if a timer was running across page navigation / reloads
    if (parsed.isRunning && parsed.targetEndTime) {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((parsed.targetEndTime - now) / 1000));
      return {
        ...defaultState,
        ...parsed,
        timeLeft: remaining,
        sessionsCompleted: getStoredSessions(),
      };
    }

    return {
      ...defaultState,
      ...parsed,
      sessionsCompleted: getStoredSessions(),
    };
  } catch {
    return defaultState;
  }
}

// ----------------------------------------------------------------------------
// SINGLETON TIMER CONTROLLER
// Uses Web Worker (background thread immune to 1-minute browser tab throttling)
// ----------------------------------------------------------------------------
class PomodoroManager {
  private state: PomodoroState;
  private listeners = new Set<(state: PomodoroState) => void>();
  private worker: Worker | null = null;
  private fallbackInterval: number | null = null;

  constructor() {
    this.state = loadInitialState();
    this.initWorker();
    this.setupVisibilityListener();
    this.setupStorageListener();

    // If timer was already running when restored, resume it
    if (this.state.isRunning && this.state.targetEndTime) {
      const remaining = Math.max(0, Math.round((this.state.targetEndTime - Date.now()) / 1000));
      if (remaining > 0) {
        this.startTicker();
        this.updateTabTitle(remaining, this.state.mode, true);
      } else {
        this.handleComplete();
      }
    }
  }

  private initWorker() {
    try {
      // Inline Web Worker blob
      const code = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timer) clearInterval(timer);
            timer = setInterval(() => {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (timer) clearInterval(timer);
            timer = null;
          }
        };
      `;
      const blob = new Blob([code], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = (e) => {
        if (e.data === 'tick') {
          this.handleTick();
        }
      };
    } catch (e) {
      console.warn('Web Worker initialization failed, using standard interval:', e);
      this.worker = null;
    }
  }

  private setupVisibilityListener() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (this.state.isRunning && this.state.targetEndTime) {
        // Tab became visible or hidden: immediately recalculate exact time to avoid ANY lag
        this.handleTick();
      }
    });
  }

  private setupStorageListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const remoteState = JSON.parse(e.newValue);
          this.state = {
            ...this.state,
            ...remoteState,
            sessionsCompleted: getStoredSessions(),
          };
          this.notify();
        } catch {}
      }
    });
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  public subscribe(cb: (state: PomodoroState) => void): () => void {
    this.listeners.add(cb);
    cb(this.state);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.saveState();
    this.listeners.forEach(cb => cb(this.state));
  }

  private startTicker() {
    if (this.worker) {
      this.worker.postMessage('start');
    } else {
      if (this.fallbackInterval) clearInterval(this.fallbackInterval);
      this.fallbackInterval = window.setInterval(() => this.handleTick(), 1000);
    }
  }

  private stopTicker() {
    if (this.worker) {
      this.worker.postMessage('stop');
    }
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  private updateTabTitle(secondsLeft: number, mode: PomodoroMode, isRunning: boolean) {
    if (typeof document === 'undefined') return;
    if (!isRunning) {
      document.title = 'LunchLit';
      return;
    }
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const icon = mode === 'work' ? '🍅 Focus' : '☕ Break';
    document.title = `(${timeFormatted}) ${icon} | LunchLit`;
  }

  private handleTick() {
    if (!this.state.isRunning || !this.state.targetEndTime) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.round((this.state.targetEndTime - now) / 1000));
    this.state.timeLeft = remaining;

    this.updateTabTitle(remaining, this.state.mode, true);

    if (remaining <= 0) {
      this.handleComplete();
    } else {
      this.notify();
    }
  }

  private handleComplete() {
    this.stopTicker();
    const finishedMode = this.state.mode;

    // Play pleasant synthesized harmonic chime
    studyAudio.playCompletionChime();

    // Trigger Desktop Notification if permitted
    this.sendNotification(finishedMode);

    if (finishedMode === 'work') {
      const nextSessions = this.state.sessionsCompleted + 1;
      this.state.sessionsCompleted = nextSessions;
      try {
        localStorage.setItem(getTodayKey(), String(nextSessions));
        const total = parseInt(localStorage.getItem('lunchlit_pomodoro_total_sessions') || '0', 10) + 1;
        localStorage.setItem('lunchlit_pomodoro_total_sessions', String(total));
        // Dispatch achievement event
        window.dispatchEvent(new CustomEvent('pomodoro_session_completed', { detail: { sessions: nextSessions, total } }));
      } catch {}

      const nextMode: PomodoroMode = nextSessions % 4 === 0 ? 'long_break' : 'short_break';
      toast.success(`🎉 Focus session complete for ${this.state.selectedSubject}!`, {
        description: `Great job! Take a ${nextMode === 'long_break' ? '15-minute long' : '5-minute'} break.`,
      });

      this.state.mode = nextMode;
      this.state.timeLeft = POMODORO_DURATIONS[nextMode];
      this.state.isRunning = false;
      this.state.targetEndTime = null;
    } else {
      toast.info('☕ Break finished! Ready to focus again?', {
        description: `Starting next focus session on ${this.state.selectedSubject}.`,
      });

      this.state.mode = 'work';
      this.state.timeLeft = POMODORO_DURATIONS.work;
      this.state.isRunning = false;
      this.state.targetEndTime = null;
    }

    this.updateTabTitle(this.state.timeLeft, this.state.mode, false);
    this.notify();
  }

  private sendNotification(finishedMode: PomodoroMode) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        if (finishedMode === 'work') {
          new Notification('🍅 Focus Session Complete!', {
            body: `Well done studying ${this.state.selectedSubject}! Time to recharge with a break.`,
            icon: '/favicon.ico',
          });
        } else {
          new Notification('☕ Break Finished!', {
            body: 'Break time is over! Click to hop back into your flow state.',
            icon: '/favicon.ico',
          });
        }
      } catch {}
    }
  }

  public start() {
    if (this.state.isRunning) return;
    const now = Date.now();
    this.state.isRunning = true;
    this.state.targetEndTime = now + this.state.timeLeft * 1000;
    this.startTicker();
    this.updateTabTitle(this.state.timeLeft, this.state.mode, true);

    // Auto-play audio if enabled and not currently playing
    if (this.state.autoPlayAudio && !studyAudio.getIsPlaying()) {
      studyAudio.play();
    }

    this.notify();
  }

  public pause() {
    if (!this.state.isRunning) return;
    this.stopTicker();
    if (this.state.targetEndTime) {
      const remaining = Math.max(0, Math.round((this.state.targetEndTime - Date.now()) / 1000));
      this.state.timeLeft = remaining;
    }
    this.state.isRunning = false;
    this.state.targetEndTime = null;
    this.updateTabTitle(this.state.timeLeft, this.state.mode, false);
    this.notify();
  }

  public reset(newMode?: PomodoroMode) {
    this.stopTicker();
    const mode = newMode || this.state.mode;
    this.state.mode = mode;
    this.state.timeLeft = POMODORO_DURATIONS[mode];
    this.state.isRunning = false;
    this.state.targetEndTime = null;
    this.updateTabTitle(this.state.timeLeft, this.state.mode, false);
    this.notify();
  }

  public setMode(mode: PomodoroMode) {
    this.reset(mode);
  }

  public setSubject(subject: string) {
    this.state.selectedSubject = subject;
    this.notify();
  }

  public setTaskId(taskId: string) {
    this.state.selectedTaskId = taskId;
    this.notify();
  }

  public setAutoPlayAudio(val: boolean) {
    this.state.autoPlayAudio = val;
    this.notify();
  }

  public getState(): PomodoroState {
    return this.state;
  }
}

export const pomodoroManager = new PomodoroManager();

// ----------------------------------------------------------------------------
// REACT HOOK
// ----------------------------------------------------------------------------
export function usePomodoro() {
  const [state, setState] = useState<PomodoroState>(() => pomodoroManager.getState());
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  useEffect(() => {
    const unsub = pomodoroManager.subscribe(setState);
    return unsub;
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Desktop notifications are not supported in this browser.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        toast.success('🔔 Notifications enabled! You will be alerted when timers end.');
      } else if (perm === 'denied') {
        toast.error('Notifications were blocked in your browser settings.');
      }
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
    }
  }, []);

  const start = useCallback(() => pomodoroManager.start(), []);
  const pause = useCallback(() => pomodoroManager.pause(), []);
  const reset = useCallback((mode?: PomodoroMode) => pomodoroManager.reset(mode), []);
  const setMode = useCallback((mode: PomodoroMode) => pomodoroManager.setMode(mode), []);
  const setSubject = useCallback((sub: string) => pomodoroManager.setSubject(sub), []);
  const setTaskId = useCallback((id: string) => pomodoroManager.setTaskId(id), []);
  const setAutoPlayAudio = useCallback((val: boolean) => pomodoroManager.setAutoPlayAudio(val), []);

  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const totalDuration = POMODORO_DURATIONS[state.mode];
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - state.timeLeft) / totalDuration) * 100));

  return {
    ...state,
    minutes,
    seconds,
    totalDuration,
    progressPercent,
    notificationPermission: permission,
    requestNotificationPermission,
    start,
    pause,
    reset,
    setMode,
    setSubject,
    setTaskId,
    setAutoPlayAudio,
  };
}
