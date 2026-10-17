export type RotationType = 'none' | 'ab';
export type RotationLetter = 'A' | 'B' | 'C';
export type RotationDayOption = 'all' | 'A' | 'B' | 'C';

export interface RotationSettings {
  schedule_rotation?: string | null;
  rotation_anchor_date?: string | null;
  rotation_anchor_letter?: string | null;
  rotation_skip_weekends?: boolean | null;
}

/**
 * Parse a Date or date string ('YYYY-MM-DD') into a local midnight Date.
 * Avoids new Date("YYYY-MM-DD") which parses as UTC and causes day-shift errors.
 */
export function parseLocalDate(input: Date | string): Date {
  if (input instanceof Date) {
    const d = new Date(input.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    const d = new Date(input);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Check if A/B rotation is currently configured and active.
 */
export function isRotationEnabled(settings?: RotationSettings | null): boolean {
  if (!settings) return false;
  return (
    settings.schedule_rotation === 'ab' &&
    !!settings.rotation_anchor_date &&
    settings.rotation_anchor_date.trim().length > 0
  );
}

/**
 * Calculates the A/B rotation letter for a given date.
 * Counts elapsed days (skipping Sat/Sun if rotation_skip_weekends is true),
 * and flips the anchor letter on odd counts.
 * Returns null on weekends if skipping weekends is enabled.
 */
export function getRotationLetter(
  date: Date | string,
  settings?: RotationSettings | null
): RotationLetter | null {
  if (!isRotationEnabled(settings)) return null;

  const target = parseLocalDate(date);
  const anchor = parseLocalDate(settings!.rotation_anchor_date!);
  const anchorLetter: RotationLetter =
    settings!.rotation_anchor_letter === 'B' ? 'B' : 'A';
  const skipWeekends = settings!.rotation_skip_weekends !== false;

  const targetDay = target.getDay();
  const isWeekend = targetDay === 0 || targetDay === 6;

  if (skipWeekends && isWeekend) {
    return null;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const targetTime = target.getTime();
  const anchorTime = anchor.getTime();

  if (targetTime === anchorTime) {
    return anchorLetter;
  }

  let count = 0;

  if (targetTime > anchorTime) {
    // Step forward day-by-day from anchor + 1 day to target
    const current = new Date(anchorTime);
    while (current.getTime() < targetTime) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (skipWeekends && (day === 0 || day === 6)) {
        continue;
      }
      count++;
    }
  } else {
    // Step backward day-by-day from anchor - 1 day down to target
    const current = new Date(anchorTime);
    while (current.getTime() > targetTime) {
      current.setDate(current.getDate() - 1);
      const day = current.getDay();
      if (skipWeekends && (day === 0 || day === 6)) {
        continue;
      }
      count++;
    }
  }

  // Check if this date is a C Day override (all periods on one day)
  const cDayDates = getCDayDates();
  const targetDateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  if (cDayDates.includes(targetDateStr)) {
    return 'C';
  }

  // Fix: swap the odd/even output so selecting A Day anchor actually produces A on anchor date's parity
  const isOdd = count % 2 !== 0;
  const oppositeLetter: RotationLetter = anchorLetter === 'A' ? 'B' : 'A';

  return isOdd ? oppositeLetter : anchorLetter;
}

/**
 * Checks whether a class meets on a specific date based on its rotation setting.
 * 'all' always matches. When rotation is off, everything matches.
 * C Day means ALL classes show (both A and B), so everything matches.
 * Otherwise, only matches if the computed letter equals rotationDay.
 */
export function classMatchesRotation(
  rotationDay: string | null | undefined,
  date: Date | string,
  settings?: RotationSettings | null
): boolean {
  if (!isRotationEnabled(settings)) return true;
  if (!rotationDay || rotationDay === 'all') return true;

  const letter = getRotationLetter(date, settings);
  if (!letter) return false;

  // C Day = all periods on one day, so ALL classes match regardless of A/B tag
  if (letter === 'C') return true;

  return rotationDay === letter;
}

/**
 * Returns the next N school days with their computed rotation letter for live preview.
 */
export function getRotationPreview(
  settings?: RotationSettings | null,
  days: number = 8
): { date: Date; letter: RotationLetter }[] {
  const preview: { date: Date; letter: RotationLetter }[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const current = new Date(start);
  let iterations = 0;
  const maxIterations = days * 4; // Safety break

  while (preview.length < days && iterations < maxIterations) {
    const letter = getRotationLetter(current, settings);
    if (letter) {
      preview.push({
        date: new Date(current),
        letter,
      });
    }
    current.setDate(current.getDate() + 1);
    iterations++;
  }

  return preview;
}

// =========================================================================
// C DAY OVERRIDES — stored in localStorage as a JSON array of date strings
// C Day = rare "all periods" day, only available when A/B schedule is active
// =========================================================================
const C_DAY_STORAGE_KEY = 'lunchlit_c_day_dates';

export function getCDayDates(): string[] {
  try {
    const raw = localStorage.getItem(C_DAY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCDayDate(dateStr: string): string[] {
  const dates = getCDayDates();
  if (!dates.includes(dateStr)) {
    dates.push(dateStr);
    localStorage.setItem(C_DAY_STORAGE_KEY, JSON.stringify(dates));
  }
  return dates;
}

export function removeCDayDate(dateStr: string): string[] {
  const dates = getCDayDates().filter(d => d !== dateStr);
  localStorage.setItem(C_DAY_STORAGE_KEY, JSON.stringify(dates));
  return dates;
}
