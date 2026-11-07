import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, GraduationCap, Target, School, Clock, Award, Briefcase, Users } from 'lucide-react';
import type { BragSheetEntry } from '@/hooks/useBragSheet';
import type { StudentGoal } from '@/hooks/useStudentGoals';
import type { TargetSchool } from '@/hooks/useTargetSchools';

interface PortfolioOverviewProps {
  entries: BragSheetEntry[];
  academics: any;
  goals: StudentGoal[];
  schools: TargetSchool[];
}

const categoryIcons: Record<string, any> = {
  award: Award,
  academic: GraduationCap,
  leadership: Users,
  volunteering: Trophy,
  club: Users,
  extracurricular: Trophy,
  job: Briefcase,
  internship: Briefcase,
  other: Trophy,
};

export function PortfolioOverview({ entries = [], academics, goals = [], schools = [] }: PortfolioOverviewProps) {
  const safeEntries = entries || [];
  const safeGoals = goals || [];
  const safeSchools = schools || [];
  const recentEntries = safeEntries.slice(0, 5);
  const activeGoals = safeGoals.filter(g => g?.status === 'in_progress').slice(0, 3);
  const topSchools = safeSchools.slice(0, 4);

  const categoryCounts = safeEntries.reduce((acc, e) => {
    if (e?.category) {
      acc[e.category] = (acc[e.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Academic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-secondary/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="font-medium">GPA</span>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-bold">{academics?.gpa_weighted?.toFixed(2) || '—'}</p>
                <p className="text-xs text-muted-foreground">Weighted</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{academics?.gpa_unweighted?.toFixed(2) || '—'}</p>
                <p className="text-xs text-muted-foreground">Unweighted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium">Hours Logged</span>
            </div>
            <p className="text-2xl font-bold">
              {entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total volunteer/work hours</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-medium">Verified</span>
            </div>
            <p className="text-2xl font-bold">
              {entries.filter(e => e.verification_status === 'verified').length}
            </p>
            <p className="text-xs text-muted-foreground">Verified achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Categories */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Activity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const Icon = categoryIcons[cat] || Trophy;
              return (
                <Badge key={cat} variant="secondary" className="px-3 py-1.5 gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="capitalize">{cat}</span>
                  <span className="ml-1 text-primary font-bold">{count}</span>
                </Badge>
              );
            })}
            {Object.keys(categoryCounts).length === 0 && (
              <p className="text-muted-foreground text-sm">No activities logged yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No achievements yet. Add some from your Brag Sheet!</p>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => {
                const Icon = categoryIcons[entry.category] || Trophy;
                return (
                  <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <div className="p-1.5 rounded bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.school_year}</p>
                    </div>
                    {entry.verification_status === 'verified' && (
                      <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                        Verified
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Goals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active goals. Set some in the Goals tab!</p>
            ) : (
              <div className="space-y-2">
                {activeGoals.map((goal) => (
                  <div key={goal.id} className="p-2 rounded-lg bg-secondary/30">
                    <p className="font-medium text-sm">{goal.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{goal.goal_type}</Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          goal.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                          goal.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-secondary'
                        }`}
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Schools Preview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              Target Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSchools.length === 0 ? (
              <p className="text-muted-foreground text-sm">No schools added yet. Add some in the Target Schools tab!</p>
            ) : (
              <div className="space-y-2">
                {topSchools.map((school) => (
                  <div key={school.id} className="p-2 rounded-lg bg-secondary/30 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{school.school_name}</p>
                      {school.location && (
                        <p className="text-xs text-muted-foreground">{school.location}</p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        school.is_reach ? 'bg-destructive/10 text-destructive' :
                        school.is_match ? 'bg-warning/10 text-warning' :
                        school.is_safety ? 'bg-success/10 text-success' : ''
                      }`}
                    >
                      {school.is_reach ? 'Reach' : school.is_match ? 'Match' : school.is_safety ? 'Safety' : 'TBD'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
