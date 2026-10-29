import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useBragSheet } from '@/hooks/useBragSheet';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  OWNER_EMAIL,
  isOwnerEmail,
  isCodeRedeemed,
  hasSeenSecretWarning,
  wasConsoleOpened,
  hasVisitedAllViews,
} from '@/lib/secrets';

export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'tasks' | 'bragsheet' | 'academic' | 'consistency' | 'exploration' | 'social' | 'general' | 'menu' | 'studyhall' | 'planner' | 'discussion' | 'portfolio' | 'settings' | 'pomodoro' | 'tutoring' | 'fitness';
  secret?: boolean;
  check: (ctx: BadgeContext) => boolean;
}

interface BadgeContext {
  completedTasks: number;
  totalTasks: number;
  bragEntries: number;
  totalWorkouts: number;
  workoutStreak: number;
  taskStreak: number;
  wellnessDays: number;
  pomodoroSessions: number;
}

// ── Track a simple consecutive-day task streak in localStorage ──
function recordTaskStreak(completedTasks: number): number {
  const KEY = 'lunchlit_task_streak';
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(KEY);
    const state = raw ? JSON.parse(raw) : { last: '', streak: 0 };
    if (completedTasks > 0 && state.last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      state.streak = state.last === yesterday ? state.streak + 1 : 1;
      state.last = today;
      localStorage.setItem(KEY, JSON.stringify(state));
    }
    return state.streak || 0;
  } catch {
    return 0;
  }
}

