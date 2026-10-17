// Hidden redemption + secret-unlock helpers for LunchLIT

// The exact, case-sensitive redemption code (revealed via the secret rickroll page)
export const MATRIX_CODE = "YOUDIDN'TFALLFORIT:(";

const MATRIX_KEY = 'lunchlit_matrix_unlocked';
const CODE_REDEEMED_KEY = 'lunchlit_code_redeemed';
const VISITED_VIEWS_KEY = 'lunchlit_visited_views';
const SECRET_WARNING_KEY = 'lunchlit_secret_warning_seen';

export function isMatrixUnlocked(): boolean {
  return localStorage.getItem(MATRIX_KEY) === 'true';
}

export function isCodeRedeemed(): boolean {
  return localStorage.getItem(CODE_REDEEMED_KEY) === 'true';
}

export interface RedemptionResult {
  success: boolean;
  message: string;
  theme?: 'default' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'midnight' | 'matrix';
}

/** Returns redemption result with custom message and theme */
export function redeemSecretCode(input: string, userFullName?: string | null): RedemptionResult {
  const raw = input.trim();
  const normalized = raw.toLowerCase().replace(/['"`]/g, '');

  if (!raw) {
    return { success: false, message: 'Please enter a code.' };
  }

  // 1. Original Matrix Code
  if (raw === MATRIX_CODE || normalized === "youdidntfallforit:(") {
    localStorage.setItem(MATRIX_KEY, 'true');
    localStorage.setItem(CODE_REDEEMED_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
    return {
      success: true,
      message: '⛓️ Matrix Anomaly theme unlocked!',
      theme: 'matrix',
    };
  }

  // 2. Rickroll / ASCII Terminal Code
  if (
    normalized === 'curl.exe ascii.live/rick' ||
    normalized === 'curl ascii.live/rick' ||
    normalized === 'ascii.live/rick'
  ) {
    localStorage.setItem(MATRIX_KEY, 'true');
    localStorage.setItem('lunchlit_code_rick', 'true');
    localStorage.setItem(CODE_REDEEMED_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
    return {
      success: true,
      message: '🕺 Never Gonna Give You Up! Rickroll ASCII terminal unlocked & Matrix theme enabled! 🎵',
      theme: 'matrix',
    };
  }

  // 3. Phantom Thief Code (Persona 5 tribute)
  if (
    normalized === 'phantom thief' ||
    normalized === 'phantomthief' ||
    normalized === 'phantom thieves' ||
    normalized === 'take your heart'
  ) {
    localStorage.setItem('lunchlit_code_phantom_thief', 'true');
    localStorage.setItem(CODE_REDEEMED_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
    return {
      success: true,
      message: "🃏 'Take Your Heart!' The Phantom Thieves have infiltrated LunchLit! 🎭",
      theme: 'sunset',
    };
  }

  // 4. Larp Kaisen Code (Jujutsu Kaisen tribute)
  if (
    normalized === 'larp kaisen' ||
    normalized === 'larpkaisen' ||
    normalized === 'domain expansion'
  ) {
    localStorage.setItem('lunchlit_code_larp_kaisen', 'true');
    localStorage.setItem(CODE_REDEEMED_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
    return {
      success: true,
      message: '🤞 Domain Expansion: Infinite Productivity! Special Grade Sorcerer unlocked! ⚡',
      theme: 'midnight',
    };
  }

  // 5. Creator's Name: Ram
  if (
    normalized === 'ram' ||
    normalized === 'ramakrishna' ||
    normalized === 'ramakrishna krishna' ||
    normalized === 'ram the goat'
  ) {
    localStorage.setItem('lunchlit_code_ram_creator', 'true');
    localStorage.setItem(CODE_REDEEMED_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
    return {
      success: true,
      message: "👑 Creator's Blessing! Ram the GOAT has granted you creator-tier respect! 🌟",
      theme: 'default',
    };
  }

  // 6. Whatever the user's chosen name is
  const userClean = (userFullName || localStorage.getItem('lunchlit_user_name') || '').trim().toLowerCase();
  if (userClean && userClean.length >= 2 && (normalized === userClean || normalized === userClean.replace(/['"`]/g, ''))) {
    localStorage.setItem('lunchlit_code_self_name', 'true');
    localStorage.setItem(CODE_REDEEMED_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
    return {
      success: true,
      message: `✨ Identity Verified: Welcome to your personalized LunchLit universe, ${userFullName || raw}! 🚀`,
      theme: 'default',
    };
  }

  return {
    success: false,
    message: 'Invalid code. The anomaly remains hidden.',
  };
}

export function markSecretWarningSeen() {
  localStorage.setItem(SECRET_WARNING_KEY, 'true');
  window.dispatchEvent(new Event('secret-unlock'));
}

export function hasSeenSecretWarning(): boolean {
  return localStorage.getItem(SECRET_WARNING_KEY) === 'true';
}

// ── Deep Diver: track which core views have been visited ──
const CORE_VIEWS = [
  'home', 'menu', 'classes', 'bragsheet', 'portfolio',
  'tasks', 'discuss', 'study', 'chat', 'tutor', 'profiles', 'settings',
];

export function recordViewVisit(view: string) {
  try {
    const raw = localStorage.getItem(VISITED_VIEWS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (!set.includes(view)) {
      set.push(view);
      localStorage.setItem(VISITED_VIEWS_KEY, JSON.stringify(set));
      window.dispatchEvent(new Event('secret-unlock'));
    }
  } catch {
    /* ignore */
  }
}

export function hasVisitedAllViews(): boolean {
  try {
    const raw = localStorage.getItem(VISITED_VIEWS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    return CORE_VIEWS.every((v) => set.includes(v));
  } catch {
    return false;
  }
}

// ── En Passant: detect that the dev console was opened ──
const CONSOLE_KEY = 'lunchlit_console_opened';
export function markConsoleOpened() {
  if (localStorage.getItem(CONSOLE_KEY) !== 'true') {
    localStorage.setItem(CONSOLE_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
  }
}
export function wasConsoleOpened(): boolean {
  return localStorage.getItem(CONSOLE_KEY) === 'true';
}

export const OWNER_EMAIL = 'kutturam0912@gmail.com';

/** Checks whether a given email address belongs to the app owner */
export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/** A friendly, copyable friend code / UID derived from the user id */
export function friendCodeFromUserId(userId?: string | null): string {
  if (!userId) return 'LIT-000000';
  const clean = userId.replace(/-/g, '').toUpperCase();
  return `LIT-${clean.slice(0, 3)}${clean.slice(6, 9)}`;
}
