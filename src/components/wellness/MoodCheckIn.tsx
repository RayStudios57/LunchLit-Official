import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile } from 'lucide-react';
import { useWellness } from '@/hooks/useWellness';
import { useToast } from '@/hooks/use-toast';

const MOODS = [
  { emoji: '😄', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😟', label: 'Low' },
  { emoji: '😩', label: 'Stressed' },
];

export function MoodCheckIn() {
  const { today, upsertToday } = useWellness();
  const { toast } = useToast();
  const selected = today?.mood ?? null;

  const pick = (label: string) => {
    upsertToday.mutate(
      { mood: label },
      {
        onError: (err) => {
          toast({
            title: 'Could not save mood',
            description: err instanceof Error ? err.message : 'Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Smile className="w-5 h-5 text-emerald-500" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => pick(m.label)}
              disabled={upsertToday.isPending}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all disabled:opacity-60 ${
                selected === m.label
                  ? 'bg-emerald-500/20 ring-2 ring-emerald-500 scale-105'
                  : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
        {selected && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            Logged: <span className="font-medium text-foreground">{selected}</span> today · synced across your devices
          </p>
        )}
      </CardContent>
    </Card>
  );
}
