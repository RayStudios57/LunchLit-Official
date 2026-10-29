import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BookOpen,
  Music,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { usePomodoro, PomodoroMode, POMODORO_LABELS } from '@/hooks/usePomodoro';
import { useStudyAudio } from '@/hooks/useStudyAudio';

export function PomodoroTimer() {
  const { tasks } = useTasks();
  const {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    selectedTaskId,
    minutes,
    seconds,
    progressPercent,
    notificationPermission,
    requestNotificationPermission,
    start,
    pause,
    reset,
    setMode,
    setTaskId,
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

  const incompleteTasks = tasks.filter((t) => !t.is_completed);

  return (
    <Card className="card-elevated border-border/80 shadow-md">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Pomodoro Focus Timer
          </CardTitle>
          <div className="flex items-center gap-2">
            {notificationPermission !== 'granted' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={requestNotificationPermission}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                title="Enable desktop notifications when tab is in background"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alerts</span>
              </Button>
            ) : (
              <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Tab Alerts On
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
              ⚡ {sessionsCompleted} Today
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Mode Selector */}
        <div className="flex gap-1 bg-secondary/60 rounded-lg p-1">
          {(['work', 'short_break', 'long_break'] as PomodoroMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                mode === m
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {POMODORO_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Circular Progress & Time Display */}
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-40 h-40 -rotate-90 drop-shadow-sm" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="6" className="stroke-secondary" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="6"
              className="stroke-primary transition-all duration-1000 ease-linear"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercent / 100)}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            {mode === 'work' ? (
              <BookOpen className="w-5 h-5 text-primary mb-1 animate-pulse" />
            ) : (
              <Coffee className="w-5 h-5 text-amber-500 mb-1 animate-pulse" />
            )}
            <span className="text-3xl font-mono font-bold tabular-nums tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {isRunning ? '⏳ Live Tab Countdown' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={() => reset()} title="Reset Timer">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            onClick={isRunning ? pause : start}
            className={`gap-2 px-6 font-semibold shadow-md ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Start Focus'}
          </Button>
        </div>

        {/* Study Audio Controls (100% Royalty Free & Licensed Streams) */}
        <div className="space-y-3 p-3.5 rounded-xl bg-secondary/50 border border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-semibold cursor-pointer">Study Soundscape</Label>
                  {audioPlaying && (
                    <span className="flex items-center gap-0.5 h-3">
                      <span className="w-0.5 h-2 bg-primary animate-pulse" />
                      <span className="w-0.5 h-3 bg-primary animate-pulse delay-75" />
                      <span className="w-0.5 h-1.5 bg-primary animate-pulse delay-150" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Royalty-free ambient &amp; lofi audio</p>
              </div>
            </div>
            <Switch checked={audioPlaying} onCheckedChange={togglePlay} />
          </div>

          {audioPlaying && (
            <div className="space-y-2.5 pt-1 border-t border-border/40">
              <Select value={currentTrack.id} onValueChange={setTrack}>
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Procedural Generators (100% Free)
                  </div>
                  {tracks
                    .filter((t) => t.category === 'procedural')
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1 pt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border/40">
                    Licensed Internet Radio (SomaFM)
                  </div>
                  {tracks
                    .filter((t) => t.category === 'stream')
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-1">
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
          )}

          {/* Legal Compliance & Safety Badge */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/90 pt-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>100% Legal &amp; Royalty-Free: Synthesized audio &amp; statutory streams</span>
          </div>
        </div>

        {/* Working on Task */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Link with active task:</p>
            <Select value={selectedTaskId} onValueChange={setTaskId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">No specific task</SelectItem>
                {incompleteTasks.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="text-center text-[11px] text-muted-foreground">
          {sessionsCompleted} focus session{sessionsCompleted !== 1 ? 's' : ''} completed today
        </div>
      </CardContent>
    </Card>
  );
}
export default PomodoroTimer;
