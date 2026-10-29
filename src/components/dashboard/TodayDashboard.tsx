import { useState, useEffect, useRef } from 'react';
import { useClassSchedule, ClassSchedule } from '@/hooks/useClassSchedule';
import { useTasks, Task } from '@/hooks/useTasks';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useBragSheet, BragCategory } from '@/hooks/useBragSheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  AlertTriangle,
  Calendar,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Music,
  MapPin,
  User,
  BookOpen,
  Coffee,
  ArrowRight,
  Flame,
  Target,
  PartyPopper,
  GraduationCap,
  Bell,
  Utensils,
  ChevronRight,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';
import { format, isToday, parseISO, differenceInHours } from 'date-fns';
import { isRotationEnabled, getRotationLetter, classMatchesRotation } from '@/lib/rotation';
import { GraduationCountdown } from '@/components/dashboard/GraduationCountdown';
import { MotivationalQuote } from '@/components/dashboard/MotivationalQuote';
import { LunchLitV12Banner } from '@/components/dashboard/LunchLitV12Banner';
import { usePomodoro, PomodoroMode, POMODORO_LABELS } from '@/hooks/usePomodoro';
import { useStudyAudio } from '@/hooks/useStudyAudio';
import { toast } from 'sonner';

interface TodayDashboardProps {
  onNavigate: (tab: string) => void;
}

export function TodayDashboard({ onNavigate }: TodayDashboardProps) {
  return (
    <div className="space-y-6 pb-12 animate-fade-up">
      {/* LunchLit v1.2 Animated Update Banner (Falling academic/focus emojis) */}
      <LunchLitV12Banner onNavigate={onNavigate} />

      {/* 1. Dynamic Hero Section: Active Class / Period Banner */}
      <ActiveClassHero onNavigate={onNavigate} />

      {/* Daily Motivational Inspiration */}
      <MotivationalQuote />

      {/* 2. Combined Action Hub: "Today at a Glance" + Daily #1 Priority */}
      <CombinedActionHub onNavigate={onNavigate} />

      {/* 3. Integrated Pomodoro & Study Bar */}
      <IntegratedStudyBar onNavigate={onNavigate} />

      {/* 4. Quick Capture "Win Log" Widget */}
      <QuickWinLogWidget onNavigate={onNavigate} />

      {/* 5. End-of-Year Countdown (Footer Anchor) */}
      <GraduationCountdown />
    </div>
  );
}