export const BADGES: Badge[] = [
  // ──── Tasks ────
  { key: 'first_task', name: 'Getting Started', description: 'Complete your first task', icon: '✅', category: 'tasks', check: ctx => ctx.completedTasks >= 1 },
  { key: 'task_5', name: 'Task Master', description: 'Complete 5 tasks', icon: '⭐', category: 'tasks', check: ctx => ctx.completedTasks >= 5 },
  { key: 'task_10', name: 'On a Roll', description: 'Complete 10 tasks', icon: '🔥', category: 'tasks', check: ctx => ctx.completedTasks >= 10 },
  { key: 'task_25', name: 'Productivity Pro', description: 'Complete 25 tasks', icon: '🏆', category: 'tasks', check: ctx => ctx.completedTasks >= 25 },
  { key: 'task_50', name: 'Half Century', description: 'Complete 50 tasks', icon: '🎖️', category: 'tasks', check: ctx => ctx.completedTasks >= 50 },
  { key: 'task_100', name: 'Century Club', description: 'Complete 100 tasks', icon: '💯', category: 'tasks', check: ctx => ctx.completedTasks >= 100 },
  { key: 'task_200', name: 'Task Legend', description: 'Complete 200 tasks', icon: '🏅', category: 'tasks', check: ctx => ctx.completedTasks >= 200 },

  // ──── Brag Sheet ────
  { key: 'brag_1', name: 'Brag Starter', description: 'Add your first Brag Sheet entry', icon: '📝', category: 'bragsheet', check: ctx => ctx.bragEntries >= 1 },
  { key: 'brag_3', name: 'Building Up', description: 'Add 3 Brag Sheet entries', icon: '📌', category: 'bragsheet', check: ctx => ctx.bragEntries >= 3 },
  { key: 'brag_5', name: 'Resume Builder', description: 'Add 5 Brag Sheet entries', icon: '📋', category: 'bragsheet', check: ctx => ctx.bragEntries >= 5 },
  { key: 'brag_10', name: 'Achievement Hunter', description: '10 Brag Sheet entries', icon: '🎯', category: 'bragsheet', check: ctx => ctx.bragEntries >= 10 },
  { key: 'brag_20', name: 'Overachiever', description: '20 Brag Sheet entries', icon: '🌟', category: 'bragsheet', check: ctx => ctx.bragEntries >= 20 },
  { key: 'brag_30', name: 'Portfolio Master', description: '30 Brag Sheet entries', icon: '👑', category: 'bragsheet', check: ctx => ctx.bragEntries >= 30 },

  // ──── Academic ────
  { key: 'task_creator_10', name: 'Planner', description: 'Create 10 tasks total', icon: '📅', category: 'academic', check: ctx => ctx.totalTasks >= 10 },
  { key: 'task_creator_25', name: 'Organized', description: 'Create 25 tasks total', icon: '🗂️', category: 'academic', check: ctx => ctx.totalTasks >= 25 },
  { key: 'task_creator_50', name: 'Super Planner', description: 'Create 50 tasks total', icon: '🧠', category: 'academic', check: ctx => ctx.totalTasks >= 50 },
  { key: 'task_creator_100', name: 'Planning Prodigy', description: 'Create 100 tasks total', icon: '🗓️', category: 'academic', check: ctx => ctx.totalTasks >= 100 },

  // ──── Consistency ────
  { key: 'first_complete', name: 'First Steps', description: 'Complete your very first task', icon: '👣', category: 'consistency', check: ctx => ctx.completedTasks >= 1 },
  { key: 'steady_worker', name: 'Steady Worker', description: 'Complete 15 tasks', icon: '⚡', category: 'consistency', check: ctx => ctx.completedTasks >= 15 },
  { key: 'grinder', name: 'The Grinder', description: 'Complete 75 tasks', icon: '💪', category: 'consistency', check: ctx => ctx.completedTasks >= 75 },
  { key: 'unstoppable', name: 'Unstoppable', description: 'Complete 150 tasks', icon: '🚀', category: 'consistency', check: ctx => ctx.completedTasks >= 150 },

  // ──── Exploration (SECRET — criteria hidden while locked) ────
  { key: 'glitch_hunter', name: 'Glitch Hunter', description: 'You found the anomaly in the corner of reality.', icon: '🐛', category: 'exploration', secret: true, check: () => hasSeenSecretWarning() },
  { key: 'en_passant', name: 'En Passant', description: 'You opened the developer console. A forbidden move.', icon: '♟️', category: 'exploration', secret: true, check: () => wasConsoleOpened() },
  { key: 'deep_diver', name: 'Deep Diver', description: 'You explored every core view in the app.', icon: '🤿', category: 'exploration', secret: true, check: () => hasVisitedAllViews() },

  // ──── Social / Participation ────
  { key: 'contributor', name: 'Contributor', description: 'Add 2 brag entries', icon: '🤝', category: 'social', check: ctx => ctx.bragEntries >= 2 },
  { key: 'team_player', name: 'Team Player', description: 'Complete 3 tasks and have 1 brag entry', icon: '🎪', category: 'social', check: ctx => ctx.completedTasks >= 3 && ctx.bragEntries >= 1 },
  { key: 'community_builder', name: 'Community Builder', description: '10 tasks + 5 brag entries', icon: '🏘️', category: 'social', check: ctx => ctx.completedTasks >= 10 && ctx.bragEntries >= 5 },
  { key: 'inviter', name: 'Spread the Word', description: 'Invite a friend to LunchLit', icon: '📨', category: 'social', check: () => false },

  // ──── General / Milestone ────
  { key: 'well_rounded', name: 'Well-Rounded', description: 'Complete 5 tasks AND have 3 brag entries', icon: '💎', category: 'general', check: ctx => ctx.completedTasks >= 5 && ctx.bragEntries >= 3 },
  { key: 'scholar', name: 'Scholar', description: 'Complete 25 tasks AND have 10 brag entries', icon: '🎓', category: 'general', check: ctx => ctx.completedTasks >= 25 && ctx.bragEntries >= 10 },
  { key: 'renaissance', name: 'Renaissance Student', description: '50 tasks + 15 brag entries', icon: '🎨', category: 'general', check: ctx => ctx.completedTasks >= 50 && ctx.bragEntries >= 15 },
  { key: 'valedictorian', name: 'Valedictorian', description: '100 tasks + 20 brag entries', icon: '🏛️', category: 'general', check: ctx => ctx.completedTasks >= 100 && ctx.bragEntries >= 20 },
  { key: 'the_architect', name: 'The Architect', description: 'Save 15+ Brag Sheet achievements', icon: '🏗️', category: 'general', check: ctx => ctx.bragEntries >= 15 },
  { key: 'flawless_strategy', name: 'Flawless Strategy', description: 'Maintain a 7-day task tracking streak', icon: '📈', category: 'general', check: ctx => ctx.taskStreak >= 7 },
  { key: 'polished_portfolio', name: 'Polished Portfolio', description: 'Complete and export your portfolio template', icon: '🗃️', category: 'general', check: () => false },

  // ──── Study Halls ────
  { key: 'study_spot', name: 'Study Spot Finder', description: 'Browse study halls for the first time', icon: '📖', category: 'studyhall', check: () => false },
  { key: 'study_regular', name: 'Study Regular', description: 'Check study halls 10 times', icon: '🏫', category: 'studyhall', check: () => false },

  // ──── Planner / Schedule ────
  { key: 'schedule_set', name: 'Schedule Set', description: 'Add your first class to your schedule', icon: '📆', category: 'planner', check: () => false },
  { key: 'full_schedule', name: 'Full Schedule', description: 'Have 5+ classes in your schedule', icon: '🗓️', category: 'planner', check: () => false },

  // ──── Discussion ────
  { key: 'discussion_starter', name: 'Discussion Starter', description: 'Create your first discussion post', icon: '💬', category: 'discussion', check: () => false },
  { key: 'active_voice', name: 'Active Voice', description: 'Create 5 discussion posts or replies', icon: '📢', category: 'discussion', check: () => false },
  { key: 'community_catalyst', name: 'Community Catalyst', description: 'Earn 20+ likes across your posts', icon: '⚡', category: 'discussion', check: () => false },
  { key: 'influential_voice', name: 'Influential Voice', description: 'Positive engagement across 5+ threads', icon: '📣', category: 'discussion', check: () => false },

  // ──── Portfolio / Goals ────
  { key: 'goal_setter', name: 'Goal Setter', description: 'Set your first student goal', icon: '🎯', category: 'portfolio', check: () => false },
  { key: 'goal_achiever', name: 'Goal Achiever', description: 'Complete a student goal', icon: '🏁', category: 'portfolio', check: () => false },

  // ──── Settings / Profile ────
  { key: 'profile_complete', name: 'Profile Complete', description: 'Set your name, grade, and school', icon: '👤', category: 'settings', check: () => false },
  { key: 'customizer', name: 'Customizer', description: 'Change your theme from the default', icon: '🎨', category: 'settings', check: () => false },

  // ──── Pomodoro ────
  { key: 'focus_starter', name: 'Focus Starter', description: 'Complete your first Pomodoro session', icon: '🍅', category: 'pomodoro', check: ctx => ctx.pomodoroSessions >= 1 },
  { key: 'focus_master', name: 'Focus Master', description: 'Complete 10 Pomodoro sessions', icon: '🧘', category: 'pomodoro', check: ctx => ctx.pomodoroSessions >= 10 },

  // ──── Tutoring ────
  { key: 'tutor_helper', name: 'Tutor Helper', description: 'Add yourself as a tutor', icon: '🎓', category: 'tutoring', check: () => false },
  { key: 'tutor_mentor', name: 'Mentor', description: 'Be available as tutor in 2+ subjects', icon: '🧑‍🏫', category: 'tutoring', check: () => false },

  // ──── Fitness, Nutrition & Wellness ────
  { key: 'first_workout', name: 'First Rep', description: 'Log your first workout', icon: '🏋️', category: 'fitness', check: ctx => ctx.totalWorkouts >= 1 },
  { key: 'workout_10', name: 'Gym Regular', description: 'Log 10 workouts', icon: '💪', category: 'fitness', check: ctx => ctx.totalWorkouts >= 10 },
  { key: 'workout_50', name: 'Iron Will', description: 'Log 50 workouts', icon: '🦾', category: 'fitness', check: ctx => ctx.totalWorkouts >= 50 },
  { key: 'streak_3', name: 'Warming Up', description: '3-day workout streak', icon: '🔥', category: 'fitness', check: ctx => ctx.workoutStreak >= 3 },
  { key: 'streak_7', name: 'On Fire', description: '7-day workout streak', icon: '⚡', category: 'fitness', check: ctx => ctx.workoutStreak >= 7 },
  { key: 'streak_30', name: 'Unbreakable', description: '30-day workout streak', icon: '🏆', category: 'fitness', check: ctx => ctx.workoutStreak >= 30 },
  { key: 'macro_managed', name: 'Macro Managed', description: 'Log a full daily meal plan', icon: '🥗', category: 'fitness', check: () => false },
  { key: 'clean_fuel', name: 'Clean Fuel', description: 'Track healthy inputs for 5 days', icon: '🍎', category: 'fitness', check: ctx => ctx.wellnessDays >= 5 },
  { key: 'peak_optimization', name: 'Peak Optimization', description: 'Reach a set fitness benchmark', icon: '📊', category: 'fitness', check: ctx => ctx.totalWorkouts >= 20 },
];

