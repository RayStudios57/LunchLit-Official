import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Plus, Trash2, Camera, Loader2, Sparkles, Check, BookmarkPlus, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { useBragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { useClassSchedule } from '@/hooks/useClassSchedule';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

export type CourseRigor = 'regular' | 'honors' | 'ap';

export interface CourseEntry {
  name: string;
  grade: string;
  credits: number;
  rigor?: CourseRigor;
}

export function GpaCalculatorWidget() {
  const { academics, saveAcademics } = useBragSheetAcademics();
  const { classes } = useClassSchedule();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  // Initialize from saved academics courses or defaults
  const [courses, setCourses] = useState<CourseEntry[]>([
    { name: '', grade: 'A', credits: 1, rigor: 'regular' },
  ]);

  // Sync initial courses from existing saved profile if available
  useEffect(() => {
    if (academics?.courses && academics.courses.length > 0 && courses.length === 1 && !courses[0].name) {
      setCourses(
        academics.courses.map((c: any) => ({
          name: c.name || '',
          grade: c.grade || 'A',
          credits: c.credits || 1,
          rigor: c.name?.toLowerCase().includes('ap') || c.name?.toLowerCase().includes('ib')
            ? 'ap'
            : c.name?.toLowerCase().includes('honors')
            ? 'honors'
            : 'regular',
        }))
      );
    }
  }, [academics]);

  const addCourse = () => setCourses(prev => [...prev, { name: '', grade: 'A', credits: 1, rigor: 'regular' }]);
  const removeCourse = (i: number) => setCourses(prev => prev.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, field: keyof CourseEntry, value: any) => {
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  // Import from user's class schedule
  const handleImportSchedule = () => {
    const academicClasses = classes.filter(
      c => c.block_type !== 'lunch' && !c.class_name.toLowerCase().includes('lunch') && !c.is_club
    );

    if (academicClasses.length === 0) {
      toast({
        title: 'No classes found',
        description: 'Add classes in your Class Schedule tab first!',
      });
      return;
    }

    // Deduplicate class names
    const uniqueClassNames = Array.from(new Set(academicClasses.map(c => c.class_name)));
    const imported: CourseEntry[] = uniqueClassNames.map(name => {
      const lower = name.toLowerCase();
      const rigor: CourseRigor = (lower.includes('ap') || lower.includes('ib')) ? 'ap' : lower.includes('honors') ? 'honors' : 'regular';
      return {
        name,
        grade: 'A',
        credits: 1,
        rigor,
      };
    });

    setCourses(imported);
    toast({
      title: 'Imported from schedule!',
      description: `Added ${imported.length} classes from your schedule. Select grades to calculate GPA.`,
    });
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 9 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please use an image under 9MB.', variant: 'destructive' });
      return;
    }

    setScanning(true);
    setScanNotice(null);

    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('parse-grades-photo', {
        body: { imageDataUrl: dataUrl },
      });

      if (error) throw error;

      const found: CourseEntry[] = (data?.courses ?? []).filter((c: any) => c.name && GRADE_POINTS[c.grade] !== undefined);
      if (found.length === 0) {
        setScanNotice('No recognizable course grades detected. You can easily enter courses manually below.');
        toast({ title: 'No grades detected', description: 'Photo might be blurry. Enter grades manually below.' });
      } else {
        setCourses(found.map((c) => ({
          name: c.name,
          grade: c.grade,
          credits: c.credits || 1,
          rigor: c.name?.toLowerCase().includes('ap') ? 'ap' : 'regular',
        })));
        toast({ title: `Imported ${found.length} classes!`, description: 'Review your grades and sync anytime.' });
      }
    } catch (err: any) {
      // Graceful fallback without breaking UI
      console.warn('Grade OCR Edge Function unavailable:', err);
      setScanNotice('AI Photo Scanner is currently offline or unreachable. Manual input and 1-click schedule import are active below.');
      toast({
        title: 'OCR Scanner Offline',
        description: 'You can quickly enter grades manually or import from your schedule below!',
      });
    } finally {
      setScanning(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // GPA calculation
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 1), 0);
  
  // Unweighted points (4.0 max)
  const totalUnweightedPoints = courses.reduce((sum, c) => {
    const base = GRADE_POINTS[c.grade] ?? 4.0;
    return sum + base * (c.credits || 1);
  }, 0);

  // Weighted points (+0.5 for honors, +1.0 for AP/IB)
  const totalWeightedPoints = courses.reduce((sum, c) => {
    const base = GRADE_POINTS[c.grade] ?? 4.0;
    const bonus = c.rigor === 'ap' ? 1.0 : c.rigor === 'honors' ? 0.5 : 0.0;
    const weightedPoint = base > 0 ? base + bonus : 0; // F gets 0
    return sum + weightedPoint * (c.credits || 1);
  }, 0);

  const unweightedGpa = totalCredits > 0 ? (totalUnweightedPoints / totalCredits).toFixed(2) : '0.00';
  const weightedGpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';

  // Sync & Save to Supabase (propagates across Brag Sheet & College Prep)
  const handleSaveToProfile = async () => {
    setIsSaving(true);
    try {
      const formattedCourses = courses
        .filter(c => c.name.trim().length > 0)
        .map(c => ({
          name: c.name,
          grade: c.grade,
          teacher: '',
          year: '2025-2026',
        }));

      await saveAcademics.mutateAsync({
        gpa_unweighted: parseFloat(unweightedGpa),
        gpa_weighted: parseFloat(weightedGpa),
        courses: formattedCourses,
        test_scores: academics?.test_scores || [],
        colleges_applying: academics?.colleges_applying || [],
      });

      toast({
        title: 'GPA & Grades Synced!',
        description: `Saved ${unweightedGpa} UW / ${weightedGpa} W GPA to your Brag Sheet and College Prep portfolio.`,
      });
    } catch (err: any) {
      toast({
        title: 'Could not sync GPA',
        description: err.message || 'Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="card-elevated border-border/80">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          GPA Calculator &amp; Academic Sync
        </CardTitle>
        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
          Syncs with Brag Sheet
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* GPA Stats Display */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-secondary/40 border border-border/70">
          <div className="text-center p-2 rounded-lg bg-card border border-border/50">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Unweighted GPA</div>
            <div className="text-3xl font-extrabold text-foreground font-mono mt-0.5">{unweightedGpa}</div>
            <div className="text-[11px] text-muted-foreground">Standard 4.0 scale</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-card border border-border/50">
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Weighted GPA</div>
            <div className="text-3xl font-extrabold text-primary font-mono mt-0.5">{weightedGpa}</div>
            <div className="text-[11px] text-muted-foreground">+0.5 Honors • +1.0 AP/IB</div>
          </div>
        </div>

        {/* Scan & Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5">
          <div className="text-xs">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-primary" />
              OCR Grade Scanning
            </p>
            <p className="text-muted-foreground">Scan your report card or pre-fill from your schedule.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleScan} className="hidden" />
            <Button
              size="sm"
              variant="outline"
              disabled={scanning}
              onClick={() => fileRef.current?.click()}
              className="text-xs h-8 gap-1.5"
            >
              {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              {scanning ? 'Scanning...' : 'Scan Photo'}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleImportSchedule}
              className="text-xs h-8 gap-1.5"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-primary" />
              From Schedule
            </Button>
          </div>
        </div>

        {/* Informative fallback notice if OCR was offline */}
        {scanNotice && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
            {scanNotice}
          </div>
        )}

        {/* Course Rows */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {courses.map((course, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Course name (e.g., AP Calculus)"
                value={course.name}
                onChange={(e) => updateCourse(i, 'name', e.target.value)}
                className="flex-1 h-9 text-sm"
              />

              {/* Rigor selector */}
              <Select
                value={course.rigor || 'regular'}
                onValueChange={(v) => updateCourse(i, 'rigor', v as CourseRigor)}
              >
                <SelectTrigger className="w-24 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="honors">Honors (+0.5)</SelectItem>
                  <SelectItem value="ap">AP/IB (+1.0)</SelectItem>
                </SelectContent>
              </Select>

              {/* Grade selector */}
              <Select value={course.grade} onValueChange={(v) => updateCourse(i, 'grade', v)}>
                <SelectTrigger className="w-20 h-9 font-semibold text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Credits */}
              <Input
                type="number"
                min={0.5}
                max={5}
                step={0.5}
                value={course.credits}
                onChange={(e) => updateCourse(i, 'credits', parseFloat(e.target.value) || 1)}
                className="w-16 h-9 text-xs text-center"
                title="Credits"
              />

              {courses.length > 1 && (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeCourse(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={addCourse} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Course
          </Button>

          <Button
            size="sm"
            onClick={handleSaveToProfile}
            disabled={isSaving || saveAcademics.isPending}
            className="gap-2 text-xs font-semibold shadow-sm shadow-primary/20"
          >
            {isSaving || saveAcademics.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5" />
            )}
            Sync &amp; Save GPA Across App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
export default GpaCalculatorWidget;