// =========================================================================
// 1. DYNAMIC HERO SECTION: ACTIVE CLASS / PERIOD BANNER
// =========================================================================
function ActiveClassHero({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { classes } = useClassSchedule();
  const { preferences } = useUserPreferences();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const currentDayOfWeek = currentTime.getDay();
  const rotationActive = isRotationEnabled(preferences);
  const currentRotationLetter = rotationActive ? getRotationLetter(currentTime, preferences) : null;

  // Filter today's classes
  const todayClasses = classes
    .filter(cls => (cls.day_of_week === currentDayOfWeek || cls.show_every_day) && classMatchesRotation(cls.rotation_day, currentTime, preferences))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Current time in minutes from midnight
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Find active class
  let activeClass: ClassSchedule | null = null;
  let nextClass: ClassSchedule | null = null;
  let isPassingPeriod = false;
  let passingMinutesLeft = 0;
  let activeRemainingMinutes = 0;
  let activeProgress = 0;

  for (let i = 0; i < todayClasses.length; i++) {
    const cls = todayClasses[i];
    const [startH, startM] = cls.start_time.split(':').map(Number);
    const [endH, endM] = cls.end_time.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (nowMinutes >= startMin && nowMinutes <= endMin) {
      activeClass = cls;
      activeRemainingMinutes = endMin - nowMinutes;
      const totalDuration = endMin - startMin;
      activeProgress = totalDuration > 0 ? Math.min(100, Math.max(0, ((nowMinutes - startMin) / totalDuration) * 100)) : 0;
      nextClass = todayClasses[i + 1] || null;
      break;
    } else if (nowMinutes < startMin) {
      // We are before this class
      if (i > 0) {
        const prevCls = todayClasses[i - 1];
        const [prevEndH, prevEndM] = prevCls.end_time.split(':').map(Number);
        const prevEndMin = prevEndH * 60 + prevEndM;
        if (nowMinutes >= prevEndMin && nowMinutes < startMin) {
          isPassingPeriod = true;
          passingMinutesLeft = startMin - nowMinutes;
          nextClass = cls;
          break;
        }
      }
      if (!nextClass) {
        nextClass = cls;
      }
      break;
    }
  }

  const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;
  const isSchoolDayFinished = !activeClass && !isPassingPeriod && todayClasses.length > 0 && nextClass === null;
  const isBeforeSchool = !activeClass && !isPassingPeriod && todayClasses.length > 0 && nextClass === todayClasses[0];

  return (
    <Card className="card-elevated border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Schedule Status Badge Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {format(currentTime, 'EEEE, MMMM d')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-card/80 border-border/80 font-medium">
              {rotationActive && currentRotationLetter ? (
                <span>{currentRotationLetter === 'A' ? '🅰️ A Day / Block' : currentRotationLetter === 'B' ? '🅱️ B Day / Block' : `${currentRotationLetter} Day`}</span>
              ) : (
                <span>Standard Schedule</span>
              )}
              {todayClasses.length > 0 && ` • ${todayClasses.length} Classes`}
            </Badge>

            <button
              onClick={() => onNavigate('classes')}
              className="text-xs text-primary hover:underline font-semibold flex items-center"
            >
              Schedule →
            </button>
          </div>
        </div>

        {/* Dynamic Class Status Banner */}
        {activeClass ? (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary text-primary-foreground font-bold text-xs uppercase px-2 py-0.5">
                    {activeClass.period_number || 'Current Class'}
                  </Badge>
                  <h2 className="font-display font-extrabold text-2xl text-foreground">
                    {activeClass.class_name}
                  </h2>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                  {activeClass.room_number && (
                    <span className="flex items-center gap-1 text-foreground/90">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {activeClass.room_number}
                    </span>
                  )}
                  {activeClass.teacher_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {activeClass.teacher_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {activeClass.start_time.slice(0, 5)} - {activeClass.end_time.slice(0, 5)}
                  </span>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-2xl font-bold font-mono text-primary">
                  {activeRemainingMinutes}m left
                </div>
                <div className="text-[11px] text-muted-foreground">before the bell rings</div>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1">
              <Progress value={activeProgress} className="h-2 bg-secondary" />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{activeClass.start_time.slice(0, 5)}</span>
                <span>{Math.round(activeProgress)}% elapsed</span>
                <span>{activeClass.end_time.slice(0, 5)}</span>
              </div>
            </div>

            {/* Next Up Badge */}
            {nextClass && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/60 text-xs">
                <span className="font-semibold text-muted-foreground uppercase text-[10px]">Next Up:</span>
                <span className="font-bold text-foreground">
                  {nextClass.period_number ? `${nextClass.period_number}: ` : ''}{nextClass.class_name}
                </span>
                {nextClass.room_number && (
                  <span className="text-muted-foreground">• {nextClass.room_number}</span>
                )}
                <span className="ml-auto text-primary font-medium">{nextClass.start_time.slice(0, 5)}</span>
              </div>
            )}
          </div>
        ) : isPassingPeriod && nextClass ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500 animate-spin" />
                <h3 className="font-bold text-lg text-foreground">Passing Period</h3>
              </div>
              <Badge className="bg-amber-500 text-amber-950 font-bold">{passingMinutesLeft}m to next class</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Head to <strong>{nextClass.class_name}</strong> in {nextClass.room_number ? nextClass.room_number : 'your next room'}. Starts at {nextClass.start_time.slice(0, 5)}.
            </p>
          </div>
        ) : isBeforeSchool && nextClass ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> School Starts Soon
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              First Class Today: {nextClass.class_name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Starts at {nextClass.start_time.slice(0, 5)} {nextClass.room_number ? `in ${nextClass.room_number}` : ''}. Have a great school day!
            </p>
          </div>
        ) : isSchoolDayFinished ? (
          <div className="space-y-1.5 py-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase">
              <CheckCircle2 className="w-4 h-4" /> School Day Finished
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Great work today! All classes complete.
            </h2>
            <p className="text-xs text-muted-foreground">
              Use the Study Bar below to knock out homework, or take a well-deserved rest.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 py-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {isWeekend ? 'Weekend Break' : 'No Classes Scheduled'}
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              {isWeekend ? 'Rest, recharge & prepare for the week.' : 'Free Day / No Active Classes'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Set up your schedule in the Classes tab anytime to see live class tracking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =========================================================================
// 2. COMBINED ACTION HUB: "TODAY AT A GLANCE" + DAILY FOCUS
// =========================================================================
function CombinedActionHub({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { tasks, addTask, updateTask } = useTasks();
  const [priorityDraft, setPriorityDraft] = useState('');
  const [prioritySaved, setPrioritySaved] = useState<{ text: string; done: boolean } | null>(null);
  const [editingPriority, setEditingPriority] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'homework' | 'test' | 'project' | 'general'>('homework');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Load today's #1 priority
  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  useEffect(() => {
    const key = `lunchlit_priority_${todayDateStr}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setPrioritySaved(JSON.parse(stored));
      } catch {
        // ignore
      }
    } else {
      setEditingPriority(true);
    }
  }, [todayDateStr]);

  const handleSavePriority = () => {
    if (!priorityDraft.trim()) return;
    const payload = { text: priorityDraft.trim(), done: false };
    localStorage.setItem(`lunchlit_priority_${todayDateStr}`, JSON.stringify(payload));
    setPrioritySaved(payload);
    setEditingPriority(false);
    toast.success("Today's #1 Focus set!");
  };

  const handleTogglePriorityDone = () => {
    if (!prioritySaved) return;
    const next = { ...prioritySaved, done: !prioritySaved.done };
    localStorage.setItem(`lunchlit_priority_${todayDateStr}`, JSON.stringify(next));
    setPrioritySaved(next);
    if (next.done) {
      toast.success('🎉 You completed your #1 focus for today!');
    }
  };

  // Filter tasks due today or overdue
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return isToday(parseISO(t.due_date)) || new Date(t.due_date) < new Date();
  });

  // Upcoming Test Radar: test/exam/quiz due within 48 hours
  const upcomingTests = tasks.filter(t => {
    if (t.is_completed || !t.due_date) return false;
    const isTestType = t.category === 'test' || /exam|quiz|test|midterm|final/i.test(t.title);
    if (!isTestType) return false;
    const hoursAway = differenceInHours(parseISO(t.due_date), new Date());
    return hoursAway >= -4 && hoursAway <= 48;
  });

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask.mutateAsync({
      title: newTaskTitle.trim(),
      description: null,
      due_date: todayDateStr,
      due_time: '23:59',
      is_completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
    });
    setNewTaskTitle('');
    setIsTaskModalOpen(false);
  };

  return (
    <Card className="card-elevated border-border/80">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Today at a Glance
          </CardTitle>
          <p className="text-xs text-muted-foreground">Your focus and commitments for today</p>
        </div>

        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Assignment / Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label>Task Title / Reminder</Label>
                <Input
                  placeholder="e.g. Finish Math problem set #4 or Club meeting at lunch"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTaskCategory} onValueChange={(v: any) => setNewTaskCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">Homework</SelectItem>
                      <SelectItem value="test">Test / Quiz</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="general">Reminder / Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(v: any) => setNewTaskPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreateTask} className="w-full" disabled={!newTaskTitle.trim()}>
                Save Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Upcoming Test Radar Alert (within 48h) */}
        {upcomingTests.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  ⚠️ Upcoming Test Radar (Next 48 Hours)
                </span>
              </div>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {upcomingTests[0].title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Due {isToday(parseISO(upcomingTests[0].due_date!)) ? 'Today' : 'Tomorrow'} • Make sure to study!
              </p>
            </div>
          </div>
        )}

        {/* 1. Today's #1 Focus Input */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-primary">
              <Target className="w-4 h-4" /> Today's #1 Priority
            </span>
            {prioritySaved && !editingPriority && (
              <button
                onClick={() => {
                  setPriorityDraft(prioritySaved.text);
                  setEditingPriority(true);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline"
              >
                Edit
              </button>
            )}
          </div>

          {editingPriority || !prioritySaved ? (
            <div className="flex gap-2">
              <Input
                placeholder="What's the one thing you MUST get done today?"
                value={priorityDraft}
                onChange={(e) => setPriorityDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePriority()}
                className="text-sm bg-card"
              />
              <Button size="sm" onClick={handleSavePriority} disabled={!priorityDraft.trim()}>
                Set
              </Button>
            </div>
          ) : (
            <div
              onClick={handleTogglePriorityDone}
              className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
            >
              {prioritySaved.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <span className={`text-sm font-semibold flex-1 ${prioritySaved.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {prioritySaved.text}
              </span>
              <Badge variant={prioritySaved.done ? 'secondary' : 'default'} className="text-[10px]">
                {prioritySaved.done ? 'Done! 🎉' : 'In Progress'}
              </Badge>
            </div>
          )}
        </div>

        {/* 2. Interactive Task Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Assignments &amp; Tasks Due Today ({todayTasks.length})</span>
            <button onClick={() => onNavigate('tasks')} className="text-primary hover:underline">
              View All ({tasks.filter(t => !t.is_completed).length} pending) →
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs rounded-xl border border-dashed border-border/60">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500/70" />
              <p className="font-semibold text-foreground">All caught up for today!</p>
              <p className="mt-0.5">No overdue or pending tasks due today.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                    task.is_completed ? 'bg-secondary/30 border-border/40 opacity-60' : 'bg-card border-border hover:border-border/90'
                  }`}
                >
                  <button
                    onClick={() => updateTask.mutate({ id: task.id, is_completed: !task.is_completed })}
                    className="shrink-0"
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  <span className={`text-xs font-medium flex-1 ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>

                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                    {task.category}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================================================
// 3. INTEGRATED POMODORO & STUDY BAR
// =========================================================================
function IntegratedStudyBar({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { classes } = useClassSchedule();
  const {
    mode,
    timeLeft,
    isRunning,
    selectedSubject,
    sessionsCompleted,
    minutes,
    seconds,
    progressPercent,
    notificationPermission,
    requestNotificationPermission,
    start,
    pause,
    reset,
    setMode,
    setSubject,
  } = usePomodoro();

  const {
    isPlaying: audioPlaying,
    currentTrack,
    volume,
    volumePercent,
    tracks,
    togglePlay,
    setTrack,
    setVolume,
  } = useStudyAudio();

  // Extract unique subjects from user schedule
  const subjectOptions = Array.from(new Set(['General Study', ...classes.map(c => c.class_name)]));

  return (
    <Card className="card-elevated border-border/80 shadow-md">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Pomodoro Focus &amp; Study Bar
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20">
                ⚡ {sessionsCompleted}/4 Completed Today
              </Badge>
              {notificationPermission !== 'granted' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="h-6 text-[10px] gap-1 px-2 text-muted-foreground hover:text-foreground"
                  title="Enable desktop alerts when tab is in background"
                >
                  <Bell className="w-3 h-3" />
                  <span>Enable Tab Alerts</span>
                </Button>
              ) : (
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tab Alerts On
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Runs in background • Live tab title countdown • Subject-linked deep work
            </p>
          </div>

          {/* Subject tag selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Subject:</span>
            <Select value={selectedSubject} onValueChange={setSubject}>
              <SelectTrigger className="h-8 text-xs w-[160px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compact Timer Controls */}
        <div className="grid sm:grid-cols-3 gap-4 items-center p-3.5 rounded-xl bg-secondary/40 border border-border/70">
          {/* Preset Buttons */}
          <div className="flex sm:flex-col gap-1.5">
            {(['work', 'short_break', 'long_break'] as PomodoroMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
                  mode === m
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card hover:bg-card/80 text-foreground'
                }`}
              >
                {m === 'work' ? 'Focus 25m' : m === 'short_break' ? 'Short Break 5m' : 'Long Break 15m'}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-1">
            <div className="font-mono text-4xl sm:text-5xl font-black text-foreground tabular-nums tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
              <span>Studying:</span>
              <span className="font-bold text-primary">{selectedSubject}</span>
              {isRunning && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" title="Running in background" />
              )}
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-secondary/80 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex sm:flex-col gap-2 justify-center">
            <Button
              onClick={isRunning ? pause : start}
              className={`flex-1 sm:flex-none gap-2 font-semibold text-xs shadow-sm ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'shadow-primary/20'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reset()}
              className="flex-1 sm:flex-none gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>

        {/* 100% Royalty-Free Audio Controls */}
        <div className="space-y-2.5 p-3 rounded-lg bg-card border border-border/70 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Study Soundscape &amp; Beats</span>
                  {audioPlaying && (
                    <span className="flex items-center gap-0.5 h-3">
                      <span className="w-0.5 h-2 bg-primary animate-pulse" />
                      <span className="w-0.5 h-3 bg-primary animate-pulse delay-75" />
                      <span className="w-0.5 h-1.5 bg-primary animate-pulse delay-150" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Plays in background • Procedural lofi &amp; licensed radio</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <Switch checked={audioPlaying} onCheckedChange={togglePlay} />
            </div>
          </div>

          {audioPlaying && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Select value={currentTrack.id} onValueChange={setTrack}>
                  <SelectTrigger className="h-7 text-xs flex-1 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Procedural Generators (100% Free &amp; Offline)
                    </div>
                    {tracks
                      .filter(t => t.category === 'procedural')
                      .map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                    <div className="px-2 py-1 pt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border/40">
                      Licensed Internet Radio (SomaFM)
                    </div>
                    {tracks
                      .filter(t => t.category === 'stream')
                      .map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Volume slider */}
                <div className="flex items-center gap-2 sm:w-48">
                  <button
                    type="button"
                    onClick={() => setVolume(volume > 0 ? 0 : 0.4)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <Slider
                    value={[volumePercent]}
                    onValueChange={([v]) => setVolume(v / 100)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{volumePercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Legal Compliance Badge */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/90 pt-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>100% Legal &amp; Royalty-Free: Procedurally generated audio &amp; US statutorily licensed webcasting</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================================================
// 4. QUICK CAPTURE "WIN LOG" WIDGET (APPENDS TO BRAG SHEET)
// =========================================================================
function QuickWinLogWidget({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { addEntry } = useBragSheet();
  const [modalOpen, setModalOpen] = useState(false);
  const [winTitle, setWinTitle] = useState('');
  const [winCategory, setWinCategory] = useState<BragCategory>('award');
  const [winImpact, setWinImpact] = useState('');
  const [winHours, setWinHours] = useState('');

  const handleSaveWin = async () => {
    if (!winTitle.trim()) return;

    await addEntry.mutateAsync({
      title: winTitle.trim(),
      category: winCategory,
      description: `Daily win logged: ${winTitle.trim()}`,
      impact: winImpact.trim() || null,
      hours_spent: winHours ? parseFloat(winHours) : null,
      grade_level: '8th Grade',
      school_year: '2025-2026',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      is_ongoing: false,
      position_role: null,
      grades_participated: ['8th Grade'],
      year_received: format(new Date(), 'yyyy'),
      images: null,
      is_auto_suggested: false,
      suggested_from_task_id: null,
    });

    toast.success('🏆 Win logged directly to your Brag Sheet!');
    setWinTitle('');
    setWinImpact('');
    setWinHours('');
    setModalOpen(false);
  };

  return (
    <Card className="card-elevated border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-base text-foreground">
              Daily Win Log &amp; Streak
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Capture test scores, leadership moments, and club milestones instantly for your counselor brag sheet.
          </p>

          {/* Micro-streak 5-dot bar */}
          <div className="flex items-center gap-1.5 pt-2">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Daily Focus Streak:</span>
            {[1, 2, 3, 4, 5].map((dot) => (
              <span
                key={dot}
                className={`w-2.5 h-2.5 rounded-full ${
                  dot <= 4 ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-secondary border border-border'
                }`}
                title={`Day ${dot}`}
              />
            ))}
            <span className="text-[11px] font-bold text-amber-500 ml-1">4/5 Days</span>
          </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Log Daily Win
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Capture Achievement to Brag Sheet
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label>Achievement / Win Title</Label>
                <Input
                  placeholder="e.g. 1st place in Science Bowl or Scored 98% on Physics Midterm"
                  value={winTitle}
                  onChange={(e) => setWinTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={winCategory} onValueChange={(v: any) => setWinCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="award">Award / Honor</SelectItem>
                      <SelectItem value="academic">Academic Win</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="club">Club / Extracurricular</SelectItem>
                      <SelectItem value="volunteering">Volunteering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hours (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 4"
                    value={winHours}
                    onChange={(e) => setWinHours(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Impact / Reflection</Label>
                <Input
                  placeholder="e.g. Led team study sessions and achieved highest score in class"
                  value={winImpact}
                  onChange={(e) => setWinImpact(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveWin} className="w-full font-bold" disabled={!winTitle.trim()}>
                Save Directly to Brag Sheet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
export default TodayDashboard;
