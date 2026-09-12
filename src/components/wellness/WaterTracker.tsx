import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, GlassWater } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWellness } from '@/hooks/useWellness';
import { useToast } from '@/hooks/use-toast';

const GOAL = 8;

export function WaterTracker() {
  const { today, upsertToday, waterThisMonth } = useWellness();
  const { toast } = useToast();
  const count = today?.water_count ?? 0;

  const update = (delta: number) => {
    const next = Math.max(0, Math.min(GOAL + 8, count + delta));
    upsertToday.mutate(
      { water_count: next },
      {
        onError: (err) => {
          toast({
            title: 'Could not update hydration',
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
          <GlassWater className="w-5 h-5 text-sky-500" />
          Hydration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: GOAL }).map((_, i) => (
            <div
              key={i}
              className={`h-8 w-6 rounded-b-lg border-2 transition-all ${
                i < count ? 'bg-sky-500/70 border-sky-500' : 'bg-transparent border-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{count}</span> / {GOAL} glasses today
          </span>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => update(-1)} disabled={upsertToday.isPending || count === 0}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => update(1)} disabled={upsertToday.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
          💧 You've drunk {waterThisMonth} glass{waterThisMonth === 1 ? '' : 'es'} this month
        </p>
      </CardContent>
    </Card>
  );
}
