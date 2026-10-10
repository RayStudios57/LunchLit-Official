import { useState } from 'react';
import { useClassSchedule, ClassSchedule as ClassScheduleType, BlockType } from '@/hooks/useClassSchedule';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Clock,
  MapPin,
  User,
  Sparkles,
  CalendarDays,
  RotateCw,
  Utensils,
  Coffee,
  BookOpen,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { RotationSettingsDialog } from './RotationSettingsDialog';
import { isRotationEnabled, getRotationLetter, classMatchesRotation } from '@/lib/rotation';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'
];

function getMinutesBetween(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

export function ClassSchedule() {
  const { classes, isLoading, addClass, deleteClass } = useClassSchedule();
  const { preferences } = useUserPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [rotationOpen, setRotationOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | 'all'>(1); // Monday or all
  
  const rotationActive = isRotationEnabled(preferences);

  const [newClass, setNewClass] = useState({
    class_name: '',
    teacher_name: '',
    room_number: '',
    period_number: '',
    block_type: 'academic' as BlockType,
    day_of_week: 1,
    start_time: '08:00',
    end_time: '09:00',
    color: COLORS[1],
    is_club: false,
    show_every_day: false,
    rotation_day: 'all' as string,
  });

  const handleBlockTypeChange = (type: BlockType) => {
    let presetColor = COLORS[1];
    let presetName = newClass.class_name;
    let presetPeriod = newClass.period_number;
    let isClub = false;

    if (type === 'lunch') {
      presetColor = '#f59e0b';
      presetName = presetName || 'A Lunch Block';
      presetPeriod = presetPeriod || 'Lunch';
    } else if (type === 'free') {
      presetColor = '#8b5cf6';
      presetName = presetName || 'Advisory / Free Period';
      presetPeriod = presetPeriod || 'Free';
    } else if (type === 'club') {
      presetColor = '#ec4899';
      presetName = presetName || 'Coding Club';
      presetPeriod = presetPeriod || 'Club';
      isClub = true;
    } else {
      presetColor = '#3b82f6';
      presetName = presetName === 'A Lunch Block' || presetName === 'Advisory / Free Period' ? '' : presetName;
    }

    setNewClass({
      ...newClass,
      block_type: type,
      color: presetColor,
      class_name: presetName,
      period_number: presetPeriod,
      is_club: isClub,
    });
  };

  const handleAddClass = () => {
    if (!newClass.class_name.trim()) return;
    addClass.mutate({
      ...newClass,
      is_club: newClass.block_type === 'club' || newClass.is_club,
    });
    setNewClass({
      class_name: '',
      teacher_name: '',
      room_number: '',
      period_number: '',
      block_type: 'academic',
      day_of_week: 1,
      start_time: '08:00',
      end_time: '09:00',
      color: COLORS[1],
      is_club: false,
      show_every_day: false,
      rotation_day: 'all',
    });
    setIsOpen(false);
  };

  const getWeekdayDate = (dayIndex: number): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const currentDay = d.getDay();
    const diff = dayIndex - currentDay;
    const target = new Date(d);
    target.setDate(d.getDate() + diff);
    return target;
  };

  const classesForDay = (day: number | 'all') => {
    if (day === 'all') {
      return [...classes].sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        return a.start_time.localeCompare(b.start_time);
      });
    }
    
    const targetDate = getWeekdayDate(day);
    return classes
      .filter(c => (c.day_of_week === day || (c as any).show_every_day) && classMatchesRotation(c.rotation_day, targetDate, preferences))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const today = new Date().getDay();
  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday

  return (
    <>
      <Card className="card-elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="font-display flex items-center gap-2">
              <span className="text-xl">📅</span>
              Class Schedule
            </CardTitle>
            {rotationActive && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Rotation Schedule Active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotationOpen(true)}
              className="gap-1.5"
            >
              <RotateCw className="h-4 w-4 text-primary" />
              Rotation Settings
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add to Schedule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  {/* Category / Block Type Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Block / Category Type
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleBlockTypeChange('academic')}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          newClass.block_type === 'academic'
                            ? 'border-primary bg-primary/10 font-semibold text-primary'
                            : 'border-border bg-card hover:bg-secondary/50 text-foreground'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-xs">Standard Class</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBlockTypeChange('lunch')}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          newClass.block_type === 'lunch'
                            ? 'border-amber-500 bg-amber-500/15 font-semibold text-amber-500'
                            : 'border-border bg-card hover:bg-secondary/50 text-foreground'
                        }`}
                      >
                        <Utensils className="w-4 h-4 text-amber-500" />
                        <span className="text-xs">Lunch Block</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBlockTypeChange('free')}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          newClass.block_type === 'free'
                            ? 'border-purple-500 bg-purple-500/15 font-semibold text-purple-500'
                            : 'border-border bg-card hover:bg-secondary/50 text-foreground'
                        }`}
                      >
                        <Coffee className="w-4 h-4 text-purple-500" />
                        <span className="text-xs">Advisory / Free Period</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBlockTypeChange('club')}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          newClass.block_type === 'club'
                            ? 'border-pink-500 bg-pink-500/15 font-semibold text-pink-500'
                            : 'border-border bg-card hover:bg-secondary/50 text-foreground'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <span className="text-xs">Club / Activity</span>
                      </button>
                    </div>
                  </div>

                  {/* Name and Period number */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label>
                        {newClass.block_type === 'lunch' ? 'Lunch Name' : newClass.block_type === 'club' ? 'Club Name' : 'Class / Subject Name'}
                      </Label>
                      <Input
                        placeholder={newClass.block_type === 'lunch' ? 'e.g., A Lunch' : 'e.g., AP Chemistry'}
                        value={newClass.class_name}
                        onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Period</Label>
                      <Input
                        placeholder="e.g. Period 2"
                        value={newClass.period_number}
                        onChange={(e) => setNewClass({ ...newClass, period_number: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Rotation schedule selector */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-primary" />
                      Rotation Day Tag
                    </Label>
                    <Select
                      value={newClass.rotation_day}
                      onValueChange={(v) => setNewClass({ ...newClass, rotation_day: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rotation tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Every Day / All Rotation Days</SelectItem>
                        <SelectItem value="Gold">🟡 Gold Day</SelectItem>
                        <SelectItem value="Blue">🔵 Blue Day</SelectItem>
                        <SelectItem value="Anchor">⚓ Anchor Day</SelectItem>
                        <SelectItem value="A">🅰️ A Day Only</SelectItem>
                        <SelectItem value="B">🅱️ B Day Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teacher / Supervisor</Label>
                      <Input
                        placeholder="e.g., Dr. Patel"
                        value={newClass.teacher_name}
                        onChange={(e) => setNewClass({ ...newClass, teacher_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Room / Location</Label>
                      <Input
                        placeholder="e.g., Room 204 or Cafeteria"
                        value={newClass.room_number}
                        onChange={(e) => setNewClass({ ...newClass, room_number: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-every-day"
                      checked={newClass.show_every_day}
                      onCheckedChange={(checked) => setNewClass({ ...newClass, show_every_day: checked })}
                    />
                    <Label htmlFor="show-every-day" className="flex items-center gap-1 text-xs">
                      <CalendarDays className="h-4 w-4" />
                      Repeats Every Weekday (Mon–Fri)
                    </Label>
                  </div>

                  {!newClass.show_every_day && (
                    <div className="space-y-2">
                      <Label>Specific Day of Week</Label>
                      <Select 
                        value={String(newClass.day_of_week)} 
                        onValueChange={(v) => setNewClass({ ...newClass, day_of_week: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day, i) => (
                            <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newClass.start_time}
                        onChange={(e) => setNewClass({ ...newClass, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newClass.end_time}
                        onChange={(e) => setNewClass({ ...newClass, end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Accent</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewClass({ ...newClass, color })}
                          className={`w-7 h-7 rounded-full transition-all ${
                            newClass.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddClass} className="w-full" disabled={!newClass.class_name.trim()}>
                    Add to Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
          ) : (
            <div className="space-y-4">
              {/* Day tabs with All Days option and computed rotation letters */}
              <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setSelectedDay('all')}
                  className={`min-w-[60px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDay === 'all'
                      ? 'bg-card text-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CalendarDays className="h-4 w-4 mx-auto sm:hidden" />
                  <span className="hidden sm:inline">All Days</span>
                </button>
                {weekdays.map((day) => {
                  const letter = rotationActive ? getRotationLetter(getWeekdayDate(day), preferences) : null;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDay === day
                          ? 'bg-card text-foreground shadow-card'
                          : 'text-muted-foreground hover:text-foreground'
                      } ${today === day ? 'ring-2 ring-primary/30' : ''}`}
                    >
                      <span className="hidden sm:inline">
                        {DAYS[day]}
                        {letter ? ` (${letter})` : ''}
                      </span>
                      <span className="sm:hidden">
                        {DAYS[day].slice(0, 3)}
                        {letter ? ` (${letter})` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Classes view */}
              <div className="space-y-2 min-h-[200px]">
                {selectedDay === 'all' ? (
                  // All days view - grouped by day
                  weekdays.map(day => {
                    const targetDate = getWeekdayDate(day);
                    const letter = rotationActive ? getRotationLetter(targetDate, preferences) : null;
                    const dayClasses = classes
                      .filter(c => (c.day_of_week === day || (c as any).show_every_day) && classMatchesRotation(c.rotation_day, targetDate, preferences))
                      .sort((a, b) => a.start_time.localeCompare(b.start_time));
                    if (dayClasses.length === 0) return null;
                    
                    return (
                      <div key={day} className="space-y-2 mb-6">
                        <h3 className="font-medium text-sm text-muted-foreground border-b pb-1 flex items-center justify-between">
                          <span>{DAYS[day]}</span>
                          {letter && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {letter} Day
                            </Badge>
                          )}
                        </h3>
                        {renderDayClassesWithTransitions(dayClasses, deleteClass.mutate)}
                      </div>
                    );
                  })
                ) : (
                  // Single day view
                  classesForDay(selectedDay).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="font-medium">No classes scheduled for {DAYS[selectedDay as number]}</p>
                      <p className="text-xs mt-1">Use "Add Class" above to set up your schedule.</p>
                    </div>
                  ) : (
                    renderDayClassesWithTransitions(classesForDay(selectedDay), deleteClass.mutate)
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RotationSettingsDialog
        open={rotationOpen}
        onOpenChange={setRotationOpen}
      />
    </>
  );
}

function renderDayClassesWithTransitions(dayClasses: ClassScheduleType[], onDelete: (id: string) => void) {
  return dayClasses.map((cls, idx) => {
    const nextCls = dayClasses[idx + 1];
    const passingMinutes = nextCls ? getMinutesBetween(cls.end_time, nextCls.start_time) : 0;

    return (
      <div key={cls.id} className="space-y-1.5">
        <ClassCard cls={cls} onDelete={() => onDelete(cls.id)} />

        {/* Visual Passing Period Indicator */}
        {passingMinutes > 0 && passingMinutes <= 35 && (
          <div className="flex items-center gap-2 mx-3 my-1 px-3 py-1.5 rounded-lg bg-secondary/40 border border-dashed border-border/80 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground/90">{passingMinutes} min Passing Period</span>
            <span className="text-[11px]">({cls.end_time.slice(0, 5)} → {nextCls.start_time.slice(0, 5)})</span>
            {nextCls.room_number && (
              <span className="ml-auto text-[11px] font-medium text-primary flex items-center gap-1">
                Head to {nextCls.room_number} <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
        )}
      </div>
    );
  });
}

function ClassCard({ cls, onDelete }: { cls: ClassScheduleType; onDelete: () => void }) {
  const isLunch = cls.block_type === 'lunch' || cls.class_name.toLowerCase().includes('lunch');
  const isFree = cls.block_type === 'free' || cls.class_name.toLowerCase().includes('free') || cls.class_name.toLowerCase().includes('advisory');
  const isClub = cls.block_type === 'club' || cls.is_club;

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
        isLunch
          ? 'bg-amber-500/5 border-amber-500/30'
          : isFree
          ? 'bg-purple-500/5 border-purple-500/30'
          : isClub
          ? 'bg-pink-500/5 border-pink-500/30'
          : 'bg-card border-border hover:border-border/90'
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: cls.color || '#3b82f6' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Badge */}
          {cls.period_number && (
            <Badge variant="outline" className="text-[11px] font-semibold bg-secondary/60">
              {cls.period_number}
            </Badge>
          )}

          <p className="font-semibold text-foreground">{cls.class_name}</p>

          {/* Block Type Badge */}
          {isLunch && (
            <Badge className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
              <Utensils className="w-3 h-3" /> Lunch Block
            </Badge>
          )}

          {isFree && (
            <Badge className="text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold gap-1">
              <Coffee className="w-3 h-3" /> Free / Advisory
            </Badge>
          )}

          {isClub && (
            <Badge className="text-[10px] bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30 font-semibold gap-1">
              <Sparkles className="w-3 h-3" /> Club
            </Badge>
          )}

          {/* Rotation Badge */}
          {cls.rotation_day && cls.rotation_day !== 'all' && (
            <Badge
              variant="secondary"
              className="text-[10px] font-bold"
            >
              {cls.rotation_day.length === 1 ? `${cls.rotation_day} Day` : cls.rotation_day}
            </Badge>
          )}

          {cls.show_every_day && (
            <Badge variant="secondary" className="text-[10px]">
              Daily
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-3.5 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3 text-primary" />
            {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
          </span>
          {cls.teacher_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {cls.teacher_name}
            </span>
          )}
          {cls.room_number && (
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <MapPin className="h-3 w-3 text-primary" />
              {cls.room_number}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}