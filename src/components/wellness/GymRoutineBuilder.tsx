import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  ClipboardList, Plus, Trash2, Share2, Sparkles, Timer, Loader2, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGymRoutines, type Exercise, type Routine } from '@/hooks/useGymRoutines';
import { useFriends } from '@/hooks/useFriends';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { generateLocalWorkoutRoutine } from '@/lib/aiService';

function RestTimer() {
  const [seconds, setSeconds] = useState(60);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      toast.success('Rest over — back to work! 💪');
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Timer className="w-4 h-4 text-orange-500" /> Rest timer
      </div>
      <div className="flex items-center gap-2">
        {[30, 60, 90, 120].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={seconds === s ? 'default' : 'outline'}
            onClick={() => { setSeconds(s); setRemaining(s); setRunning(false); }}
          >
            {s}s
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-display text-2xl tabular-nums">
          {Math.floor((running ? remaining : seconds) / 60)}:
          {String((running ? remaining : seconds) % 60).padStart(2, '0')}
        </span>
        <Button size="sm" onClick={() => { setRemaining(seconds); setRunning(true); }}>
          Start
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setRunning(false); setRemaining(0); }}>
          Stop
        </Button>
      </div>
    </div>
  );
}

function ShareDialog({ routineId }: { routineId: string }) {
  const { acceptedFriends } = useFriends();
  const { shareRoutine } = useGymRoutines();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share routine with a friend</DialogTitle>
        </DialogHeader>
        {acceptedFriends.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Add some friends first to share routines with them.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {acceptedFriends.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                <span className="text-sm">{f.friend_profile?.full_name || 'Friend'}</span>
                <Button
                  size="sm"
                  onClick={() => shareRoutine.mutate({ routineId, toUserId: f.friend_profile!.user_id })}
                >
                  Share
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AiGenerator({ onCreated }: { onCreated: () => void }) {
  const { createRoutine } = useGymRoutines();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState('build muscle');
  const [age, setAge] = useState(16);
  const [days, setDays] = useState(3);
  const [equipment, setEquipment] = useState('standard gym');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      let r: any = null;

      try {
        const { data, error } = await supabase.functions.invoke('generate-workout-routine', {
          body: { goal, age, daysPerWeek: days, equipment },
        });
        if (!error && data?.routine?.exercises?.length) {
          r = data.routine;
        }
      } catch (edgeErr) {
        console.warn('Backend edge function unavailable, activating built-in workout AI engine:', edgeErr);
      }

      // If backend was unconfigured or failed, use smart routine generator
      if (!r) {
        r = generateLocalWorkoutRoutine(goal, age, days, equipment);
      }

      const exercises: Exercise[] = (r.exercises || []).map((e: { name: string; sets: number; reps: string }) => ({
        id: crypto.randomUUID(), name: e.name, sets: e.sets, reps: e.reps,
      }));
      await createRoutine.mutateAsync({ name: r.name || 'AI Routine', exercises });
      toast.success('AI routine created!', { description: r.tips });
      setOpen(false);
      onCreated();
    } catch (e: unknown) {
      toast.error('Could not generate', { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-1">
          <Sparkles className="w-4 h-4" /> AI build
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Build me a routine</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. build muscle" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Age</Label>
              <Input type="number" min={5} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Days/week</Label>
              <Input type="number" min={1} max={7} value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Equipment / location</Label>
            <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g. home, dumbbells only" />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full gap-1">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate routine</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GymRoutineBuilder() {
  const { user } = useAuth();
  const { routines, sharedRoutines, createRoutine, updateRoutine, deleteRoutine } = useGymRoutines();
  const { logToday, loggedToday, dayStreak } = useWorkouts();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Routine | null>(null);

  const active = routines.find((r) => r.id === activeId);

  useEffect(() => {
    setDraft(active ? { ...active, exercises: active.exercises.map((e) => ({ ...e })) } : null);
  }, [activeId, active]);

  if (!user) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Sign in to build and save gym routines.
        </CardContent>
      </Card>
    );
  }

  const addRoutine = async () => {
    const created = await createRoutine.mutateAsync({ name: 'New Routine', exercises: [] });
    setActiveId(created.id);
  };

  const saveDraft = () => {
    if (!draft) return;
    updateRoutine.mutate({ id: draft.id, name: draft.name, exercises: draft.exercises });
    toast.success('Routine saved!');
  };

  const patchExercise = (eid: string, patch: Partial<Exercise>) => {
    if (!draft) return;
    setDraft({ ...draft, exercises: draft.exercises.map((e) => (e.id === eid ? { ...e, ...patch } : e)) });
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-orange-500" />
          My Routines
        </CardTitle>
        <div className="flex gap-2">
          <AiGenerator onCreated={() => {}} />
          <Button size="sm" onClick={addRoutine} className="gap-1">
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workout streak / log */}
        <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
          <span className="text-sm font-medium">
            🔥 {dayStreak}-day workout streak
          </span>
          <Button size="sm" variant={loggedToday ? 'outline' : 'default'} disabled={loggedToday} onClick={() => logToday.mutate()}>
            {loggedToday ? 'Logged today ✓' : 'Log workout'}
          </Button>
        </div>

        {routines.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No routines yet. Tap "New" or "AI build" to create one.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {routines.map((r) => (
            <Button
              key={r.id}
              size="sm"
              variant={activeId === r.id ? 'default' : 'outline'}
              onClick={() => setActiveId(r.id === activeId ? null : r.id)}
            >
              {r.name}
            </Button>
          ))}
        </div>

        {draft && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Routine name"
              />
              <ShareDialog routineId={draft.id} />
              <Button variant="ghost" size="icon" onClick={() => { deleteRoutine.mutate(draft.id); setActiveId(null); }}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-2">
              {draft.exercises.map((ex) => (
                <div key={ex.id} className="flex gap-2 items-center">
                  <Input
                    value={ex.name}
                    onChange={(e) => patchExercise(ex.id, { name: e.target.value })}
                    placeholder="Exercise (e.g. Bench Press)"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={ex.sets}
                    onChange={(e) => patchExercise(ex.id, { sets: Number(e.target.value) })}
                    className="w-16"
                  />
                  <span className="text-xs text-muted-foreground">×</span>
                  <Input
                    value={ex.reps}
                    onChange={(e) => patchExercise(ex.id, { reps: e.target.value })}
                    placeholder="reps"
                    className="w-16"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setDraft({ ...draft, exercises: draft.exercises.filter((e) => e.id !== ex.id) })}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraft({ ...draft, exercises: [...draft.exercises, { id: crypto.randomUUID(), name: '', sets: 3, reps: '10' }] })}
                className="w-full gap-1"
              >
                <Plus className="w-4 h-4" /> Add exercise
              </Button>
            </div>

            <RestTimer />

            <Button size="sm" className="w-full" onClick={saveDraft} disabled={updateRoutine.isPending}>
              {updateRoutine.isPending ? 'Saving...' : 'Save routine'}
            </Button>
          </div>
        )}

        {/* Shared with me */}
        {sharedRoutines.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-orange-500" /> Shared with you
            </div>
            {sharedRoutines.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">from {r.sharedByName}</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {r.exercises.map((e) => (
                    <li key={e.id}>{e.name} — {e.sets} × {e.reps}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