// Special badge for completing ALL other badges + redeeming the secret code
export const MASTER_BADGE: Badge = {
  key: 'lunchlit_master',
  name: 'LunchLit Master',
  description: 'Unlock every single badge AND redeem the secret code — you are legendary!',
  icon: '👑',
  category: 'general',
  check: () => false,
};

export const ALL_BADGES_INCLUDING_MASTER = [...BADGES, MASTER_BADGE];
const ALL_BADGE_KEYS = ALL_BADGES_INCLUDING_MASTER.map(b => b.key);

export function useAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { tasks } = useTasks();
  const { entries } = useBragSheet();
  const { logs, dayStreak } = useWorkouts();

  const isOwner = isOwnerEmail(user?.email);

  const { data: dbUnlocked = [], isLoading } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(d => d.badge_key);
    },
    enabled: !!user,
  });

  // Owner override: every badge is unlocked from the start
  const unlocked = useMemo(
    () => (isOwner ? ALL_BADGE_KEYS : dbUnlocked),
    [isOwner, dbUnlocked]
  );

  const unlockBadge = useMutation({
    mutationFn: async (badgeKey: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .rpc('award_achievement', { _user_id: user.id, _badge_key: badgeKey });
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: (_, badgeKey) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      const badge = ALL_BADGES_INCLUDING_MASTER.find(b => b.key === badgeKey);
      if (badge) {
        toast.success(`${badge.icon} Badge unlocked: ${badge.name}!`);
      }
    },
  });

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const uniqueWorkoutDays = useMemo(() => {
    const days = new Set((logs || []).map((l: { created_at?: string; date?: string }) => (l.created_at || l.date || '').slice(0, 10)).filter(Boolean));
    return days.size;
  }, [logs]);

  const context: BadgeContext = useMemo(() => ({
    completedTasks,
    totalTasks: tasks.length,
    bragEntries: entries?.length || 0,
    totalWorkouts: logs.length,
    workoutStreak: dayStreak,
    taskStreak: recordTaskStreak(completedTasks),
    wellnessDays: uniqueWorkoutDays,
    pomodoroSessions: parseInt(localStorage.getItem('lunchlit_pomodoro_total_sessions') || '0', 10),
  }), [tasks, entries, logs, dayStreak, completedTasks, uniqueWorkoutDays]);

  // Auto-check for new badges
  useEffect(() => {
    if (!user || isLoading || isOwner) return;
    BADGES.forEach(badge => {
      if (!dbUnlocked.includes(badge.key) && badge.check(context)) {
        unlockBadge.mutate(badge.key);
      }
    });
    // Master badge: ALL regular badges unlocked AND secret code redeemed
    const allRegularUnlocked = BADGES.every(b => dbUnlocked.includes(b.key));
    if (allRegularUnlocked && isCodeRedeemed() && !dbUnlocked.includes(MASTER_BADGE.key)) {
      unlockBadge.mutate(MASTER_BADGE.key);
    }
  }, [context, dbUnlocked, user, isLoading, isOwner, unlockBadge]);

  const hasMaster = isOwner || unlocked.includes(MASTER_BADGE.key);

  return {
    unlocked,
    badges: BADGES,
    allBadges: ALL_BADGES_INCLUDING_MASTER,
    masterBadge: MASTER_BADGE,
    hasMaster,
    isOwner,
    isLoading,
    unlockBadge,
  };
}
