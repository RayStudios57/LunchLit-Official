import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2, Plus, X, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getRotationPreview, RotationLetter, getCDayDates, addCDayDate, removeCDayDate } from '@/lib/rotation';
import { useToast } from '@/hooks/use-toast';

export function RotationSettingsDialog() {
    const { preferences, updatePreference } = useUserPreferences();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const [enabled, setEnabled] = useState(false);
    const [anchorDate, setAnchorDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [anchorLetter, setAnchorLetter] = useState<'A' | 'B'>('A');
    const [skipWeekends, setSkipWeekends] = useState(true);

    // C Day overrides state
    const [cDayDates, setCDayDates] = useState<string[]>([]);
    const [newCDayDate, setNewCDayDate] = useState('');

    useEffect(() => {
        if (!preferences) return;
        setEnabled(preferences.schedule_rotation === 'ab');
        setAnchorDate(preferences.rotation_anchor_date || format(new Date(), 'yyyy-MM-dd'));
        setAnchorLetter(preferences.rotation_anchor_letter === 'B' ? 'B' : 'A');
        setSkipWeekends(preferences.rotation_skip_weekends !== false);
    }, [preferences]);

    useEffect(() => {
        if (open) {
            setCDayDates(getCDayDates());
        }
    }, [open]);

    const preview = getRotationPreview(
        {
            schedule_rotation: enabled ? 'ab' : 'none',
            rotation_anchor_date: anchorDate,
            rotation_anchor_letter: anchorLetter,
            rotation_skip_weekends: skipWeekends,
        },
        8
    );

    const handleAddCDay = () => {
        if (!newCDayDate) return;
        const updated = addCDayDate(newCDayDate);
        setCDayDates([...updated]);
        setNewCDayDate('');
        toast({ title: `C Day added for ${newCDayDate}` });
    };

    const handleRemoveCDay = (dateStr: string) => {
        const updated = removeCDayDate(dateStr);
        setCDayDates([...updated]);
    };

    const handleSave = async () => {
        await updatePreference.mutateAsync({
            schedule_rotation: enabled ? 'ab' : 'none',
            rotation_anchor_date: anchorDate || null,
            rotation_anchor_letter: anchorLetter,
            rotation_skip_weekends: skipWeekends,
        });
        toast({ title: enabled ? 'A/B Schedule rotation saved!' : 'Rotation turned off' });
        setOpen(false);
    };

    const letterBadgeClass = (letter: RotationLetter) => {
        if (letter === 'A') return 'default';
        if (letter === 'C') return 'default';
        return 'secondary';
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Settings2 className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Rotation</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>A/B Schedule Rotation</DialogTitle>
                    <DialogDescription>
                        Set up alternating day schedules — also known as Gold/Blue, Alternating Days, or Hybrid block scheduling.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="rotation-enabled">Use A/B Schedule</Label>
                            <p className="text-xs text-muted-foreground">
                                aka Gold/Blue, Alternating Days, Hybrid
                            </p>
                        </div>
                        <Switch id="rotation-enabled" checked={enabled} onCheckedChange={setEnabled} />
                    </div>

                    {enabled && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Starting date</Label>
                                    <Input
                                        type="date"
                                        value={anchorDate}
                                        onChange={(e) => setAnchorDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>That day is</Label>
                                    <Select value={anchorLetter} onValueChange={(v) => setAnchorLetter(v as 'A' | 'B')}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">🅰️ A Day (Gold)</SelectItem>
                                            <SelectItem value="B">🅱️ B Day (Blue)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="skip-weekends">Skip weekends</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Weekends don't advance the rotation (Fri A → Mon B)
                                    </p>
                                </div>
                                <Switch
                                    id="skip-weekends"
                                    checked={skipWeekends}
                                    onCheckedChange={setSkipWeekends}
                                />
                            </div>

                            {/* ──── C Day Overrides ──── */}
                            <div className="space-y-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                <Label className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    🟢 C Day — All Periods Day
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Mark rare dates where ALL periods meet on one day (no A/B split).
                                </p>

                                <div className="flex items-center gap-2 pt-1">
                                    <Input
                                        type="date"
                                        value={newCDayDate}
                                        onChange={(e) => setNewCDayDate(e.target.value)}
                                        className="flex-1 h-8 text-xs"
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                                        onClick={handleAddCDay}
                                        disabled={!newCDayDate}
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add
                                    </Button>
                                </div>

                                {cDayDates.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {cDayDates.sort().map((d) => (
                                            <Badge
                                                key={d}
                                                className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1 pr-1"
                                            >
                                                {d}
                                                <button
                                                    onClick={() => handleRemoveCDay(d)}
                                                    className="ml-0.5 rounded-full hover:bg-emerald-500/30 p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {cDayDates.length === 0 && (
                                    <p className="text-[11px] text-muted-foreground/70 italic flex items-center gap-1">
                                        <Info className="w-3 h-3" /> No C Days registered yet.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Preview</Label>
                                <div className="flex flex-wrap gap-2">
                                    {preview.map(({ date, letter }) => (
                                        <div
                                            key={date.toISOString()}
                                            className="flex flex-col items-center rounded-lg bg-secondary/60 px-2.5 py-1.5"
                                        >
                                            <span className="text-[10px] uppercase text-muted-foreground">
                                                {format(date, 'EEE d')}
                                            </span>
                                            <Badge
                                                variant={letterBadgeClass(letter)}
                                                className={`mt-1 ${letter === 'C' ? 'bg-emerald-500 text-white' : ''}`}
                                            >
                                                {letter === 'C' ? 'C' : letter}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Button className="w-full" onClick={handleSave} disabled={updatePreference.isPending}>
                        Save rotation
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
